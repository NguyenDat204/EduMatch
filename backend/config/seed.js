const mongoose = require("mongoose");
const User = require("../models/User");
const Career = require("../models/Career");
const University = require("../models/University");
const Article = require("../models/Article");
const SurveyQuestion = require("../models/SurveyQuestion");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const seedDatabase = async () => {
  try {
    // Check if careers exist, if not seed
    const careerCount = await Career.countDocuments();
    if (careerCount === 0) {
      console.log("Seeding careers...");
      await Career.create([
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
          category: "Công nghệ",
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
          category: "Kinh doanh",
          roadmap: [
            { phase: "Giai đoạn 1", title: "Kiến thức cơ bản về sản phẩm & Thị trường", duration: "1 năm", description: "Học cách phân tích đối thủ cạnh tranh, nghiên cứu nhu cầu thị trường và thấu hiểu hành vi người dùng.", skillsToAcquire: ["Market Analysis", "User empathy", "Basic Tech concepts"] },
            { phase: "Giai đoạn 2", title: "Quản lý dự án Agile & Giao tiếp nhóm", duration: "1-2 năm", description: "Học quy trình Scrum/Agile, cách định vị lộ trình phát triển sản phẩm (Product Roadmap) và viết yêu cầu tính năng (PRDs).", skillsToAcquire: ["Agile/Scrum", "Product Roadmap", "Jira", "Wireframing"] },
            { phase: "Giai đoạn 3", title: "Chiến lược tăng trưởng & Phân tích kinh doanh", duration: "2 năm", description: "Định hình giá cả, phân tích các chỉ số tăng trưởng sản phẩm (KPIs, AARRR metric) và lãnh đạo liên chức năng.", skillsToAcquire: ["Product Metrics", "Growth Hacking", "Strategic Planning", "Negotiation"] }
          ]
        }
      ]);
      console.log("Careers seeded successfully.");
    }

    // Check if universities exist, if not seed
    const uniCount = await University.countDocuments();
    if (uniCount === 0) {
      console.log("Seeding universities...");
      await University.create([
        {
          name: "Đại học FPT (FPT University)",
          location: "Hà Nội, Việt Nam",
          ranking: "#1 Về Công nghệ tại Việt Nam",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/FPT_Education_logo.svg/1200px-FPT_Education_logo.svg.png",
          programs: ["Kỹ thuật phần mềm", "Trí tuệ nhân tạo", "Thiết kế mỹ thuật số", "Kinh doanh quốc tế"],
          website: "https://fpt.edu.vn"
        },
        {
          name: "Stanford University",
          location: "Stanford, CA, USA",
          ranking: "#3 Toàn cầu (QS Rankings)",
          logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Stanford_University_seal_2003.svg/1200px-Stanford_University_seal_2003.svg.png",
          programs: ["Computer Science", "Artificial Intelligence", "Management Science", "Visual Design"],
          website: "https://stanford.edu"
        },
        {
          name: "Đại học Bách Khoa Hà Nội (HUST)",
          location: "Hà Nội, Việt Nam",
          ranking: "#1 Đại học Kỹ thuật lâu đời tại VN",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/FPT_Education_logo.svg/1200px-FPT_Education_logo.svg.png", // fallback image
          programs: ["Khoa học máy tính", "Kỹ thuật điều khiển & Tự động hóa", "Điện tử viễn thông"],
          website: "https://hust.edu.vn"
        }
      ]);
      console.log("Universities seeded successfully.");
    }

    // Check if articles exist, if not seed
    const articleCount = await Article.countDocuments();
    if (articleCount === 0) {
      console.log("Seeding articles...");
      await Article.create([
        {
          title: "Xu hướng phát triển Trí tuệ Nhân tạo năm 2026",
          content: "Sự phát triển đột phá của Trí tuệ nhân tạo (AI) trong năm 2026 đang mở ra hàng triệu cơ hội nghề nghiệp mới. Kỹ sư AI và chuyên gia phân tích dữ liệu trở thành những vị trí săn đón hàng đầu. Trải qua các làn sóng công nghệ, việc nắm bắt tư duy lập trình và sử dụng các mô hình ngôn ngữ lớn (LLM) là kỹ năng cốt lõi giúp các học sinh bứt phá trong tương lai gần.",
          author: "EduMatch AI Guide",
          readTime: "5 phút đọc",
          category: "Công nghệ & Xu hướng",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Lộ trình học Lập trình hiệu quả dành cho Học sinh cấp 3",
          content: "Để bắt đầu con đường lập trình, học sinh THPT nên học ngôn ngữ nào trước? Bài viết này hướng dẫn chi tiết từ việc rèn luyện thuật toán cơ bản bằng Python, xây dựng giao diện web bằng HTML/CSS/JS đến thiết kế các dự án phần mềm thực tế. Tự học và thực thi liên tục là chìa khóa vàng giúp bạn tích lũy portfolio đắt giá ngay từ khi còn ngồi trên ghế nhà trường.",
          author: "Nguyễn Văn Vy (Software Architect)",
          readTime: "7 phút đọc",
          category: "Bí quyết học tập",
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Cách xây dựng Portfolio thiết kế cực đỉnh để săn Học bổng",
          content: "Đối với học sinh mong muốn thi tuyển vào ngành Thiết kế mỹ thuật số, UX/UI Design, portfolio cá nhân chính là bộ mặt đại diện. Bài viết hướng dẫn cách đóng gói dự án thiết kế từ ý tưởng phác thảo tay đến thành phẩm chỉnh chu trên Figma, kèm theo lời khuyên viết bài phân tích tư duy thiết kế (Case Study) gây ấn tượng mạnh với hội đồng tuyển sinh.",
          author: "Trần Hạnh Nguyên (UX Specialist)",
          readTime: "4 phút đọc",
          category: "Hướng nghiệp thiết kế",
          image: "https://images.unsplash.com/photo-1541462608141-2ffb68df685e?auto=format&fit=crop&w=800&q=80"
        }
      ]);
      console.log("Articles seeded successfully.");
    }

    const questionCount = await SurveyQuestion.countDocuments();
    if (questionCount === 0) {
      console.log("Seeding survey questions (RIASEC + ARCS framework)...");
      await SurveyQuestion.create([
        // ===== GIAI ĐOẠN 1: RIASEC — NHÓM R (Realistic) — Câu 1-5 =====
        {
          questionId: 'q1',
          text: 'Bạn thích tự tay lập kế hoạch, thiết kế và xây dựng thứ gì đó (như lắp ráp mô hình, hàn điện, làm đồ thủ công)?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'R',
          phase: 1,
          order: 1
        },
        {
          questionId: 'q2',
          text: 'Bạn thích sử dụng các công cụ như tua vít, kìm, cờ lê để tự tay sửa chữa đồ vật hư hỏng?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'R',
          phase: 1,
          order: 2
        },
        {
          questionId: 'q3',
          text: 'Bạn có muốn tìm hiểu cách sửa chữa thiết bị điện trong nhà (quạt, đèn, ổ cắm) khi chúng hỏng?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'R',
          phase: 1,
          order: 3
        },
        {
          questionId: 'q4',
          text: 'Bạn có thích tìm hiểu về canh tác nông nghiệp, ví dụ cách sử dụng phân bón để tăng năng suất cây trồng?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'R',
          phase: 1,
          order: 4
        },
        {
          questionId: 'q5',
          text: 'Bạn cảm thấy hứng khởi khi vận hành, lắp đặt hoặc tìm hiểu nguyên lý hoạt động của các thiết bị điện tử, máy móc?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'R',
          phase: 1,
          order: 5
        },
        // ===== GIAI ĐOẠN 1: RIASEC — NHÓM I (Investigative) — Câu 6-10 =====
        {
          questionId: 'q6',
          text: 'Bạn thích làm việc độc lập để nghiên cứu, phân tích một vấn đề hơn là chờ người khác hướng dẫn?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'I',
          phase: 1,
          order: 6
        },
        {
          questionId: 'q7',
          text: 'Bạn thích giải các bài toán khó, câu đố logic hoặc các vấn đề khoa học phức tạp?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'I',
          phase: 1,
          order: 7
        },
        {
          questionId: 'q8',
          text: 'Bạn có quan tâm đến việc nghiên cứu bệnh lý trên động thực vật hoặc tìm hiểu cơ chế sinh học để điều trị?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'I',
          phase: 1,
          order: 8
        },
        {
          questionId: 'q9',
          text: 'Bạn có thấy thú vị khi tìm hiểu về cách hoạt động của hệ thống pháp luật, cách tranh tụng, hay tư duy biện chứng?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'I',
          phase: 1,
          order: 9
        },
        {
          questionId: 'q10',
          text: 'Bạn có thường xuyên quan sát sự vật xung quanh, đặt câu hỏi "tại sao?" và muốn tìm hiểu sâu về nguyên nhân?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'I',
          phase: 1,
          order: 10
        },
        // ===== GIAI ĐOẠN 1: RIASEC — NHÓM A (Artistic) — Câu 11-15 =====
        {
          questionId: 'q11',
          text: 'Bạn thích vẽ tranh, tô màu, điêu khắc hoặc làm thủ công mỹ nghệ như một cách tự biểu đạt?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'A',
          phase: 1,
          order: 11
        },
        {
          questionId: 'q12',
          text: 'Bạn thích học chơi nhạc cụ, ca hát hoặc thưởng thức và phân tích các tác phẩm âm nhạc?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'A',
          phase: 1,
          order: 12
        },
        {
          questionId: 'q13',
          text: 'Bạn thích thể hiện bản thân qua diễn kịch, múa, nhiếp ảnh hoặc các loại hình nghệ thuật thị giác?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'A',
          phase: 1,
          order: 13
        },
        {
          questionId: 'q14',
          text: 'Bạn có hứng thú với việc thiết kế thời trang, trang trí nội thất hoặc tạo ra những sản phẩm mang dấu ấn thẩm mỹ cá nhân?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'A',
          phase: 1,
          order: 14
        },
        {
          questionId: 'q15',
          text: 'Bạn thích giải trí và mang lại niềm vui cho mọi người qua biểu diễn, kể chuyện hoặc sáng tác nội dung sáng tạo?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'A',
          phase: 1,
          order: 15
        },
        // ===== GIAI ĐOẠN 1: RIASEC — NHÓM S (Social) — Câu 16-20 =====
        {
          questionId: 'q16',
          text: 'Bạn thích giúp đỡ người khác tìm cách giải quyết vấn đề cá nhân — dù chỉ là lắng nghe và đưa ra góc nhìn?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'S',
          phase: 1,
          order: 16
        },
        {
          questionId: 'q17',
          text: 'Bạn cảm thấy muốn chăm sóc, hỗ trợ người bệnh, người khuyết tật hoặc những người đang gặp khó khăn?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'S',
          phase: 1,
          order: 17
        },
        {
          questionId: 'q18',
          text: 'Bạn thích giảng dạy, hướng dẫn hoặc đào tạo người khác học một kỹ năng mới?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'S',
          phase: 1,
          order: 18
        },
        {
          questionId: 'q19',
          text: 'Bạn thường tích cực tham gia các hoạt động tình nguyện, cộng đồng hoặc chương trình hỗ trợ xã hội?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'S',
          phase: 1,
          order: 19
        },
        {
          questionId: 'q20',
          text: 'Bạn thấy mình có khả năng tự nhiên trong việc lắng nghe, thấu hiểu và an ủi người đang gặp khó khăn?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'S',
          phase: 1,
          order: 20
        },
        // ===== GIAI ĐOẠN 1: RIASEC — NHÓM E (Enterprising) — Câu 21-25 =====
        {
          questionId: 'q21',
          text: 'Bạn thích thuyết phục người khác ủng hộ ý tưởng, quan điểm hoặc một dự án bạn tin tưởng?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'E',
          phase: 1,
          order: 21
        },
        {
          questionId: 'q22',
          text: 'Bạn có mong muốn tự khởi nghiệp hoặc điều hành doanh nghiệp riêng trong tương lai?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'E',
          phase: 1,
          order: 22
        },
        {
          questionId: 'q23',
          text: 'Bạn thích giữ vai trò giám sát, phân công và theo dõi tiến độ công việc của cả nhóm?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'E',
          phase: 1,
          order: 23
        },
        {
          questionId: 'q24',
          text: 'Bạn cảm thấy tự nhiên khi dẫn dắt hoặc gây ảnh hưởng tích cực đến quyết định của tập thể?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'E',
          phase: 1,
          order: 24
        },
        {
          questionId: 'q25',
          text: 'Bạn thích làm việc trong môi trường bán hàng, tiếp thị, đàm phán hoặc các hoạt động kinh doanh nói chung?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'E',
          phase: 1,
          order: 25
        },
        // ===== GIAI ĐOẠN 1: RIASEC — NHÓM C (Conventional) — Câu 26-30 =====
        {
          questionId: 'q26',
          text: 'Bạn thích sắp xếp, lưu trữ thông tin một cách có hệ thống và chuẩn bị báo cáo rõ ràng, chính xác?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'C',
          phase: 1,
          order: 26
        },
        {
          questionId: 'q27',
          text: 'Bạn cảm thấy thoải mái và làm việc hiệu quả hơn trong một môi trường ngăn nắp, có trật tự rõ ràng?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'C',
          phase: 1,
          order: 27
        },
        {
          questionId: 'q28',
          text: 'Bạn thích làm việc với các con số, số liệu tài chính hoặc quản lý ngân sách một cách chính xác?',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: 'C',
          phase: 1,
          order: 28
        },
        {
          questionId: 'q29',
          text: 'Bạn cảm thấy phù hợp với các công việc văn phòng như quản lý hồ sơ, điền biểu mẫu hoặc xử lý giấy tờ?',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: 'C',
          phase: 1,
          order: 29
        },
        {
          questionId: 'q30',
          text: 'Bạn có xu hướng tự nhiên chú trọng vào chi tiết và tuân thủ các quy tắc, quy trình đã đề ra một cách nghiêm túc?',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: 'C',
          phase: 1,
          order: 30
        },
        // ===== GIAI ĐOẠN 2: ARCS + YẾU TỐ NGOẠI LẠI — Câu 31-40 =====
        {
          questionId: 'q31',
          text: 'Các thành viên trong gia đình (bố mẹ, anh chị em) có ảnh hưởng đến định hướng nghề nghiệp của bạn không?',
          type: 'choice',
          options: ['Không ảnh hưởng', 'Có một chút', 'Ảnh hưởng nhiều', 'Họ quyết định thay tôi'],
          category: 'personality',
          riasecGroup: null,
          phase: 2,
          order: 31
        },
        {
          questionId: 'q32',
          text: 'Bạn có xu hướng chọn ngành nghề theo lời khuyên hoặc xu hướng phổ biến trong nhóm bạn bè không?',
          type: 'choice',
          options: ['Hoàn toàn không', 'Đôi khi có', 'Khá thường xuyên', 'Đây là yếu tố chính'],
          category: 'personality',
          riasecGroup: null,
          phase: 2,
          order: 32
        },
        {
          questionId: 'q33',
          text: 'Thông tin từ TV, Internet hoặc mạng xã hội có thay đổi cách nhìn của bạn về các ngành nghề không?',
          type: 'choice',
          options: ['Rất ít', 'Có nhưng không nhiều', 'Khá ảnh hưởng', 'Rất ảnh hưởng'],
          category: 'interest',
          riasecGroup: null,
          phase: 2,
          order: 33
        },
        {
          questionId: 'q34',
          text: 'Các chương trình tư vấn hướng nghiệp tại trường học có thực sự giúp ích cho bạn trong việc chọn nghề không?',
          type: 'choice',
          options: ['Chưa từng có', 'Có nhưng không hiệu quả', 'Hữu ích một phần', 'Rất hữu ích'],
          category: 'interest',
          riasecGroup: null,
          phase: 2,
          order: 34
        },
        {
          questionId: 'q35',
          text: 'Bạn cảm thấy hào hứng và tò mò mỗi khi tìm hiểu sâu về lĩnh vực chuyên môn mà mình quan tâm? (Attention)',
          type: 'scale',
          options: [],
          category: 'interest',
          riasecGroup: null,
          phase: 2,
          order: 35
        },
        {
          questionId: 'q36',
          text: 'Bạn tin rằng ngành nghề mình đang hướng tới sẽ giúp đạt được những mục tiêu lâu dài trong cuộc sống? (Relevance)',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: null,
          phase: 2,
          order: 36
        },
        {
          questionId: 'q37',
          text: 'Bạn tin mình có đủ khả năng để hoàn thành tốt các chương trình đào tạo chuyên sâu về ngành nghề mà mình yêu thích? (Confidence)',
          type: 'scale',
          options: [],
          category: 'skill',
          riasecGroup: null,
          phase: 2,
          order: 37
        },
        {
          questionId: 'q38',
          text: 'Bạn cảm thấy tự hào và hạnh phúc khi tưởng tượng mình đang làm việc trong ngành đó sau 5-10 năm nữa? (Satisfaction)',
          type: 'scale',
          options: [],
          category: 'personality',
          riasecGroup: null,
          phase: 2,
          order: 38
        },
        {
          questionId: 'q39',
          text: 'Khi làm việc, bạn thích theo quy trình cố định, có hướng dẫn rõ ràng hay thích tự do sáng tạo, thay đổi cách làm?',
          type: 'choice',
          options: ['Quy trình cố định rõ ràng', 'Thiên về quy trình', 'Thiên về tự do', 'Tự do hoàn toàn'],
          category: 'personality',
          riasecGroup: null,
          phase: 2,
          order: 39
        },
        {
          questionId: 'q40',
          text: 'Trong công việc lý tưởng của bạn, bạn muốn tiếp xúc nhiều hơn với điều gì?',
          type: 'choice',
          options: ['Con người — giao tiếp và hỗ trợ', 'Dữ liệu và hệ thống', 'Máy móc và thiết bị', 'Ý tưởng và sáng tạo'],
          category: 'interest',
          riasecGroup: null,
          phase: 2,
          order: 40
        },
      ]);
      console.log("Survey questions seeded successfully (40 questions: 30 RIASEC + 10 ARCS/Context).");
    }

    // Seed default admin + student users if missing
    const adminEmail = "admin@edumatch.vn";
    const studentEmail = "student@edumatch.vn";
    const existingAdmin = await User.findOne({ email: adminEmail });
    const existingStudent = await User.findOne({ email: studentEmail });

    if (!existingAdmin || !existingStudent) {
      console.log("Seeding default users...");

      if (!existingAdmin) {
        await User.create({
          name: "Hệ thống Admin",
          email: adminEmail,
          password: "admin123456",
          role: "admin",
          avatar: "https://i.pravatar.cc/150?u=admin",
          isPro: true,
          academicInfo: { school: "Sở Giáo Dục & Đào Tạo", grade: "N/A", majorInterest: "Quản lý Hướng nghiệp" }
        });
        console.log("Admin account seeded: admin@edumatch.vn / admin123456");
      }

      if (!existingStudent) {
        await User.create({
          name: "Nguyễn Đạt",
          email: studentEmail,
          password: "student123456",
          role: "student",
          avatar: "https://i.pravatar.cc/150?u=student",
          isPro: false,
          academicInfo: {
            school: "THPT Chuyên Hà Nội - Amsterdam",
            grade: "12",
            majorInterest: "Khoa học máy tính"
          }
        });
        console.log("Student account seeded: student@edumatch.vn / student123456");
      }

      console.log("Default users seeded successfully.");
    }

    // Seed default subscription plans if missing
    const planCount = await SubscriptionPlan.countDocuments();
    if (planCount === 0) {
      console.log("Seeding default subscription plans...");
      await SubscriptionPlan.create({
        name: "Pro Hướng nghiệp",
        slug: "pro",
        description: "Truy cập đầy đủ tính năng: Chat không giới hạn, lộ trình học tập chi tiết, phân tích khoảng cách kỹ năng nâng cao.",
        price: 49000,
        duration_days: 30,
        is_active: true
      });
      console.log("Default subscription plans seeded successfully.");
    }
  } catch (error) {
    console.error("Seeding Error:", error.message);
  }
};

module.exports = seedDatabase;
