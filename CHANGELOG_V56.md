# AIRUN V5.6

- Chuyển Weather/Air sang same-origin Render Rewrite proxy.
- Trình duyệt không còn gọi trực tiếp các domain Open-Meteo.
- Weather không còn yêu cầu UV; UV lấy từ Air Quality API.
- Phát hiện và báo rõ `Chưa cấu hình proxy` nếu `/api/...` trả về HTML/không phải JSON.
- Planner/GPS vẫn hoạt động độc lập với API.
