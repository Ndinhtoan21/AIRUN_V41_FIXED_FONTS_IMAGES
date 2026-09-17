# AIRUN V7.0

- Thử nghiệm GraphHopper Routing API cho cung chạy `round_trip`.
- Dùng `profile=foot`, khoảng cách mục tiêu từ Planner và seed thay đổi khi bấm Tạo cung khác.
- Tích hợp Mapbox GL JS v3.30.0 theo CDN chính thức.
- Style Mapbox Outdoors cho ngữ cảnh chạy bộ.
- Route vector có casing trắng, đường xanh AIRUN và lõi lime.
- Marker xuất phát/kết thúc và mốc kilomet trực tiếp trên Mapbox.
- Tự fit bounds toàn route.
- Thêm modal cấu hình Mapbox/GraphHopper trên website.
- Không hardcode key vào source; lưu localStorage trên thiết bị.
- Fallback về bản đồ/routing V6.3 khi chưa có key hoặc API lỗi.
