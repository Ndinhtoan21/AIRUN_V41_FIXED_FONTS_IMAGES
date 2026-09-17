# AIRUN Đà Nẵng V5.4

AIRUN là web app hỗ trợ chạy bộ: GPS tracker, thời tiết, AQI, lập kế hoạch theo giờ và ước tính quãng đường.

## V5.4
- Weather/Air current được tải trước để số liệu xuất hiện nhanh.
- Forecast theo giờ tải ở nền.
- Planner hoạt động ngay cả khi API đang chậm.
- Pace dự kiến -> tự tính quãng đường và tốc độ.
- GPS tracker vẫn hoạt động độc lập với Weather/Air API.

## Render
Dự án vẫn là Static Site. Copy đè toàn bộ file V5.4 vào repo hiện tại, commit và push `main`.

Sau deploy, kiểm tra 4 trạng thái trong Hero:
- ỨNG DỤNG: `V5.4 đang chạy`
- WEATHER API: thời gian phản hồi hoặc lỗi cụ thể
- AIR API: thời gian phản hồi hoặc lỗi cụ thể
- GPS: trạng thái quyền/vị trí

Nếu trình duyệt giữ bản cũ, dùng nút sửa cache hoặc xóa Site Data của AIRUN rồi tải lại.
