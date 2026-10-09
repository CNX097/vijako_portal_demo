# 01. Tổng quan & phạm vi

## 1. Bối cảnh

**Công ty Cổ phần Xây dựng VIJAKO Việt Nam** là nhà thầu thi công xây dựng (tổng thầu)
tại Hà Nội. Theo thông tin công khai: thành lập năm 2008, đạt chứng nhận ISO 9001:2015
và ISO 14001:2015, đội ngũ hơn 120 kỹ sư; dự án tiêu biểu gồm Pandora Tower,
The Manor Central Park, gói 168 căn shophouse tại Sun Urban City (tổng thầu cho Sun Group).
*Các thông tin này cần VIJAKO xác nhận lại trong buổi khảo sát.*

Hệ thống cần phục vụ đặc thù của một doanh nghiệp thi công, khác với doanh nghiệp văn phòng thuần tuý:

| Đặc thù vận hành | Ảnh hưởng tới thiết kế hệ thống |
|------------------|----------------------------------|
| Nhân sự phân tán: văn phòng công ty + nhiều Ban chỉ huy (BCH) công trường; kỹ sư luân chuyển giữa các công trình | Cây tổ chức phải có cả phòng ban **và** dự án; phân quyền theo dự án; lịch sử luân chuyển trong hồ sơ nhân sự |
| Công trường không có máy chấm công cố định, sóng di động yếu | Chấm công mobile bằng GPS geofence theo từng công trường + selfie; hỗ trợ offline; CHT chấm công hộ tổ đội |
| Hồ sơ kỹ thuật lớn, nhiều phiên bản (bản vẽ, hồ sơ thầu, hồ sơ chất lượng, nghiệm thu) | Kho tài liệu có phiên bản, xem trước file lớn, dung lượng lưu trữ tăng nhanh |
| Nhiều luồng phê duyệt nhiều cấp (đề xuất vật tư, tạm ứng, thanh toán thầu phụ, công tác) | Workflow engine dùng chung, điều kiện theo giá trị / dự án, duyệt trên điện thoại |
| Máy móc thiết bị thi công điều chuyển giữa công trường, cần kiểm định định kỳ | Module Tài sản có điều chuyển theo công trình, nhắc hạn kiểm định, kiểm kê bằng QR |
| An toàn lao động: chứng chỉ ATLĐ, chứng chỉ hành nghề có thời hạn | Quản lý chứng chỉ trong Nhân sự/Đào tạo, cảnh báo sắp hết hạn |
| Áp dụng ISO 9001 / 14001 | Quy trình và tài liệu kiểm soát (mã tài liệu, lần ban hành, xác nhận đã đọc) |
| Lương công trường có phụ cấp riêng (công trường, đi lại, ăn ca, khoán) | Bảng lương cấu hình công thức linh hoạt, nhiều mẫu bảng lương |

## 2. Mục tiêu

1. **Một cổng duy nhất** (web + mobile) cho toàn bộ nghiệp vụ văn phòng và nhân sự, đăng nhập một lần.
2. **Số hoá 100% đơn từ, đề xuất, phê duyệt** — duyệt được trên điện thoại, có nhật ký đầy đủ.
3. **Một nguồn dữ liệu nhân sự duy nhất** dùng chung cho chấm công, lương, BHXH, đánh giá, đào tạo.
4. **Rút ngắn thời gian chốt công & lương** nhờ dữ liệu chấm công, đơn từ, ứng lương được tổng hợp tự động.
5. **Minh bạch tiến độ dự án & công việc** cho Ban Giám đốc theo thời gian thực.
6. **Làm chủ dữ liệu và tuỳ biến** theo đặc thù ngành xây dựng của VIJAKO.

### Chỉ tiêu đo lường đề xuất (chốt lại sau khảo sát)

| Chỉ tiêu | Mục tiêu sau 6 tháng vận hành |
|----------|-------------------------------|
| Tỷ lệ đơn từ / đề xuất xử lý trên hệ thống | ≥ 95% |
| Thời gian phê duyệt trung bình một đơn từ | < 1 ngày làm việc |
| Người dùng hoạt động hằng tuần trên mobile | ≥ 85% nhân sự |
| Thời gian chốt công + tính lương mỗi kỳ | Giảm ≥ 50% so với hiện tại |
| Sai sót bảng lương phải điều chỉnh sau khi chi | 0 sai sót do hệ thống |
| Chứng chỉ ATLĐ / kiểm định thiết bị quá hạn mà không được cảnh báo | 0 |

## 3. Phạm vi

### Trong phạm vi

- **Nền tảng lõi dùng chung**: cơ cấu tổ chức, tài khoản & đăng nhập (SSO), phân quyền, workflow engine,
  biểu mẫu động, thông báo, lưu trữ file, tìm kiếm, nhật ký hệ thống, app launcher.
- **20 module** thuộc 2 nhóm WORKPLACE (9) và HRM (11) — đặc tả tại [02](02-dac-ta-module.md).
- **Ứng dụng web** (quản trị + người dùng) và **ứng dụng mobile** iOS/Android.
- **Tích hợp**: CA ký số từ xa, nhà cung cấp I-VAN, máy chấm công văn phòng, ngân hàng (file chi lương),
  phần mềm kế toán (xuất dữ liệu), email/SMS/Zalo ZNS, SSO Microsoft 365 / Google Workspace.
- **Chuyển đổi dữ liệu** từ hệ thống/Excel hiện tại, đào tạo người dùng, hỗ trợ sau go-live.

### Ngoài phạm vi (giai đoạn này)

- Kế toán tài chính, công nợ, hoá đơn điện tử.
- Dự toán, khối lượng, chi phí công trình chi tiết (ERP xây dựng) — module **Dự án** ở đây tập trung
  vào tiến độ, nhật ký, hồ sơ, an toàn và điều hành, không thay phần mềm dự toán.
- Quản lý kho vật tư, mua hàng, CRM / kinh doanh.
- Chat thời gian thực thay thế Zalo/Teams (có thể cân nhắc sau GĐ4).

## 4. Người dùng & vai trò

| Vai trò | Ví dụ | Nhu cầu chính | Kênh chính |
|---------|-------|---------------|-----------|
| Ban Giám đốc | TGĐ, PTGĐ | Duyệt nhanh, dashboard dự án / nhân sự / chi phí lương, ban hành văn bản | Mobile + Web |
| Trưởng phòng / bộ phận | TP Kỹ thuật, TP HCNS, TP Kế toán | Giao việc, duyệt đơn, đánh giá, KPI phòng | Web + Mobile |
| Ban chỉ huy công trường | Chỉ huy trưởng, kỹ sư giám sát, cán bộ ATLĐ | Nhật ký thi công, chấm công tổ đội, đề xuất, tiến độ | **Mobile** |
| Nhân viên văn phòng | Kỹ thuật, QS, mua hàng, hành chính | Công việc, đơn từ, tài liệu, lịch họp | Web + Mobile |
| Phòng HCNS | HR, C&B, tuyển dụng, đào tạo | Hồ sơ nhân sự, chấm công, lương, BHXH, tuyển dụng | Web |
| Kế toán | Kế toán lương, thanh toán | Duyệt chi ứng lương, xuất dữ liệu lương, tạm ứng | Web |
| Văn thư | Văn thư công ty | Văn bản đến/đi, sổ văn bản, phát hành | Web |
| Quản trị hệ thống | IT | Người dùng, phân quyền, cấu hình, giám sát | Web |
| Ứng viên (bên ngoài) | — | Xem tin tuyển, nộp hồ sơ | Trang tuyển dụng công khai |

**Quy mô giả định** (cần xác nhận): 200–500 người dùng nội bộ. Hệ thống thiết kế cho **1.000 người dùng,
~300 người dùng đồng thời**, đủ dư địa khi công ty mở rộng hoặc đưa công nhân/tổ đội vào chấm công.

## 5. Nguyên tắc thiết kế

1. **Mobile-first cho người ở công trường** — mọi thao tác thường xuyên (chấm công, đơn từ, duyệt, nhật ký, công việc) làm được trên điện thoại trong vài chạm.
2. **Một nền tảng, nhiều ứng dụng** — tổ chức, nhân viên, phân quyền, phê duyệt, thông báo, file là dịch vụ dùng chung; module không tự xây lại.
3. **Cấu hình thay vì lập trình** — biểu mẫu, luồng duyệt, ca làm việc, công thức lương, quỹ phép do quản trị viên cấu hình.
4. **Phân quyền theo tổ chức và theo dự án** — người dùng thấy đúng dữ liệu của phòng ban / công trình mình tham gia.
5. **Mọi thao tác đều có dấu vết** — ai, làm gì, lúc nào, trên dữ liệu nào (audit log), đặc biệt dữ liệu lương và phê duyệt.
6. **Tuân thủ pháp luật Việt Nam** — Bộ luật Lao động 2019, Luật BHXH 2024, Luật Giao dịch điện tử 2023, Luật Bảo vệ dữ liệu cá nhân 2025 và văn bản hướng dẫn; các tham số pháp lý (mức giảm trừ, tỷ lệ đóng, mẫu biểu) phải cấu hình được vì thay đổi thường xuyên.
7. **Triển khai cuốn chiếu** — mỗi giai đoạn tự go-live được và tạo giá trị ngay, không "big bang".

## 6. Giả định

- Ảnh tham chiếu là màn hình app launcher của nền tảng VIJAKO đang dùng hoặc muốn hướng tới. Trong ảnh,
  8 module hiển thị mờ (Tài liệu, Tài sản, Đánh giá, IVAN, Bảng lương, Ứng lương, KPI, OKR) — thường là
  chưa kích hoạt. Kế hoạch ưu tiên các module đang sáng (đang dùng) ở GĐ1–GĐ2 để có thể thay thế hệ thống
  hiện tại sớm, các module mờ đưa vào GĐ3–GĐ4. **Thứ tự này điều chỉnh được** theo ưu tiên thực tế của VIJAKO.
- Hệ thống được xây mới (không tuỳ biến trên nền SaaS có sẵn), VIJAKO sở hữu mã nguồn và dữ liệu.
- VIJAKO cử **Product Owner** (đề xuất: Trưởng phòng HCNS) và **người dùng chủ chốt** ở mỗi phòng ban / 1 công trường thí điểm.

## 7. Câu hỏi cần chốt trước khi khởi động

| # | Câu hỏi | Ảnh hưởng tới |
|---|---------|---------------|
| 1 | Số lượng người dùng: văn phòng, công trường; công nhân thời vụ / tổ đội thầu phụ có dùng hệ thống không? | Hạ tầng, giá CA ký số, thiết kế Chấm công |
| 2 | Hiện đang dùng hệ thống nào (SaaS nào, Excel)? Cần chuyển dữ liệu lịch sử bao nhiêu năm? | Kế hoạch chuyển đổi dữ liệu, thời điểm tắt hệ thống cũ |
| 3 | Đội phát triển in-house hay thuê ngoài? Ngân sách & mốc thời gian mong muốn? | Phương án đội dự án, lộ trình |
| 4 | Công ty dùng Microsoft 365 hay Google Workspace? | SSO, lịch, email |
| 5 | Nhà cung cấp chữ ký số (CA) và I-VAN hiện tại? Đã có chứng thư số cá nhân cho lãnh đạo chưa? | Module Ký số, IVAN |
| 6 | Phần mềm kế toán đang dùng (MISA, Fast, Bravo…)? Ngân hàng chi lương? | Tích hợp Bảng lương |
| 7 | Hạ tầng: cloud tại Việt Nam hay máy chủ tại văn phòng? | Kiến trúc triển khai, chi phí vận hành |
| 8 | Chính sách lương: lương khoán, phụ cấp công trường, cách tính làm thêm giờ, chu kỳ chốt công? | Thiết kế Chấm công, Bảng lương |
| 9 | Đang có máy chấm công nào ở văn phòng (hãng, model)? | Tích hợp Chấm công |
| 10 | Tên miền cho hệ thống (vd. `portal.vijako.vn`, `tuyendung.vijako.vn`)? | Hạ tầng, trang tuyển dụng |
