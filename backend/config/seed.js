const mongoose = require("mongoose");
const User = require("../models/User");
const Career = require("../models/Career");
const University = require("../models/University");
const Article = require("../models/Article");
const SurveyQuestion = require("../models/SurveyQuestion");

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
      console.log("Seeding survey questions...");
      await SurveyQuestion.create([
        { questionId: 'q1', text: 'Bạn có thích tự tay lắp ráp, sửa chữa hoặc tạo ra các thiết bị, mô hình, máy móc hơn là chỉ đọc lý thuyết?', type: 'choice', options: ['Không thích', 'Thỉnh thoảng', 'Rất thích'], category: 'personality', order: 1 },
        { questionId: 'q2', text: 'Bạn cảm thấy thế nào khi phải làm việc với dụng cụ, máy móc, thiết bị hoặc sản phẩm kỹ thuật?', type: 'scale', options: [], category: 'skill', order: 2 },
        { questionId: 'q3', text: 'Bạn có thấy hào hứng khi tham gia các hoạt động thực hành, thí nghiệm hoặc dự án STEM có tính ứng dụng cao không?', type: 'scale', options: [], category: 'interest', order: 3 },
        { questionId: 'q4', text: 'Bạn có thích tìm hiểu sâu cách thức hoạt động của một hiện tượng, phân tích nguyên nhân và kiểm chứng lý thuyết không?', type: 'scale', options: [], category: 'interest', order: 4 },
        { questionId: 'q5', text: 'Bạn có thường tự tìm đọc sách, bài viết về khoa học, công nghệ, toán học hoặc tư duy logic ngoài giờ học không?', type: 'choice', options: ['Hiếm khi', 'Thỉnh thoảng', 'Rất thường xuyên'], category: 'interest', order: 5 },
        { questionId: 'q6', text: 'Khi gặp một vấn đề phức tạp, bạn thường thích tự phân tích dữ liệu, so sánh số liệu và rút ra kết luận hơn là dựa vào cảm tính?', type: 'choice', options: ['Không thích', 'Bình thường', 'Rất thích'], category: 'skill', order: 6 },
        { questionId: 'q7', text: 'Bạn có thích tạo ra ý tưởng mới, thiết kế hình ảnh, kể chuyện qua hình ảnh hoặc sản phẩm sáng tạo không?', type: 'choice', options: ['Không quan tâm', 'Có một chút', 'Rất yêu thích'], category: 'interest', order: 7 },
        { questionId: 'q8', text: 'Bạn có thường tưởng tượng ra những cách thức mới để làm một việc thay vì làm theo hướng dẫn cố định?', type: 'scale', options: [], category: 'skill', order: 8 },
        { questionId: 'q9', text: 'Bạn có cảm thấy hứng khởi khi được thoải mái biểu đạt suy nghĩ, cảm xúc và quan điểm cá nhân trong một dự án?', type: 'scale', options: [], category: 'personality', order: 9 },
        { questionId: 'q10', text: 'Bạn có thấy vui khi giúp đỡ người khác học hỏi, lắng nghe chia sẻ và góp phần giải quyết khó khăn cho họ?', type: 'choice', options: ['Không quá quan tâm', 'Có thể', 'Rất thích'], category: 'interest', order: 10 },
        { questionId: 'q11', text: 'Bạn có thích làm việc nhóm, thuyết trình hoặc trao đổi ý tưởng với nhiều người hơn là làm việc một mình?', type: 'scale', options: [], category: 'skill', order: 11 },
        { questionId: 'q12', text: 'Bạn có cảm thấy tự tin khi đứng trước đám đông để giải thích một vấn đề hoặc hướng dẫn người khác?', type: 'choice', options: ['Không tự tin', 'Tương đối tự tin', 'Rất tự tin'], category: 'personality', order: 12 },
        { questionId: 'q13', text: 'Bạn có thích đề xuất ý tưởng, thuyết phục người khác và dẫn dắt một nhóm để đạt mục tiêu chung?', type: 'choice', options: ['Rất ít', 'Đôi khi', 'Rất thích'], category: 'interest', order: 13 },
        { questionId: 'q14', text: 'Bạn có chủ động đặt mục tiêu lớn và tìm cách đạt được chúng bằng kế hoạch cụ thể không?', type: 'scale', options: [], category: 'skill', order: 14 },
        { questionId: 'q15', text: 'Bạn có thích tham gia hoạt động tổ chức, quản lý sự kiện, khởi nghiệp hoặc bán ý tưởng của bản thân?', type: 'scale', options: [], category: 'personality', order: 15 },
        { questionId: 'q16', text: 'Bạn có cảm thấy thoải mái khi sắp xếp dữ liệu, quản lý hồ sơ hoặc làm việc với hệ thống quy tắc rõ ràng không?', type: 'choice', options: ['Không thích', 'Bình thường', 'Rất thích'], category: 'skill', order: 16 },
        { questionId: 'q17', text: 'Bạn có thường chú ý đến chi tiết, hoàn thành công việc đúng hạn và tuân thủ quy trình đã đặt ra?', type: 'scale', options: [], category: 'skill', order: 17 },
        { questionId: 'q18', text: 'Bạn có thích làm việc theo quy trình, hệ thống và báo cáo kết quả một cách chính xác hơn là làm việc tùy hứng?', type: 'choice', options: ['Không', 'Thỉnh thoảng', 'Rất phù hợp'], category: 'interest', order: 18 },
        { questionId: 'q19', text: 'Sau một ngày dài, bạn thường muốn nạp lại năng lượng bằng cách...', type: 'choice', options: ['Ở một mình', 'Vừa đủ', 'Gặp gỡ bạn bè'], category: 'personality', order: 19 },
        { questionId: 'q20', text: 'Khi học điều gì mới, bạn thích bắt đầu từ những chi tiết cụ thể hay từ ý tưởng lớn và các khả năng tiềm năng?', type: 'choice', options: ['Chi tiết rõ ràng', 'Cách nhìn tổng quát', 'Cả hai'], category: 'interest', order: 20 },
        { questionId: 'q21', text: 'Khi đưa ra quyết định quan trọng, bạn thường dựa vào điều gì nhiều hơn?', type: 'choice', options: ['Logic và phân tích', 'Cảm xúc và giá trị', 'Cân bằng cả hai'], category: 'interest', order: 21 },
        { questionId: 'q22', text: 'Bạn thích môi trường làm việc có...', type: 'choice', options: ['Kế hoạch rõ ràng', 'Linh hoạt thay đổi', 'Một chút cả hai'], category: 'personality', order: 22 },
        { questionId: 'q23', text: 'Bạn cảm thấy thoải mái hơn khi...', type: 'choice', options: ['Tuân theo thời hạn và kế hoạch', 'Để ý tưởng phát triển tự nhiên', 'Cả hai tùy trường hợp'], category: 'skill', order: 23 },
        { questionId: 'q24', text: 'Bạn tin tưởng hơn vào...', type: 'choice', options: ['Kinh nghiệm và chi tiết', 'Trực giác và mô hình tổng thể', 'Cả hai'], category: 'personality', order: 24 },
        { questionId: 'q25', text: 'Bạn thường thích môi trường làm việc có lịch trình rõ ràng hay có thể thay đổi linh hoạt?', type: 'choice', options: ['Lịch trình rõ ràng', 'Linh hoạt thay đổi', 'Cả hai'], category: 'personality', order: 25 },
        { questionId: 'q26', text: 'Bạn có xu hướng hoàn thành công việc trước hạn hay để dành đến gần hạn chót?', type: 'choice', options: ['Hoàn thành sớm', 'Gần hạn', 'Tùy cảm hứng'], category: 'skill', order: 26 },
      ]);
      console.log("Survey questions seeded successfully.");
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
  } catch (error) {
    console.error("Seeding Error:", error.message);
  }
};

module.exports = seedDatabase;
