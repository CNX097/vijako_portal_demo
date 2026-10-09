# VIJAKO Portal — Kế hoạch xây dựng hệ thống quản trị nội bộ

Bộ tài liệu kế hoạch xây dựng **hệ thống quản trị nội bộ (portal + mobile app)** cho
**Công ty Cổ phần Xây dựng VIJAKO Việt Nam** ([vijako.vn](https://vijako.vn/)), gồm
**20 phân hệ** chia thành 2 nhóm **WORKPLACE** và **HRM**, truy cập qua một màn hình
app launcher chung và đăng nhập một lần.

> Trạng thái: **Bản kế hoạch v0.1 (đề xuất)**. Các con số về thời gian, nguồn lực
> là ước tính sơ bộ (±30%), cần chốt lại sau buổi khảo sát nghiệp vụ với VIJAKO.

## Tài liệu

| # | Tài liệu | Nội dung |
|---|----------|----------|
| 01 | [Tổng quan & phạm vi](docs/01-tong-quan-pham-vi.md) | Bối cảnh VIJAKO, mục tiêu, phạm vi, vai trò người dùng, nguyên tắc thiết kế, câu hỏi cần chốt |
| 02 | [Đặc tả chức năng các module](docs/02-dac-ta-module.md) | Nền tảng lõi + 20 module: chức năng MVP / mở rộng, đặc thù ngành xây dựng, liên kết giữa các module |
| 03 | [Kiến trúc & kỹ thuật](docs/03-kien-truc-ky-thuat.md) | Kiến trúc, công nghệ, dữ liệu, phân quyền, workflow engine, tích hợp, bảo mật, hạ tầng |
| 04 | [Lộ trình triển khai](docs/04-lo-trinh-trien-khai.md) | Các giai đoạn, Gantt, ước lượng nỗ lực, đội dự án, chuyển đổi dữ liệu, rủi ro, chỉ số thành công |

## Bản demo bấm thử

Thư mục [`demo/`](demo/README.md) chứa bản demo giao diện (React + TypeScript + Ant Design, dữ liệu mẫu, không cần backend):
app launcher 20 module theo ảnh tham chiếu, **Nhân sự**, **Đơn từ**, **Chấm công** (GPS geofence + bảng công) và
**Quy trình** (biểu mẫu động, luồng duyệt rẽ nhánh), đổi vai trò người dùng để thử toàn bộ luồng phê duyệt.

```bash
cd demo && npm install && npm run dev   # http://localhost:5173
```

## Bản đồ module

| Nhóm | Module | Mô tả ngắn | Giai đoạn |
|------|--------|------------|:---------:|
| WORKPLACE | Mạng nội bộ | Bảng tin, thông báo chính thức, danh bạ, sự kiện | GĐ1 |
| WORKPLACE | Công việc | Giao việc, theo dõi tiến độ, Kanban, nhắc hạn | GĐ1 |
| WORKPLACE | Dự án | Quản lý công trình: WBS, tiến độ, nhật ký thi công, an toàn | GĐ2 |
| WORKPLACE | Quy trình | Biểu mẫu & luồng phê duyệt cấu hình được (đề xuất, tạm ứng, thanh toán…) | GĐ1 |
| WORKPLACE | Tài liệu | Kho tài liệu, bản vẽ, phân quyền, phiên bản, tài liệu ISO | GĐ3 |
| WORKPLACE | Ký số | Ký số từ xa qua CA, ký nháy, luồng ký nhiều người | GĐ2 |
| WORKPLACE | Lịch biểu | Lịch họp, đặt phòng họp, đặt xe, lịch công tác | GĐ1 |
| WORKPLACE | Văn bản | Văn bản đến / đi / nội bộ, sổ văn bản, ban hành | GĐ2 |
| WORKPLACE | Tài sản | Tài sản, máy móc thi công, cấp phát, điều chuyển, kiểm kê QR | GĐ3 |
| HRM | Đơn từ | Nghỉ phép, đi muộn, làm thêm giờ, công tác, giải trình công | GĐ1 |
| HRM | Tuyển dụng | Nhu cầu tuyển, tin tuyển, pipeline ứng viên, phỏng vấn, offer | GĐ2 |
| HRM | Nhân sự | Hồ sơ nhân viên, hợp đồng, quá trình công tác, chứng chỉ | GĐ1 |
| HRM | Đánh giá | Đánh giá thử việc, định kỳ, xếp loại | GĐ4 |
| HRM | IVAN | Kê khai BHXH/BHYT/BHTN điện tử qua nhà cung cấp I-VAN | GĐ3 |
| HRM | Đào tạo | Kế hoạch đào tạo, khoá học, chứng chỉ ATLĐ & nhắc hạn | GĐ2 |
| HRM | Chấm công | Chấm công GPS/selfie tại công trường, máy chấm công, bảng công | GĐ1 |
| HRM | Bảng lương | Công thức lương, BHXH, thuế TNCN, phiếu lương, file chi lương | GĐ3 |
| HRM | Ứng lương | Yêu cầu ứng lương, hạn mức, khấu trừ tự động vào lương | GĐ3 |
| HRM | KPI | Bộ chỉ tiêu, giao KPI theo kỳ, chấm điểm, liên kết thưởng | GĐ4 |
| HRM | OKR | Mục tiêu & kết quả then chốt theo quý, check-in hằng tuần | GĐ4 |

## Lộ trình tóm tắt

| Giai đoạn | Nội dung chính | Thời lượng | Go-live dự kiến* |
|-----------|----------------|:----------:|:----------------:|
| GĐ0 — Nền tảng | Khảo sát, thiết kế UX, demo, nền tảng lõi (tổ chức, tài khoản, phân quyền, workflow engine, thông báo, file), khung web + mobile | 8 tuần | — |
| GĐ1 — Vận hành hằng ngày | Nhân sự, Đơn từ, Chấm công, Quy trình, Công việc, Lịch biểu, Mạng nội bộ | 13 tuần + Tết + UAT/thí điểm | 05/2027 |
| GĐ2 — Điều hành & văn phòng điện tử | Dự án, Văn bản, Ký số, Tuyển dụng, Đào tạo | 11 tuần + UAT | 07/2027 |
| GĐ3 — Tiền lương & tài sản | Bảng lương, Ứng lương, IVAN, Tài liệu, Tài sản (lương chạy song song 2 kỳ) | 9 tuần + song song | 09–10/2027 |
| GĐ4 — Hiệu suất | Đánh giá, KPI, OKR | 5 tuần + UAT | 10/2027 |

\* Giả định khởi động **02/11/2026**, đội ~12–13 người, đã tính nghỉ Tết Đinh Mùi (đầu 02/2027).
Tổng thời gian ~12 tháng tới go-live cuối + 6 tuần hỗ trợ; nỗ lực phát triển tính năng ~62 người-tháng
(tổng dự án ~135–150 người-tháng). Chi tiết tại [04 — Lộ trình triển khai](docs/04-lo-trinh-trien-khai.md).

## Công nghệ đề xuất (tóm tắt)

Web **React + TypeScript + Ant Design** · Mobile **React Native (Expo)** · Backend
**NestJS (modular monolith)** · **PostgreSQL**, **Redis/BullMQ**, **MinIO (S3)** ·
Docker + CI/CD GitHub Actions · Hạ tầng cloud đặt tại Việt Nam. Chi tiết tại
[03 — Kiến trúc & kỹ thuật](docs/03-kien-truc-ky-thuat.md).
