const { GoogleGenerativeAI } = require("@google/generative-ai");
const { z } = require("zod");
const crypto = require("crypto");
const Career = require("../models/Career");
require("dotenv").config();

const parseListEnv = (value, fallback) => {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
};

const GEMINI_MODEL_FALLBACKS = process.env.GEMINI_RECOMMENDATION_MODELS
  ? parseListEnv(process.env.GEMINI_RECOMMENDATION_MODELS, ["gemini-2.5-flash"])
  : ["gemini-2.5-flash"];
const GEMINI_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 1);
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 10000);
const AI_RECOMMENDATION_MODE = process.env.AI_RECOMMENDATION_MODE || "balanced"; // balanced | local
const CAREER_CATALOG_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_PROMPT_CAREERS = Number(process.env.AI_PROMPT_CAREER_LIMIT || 40);
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 500;

let careerCatalogCache = {
  value: null,
  timestamp: 0,
};

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  } catch (err) {
    console.warn("Failed to initialize GoogleGenerativeAI client:", err.message);
  }
}

/**
 * ============================================
 * ADVANCED AI SERVICE v2 - INTEGRATED
 * Features: RAG, Caching, Validation, Retry
 * ============================================
 */

// ==================== MEMORY CACHE ====================
const memoryCache = new Map();

const cacheGet = (key) => {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  return cached.value;
};

const cacheSet = (key, value) => {
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { value, timestamp: Date.now() });
};

const generateCacheKey = (data) => {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
};

const toTrimmedString = (value, fallback = "") => String(value ?? fallback).trim();

const clampNumber = (value, min, max, fallback = min) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
};

const getAcademicInfo = (userData = {}) => userData.academicProfile || userData.academicInfo || {};

const getSkillScores = (userData = {}) => {
  const rawScores = userData.skillEvaluation?.scores || userData.skillEvaluation || {};
  return {
    analytical: clampNumber(rawScores.analytical, 0, 100, 50),
    creative: clampNumber(rawScores.creative, 0, 100, 50),
    communication: clampNumber(rawScores.communication, 0, 100, 50),
    leadership: clampNumber(rawScores.leadership, 0, 100, 50),
    technical: clampNumber(rawScores.technical, 0, 100, 50),
  };
};

const normalizeKeyword = (value) => toTrimmedString(value).toLowerCase();

const getFavoriteSignals = (userData = {}) =>
  Array.isArray(userData.favorites)
    ? userData.favorites.map((favorite) => normalizeKeyword(favorite)).filter(Boolean)
    : [];

const extractJsonObject = (text) => {
  const rawText = String(text || "").trim();
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) return fencedMatch[1].trim();

  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return rawText.slice(firstBrace, lastBrace + 1).trim();
  }

  return rawText;
};

const withTimeout = (promise, timeoutMs, label = "Operation") => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

// ==================== VALIDATION SCHEMAS ====================
const UserProfileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  academicProfile: z.record(z.any()).optional(),
  academicInfo: z.object({
    school: z.string().optional(),
    grade: z.string().optional(),
    majorInterest: z.string().optional(),
    subjects: z.record(z.coerce.number()).optional()
  }).optional(),
  skillEvaluation: z.record(z.any()).optional(),
  favorites: z.array(z.any()).optional(),
  profileContext: z.record(z.any()).optional(),
  answers: z.record(z.any()).optional(),
  personalityTest: z.object({
    archetype: z.string().optional(),
    suitabilityScore: z.number().optional()
  }).optional()
});

const CareerRecommendationResponseSchema = z.object({
  archetype: z.string(),
  description: z.string(),
  suitabilityScore: z.number().min(0).max(100),
  careers: z.array(z.object({
    title: z.string(),
    description: z.string(),
    salary: z.string(),
    growth: z.string(),
    skills: z.array(z.string()),
    suitability: z.number(),
    category: z.string(),
    roadmap: z.array(z.object({
      phase: z.string(),
      title: z.string(),
      duration: z.string(),
      description: z.string(),
      skillsToAcquire: z.array(z.string())
    }))
  })),
  insights: z.string()
});

// ==================== RETRY LOGIC ====================
const callGeminiWithRetry = async (apiCall, maxRetries = GEMINI_MAX_RETRIES) => {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (err) {
      lastErr = err;
      const retriesLeft = maxRetries - attempt;
      console.warn(
        `Gemini API attempt ${attempt} failed. ${retriesLeft} retries left. Error: ${err.message}`
      );
      if (retriesLeft > 0) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
      }
    }
  }
  throw lastErr;
};

// ==================== TOKEN & COST ESTIMATION ====================
const estimateTokens = (text) => {
  // Rough estimation: ~4 characters = 1 token
  return Math.ceil((text || "").length / 4);
};

const estimateCost = (inputTokens, outputTokens) => {
  // Gemini 2.5 Flash pricing (approximate)
  // Input: $0.075 per 1M tokens, Output: $0.3 per 1M tokens
  const inputCost = (inputTokens / 1000000) * 0.075;
  const outputCost = (outputTokens / 1000000) * 0.3;
  return inputCost + outputCost;
};

const fetchCareerCatalog = async () => {
  if (careerCatalogCache.value && Date.now() - careerCatalogCache.timestamp < CAREER_CATALOG_TTL) {
    return careerCatalogCache.value;
  }

  const careers = await Career.find()
    .select("title description salary growth skills suitability category roadmap")
    .lean();
  const normalizedCareers = careers.map((career) => ({
    id: career._id?.toString() || null,
    title: toTrimmedString(career.title),
    description: toTrimmedString(career.description),
    salary: toTrimmedString(career.salary, 'Chưa xác định'),
    growth: toTrimmedString(career.growth, 'Ổn định'),
    skills: Array.isArray(career.skills) ? career.skills.map((s) => String(s).trim()).filter(Boolean) : [],
    suitability: Number.isFinite(career.suitability) ? career.suitability : 0,
    category: toTrimmedString(career.category),
    roadmap: Array.isArray(career.roadmap)
      ? career.roadmap.map((step) => ({
          phase: toTrimmedString(step.phase),
          title: toTrimmedString(step.title),
          duration: toTrimmedString(step.duration),
          description: toTrimmedString(step.description),
          skillsToAcquire: Array.isArray(step.skillsToAcquire)
            ? step.skillsToAcquire.map((skill) => String(skill).trim()).filter(Boolean)
            : []
        }))
      : []
  }));

  careerCatalogCache = {
    value: normalizedCareers,
    timestamp: Date.now(),
  };

  return normalizedCareers;
};

const buildCareerCatalogContext = (careers) => {
  if (!Array.isArray(careers) || careers.length === 0) {
    return "Không có danh sách ngành nghề để tham khảo.";
  }
  return careers
    .slice(0, MAX_PROMPT_CAREERS)
    .map((career, index) => {
      const skills = Array.isArray(career.skills) && career.skills.length
        ? ` | skills: ${career.skills.slice(0, 5).join(", ")}`
        : "";
      return `${index + 1}. ${career.title} (${career.category})${skills}: ${career.description.slice(0, 220)}`;
    })
    .join("\n");
};

const normalizeRoadmapStep = (step) => {
  if (!step || typeof step !== 'object') return null;
  return {
    phase: toTrimmedString(step.phase),
    title: toTrimmedString(step.title),
    duration: toTrimmedString(step.duration),
    description: toTrimmedString(step.description),
    skillsToAcquire: Array.isArray(step.skillsToAcquire)
      ? step.skillsToAcquire.map((skill) => String(skill).trim()).filter(Boolean)
      : []
  };
};

const normalizeCareerFromAi = (career, careerCatalog) => {
  if (!career || typeof career !== 'object') return null;
  const title = toTrimmedString(career.title);
  if (!title) return null;

  const matchingCareer = careerCatalog.find(
    (item) => item.title.toLowerCase() === title.toLowerCase()
  );

  if (!matchingCareer) return null;

  return {
    title: matchingCareer.title,
    description: toTrimmedString(career.description || matchingCareer.description),
    salary: toTrimmedString(career.salary || matchingCareer.salary, 'Chưa xác định'),
    growth: toTrimmedString(career.growth || matchingCareer.growth, 'Ổn định'),
    skills: Array.isArray(career.skills)
      ? career.skills.map((s) => String(s).trim()).filter(Boolean)
      : matchingCareer.skills,
    suitability: clampNumber(career.suitability, 0, 100, matchingCareer.suitability || 0),
    category: matchingCareer.category,
    roadmap: Array.isArray(career.roadmap)
      ? career.roadmap
          .map(normalizeRoadmapStep)
          .filter((step) => step && step.title && step.description)
      : matchingCareer.roadmap
  };
};

const normalizeKnownCareerRecommendations = (aiResult, careerCatalog) => {
  if (!aiResult || typeof aiResult !== 'object') {
    throw new Error('AI result must be an object');
  }

  const careers = Array.isArray(aiResult.careers) ? aiResult.careers : [];
  const normalizedCareers = careers
    .map((career) => normalizeCareerFromAi(career, careerCatalog))
    .filter(Boolean)
    .slice(0, 10);

  if (normalizedCareers.length === 0) {
    throw new Error('AI trả về không có ngành nghề trùng với danh sách hiện có');
  }

  return {
    archetype: toTrimmedString(aiResult.archetype),
    description: toTrimmedString(aiResult.description),
    suitabilityScore: clampNumber(aiResult.suitabilityScore, 0, 100, 0),
    careers: normalizedCareers,
    insights: toTrimmedString(aiResult.insights)
  };
};

// ==================== RAG ENGINE (SIMPLIFIED) ====================
const retrieveRelevantCareers = async (userData) => {
  const careerCatalog = await fetchCareerCatalog();
  return buildCareerCatalogContext(careerCatalog.slice(0, 8));
};

// ==================== PROMPT ENGINEERING ====================
const buildCareerRecommendationPrompt = (userData, careerContext, careerCatalog) => {
  const answers = userData.answers || {};
  const academic = getAcademicInfo(userData);
  const skillScores = getSkillScores(userData);
  const favoriteSignals = getFavoriteSignals(userData);
  const allowedTitles = Array.isArray(careerCatalog)
    ? careerCatalog.map((career) => career.title).join(", ")
    : "";

  // Pre-calculate RIASEC scores to feed into prompt
  const normalizeAns = (v) => {
    return clampNumber(Math.round(Number(v)), 0, 4, 2);
  };
  const riasecScores = {
    R: ['q1','q2','q3','q4','q5'].reduce((s,k) => s + normalizeAns(answers[k]), 0),
    I: ['q6','q7','q8','q9','q10'].reduce((s,k) => s + normalizeAns(answers[k]), 0),
    A: ['q11','q12','q13','q14','q15'].reduce((s,k) => s + normalizeAns(answers[k]), 0),
    S: ['q16','q17','q18','q19','q20'].reduce((s,k) => s + normalizeAns(answers[k]), 0),
    E: ['q21','q22','q23','q24','q25'].reduce((s,k) => s + normalizeAns(answers[k]), 0),
    C: ['q26','q27','q28','q29','q30'].reduce((s,k) => s + normalizeAns(answers[k]), 0),
  };
  const hollandCode = Object.entries(riasecScores).sort((a,b) => b[1]-a[1]).slice(0,3).map(([k]) => k).join('');

  const phase2Answers = {
    familyInfluence:  answers['q31'],
    peerInfluence:    answers['q32'],
    mediaInfluence:   answers['q33'],
    schoolGuidance:   answers['q34'],
    attention:        answers['q35'],
    relevance:        answers['q36'],
    confidence:       answers['q37'],
    satisfaction:     answers['q38'],
    workStylePref:    answers['q39'],
    workEnvPref:      answers['q40'],
  };

  return `
Bạn là một chuyên gia hướng nghiệp hàng đầu thế giới với 20+ năm kinh nghiệm, chuyên sử dụng mô hình Holland RIASEC.

**HỒ SƠ HỌC SINH:**
- Điểm RIASEC: R=${riasecScores.R}, I=${riasecScores.I}, A=${riasecScores.A}, S=${riasecScores.S}, E=${riasecScores.E}, C=${riasecScores.C}
- Mã Holland: ${hollandCode}
- Câu trả lời Giai đoạn 2 (ARCS + ngoại cảnh): ${JSON.stringify(phase2Answers)}
- Hồ sơ học tập: ${JSON.stringify({
    school: academic.school,
    grade: academic.grade,
    majorInterest: academic.majorInterest,
    subjects: academic.subjects || {}
  })}
- Hồ sơ kỹ năng tự đánh giá (0-100): ${JSON.stringify(skillScores)}
- Ngành/nghề đã yêu thích hoặc lưu: ${favoriteSignals.length ? favoriteSignals.join(", ") : "Chưa có"}

**DANH SÁCH NGÀNH NGHỀ CÓ SẴN:**
${careerContext}

**QUY TẮC QUAN TRỌNG:**
1. Chỉ chọn ngành nghề từ danh sách trên. Tuyệt đối không tự thêm ngành mới.
2. Nếu không tìm đủ 4 ngành hợp lý, trả về ít hơn — chỉ dùng tên có trong danh sách.
3. Không bao gồm markdown, không thêm chú thích ngoài JSON.
4. Ưu tiên ngành phù hợp với Holland Code "${hollandCode}".
5. Nếu Phase 2 cho thấy áp lực gia đình mâu thuẫn sở thích, đề cập trong insights.
6. Dùng điểm môn học để kiểm tra năng lực nền: Toán/Lý/Anh hỗ trợ công nghệ-AI; Văn/Anh hỗ trợ giao tiếp-thiết kế; Sinh/Hóa hỗ trợ y-sinh nếu có ngành liên quan.
7. Dùng hồ sơ kỹ năng để điều chỉnh độ phù hợp: technical/analytical cho kỹ thuật, creative cho thiết kế, communication/social cho ngành tương tác, leadership cho quản lý.
8. Nếu ngành yêu thích/favorites mâu thuẫn mạnh với RIASEC hoặc điểm/kỹ năng, không loại bỏ hoàn toàn; hãy giải thích điều kiện cần bù đắp trong insights.

**TÊN NGÀNH ĐƯỢC PHÉP:** ${allowedTitles}

**ĐỊNH DẠNG JSON YÊU CẦU:**
{
  "archetype": "Tên hình mẫu dựa trên Holland Code (ví dụ: Nhà Phân Tích Logic — IRE)",
  "hollandCode": "${hollandCode}",
  "description": "Mô tả 2-3 câu về điểm mạnh dựa trên RIASEC",
  "suitabilityScore": 85,
  "careers": [
    {
      "title": "Tên nghề (phải có trong danh sách được phép)",
      "description": "Mô tả vai trò",
      "salary": "Mức lương",
      "growth": "Tiềm năng phát triển",
      "skills": ["Skill 1", "Skill 2"],
      "suitability": 90,
      "category": "Lĩnh vực",
      "roadmap": [
        {
          "phase": "Giai đoạn 1",
          "title": "Tên giai đoạn",
          "duration": "1-2 năm",
          "description": "Nội dung cần tập trung",
          "skillsToAcquire": ["Skill A"]
        }
      ]
    }
  ],
  "insights": "Lời khuyên chiến lược dựa trên Holland Code và ARCS, đề cập mâu thuẫn nếu có"
}
`;
};

// ==================== ENHANCED RECOMMENDATION ====================

// Rich fallback database of careers and roadmaps to drive the deterministic recommendation engine
const PRESETS = {
  careers: [
    {
      title: "Software Architect",
      description: "Thiết kế các hệ thống phần mềm phức tạp và cấu trúc cấp cao của các dự án phần mềm.",
      salary: "$120k - $180k",
      growth: "Rất cao (+22%)",
      skills: ["System Design", "Cloud Computing", "Leadership", "Java/Go/Python"],
      suitability: 95,
      category: "Công nghệ",
      roadmap: [
        { phase: "Giai đoạn 1", title: "Nền tảng lập trình & Thuật toán", duration: "1-2 năm", description: "Học cấu trúc dữ liệu, thuật toán, lập trình hướng đối tượng (OOP) và phát triển phần mềm cơ bản.", skillsToAcquire: ["Java", "Python", "Data Structures", "Algorithms"] },
        { phase: "Giai đoạn 2", title: "Phát triển Hệ thống & Cơ sở dữ liệu", duration: "2-3 năm", description: "Học các mẫu thiết kế (Design Patterns), cơ sở dữ liệu SQL/NoSQL, và thiết kế hệ thống phân tán cơ bản.", skillsToAcquire: ["System Design", "MongoDB", "SQL", "Docker"] },
        { phase: "Giai đoạn 3", title: "Kiến trúc đám mây & Lãnh đạo kỹ thuật", duration: "3-5 năm", description: "Học kiến trúc Cloud (AWS/Azure/GCP), Microservices, và kỹ năng quản lý dự án công nghệ lớn.", skillsToAcquire: ["Cloud Architecture", "Kubernetes", "Microservices", "Leadership"] }
      ]
    },
    {
      title: "Data Scientist",
      description: "Phân tích và diễn giải dữ liệu phức tạp để giúp các tổ chức đưa ra quyết định sáng suốt.",
      salary: "$100k - $160k",
      growth: "Cực kỳ cao (+36%)",
      skills: ["Python", "Statistics", "Machine Learning", "SQL"],
      suitability: 88,
      category: "Công nghệ",
      roadmap: [
        { phase: "Giai đoạn 1", title: "Toán học & Lập trình cơ bản", duration: "1-2 năm", description: "Làm chủ Python, học đại số tuyến tính, xác suất thống kê và SQL cơ bản.", skillsToAcquire: ["Python", "Linear Algebra", "Statistics", "SQL"] },
        { phase: "Giai đoạn 2", title: "Phân tích dữ liệu & Machine Learning", duration: "2-3 năm", description: "Học cách khai phá dữ liệu, trực quan hóa dữ liệu và xây dựng các mô hình Machine Learning cơ bản.", skillsToAcquire: ["Pandas", "Scikit-Learn", "Data Visualization", "Feature Engineering"] },
        { phase: "Giai đoạn 3", title: "Học sâu & Kỹ thuật Dữ liệu lớn", duration: "2-4 năm", description: "Nghiên cứu Deep Learning, xử lý ngôn ngữ tự nhiên (NLP), thị giác máy tính và các công nghệ Big Data.", skillsToAcquire: ["Deep Learning", "TensorFlow/PyTorch", "Spark", "MLOps"] }
      ]
    },
    {
      title: "UX/UI Designer",
      description: "Tạo ra các giao diện thân thiện với người dùng và nâng cao sự hài lòng bằng cách cải thiện khả năng tương tác.",
      salary: "$70k - $120k",
      growth: "Ổn định (+8%)",
      skills: ["Figma", "User Research", "Visual Design", "Wireframing"],
      suitability: 85,
      category: "Thiết kế",
      roadmap: [
        { phase: "Giai đoạn 1", title: "Nguyên lý Thiết kế & Sử dụng Figma", duration: "6-12 tháng", description: "Học các nguyên tắc về màu sắc, bố cục, typography và làm chủ công cụ thiết kế Figma.", skillsToAcquire: ["Figma", "Typography", "Color Theory", "Layout Design"] },
        { phase: "Giai đoạn 2", title: "Nghiên cứu Người dùng & Thiết kế Trải nghiệm", duration: "1-2 năm", description: "Học cách phỏng vấn người dùng, tạo bản đồ hành trình người dùng (User Journey Map), và vẽ khung xương giao diện (Wireframing).", skillsToAcquire: ["User Research", "Wireframing", "Interaction Design", "Prototyping"] },
        { phase: "Giai đoạn 3", title: "Thiết kế Nâng cao & Thử nghiệm khả năng sử dụng", duration: "1-2 năm", description: "Thử nghiệm usability, thiết kế các hệ thống design system phức tạp, và kỹ năng trình bày sản phẩm trước khách hàng.", skillsToAcquire: ["Design Systems", "Usability Testing", "Design Thinking", "Product Strategy"] }
      ]
    },
    {
      title: "AI Engineer",
      description: "Nghiên cứu, phát triển và triển khai các thuật toán và hệ thống Trí tuệ nhân tạo.",
      salary: "$110k - $170k",
      growth: "Đột biến (+45%)",
      skills: ["Python", "Deep Learning", "NLP", "Computer Vision"],
      suitability: 92,
      category: "Trí tuệ nhân tạo",
      roadmap: [
        { phase: "Giai đoạn 1", title: "Cơ sở Khoa học máy tính & Python", duration: "1 năm", description: "Rèn luyện tư duy lập trình chuyên sâu bằng Python, học đại số tuyến tính nâng cao và cấu trúc dữ liệu.", skillsToAcquire: ["Advanced Python", "Linear Algebra", "Calculus", "Algorithms"] },
        { phase: "Giai đoạn 2", title: "Học máy & Xây dựng mô hình", duration: "1-2 năm", description: "Học học máy truyền thống, xử lý ảnh cơ bản và xử lý ngôn ngữ tự nhiên cơ bản.", skillsToAcquire: ["Machine Learning", "Regression/Classification", "Neural Networks", "NLP"] },
        { phase: "Giai đoạn 3", title: "Học sâu & MLOps chuyên sâu", duration: "2 năm", description: "Học cách tối ưu hóa các mô hình ngôn ngữ lớn (LLM), tinh chỉnh (fine-tuning) và triển khai AI lên môi trường đám mây.", skillsToAcquire: ["Transformer Models", "PyTorch", "LLMOps", "Cloud Deployment"] }
      ]
    },
    {
      title: "Product Manager",
      description: "Dẫn dắt sự phát triển của sản phẩm từ khâu ý tưởng đến khi ra mắt thị trường, kết nối kinh doanh, công nghệ và thiết kế.",
      salary: "$90k - $140k",
      growth: "Cao (+15%)",
      skills: ["Product Strategy", "Market Research", "Agile/Scrum", "Communication"],
      suitability: 80,
      category: "Quản lý & Kinh doanh",
      roadmap: [
        { phase: "Giai đoạn 1", title: "Kiến thức cơ bản về sản phẩm & Thị trường", duration: "1 năm", description: "Học cách phân tích đối thủ cạnh tranh, nghiên cứu nhu cầu thị trường và thấu hiểu hành vi người dùng.", skillsToAcquire: ["Market Analysis", "User empathy", "Basic Tech concepts"] },
        { phase: "Giai đoạn 2", title: "Quản lý dự án Agile & Giao tiếp nhóm", duration: "1-2 năm", description: "Học quy trình Scrum/Agile, cách định vị lộ trình phát triển sản phẩm (Product Roadmap) và viết yêu cầu tính năng (PRDs).", skillsToAcquire: ["Agile/Scrum", "Product Roadmap", "Jira", "Wireframing"] },
        { phase: "Giai đoạn 3", title: "Chiến lược tăng trưởng & Phân tích kinh doanh", duration: "2 năm", description: "Định hình giá cả, phân tích các chỉ số tăng trưởng sản phẩm (KPIs, AARRR metric) và lãnh đạo liên chức năng.", skillsToAcquire: ["Product Metrics", "Growth Hacking", "Strategic Planning", "Negotiation"] }
      ]
    }
  ]
};

/**
 * AI Recommendation Generator with RAG + Caching + Retry
 */
const getCareerRecommendations = async (userData) => {
  let careerCatalog = [];

  try {
    // Validate input
    const validatedUser = UserProfileSchema.parse(userData);

    // Load career catalog from database for strict matching and prompt context
    careerCatalog = await fetchCareerCatalog();
    const promptCareers = careerCatalog.length ? careerCatalog : PRESETS.careers;
    const careerContext = buildCareerCatalogContext(promptCareers);

    // Check cache first
    const cacheKey = generateCacheKey({ ...validatedUser, titles: promptCareers.map((c) => c.title) });
    const cached = cacheGet(cacheKey);
    if (cached) {
      console.log("✓ Cache HIT for recommendation");
      return cached;
    }

    console.log("Cache MISS - generating recommendation...");

    // Build advanced prompt
    const prompt = buildCareerRecommendationPrompt(validatedUser, careerContext, promptCareers);

    // Try Gemini within a short latency budget. If it is slow, use the local engine.
    if (genAI && AI_RECOMMENDATION_MODE !== "local") {
      for (const modelName of GEMINI_MODEL_FALLBACKS) {
        try {
          console.log(`Attempting analysis with model: ${modelName}`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.35,
              maxOutputTokens: 4096,
            },
          });

          // Call with retry logic
          const result = await callGeminiWithRetry(async () => {
            return await withTimeout(
              model.generateContent(prompt),
              GEMINI_TIMEOUT_MS,
              `Gemini recommendation (${modelName})`
            );
          });

          const response = await result.response;
          let text = response.text();

          console.log("✓ Gemini response received");

          const cleanedText = extractJsonObject(text);
          const parsedResult = JSON.parse(cleanedText);

          // Normalize and validate output against known career titles
          const normalizedResult = normalizeKnownCareerRecommendations(parsedResult, promptCareers);
          const validatedResult = CareerRecommendationResponseSchema.parse(normalizedResult);

          // Cache result
          cacheSet(cacheKey, validatedResult);

          // Log cost
          const inputTokens = estimateTokens(prompt);
          const outputTokens = estimateTokens(cleanedText);
          const cost = estimateCost(inputTokens, outputTokens);
          console.log(
            `[Recommendation] Tokens: ${inputTokens + outputTokens}, Cost: $${cost.toFixed(4)}`
          );

          return validatedResult;
        } catch (err) {
          console.warn(
            `Gemini model ${modelName} failed:`,
            err.message
          );
        }
      }
    } else if (AI_RECOMMENDATION_MODE === "local") {
      console.log("AI_RECOMMENDATION_MODE=local - skipping Gemini for fast recommendation.");
    }

    // DETerMINISTIC RULE-BASED FALLBACK (local recommendation engine)
    console.log("Using local advanced recommendation engine fallback...");
  } catch (geminiErr) {
    console.warn("Gemini failed:", geminiErr.message);
    console.log("Falling back to local engine...");
  }

  // LOCAL FALLBACK - Intelligent rule-based recommendations
  const answers = userData.answers || {};
  const academic = getAcademicInfo(userData);
  const subjects = academic.subjects || {};
  const skillScores = getSkillScores(userData);
  const favoriteSignals = getFavoriteSignals(userData);
  const majorInterest = normalizeKeyword(academic.majorInterest);
  const fallbackCareers = careerCatalog.length ? careerCatalog : PRESETS.careers;

  const normalizeAnswer = (value) => {
    const raw = String(value ?? '').trim();
    const lower = raw.toLowerCase();

    if (raw === '') return 2;
    if (Number.isFinite(Number(raw))) {
      const n = Number(raw);
      if (n >= 1 && n <= 5) return clampNumber(n - 1, 0, 4, 2);
    }

    const mapping = {
      'không thích': 0,
      'không quan tâm': 0,
      'không phù hợp': 0,
      'không thích lắm': 0,
      'không tự tin': 0,
      'không': 0,
      'không bao giờ': 0,
      'hiếm khi': 1,
      'thỉnh thoảng': 2,
      'có một chút': 2,
      'bình thường': 2,
      'tương đối tự tin': 2,
      'có thể': 2,
      'một chút cả hai': 2,
      'cả hai': 2,
      'vừa đủ': 2,
      'cả hai tùy trường hợp': 2,
      'rất thích': 4,
      'rất yêu thích': 4,
      'rất tự tin': 4,
      'rất thường xuyên': 4,
      'rất phù hợp': 4,
      'gặp gỡ bạn bè': 4,
      'rất hào hứng': 4,
      'đó là đam mê của tôi': 4,
      'luôn sẵn sàng dẫn dắt': 4,
      'chi tiết rõ ràng': 4,
      'logic và phân tích': 4,
      'kế hoạch rõ ràng': 4,
      'tuân theo thời hạn và kế hoạch': 4,
      'kinh nghiệm và chi tiết': 4,
      'complete soon': 4,
      'thực tế': 4,
      'yêu thích': 4,
      'cách nhìn tổng quát': 3,
      'linh hoạt thay đổi': 0,
      'không quá quan tâm': 1
    };

    return mapping[lower] ?? 2;
  };

  const getSumScore = (keys) =>
    keys.reduce((sum, id) => sum + normalizeAnswer(answers[id]), 0);

  const riasecScores = {
    Realistic:     getSumScore(['q1', 'q2', 'q3', 'q4', 'q5']),
    Investigative: getSumScore(['q6', 'q7', 'q8', 'q9', 'q10']),
    Artistic:      getSumScore(['q11', 'q12', 'q13', 'q14', 'q15']),
    Social:        getSumScore(['q16', 'q17', 'q18', 'q19', 'q20']),
    Enterprising:  getSumScore(['q21', 'q22', 'q23', 'q24', 'q25']),
    Conventional:  getSumScore(['q26', 'q27', 'q28', 'q29', 'q30']),
  };

  // Phase 2 — ARCS motivation scores (q35–q38, scale 1-5)
  const arcsScores = {
    attention:    normalizeAnswer(answers['q35']),
    relevance:    normalizeAnswer(answers['q36']),
    confidence:   normalizeAnswer(answers['q37']),
    satisfaction: normalizeAnswer(answers['q38']),
  };
  const motivationBonus = Object.values(arcsScores).reduce((s, v) => s + v, 0); // 0–16

  // Phase 2 — Work environment preference (q39, q40)
  const prefersStructure = ['quy trình cố định rõ ràng', 'thiên về quy trình'].includes(
    String(answers['q40'] || '').toLowerCase()
  );

  // Boost Conventional if structured preference
  if (prefersStructure) riasecScores.Conventional += 2;

  // Derive Holland Code — top 3 groups
  const sortedRIASEC = Object.entries(riasecScores).sort((a, b) => b[1] - a[1]);
  const hollandCode = sortedRIASEC.slice(0, 3).map(([letter]) => letter[0]).join('');
  const topCategory = sortedRIASEC[0][0];

  const categoryBoost = (careerCategory) => {
    const normalize = (value) => Math.max(0, Math.min(1, value / 20)); // max 5 câu × 4 điểm = 20
    switch (careerCategory) {
      case 'Công nghệ':
        return normalize(riasecScores.Realistic) * 0.4 + normalize(riasecScores.Investigative) * 0.4 + normalize(riasecScores.Conventional) * 0.2;
      case 'Trí tuệ nhân tạo':
        return normalize(riasecScores.Investigative) * 0.55 + normalize(riasecScores.Realistic) * 0.3 + normalize(riasecScores.Conventional) * 0.15;
      case 'Thiết kế':
        return normalize(riasecScores.Artistic) * 0.6 + normalize(riasecScores.Social) * 0.25 + normalize(riasecScores.Realistic) * 0.15;
      case 'Quản lý & Kinh doanh':
        return normalize(riasecScores.Enterprising) * 0.55 + normalize(riasecScores.Social) * 0.3 + normalize(riasecScores.Conventional) * 0.15;
      default:
        return 0.5;
    }
  };

  const getSubjectBonus = (careerCategory) => {
    const math = clampNumber(subjects.math, 0, 10, 8);
    const physics = clampNumber(subjects.physics, 0, 10, 8);
    const english = clampNumber(subjects.english, 0, 10, 8);
    const literature = clampNumber(subjects.literature, 0, 10, 8);
    const chemistry = clampNumber(subjects.chemistry, 0, 10, 8);
    const biology = clampNumber(subjects.biology, 0, 10, 8);
    const history = clampNumber(subjects.history, 0, 10, 8);
    const geography = clampNumber(subjects.geography, 0, 10, 8);

    const techBase = (math + physics + english) / 3;
    const designBase = (literature + english) / 2;
    const businessBase = (math + english + literature) / 3;
    const scienceBase = (math + chemistry + biology) / 3;
    const socialBase = (literature + history + geography + english) / 4;

    const toBonus = (score) => Math.round((score - 7) * 1.5);

    switch (careerCategory) {
      case 'Công nghệ':
      case 'Trí tuệ nhân tạo':
        return toBonus(techBase);
      case 'Thiết kế':
        return toBonus(designBase);
      case 'Quản lý & Kinh doanh':
        return toBonus(businessBase);
      case 'Khoa học':
      case 'Y tế':
        return toBonus(scienceBase);
      case 'Xã hội':
      case 'Giáo dục':
        return toBonus(socialBase);
      default:
        return 0;
    }
  };

  const getSkillBonus = (careerCategory) => {
    const scoreByCategory = {
      'Công nghệ': skillScores.technical * 0.5 + skillScores.analytical * 0.4 + skillScores.communication * 0.1,
      'Trí tuệ nhân tạo': skillScores.analytical * 0.55 + skillScores.technical * 0.4 + skillScores.creative * 0.05,
      'Thiết kế': skillScores.creative * 0.55 + skillScores.communication * 0.25 + skillScores.technical * 0.2,
      'Quản lý & Kinh doanh': skillScores.leadership * 0.45 + skillScores.communication * 0.35 + skillScores.analytical * 0.2,
    }[careerCategory] || (
      skillScores.analytical * 0.25 +
      skillScores.creative * 0.2 +
      skillScores.communication * 0.25 +
      skillScores.leadership * 0.15 +
      skillScores.technical * 0.15
    );

    return Math.round((scoreByCategory - 50) / 12);
  };

  const getPreferenceBonus = (career) => {
    const title = normalizeKeyword(career.title);
    const category = normalizeKeyword(career.category);
    const skillText = Array.isArray(career.skills)
      ? career.skills.map(normalizeKeyword).join(' ')
      : '';

    let bonus = 0;
    if (majorInterest) {
      const matchesMajorInterest =
        title.includes(majorInterest) ||
        majorInterest.includes(title) ||
        category.includes(majorInterest) ||
        skillText.includes(majorInterest);
      if (matchesMajorInterest) bonus += 5;
    }

    const careerId = normalizeKeyword(career.id || career._id);
    const matchesFavorite = favoriteSignals.some((favorite) =>
      favorite === careerId ||
      favorite === title ||
      title.includes(favorite) ||
      favorite.includes(title)
    );
    if (matchesFavorite) bonus += 7;

    return bonus;
  };

  const extrasByMBTI = (careerCategory) => {
    let bonus = 0;
    if (careerCategory === 'Công nghệ' && hollandCode.includes('I')) bonus += 3;
    if (careerCategory === 'Trí tuệ nhân tạo' && hollandCode.startsWith('I')) bonus += 4;
    if (careerCategory === 'Thiết kế' && hollandCode.includes('A')) bonus += 3;
    if (careerCategory === 'Quản lý & Kinh doanh' && hollandCode.includes('E')) bonus += 3;
    // ARCS motivation bonus (normalized: 0-4 extra points)
    bonus += Math.round(motivationBonus / 4);
    return bonus;
  };

  const matchedCareers = [...fallbackCareers]
    .map((career) => {
      const boost = categoryBoost(career.category);
      const suitability = Math.min(
        99,
        Math.max(
          45,
          Math.round(
            65 +
            boost * 30 +
            extrasByMBTI(career.category) +
            getSubjectBonus(career.category) +
            getSkillBonus(career.category) +
            getPreferenceBonus(career)
          )
        )
      );
      return { ...career, suitability };
    })
    .sort((a, b) => b.suitability - a.suitability);

  const getArchetypeLabel = () => {
    switch (topCategory) {
      case 'Realistic':      return 'Nhà Thực Hành Kỹ Thuật';
      case 'Investigative':  return 'Nhà Khám Phá Phân Tích';
      case 'Artistic':       return 'Nhà Sáng Tạo Trải Nghiệm';
      case 'Social':         return 'Nhà Hỗ Trợ Đồng Cảm';
      case 'Enterprising':   return 'Nhà Khởi Nghiệp Lãnh Đạo';
      case 'Conventional':   return 'Nhà Quản Trị Chi Tiết';
      default:               return 'Nhà Định Hướng Tích Hợp';
    }
  };

  const archetypeLabel = getArchetypeLabel();
  const archetype = `${archetypeLabel} (${hollandCode})`;
  const description = `Mã Holland của bạn là **${hollandCode}** — phản ánh khuynh hướng ${archetypeLabel.toLowerCase()}. Ba nhóm tính cách nổi trội nhất của bạn là ${sortedRIASEC.slice(0,3).map(([k,v]) => `${k} (${v}đ)`).join(', ')}. Sự kết hợp này định hình phong cách làm việc và môi trường phù hợp nhất với bạn.`;
  const favoriteInsight = majorInterest || favoriteSignals.length
    ? ` Mình cũng đã cân nhắc ngành bạn quan tâm/lưu trong hồ sơ để không bỏ qua định hướng cá nhân.`
    : '';
  const insights = `Dựa trên mã Holland **${hollandCode}**, bạn nên ưu tiên các ngành nghề phù hợp với nhóm ${topCategory}. Điểm động lực ARCS của bạn cho thấy ${arcsScores.confidence >= 2 ? 'bạn khá tự tin' : 'bạn cần củng cố thêm niềm tin'} vào năng lực bản thân.${favoriteInsight} Hồ sơ điểm số và kỹ năng tự đánh giá được dùng để điều chỉnh độ phù hợp, vì vậy hãy cập nhật chúng thường xuyên để kết quả chính xác hơn.`;

  const result = {
    archetype,
    description,
    suitabilityScore: clampNumber(Math.max(82, Math.round(matchedCareers[0]?.suitability || 82)), 0, 100, 82),
    careers: matchedCareers,
    insights,
  };

  const cacheKey = generateCacheKey({
    ...userData,
    titles: fallbackCareers.map((career) => career.title)
  });
  cacheSet(cacheKey, result);

  return result;
};

/**
 * AI Chat Advisor with context-awareness + caching + retry
 */
const getChatResponse = async (chatHistory, userProfile) => {
  // Khai báo ở ngoài try để fallback có thể dùng
  const lastMessage = chatHistory?.[chatHistory.length - 1]?.content || "";

  try {
    // Check cache first
    const lastUserMsg = lastMessage;
    const cacheKey = generateCacheKey({ lastUserMsg, userId: userProfile?.email });
    const cached = cacheGet(cacheKey);
    if (cached) {
      console.log("✓ Cache HIT for chat response");
      return cached;
    }

    const profileContext = userProfile
      ? `
    Hồ sơ học sinh đang nhắn tin:
    - Họ tên: ${userProfile.name}
    - Email: ${userProfile.email}
    - Trường: ${userProfile.academicInfo?.school || "Chưa cập nhật"}
    - Lớp: ${userProfile.academicInfo?.grade || "12"}
    - Ngành quan tâm: ${userProfile.academicInfo?.majorInterest || "Chưa cập nhật"}
    - Hình mẫu hướng nghiệp: ${
        userProfile.personalityTest?.archetype
          ? `${userProfile.personalityTest.archetype} (${userProfile.personalityTest.suitabilityScore}%)`
          : "Chưa làm khảo sát"
      }
    - Điểm: Toán ${userProfile.academicInfo?.subjects?.math || 8.0}, Lý ${userProfile.academicInfo?.subjects?.physics || 8.0}, Anh ${userProfile.academicInfo?.subjects?.english || 8.0}
  `
      : "Thông tin: Không có";

    const normalizedHistory = Array.isArray(chatHistory)
      ? chatHistory
          .slice(-5)
          .map((message) => ({
            role: message?.role === "ai" || message?.role === "assistant" ? "assistant" : "user",
            content: toTrimmedString(message?.content).slice(0, 2000)
          }))
          .filter((message) => message.content)
      : [];

    const chatPrompt = `
Bạn là "EduMatch AI Advisor" - chuyên gia tư vấn hướng nghiệp cho học sinh cấp 3 Việt Nam.

**NGUYÊN TẮC HÀNH ĐỘNG:**
1. Lắng nghe, hiểu, động viên, hướng dẫn
2. Giúp chọn ngành, trường, lộ trình học tập
3. Trả lời Tiếng Việt chân thành nhưng chuyên nghiệp
4. Nếu câu hỏi ngoài chủ đề, khéo léo nhắc nhở

**HỒ SƠ HỌC SINH:**
${profileContext}

**LỊCH SỬ CUỘC HỘI THOẠI:**
${normalizedHistory
  .map(h => `${h.role === "user" ? "Học sinh" : "AI Advisor"}: ${h.content}`)
  .join("\n")}

Hãy trả lời đối với câu hỏi cuối cùng của học sinh một cách hữu ích, cá nhân hóa, và truyền cảm hứng.
`;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await callGeminiWithRetry(async () => {
          return await model.generateContent(chatPrompt);
        });

        const response = await result.response;
        const responseText = response.text();

        // Cache result
        cacheSet(cacheKey, responseText);

        // Log cost
        const inputTokens = estimateTokens(chatPrompt);
        const outputTokens = estimateTokens(responseText);
        const cost = estimateCost(inputTokens, outputTokens);
        console.log(`[Chat] Tokens: ${inputTokens + outputTokens}, Cost: $${cost.toFixed(4)}`);

        return responseText;
      } catch (err) {
        console.warn("Gemini Chat failed:", err.message);
      }
    }

    // Fallback chat responses
    console.log("Using local fallback chat agent...");
  } catch (chatErr) {
    console.warn("Chat API failed:", chatErr.message);
    console.log("Falling back to local chat engine...");
  }

  // LOCAL FALLBACK - Rule-based chat responses
  const msg = (lastMessage || "").toLowerCase();

  let responseText = `Chào bạn! Mình là **EduMatch AI Advisor**. `;

  if (userProfile && userProfile.name) {
    responseText += `Chào **${userProfile.name}**, `;
  }

  if (
    msg.includes("hello") ||
    msg.includes("xin chào") ||
    msg.includes("hi")
  ) {
    responseText += `mình rất sẵn lòng giúp bạn giải đáp các thắc mắc về lựa chọn ngành học, tìm hiểu các trường đại học tốt nhất hoặc lên kế hoạch rèn luyện các kỹ năng còn thiếu. Bạn có muốn bắt đầu bằng việc thảo luận về sở thích hay học lực hiện tại không?`;
  } else if (
    msg.includes("lập trình") ||
    msg.includes("công nghệ") ||
    msg.includes("it") ||
    msg.includes("phần mềm") ||
    msg.includes("ai")
  ) {
    responseText += `ngành **Công nghệ thông tin & Khoa học máy tính** là sự lựa chọn tuyệt vời. 

Với điểm môn Toán của bạn đang ở mức khá tốt, bạn có nền tảng tư duy logic vững vàng.

**Định hướng khuyên dùng cho bạn:**
1. **Software Architect**: Phù hợp nếu bạn thích thiết kế cấu trúc hệ thống lớn.
2. **AI Engineer**: Phù hợp nếu bạn mê nghiên cứu thuật toán thông minh.

Bạn có muốn mình giải thích chi tiết hơn về lộ trình tự học không?`;
  } else if (
    msg.includes("thiết kế") ||
    msg.includes("nghệ thuật") ||
    msg.includes("designer")
  ) {
    responseText += `lĩnh vực **UX/UI Design** rất rộng mở. Công việc này đòi hỏi sự kết hợp giữa óc thẩm mỹ và khả năng phân tích tâm lý người dùng.

**Lời khuyên:**
- Bắt đầu làm quen sớm với công cụ **Figma**
- Tạo portfolio trên Behance/Dribbble
- Rèn luyện kỹ năng thấu cảm bằng cách quan sát các ứng dụng

Bạn có tò mò về sự khác biệt giữa thiết kế truyền thống và thiết kế trải nghiệm kỹ thuật số không?`;
  } else if (
    msg.includes("ngành gì") ||
    msg.includes("chọn ngành") ||
    msg.includes("tư vấn")
  ) {
    if (userProfile?.personalityTest?.archetype) {
      responseText += `hình mẫu hướng nghiệp của bạn là **${userProfile.personalityTest.archetype}**. 

Các ngành có độ tương thích cao: **Software Architect**, **Data Scientist**, **AI Engineer**. Bạn đã tìm hiểu công việc cụ thể của các ngành này chưa?`;
    } else {
      responseText += `để đưa ra gợi ý chính xác, bạn hãy làm **Khảo sát hướng nghiệp** trên Menu để mình lập bản đồ tính cách cho bạn nhé!`;
    }
  } else {
    responseText += `câu hỏi của bạn rất thú vị. Bạn có thể cho mình biết rõ hơn về những việc bạn thích làm trong thời gian rảnh hay môn học nào khiến bạn hào hứng nhất không?`;
  }

  // Cache the fallback response too
  const cacheKey = generateCacheKey({ lastMessage, userId: userProfile?.email });
  cacheSet(cacheKey, responseText);

  return responseText;
};

// ==================== MODULE EXPORTS ====================
module.exports = {
  getCareerRecommendations,
  getChatResponse,
  // Advanced utilities (for monitoring)
  estimateTokens,
  estimateCost,
  cacheGet,
  cacheSet,
  memoryCache
};
