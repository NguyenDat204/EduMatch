const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  } catch (err) {
    console.warn("Failed to initialize GoogleGenerativeAI client:", err.message);
  }
}

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
 * AI Recommendation Generator
 */
const getCareerRecommendations = async (userData) => {
  const answers = userData.answers || {};
  const academic = userData.academicProfile || userData.academicInfo || {};
  const schoolSubjects = academic.subjects || {};
  
  // Try to use Gemini model if api key is set
  if (genAI) {
    const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    
    for (const modelName of modelNames) {
      try {
        console.log(`Attempting analysis with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
          Bạn là một chuyên gia hướng nghiệp hàng đầu thế giới. Hãy phân tích thông tin chi tiết sau đây của học sinh cấp 3 để đưa ra gợi ý nghề nghiệp cá nhân hóa chất lượng cao:
          
          1. Câu trả lời khảo sát tính cách và sở thích: ${JSON.stringify(answers)}
          2. Hồ sơ học tập (Trường, khối, điểm số học tập): ${JSON.stringify(academic)}
          3. Kỹ năng tự đánh giá: ${JSON.stringify(userData.skillEvaluation || {})}

          Dựa trên những thông tin này, hãy lập luận logic chặt chẽ (personality-matching, skill-matching, academic-matching) và đưa ra top 4-5 ngành nghề phù hợp nhất.
          Trả về kết quả dưới dạng JSON (không bao gồm bất kỳ văn bản giải thích nào ngoài khối JSON, không định dạng markdown \`\`\`json ở ngoài) có cấu trúc chính xác như sau:
          {
            "archetype": "Tên hình mẫu nghề nghiệp nổi bật nhất (ví dụ: Nhà Phân Tích Logic, Người Kiến Tạo Công Nghệ, Nhà Sáng Tạo Nghệ Thuật)",
            "description": "Mô tả chi tiết và sâu sắc dài 2-3 câu về đặc điểm nổi bật, thế mạnh tự nhiên của hình mẫu này.",
            "suitabilityScore": 92,
            "careers": [
              {
                "title": "Tên nghề nghiệp cụ thể (ví dụ: Software Architect)",
                "description": "Mô tả cụ thể vai trò của nghề này.",
                "salary": "Mức lương ước tính (ví dụ: $120k - $180k hoặc 30 - 50 triệu VNĐ)",
                "growth": "Tiềm năng phát triển (ví dụ: Rất cao (+22%))",
                "skills": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3"],
                "suitability": 95,
                "category": "Lĩnh vực (ví dụ: Công nghệ, Thiết kế, Kinh doanh)",
                "roadmap": [
                  {
                    "phase": "Giai đoạn 1",
                    "title": "Tên giai đoạn phát triển (ví dụ: Nền tảng học tập)",
                    "duration": "Khoảng thời gian (ví dụ: 1-2 năm)",
                    "description": "Nội dung cần tập trung thực hiện.",
                    "skillsToAcquire": ["Skill A", "Skill B"]
                  }
                ]
              }
            ],
            "insights": "Lời khuyên chiến lược chân thành, truyền cảm hứng sâu sắc từ chuyên gia AI giúp học sinh bứt phá trong việc rèn luyện học tập và chọn ngành."
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        console.log("Gemini response received");
        
        // Clean markdown blocks if any
        if (text.includes("```json")) {
          text = text.split("```json")[1].split("```")[0];
        } else if (text.includes("```")) {
          text = text.split("```")[1].split("```")[0];
        }
        
        const cleanedText = text.trim();
        return JSON.parse(cleanedText);
      } catch (err) {
        console.warn(`Gemini recommended analysis model ${modelName} failed:`, err.message);
      }
    }
  }

  // DETerMINISTIC RULE-BASED FALLBACK (Stunning, complete and intelligent)
  console.log("Using local advanced recommendation engine fallback...");
  
  // Calculate specific scores based on survey answers and academic grades
  // Look at survey questions to score domains: Creative, Technical, Business, Design
  let techScore = 50;
  let creativeScore = 40;
  let businessScore = 45;
  
  // High-fidelity 15-question mapping heuristic
  Object.entries(answers).forEach(([qId, val]) => {
    // Block 1: Tech & Academic
    if (qId === 'q1' && val === 'Rất yêu thích') { techScore += 15; }
    if (qId === 'q2') { techScore += Number(val) * 3; }
    if (qId === 'q3') { techScore += Number(val) * 3; }
    if (qId === 'q4') { techScore += Number(val) * 2; }
    if (qId === 'q5' && val === 'Rất tò mò') { techScore += 10; }

    // Block 2: Creative & Analytical
    if (qId === 'q6' && val === 'Đó là đam mê của tôi') { creativeScore += 25; }
    if (qId === 'q7') { creativeScore += Number(val) * 4; }
    if (qId === 'q8') { techScore += Number(val) * 2; businessScore += Number(val) * 2; }
    if (qId === 'q9' && val === 'Rất tò mò') { techScore += 10; }
    if (qId === 'q10') { businessScore += Number(val) * 2; }

    // Block 3: Soft Skills & Adaptability
    if (qId === 'q11' && val === 'Luôn sẵn sàng dẫn dắt') { businessScore += 20; }
    if (qId === 'q12') { creativeScore += Number(val) * 2; businessScore += Number(val) * 2; }
    if (qId === 'q13' && val === 'Rất thích giúp đỡ') { businessScore += 10; creativeScore += 10; }
    if (qId === 'q14') { creativeScore += Number(val) * 2; }
    if (qId === 'q15') { businessScore += Number(val) * 2; }
  });

  // Basic heuristic using grades
  const math = Number(schoolSubjects.math || 8.0);
  const english = Number(schoolSubjects.english || 8.0);
  const physics = Number(schoolSubjects.physics || 8.0);
  
  if (math >= 8.5) { techScore += 10; }
  if (english >= 8.5) { businessScore += 10; creativeScore += 5; }
  if (physics >= 8.5) { techScore += 5; }

  // Select suitable careers and sort by calculated compatibility
  let matchedCareers = [...PRESETS.careers];
  matchedCareers = matchedCareers.map(c => {
    let suitability = 75;
    if (c.category === "Công nghệ") suitability = Math.min(99, Math.round(techScore));
    if (c.category === "Trí tuệ nhân tạo") suitability = Math.min(99, Math.round(techScore * 0.95 + 5));
    if (c.category === "Thiết kế") suitability = Math.min(99, Math.round(creativeScore));
    if (c.category === "Quản lý & Kinh doanh") suitability = Math.min(99, Math.round(businessScore));
    return { ...c, suitability };
  }).sort((a, b) => b.suitability - a.suitability);

  // Formulate the archetype based on top scores
  let archetype = "Nhà Kỹ Thuật Đa Tài";
  let description = "Bạn có khả năng giải quyết các vấn đề kỹ thuật và logic cực tốt kết hợp tư duy khoa học cao.";
  let insights = "Hãy tiếp tục trau dồi các môn tự nhiên và bắt đầu tham gia các dự án lập trình thực tế để phát triển bản thân sớm nhất!";

  if (creativeScore > techScore && creativeScore > businessScore) {
    archetype = "Nhà Sáng Tạo Nghệ Thuật & Trải Nghiệm";
    description = "Bạn sở hữu tư duy thẩm mỹ nhạy bén, khả năng đồng cảm sâu sắc với người dùng và thích tự do thiết kế các ý tưởng độc đáo.";
    insights = "Tập trung xây dựng portfolio cá nhân bằng các công cụ như Figma, học vẽ phác thảo và tìm hiểu tâm lý học hành vi người dùng.";
  } else if (businessScore > techScore && businessScore > creativeScore) {
    archetype = "Nhà Lãnh Đạo Chiến Lược";
    description = "Bạn năng động, giao tiếp tốt, thích dẫn dắt đội ngũ và có tư duy tổ chức công việc kinh doanh vô cùng nhạy bén.";
    insights = "Tìm kiếm các câu lạc bộ đội nhóm ở trường cấp 3, rèn luyện kỹ năng nói trước đám đông và tìm hiểu kiến thức kinh doanh cơ bản.";
  }

  const suitabilityScore = Math.max(82, Math.round(matchedCareers[0].suitability));

  return {
    archetype,
    description,
    suitabilityScore,
    careers: matchedCareers,
    insights
  };
};

/**
 * AI Chat Advisor context-aware helper
 */
const getChatResponse = async (chatHistory, userProfile) => {
  const profileContext = userProfile ? `
    Hồ sơ học sinh đang nhắn tin với bạn:
    - Họ và tên: ${userProfile.name}
    - Email: ${userProfile.email}
    - Trường học: ${userProfile.academicInfo?.school || "Chưa cập nhật"}
    - Lớp học: ${userProfile.academicInfo?.grade || "12"}
    - Ngành nghề quan tâm chính: ${userProfile.academicInfo?.majorInterest || "Chưa cập nhật"}
    - Kết quả kiểm tra hướng nghiệp: ${userProfile.personalityTest?.archetype ? `Hình mẫu: ${userProfile.personalityTest.archetype} (Điểm phù hợp: ${userProfile.personalityTest.suitabilityScore}%)` : "Chưa làm khảo sát hướng nghiệp"}
    - Điểm các môn tự học chính: Toán (${userProfile.academicInfo?.subjects?.math || 8.0}), Lý (${userProfile.academicInfo?.subjects?.physics || 8.0}), Anh (${userProfile.academicInfo?.subjects?.english || 8.0})
  ` : "Thông tin học sinh: Không có (vui lòng tư vấn hướng nghiệp tổng quan)";

  const lastMessage = chatHistory[chatHistory.length - 1].content;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Bạn là một chuyên gia Tư Vấn Hướng Nghiệp AI tên là "EduMatch AI Advisor" dành riêng cho học sinh trung học phổ thông (cấp 3) tại Việt Nam.
        Mục tiêu của bạn là lắng nghe, thấu hiểu, động viên và hướng dẫn học sinh chọn ngành nghề, chọn trường học và lên lộ trình học tập phù hợp.
        
        Dưới đây là thông tin ngữ cảnh của học sinh để giúp bạn cá nhân hóa câu trả lời:
        ${profileContext}

        Lịch sử cuộc hội thoại:
        ${chatHistory.slice(0, -1).map(h => `${h.role === 'user' ? 'Học sinh' : 'AI Advisor'}: ${h.content}`).join("\n")}
        Học sinh: ${lastMessage}

        Hãy trả lời bằng Tiếng Việt một cách chân thành, chuyên nghiệp, thông thái nhưng gần gũi như một người anh/chị đi trước. 
        Nếu câu hỏi nằm ngoài chủ đề định hướng nghề nghiệp, tuyển sinh đại học hoặc kỹ năng học tập, hãy khéo léo nhắc nhở học sinh tập trung vào mục tiêu hướng nghiệp.
        Hãy cấu trúc câu trả lời rõ ràng (dùng gạch đầu dòng, định dạng markdown đẹp mắt).
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.warn("Gemini Chat failed:", err.message);
    }
  }

  // INTELlIGENT DETERMINISTIC FALLBACK CHAT RESPONSES
  console.log("Using local fallback advisor chat agent...");
  const msg = lastMessage.toLowerCase();
  
  let responseText = `Chào bạn! Mình là **EduMatch AI Advisor**. Cảm ơn câu hỏi định hướng của bạn. `;
  
  if (userProfile && userProfile.name) {
    responseText += `Chào **${userProfile.name}**, dựa trên kết quả học tập tại trường **${userProfile.academicInfo?.school || 'THPT'}** của bạn, `;
  }

  if (msg.includes("hello") || msg.includes("xin chào") || msg.includes("hi")) {
    responseText += `mình rất sẵn lòng giúp bạn giải đáp các thắc mắc về lựa chọn ngành học, tìm hiểu các trường đại học tốt nhất (như Stanford, FPT University) hoặc lên kế hoạch rèn luyện các kỹ năng còn thiếu. Bạn có muốn bắt đầu bằng việc thảo luận về sở thích hay học lực hiện tại không?`;
  } else if (msg.includes("lập trình") || msg.includes("công nghệ") || msg.includes("it") || msg.includes("phần mềm") || msg.includes("ai")) {
    responseText += `ngành **Công nghệ thông tin & Khoa học máy tính** là sự lựa chọn tuyệt vời. 
    
    Với điểm môn Toán của bạn đang ở mức khá tốt, bạn có nền tảng tư duy logic vững vàng.
    
    **Định hướng khuyên dùng cho bạn:**
    1. **Software Architect**: Phù hợp nếu bạn thích thiết kế cấu trúc hệ thống lớn.
    2. **AI Engineer**: Phù hợp nếu bạn mê nghiên cứu thuật toán thông minh và Big Data.
    
    **Trường đại học đào tạo nổi bật:**
    - **Đại học FPT**: Chương trình học thực tế, liên kết doanh nghiệp tốt, cơ hội việc làm toàn cầu cao.
    - **Đại học Bách Khoa**: Định hướng nghiên cứu học thuật sâu sắc.
    
    Bạn có muốn mình giải thích chi tiết hơn về lộ trình tự học lập trình ngay từ cấp 3 không?`;
  } else if (msg.includes("thiết kế") || msg.includes("nghệ thuật") || msg.includes("designer") || msg.includes("figma")) {
    responseText += `lĩnh vực **UX/UI Design & Thiết kế đồ họa** rất rộng mở. Công việc này đòi hỏi sự kết hợp hài hòa giữa óc thẩm mỹ và khả năng phân tích tâm lý người dùng.
    
    **Lời khuyên từ AI:**
    - Bạn nên bắt đầu làm quen sớm với công cụ **Figma** (hoàn toàn miễn phí cho học sinh).
    - Tạo một tài khoản trên Behance/Dribbble để tham khảo các thiết kế đẹp và tự học cách phân tích bố cục.
    - Rèn luyện kỹ năng thấu cảm bằng cách quan sát các ứng dụng xung quanh xem có điểm nào gây bất tiện khi sử dụng hay không.
    
    Bạn có tò mò về sự khác biệt giữa thiết kế mỹ thuật truyền thống và thiết kế trải nghiệm người dùng kỹ thuật số không?`;
  } else if (msg.includes("ngành gì") || msg.includes("chọn ngành") || msg.includes("tư vấn")) {
    if (userProfile && userProfile.personalityTest?.archetype) {
      responseText += `hiện tại hình mẫu hướng nghiệp của bạn là **${userProfile.personalityTest.archetype}**. Đây là nhóm người có ưu thế rất lớn về tư duy chiến lược và thực thi tốt. 
      
      Các ngành nghề có độ tương thích cao nhất với bạn gồm: **Software Architect**, **Data Scientist**, và **AI Engineer**. Bạn đã từng tìm hiểu qua công việc cụ thể của các ngành này chưa?`;
    } else {
      responseText += `để đưa ra gợi ý ngành chính xác nhất, mình khuyên bạn hãy làm **Khảo sát hướng nghiệp 10 câu hỏi** trên thanh Menu để AI lập bản đồ tính cách cho bạn trước nhé! Điều đó giúp mình hiểu được bạn thuộc nhóm kỹ năng/sở thích nào để đưa ra gợi ý sát sườn nhất.`;
    }
  } else {
    responseText += `câu hỏi định hướng của bạn rất thú vị. Bạn có thể cho mình biết rõ hơn về những việc bạn thích làm trong thời gian rảnh rỗi hoặc môn học nào ở trường khiến bạn cảm thấy hào hứng nhất không? Điều này sẽ giúp mình cùng bạn gỡ rối dễ dàng hơn!`;
  }

  return responseText;
};

module.exports = {
  getCareerRecommendations,
  getChatResponse
};
