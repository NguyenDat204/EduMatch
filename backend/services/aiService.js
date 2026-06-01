const { GoogleGenerativeAI } = require("@google/generative-ai");
const { z } = require("zod");
const crypto = require("crypto");
const Career = require("../models/Career");
require("dotenv").config();

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
const CACHE_TTL = 3600000; // 1 hour

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
  memoryCache.set(key, { value, timestamp: Date.now() });
};

const generateCacheKey = (data) => {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
};

// ==================== VALIDATION SCHEMAS ====================
const UserProfileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  academicInfo: z.object({
    school: z.string().optional(),
    grade: z.string().optional(),
    majorInterest: z.string().optional(),
    subjects: z.record(z.number()).optional()
  }).optional(),
  skillEvaluation: z.record(z.any()).optional(),
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
const callGeminiWithRetry = async (apiCall, maxRetries = 3) => {
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
  const careers = await Career.find().lean();
  return careers.map((career) => ({
    id: career._id?.toString() || null,
    title: String(career.title || '').trim(),
    description: String(career.description || '').trim(),
    salary: String(career.salary || 'Chưa xác định').trim(),
    growth: String(career.growth || 'Ổn định').trim(),
    skills: Array.isArray(career.skills) ? career.skills.map((s) => String(s).trim()).filter(Boolean) : [],
    suitability: Number.isFinite(career.suitability) ? career.suitability : 0,
    category: String(career.category || '').trim(),
    roadmap: Array.isArray(career.roadmap)
      ? career.roadmap.map((step) => ({
          phase: String(step.phase || '').trim(),
          title: String(step.title || '').trim(),
          duration: String(step.duration || '').trim(),
          description: String(step.description || '').trim(),
          skillsToAcquire: Array.isArray(step.skillsToAcquire)
            ? step.skillsToAcquire.map((skill) => String(skill).trim()).filter(Boolean)
            : []
        }))
      : []
  }));
};

const buildCareerCatalogContext = (careers) => {
  if (!Array.isArray(careers) || careers.length === 0) {
    return "Không có danh sách ngành nghề để tham khảo.";
  }
  return careers
    .map((career, index) => `${index + 1}. ${career.title} (${career.category}): ${career.description}`)
    .join("\n");
};

const normalizeRoadmapStep = (step) => {
  if (!step || typeof step !== 'object') return null;
  return {
    phase: String(step.phase || '').trim(),
    title: String(step.title || '').trim(),
    duration: String(step.duration || '').trim(),
    description: String(step.description || '').trim(),
    skillsToAcquire: Array.isArray(step.skillsToAcquire)
      ? step.skillsToAcquire.map((skill) => String(skill).trim()).filter(Boolean)
      : []
  };
};

const normalizeCareerFromAi = (career, careerCatalog) => {
  if (!career || typeof career !== 'object') return null;
  const title = String(career.title || '').trim();
  if (!title) return null;

  const matchingCareer = careerCatalog.find(
    (item) => item.title.toLowerCase() === title.toLowerCase()
  );

  if (!matchingCareer) return null;

  return {
    title: matchingCareer.title,
    description: String(career.description || matchingCareer.description || '').trim(),
    salary: String(career.salary || matchingCareer.salary || 'Chưa xác định').trim(),
    growth: String(career.growth || matchingCareer.growth || 'Ổn định').trim(),
    skills: Array.isArray(career.skills)
      ? career.skills.map((s) => String(s).trim()).filter(Boolean)
      : matchingCareer.skills,
    suitability: Number.isFinite(career.suitability)
      ? career.suitability
      : matchingCareer.suitability || 0,
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
    archetype: String(aiResult.archetype || '').trim(),
    description: String(aiResult.description || '').trim(),
    suitabilityScore: Number.isFinite(aiResult.suitabilityScore)
      ? aiResult.suitabilityScore
      : 0,
    careers: normalizedCareers,
    insights: String(aiResult.insights || '').trim()
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
  const academic = userData.academicProfile || userData.academicInfo || {};
  const allowedTitles = Array.isArray(careerCatalog)
    ? careerCatalog.map((career) => career.title).join(", ")
    : "";

  return `
Bạn là một chuyên gia hướng nghiệp hàng đầu thế giới với 20+ năm kinh nghiệm. Hãy phân tích chi tiết thông tin học sinh này để đưa ra gợi ý nghề nghiệp cá nhân hóa chất lượng cao.

**HỒ SƠ HỌC SINH:**
- Câu trả lời khảo sát: ${JSON.stringify(answers)}
- Thông tin học tập: ${JSON.stringify(academic)}
- Kỹ năng tự đánh giá: ${JSON.stringify(userData.skillEvaluation || {})}

**DANH SÁCH NGÀNH NGHỀ CÓ SẴN:**
${careerContext}

**QUY TẮC QUAN TRỌNG:**
1. Chỉ chọn các ngành nghề từ danh sách trên. Tuyệt đối không tự thêm ngành nghề mới.
2. Nếu bạn không thể tìm đủ 4 ngành hợp lý, trả về ít hơn nhưng vẫn chỉ sử dụng tên có trong danh sách.
3. Không bao gồm markdown, không thêm chú thích ngoài JSON.
4. Hãy ưu tiên chọn các ngành nghề phù hợp nhất với dữ liệu khảo sát và học lực.

**TÊN NGÀNH NGHỀ ĐƯỢC PHÉP:** ${allowedTitles}

**ĐỊNH DẠNG JSON YÊU CẦU:**
{
  "archetype": "Tên hình mẫu (ví dụ: Nhà Phân Tích Logic)",
  "description": "Mô tả 2-3 câu về đặc điểm nổi bật",
  "suitabilityScore": 85,
  "careers": [
    {
      "title": "Tên nghề",
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
  "insights": "Lời khuyên chiến lược chân thành"
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

    // Try Gemini if available
    if (genAI) {
      const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

      for (const modelName of modelNames) {
        try {
          console.log(`Attempting analysis with model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });

          // Call with retry logic
          const result = await callGeminiWithRetry(async () => {
            return await model.generateContent(prompt);
          });

          const response = await result.response;
          let text = response.text();

          console.log("✓ Gemini response received");

          // Clean markdown blocks if any
          if (text.includes("```json")) {
            text = text.split("```json")[1].split("```")[0];
          } else if (text.includes("```")) {
            text = text.split("```")[1].split("```")[0];
          }

          const cleanedText = text.trim();
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
    }

    // DETerMINISTIC RULE-BASED FALLBACK (local recommendation engine)
    console.log("Using local advanced recommendation engine fallback...");
  } catch (geminiErr) {
    console.warn("Gemini failed:", geminiErr.message);
    console.log("Falling back to local engine...");
  }

  // LOCAL FALLBACK - Intelligent rule-based recommendations
  const answers = userData.answers || {};
  const academic = userData.academicProfile || userData.academicInfo || {};
  const schoolSubjects = academic.subjects || {};
  const fallbackCareers = careerCatalog.length ? careerCatalog : PRESETS.careers;

  const normalizeAnswer = (value) => {
    const raw = String(value ?? '').trim();
    const lower = raw.toLowerCase();

    if (raw === '') return 2;
    if (!Number.isNaN(Number(raw))) {
      const n = Number(raw);
      if (n >= 1 && n <= 5) return Math.min(4, Math.max(0, n - 1));
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
    Realistic: getSumScore(['q1', 'q2', 'q3']),
    Investigative: getSumScore(['q4', 'q5', 'q6']),
    Artistic: getSumScore(['q7', 'q8', 'q9']),
    Social: getSumScore(['q10', 'q11', 'q12']),
    Enterprising: getSumScore(['q13', 'q14', 'q15']),
    Conventional: getSumScore(['q16', 'q17', 'q18']),
  };

  const mbtiScore = {
    E: getSumScore(['q19', 'q20']),
    S: getSumScore(['q21', 'q22']),
    T: getSumScore(['q23', 'q24']),
    J: getSumScore(['q25', 'q26']),
  };

  const pickLetter = (positive, negative, score) => (score >= 5 ? positive : negative);
  const mbtiType = `${pickLetter('E', 'I', mbtiScore.E)}${pickLetter('S', 'N', mbtiScore.S)}${pickLetter('T', 'F', mbtiScore.T)}${pickLetter('J', 'P', mbtiScore.J)}`;

  const findTopRIASEC = Object.entries(riasecScores).sort((a, b) => b[1] - a[1])[0] || ['Investigative', 0];
  const [topCategory] = findTopRIASEC;

  const categoryBoost = (careerCategory) => {
    const normalize = (value) => Math.max(0, Math.min(1, value / 12));
    switch (careerCategory) {
      case 'Công nghệ':
        return (normalize(riasecScores.Realistic) * 0.45 + normalize(riasecScores.Investigative) * 0.45 + normalize(riasecScores.Conventional) * 0.1);
      case 'Trí tuệ nhân tạo':
        return (normalize(riasecScores.Investigative) * 0.55 + normalize(riasecScores.Realistic) * 0.3 + normalize(riasecScores.Conventional) * 0.15);
      case 'Thiết kế':
        return (normalize(riasecScores.Artistic) * 0.6 + normalize(riasecScores.Social) * 0.25 + normalize(riasecScores.Realistic) * 0.15);
      case 'Quản lý & Kinh doanh':
        return (normalize(riasecScores.Enterprising) * 0.55 + normalize(riasecScores.Social) * 0.3 + normalize(riasecScores.Conventional) * 0.15);
      default:
        return 0.5;
    }
  };

  const extrasByMBTI = (careerCategory) => {
    let bonus = 0;
    if (careerCategory === 'Công nghệ' && mbtiType.includes('I')) bonus += 3;
    if (careerCategory === 'Trí tuệ nhân tạo' && mbtiType.startsWith('IN')) bonus += 4;
    if (careerCategory === 'Thiết kế' && mbtiType.includes('F')) bonus += 3;
    if (careerCategory === 'Quản lý & Kinh doanh' && mbtiType.includes('E')) bonus += 3;
    return bonus;
  };

  const matchedCareers = [...fallbackCareers]
    .map((career) => {
      const boost = categoryBoost(career.category);
      const suitability = Math.min(99, Math.round(65 + boost * 30 + extrasByMBTI(career.category)));
      return { ...career, suitability };
    })
    .sort((a, b) => b.suitability - a.suitability);

  const getArchetypeLabel = () => {
    switch (topCategory) {
      case 'Realistic':
        return 'Nhà Thực Hành Kỹ Thuật';
      case 'Investigative':
        return 'Nhà Khám Phá Phân Tích';
      case 'Artistic':
        return 'Nhà Sáng Tạo Trải Nghiệm';
      case 'Social':
        return 'Nhà Hỗ Trợ Đồng Cảm';
      case 'Enterprising':
        return 'Nhà Khởi Nghiệp Lãnh Đạo';
      case 'Conventional':
        return 'Nhà Quản Trị Chi Tiết';
      default:
        return 'Nhà Định Hướng Tích Hợp';
    }
  };

  const archetypeLabel = getArchetypeLabel();
  const archetype = `${mbtiType} • ${archetypeLabel}`;
  const description = `Bạn có khuynh hướng ${archetypeLabel.toLowerCase()} với phong cách ${mbtiType}. Điều này giúp bạn phù hợp với các công việc cần sự ${topCategory === 'Artistic' ? 'sáng tạo' : topCategory === 'Investigative' ? 'khảo sát' : topCategory === 'Social' ? 'giao tiếp' : topCategory === 'Enterprising' ? 'lãnh đạo' : topCategory === 'Conventional' ? 'tổ chức' : 'thực hành'} rõ ràng.`;
  const insights = `Kết quả cho thấy bạn nên ưu tiên các ngành nghề phù hợp với nhóm ${topCategory} và phong cách ${mbtiType}. Hãy bổ sung thêm kỹ năng thực hành, tư duy phân tích và khả năng làm việc nhóm để gia tăng cơ hội phát triển.`;

  const result = {
    archetype,
    description,
    suitabilityScore: Math.max(82, Math.round(matchedCareers[0]?.suitability || 82)),
    careers: matchedCareers,
    insights,
  };

  const cacheKey = generateCacheKey(userData);
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
${chatHistory
  .slice(-5)
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
