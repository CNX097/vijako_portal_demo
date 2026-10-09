import type { ComponentType, CSSProperties } from 'react';
import {
  AimOutlined,
  ApartmentOutlined,
  AuditOutlined,
  CalendarFilled,
  CarryOutFilled,
  CheckCircleFilled,
  DollarCircleFilled,
  EditFilled,
  FileTextFilled,
  FlagFilled,
  FolderOpenFilled,
  GlobalOutlined,
  LaptopOutlined,
  ProfileFilled,
  ProjectFilled,
  ReadFilled,
  SafetyCertificateFilled,
  TeamOutlined,
  UserAddOutlined,
  WalletFilled,
} from '@ant-design/icons';

export type ModuleGroup = 'WORKPLACE' | 'HRM';

export interface ModuleMeta {
  key: string;
  name: string;
  group: ModuleGroup;
  phase: 'GĐ1' | 'GĐ2' | 'GĐ3' | 'GĐ4';
  icon: ComponentType<{ style?: CSSProperties }>;
  color: string;
  bg: string;
  /** có màn hình chạy thử trong demo */
  route?: string;
  summary: string;
  mvp: string[];
  later: string[];
}

// Nội dung tóm tắt từ docs/02-dac-ta-module.md
export const MODULES: ModuleMeta[] = [
  {
    key: 'newsfeed', name: 'Mạng nội bộ', group: 'WORKPLACE', phase: 'GĐ1', icon: GlobalOutlined, color: '#2563eb', bg: '#eff6ff',
    summary: 'Kênh truyền thông nội bộ chính thức, thay cho các nhóm Zalo / email rời rạc.',
    mvp: ['Bảng tin: bài viết, ảnh / video, file; thích, bình luận, @nhắc tên', 'Thông báo chính thức có ghim, bắt buộc xác nhận đã đọc', 'Nhóm theo phòng ban, dự án', 'Danh bạ & sơ đồ tổ chức', 'Chúc mừng sinh nhật, kỷ niệm ngày vào công ty'],
    later: ['Khảo sát / bình chọn', 'Vinh danh', 'Sự kiện & đăng ký tham gia', 'Bản tin công trường từ module Dự án'],
  },
  {
    key: 'task', name: 'Công việc', group: 'WORKPLACE', phase: 'GĐ1', icon: CarryOutFilled, color: '#16a34a', bg: '#f0fdf4',
    summary: 'Giao việc và theo dõi việc hằng ngày minh bạch, không bỏ sót.',
    mvp: ['Giao việc: người thực hiện, phối hợp, theo dõi, hạn, ưu tiên', 'Việc con, checklist, đính kèm, bình luận', 'Xem dạng Danh sách / Kanban / Lịch', 'Việc định kỳ, nhắc hạn', 'Báo cáo việc quá hạn theo người / phòng ban'],
    later: ['Gantt & phụ thuộc', 'Ghi nhận thời gian', 'Mẫu công việc', 'Giao việc từ biên bản họp'],
  },
  {
    key: 'project', name: 'Dự án', group: 'WORKPLACE', phase: 'GĐ2', icon: ProjectFilled, color: '#d97706', bg: '#fffbeb',
    summary: 'Điều hành và theo dõi tiến độ công trình (không thay phần mềm dự toán).',
    mvp: ['Hồ sơ dự án, toạ độ geofence dùng cho chấm công', 'Thành viên & vai trò dự án', 'WBS, tiến độ kế hoạch / thực tế (Gantt)', 'Nhật ký thi công hằng ngày trên mobile, ảnh có toạ độ', 'Vấn đề / rủi ro, kiểm tra an toàn, sự cố'],
    later: ['Nghiệm thu & biên bản ký số', 'Quản lý thầu phụ', 'Trình duyệt vật liệu / bản vẽ shop', 'Dashboard danh mục dự án'],
  },
  {
    key: 'process', name: 'Quy trình', group: 'WORKPLACE', phase: 'GĐ1', icon: ApartmentOutlined, color: '#7c3aed', bg: '#f5f3ff', route: '/quy-trinh',
    summary: 'Số hoá mọi đề xuất / phê duyệt bằng biểu mẫu và luồng duyệt cấu hình được.',
    mvp: ['Mẫu dựng sẵn: tạm ứng, vật tư, thanh toán thầu phụ…', 'Thiết kế biểu mẫu kéo thả', 'Luồng duyệt rẽ nhánh theo giá trị, phòng ban, dự án', 'Uỷ quyền, SLA, nhắc & chuyển cấp', 'Duyệt trên mobile, in phiếu PDF'],
    later: ['Quy trình ISO 9001 / 14001', 'Báo cáo thời gian xử lý', 'Phiên bản quy trình'],
  },
  {
    key: 'document', name: 'Tài liệu', group: 'WORKPLACE', phase: 'GĐ3', icon: FolderOpenFilled, color: '#ea580c', bg: '#fff7ed',
    summary: 'Kho tài liệu tập trung, phân quyền rõ ràng, có phiên bản.',
    mvp: ['Không gian công ty / phòng ban / dự án / cá nhân', 'Phân quyền thư mục & tệp', 'Phiên bản, khoá khi đang sửa', 'Xem trước PDF, Office, ảnh', 'Tìm kiếm theo tên, nội dung (OCR)'],
    later: ['Tài liệu kiểm soát ISO', 'Xem bản vẽ DWG', 'Soạn thảo trực tuyến', 'Watermark khi tải'],
  },
  {
    key: 'esign', name: 'Ký số', group: 'WORKPLACE', phase: 'GĐ2', icon: EditFilled, color: '#2563eb', bg: '#eff6ff',
    summary: 'Ký số hợp pháp qua CA được cấp phép ngay trong hệ thống.',
    mvp: ['Ký số từ xa (VNPT SmartCA, Viettel MySign…) cá nhân & tổ chức', 'Luồng ký nhiều người, ký nháy', 'Đặt vị trí chữ ký trên PDF', 'Kiểm tra hiệu lực chữ ký, lưu vết'],
    later: ['Đối tác bên ngoài ký qua liên kết', 'USB token', 'Dấu thời gian (TSA)'],
  },
  {
    key: 'calendar', name: 'Lịch biểu', group: 'WORKPLACE', phase: 'GĐ1', icon: CalendarFilled, color: '#dc2626', bg: '#fef2f2',
    summary: 'Lịch họp, phòng họp, xe công, lịch công tác.',
    mvp: ['Lịch cá nhân / phòng ban / công ty', 'Mời họp & xác nhận', 'Đặt phòng họp, đặt xe (chống trùng)', 'Lịch công tác tuần Ban Giám đốc', 'Hiển thị lịch nghỉ / công tác đã duyệt'],
    later: ['Biên bản họp & giao việc', 'Đồng bộ Outlook / Google Calendar', 'Liên kết họp trực tuyến'],
  },
  {
    key: 'dispatch', name: 'Văn bản', group: 'WORKPLACE', phase: 'GĐ2', icon: FileTextFilled, color: '#ea580c', bg: '#fff7ed',
    summary: 'Văn bản đến, đi, nội bộ theo nghiệp vụ văn thư.',
    mvp: ['Văn bản đến: vào sổ, phân phối, giao xử lý', 'Văn bản đi: trình duyệt, ký số, cấp số tự động, phát hành', 'Văn bản nội bộ: quyết định, thông báo, quy chế', 'Sổ văn bản, tra cứu'],
    later: ['Mẫu văn bản trộn dữ liệu', 'Liên thông email', 'Lập hồ sơ lưu trữ'],
  },
  {
    key: 'asset', name: 'Tài sản', group: 'WORKPLACE', phase: 'GĐ3', icon: LaptopOutlined, color: '#16a34a', bg: '#f0fdf4',
    summary: 'Tài sản, máy móc thi công: đang ở đâu, ai giữ, tình trạng ra sao.',
    mvp: ['Danh mục tài sản, máy móc thi công, mã QR', 'Cấp phát / thu hồi, điều chuyển giữa công trường', 'Bảo trì, kiểm định định kỳ & nhắc hạn', 'Kiểm kê bằng quét QR trên mobile'],
    later: ['Đề xuất mua / cấp phát qua Quy trình', 'Thanh lý', 'Thiết bị thuê ngoài'],
  },
  {
    key: 'leave', name: 'Đơn từ', group: 'HRM', phase: 'GĐ1', icon: ProfileFilled, color: '#2563eb', bg: '#eff6ff', route: '/don-tu',
    summary: 'Nghỉ phép, làm thêm, công tác, giải trình công — duyệt trên điện thoại.',
    mvp: ['Nghỉ phép / ốm / không lương, công tác, làm thêm, quên chấm công', 'Quỹ phép tự động theo Bộ luật Lao động', 'Luồng duyệt theo cấp quản lý', 'Đồng bộ sang Chấm công & Lịch biểu'],
    later: ['Kiểm soát giới hạn làm thêm giờ', 'Đơn thôi việc kích hoạt offboarding'],
  },
  {
    key: 'recruit', name: 'Tuyển dụng', group: 'HRM', phase: 'GĐ2', icon: UserAddOutlined, color: '#ea580c', bg: '#fff7ed',
    summary: 'Từ nhu cầu tuyển đến nhận việc, không nhập lại dữ liệu.',
    mvp: ['Đề xuất nhu cầu tuyển dụng', 'Tin tuyển & trang tuyển dụng công khai', 'Pipeline ứng viên dạng Kanban', 'Lịch & phiếu đánh giá phỏng vấn', 'Chuyển ứng viên trúng tuyển sang Nhân sự'],
    later: ['Ngân hàng ứng viên', 'Đăng tin đa kênh', 'Giới thiệu nội bộ'],
  },
  {
    key: 'hr', name: 'Nhân sự', group: 'HRM', phase: 'GĐ1', icon: TeamOutlined, color: '#16a34a', bg: '#f0fdf4', route: '/nhan-su',
    summary: 'Hồ sơ nhân sự chuẩn — nguồn dữ liệu gốc cho toàn hệ thống.',
    mvp: ['Hồ sơ nhân viên, người phụ thuộc, tài khoản ngân hàng', 'Hợp đồng lao động & nhắc hết hạn', 'Quá trình công tác, luân chuyển công trường', 'Chứng chỉ ATLĐ / hành nghề & cảnh báo hết hạn', 'Onboarding / offboarding'],
    later: ['Hợp đồng lao động điện tử', 'Hồ sơ công nhân thời vụ', 'Dashboard nhân sự'],
  },
  {
    key: 'review', name: 'Đánh giá', group: 'HRM', phase: 'GĐ4', icon: AuditOutlined, color: '#d97706', bg: '#fffbeb',
    summary: 'Đánh giá thử việc, định kỳ và xếp loại.',
    mvp: ['Chu kỳ đánh giá thử việc / định kỳ', 'Mẫu phiếu theo chức danh', 'Tự đánh giá → quản lý → hiệu chỉnh', 'Lịch sử đánh giá'],
    later: ['Đánh giá 360°', 'Lấy điểm từ KPI / OKR', 'Kế hoạch phát triển cá nhân'],
  },
  {
    key: 'ivan', name: 'IVAN', group: 'HRM', phase: 'GĐ3', icon: SafetyCertificateFilled, color: '#7c3aed', bg: '#f5f3ff',
    summary: 'Kê khai BHXH, BHYT, BHTN điện tử qua nhà cung cấp I-VAN được cấp phép.',
    mvp: ['Thông tin BHXH của người lao động', 'Tự sinh báo tăng / giảm / điều chỉnh mức đóng', 'Nộp qua API nhà cung cấp I-VAN', 'Đối chiếu kết quả đóng hằng tháng'],
    later: ['Hồ sơ ốm đau, thai sản', 'Cấp lại sổ / thẻ'],
  },
  {
    key: 'training', name: 'Đào tạo', group: 'HRM', phase: 'GĐ2', icon: ReadFilled, color: '#dc2626', bg: '#fef2f2',
    summary: 'Kế hoạch đào tạo, khoá học, chứng chỉ và nhắc hạn huấn luyện lại.',
    mvp: ['Kế hoạch đào tạo năm, khoá học', 'Đăng ký / chỉ định học viên, điểm danh, kết quả', 'Hồ sơ đào tạo cá nhân', 'Chứng chỉ ATLĐ & cảnh báo hết hạn'],
    later: ['Học trực tuyến', 'Cam kết đào tạo', 'Khung năng lực'],
  },
  {
    key: 'attendance', name: 'Chấm công', group: 'HRM', phase: 'GĐ1', icon: CheckCircleFilled, color: '#2563eb', bg: '#eff6ff', route: '/cham-cong',
    summary: 'Chấm công GPS tại công trường, máy chấm công văn phòng, bảng công tự động.',
    mvp: ['Ca làm việc & xếp ca', 'Chấm công mobile GPS geofence + selfie', 'Đồng bộ máy chấm công văn phòng', 'Chỉ huy trưởng chấm công hộ', 'Bảng công tự tính, chốt công'],
    later: ['Nhận diện khuôn mặt chống giả mạo', 'Chấm công offline', 'Công theo dự án'],
  },
  {
    key: 'payroll', name: 'Bảng lương', group: 'HRM', phase: 'GĐ3', icon: DollarCircleFilled, color: '#dc2626', bg: '#fef2f2',
    summary: 'Tính lương tự động từ công, đơn từ, ứng lương; BHXH, thuế TNCN.',
    mvp: ['Thành phần lương & công thức cấu hình được', 'Nhiều mẫu bảng lương (văn phòng, công trường, khoán)', 'BHXH, thuế TNCN theo tham số', 'Duyệt, khoá kỳ, phiếu lương qua app', 'File chi lương ngân hàng, dữ liệu kế toán'],
    later: ['Quyết toán thuế TNCN', 'Phân bổ lương theo dự án', 'Thưởng KPI, lương tháng 13'],
  },
  {
    key: 'advance', name: 'Ứng lương', group: 'HRM', phase: 'GĐ3', icon: WalletFilled, color: '#16a34a', bg: '#f0fdf4',
    summary: 'Ứng lương theo hạn mức, tự khấu trừ vào kỳ lương.',
    mvp: ['Yêu cầu ứng trên mobile, hạn mức theo ngày công', 'Duyệt → kế toán xác nhận chi', 'Tự động khấu trừ vào bảng lương'],
    later: ['Chi tự động qua ngân hàng / đối tác'],
  },
  {
    key: 'kpi', name: 'KPI', group: 'HRM', phase: 'GĐ4', icon: AimOutlined, color: '#16a34a', bg: '#f0fdf4',
    summary: 'Đo hiệu suất theo bộ chỉ tiêu, làm cơ sở tính thưởng.',
    mvp: ['Thư viện chỉ tiêu theo phòng ban / chức danh', 'Giao KPI theo kỳ, trọng số', 'Kết quả tự động từ Công việc, Dự án, Chấm công', 'Dashboard'],
    later: ['Phân rã KPI công ty → cá nhân', 'Liên kết thưởng trong Bảng lương'],
  },
  {
    key: 'okr', name: 'OKR', group: 'HRM', phase: 'GĐ4', icon: FlagFilled, color: '#d97706', bg: '#fffbeb',
    summary: 'Mục tiêu & kết quả then chốt theo quý, check-in hằng tuần.',
    mvp: ['Mục tiêu công ty / phòng / cá nhân theo quý', 'Key Result đo lường được, căn chỉnh mục tiêu', 'Check-in hằng tuần, tiến độ tự tính'],
    later: ['Cây OKR toàn công ty', 'Gắn Công việc / Dự án vào Key Result'],
  },
];

export const getModule = (key: string) => MODULES.find((m) => m.key === key);
