const toTrimmedString = (value, fallback = "") => String(value ?? fallback).trim();

const clampNumber = (value, min, max, fallback = min) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
};

const normalizeKeyword = (value) =>
  toTrimmedString(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

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

const getFavoriteSignals = (userData = {}) =>
  Array.isArray(userData.favorites)
    ? userData.favorites.map((favorite) => normalizeKeyword(favorite)).filter(Boolean)
    : [];

const ANSWER_SCORE_MAP = {
  "khong thich": 0,
  "khong quan tam": 0,
  "khong phu hop": 0,
  "khong thich lam": 0,
  "khong tu tin": 0,
  "khong": 0,
  "khong bao gio": 0,
  "hoan toan khong": 0,
  "rat it": 1,
  "hiem khi": 1,
  "khong qua quan tam": 1,
  "co nhung khong nhieu": 1,
  "co nhung khong hieu qua": 1,
  "chua tung co": 1,
  "thinh thoang": 2,
  "doi khi co": 2,
  "co mot chut": 2,
  "huu ich mot phan": 2,
  "binh thuong": 2,
  "tuong doi tu tin": 2,
  "co the": 2,
  "mot chut ca hai": 2,
  "ca hai": 2,
  "vua du": 2,
  "ca hai tuy truong hop": 2,
  "cach nhin tong quat": 3,
  "kha anh huong": 3,
  "kha thuong xuyen": 3,
  "anh huong nhieu": 3,
  "rat thich": 4,
  "yeu thich": 4,
  "rat yeu thich": 4,
  "rat tu tin": 4,
  "rat thuong xuyen": 4,
  "rat phu hop": 4,
  "rat anh huong": 4,
  "rat huu ich": 4,
  "ho quyet dinh thay toi": 4,
  "day la yeu to chinh": 4,
  "gap go ban be": 4,
  "rat hao hung": 4,
  "do la dam me cua toi": 4,
  "luon san sang dan dat": 4,
  "chi tiet ro rang": 4,
  "logic va phan tich": 4,
  "ke hoach ro rang": 4,
  "tuan theo thoi han va ke hoach": 4,
  "kinh nghiem va chi tiet": 4,
  "complete soon": 4,
  "thuc te": 4,
};

const normalizeSurveyAnswer = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return 2;

  if (Number.isFinite(Number(raw))) {
    const numberValue = Number(raw);
    if (numberValue >= 1 && numberValue <= 5) return clampNumber(numberValue - 1, 0, 4, 2);
    if (numberValue >= 0 && numberValue <= 4) return clampNumber(numberValue, 0, 4, 2);
  }

  return ANSWER_SCORE_MAP[normalizeKeyword(raw)] ?? 2;
};

const RIASEC_KEYS = {
  Realistic: ["q1", "q2", "q3", "q4", "q5"],
  Investigative: ["q6", "q7", "q8", "q9", "q10"],
  Artistic: ["q11", "q12", "q13", "q14", "q15"],
  Social: ["q16", "q17", "q18", "q19", "q20"],
  Enterprising: ["q21", "q22", "q23", "q24", "q25"],
  Conventional: ["q26", "q27", "q28", "q29", "q30"],
};

const getRiasecScoresFromAnswers = (answers = {}) => {
  const riasecScores = Object.fromEntries(
    Object.entries(RIASEC_KEYS).map(([group, keys]) => [
      group,
      keys.reduce((sum, id) => sum + normalizeSurveyAnswer(answers[id]), 0),
    ])
  );

  const workStylePreference = normalizeKeyword(answers.q39);
  if (["quy trinh co dinh ro rang", "thien ve quy trinh"].includes(workStylePreference)) {
    riasecScores.Conventional += 2;
  }

  return riasecScores;
};

const getHollandCode = (riasecScores = {}) =>
  Object.entries(riasecScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([letter]) => letter[0])
    .join("");

const getArchetypeLabel = (topCategory) => {
  switch (topCategory) {
    case "Realistic":
      return "Nhà Thực Hành Kỹ Thuật";
    case "Investigative":
      return "Nhà Khám Phá Phân Tích";
    case "Artistic":
      return "Nhà Sáng Tạo Trải Nghiệm";
    case "Social":
      return "Nhà Hỗ Trợ Đồng Cảm";
    case "Enterprising":
      return "Nhà Khởi Nghiệp Lãnh Đạo";
    case "Conventional":
      return "Nhà Quản Trị Chi Tiết";
    default:
      return "Nhà Định Hướng Tích Hợp";
  }
};

const normalizeRiasecScore = (value) => Math.max(0, Math.min(1, value / 20));

const getCategoryAffinity = (career, riasecScores) => {
  const r = normalizeRiasecScore(riasecScores.Realistic);
  const i = normalizeRiasecScore(riasecScores.Investigative);
  const a = normalizeRiasecScore(riasecScores.Artistic);
  const s = normalizeRiasecScore(riasecScores.Social);
  const e = normalizeRiasecScore(riasecScores.Enterprising);
  const c = normalizeRiasecScore(riasecScores.Conventional);
  const text = [
    career.category,
    career.title,
    ...(Array.isArray(career.skills) ? career.skills : []),
  ].map(normalizeKeyword).join(" ");

  if (text.includes("cong nghe") || text.includes("phan mem")) return r * 0.25 + i * 0.45 + c * 0.2 + a * 0.1;
  if (text.includes("tri tue") || text.includes("ai") || text.includes("du lieu")) return i * 0.6 + r * 0.2 + c * 0.15 + a * 0.05;
  if (text.includes("dien") || text.includes("vien thong") || text.includes("tu dong") || text.includes("ban dan") || text.includes("oto") || text.includes("hang khong") || text.includes("dong tau")) return r * 0.45 + i * 0.35 + c * 0.15 + e * 0.05;
  if (text.includes("thiet ke") || text.includes("nghe thuat")) return a * 0.6 + s * 0.2 + i * 0.1 + r * 0.1;
  if (text.includes("kinh te") || text.includes("kinh doanh") || text.includes("quan ly") || text.includes("marketing") || text.includes("du lich")) return e * 0.5 + s * 0.25 + c * 0.15 + a * 0.1;
  if (text.includes("luat")) return e * 0.35 + c * 0.3 + s * 0.2 + i * 0.15;
  if (text.includes("y te") || text.includes("bac si") || text.includes("sinh hoc") || text.includes("thuc pham") || text.includes("nong lam")) return i * 0.45 + s * 0.25 + r * 0.2 + c * 0.1;
  if (text.includes("giao duc") || text.includes("su pham") || text.includes("xa hoi")) return s * 0.55 + a * 0.2 + e * 0.15 + c * 0.1;
  if (text.includes("van hoa") || text.includes("lich su") || text.includes("ngon ngu")) return a * 0.4 + s * 0.25 + i * 0.2 + c * 0.15;
  if (text.includes("hang hai")) return r * 0.45 + c * 0.25 + i * 0.2 + e * 0.1;

  return 0.18;
};

const getSubjectBonus = (career, subjects = {}) => {
  const math = clampNumber(subjects.math, 0, 10, 8);
  const physics = clampNumber(subjects.physics, 0, 10, 8);
  const english = clampNumber(subjects.english, 0, 10, 8);
  const literature = clampNumber(subjects.literature, 0, 10, 8);
  const chemistry = clampNumber(subjects.chemistry, 0, 10, 8);
  const biology = clampNumber(subjects.biology, 0, 10, 8);
  const history = clampNumber(subjects.history, 0, 10, 8);
  const geography = clampNumber(subjects.geography, 0, 10, 8);
  const text = normalizeKeyword(`${career.category} ${career.title}`);
  const toBonus = (score) => Math.round((score - 7) * 1.5);

  if (text.includes("cong nghe") || text.includes("ai") || text.includes("du lieu") || text.includes("dien")) return toBonus((math + physics + english) / 3);
  if (text.includes("y te") || text.includes("sinh hoc") || text.includes("thuc pham") || text.includes("nong lam")) return toBonus((math + chemistry + biology) / 3);
  if (text.includes("giao duc") || text.includes("luat") || text.includes("ngon ngu") || text.includes("xa hoi")) return toBonus((literature + history + geography + english) / 4);
  if (text.includes("thiet ke") || text.includes("nghe thuat")) return toBonus((literature + english) / 2);
  if (text.includes("kinh te") || text.includes("kinh doanh") || text.includes("quan ly")) return toBonus((math + english + literature) / 3);

  return 0;
};

const getSkillBonus = (career, skillScores) => {
  const text = normalizeKeyword(`${career.category} ${career.title}`);
  let weightedScore;

  if (text.includes("cong nghe") || text.includes("ai") || text.includes("du lieu") || text.includes("dien")) {
    weightedScore = skillScores.technical * 0.5 + skillScores.analytical * 0.4 + skillScores.communication * 0.1;
  } else if (text.includes("thiet ke") || text.includes("nghe thuat")) {
    weightedScore = skillScores.creative * 0.55 + skillScores.communication * 0.25 + skillScores.technical * 0.2;
  } else if (text.includes("kinh te") || text.includes("quan ly") || text.includes("marketing")) {
    weightedScore = skillScores.leadership * 0.45 + skillScores.communication * 0.35 + skillScores.analytical * 0.2;
  } else {
    weightedScore =
      skillScores.analytical * 0.25 +
      skillScores.creative * 0.2 +
      skillScores.communication * 0.25 +
      skillScores.leadership * 0.15 +
      skillScores.technical * 0.15;
  }

  return Math.round((weightedScore - 50) / 12);
};

const getPreferenceBonus = (career, userData = {}) => {
  const academic = getAcademicInfo(userData);
  const majorInterest = normalizeKeyword(academic.majorInterest);
  const favoriteSignals = getFavoriteSignals(userData);
  const title = normalizeKeyword(career.title);
  const category = normalizeKeyword(career.category);
  const skillText = Array.isArray(career.skills) ? career.skills.map(normalizeKeyword).join(" ") : "";
  const careerId = normalizeKeyword(career.id || career._id);
  let bonus = 0;

  if (
    majorInterest &&
    (title.includes(majorInterest) ||
      majorInterest.includes(title) ||
      category.includes(majorInterest) ||
      skillText.includes(majorInterest))
  ) {
    bonus += 5;
  }

  if (
    favoriteSignals.some((favorite) =>
      favorite === careerId || favorite === title || title.includes(favorite) || favorite.includes(title)
    )
  ) {
    bonus += 7;
  }

  return bonus;
};

const getMotivationBonus = (answers = {}, hollandCode = "", career = {}) => {
  const motivationScore =
    normalizeSurveyAnswer(answers.q35) +
    normalizeSurveyAnswer(answers.q36) +
    normalizeSurveyAnswer(answers.q37) +
    normalizeSurveyAnswer(answers.q38);
  const text = normalizeKeyword(`${career.category} ${career.title}`);
  let bonus = Math.round(motivationScore / 6);

  if ((text.includes("cong nghe") || text.includes("ai") || text.includes("du lieu")) && hollandCode.includes("I")) bonus += 2;
  if ((text.includes("thiet ke") || text.includes("nghe thuat")) && hollandCode.includes("A")) bonus += 2;
  if ((text.includes("kinh te") || text.includes("quan ly") || text.includes("marketing")) && hollandCode.includes("E")) bonus += 2;
  if ((text.includes("giao duc") || text.includes("y te") || text.includes("xa hoi")) && hollandCode.includes("S")) bonus += 2;

  return bonus;
};

const scoreCareerForProfile = (career, userData = {}) => {
  const answers = userData.answers || {};
  const academic = getAcademicInfo(userData);
  const subjects = academic.subjects || {};
  const skillScores = getSkillScores(userData);
  const riasecScores = getRiasecScoresFromAnswers(answers);
  const sortedRIASEC = Object.entries(riasecScores).sort((a, b) => b[1] - a[1]);
  const hollandCode = getHollandCode(riasecScores);
  const affinity = getCategoryAffinity(career, riasecScores);
  const baseScore = 42;
  const riasecComponent = Math.round(affinity * 42);
  const academicBonus = getSubjectBonus(career, subjects);
  const skillBonus = getSkillBonus(career, skillScores);
  const preferenceBonus = getPreferenceBonus(career, userData);
  const motivationBonus = getMotivationBonus(answers, hollandCode, career);
  const rawScore = baseScore + riasecComponent + academicBonus + skillBonus + preferenceBonus + motivationBonus;
  const finalScore = clampNumber(Math.round(rawScore), 30, 97, 30);

  return {
    score: finalScore,
    hollandCode,
    riasecScores,
    topCategory: sortedRIASEC[0]?.[0] || "Integrated",
    scoreBreakdown: {
      baseScore,
      riasecComponent,
      academicBonus,
      skillBonus,
      preferenceBonus,
      motivationBonus,
      rawScore: Math.round(rawScore),
      finalScore,
    },
  };
};

const buildDeterministicRecommendation = (userData = {}, careers = []) => {
  const scoredCareers = [...careers]
    .map((career) => {
      const score = scoreCareerForProfile(career, userData);
      return {
        ...career,
        suitability: score.score,
        scoreBreakdown: score.scoreBreakdown,
      };
    })
    .sort((a, b) => b.suitability - a.suitability);

  const topCareerScore = scoredCareers[0]
    ? scoreCareerForProfile(scoredCareers[0], userData)
    : scoreCareerForProfile({}, userData);
  const riasecEntries = Object.entries(topCareerScore.riasecScores).sort((a, b) => b[1] - a[1]);
  const archetypeLabel = getArchetypeLabel(topCareerScore.topCategory);
  const hollandCode = topCareerScore.hollandCode;

  return {
    archetype: `${archetypeLabel} (${hollandCode})`,
    hollandCode,
    riasecScores: topCareerScore.riasecScores,
    scoreBreakdown: topCareerScore.scoreBreakdown,
    confidence: getRecommendationConfidence(scoredCareers, userData),
    method: "RIASEC_ARCS_RULE_BASED",
    description: `Mã Holland của bạn là ${hollandCode}. Ba nhóm nổi trội nhất là ${riasecEntries
      .slice(0, 3)
      .map(([key, value]) => `${key} (${value} điểm)`)
      .join(", ")}.`,
    suitabilityScore: scoredCareers[0]?.suitability || 0,
    careers: scoredCareers.slice(0, 5),
    insights: `Kết quả được tính bằng RIASEC, ARCS, học lực, kỹ năng tự đánh giá và sở thích cá nhân. Ngành đứng đầu có điểm phù hợp ${scoredCareers[0]?.suitability || 0}/100 theo thang nội bộ của EduMatch.`,
  };
};

const getRecommendationConfidence = (scoredCareers = [], userData = {}) => {
  const answers = userData.answers || {};
  const academic = getAcademicInfo(userData);
  const skillScores = userData.skillEvaluation?.scores || userData.skillEvaluation || {};
  const answeredCount = Object.values(answers).filter((value) => value !== undefined && value !== null && value !== "").length;
  const topScore = Number(scoredCareers[0]?.suitability || 0);
  const secondScore = Number(scoredCareers[1]?.suitability || 0);
  const scoreGap = Math.max(0, topScore - secondScore);
  const hasAcademicSubjects = Boolean(academic.subjects && Object.keys(academic.subjects).length >= 3);
  const hasSkillProfile = ["technical", "analytical", "creative", "communication", "leadership"]
    .filter((key) => Number.isFinite(Number(skillScores[key]))).length >= 4;
  const hasPreference = Boolean(toTrimmedString(academic.majorInterest)) || getFavoriteSignals(userData).length > 0;

  let confidenceScore = 0;
  if (answeredCount >= 38) confidenceScore += 35;
  else if (answeredCount >= 30) confidenceScore += 25;
  else if (answeredCount >= 20) confidenceScore += 15;

  if (topScore >= 82) confidenceScore += 20;
  else if (topScore >= 70) confidenceScore += 14;
  else if (topScore >= 60) confidenceScore += 8;

  if (scoreGap >= 8) confidenceScore += 18;
  else if (scoreGap >= 4) confidenceScore += 10;
  else if (scoreGap >= 2) confidenceScore += 5;

  if (hasAcademicSubjects) confidenceScore += 10;
  if (hasSkillProfile) confidenceScore += 10;
  if (hasPreference) confidenceScore += 7;

  const normalizedScore = clampNumber(confidenceScore, 0, 100, 0);
  let level = "exploratory";
  let label = "Tham khảo";
  if (normalizedScore >= 78) {
    level = "high";
    label = "Cao";
  } else if (normalizedScore >= 55) {
    level = "medium";
    label = "Trung bình";
  }

  const reasons = [];
  reasons.push(`${answeredCount}/40 câu khảo sát đã được dùng để tính điểm`);
  reasons.push(`Khoảng cách top 1-top 2 là ${scoreGap} điểm`);
  reasons.push(hasAcademicSubjects ? "Có hồ sơ học lực" : "Thiếu hồ sơ học lực chi tiết");
  reasons.push(hasSkillProfile ? "Có hồ sơ kỹ năng tự đánh giá" : "Thiếu hồ sơ kỹ năng tự đánh giá");
  if (hasPreference) reasons.push("Có tín hiệu ngành quan tâm/yêu thích");

  return {
    level,
    label,
    score: normalizedScore,
    topScore,
    scoreGap,
    answeredCount,
    reasons,
  };
};

module.exports = {
  clampNumber,
  normalizeKeyword,
  getAcademicInfo,
  getSkillScores,
  getFavoriteSignals,
  normalizeSurveyAnswer,
  getRiasecScoresFromAnswers,
  getHollandCode,
  scoreCareerForProfile,
  buildDeterministicRecommendation,
};
