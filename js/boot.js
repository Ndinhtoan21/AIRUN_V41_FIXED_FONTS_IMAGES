  (()=>{
    setTimeout(()=>{
      if(window.__AIRUN_APP_READY)return; // V8: V7 so sánh với 'v61' nên luôn báo lỗi giả
      const connection=document.getElementById('connectionText');
      const chip=document.getElementById('jsStatusChip');
      const label=document.getElementById('jsStatus');
      const button=document.getElementById('diagnosticBtn');
      if(connection)connection.textContent='JavaScript chính chưa khởi động · GPS/API chưa thể hoạt động';
      if(chip)chip.dataset.state='error';
      if(label)label.textContent='AIRUN V8 chưa khởi động';
      if(button){
        button.textContent='Sửa cache & tải lại';
        button.onclick=async()=>{
          button.disabled=true;button.textContent='Đang làm sạch cache…';
          try{
            if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(reg=>reg.unregister()));}
            if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(key=>caches.delete(key)));}
          }catch{}
          const url=new URL(location.href);url.searchParams.set('airunV61Repair',Date.now());location.replace(url.toString());
        };
      }
    },2500);
  })();
