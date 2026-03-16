const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "", { apiVersion: 'v1' });

const getCareerRecommendations = async (userData) => {
  // Broad model list to find one that works
  const modelNames = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
  ];

  let lastError = null;

  for (const modelName of modelNames) {
    try {
      console.log(`Attempting analysis with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        Bạn là một chuyên gia hướng nghiệp. Hãy phân tích thông tin sau đây của học sinh:
        Sở thích/Tính cách: ${JSON.stringify(userData.answers)}
        Hồ sơ học tập: ${JSON.stringify(userData.academicProfile || {})}

        Dựa trên thông tin này, hãy đưa ra top 5 ngành nghề phù hợp nhất.
        Trả về kết quả dưới dạng JSON (không bao gồm text giải thích bên ngoài JSON) có cấu trúc như sau:
        {
          "archetype": "Tên hình mẫu nghề nghiệp (ví dụ: Người sáng tạo, Nhà phân tích)",
          "description": "Mô tả ngắn gọn về đặc điểm nổi bật của người này",
          "suitabilityScore": 95,
          "careers": [
            {
              "title": "Tên nghề nghiệp",
              "description": "Mô tả nghề nghiệp",
              "salary": "Mức lương ước tính",
              "growth": "Tiềm năng phát triển",
              "skills": ["Kỹ năng 1", "Kỹ năng 2"],
              "suitability": 90,
              "category": "Lĩnh vực"
            }
          ],
          "insights": "Một lời khuyên ngắn gọn từ AI"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`AI Success with model: ${modelName}`);

      // Attempt to parse JSON
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
      } catch (parseErr) {
        console.error(`JSON Parse Error for model ${modelName}:`, text);
        throw new Error("AI returned invalid JSON format");
      }
    } catch (err) {
      console.warn(`Model ${modelName} failed:`, err.message);
      lastError = err;
      // If it's a 404 or unsupported model, try the next one
      if (err.message.includes("404") || err.message.includes("not found") || err.message.includes("not supported")) {
        continue;
      }
      // If it's a different error (like Auth), stop early
      throw err;
    }
  }

  console.error("All AI models failed.");
  throw lastError || new Error("Could not get career recommendations from any AI model.");
};

module.exports = { getCareerRecommendations };
