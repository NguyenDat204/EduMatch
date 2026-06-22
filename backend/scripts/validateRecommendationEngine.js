const assert = require("assert");
const { buildDeterministicRecommendation } = require("../services/recommendationScoring");

const careers = [
  {
    title: "AI Engineer",
    category: "Trí tuệ nhân tạo",
    description: "Phát triển hệ thống AI và mô hình học máy.",
    salary: "Cao",
    growth: "Rất cao",
    skills: ["Python", "Machine Learning", "Deep Learning"],
    roadmap: [],
  },
  {
    title: "UX/UI Designer",
    category: "Thiết kế",
    description: "Thiết kế trải nghiệm và giao diện người dùng.",
    salary: "Khá",
    growth: "Ổn định",
    skills: ["Figma", "User Research", "Visual Design"],
    roadmap: [],
  },
  {
    title: "Teacher",
    category: "Giáo dục",
    description: "Giảng dạy, hướng dẫn và hỗ trợ người học.",
    salary: "Ổn định",
    growth: "Ổn định",
    skills: ["Communication", "Empathy", "Training"],
    roadmap: [],
  },
  {
    title: "Product Manager",
    category: "Quản lý & Kinh doanh",
    description: "Dẫn dắt sản phẩm và phối hợp kinh doanh, công nghệ, thiết kế.",
    salary: "Cao",
    growth: "Cao",
    skills: ["Leadership", "Market Research", "Communication"],
    roadmap: [],
  },
  {
    title: "Operations Analyst",
    category: "Vận hành & Dữ liệu",
    description: "Phân tích quy trình, dữ liệu và tối ưu vận hành.",
    salary: "Khá",
    growth: "Tốt",
    skills: ["Excel", "Data Analysis", "Process Management"],
    roadmap: [],
  },
];

const baseAnswers = () => {
  const answers = {};
  for (let i = 1; i <= 40; i += 1) answers[`q${i}`] = 3;
  answers.q35 = 4;
  answers.q36 = 4;
  answers.q37 = 4;
  answers.q38 = 4;
  return answers;
};

const boost = (answers, keys, value = 5) => {
  keys.forEach((key) => {
    answers[key] = value;
  });
  return answers;
};

const scenarios = [
  {
    name: "Investigative + technical should prefer AI",
    answers: boost(baseAnswers(), ["q6", "q7", "q8", "q9", "q10"]),
    profile: {
      academicInfo: { majorInterest: "AI", subjects: { math: 9, physics: 9, english: 8 } },
      skillEvaluation: { scores: { technical: 90, analytical: 90, creative: 50, communication: 55, leadership: 45 } },
    },
    expectedTop: "AI Engineer",
  },
  {
    name: "Artistic + creative should prefer design",
    answers: boost(baseAnswers(), ["q11", "q12", "q13", "q14", "q15"]),
    profile: {
      academicInfo: { majorInterest: "thiết kế", subjects: { literature: 8.5, english: 8.5 } },
      skillEvaluation: { scores: { technical: 45, analytical: 55, creative: 92, communication: 75, leadership: 45 } },
    },
    expectedTop: "UX/UI Designer",
  },
  {
    name: "Social + communication should prefer education",
    answers: boost(baseAnswers(), ["q16", "q17", "q18", "q19", "q20"]),
    profile: {
      academicInfo: { majorInterest: "giáo dục", subjects: { literature: 8, history: 8, geography: 8, english: 8 } },
      skillEvaluation: { scores: { technical: 45, analytical: 60, creative: 65, communication: 92, leadership: 70 } },
    },
    expectedTop: "Teacher",
  },
  {
    name: "Enterprising + leadership should prefer product/business",
    answers: boost(baseAnswers(), ["q21", "q22", "q23", "q24", "q25"]),
    profile: {
      academicInfo: { majorInterest: "kinh doanh", subjects: { math: 8, literature: 8, english: 8.5 } },
      skillEvaluation: { scores: { technical: 55, analytical: 70, creative: 65, communication: 85, leadership: 92 } },
    },
    expectedTop: "Product Manager",
  },
  {
    name: "Conventional + structured should prefer operations/data process",
    answers: boost({ ...baseAnswers(), q39: "Quy trình cố định rõ ràng" }, ["q26", "q27", "q28", "q29", "q30"]),
    profile: {
      academicInfo: { majorInterest: "dữ liệu", subjects: { math: 8.5, english: 8, literature: 7.5 } },
      skillEvaluation: { scores: { technical: 70, analytical: 82, creative: 45, communication: 60, leadership: 55 } },
    },
    expectedTop: "Operations Analyst",
  },
];

let passed = 0;

for (const scenario of scenarios) {
  const result = buildDeterministicRecommendation(
    { ...scenario.profile, answers: scenario.answers },
    careers
  );
  const topTitle = result.careers[0]?.title;
  assert.strictEqual(
    topTitle,
    scenario.expectedTop,
    `${scenario.name}: expected ${scenario.expectedTop}, got ${topTitle}`
  );
  assert.ok(result.suitabilityScore >= 60, `${scenario.name}: score too low`);
  assert.ok(result.hollandCode?.length === 3, `${scenario.name}: invalid Holland code`);
  passed += 1;
  console.log(`✓ ${scenario.name} -> ${topTitle} (${result.suitabilityScore})`);
}

console.log(`Recommendation engine validation passed: ${passed}/${scenarios.length}`);
