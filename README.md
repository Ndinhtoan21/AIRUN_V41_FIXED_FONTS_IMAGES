# AIRUN V6.2 — Plan → Route → Run

Luồng chính:
1. Lên kế hoạch chạy: giờ, thời lượng, pace.
2. AIRUN tính quãng đường dự kiến và phân tích Weather/AQI.
3. Tạo cung chạy theo số km: mặc định theo kế hoạch, hoặc chọn nhanh 3/5/10 km.
4. Điểm xuất phát ưu tiên GPS; nếu chưa cấp GPS thì dùng khu vực đã chọn.
5. AIRUN thử tạo cung đi-về theo mạng đường dành cho người đi bộ bằng Valhalla public demo.
6. Nếu routing công khai không phản hồi, AIRUN hiển thị phác thảo tham khảo và ghi rõ không dùng để dẫn đường.
7. Chọn “Dùng cung này & chạy” để đưa cung gợi ý sang GPS Tracker. Tracker vẽ cung kế hoạch và đường chạy thực tế riêng.

Weather/Air vẫn dùng 2 Rewrite Rule trên Render đã cấu hình ở các bản trước.
