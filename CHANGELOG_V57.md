# AIRUN V5.7

- Tách hoàn toàn lỗi cache cũ khỏi luồng gọi Weather/Air API.
- Dùng key cache V5.7 mới, không đọc cache schema cũ.
- Kiểm tra schema cache trước khi render.
- Bắt đầu request Weather/Air trước khi render dữ liệu tức thời.
- Một lỗi render/cache không thể ngăn API được gọi.
- renderHero có fallback an toàn khi payload không hợp lệ.
- Sửa trạng thái app thành V5.7 Live API.
