/* AIRUN V9.6 — Cẩm nang hướng dẫn sử dụng (trang #/guide) + lời chào lần đầu.
   Nội dung viết cho người mới: mỗi mục nói rõ "để làm gì – bấm ở đâu – mẹo", có nút mở thẳng tính năng. */
(() => {
  'use strict';
  if (typeof document === 'undefined') return;
  const el = (id) => document.getElementById(id);
  const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="#${name}"/></svg>`;
  const WELCOME_KEY = 'airun-v96-welcome';

  const QUICK = [
    ['i-gauge', 'Xem điểm "Bây giờ"', 'Mở Trang chủ. Điểm từ 7,5/10 trở lên là hợp để chạy; thấp hơn thì xem "Giờ tốt nhất sắp tới".', '#/home', 'Mở Trang chủ'],
    ['i-route', 'Tạo cung và bấm chạy', 'Vào tab Chạy, chọn số km (hoặc gõ nơi muốn chạy), bấm "Tạo cung", rồi "Bắt đầu chạy" và cho phép vị trí.', '#/run', 'Mở tab Chạy'],
    ['i-trophy', 'Kết thúc và xem lại', 'Bấm "Kết thúc" khi xong. Buổi chạy nằm trong Nhật ký; đăng nhập để có tên trên bảng xếp hạng.', '#/journal', 'Mở Nhật ký']
  ];
  const TOPICS = [
    { id: 'score', ic: 'i-house', title: 'Trang chủ và điểm AIRUN', go: ['#/home', 'Mở Trang chủ'], body: [
      ['Để làm gì', 'Trả lời nhanh câu hỏi "bây giờ có nên chạy không" bằng một điểm từ 0 đến 10. Điểm càng cao càng thuận lợi.'],
      ['Cách đọc', '8,5 trở lên: rất hợp · 7,5–8,4: hợp · 6,5–7,4: chạy nhẹ được · 5–6,4: nên đổi giờ · dưới 5: không nên chạy. Điểm tính từ nhiệt độ cảm nhận, không khí (AQI), mưa, gió và tia UV.'],
      ['Đổi khu vực', 'Bấm vào tên khu vực ở góc trên bên phải (ví dụ "Hải Châu") để chọn nơi bạn chạy.'],
      ['Mẹo', 'Dòng "Giờ tốt nhất sắp tới" cho biết nên dời buổi chạy sang lúc nào.']
    ] },
    { id: 'weather', ic: 'i-thermometer-sun', title: 'Thời tiết và không khí theo giờ', go: ['#/weather', 'Mở Thời tiết'], body: [
      ['Để làm gì', 'So sánh các khung giờ trong hôm nay và ngày mai cho từng khu vực.'],
      ['Cách dùng', 'Chọn khu vực → chọn ngày → chạm một khung giờ (Sáng sớm, Chiều tối…). Chạm Nhiệt độ, Không khí, Mưa, Gió, Tia UV hoặc Điểm chạy để đổi con số hiện to.'],
      ['Đặt giờ chạy', 'Thấy khung giờ ưng ý, bấm "Đặt giờ chạy này" để chuyển sang Kế hoạch.']
    ] },
    { id: 'plan', ic: 'i-calendar-clock', title: 'Kế hoạch buổi chạy', go: ['#/plan', 'Mở Kế hoạch'], body: [
      ['Để làm gì', 'Cho AIRUN biết bạn định chạy lúc mấy giờ, bao lâu, nhẹ hay nặng để chấm điểm đúng với buổi đó.'],
      ['Cách dùng', 'Chọn giờ chạy, thời lượng và cường độ (Nhẹ, Vừa, Cao). Nếu bạn bị hen, tim mạch hoặc dễ mệt khi nóng, bật "nhóm nhạy cảm" để AIRUN chấm khắt khe hơn.'],
      ['Mẹo', 'Nếu giờ bạn chọn hôm nay đã qua, AIRUN tự hiểu là giờ đó của ngày mai.']
    ] },
    { id: 'coach', ic: 'i-sparkles', title: 'AI Coach – huấn luyện viên online', go: ['#/coach', 'Mở AI Coach'], body: [
      ['Hôm nay', 'AI đọc đúng số liệu thời tiết, không khí và kế hoạch của bạn rồi nói: nên chạy lúc nào, chỉnh gì, mang gì, khi nào nên dừng.'],
      ['Hỏi tự do', 'Gõ câu hỏi vào ô chat. Hỏi được về tập luyện, ăn uống, phục hồi, và cả chuyện ngoài lề như "cuối tuần Hội An có mưa không", "gần cầu Rồng có chỗ gửi xe không", "hôm nay thứ mấy". Với thời tiết và địa điểm, AI tra cứu số liệu thật rồi mới trả lời.'],
      ['Thể trạng & BMI', 'Nhập chiều cao, cân nặng, năm sinh, mục tiêu. AIRUN tính BMI theo ngưỡng cho người châu Á và gợi ý cách tập. Các số này chỉ lưu trên máy bạn.'],
      ['Lộ trình', 'Bấm "Lập lộ trình cho tôi" để có kế hoạch nhiều tuần: mỗi tuần tăng không quá 10%, có tuần giảm tải. Bấm "Dùng buổi này" để đưa buổi tập vào Kế hoạch.'],
      ['Dinh dưỡng', 'Gợi ý ăn gì trước, trong và sau buổi chạy theo đúng giờ chạy và độ nóng hôm đó.'],
      ['Nhờ AI làm giúp', 'Nút "Hỏi AI" có ở mọi trang. Thử: "Tạo cung 5 km qua cầu Rồng", "Đổi sang 5:30 sáng mai, chạy 40 phút". AI đề xuất, bạn bấm "Làm luôn".']
    ] },
    { id: 'route', ic: 'i-route', title: 'Tạo cung chạy trên bản đồ', go: ['#/run', 'Mở tab Chạy'], body: [
      ['Cách 1 – nói bằng lời', 'Gõ "Chạy 5 km từ Cầu Rồng, qua Cầu Tình Yêu rồi quay lại" và bấm "AI tạo cung theo mô tả".'],
      ['Cách 2 – chọn số km', 'Chọn 3, 5, 10 km hoặc "Theo kế hoạch", chọn điểm xuất phát rồi bấm "Tạo cung".'],
      ['Điểm xuất phát', 'Ba cách: "Vị trí của tôi" (GPS), gõ tên địa điểm để tìm, hoặc "Chạm trên bản đồ". Chấm xanh dương là bạn, ghim là điểm xuất phát.'],
      ['Đọc kết quả', 'AIRUN cho biết độ dốc, tỉ lệ đường lớn và đường đất. Chưa ưng thì bấm tạo lại để có cung khác. Nút "Phóng to" mở bản đồ toàn màn hình.']
    ] },
    { id: 'gps', ic: 'i-footprints', title: 'Chạy với GPS và chế độ chạy', go: ['#/run-gps', 'Mở phần Chạy GPS'], body: [
      ['Bắt đầu', 'Bấm "Bắt đầu chạy" và chọn "Cho phép" khi trình duyệt hỏi quyền vị trí. Trên iPhone nên bật "Vị trí chính xác".'],
      ['Chế độ chạy', 'Bấm "Mở chế độ chạy" để có bản đồ toàn màn hình, số to dễ nhìn và giọng nói chỉ đường (rẽ trái, rẽ phải, lệch cung).'],
      ['Giữ màn hình sáng', 'Bản web chỉ ghi GPS ổn định khi AIRUN đang mở trên màn hình. Đừng khoá máy hay chuyển sang ứng dụng khác trong lúc chạy.'],
      ['Tạm dừng, kết thúc', '"Tạm dừng" khi chờ đèn đỏ hoặc uống nước; "Kết thúc" để lưu buổi chạy.'],
      ['Mẹo', 'Đứng ngoài trời 10–20 giây trước khi chạy để GPS ổn định; mang pin đủ 30% trở lên.']
    ] },
    { id: 'after', ic: 'i-check', title: 'Sau buổi chạy', go: ['#/journal', 'Mở Nhật ký'], body: [
      ['Đánh giá 30 giây', 'Mở "Bước 5 · Đánh giá khuyến nghị" ở cuối tab Chạy: AIRUN chấm đúng, quá khắt khe hay quá dễ dãi? Câu trả lời của bạn giúp điểm số lần sau sát với cảm nhận của bạn hơn.'],
      ['Xem lại', 'Trong Nhật ký, chạm vào buổi chạy để xem bản đồ hành trình, thời gian từng km và tải file GPX.'],
      ['Lưu ý', 'Bản đồ hành trình chỉ lưu trên máy bạn; máy chủ chỉ nhận số km, thời gian và khu vực.']
    ] },
    { id: 'community', ic: 'i-trophy', title: 'Cộng đồng: xếp hạng và bản tin', go: ['#/community', 'Mở Cộng đồng'], body: [
      ['Bảng xếp hạng', 'Xếp theo tổng km chạy GPS trong tuần hoặc tháng. Chạm tên khu vực để xem riêng khu vực đó.'],
      ['Để có tên', 'Đăng nhập, rồi chạy bằng GPS từ 0,3 km. Buổi chạy tự được tính sau vài phút.'],
      ['Ẩn tên', 'Không muốn hiện tên? Tích "Ẩn tên tôi trên bảng xếp hạng" ở cuối bảng.'],
      ['Bản tin khu vực', 'Mỗi khu vực có điểm hiện tại, cảnh báo mưa dông, nắng gắt, không khí kém trong 12 giờ tới và giờ đẹp nhất để chạy.']
    ] },
    { id: 'account', ic: 'i-user-round', title: 'Tài khoản và dữ liệu của bạn', go: ['#/journal', 'Mở hồ sơ'], body: [
      ['Tạo tài khoản', 'Bấm biểu tượng người ở góc trên, chọn "Tạo tài khoản", đặt tên người chạy và mã PIN 4–6 số. Không cần email hay số điện thoại.'],
      ['Được gì', 'Buổi chạy và kế hoạch được nhớ khi đổi máy, AI Coach tư vấn theo thói quen của bạn, và bạn có tên trên bảng xếp hạng.'],
      ['Riêng tư', 'Không đăng nhập vẫn dùng được, dữ liệu nằm trên máy. Chiều cao, cân nặng, BMI và bản đồ hành trình không bao giờ gửi vào bảng dữ liệu của nhóm.']
    ] },
    { id: 'install', ic: 'i-maximize', title: 'Đưa AIRUN ra màn hình chính', body: [
      ['iPhone', 'Mở AIRUN bằng Safari → bấm nút Chia sẻ (ô vuông có mũi tên) → "Thêm vào Màn hình chính".'],
      ['Android', 'Mở bằng Chrome → bấm ⋮ ở góc trên → "Thêm vào màn hình chính" hoặc "Cài đặt ứng dụng".'],
      ['Lợi ích', 'AIRUN mở toàn màn hình như một ứng dụng, vào nhanh hơn khi chuẩn bị chạy.']
    ] },
    { id: 'faq', ic: 'i-help', title: 'Gặp trục trặc thì làm gì', body: [
      ['GPS không bắt được', 'Kiểm tra đã bật Định vị của máy và đã cho phép trình duyệt dùng vị trí. Ra chỗ thoáng, đợi 20 giây rồi bấm lại. Trên iPhone: Cài đặt → Quyền riêng tư → Dịch vụ định vị → Safari → "Khi dùng ứng dụng".'],
      ['Quãng đường bị thiếu', 'Thường do khoá màn hình hoặc chuyển ứng dụng khi đang chạy. Hãy dùng "Chế độ chạy" và để màn hình sáng.'],
      ['AI không trả lời', 'Đợi vài giây rồi hỏi lại. Nếu vẫn lỗi, AIRUN tự dùng phần giải thích theo công thức nên bạn vẫn có khuyến nghị.'],
      ['Không thấy tên trên bảng', 'Cần đăng nhập trước khi chạy, buổi chạy phải dùng GPS và dài từ 0,3 km. Bảng cập nhật sau vài phút.'],
      ['Vẫn chưa được', 'Vào Nhật ký → Góp ý, mô tả lỗi và loại máy bạn dùng. Nhóm AIRUN đọc tất cả góp ý.']
    ] }
  ];

  function render() {
    const box = el('guidePage'); if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    box.innerHTML = `<div class="wx-head"><div><p class="eyebrow">CẨM NANG AIRUN</p><h2>Dùng AIRUN trong 1 phút</h2><p class="step-lead">Ba bước để có buổi chạy đầu tiên. Bên dưới là hướng dẫn chi tiết từng tính năng.</p></div></div>
      <ol class="gd-quick">${QUICK.map(([ic, t, d, href, label], i) => `<li><span class="gd-num">${i + 1}</span><div><b>${icon(ic)}${t}</b><p>${d}</p><a class="chip-btn" href="${href}">${label}</a></div></li>`).join('')}</ol>
      <h3 class="hub-h">Hướng dẫn từng tính năng</h3>
      <div class="gd-topics">${TOPICS.map((t) => `<details class="fold gd-topic" id="guide-${t.id}"><summary><span class="cat-ic">${icon(t.ic)}</span><span><b>${t.title}</b></span>${icon('i-chevron-down')}</summary><dl>${t.body.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>${t.go ? `<a class="primary gd-go" href="${t.go[0]}">${t.go[1]} ${icon('i-arrow-right')}</a>` : ''}</details>`).join('')}</div>
      <div class="gd-foot"><p>Chưa rõ chỗ nào? Hỏi thẳng AI Coach, ví dụ: "Hướng dẫn mình chạy buổi đầu tiên".</p><button type="button" class="soft-btn" id="gdAsk">${icon('i-sparkles')}Hỏi AI Coach</button><button type="button" class="soft-btn" id="gdWelcome">Xem lại lời chào</button></div>`;
    el('gdAsk')?.addEventListener('click', () => { if (typeof openAiDrawer === 'function') openAiDrawer(); });
    el('gdWelcome')?.addEventListener('click', () => showWelcome(true));
  }

  /* ---------- Lời chào lần đầu ---------- */
  function showWelcome(force = false) {
    if (!force && localGet(WELCOME_KEY, false)) return;
    let d = el('welcomeDialog');
    if (!d) {
      d = document.createElement('dialog'); d.id = 'welcomeDialog'; d.className = 'welcome-dialog';
      d.innerHTML = `<p class="eyebrow">CHÀO MỪNG ĐẾN AIRUN</p><h2>Chạy thông minh hơn ở Đà Nẵng</h2>
        <ol class="gd-quick compact">${QUICK.map(([ic, t, d2], i) => `<li><span class="gd-num">${i + 1}</span><div><b>${icon(ic)}${t}</b><p>${d2}</p></div></li>`).join('')}</ol>
        <div class="cp-actions"><button type="button" class="primary" id="welcomeStart">Bắt đầu dùng</button><a class="soft-btn" href="#/guide" id="welcomeGuide">${icon('i-book-open')}Xem cẩm nang</a></div>
        <p class="cp-note">Mở lại hướng dẫn bất cứ lúc nào bằng nút ? ở góc trên.</p>`;
      document.body.appendChild(d);
      const close = () => { localSet(WELCOME_KEY, true); if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); };
      d.querySelector('#welcomeStart').addEventListener('click', close);
      d.querySelector('#welcomeGuide').addEventListener('click', close);
      d.addEventListener('close', () => localSet(WELCOME_KEY, true));
      d.addEventListener('click', (e) => { if (e.target === d) close(); });
    }
    if (d.open) return;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }

  document.addEventListener('airun:view', (e) => { if (e.detail?.view === 'guide') render(); });
  const cat = el('catGuide'); if (cat) cat.textContent = 'Bắt đầu trong 1 phút';
  if (document.body.dataset.view === 'guide') render();
  // Người mới (chưa có nhật ký, chưa xem lời chào) → chào một lần ở Trang chủ.
  setTimeout(() => { try { if (document.body.dataset.view === 'home' && !journalRows().length && !document.querySelector('dialog[open]')) showWelcome(); } catch {} }, 1400);
  window.__airunGuide = { showWelcome, render };
})();
