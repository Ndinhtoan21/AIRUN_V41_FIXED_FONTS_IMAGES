/* AIRUN V9.8.1 — Kho ảnh dùng chung. Mọi ảnh đều từ Wikimedia Commons, có giấy phép cho phép dùng lại
   (CC0 / CC BY / CC BY-SA) và luôn hiển thị kèm nguồn: tác giả · giấy phép · liên kết trang gốc.
   Ảnh dùng bản thu nhỏ 960 px chuẩn của Wikimedia (máy chủ chỉ phục vụ một số cỡ cố định). */
(() => {
  'use strict';
  const T = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  const W = 'https://commons.wikimedia.org/wiki/File:';
  // Ưu tiên ảnh chụp gần đây (năm chụp ghi trong dòng nguồn); không dùng ảnh trước 2018.
  const P = {
    dragon: { src: T + '0/04/Dragon_Bridge_Da_Nang_3.jpg/960px-Dragon_Bridge_Da_Nang_3.jpg', page: W + 'Dragon_Bridge_Da_Nang_3.jpg', title: 'Cầu Rồng bắc qua sông Hàn', year: 2018, by: 'Christophe95', lic: 'CC BY-SA 4.0' },
    ladyBuddha: { src: T + 'f/f2/Linh_Ung_Pagoda_6.jpg/960px-Linh_Ung_Pagoda_6.jpg', page: W + 'Linh_Ung_Pagoda_6.jpg', title: 'Tượng Phật Quan Âm chùa Linh Ứng, bán đảo Sơn Trà', year: 2018, by: 'Christophe95', lic: 'CC BY-SA 4.0', pos: 'center 40%' },
    chuaCau: { src: T + 'a/ae/2024_H%E1%BB%99i_An_-_Japanese_Covered_Bridge_%28Ch%C3%B9a_C%E1%BA%A7u%29_after_renovation_-_img_03.jpg/960px-2024_H%E1%BB%99i_An_-_Japanese_Covered_Bridge_%28Ch%C3%B9a_C%E1%BA%A7u%29_after_renovation_-_img_03.jpg', page: W + '2024_H%E1%BB%99i_An_-_Japanese_Covered_Bridge_(Ch%C3%B9a_C%E1%BA%A7u)_after_renovation_-_img_03.jpg', title: 'Chùa Cầu Hội An sau trùng tu', year: 2024, by: 'Chainwit.', lic: 'CC BY 4.0', pos: 'center 55%' },
    haiVan: { src: T + '9/91/%C4%90%C3%A0_N%E1%BA%B5ng%2C_H%E1%BA%A3i_V%C3%A2n_Pass%2C_2020-01_CN-01.jpg/960px-%C4%90%C3%A0_N%E1%BA%B5ng%2C_H%E1%BA%A3i_V%C3%A2n_Pass%2C_2020-01_CN-01.jpg', page: W + '%C4%90%C3%A0_N%E1%BA%B5ng,_H%E1%BA%A3i_V%C3%A2n_Pass,_2020-01_CN-01.jpg', title: 'Đèo Hải Vân nhìn xuống vịnh Đà Nẵng', year: 2020, by: 'Steffen Schmitz', lic: 'CC BY-SA 4.0', pos: 'center 55%' },
    hoaXuan: { src: T + '0/09/S%C3%A2n_v%E1%BA%ADn_%C4%90%E1%BB%99ng_Ho%C3%A0_Xu%C3%A2n_To%C3%A0n_C%E1%BA%A3nh.jpg/960px-S%C3%A2n_v%E1%BA%ADn_%C4%90%E1%BB%99ng_Ho%C3%A0_Xu%C3%A2n_To%C3%A0n_C%E1%BA%A3nh.jpg', page: W + 'S%C3%A2n_v%E1%BA%ADn_%C4%90%E1%BB%99ng_Ho%C3%A0_Xu%C3%A2n_To%C3%A0n_C%E1%BA%A3nh.jpg', title: 'Sân vận động Hòa Xuân, Cẩm Lệ', year: 2024, by: 'Darknights93', lic: 'CC BY-SA 4.0' },
    hanRiver: { src: T + '6/66/Han_River%2C_Da_Nang%2C_Vietnam_-_20230819.jpg/960px-Han_River%2C_Da_Nang%2C_Vietnam_-_20230819.jpg', page: W + 'Han_River,_Da_Nang,_Vietnam_-_20230819.jpg', title: 'Hai bờ sông Hàn', year: 2023, pos: 'center 85%', by: 'Somerset999', lic: 'CC BY-SA 4.0' },
    hanBridgeNight: { src: T + '7/77/Da_Nang_-_DaNang1492.jpg/960px-Da_Nang_-_DaNang1492.jpg', page: W + 'Da_Nang_-_DaNang1492.jpg', title: 'Cầu Sông Hàn lên đèn', year: 2024, by: 'lumoplank', lic: 'CC0' },
    dragonNight: { src: T + '7/7e/Dragon_Bridge%2C_Da_Nang_at_night_-_20230819.jpg/960px-Dragon_Bridge%2C_Da_Nang_at_night_-_20230819.jpg', page: W + 'Dragon_Bridge,_Da_Nang_at_night_-_20230819.jpg', title: 'Cầu Rồng về đêm', year: 2023, by: 'Somerset999', lic: 'CC BY-SA 4.0' },
    skyline: { src: T + '5/5f/2024-12-01_Da_Nang_3.jpg/960px-2024-12-01_Da_Nang_3.jpg', page: W + '2024-12-01_Da_Nang_3.jpg', title: 'Phố biển Đà Nẵng nhìn từ phía Thọ Quang', year: 2024, by: 'Alexkom000', lic: 'CC BY 4.0' },
    thoQuang: { src: T + 'c/c9/2024-12-01_Da_Nang%2C_Tho_Quang_Beach.jpg/960px-2024-12-01_Da_Nang%2C_Tho_Quang_Beach.jpg', page: W + '2024-12-01_Da_Nang,_Tho_Quang_Beach.jpg', title: 'Bãi biển Thọ Quang, Sơn Trà', year: 2024, by: 'Alexkom000', lic: 'CC BY 4.0' },
    mykheDawn: { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Pictures_of_My_Khe_beach_in_Da_Nang.jpg', page: W + 'Pictures_of_My_Khe_beach_in_Da_Nang.jpg', title: 'Bãi biển Mỹ Khê lúc sáng sớm', year: 2023, by: 'Crowundefined73d', lic: 'CC BY-SA 4.0' },
    mykheAerial: { src: T + 'e/e5/My_Khe_Beach_Danang_Coastline.jpg/960px-My_Khe_Beach_Danang_Coastline.jpg', page: W + 'My_Khe_Beach_Danang_Coastline.jpg', title: 'Bờ biển Mỹ Khê nhìn từ trên cao', year: 2022, by: 'Jpatokal', lic: 'CC BY-SA 4.0' },
    marble: { src: T + '1/1d/Da_Nang_Marble_Mountains_2020_IMG_4008.jpg/960px-Da_Nang_Marble_Mountains_2020_IMG_4008.jpg', page: W + 'Da_Nang_Marble_Mountains_2020_IMG_4008.jpg', title: 'Núi Ngũ Hành Sơn', year: 2020, by: 'Kuroczynski', lic: 'CC BY-SA 4.0' }
  };
  // Ảnh đại diện từng khu vực = địa danh nổi bật, dễ nhận ra nhất của khu vực đó. Thanh Khê chưa có ảnh địa danh riêng nên dùng ảnh phố biển nhìn từ vịnh, ghi đúng tên ảnh.
  const AREA = { HaiChau: 'dragon', AnHai: 'mykheAerial', SonTra: 'ladyBuddha', NguHanhSon: 'marble', ThanhKhe: 'skyline', LienChieu: 'haiVan', CamLe: 'hoaXuan', HoiAn: 'chuaCau' };
  // Góc chạy đẹp cho Trang chủ: ảnh + mẹo chạy + khu vực để lên kế hoạch.
  const SPOTS = [
    { photo: 'hanBridgeNight', area: 'HaiChau', name: 'Ven sông Hàn buổi tối', tip: 'Vỉa hè Bạch Đằng rộng, bằng phẳng, nhiều đèn. Hợp chạy tối và chạy đều nhịp.' },
    { photo: 'mykheDawn', area: 'AnHai', name: 'Biển Mỹ Khê lúc bình minh', tip: 'Đẹp nhất trước 6 giờ, gió biển mát. Sau 8 giờ nắng và UV tăng nhanh.' },
    { photo: 'ladyBuddha', area: 'SonTra', name: 'Bán đảo Sơn Trà', tip: 'Dốc dài, cảnh đẹp. Hợp buổi chạy dài cuối tuần, nhớ mang nước.' },
    { photo: 'dragonNight', area: 'HaiChau', name: 'Vòng cầu Rồng về đêm', tip: 'Vòng khoảng 5 km qua hai cây cầu, dễ chia nhịp theo từng đoạn.' },
    { photo: 'thoQuang', area: 'SonTra', name: 'Biển Thọ Quang', tip: 'Bãi biển yên, ít xe, nhiều thuyền thúng. Hợp chạy chậm buổi sáng.' },
    { photo: 'marble', area: 'NguHanhSon', name: 'Quanh núi Ngũ Hành Sơn', tip: 'Đường thoáng, ít dốc, gần biển. Chú ý nắng gắt buổi trưa.' },
    { photo: 'haiVan', area: 'LienChieu', name: 'Chân đèo Hải Vân', tip: 'Cung dốc thử sức cho người chạy lâu năm. Đi theo nhóm, tránh giờ xe tải đông.' },
    { photo: 'hoaXuan', area: 'CamLe', name: 'Quanh sân vận động Hòa Xuân', tip: 'Đường mới, rộng và thoáng. Hợp chạy biến tốc hoặc chạy đều buổi chiều.' },
    { photo: 'chuaCau', area: 'HoiAn', name: 'Phố cổ Hội An', tip: 'Chạy sớm trước 6 giờ khi phố vắng khách, đường ven sông mát.' }
  ];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const credit = (p) => `Ảnh: ${esc(p.by)} · ${p.year} · ${esc(p.lic)} · Wikimedia Commons`;
  // Khung ảnh có dòng nguồn bấm được (mở trang gốc có đầy đủ tác giả và giấy phép).
  function figure(id, { cls = '', caption = '', eager = false } = {}) {
    const p = P[id]; if (!p) return '';
    return `<figure class="ph ${cls}"><img src="${p.src}" alt="${esc(p.title)}"${p.pos ? ` style="object-position:${p.pos}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.closest('figure').classList.add('ph-off')">${caption ? `<span class="ph-cap">${caption}</span>` : ''}<figcaption><a href="${p.page}" target="_blank" rel="noopener" title="${esc(p.title)} — xem tác giả và giấy phép">${credit(p)}</a></figcaption></figure>`;
  }
  window.AIRUN_PHOTOS = { P, AREA, SPOTS, figure, credit, area: (key) => AREA[key] || 'skyline' };
})();
