const mongoose = require("mongoose");
const User = require("../models/User");
const Career = require("../models/Career");
const University = require("../models/University");
const Article = require("../models/Article");

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
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/FPT_Education_logo.svg/1200px-FPT_Education_logo.svg.png", // Mock fallback image
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

    // Seed default users for testing if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding default users...");
      
      // Admin account
      await User.create({
        name: "Hệ thống Admin",
        email: "admin@edumatch.vn",
        password: "admin123456",
        role: "admin",
        avatar: "https://i.pravatar.cc/150?u=admin",
        isPro: true,
        academicInfo: { school: "Sở Giáo Dục & Đào Tạo", grade: "N/A", majorInterest: "Quản lý Hướng nghiệp" }
      });

      // Default Student account
      await User.create({
        name: "Nguyễn Đạt",
        email: "student@edumatch.vn",
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
      console.log("Default users seeded successfully.");
    }
  } catch (error) {
    console.error("Seeding Error:", error.message);
  }
};

module.exports = seedDatabase;
