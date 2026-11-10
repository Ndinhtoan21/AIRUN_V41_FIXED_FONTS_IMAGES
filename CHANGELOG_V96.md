# AIRUN V9.6 — HLV online, Cộng đồng, Cẩm nang

## AI Coach thành huấn luyện viên online
- **Thể trạng & BMI**: nhập chiều cao, cân nặng, năm sinh, mục tiêu. BMI tính ngay trên máy theo ngưỡng WHO cho người châu Á; người dưới 18 tuổi không bị xếp loại theo ngưỡng người lớn. Số đo chỉ lưu trên máy, không ghi vào Google Sheet.
- **Lộ trình nhiều tuần**: app lập theo quy tắc an toàn (tăng ≤ 10%/tuần, 4 tuần có 1 tuần giảm tải, người mới chạy xen đi bộ, tuần cuối giảm tải trước buổi mục tiêu). AI chỉ viết nhận xét, không đổi con số.
- **Dinh dưỡng**: gợi ý trước / trong / sau buổi chạy theo giờ chạy, thời lượng và độ nóng.
- **Câu hỏi ngoài lề**: thời tiết nơi khác hoặc ngày khác (dự báo 7 ngày Open-Meteo), địa điểm (Google Places / OpenStreetMap), ngày giờ. Máy chủ tra cứu số liệu thật rồi AI mới trả lời; kết quả địa điểm hiện thành thẻ có liên kết bản đồ.

## Cộng đồng (tab mới)
- Bảng xếp hạng theo tuần này / tuần trước / tháng này, lọc theo khu vực. Chỉ tính buổi chạy GPS của người đã đăng nhập (0,3–60 km, pace 2:45–16:00/km). Có lựa chọn ẩn tên.
- Bản tin khu vực: điểm hiện tại, cảnh báo 12 giờ tới và giờ đẹp nhất của 8 khu vực; tin do quản trị gõ vào tab `tin_tuc` của Google Sheet.
- **Cần cập nhật Apps Script** (`apps-script/Code.gs`, thêm hành động `community`) rồi triển khai phiên bản mới. Chưa cập nhật thì trang Cộng đồng vẫn có bản tin, bảng xếp hạng báo "sắp mở".

## Cẩm nang và tinh gọn
- Trang Cẩm nang (#/guide, nút ? ở góc trên): 3 bước bắt đầu nhanh + 11 mục hướng dẫn; lời chào một lần cho người mới.
- Thanh tab: Trang chủ · AI Coach · Chạy · Cộng đồng · Nhật ký (Thời tiết chuyển vào Danh mục ở Trang chủ).
- Form đánh giá sau chạy và mục Tiện ích được gập lại; bỏ ô "Tên/mã người thử"; thẻ "Kế hoạch 7 ngày" thay bằng Lộ trình.

## Lỗi đã sửa
- AI hoặc nút bấm đổi trang nhưng địa chỉ không đổi theo → bấm lại tab cũ không có tác dụng.
- Buổi chạy đồng bộ lên tài khoản bị ghi theo giờ đồng bộ thay vì giờ chạy.
- AI Coach không nói rõ "ngày mai" khi giờ chạy hôm nay đã qua.
- Hộp thoại tài khoản không cuộn được trên màn hình thấp.
