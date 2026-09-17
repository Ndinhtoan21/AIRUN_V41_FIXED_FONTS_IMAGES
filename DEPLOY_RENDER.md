# Deploy AIRUN V7.0

1. Giữ nguyên Static Site `airun-da-nang` trên Render.
2. Giữ nguyên 2 Rewrite Rule Weather/Air hiện tại.
3. Copy các file V7.0 vào root repo AIRUN.
4. Commit + push branch `main`.
5. Chờ Render `Deploy succeeded`.
6. Hard refresh website một lần.
7. Vào phần `Cung chạy gợi ý` → `Kết nối bản đồ nâng cao`.
8. Dán Mapbox public token (`pk...`) và GraphHopper API key.
9. Bấm `Lưu & kiểm tra kết nối`.
10. Chọn 3 km / 5 km / 10 km / Theo kế hoạch → `Tạo cung chạy phù hợp`.

Không gửi token/key vào chat hoặc commit trực tiếp vào GitHub.
