/**
 * Migration Script: Reset & Re-seed Survey Questions
 * Chạy một lần sau khi cập nhật bộ câu hỏi RIASEC mới.
 *
 * Usage: node config/migrateSurveyQuestions.js
 */

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./db");
const SurveyQuestion = require("../models/SurveyQuestion");

const run = async () => {
  await connectDB();

  console.log("⚠  Đang xóa toàn bộ câu hỏi cũ...");
  const deleted = await SurveyQuestion.deleteMany({});
  console.log(`✓ Đã xóa ${deleted.deletedCount} câu hỏi cũ.`);

  console.log("→ Bắt đầu seed bộ câu hỏi RIASEC + ARCS mới (40 câu)...");

  await SurveyQuestion.create([
    // ===== GIAI ĐOẠN 1: RIASEC — NHÓM R (Realistic) — Câu 1-5 =====
    { questionId: 'q1',  text: 'Bạn thích tự tay lập kế hoạch, thiết kế và xây dựng thứ gì đó (như lắp ráp mô hình, hàn điện, làm đồ thủ công)?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'R', phase: 1, order: 1 },
    { questionId: 'q2',  text: 'Bạn thích sử dụng các công cụ như tua vít, kìm, cờ lê để tự tay sửa chữa đồ vật hư hỏng?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'R', phase: 1, order: 2 },
    { questionId: 'q3',  text: 'Bạn có muốn tìm hiểu cách sửa chữa thiết bị điện trong nhà (quạt, đèn, ổ cắm) khi chúng hỏng?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'R', phase: 1, order: 3 },
    { questionId: 'q4',  text: 'Bạn có thích tìm hiểu về canh tác nông nghiệp, ví dụ cách sử dụng phân bón để tăng năng suất cây trồng?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'R', phase: 1, order: 4 },
    { questionId: 'q5',  text: 'Bạn cảm thấy hứng khởi khi vận hành, lắp đặt hoặc tìm hiểu nguyên lý hoạt động của các thiết bị điện tử, máy móc?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'R', phase: 1, order: 5 },

    // ===== GIAI ĐOẠN 1: RIASEC — NHÓM I (Investigative) — Câu 6-10 =====
    { questionId: 'q6',  text: 'Bạn thích làm việc độc lập để nghiên cứu, phân tích một vấn đề hơn là chờ người khác hướng dẫn?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'I', phase: 1, order: 6 },
    { questionId: 'q7',  text: 'Bạn thích giải các bài toán khó, câu đố logic hoặc các vấn đề khoa học phức tạp?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'I', phase: 1, order: 7 },
    { questionId: 'q8',  text: 'Bạn có quan tâm đến việc nghiên cứu bệnh lý trên động thực vật hoặc tìm hiểu cơ chế sinh học để điều trị?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'I', phase: 1, order: 8 },
    { questionId: 'q9',  text: 'Bạn có thấy thú vị khi tìm hiểu về cách hoạt động của hệ thống pháp luật, cách tranh tụng, hay tư duy biện chứng?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'I', phase: 1, order: 9 },
    { questionId: 'q10', text: 'Bạn có thường xuyên quan sát sự vật xung quanh, đặt câu hỏi "tại sao?" và muốn tìm hiểu sâu về nguyên nhân?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'I', phase: 1, order: 10 },

    // ===== GIAI ĐOẠN 1: RIASEC — NHÓM A (Artistic) — Câu 11-15 =====
    { questionId: 'q11', text: 'Bạn thích vẽ tranh, tô màu, điêu khắc hoặc làm thủ công mỹ nghệ như một cách tự biểu đạt?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'A', phase: 1, order: 11 },
    { questionId: 'q12', text: 'Bạn thích học chơi nhạc cụ, ca hát hoặc thưởng thức và phân tích các tác phẩm âm nhạc?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'A', phase: 1, order: 12 },
    { questionId: 'q13', text: 'Bạn thích thể hiện bản thân qua diễn kịch, múa, nhiếp ảnh hoặc các loại hình nghệ thuật thị giác?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'A', phase: 1, order: 13 },
    { questionId: 'q14', text: 'Bạn có hứng thú với việc thiết kế thời trang, trang trí nội thất hoặc tạo ra những sản phẩm mang dấu ấn thẩm mỹ cá nhân?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'A', phase: 1, order: 14 },
    { questionId: 'q15', text: 'Bạn thích giải trí và mang lại niềm vui cho mọi người qua biểu diễn, kể chuyện hoặc sáng tác nội dung sáng tạo?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'A', phase: 1, order: 15 },

    // ===== GIAI ĐOẠN 1: RIASEC — NHÓM S (Social) — Câu 16-20 =====
    { questionId: 'q16', text: 'Bạn thích giúp đỡ người khác tìm cách giải quyết vấn đề cá nhân — dù chỉ là lắng nghe và đưa ra góc nhìn?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'S', phase: 1, order: 16 },
    { questionId: 'q17', text: 'Bạn cảm thấy muốn chăm sóc, hỗ trợ người bệnh, người khuyết tật hoặc những người đang gặp khó khăn?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'S', phase: 1, order: 17 },
    { questionId: 'q18', text: 'Bạn thích giảng dạy, hướng dẫn hoặc đào tạo người khác học một kỹ năng mới?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'S', phase: 1, order: 18 },
    { questionId: 'q19', text: 'Bạn thường tích cực tham gia các hoạt động tình nguyện, cộng đồng hoặc chương trình hỗ trợ xã hội?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'S', phase: 1, order: 19 },
    { questionId: 'q20', text: 'Bạn thấy mình có khả năng tự nhiên trong việc lắng nghe, thấu hiểu và an ủi người đang gặp khó khăn?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'S', phase: 1, order: 20 },

    // ===== GIAI ĐOẠN 1: RIASEC — NHÓM E (Enterprising) — Câu 21-25 =====
    { questionId: 'q21', text: 'Bạn thích thuyết phục người khác ủng hộ ý tưởng, quan điểm hoặc một dự án bạn tin tưởng?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'E', phase: 1, order: 21 },
    { questionId: 'q22', text: 'Bạn có mong muốn tự khởi nghiệp hoặc điều hành doanh nghiệp riêng trong tương lai?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'E', phase: 1, order: 22 },
    { questionId: 'q23', text: 'Bạn thích giữ vai trò giám sát, phân công và theo dõi tiến độ công việc của cả nhóm?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'E', phase: 1, order: 23 },
    { questionId: 'q24', text: 'Bạn cảm thấy tự nhiên khi dẫn dắt hoặc gây ảnh hưởng tích cực đến quyết định của tập thể?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'E', phase: 1, order: 24 },
    { questionId: 'q25', text: 'Bạn thích làm việc trong môi trường bán hàng, tiếp thị, đàm phán hoặc các hoạt động kinh doanh nói chung?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'E', phase: 1, order: 25 },

    // ===== GIAI ĐOẠN 1: RIASEC — NHÓM C (Conventional) — Câu 26-30 =====
    { questionId: 'q26', text: 'Bạn thích sắp xếp, lưu trữ thông tin một cách có hệ thống và chuẩn bị báo cáo rõ ràng, chính xác?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'C', phase: 1, order: 26 },
    { questionId: 'q27', text: 'Bạn cảm thấy thoải mái và làm việc hiệu quả hơn trong một môi trường ngăn nắp, có trật tự rõ ràng?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'C', phase: 1, order: 27 },
    { questionId: 'q28', text: 'Bạn thích làm việc với các con số, số liệu tài chính hoặc quản lý ngân sách một cách chính xác?', type: 'scale', options: [], category: 'skill',       riasecGroup: 'C', phase: 1, order: 28 },
    { questionId: 'q29', text: 'Bạn cảm thấy phù hợp với các công việc văn phòng như quản lý hồ sơ, điền biểu mẫu hoặc xử lý giấy tờ?', type: 'scale', options: [], category: 'interest',    riasecGroup: 'C', phase: 1, order: 29 },
    { questionId: 'q30', text: 'Bạn có xu hướng tự nhiên chú trọng vào chi tiết và tuân thủ các quy tắc, quy trình đã đề ra một cách nghiêm túc?', type: 'scale', options: [], category: 'personality',  riasecGroup: 'C', phase: 1, order: 30 },

    // ===== GIAI ĐOẠN 2: ARCS + YẾU TỐ NGOẠI LẠI — Câu 31-40 =====
    { questionId: 'q31', text: 'Các thành viên trong gia đình (bố mẹ, anh chị em) có ảnh hưởng đến định hướng nghề nghiệp của bạn không?', type: 'choice', options: ['Không ảnh hưởng', 'Có một chút', 'Ảnh hưởng nhiều', 'Họ quyết định thay tôi'], category: 'personality', riasecGroup: null, phase: 2, order: 31 },
    { questionId: 'q32', text: 'Bạn có xu hướng chọn ngành nghề theo lời khuyên hoặc xu hướng phổ biến trong nhóm bạn bè không?', type: 'choice', options: ['Hoàn toàn không', 'Đôi khi có', 'Khá thường xuyên', 'Đây là yếu tố chính'], category: 'personality', riasecGroup: null, phase: 2, order: 32 },
    { questionId: 'q33', text: 'Thông tin từ TV, Internet hoặc mạng xã hội có thay đổi cách nhìn của bạn về các ngành nghề không?', type: 'choice', options: ['Rất ít', 'Có nhưng không nhiều', 'Khá ảnh hưởng', 'Rất ảnh hưởng'], category: 'interest', riasecGroup: null, phase: 2, order: 33 },
    { questionId: 'q34', text: 'Các chương trình tư vấn hướng nghiệp tại trường học có thực sự giúp ích cho bạn trong việc chọn nghề không?', type: 'choice', options: ['Chưa từng có', 'Có nhưng không hiệu quả', 'Hữu ích một phần', 'Rất hữu ích'], category: 'interest', riasecGroup: null, phase: 2, order: 34 },
    { questionId: 'q35', text: 'Bạn cảm thấy hào hứng và tò mò mỗi khi tìm hiểu sâu về lĩnh vực chuyên môn mà mình quan tâm? (Attention)', type: 'scale', options: [], category: 'interest', riasecGroup: null, phase: 2, order: 35 },
    { questionId: 'q36', text: 'Bạn tin rằng ngành nghề mình đang hướng tới sẽ giúp đạt được những mục tiêu lâu dài trong cuộc sống? (Relevance)', type: 'scale', options: [], category: 'personality', riasecGroup: null, phase: 2, order: 36 },
    { questionId: 'q37', text: 'Bạn tin mình có đủ khả năng để hoàn thành tốt các chương trình đào tạo chuyên sâu về ngành nghề mà mình yêu thích? (Confidence)', type: 'scale', options: [], category: 'skill', riasecGroup: null, phase: 2, order: 37 },
    { questionId: 'q38', text: 'Bạn cảm thấy tự hào và hạnh phúc khi tưởng tượng mình đang làm việc trong ngành đó sau 5-10 năm nữa? (Satisfaction)', type: 'scale', options: [], category: 'personality', riasecGroup: null, phase: 2, order: 38 },
    { questionId: 'q39', text: 'Khi làm việc, bạn thích theo quy trình cố định, có hướng dẫn rõ ràng hay thích tự do sáng tạo, thay đổi cách làm?', type: 'choice', options: ['Quy trình cố định rõ ràng', 'Thiên về quy trình', 'Thiên về tự do', 'Tự do hoàn toàn'], category: 'personality', riasecGroup: null, phase: 2, order: 39 },
    { questionId: 'q40', text: 'Trong công việc lý tưởng của bạn, bạn muốn tiếp xúc nhiều hơn với điều gì?', type: 'choice', options: ['Con người — giao tiếp và hỗ trợ', 'Dữ liệu và hệ thống', 'Máy móc và thiết bị', 'Ý tưởng và sáng tạo'], category: 'interest', riasecGroup: null, phase: 2, order: 40 },
  ]);

  console.log("✓ Đã seed thành công 40 câu hỏi RIASEC + ARCS.");
  console.log("  - Giai đoạn 1 (RIASEC): 30 câu (R×5, I×5, A×5, S×5, E×5, C×5)");
  console.log("  - Giai đoạn 2 (ARCS + Context): 10 câu (q31–q40)");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
