# AIRUN Đà Nẵng V4.1

AIRUN giúp người chạy xem dữ liệu dự báo thời tiết, chất lượng không khí và tạo một kế hoạch chạy có giải thích rõ ràng.

## Điểm mới V4.1

- Chuẩn hóa font tiếng Việt bằng Be Vietnam Pro với fallback Unicode an toàn.
- Thêm 3 minh họa vector nội bộ về chạy bộ, sông Hàn và ven biển Đà Nẵng; không phụ thuộc hotlink ảnh ngoài.
- Tối ưu bố cục hero và thẻ hình trên điện thoại.
- Nâng service worker cache lên V4.1 để tránh giữ giao diện cũ sau khi deploy.

## Tính năng hiện có

- Tự thích nghi máy tính và điện thoại, không còn màn hình chọn thiết bị.
- Sửa hoàn toàn cấu trúc HTML bị hỏng trong V3.9.
- Dùng Open-Meteo Weather API và Air Quality API, không cần API key.
- Tự chuyển sang dữ liệu dự phòng khi mất mạng hoặc API tạm thời lỗi.
- Phân tích theo giờ chạy, thời lượng, cường độ và nhóm nhạy cảm.
- Gợi ý khung giờ tốt hơn, so sánh năm khu vực và giải thích lý do.
- Bản đồ 23 phường, GPS tìm phường gần nhất.
- Bộ đồ chạy thông minh, tính pace, kiểm tra an toàn.
- Nhật ký chạy lưu trên thiết bị và xuất CSV.
- PWA: có thể cài lên điện thoại khi website được chạy bằng HTTPS.

## Chạy local

Không mở trực tiếp bằng `file://` nếu muốn kiểm tra đầy đủ PWA. Trong thư mục dự án, chạy:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`.

## Đưa lên mạng

Đây là website tĩnh. Có thể kéo toàn bộ thư mục lên Netlify Drop hoặc đẩy lên GitHub rồi kết nối Netlify/Vercel. Không cần build command.

Với Render, tạo **Static Site**, chọn repository chứa các tệp ở thư mục gốc, để Build Command trống (hoặc dùng `echo AIRUN`) và đặt Publish Directory là `.`. Tệp `render.yaml` đã được chuẩn bị nếu dùng Blueprint.

## Nguồn và giới hạn

- Thời tiết: Open-Meteo Weather API.
- Chất lượng không khí: Open-Meteo Air Quality API.
- Bản đồ: OpenStreetMap qua Leaflet.
- Các dấu phường là điểm đại diện gần trung tâm khu vực, không phải dữ liệu đường ranh giới hành chính.
- Khi dùng dữ liệu trực tiếp hoặc bản đồ, trình duyệt tạo kết nối thông thường tới Open-Meteo, unpkg và OpenStreetMap; các nhà cung cấp đó có thể nhận thông tin kỹ thuật tiêu chuẩn như địa chỉ IP.
- Các giá trị API là dữ liệu dự báo theo mô hình và độ phân giải lưới, không phải cảm biến đặt tại từng phường.
- AIRUN là công cụ hỗ trợ quyết định, không thay thế tư vấn y tế hay cảnh báo chính thức.
