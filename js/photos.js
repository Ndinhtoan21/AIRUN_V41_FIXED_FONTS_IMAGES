/* AIRUN V9.8 — Kho ảnh dùng chung. Mọi ảnh đều từ Wikimedia Commons, có giấy phép cho phép dùng lại
   (CC0 / CC BY / CC BY-SA) và luôn hiển thị kèm nguồn: tác giả · giấy phép · liên kết trang gốc.
   Ảnh dùng bản thu nhỏ 960 px chuẩn của Wikimedia (máy chủ chỉ phục vụ một số cỡ cố định). */
(() => {
  'use strict';
  const T = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  const W = 'https://commons.wikimedia.org/wiki/File:';
  const P = {
    bachdang: { src: T + '4/4d/Bachdangtay.jpg/960px-Bachdangtay.jpg', page: W + 'Bachdangtay.jpg', title: 'Vỉa hè ven sông Hàn, đường Bạch Đằng', by: 'Fa2f', lic: 'CC BY 3.0' },
    bachdangDong: { src: T + '3/31/Bachdangdong.jpg/960px-Bachdangdong.jpg', page: W + 'Bachdangdong.jpg', title: 'Bờ đông sông Hàn', by: 'Fa2f', lic: 'CC BY 3.0' },
    dragon: { src: T + 'd/d1/Da_nang_dragon_bridge.jpg/960px-Da_nang_dragon_bridge.jpg', page: W + 'Da_nang_dragon_bridge.jpg', title: 'Cầu Rồng bắc qua sông Hàn', by: 'Thangphan', lic: 'CC0' },
    tranThiLy: { src: T + '5/58/Tr%E1%BA%A7n_Th%E1%BB%8B_L%C3%BD_Bridge%2C_Da_Nang.jpg/960px-Tr%E1%BA%A7n_Th%E1%BB%8B_L%C3%BD_Bridge%2C_Da_Nang.jpg', page: W + 'Tr%E1%BA%A7n_Th%E1%BB%8B_L%C3%BD_Bridge,_Da_Nang.jpg', title: 'Cầu Trần Thị Lý', by: 'Quangpraha', lic: 'CC0' },
    mykheDawn: { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Pictures_of_My_Khe_beach_in_Da_Nang.jpg', page: W + 'Pictures_of_My_Khe_beach_in_Da_Nang.jpg', title: 'Bãi biển Mỹ Khê lúc sáng sớm', by: 'Crowundefined73d', lic: 'CC BY-SA 4.0' },
    mykheAerial: { src: T + 'e/e5/My_Khe_Beach_Danang_Coastline.jpg/960px-My_Khe_Beach_Danang_Coastline.jpg', page: W + 'My_Khe_Beach_Danang_Coastline.jpg', title: 'Bờ biển Mỹ Khê nhìn từ trên cao', by: 'Jpatokal', lic: 'CC BY-SA 4.0' },
    coracles: { src: T + '1/12/Da-Nang_Vietnam_Coracles-01.jpg/960px-Da-Nang_Vietnam_Coracles-01.jpg', page: W + 'Da-Nang_Vietnam_Coracles-01.jpg', title: 'Thuyền thúng trên bãi biển Đà Nẵng', by: 'CEphoto, Uwe Aranas', lic: 'CC BY-SA 3.0' },
    sontra: { src: T + '4/46/Son_Tra_Peninsula.jpg/960px-Son_Tra_Peninsula.jpg', page: W + 'Son_Tra_Peninsula.jpg', title: 'Bán đảo Sơn Trà nhìn từ đường lên chùa Linh Ứng', by: 'Christophe95', lic: 'CC BY-SA 4.0' },
    marble: { src: T + '4/44/Marble_Mountains%2C_Vietnam.jpg/960px-Marble_Mountains%2C_Vietnam.jpg', page: W + 'Marble_Mountains,_Vietnam.jpg', title: 'Núi Ngũ Hành Sơn', by: 'Bernard Gagnon', lic: 'CC BY-SA 3.0' },
    namO: { src: T + 'f/f7/Nam_%C3%94%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpg/960px-Nam_%C3%94%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpg', page: W + 'Nam_%C3%94,_%C4%90%C3%A0_N%E1%BA%B5ng.jpg', title: 'Làng chài Nam Ô, Liên Chiểu', by: 'Bánhmỳchảo', lic: 'CC0' },
    khueDong: { src: T + '6/64/C%E1%BA%A7u_Khu%C3%AA_%C4%90%C3%B4ng.jpg/960px-C%E1%BA%A7u_Khu%C3%AA_%C4%90%C3%B4ng.jpg', page: W + 'C%E1%BA%A7u_Khu%C3%AA_%C4%90%C3%B4ng.jpg', title: 'Cầu Khuê Đông, Cẩm Lệ', by: 'Lê Huỳnh Bộ', lic: 'CC BY-SA 4.0' },
    hoian: { src: T + '9/9e/Hoi_An_Ancient_town.jpg/960px-Hoi_An_Ancient_town.jpg', page: W + 'Hoi_An_Ancient_town.jpg', title: 'Phố cổ Hội An bên sông Hoài', by: 'Andre Hospers', lic: 'CC BY 4.0' },
    cityView: { src: T + '0/0f/Da_Nang_view_from_top_of_Son_Tra.jpg/960px-Da_Nang_view_from_top_of_Son_Tra.jpg', page: W + 'Da_Nang_view_from_top_of_Son_Tra.jpg', title: 'Toàn cảnh Đà Nẵng nhìn từ núi Sơn Trà', by: 'Fa2f', lic: 'CC BY 3.0' }
  };
  // Ảnh đại diện từng khu vực (đúng địa danh thuộc khu vực đó; Thanh Khê chưa có ảnh riêng nên dùng ảnh toàn cảnh, ghi rõ tên).
  const AREA = { HaiChau: 'bachdang', AnHai: 'bachdangDong', SonTra: 'sontra', NguHanhSon: 'marble', ThanhKhe: 'cityView', LienChieu: 'namO', CamLe: 'khueDong', HoiAn: 'hoian' };
  // Góc chạy đẹp cho Trang chủ: ảnh + mẹo chạy + khu vực để lên kế hoạch.
  const SPOTS = [
    { photo: 'bachdang', area: 'HaiChau', name: 'Ven sông Bạch Đằng', tip: 'Vỉa hè rộng, bằng phẳng, nhiều đèn. Hợp chạy tối và chạy đều nhịp.' },
    { photo: 'mykheDawn', area: 'AnHai', name: 'Biển Mỹ Khê lúc bình minh', tip: 'Đẹp nhất trước 6 giờ, gió biển mát. Sau 8 giờ nắng và UV tăng nhanh.' },
    { photo: 'sontra', area: 'SonTra', name: 'Bán đảo Sơn Trà', tip: 'Dốc dài, cảnh đẹp. Hợp buổi chạy dài cuối tuần, nhớ mang nước.' },
    { photo: 'tranThiLy', area: 'HaiChau', name: 'Vòng hai cầu Rồng – Trần Thị Lý', tip: 'Vòng khoảng 5 km quanh hai cây cầu, dễ chia nhịp theo từng đoạn.' },
    { photo: 'marble', area: 'NguHanhSon', name: 'Quanh núi Ngũ Hành Sơn', tip: 'Đường thoáng, ít dốc, gần biển. Chú ý nắng gắt buổi trưa.' },
    { photo: 'hoian', area: 'HoiAn', name: 'Phố cổ Hội An', tip: 'Chạy sớm trước 6 giờ khi phố vắng khách, đường ven sông mát.' }
  ];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const credit = (p) => `Ảnh: ${esc(p.by)} · ${esc(p.lic)} · Wikimedia Commons`;
  // Khung ảnh có dòng nguồn bấm được (mở trang gốc có đầy đủ tác giả và giấy phép).
  function figure(id, { cls = '', caption = '', eager = false } = {}) {
    const p = P[id]; if (!p) return '';
    return `<figure class="ph ${cls}"><img src="${p.src}" alt="${esc(p.title)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.closest('figure').classList.add('ph-off')">${caption ? `<span class="ph-cap">${caption}</span>` : ''}<figcaption><a href="${p.page}" target="_blank" rel="noopener" title="${esc(p.title)} — xem tác giả và giấy phép">${credit(p)}</a></figcaption></figure>`;
  }
  window.AIRUN_PHOTOS = { P, AREA, SPOTS, figure, credit, area: (key) => AREA[key] || 'cityView' };
})();
