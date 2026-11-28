| Kết quả | Kiểm tra | Chi tiết |
|---|---|---|
| ĐẠT | Mã trình duyệt không chứa khoá bí mật | 24 tệp đã quét, 8 mẫu khoá |
| ĐẠT | /api/config không trả khoá nào | đã thử với đủ khoá Google, Mapbox, OpenAI, GraphHopper, Sheets |
| ĐẠT | Lớp chặn cuối xoá khoá nếu lỡ lọt vào thông báo lỗi | lỗi gọi https://maps.googleapis.com/x?key=*** và *** |
| ĐẠT | Dữ liệu môi trường có nguồn và thời điểm | thời tiết: số liệu lúc 2026-11-28T09:15:00+07:00, máy chủ lấy lúc 2026-11-28T01:14:07.430Z; không khí: 2026-11-28T09:00:00+07:00; lần 2 cached=true |
| ĐẠT | Toạ độ gửi Open-Meteo đã làm tròn ~1 km | 16.0600,108.2200 / 16.0600,108.2200 (vị trí thật 16.060312,108.220845) |
| ĐẠT | Không có số minh hoạ; nhãn nguồn hiển thị đúng | chưa có dữ liệu → "Đang tải"; có dữ liệu → "Nguồn: Open-Meteo · thời tiết lúc 09:15, không khí lúc 09:00 · cập nhật 1 giờ 6 phút trước" |

✓ V10 security/data checks passed (6/6)
