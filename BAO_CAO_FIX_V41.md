# Báo cáo sửa AIRUN V4.1

## Vấn đề đã phát hiện

- Dự án V4.0 chỉ có một `assets/icon.svg`, vì vậy giao diện gần như không có hình minh họa về chạy bộ hoặc Đà Nẵng.
- Tiêu đề dùng Georgia/Times New Roman. Một số hệ điều hành không có cùng bộ glyph tiếng Việt nên chữ có thể lệch dấu, thay font hoặc hiển thị không đồng nhất.
- Service worker dùng cache `airun-v40-core`; khi deploy lại, trình duyệt/PWA có thể tiếp tục giữ tài nguyên cũ trong một khoảng thời gian.

## Thay đổi V4.1

- Chuẩn hóa UTF-8 và thêm `@charset "UTF-8"` cho CSS.
- Dùng `Be Vietnam Pro` cho toàn bộ giao diện, kèm fallback Unicode an toàn: system-ui, Segoe UI, Roboto, Arial.
- Loại bỏ Georgia/Times New Roman khỏi các heading để tránh fallback tiếng Việt không đồng nhất.
- Thêm 3 ảnh SVG nội bộ, sắc nét ở mọi màn hình: hero chạy bộ + Đà Nẵng, cung ven sông, cung ven biển.
- Bổ sung khu vực hình ảnh “Chạy giữa Đà Nẵng” và làm lại khối hero theo dạng ảnh + thẻ dữ liệu chồng lớp.
- Tối ưu bố cục ảnh cho breakpoint 1050 px, 780 px và 480 px.
- Nâng query asset và service-worker cache từ V40 lên V41, thêm các ảnh mới vào offline cache.

## Kiểm tra

- `node test_app.js`: PASS.
- `node --check app.js`: PASS.
- `node --check sw.js`: PASS.
- `manifest.webmanifest`: JSON hợp lệ.
- CSS parse: không có lỗi cú pháp.
- HTML parse: hợp lệ ở mức parser.
- 4 SVG: XML hợp lệ.
- Tất cả đường dẫn asset cục bộ: tồn tại.
- Quét mojibake UTF-8 phổ biến: không phát hiện.
