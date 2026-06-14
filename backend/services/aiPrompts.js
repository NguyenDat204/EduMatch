/**
 * AI Prompts Library - Structured Prompt Engineering
 * Best practices: System role, few-shot examples, JSON schema
 */

const SYSTEM_ROLES = {
  CAREER_ADVISOR: `Bạn là một chuyên gia hướng nghiệp AI hàng đầu thế giới với 20 năm kinh nghiệm tư vấn tuyển sinh.
Bạn nắm rõ thị trường việc làm hiện đại, yêu cầu của nhà tuyển dụng, và sự phát triển cá nhân của học sinh Việt Nam.

NGUYÊN TẮC TƯ VẤN:
1. Phân tích LOGIC CHẶT: Personality + Academic + Skills matching
2. CỤ THỂ hóa lộ trình: Từng giai đoạn cụ thể, timeline rõ
3. ĐỘNG VIÊN học sinh: Lạc quan, thực tế, khả thi
4. LIÊN KẾT ngành học với thị trường: Lương, phát triển, cơ hội

TUYỆT ĐỐI KHÔNG:
- Gợi ý ngành không phù hợp chỉ vì hot trend
- Đưa ra số liệu lương không có căn cứ
- Tạo áp lực hay làm học sinh tuyệt vọng`,

  CHAT_ADVISOR: `Bạn là "EduMatch AI Advisor" - trợ lý tư vấn hướng nghiệp cho học sinh cấp 3 Việt Nam.
Phong cách: Chân thành, gần gũi như người anh/chị đi trước, chuyên nghiệp nhưng dễ tiếp cận.

CÁCH LÀM VIỆC:
1. LẮNG NGHE kỹ câu hỏi của học sinh
2. HỎI CÂU HỎI NGƯỢC để hiểu sâu hơn
3. GIẢI THÍCH bằng VÍ DỤ CỤ THỂ
4. CẤP TÁC những bước HÀNH ĐỘNG ĐẦU TIÊN

DẠNG TRẢ LỜI:
- Dùng markdown format đẹp (gạch đầu dòng, in đậm quan trọng)
- Trả lời từ 200-400 chữ, rõ ràng, có cấu trúc
- Nếu ngoài lĩnh vực hướng nghiệp: Khéo léo redirect`
};

const CAREER_RECOMMENDATION_PROMPT = `
TASK: Phân tích hồ sơ học sinh theo mô hình Holland RIASEC và gợi ý top 5 ngành nghề cá nhân hóa.

INPUT DATA:
- Survey Answers (Phase 1 - RIASEC): {answers}
- RIASEC Scores: {riasecScores}
- Holland Code (top 3 groups): {hollandCode}
- Phase 2 Context (ARCS + External Factors): {phase2Answers}
- Academic Profile: {academic}
- Target Careers DB: {careersDb}

RIASEC GROUPS:
- R (Realistic): Thực tế, kỹ thuật, tay chân — Kỹ sư, Nông nghiệp, Cơ khí
- I (Investigative): Phân tích, nghiên cứu, khoa học — Khoa học, CNTT, Y tế
- A (Artistic): Sáng tạo, nghệ thuật, biểu đạt — Thiết kế, Truyền thông, Nghệ thuật
- S (Social): Hỗ trợ, giao tiếp, giảng dạy — Giáo dục, Y tế xã hội, Tư vấn
- E (Enterprising): Lãnh đạo, kinh doanh, thuyết phục — Quản trị, Marketing, Khởi nghiệp
- C (Conventional): Quy trình, tổ chức, dữ liệu — Kế toán, Hành chính, Tài chính

OUTPUT FORMAT (JSON only, no markdown):
{
  "archetype": "string - Tên hình mẫu dựa trên Holland Code (vd: Nhà Khoa Học Sáng Tạo - IA)",
  "hollandCode": "string - 3 chữ cái mã Holland (vd: RIA, SAE, ...)",
  "description": "string - Mô tả 2-3 câu chi tiết về điểm mạnh dựa trên RIASEC",
  "suitabilityScore": "number (70-99)",
  "analysisReasoning": {
    "riasecProfile": "mô tả ngắn điểm mạnh của từng nhóm cao điểm",
    "personalityStrengths": ["strength1", "strength2"],
    "externalFactors": "nhận xét về ảnh hưởng gia đình/xã hội từ Phase 2",
    "motivationLevel": "đánh giá động lực nội tại từ ARCS",
    "skillGaps": ["gap1", "gap2"],
    "marketDemand": "nhận xét thị trường VN hiện tại"
  },
  "careers": [
    {
      "title": "string",
      "description": "string - vai trò cụ thể",
      "salary": "string - VNĐ + USD",
      "growth": "string - %/year",
      "skills": ["skill1", "skill2"],
      "suitability": "number (70-99)",
      "category": "string",
      "hollandMatch": "string - nhóm RIASEC tương ứng",
      "marketDemand": "number (1-10 - current demand in VN market)",
      "roadmap": [
        {
          "phase": "Giai đoạn 1",
          "title": "string",
          "duration": "string",
          "description": "string",
          "skillsToAcquire": ["skill1"],
          "resources": ["resource URL or book"]
        }
      ]
    }
  ],
  "insights": "string - Lời khuyên chiến lược, có đề cập đến mâu thuẫn nếu Congruence thấp",
  "nextSteps": ["action1", "action2", "action3"]
}

ANALYSIS FRAMEWORK (Holland RIASEC):
1. Tính tổng điểm 6 nhóm RIASEC từ {riasecScores} (mỗi nhóm 5 câu, thang 1-5 hoặc 0-2)
2. Xác định Holland Code = 3 nhóm có điểm cao nhất (vd: IAS)
3. Đọc Phase 2: kiểm tra Congruence — nếu sở thích mâu thuẫn với áp lực gia đình, ghi chú trong insights
4. Đọc ARCS: Attention (q35), Relevance (q36), Confidence (q37), Satisfaction (q38) để đo lường động lực
5. Cross-reference Holland Code với {careersDb} và gợi ý nghề phù hợp nhất
6. Ưu tiên sự phù hợp (Congruence) cao — người có congruence cao thường hạnh phúc và thành công hơn
7. Nếu Confidence (q37) thấp nhưng sở thích cao: Động viên và chỉ lộ trình phát triển năng lực

CONFIDENCE RULES:
- Nếu suitabilityScore < 75: Thêm "Hãy cũng cân nhắc..." trong insights
- Nếu Phase 2 phát hiện áp lực gia đình mâu thuẫn sở thích: Thêm ghi chú tư vấn trong insights
- Nếu ARCS Confidence thấp: Nhấn mạnh lộ trình phát triển và các bước nhỏ để tăng self-efficacy
`;

const CHAT_PROMPT_TEMPLATE = `
SYSTEM CONTEXT:
${SYSTEM_ROLES.CHAT_ADVISOR}

USER PROFILE:
- Name: {userName}
- School: {school}
- Grade: {grade}
- Previous Assessment: {assessmentResult}
- Main Interest: {majorInterest}
- Recent Conversation Tone: {conversationTone}

CONVERSATION HISTORY:
{chatHistory}

USER'S LATEST MESSAGE:
{userMessage}

RESPONSE GUIDELINES:
1. Acknowledge their message + show you understand
2. Provide 1-2 specific insights/suggestions
3. Ask 1 follow-up question to deepen understanding
4. Offer concrete next action or resource
5. Keep tone encouraging and realistic

LENGTH: 200-350 words
FORMAT: Use markdown (bold for emphasis, bullet points for lists)
`;

const SKILL_GAP_ANALYSIS_PROMPT = `
TASK: Identify skill gaps and create personalized learning plan.

INPUT:
- Target Career: {targetCareer}
- Current Skills: {currentSkills}
- Academic Level: {academicLevel}
- Time Available: {timelineMonths}
- Learning Style: {learningStyle}

OUTPUT (JSON):
{
  "targetCareer": "string",
  "currentSkillLevel": "number (1-10)",
  "requiredSkillLevel": "number (1-10)",
  "majorGaps": ["gap1 - priority", "gap2 - priority"],
  "learningPlan": [
    {
      "skillName": "string",
      "currentLevel": "number (1-10)",
      "targetLevel": "number (1-10)",
      "timelineWeeks": "number",
      "resources": ["URL", "book", "course"],
      "milestones": ["milestone1", "milestone2"],
      "estimatedCost": "VNĐ or free"
    }
  ],
  "estimatedTimeToReady": "X months",
  "strugglingRisks": ["risk1", "risk2"],
  "motivationTips": ["tip1", "tip2"],
  "alternativePathways": ["path1", "path2"]
}
`;

const UNIVERSITY_RECOMMENDATION_PROMPT = `
TASK: Recommend universities matching student profile and career path.

INPUT:
- Student Profile: {studentProfile}
- Career Interest: {careerInterest}
- Academic Performance: {academicScores}
- Available Universities: {universitiesDb}

OUTPUT (JSON):
{
  "recommendations": [
    {
      "universityName": "string",
      "matchScore": "number (70-99)",
      "programs": ["program1", "program2"],
      "strengths": ["strength1", "strength2"],
      "industry": "string - top recruiters",
      "tuitionApprox": "VNĐ",
      "scholarshipChance": "percentage",
      "careerOutcome": "average_salary - employment_rate",
      "applicationTips": "specific advice"
    }
  ],
  "disclaimer": "Based on {data_source} database"
}
`;

/**
 * Generate structured prompt with validation
 */
const buildPrompt = (template, variables) => {
  let prompt = template;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(
      new RegExp(placeholder, 'g'),
      typeof value === 'string' ? value : JSON.stringify(value)
    );
  });
  return prompt;
};

/**
 * Few-shot examples for better accuracy
 */
const FEW_SHOT_EXAMPLES = {
  CAREER_RECOMMENDATION: `
EXAMPLE 1 — Holland Code: RIE (Kỹ thuật + Nghiên cứu + Kinh doanh):
Input: R=22, I=20, A=8, S=10, E=18, C=12 → Code: RIE
Output Excerpt: {
  "archetype": "Kỹ Sư Doanh Nhân — RIE",
  "hollandCode": "RIE",
  "careers": ["Software Architect", "AI Engineer", "CTO / Technical Co-founder"],
  "insights": "Bạn kết hợp tư duy kỹ thuật chắc chắn với khả năng phân tích khoa học và bản lĩnh dẫn dắt. Đây là bộ ba hiếm có trong giới startup công nghệ..."
}

EXAMPLE 2 — Holland Code: ASE (Sáng tạo + Xã hội + Kinh doanh):
Input: R=9, I=11, A=23, S=20, E=17, C=7 → Code: ASE
Output Excerpt: {
  "archetype": "Nhà Sáng Tạo Kết Nối — ASE",
  "hollandCode": "ASE",
  "careers": ["UX/UI Designer", "Creative Director", "Brand Strategist"],
  "insights": "Bạn sở hữu tư duy thẩm mỹ nhạy bén cùng khả năng đồng cảm và truyền thông xuất sắc. Các ngành thiết kế lấy con người làm trung tâm (Human-centered Design) rất phù hợp..."
}

EXAMPLE 3 — Holland Code: SIE (Xã hội + Nghiên cứu + Kinh doanh):
Input: R=8, I=19, A=12, S=24, E=16, C=9 → Code: SIE
Output Excerpt: {
  "archetype": "Nhà Khoa Học Nhân Văn — SIE",
  "hollandCode": "SIE",
  "careers": ["Educational Psychologist", "Product Manager (EdTech)", "Medical Researcher"],
  "insights": "Bạn có trái tim của người muốn giúp đỡ xã hội nhưng được vũ trang bằng tư duy phân tích sâu và tầm nhìn kinh doanh. Ngành giáo dục, y tế hoặc social enterprise là mảnh đất màu mỡ..."
}
`
};

module.exports = {
  SYSTEM_ROLES,
  CAREER_RECOMMENDATION_PROMPT,
  CHAT_PROMPT_TEMPLATE,
  SKILL_GAP_ANALYSIS_PROMPT,
  UNIVERSITY_RECOMMENDATION_PROMPT,
  FEW_SHOT_EXAMPLES,
  buildPrompt
};
