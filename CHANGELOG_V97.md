# AIRUN V9.7 — Bản tin hằng ngày, sự kiện tìm thành viên, quản trị đăng bài

## Bản tin hôm nay (tự tổng hợp)
- Mỗi ngày máy chủ tổng hợp dự báo Open-Meteo cho 8 khu vực (2 lượt gọi cho cả 8 khu vực, lưu 30 phút) và số liệu chạy GPS của cộng đồng (hôm qua, hôm nay, tuần này).
- AI viết tiêu đề, 2–3 câu tổng quan và 3 điểm nhấn, chỉ dựa trên các số liệu đó. AI chỉ viết **1 lần mỗi ngày**; bản tin được lưu vào tab `ban_tin_ngay` của Google Sheet để mọi lượt truy cập dùng chung. Khi AI lỗi, bản tin được viết theo quy tắc.
- Ô số liệu: nhiệt độ thấp–cao, mặt trời mọc/lặn, khu vực không khí sạch nhất, giờ mát nhất còn lại, UV cao nhất, km cộng đồng hôm qua.
- Ảnh cho 7 khu vực từ Wikimedia Commons (CC0 / CC BY / CC BY-SA), có ghi tác giả và liên kết giấy phép trên từng ảnh.

## Sự kiện tìm thành viên
- Quản trị đăng sự kiện ngay trong app: tiêu đề, ngày, giờ, địa điểm tập trung, khu vực, cự ly, số chỗ, liên hệ, mô tả, ảnh (link https hoặc link chia sẻ Google Drive), link chi tiết.
- Người dùng đã đăng nhập bấm **Tham gia / Huỷ**; có thanh số chỗ và tên người tham gia; tự khoá khi đủ người. Danh sách đăng ký nằm ở tab `dang_ky`.

## Quản trị
- Quyền quản trị theo tài khoản AIRUN: gõ `admin` vào cột `vai_tro` (tab `nguoi_chay`) ở dòng tài khoản của bạn. Không cần thêm mật khẩu hay biến môi trường.
- Đăng tin tức có ảnh; nút **Ẩn** dưới mỗi bài (ghi `an` vào cột `hien`). Người không phải quản trị gọi API đăng bài bị từ chối (403).

## Cần cập nhật Apps Script
- Dán lại `apps-script/Code.gs` và triển khai **phiên bản mới**. Các tab `tin_tuc`, `su_kien`, `dang_ky`, `ban_tin_ngay` và cột `vai_tro` được tạo tự động.
- Chưa cập nhật thì Bản tin hôm nay vẫn chạy (chỉ phần thời tiết); sự kiện và xếp hạng chưa hiện.
