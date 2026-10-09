# VIJAKO Portal — bản demo bấm thử

Bản demo giao diện để Ban Giám đốc và người dùng chủ chốt duyệt trải nghiệm **trước khi phát triển thật**
(bước 5 trong [Lộ trình triển khai](../docs/04-lo-trinh-trien-khai.md#11-bước-tiếp-theo-24-tuần-tới)).
Dùng đúng công nghệ đề xuất cho web: React + TypeScript + Ant Design.

> Toàn bộ dữ liệu là **dữ liệu mẫu** (nhân viên, công trình, số tiền đều hư cấu). Không có backend:
> dữ liệu bạn tạo được lưu trong `localStorage` của trình duyệt, bấm **Đặt lại dữ liệu demo** ở menu trái để làm lại từ đầu.

## Chạy thử

Yêu cầu Node.js 20 trở lên.

```bash
cd demo
npm install
npm run dev          # mở http://localhost:5173
```

Các lệnh khác:

| Lệnh | Tác dụng |
|------|----------|
| `npm run build` | Kiểm tra kiểu + build ra `dist/` (file tĩnh, đường dẫn tương đối) |
| `npm run preview` | Chạy thử bản build tại http://localhost:4173 |
| `npm test` | Chạy unit test (workflow engine, bảng công, lịch làm việc) |

Bản build dùng hash router (`#/…`) nên có thể đưa thư mục `dist/` lên bất kỳ static host nào
(GitHub Pages, Netlify, máy chủ nội bộ…) mà không cần cấu hình thêm.

## Bản trực tuyến (GitHub Pages)

**https://cnx097.github.io/vijako_portal_demo/**

Workflow [`.github/workflows/deploy-demo.yml`](../.github/workflows/deploy-demo.yml) chạy mỗi khi có thay đổi trong
`demo/` trên nhánh mặc định: cài đặt → chạy test → build → deploy lên GitHub Pages. Có thể chạy tay ở tab
**Actions → Deploy demo to GitHub Pages → Run workflow**.

Thiết lập một lần (cần quyền admin repo): **Settings → Pages → Build and deployment → Source: GitHub Actions**.

> Repo đang ở chế độ công khai nên trang demo cũng công khai với bất kỳ ai có link (đã đặt `noindex` để hạn chế
> máy tìm kiếm). Muốn giới hạn người xem thì cần chuyển repo sang riêng tư với gói GitHub hỗ trợ Pages riêng tư,
> hoặc triển khai `dist/` lên máy chủ nội bộ.

## Có gì trong demo

| Màn hình | Thể hiện |
|----------|----------|
| **App launcher** (nút lưới trên thanh trên, trang *Tất cả ứng dụng*) | 20 module theo ảnh tham chiếu, nhóm WORKPLACE / HRM. Module có bản chạy thử hiển thị rõ; module khác hiển thị mờ và mở trang đặc tả chức năng + giai đoạn |
| **Trang chủ** | Việc cần duyệt, đơn / đề xuất của tôi, chấm công hôm nay, cảnh báo nhân sự (chứng chỉ ATLĐ, hợp đồng sắp hết hạn), thông báo nội bộ, **kịch bản demo 5 phút** |
| **Nhân sự** | Danh sách, sơ đồ tổ chức, hồ sơ chi tiết (hợp đồng, quá trình công tác, chứng chỉ, tài sản); **phân quyền xem** theo vai trò, lương chỉ HCNS / BGĐ / chính chủ thấy |
| **Đơn từ** | Nghỉ phép / ốm / không lương, công tác, làm thêm giờ, quên chấm công; quỹ phép theo thâm niên; **xem trước luồng duyệt**; duyệt / từ chối có ý kiến |
| **Chấm công** | Màn hình điện thoại: **geofence GPS theo công trường + ảnh xác thực**, chặn khi ở ngoài vùng; Chỉ huy trưởng **chấm công hộ**; **bảng công tháng** tự tổng hợp từ chấm công + đơn từ, chốt công, xuất Excel (CSV) |
| **Quy trình** | Mẫu đề nghị tạm ứng, đề xuất vật tư (bảng chi tiết), thanh toán thầu phụ; **biểu mẫu động**; luồng duyệt rẽ nhánh theo giá trị & công trình (vd. tạm ứng > 50 triệu tự thêm Tổng Giám đốc) |

### Vai trò mẫu (đổi ở góc trên bên phải)

| Người dùng | Vai trò | Dùng để thử |
|-----------|---------|-------------|
| Nguyễn Văn An | Kỹ sư giám sát, BCH công trường Ánh Dương | Chấm công GPS, tạo đơn, tạo đề xuất |
| Trần Minh Đức | Chỉ huy trưởng công trường Ánh Dương | Duyệt đơn / đề xuất của BCH, chấm công hộ, xem bảng công cấp dưới |
| Lê Thu Hà | Trưởng phòng HCNS | Xem toàn bộ hồ sơ & lương, cảnh báo nhân sự, chốt công |
| Đỗ Thị Lan | Kế toán trưởng | Duyệt tạm ứng, thanh toán |
| Phạm Quốc Bảo | Tổng Giám đốc | Duyệt đề xuất giá trị lớn |

Khi một phiếu đang chờ người khác duyệt, nút **Xem với vai trò này** trong chi tiết phiếu chuyển thẳng sang người duyệt đó.

## Kịch bản demo ~5 phút

1. Với vai trò **An**: vào *Chấm công*, thử *Ngoài CT* (nút bị khoá), quay lại *Trong CT*, chụp ảnh xác thực, **Vào ca**.
2. Bảng công của An có một ngày thiếu giờ ra (ô đỏ "?"). Tạo đơn **Quên chấm công** cho ngày đó (ngày được gợi ý sẵn).
3. Bấm **Xem với vai trò này** → thành **Đức** → **Duyệt**. Thử chấm công hộ cho 2 thành viên BCH.
4. Mở *Bảng công tháng*: ngày vừa giải trình chuyển thành "X", ngày nghỉ phép đã duyệt hiện "P".
5. Đổi lại **An**, tạo **Đề nghị tạm ứng** 80.000.000 ₫: luồng duyệt dự kiến tự thêm Tổng Giám đốc. Duyệt lần lượt Đức → Lan → Bảo.
6. Đổi sang **Hà**: xem hồ sơ Vũ Thị Mai (chứng chỉ ATLĐ sắp hết hạn), chốt công tháng. Đổi sang An và mở cùng hồ sơ — chỉ thấy thông tin danh bạ.

## Giới hạn của bản demo

- Không có backend, không đăng nhập thật — đổi vai trò thay cho đăng nhập.
- Ảnh xác thực và vị trí là giả lập (có tuỳ chọn *GPS thật* dùng định vị của trình duyệt).
- Dữ liệu chấm công các ngày trước được sinh tự động, ổn định theo từng người / ngày.
- Ngày lễ chỉ gồm các ngày lễ dương lịch cố định; Tết âm lịch, Giỗ Tổ cấu hình theo năm trong bản chính thức.
- 16 module còn lại mới có trang đặc tả, chưa có màn hình nghiệp vụ.

## Cấu trúc mã nguồn

```text
src/
├── data/            # dữ liệu mẫu: tổ chức, nhân viên, công trình, luồng duyệt, danh mục 20 module
├── lib/
│   ├── workflow.ts    # workflow engine thu nhỏ: xác định người duyệt, điều kiện, bỏ qua bước trùng
│   ├── attendance.ts  # tính ô bảng công từ chấm công + đơn từ
│   ├── permissions.ts # phạm vi dữ liệu theo vai trò
│   └── …              # lịch làm việc, geofence, quỹ phép, định dạng
├── store/           # trạng thái demo (zustand, lưu localStorage) + dữ liệu khởi tạo
├── components/      # khung ứng dụng, app launcher, đổi vai trò, luồng duyệt
└── pages/           # Trang chủ, Ứng dụng, Nhân sự, Đơn từ, Chấm công, Quy trình
```
