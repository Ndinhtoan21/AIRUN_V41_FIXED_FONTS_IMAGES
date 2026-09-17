# AIRUN V5.6 — CẤU HÌNH RENDER SAME-ORIGIN API PROXY

AIRUN V5.6 KHÔNG gọi Open-Meteo trực tiếp từ trình duyệt nữa.
Bạn cần tạo đúng 2 Rewrite Rules trên Static Site `airun-da-nang`.

## Rule 1 — Weather
- Source: `/api/weather/:lat/:lon`
- Destination: `https://api.open-meteo.com/v1/forecast?latitude=:lat&longitude=:lon&timezone=Asia%2FHo_Chi_Minh&forecast_hours=36&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m`
- Action: `Rewrite`

## Rule 2 — Air quality
- Source: `/api/air/:lat/:lon`
- Destination: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=:lat&longitude=:lon&timezone=Asia%2FHo_Chi_Minh&forecast_hours=36&current=us_aqi,pm2_5,pm10,uv_index&hourly=us_aqi,pm2_5,pm10,uv_index`
- Action: `Rewrite`

## Kiểm tra trước khi mở AIRUN
Sau khi Save Changes, mở trực tiếp hai URL sau trên trình duyệt:

- `https://airun-da-nang.onrender.com/api/weather/16.0603/108.2208`
- `https://airun-da-nang.onrender.com/api/air/16.0603/108.2208`

Cả hai phải hiện JSON, KHÔNG phải giao diện AIRUN và KHÔNG phải 404.

Sau đó mở lại:
- `https://airun-da-nang.onrender.com`

Ô trạng thái phải chuyển thành:
- ỨNG DỤNG: `V5.6 Proxy đang chạy`
- WEATHER API: `xxx ms`
- AIR API: `xxx ms`

Nếu rewrite chưa được tạo, AIRUN sẽ báo `Chưa cấu hình proxy` thay vì chỉ `Không phản hồi`.
