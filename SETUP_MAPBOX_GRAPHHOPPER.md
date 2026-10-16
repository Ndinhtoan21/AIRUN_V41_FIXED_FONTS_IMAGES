# Bản đồ nâng cao (V8)

Từ V8, người dùng **không nhập khóa trong trình duyệt** nữa. Khóa được đặt trong biến môi trường của Render Web Service:

- `GRAPHHOPPER_API_KEY`: GraphHopper Dashboard → API Keys → Add API Key. Máy chủ gọi GraphHopper qua `/api/route`, trình duyệt không nhìn thấy khóa.
- `MAPBOX_PUBLIC_TOKEN` (tùy chọn): token công khai `pk.` của Mapbox, nên giới hạn URL cho domain AIRUN. Không đặt thì dùng OpenFreeMap.

Không đặt GraphHopper thì AIRUN vẫn tạo cung vòng theo mạng đường đi bộ OpenStreetMap (Valhalla).
