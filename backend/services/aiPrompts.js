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
TASK: Phân tích hồ sơ học sinh và gợi ý top 5 ngành nghề cá nhân hóa.

INPUT DATA:
- Survey Answers: {answers}
- Academic Profile: {academic}
- Skill Evaluation: {skills}
- Target Careers DB: {careersDb}

OUTPUT FORMAT (JSON only, no markdown):
{
  "archetype": "string - Hình mẫu nổi bật nhất",
  "description": "string - Mô tả 2-3 câu chi tiết về điểm mạnh",
  "suitabilityScore": "number (70-99)",
  "analysisReasoning": {
    "personalityStrengths": ["strength1", "strength2"],
    "academicAlignment": "explanation",
    "skillGaps": ["gap1", "gap2"],
    "marketDemand": "current market context"
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
  "insights": "string - Lời khuyên chiến lược chân thành, truyền cảm hứng",
  "nextSteps": ["action1", "action2", "action3"]
}

ANALYSIS FRAMEWORK:
1. Calculate Technical Score: Survey Q1-Q5, Math grade
2. Calculate Creative Score: Survey Q6-Q9, Design interest
3. Calculate Business Score: Survey Q10-Q15, Leadership signals
4. Cross-reference with {careersDb} for market fit
5. Rank by combined score: (Tech×0.4 + Creative×0.3 + Business×0.3) × Market Demand
6. Verify recommendations make logical sense (not random)

CONFIDENCE RULES:
- If suitabilityScore < 75: Add "Consider also exploring..." in insights
- If high uncertainty: Suggest taking supplementary assessment
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
EXAMPLE 1:
Input: Student strong in Math (9.5), Physics (9.0), enjoys problem-solving, score: Tech=85, Creative=30, Business=40
Output Excerpt: {
  "archetype": "Nhà Kỹ Thuật Sáng Tạo",
  "careers": ["Software Architect", "AI Engineer", "Systems Architect"],
  "insights": "Bạn có nền tảng logic cực mạnh..."
}

EXAMPLE 2:
Input: Student strong in Literature (9.2), Art interest, enjoys design, score: Tech=45, Creative=88, Business=50
Output Excerpt: {
  "archetype": "Nhà Sáng Tạo Thiết Kế",
  "careers": ["UX/UI Designer", "Product Designer", "Creative Director"],
  "insights": "Bạn sở hữu tư duy thẩm mỹ nhạy bén..."
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
