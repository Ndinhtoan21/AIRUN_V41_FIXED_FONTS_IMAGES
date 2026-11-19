/* AIRUN V9.8.1 — Kho ảnh dùng chung. Mọi ảnh đều từ Wikimedia Commons, có giấy phép cho phép dùng lại
   (CC0 / CC BY / CC BY-SA) và luôn hiển thị kèm nguồn: tác giả · giấy phép · liên kết trang gốc.
   Ảnh dùng bản thu nhỏ 960 px chuẩn của Wikimedia (máy chủ chỉ phục vụ một số cỡ cố định). */
(() => {
  'use strict';
  const T = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  const W = 'https://commons.wikimedia.org/wiki/File:';
  // Chỉ dùng ảnh chụp từ 2020 trở lại đây (năm chụp ghi trong dòng nguồn).
  const P = {
    hanRiver: { src: T + '6/66/Han_River%2C_Da_Nang%2C_Vietnam_-_20230819.jpg/960px-Han_River%2C_Da_Nang%2C_Vietnam_-_20230819.jpg', page: W + 'Han_River,_Da_Nang,_Vietnam_-_20230819.jpg', title: 'Hai bờ sông Hàn', year: 2023, by: 'Somerset999', lic: 'CC BY-SA 4.0' },
    hanBridgeNight: { src: T + '7/77/Da_Nang_-_DaNang1492.jpg/960px-Da_Nang_-_DaNang1492.jpg', page: W + 'Da_Nang_-_DaNang1492.jpg', title: 'Cầu Sông Hàn lên đèn', year: 2024, by: 'lumoplank', lic: 'CC0' },
    dragonNight: { src: T + '7/7e/Dragon_Bridge%2C_Da_Nang_at_night_-_20230819.jpg/960px-Dragon_Bridge%2C_Da_Nang_at_night_-_20230819.jpg', page: W + 'Dragon_Bridge,_Da_Nang_at_night_-_20230819.jpg', title: 'Cầu Rồng về đêm', year: 2023, by: 'Somerset999', lic: 'CC BY-SA 4.0' },
    riverCity: { src: T + 'd/d0/2024-11-08_Da_Nang_2.jpg/960px-2024-11-08_Da_Nang_2.jpg', page: W + '2024-11-08_Da_Nang_2.jpg', title: 'Sông Hàn và trung tâm Đà Nẵng', year: 2024, by: 'Alexkom000', lic: 'CC BY 4.0' },
    skyline: { src: T + '5/5f/2024-12-01_Da_Nang_3.jpg/960px-2024-12-01_Da_Nang_3.jpg', page: W + '2024-12-01_Da_Nang_3.jpg', title: 'Phố biển Đà Nẵng nhìn từ phía Thọ Quang', year: 2024, by: 'Alexkom000', lic: 'CC BY 4.0' },
    thoQuang: { src: T + 'c/c9/2024-12-01_Da_Nang%2C_Tho_Quang_Beach.jpg/960px-2024-12-01_Da_Nang%2C_Tho_Quang_Beach.jpg', page: W + '2024-12-01_Da_Nang,_Tho_Quang_Beach.jpg', title: 'Bãi biển Thọ Quang, Sơn Trà', year: 2024, by: 'Alexkom000', lic: 'CC BY 4.0' },
    sontra: { src: T + 'c/c8/2024-12-07_View_of_Da_Nang_2.jpg/960px-2024-12-07_View_of_Da_Nang_2.jpg', page: W + '2024-12-07_View_of_Da_Nang_2.jpg', title: 'Bán đảo Sơn Trà nhìn từ chùa Linh Ứng', year: 2024, by: 'Alexkom000', lic: 'CC BY 4.0' },
    mykheDawn: { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Pictures_of_My_Khe_beach_in_Da_Nang.jpg', page: W + 'Pictures_of_My_Khe_beach_in_Da_Nang.jpg', title: 'Bãi biển Mỹ Khê lúc sáng sớm', year: 2023, by: 'Crowundefined73d', lic: 'CC BY-SA 4.0' },
    mykheAerial: { src: T + 'e/e5/My_Khe_Beach_Danang_Coastline.jpg/960px-My_Khe_Beach_Danang_Coastline.jpg', page: W + 'My_Khe_Beach_Danang_Coastline.jpg', title: 'Bờ biển Mỹ Khê nhìn từ trên cao', year: 2022, by: 'Jpatokal', lic: 'CC BY-SA 4.0' },
    marble: { src: T + '1/1d/Da_Nang_Marble_Mountains_2020_IMG_4008.jpg/960px-Da_Nang_Marble_Mountains_2020_IMG_4008.jpg', page: W + 'Da_Nang_Marble_Mountains_2020_IMG_4008.jpg', title: 'Núi Ngũ Hành Sơn', year: 2020, by: 'Kuroczynski', lic: 'CC BY-SA 4.0' },
    namO: { src: T + 'f/f7/Nam_%C3%94%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpg/960px-Nam_%C3%94%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpg', page: W + 'Nam_%C3%94,_%C4%90%C3%A0_N%E1%BA%B5ng.jpg', title: 'Làng chài Nam Ô, Liên Chiểu', year: 2025, by: 'Bánhmỳchảo', lic: 'CC0' },
    khueDong: { src: T + '6/64/C%E1%BA%A7u_Khu%C3%AA_%C4%90%C3%B4ng.jpg/960px-C%E1%BA%A7u_Khu%C3%AA_%C4%90%C3%B4ng.jpg', page: W + 'C%E1%BA%A7u_Khu%C3%AA_%C4%90%C3%B4ng.jpg', title: 'Cầu Khuê Đông, Cẩm Lệ', year: 2025, by: 'Lê Huỳnh Bộ', lic: 'CC BY-SA 4.0' },
    hoian: { src: T + '9/9e/Hoi_An_Ancient_town.jpg/960px-Hoi_An_Ancient_town.jpg', page: W + 'Hoi_An_Ancient_town.jpg', title: 'Phố cổ Hội An bên sông Hoài', year: 2025, by: 'Andre Hospers', lic: 'CC BY 4.0' }
  };
  // Ảnh đại diện từng khu vực. Thanh Khê chưa có ảnh riêng nên dùng ảnh phố biển Đà Nẵng, ghi đúng tên ảnh.
  const AREA = { HaiChau: 'hanRiver', AnHai: 'riverCity', SonTra: 'sontra', NguHanhSon: 'marble', ThanhKhe: 'skyline', LienChieu: 'namO', CamLe: 'khueDong', HoiAn: 'hoian' };
  // Góc chạy đẹp cho Trang chủ: ảnh + mẹo chạy + khu vực để lên kế hoạch.
  const SPOTS = [
    { photo: 'hanBridgeNight', area: 'HaiChau', name: 'Ven sông Hàn buổi tối', tip: 'Vỉa hè Bạch Đằng rộng, bằng phẳng, nhiều đèn. Hợp chạy tối và chạy đều nhịp.' },
    { photo: 'mykheDawn', area: 'AnHai', name: 'Biển Mỹ Khê lúc bình minh', tip: 'Đẹp nhất trước 6 giờ, gió biển mát. Sau 8 giờ nắng và UV tăng nhanh.' },
    { photo: 'sontra', area: 'SonTra', name: 'Bán đảo Sơn Trà', tip: 'Dốc dài, cảnh đẹp. Hợp buổi chạy dài cuối tuần, nhớ mang nước.' },
    { photo: 'dragonNight', area: 'HaiChau', name: 'Vòng cầu Rồng – cầu Trần Thị Lý', tip: 'Vòng khoảng 5 km qua hai cây cầu, dễ chia nhịp theo từng đoạn.' },
    { photo: 'thoQuang', area: 'SonTra', name: 'Biển Thọ Quang', tip: 'Bãi biển yên, ít xe, nhiều thuyền thúng. Hợp chạy chậm buổi sáng.' },
    { photo: 'marble', area: 'NguHanhSon', name: 'Quanh núi Ngũ Hành Sơn', tip: 'Đường thoáng, ít dốc, gần biển. Chú ý nắng gắt buổi trưa.' },
    { photo: 'hoian', area: 'HoiAn', name: 'Phố cổ Hội An', tip: 'Chạy sớm trước 6 giờ khi phố vắng khách, đường ven sông mát.' }
  ];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const credit = (p) => `Ảnh: ${esc(p.by)} · ${p.year} · ${esc(p.lic)} · Wikimedia Commons`;
  // Khung ảnh có dòng nguồn bấm được (mở trang gốc có đầy đủ tác giả và giấy phép).
  function figure(id, { cls = '', caption = '', eager = false } = {}) {
    const p = P[id]; if (!p) return '';
    return `<figure class="ph ${cls}"><img src="${p.src}" alt="${esc(p.title)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.closest('figure').classList.add('ph-off')">${caption ? `<span class="ph-cap">${caption}</span>` : ''}<figcaption><a href="${p.page}" target="_blank" rel="noopener" title="${esc(p.title)} — xem tác giả và giấy phép">${credit(p)}</a></figcaption></figure>`;
  }
  window.AIRUN_PHOTOS = { P, AREA, SPOTS, figure, credit, area: (key) => AREA[key] || 'skyline' };
})();
