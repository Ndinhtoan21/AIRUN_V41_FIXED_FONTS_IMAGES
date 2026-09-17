'use strict';

const $ = id => document.getElementById(id);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 0) => Number(Number(value).toFixed(digits));
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

const WARDS = [
  {key:'HaiChau',name:'Hải Châu',lat:16.0603,lon:108.2208,desc:'Trung tâm đô thị; gần sông Hàn, công viên và nhiều tuyến đường bằng phẳng.',mock:[64,18,29,33,72,9]},
  {key:'HoaCuong',name:'Hòa Cường',lat:16.0367,lon:108.2165,desc:'Khu vực nội đô phía nam trung tâm, thuận tiện cho các vòng chạy ngắn.',mock:[61,17,29,33,73,8]},
  {key:'ThanhKhe',name:'Thanh Khê',lat:16.0668,lon:108.1846,desc:'Khu dân cư đông; nên ưu tiên khung giờ ít xe và tuyến đường thông thoáng.',mock:[72,21,30,34,71,10]},
  {key:'AnKhe',name:'An Khê',lat:16.0598,lon:108.1735,desc:'Khu vực phía tây trung tâm, có thể kết hợp các đoạn đường dân cư yên tĩnh.',mock:[70,20,30,34,70,9]},
  {key:'AnHai',name:'An Hải',lat:16.0678,lon:108.2352,desc:'Phía đông sông Hàn, tiếp cận nhanh các tuyến ven sông và hướng ra biển.',mock:[58,16,29,32,74,11]},
  {key:'SonTra',name:'Sơn Trà',lat:16.1063,lon:108.2770,desc:'Bán đảo và vùng ven biển; địa hình đa dạng, cần chú ý độ dốc và gió.',mock:[42,11,28,31,76,13]},
  {key:'NguHanhSon',name:'Ngũ Hành Sơn',lat:16.0052,lon:108.2643,desc:'Dải ven biển phía nam, có nhiều đoạn chạy thoáng nhưng nắng và gió rõ hơn.',mock:[51,14,29,33,75,14]},
  {key:'HoaKhanh',name:'Hòa Khánh',lat:16.0760,lon:108.1454,desc:'Khu đô thị và công nghiệp phía tây bắc; nên tránh giờ giao thông cao điểm.',mock:[79,24,30,35,69,8]},
  {key:'LienChieu',name:'Liên Chiểu',lat:16.1044,lon:108.1323,desc:'Gần vịnh Đà Nẵng, có các đoạn ven biển và khu dân cư tương đối rộng.',mock:[68,19,29,33,73,12]},
  {key:'HaiVan',name:'Hải Vân',lat:16.1561,lon:108.0875,desc:'Diện tích rộng, có địa hình đồi núi; chỉ chạy ở tuyến quen thuộc và an toàn.',mock:[47,12,27,30,80,16]},
  {key:'CamLe',name:'Cẩm Lệ',lat:16.0142,lon:108.1977,desc:'Khu vực đô thị phía nam, phù hợp các vòng chạy vừa và ngắn.',mock:[66,19,30,34,72,8]},
  {key:'HoaXuan',name:'Hòa Xuân',lat:15.9928,lon:108.2142,desc:'Khu đô thị mới, đường rộng; lưu ý nắng, gió và mật độ xe theo từng giờ.',mock:[62,17,29,33,74,10]},
  {key:'TamKy',name:'Tam Kỳ',lat:15.5686,lon:108.4835,desc:'Khu vực đô thị phía nam thành phố, có nhiều tuyến tương đối bằng phẳng.',mock:[55,15,29,33,77,9]},
  {key:'QuangPhu',name:'Quảng Phú',lat:15.5920,lon:108.4700,desc:'Khu vực phía bắc Tam Kỳ, nên chọn tuyến sáng rõ và ít phương tiện.',mock:[57,16,29,33,76,8]},
  {key:'HuongTra',name:'Hương Trà',lat:15.5949,lon:108.5040,desc:'Khu vực chuyển tiếp đô thị - ven biển, phù hợp chạy nhẹ khi thời tiết ổn định.',mock:[49,13,28,32,78,11]},
  {key:'BanThach',name:'Bàn Thạch',lat:15.5604,lon:108.4972,desc:'Khu vực đô thị Tam Kỳ, nên ưu tiên công viên và các tuyến ít giao cắt.',mock:[53,14,29,33,77,9]},
  {key:'DienBan',name:'Điện Bàn',lat:15.8904,lon:108.2319,desc:'Khu vực đô thị hóa nhanh; chọn cung đường quen và quan sát giao thông.',mock:[63,18,29,34,74,10]},
  {key:'DienBanDong',name:'Điện Bàn Đông',lat:15.8863,lon:108.3037,desc:'Gần biển và sông, không gian thoáng; gió có thể mạnh vào một số thời điểm.',mock:[48,13,28,32,78,15]},
  {key:'AnThang',name:'An Thắng',lat:15.8956,lon:108.2209,desc:'Khu vực trung tâm Điện Bàn, phù hợp vòng chạy ngắn trong khu dân cư.',mock:[60,17,29,33,75,9]},
  {key:'DienBanBac',name:'Điện Bàn Bắc',lat:15.9441,lon:108.2218,desc:'Địa bàn rộng và phân tán; cần kiểm tra mặt đường, ánh sáng và thời tiết.',mock:[59,16,29,33,75,10]},
  {key:'HoiAn',name:'Hội An',lat:15.8794,lon:108.3350,desc:'Khu vực di sản và ven sông; nên chạy sớm, tránh giờ đông khách.',mock:[46,12,28,32,80,8]},
  {key:'HoiAnDong',name:'Hội An Đông',lat:15.8898,lon:108.3655,desc:'Hướng ra biển, không gian thoáng; chú ý gió và độ ẩm cao.',mock:[43,11,28,32,81,14]},
  {key:'HoiAnTay',name:'Hội An Tây',lat:15.8748,lon:108.2946,desc:'Khu vực phía tây Hội An, phù hợp chạy nhẹ trên tuyến quen thuộc.',mock:[52,14,29,33,79,8]}
];

const WEATHER_TEXT = {
  0:['Trời quang','☀'],1:['Ít mây','🌤'],2:['Có mây','⛅'],3:['Nhiều mây','☁'],
  45:['Có sương mù','≋'],48:['Sương mù đóng băng','≋'],51:['Mưa phùn nhẹ','🌦'],53:['Mưa phùn','🌦'],55:['Mưa phùn dày','🌧'],
  61:['Mưa nhẹ','🌦'],63:['Mưa vừa','🌧'],65:['Mưa lớn','🌧'],80:['Mưa rào nhẹ','🌦'],81:['Mưa rào','🌧'],82:['Mưa rào lớn','⛈'],
  95:['Có dông','⛈'],96:['Dông kèm mưa đá','⛈'],99:['Dông mạnh','⛈']
};

const STORAGE = {
  plan:'airun-v58-plan', journal:'airun-v58-journal', cache:'airun-v58-live-cache', migrated:'airun-v58-migrated'
};

const memoryCache = new Map();
const markers = new Map();
let map = null;
let runMap = null;
let userLocationMarker = null;
let runMarker = null;
let runPolyline = null;
let selectedKey = 'HaiChau';
let intensity = 'Nhẹ';
let gpsLocation = null;
let activeData = null;
let activeSnapshot = null;
let activeResult = null;
let selectedDecision = '';
let toastTimer = null;
let installPrompt = null;

const tracker = {
  status:'idle', watchId:null, startedAt:0, pausedMs:0, pauseStarted:0, timer:null,
  distanceKm:0, points:[], lastPoint:null, speedSamples:[], currentSpeed:0,
  wakeLock:null, envLastAt:0, envPoint:null, lastEnvResult:null
};

function ward(key = selectedKey){ return WARDS.find(item => item.key === key) || WARDS[0]; }
function safeJSON(raw, fallback){ try{return JSON.parse(raw)}catch{return fallback} }
function localGet(key, fallback){ try{return safeJSON(localStorage.getItem(key), fallback)}catch{return fallback} }
function localSet(key, value){ try{localStorage.setItem(key, JSON.stringify(value));return true}catch{return false} }
function hasDom(){ return typeof document !== 'undefined'; }

const SYSTEM_STATUS_IDS={
  js:['jsStatusChip','jsStatus'],weather:['weatherStatusChip','weatherApiStatus'],air:['airStatusChip','airApiStatus'],gps:['gpsStatusChip','gpsStatusText']
};
function setSystemStatus(kind,state,text){
  if(!hasDom())return;
  const ids=SYSTEM_STATUS_IDS[kind];if(!ids)return;
  const chip=$(ids[0]),label=$(ids[1]);
  if(chip)chip.dataset.state=state||'idle';
  if(label)label.textContent=text||'';
}
function setApiUpdateText(text){const node=hasDom()?$('apiLastUpdate'):null;if(node)node.textContent=text;}
function safeCall(name,fn){try{return fn();}catch(error){console.error(`AIRUN ${name}:`,error);setSystemStatus('js','error',`Lỗi: ${name}`);return null;}}
function on(id,event,handler,options){const node=$(id);if(!node){console.warn(`AIRUN missing #${id}`);return false;}node.addEventListener(event,handler,options);return true;}
function asNumber(value,fallback=null){const n=Number(value);return Number.isFinite(n)?n:fallback;}
function runAsyncTask(name,task){
  Promise.resolve().then(task).catch(error=>{
    console.error(`AIRUN async ${name}:`,error);
    setSystemStatus('js','warn','V5.8 · tác vụ phụ lỗi');
    showToast(`${name} chưa hoàn tất. Các chức năng khác vẫn hoạt động.`);
  });
}

if(typeof window!=='undefined'){
  window.addEventListener('error',event=>{
    console.error('AIRUN global error:',event.error||event.message);
    setSystemStatus('js','warn','V5.8 · có lỗi phụ');
    setApiUpdateText(`Lỗi giao diện phụ: ${String(event.message||'không xác định').slice(0,80)}`);
  });
  window.addEventListener('unhandledrejection',event=>{
    console.error('AIRUN rejected promise:',event.reason);
    // Một tác vụ phụ (bản đồ/GPS refine/animation) không được làm người dùng nghĩ toàn app đã chết.
    setSystemStatus('js','warn','V5.8 · tác vụ phụ lỗi');
  });
}

function showToast(message){
  const node = $('toast'); if(!node) return;
  node.textContent = message; node.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 3200);
}

function setBusy(button, busy, busyText = 'Đang tải…'){
  if(!button) return;
  if(busy){button.dataset.label = button.textContent;button.textContent = busyText;button.disabled = true;}
  else{button.textContent = button.dataset.label || button.textContent;button.disabled = false;}
}

function updateConnection(){
  const online = navigator.onLine;
  $('connectionText').textContent = online ? 'Đang trực tuyến · dữ liệu có thể cập nhật trực tiếp' : 'Đang ngoại tuyến · dùng dữ liệu đã lưu/dự phòng';
  document.querySelector('.pulse')?.classList.toggle('offline', !online);
}

function vnIso(date = new Date()){
  const parts = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date);
  return parts.replace(' ','T');
}

function fallbackData(item, location = null){
  const [aqi,pm,temp,feels,humidity,wind] = item.mock;
  const now = new Date(); const hourly = [];
  for(let i=0;i<48;i++){
    const date = new Date(now.getTime() + i*3600000);
    const hour = Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',hourCycle:'h23'}).format(date));
    const cool = hour < 8 || hour >= 18 ? -2 : hour >= 11 && hour <= 15 ? 2 : 0;
    const aqiShift = (hour>=7&&hour<=9)||(hour>=16&&hour<=19) ? 8 : -3;
    const uv = hour>=10&&hour<=14 ? 7 : hour>=8&&hour<=16 ? 3 : 0;
    hourly.push({time:vnIso(date).slice(0,13)+':00',temp:temp+cool,feels:feels+cool,humidity,rain:hour===15?35:12,wind:wind+(hour>=14?3:0),uv,code:hour===15?2:1,aqi:Math.max(18,aqi+aqiShift),pm:Math.max(5,pm+aqiShift*.18),pm10:Math.max(8,pm*1.55)});
  }
  return {
    cacheId:`demo:${item.key}`,key:item.key,source:'demo',updated:Date.now(),
    location:location || {lat:item.lat,lon:item.lon,label:item.name,accuracy:null,mode:'ward'},
    current:{temp,feels,humidity,wind,rain:12,uv:3,code:1,aqi,pm,pm10:round(pm*1.55,1)},hourly
  };
}

function getPersistentCache(cacheId, maxAge = 45*60*1000){
  const all = localGet(STORAGE.cache, {}); const row = all[cacheId];
  return row && Date.now()-row.updated < maxAge ? row : null;
}
function getStaleCache(cacheId){ return getPersistentCache(cacheId, 6*60*60*1000); }
function savePersistentCache(data){
  const all = localGet(STORAGE.cache, {}); all[data.cacheId] = data;
  const trimmed = Object.fromEntries(Object.entries(all).sort((a,b)=>b[1].updated-a[1].updated).slice(0,14));
  localSet(STORAGE.cache, trimmed);
}

async function fetchJSON(url, timeout = 7000, retries = 0, onRetry = null){
  let lastError = null;
  for(let attempt=0; attempt<=retries; attempt++){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try{
      const response = await fetch(url,{signal:controller.signal,cache:'no-store',headers:{Accept:'application/json'}});
      const raw = await response.text();
      if(!response.ok) throw new Error(`HTTP ${response.status}: ${raw.slice(0,120)}`);
      let data;
      try{ data = JSON.parse(raw); }
      catch{
        if(/<!doctype|<html/i.test(raw)) throw new Error('PROXY_NOT_CONFIGURED');
        throw new Error('API_NOT_JSON');
      }
      if(!data || data.error) throw new Error(data?.reason || 'API trả về dữ liệu không hợp lệ');
      return data;
    }catch(error){
      lastError = error;
      if(attempt < retries){
        if(onRetry) onRetry(attempt+1,error);
        await new Promise(resolve=>setTimeout(resolve,350 + attempt*500));
      }
    }finally{ clearTimeout(timer); }
  }
  throw lastError || new Error('Không thể kết nối API');
}

function nearestWard(lat,lon){
  return [...WARDS].map(item=>({item,distance:haversine(lat,lon,item.lat,item.lon)})).sort((a,b)=>a.distance-b.distance)[0];
}

function apiErrorLabel(error){
  if(error?.name==='AbortError') return 'Timeout';
  const text=String(error?.message||'');
  if(text.includes('PROXY_NOT_CONFIGURED')) return 'Proxy trả HTML';
  if(text.includes('API_NOT_JSON')) return 'Phản hồi không phải JSON';
  if(/HTTP\s+\d+/.test(text)) return text;
  if(typeof navigator!=='undefined' && !navigator.onLine) return 'Ngoại tuyến';
  return 'Không phản hồi';
}

async function fetchEnvironmentAt(lat, lon, options = {}){
  const nearest = nearestWard(lat,lon);
  const key = options.key || nearest.item.key;
  const label = options.label || nearest.item.name;
  const cacheId = options.cacheId || `geo:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const force = Boolean(options.force);
  const location = {lat,lon,label,accuracy:options.accuracy ?? null,mode:options.mode || 'ward'};
  const onProgress = typeof options.onProgress==='function' ? options.onProgress : null;

  // Trạng thái phải đổi NGAY khi hàm được gọi để người dùng biết request thật sự đã bắt đầu.
  setSystemStatus('weather','loading','Đang kết nối…');
  setSystemStatus('air','loading','Đang kết nối…');
  setApiUpdateText(`Đang gọi proxy Render cho ${label}…`);

  const mem = memoryCache.get(cacheId);
  if(!force && mem && Date.now()-mem.updated < 90*1000) return mem;
  const stored = !force && getPersistentCache(cacheId,5*60*1000);
  if(stored){memoryCache.set(cacheId,stored);return stored;}
  if(typeof navigator !== 'undefined' && !navigator.onLine){
    setSystemStatus('weather','warn','Ngoại tuyến');setSystemStatus('air','warn','Ngoại tuyến');
    const stale = getStaleCache(cacheId); return stale ? {...stale,source:'cached'} : fallbackData(nearest.item,location);
  }

  // V5.6: same-origin Render proxy. Browser no longer calls Open-Meteo domains directly.
  // Render rewrites /api/weather/:lat/:lon and /api/air/:lat/:lon to Open-Meteo.
  const safeLat = Number(lat).toFixed(5);
  const safeLon = Number(lon).toFixed(5);
  const weatherUrl = `/api/weather/${safeLat}/${safeLon}`;
  const airUrl = `/api/air/${safeLat}/${safeLon}`;

  const stale = getStaleCache(cacheId);
  const backup = stale ? {...stale,source:'cached',location} : fallbackData(nearest.item,location);
  const hourlyMap = new Map((backup.hourly||[]).map(row=>[row.time,{...row}]));
  let current = {...backup.current};
  let weatherOk=false, airOk=false;
  let weatherMs=null, airMs=null;

  const buildResult=()=>({
    cacheId,key,
    source:weatherOk&&airOk?'live':(weatherOk||airOk?'partial':backup.source),
    forecastSource:weatherOk&&airOk?'live':(weatherOk||airOk?'partial':backup.source),
    updated:Date.now(),location,current:{...current},
    hourly:[...hourlyMap.values()].sort((a,b)=>a.time.localeCompare(b.time)),
    liveParts:{weather:weatherOk,air:airOk,weatherForecast:weatherOk,airForecast:airOk},
    latency:{weather:weatherMs,air:airMs}
  });
  const publish=part=>{
    const result=buildResult();
    if(onProgress){try{onProgress(result,part);}catch(error){console.warn('AIRUN progress render:',error);}}
    return result;
  };

  const weatherTask=(async()=>{
    const started=performance.now();
    try{
      const w=await fetchJSON(weatherUrl,5200,1,()=>setSystemStatus('weather','loading','Đang thử lại…'));
      const wc=w.current||{};
      current={...current,
        temp:asNumber(wc.temperature_2m,current.temp),
        feels:asNumber(wc.apparent_temperature,current.feels),
        humidity:asNumber(wc.relative_humidity_2m,current.humidity),
        wind:asNumber(wc.wind_speed_10m,current.wind),
        code:asNumber(wc.weather_code,current.code),
        rain:asNumber(wc.precipitation,null)!==null?(asNumber(wc.precipitation,0)>0?100:0):current.rain
      };
      const h=w.hourly||{},times=h.time||[];
      times.forEach((time,index)=>{
        const old=hourlyMap.get(time)||{time};
        hourlyMap.set(time,{...old,time,
          temp:h.temperature_2m?.[index],feels:h.apparent_temperature?.[index],humidity:h.relative_humidity_2m?.[index],
          rain:h.precipitation_probability?.[index],wind:h.wind_speed_10m?.[index],code:h.weather_code?.[index]
        });
      });
      weatherOk=true;weatherMs=Math.max(1,Math.round(performance.now()-started));
      setSystemStatus('weather','ok',`${weatherMs} ms`);publish('weather');return true;
    }catch(error){console.warn('AIRUN Weather:',error);setSystemStatus('weather','error',apiErrorLabel(error));return false;}
  })();

  const airTask=(async()=>{
    const started=performance.now();
    try{
      const a=await fetchJSON(airUrl,5200,1,()=>setSystemStatus('air','loading','Đang thử lại…'));
      const ac=a.current||{};
      current={...current,
        aqi:asNumber(ac.us_aqi,current.aqi),
        pm:asNumber(ac.pm2_5,current.pm),
        pm10:asNumber(ac.pm10,current.pm10),
        uv:asNumber(ac.uv_index,current.uv)
      };
      const h=a.hourly||{},times=h.time||[];
      times.forEach((time,index)=>{
        const old=hourlyMap.get(time)||{time};
        hourlyMap.set(time,{...old,time,aqi:h.us_aqi?.[index],pm:h.pm2_5?.[index],pm10:h.pm10?.[index],uv:asNumber(h.uv_index?.[index],old.uv)});
      });
      airOk=true;airMs=Math.max(1,Math.round(performance.now()-started));
      setSystemStatus('air','ok',`${airMs} ms`);publish('air');return true;
    }catch(error){console.warn('AIRUN Air:',error);setSystemStatus('air','error',apiErrorLabel(error));return false;}
  })();

  await Promise.allSettled([weatherTask,airTask]);
  const result=buildResult();
  if(weatherOk||airOk){
    memoryCache.set(cacheId,result);savePersistentCache(result);
    const nowText=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    setApiUpdateText(`${weatherOk&&airOk?'Weather + Air trực tiếp':'Đã nhận một phần dữ liệu trực tiếp'} · ${nowText}`);
    publish('ready');
    return result;
  }
  setApiUpdateText('Proxy/API chưa kết nối · đang dùng dữ liệu dự phòng');
  return backup;
}

function fetchEnvironment(key, force = false, onProgress = null){
  const item = ward(key);
  return fetchEnvironmentAt(item.lat,item.lon,{key:item.key,label:item.name,cacheId:`ward:${item.key}`,mode:'ward',force,onProgress});
}

function targetIso(timeValue){
  const now = vnIso(); const date = now.slice(0,10); const hour = String(Number((timeValue || '17:30').slice(0,2))).padStart(2,'0');
  let target = `${date}T${hour}:00`;
  if(target < now.slice(0,13)+':00') target = `${vnIso(new Date(Date.now()+86400000)).slice(0,10)}T${hour}:00`;
  return target;
}

function snapshotFor(data, timeValue){
  const target = targetIso(timeValue); const row = data.hourly?.find(item=>item.time === target);
  return row ? {...data.current,...row} : {...data.current,time:vnIso()};
}

function aqiInfo(aqi){
  if(aqi <= 50) return {label:'Tốt',tone:'good'};
  if(aqi <= 100) return {label:'Trung bình',tone:'caution'};
  if(aqi <= 150) return {label:'Kém cho nhóm nhạy cảm',tone:'caution'};
  if(aqi <= 200) return {label:'Có hại',tone:'bad'};
  if(aqi <= 300) return {label:'Rất có hại',tone:'bad'};
  return {label:'Nguy hiểm',tone:'bad'};
}

function uvInfo(uv){
  const value=Number(uv||0);
  if(value<3) return {label:'Thấp',tone:'good'};
  if(value<6) return {label:'Trung bình',tone:'caution'};
  if(value<8) return {label:'Cao',tone:'caution'};
  if(value<11) return {label:'Rất cao',tone:'bad'};
  return {label:'Cực cao',tone:'bad'};
}

function analyzeSnapshot(snapshot, plan){
  let score = 10; const reasons = [];
  const aqi=Number(snapshot.aqi??0),pm=Number(snapshot.pm??0),feels=Number(snapshot.feels??snapshot.temp??25),wind=Number(snapshot.wind??0),rain=Number(snapshot.rain??0),uv=Number(snapshot.uv??0);

  if(aqi<=50) reasons.push(`AQI Mỹ ${round(aqi)} ở mức tốt, ít cản trở hoạt động ngoài trời.`);
  else if(aqi<=100){score-=(aqi-50)/28;reasons.push(`AQI Mỹ ${round(aqi)} ở mức trung bình; nên chú ý cảm giác hô hấp.`);}
  else if(aqi<=150){score-=3+(aqi-100)/35;reasons.push(`AQI Mỹ ${round(aqi)} không thuận lợi cho nhóm nhạy cảm.`);}
  else{score-=6+Math.min(2,(aqi-150)/50);reasons.push(`AQI Mỹ ${round(aqi)} ở mức có hại; nên tránh chạy ngoài trời cường độ cao.`);}

  if(pm>35.5){score-=1.5;reasons.push(`PM2.5 ${round(pm,1)} µg/m³ khá cao; cân nhắc đổi giờ hoặc chạy trong nhà.`);}
  else if(pm>9){score-=Math.min(1,(pm-9)/30);reasons.push(`PM2.5 ${round(pm,1)} µg/m³ cần được theo dõi, nhất là khi chạy lâu.`);}
  else reasons.push(`PM2.5 ${round(pm,1)} µg/m³ đang thấp trong dữ liệu hiện có.`);

  if(feels>34){score-=2.2+(feels-34)*.18;reasons.push(`Nhiệt cảm nhận ${round(feels)}°C làm tăng nguy cơ quá nóng và mất nước.`);}
  else if(feels>30){score-=(feels-30)*.32;reasons.push(`Cảm giác ${round(feels)}°C khá nóng; nên giảm cường độ và mang thêm nước.`);}
  else if(feels<14){score-=Math.min(1.5,(14-feels)*.15);reasons.push(`Cảm giác ${round(feels)}°C khá mát; cần khởi động kỹ.`);}
  else reasons.push(`Nhiệt cảm nhận ${round(feels)}°C tương đối phù hợp cho vận động.`);

  if(rain>=70){score-=2.4;reasons.push(`Khả năng mưa ${round(rain)}%; nên có phương án trong nhà hoặc hoãn chạy.`);}
  else if(rain>=40){score-=1;reasons.push(`Khả năng mưa ${round(rain)}%; nên kiểm tra bầu trời trước khi xuất phát.`);}
  if(wind>=35){score-=1.8;reasons.push(`Gió khoảng ${round(wind)} km/h có thể làm buổi chạy kém an toàn.`);}
  else if(wind>=22){score-=.7;reasons.push(`Gió khoảng ${round(wind)} km/h; lưu ý ở cầu và ven biển.`);}

  if(uv>=8){score-=1.4;reasons.push(`UV ${round(uv,1)} rất cao; ưu tiên đổi giờ hoặc tăng bảo vệ nắng.`);}
  else if(uv>=6){score-=.8;reasons.push(`UV ${round(uv,1)} cao; nên dùng mũ và chống nắng nếu chạy ban ngày.`);}
  else if(uv>=3){score-=.25;reasons.push(`UV ${round(uv,1)} ở mức trung bình.`);}

  if(plan.intensity==='Cao'){
    if(aqi>50){score-=1;reasons.push('Cường độ cao làm lượng không khí hít vào tăng, nên tiêu chuẩn không khí cần nghiêm ngặt hơn.');}
    if(feels>29) score-=.7;
  } else if(plan.intensity==='Vừa'&&(aqi>100||feels>32)) score-=.45;
  if(plan.duration>=60&&feels>30){score-=.7;reasons.push(`Thời lượng ${plan.duration} phút trong điều kiện nóng cần bổ sung nước và nghỉ hợp lý.`);}
  if(plan.sensitive&&aqi>50){score-=aqi>100?2.2:1;reasons.push('Bạn đã chọn nhóm nhạy cảm nên AIRUN áp dụng ngưỡng thận trọng hơn.');}

  score=round(clamp(score,0,10),1);
  let tone='good',title='Có thể cân nhắc chạy',text='Điều kiện khá thuận lợi. Hãy khởi động và quan sát thực tế trước khi xuất phát.',icon='✓';
  if(score<5||aqi>150){tone='bad';title='Nên đổi kế hoạch';text='Ưu tiên chạy trong nhà, đổi giờ hoặc chọn thời điểm khác để giảm rủi ro.';icon='!';}
  else if(score<7.5){tone='caution';title='Nên điều chỉnh';text='Cân nhắc chạy nhẹ hơn, ngắn hơn hoặc chuyển sang khung giờ thuận lợi hơn.';icon='◷';}
  return {score,tone,title,text,icon,reasons:reasons.slice(0,6)};
}

function parsePace(value){
  const raw=String(value||'').trim().replace(',', '.');
  if(!raw)return null;
  if(raw.includes(':')){
    const [m,s='0']=raw.split(':');
    const minutes=Number(m),seconds=Number(s);
    if(!Number.isFinite(minutes)||!Number.isFinite(seconds)||minutes<=0||seconds<0||seconds>=60)return null;
    return minutes+seconds/60;
  }
  const numeric=Number(raw);
  return Number.isFinite(numeric)&&numeric>0&&numeric<30?numeric:null;
}
function defaultPaceForIntensity(level=intensity){return level==='Cao'?5.25:level==='Vừa'?6.25:7;}
function planEstimate(plan=currentPlan()){
  const pace=Number(plan.pace)||defaultPaceForIntensity(plan.intensity);
  const distance=pace>0?Number(plan.duration)/pace:0;
  const speed=pace>0?60/pace:0;
  return {pace,distance,speed};
}
function currentPlan(){
  const pace=parsePace($('planPace')?.value)||defaultPaceForIntensity(intensity);
  return {key:selectedKey,time:$('time').value,duration:Number($('duration').value),intensity,sensitive:$('sensitive').checked,pace};
}
function updatePlanEstimate(){
  const input=$('planPace'),help=$('paceHelp');
  const parsed=parsePace(input?.value);
  const valid=Number.isFinite(parsed);
  const plan=currentPlan(),estimate=planEstimate(plan);
  if($('estimatedDistance'))$('estimatedDistance').textContent=estimate.distance.toFixed(2);
  if($('estimatedSpeed'))$('estimatedSpeed').textContent=`≈ ${estimate.speed.toFixed(1)} km/h`;
  if(help){help.classList.toggle('error',!valid);help.textContent=valid?'Quãng đường được tính ngay trên máy, không cần GPS hay API.':'Pace chưa hợp lệ. Hãy nhập dạng 6:30 hoặc 6.5.';}
  if($('planSummaryDistance'))$('planSummaryDistance').textContent=`${estimate.distance.toFixed(2)} km`;
  if($('planSummaryPace'))$('planSummaryPace').textContent=`pace ${formatPace(estimate.pace)}/km`;
  if($('planSummaryDuration'))$('planSummaryDuration').textContent=`${plan.duration} phút`;
  if($('planSummarySpeed'))$('planSummarySpeed').textContent=`≈ ${estimate.speed.toFixed(1)} km/h`;
  return estimate;
}

function bestTimeFor(data, plan){
  const candidates=(data.hourly||[]).filter(row=>{const hour=Number(row.time.slice(11,13));return (hour>=5&&hour<=9)||(hour>=16&&hour<=21);}).slice(0,24);
  if(!candidates.length) return null;
  return candidates.map(row=>({row,result:analyzeSnapshot({...data.current,...row},plan)})).sort((a,b)=>b.result.score-a.result.score)[0];
}

function weatherText(code){ return WEATHER_TEXT[code] || ['Thời tiết thay đổi','◌']; }
function sourceLabel(source){
  return source==='live'?'Dữ liệu trực tiếp':source==='partial'?'Dữ liệu trực tiếp một phần':source==='cached'?'Dữ liệu đã lưu gần đây':'Dữ liệu dự phòng';
}

function quickEnvironmentForWard(key = selectedKey){
  const item=ward(key);
  const fresh=getPersistentCache(`ward:${item.key}`,45*60*1000);
  const stale=getStaleCache(`ward:${item.key}`);
  return fresh || (stale ? {...stale,source:'cached'} : fallbackData(item));
}

function quickEnvironmentForGps(location){
  const near=nearestWard(location.lat,location.lon).item;
  const cached=getStaleCache(location.cacheId);
  if(cached)return {...cached,source:'cached',location:{lat:location.lat,lon:location.lon,label:location.label,accuracy:location.accuracy,mode:'gps'}};
  return fallbackData(near,{lat:location.lat,lon:location.lon,label:location.label,accuracy:location.accuracy,mode:'gps'});
}

function renderEnvironmentInstant(data,{updating=false}={}){
  activeData=data;
  renderHero(data);
  try{
    const plan=currentPlan(),snapshot=snapshotFor(data,plan.time),result=analyzeSnapshot(snapshot,plan);
    activeSnapshot=snapshot;activeResult=result;renderResult(data,snapshot,result);
  }catch(error){console.warn('AIRUN quick render:',error);}
  if(updating){
    $('liveBadge').textContent='ĐANG CẬP NHẬT';
    $('liveBadge').className='source-badge loading';
    $('heroLocationNote').textContent=(data.location?.mode==='gps')
      ? `Đã có vị trí GPS ±${round(data.location.accuracy||0)} m · đang đồng bộ thời tiết và AQI trực tiếp.`
      : 'AIRUN đang hiển thị dữ liệu gần nhất/dự phòng trong khi đồng bộ Open-Meteo.';
  }
}

function renderEnvironmentData(data,{note=null}={}){
  activeData=data;renderHero(data);
  try{
    const plan=currentPlan(),snapshot=snapshotFor(data,plan.time),result=analyzeSnapshot(snapshot,plan);
    activeSnapshot=snapshot;activeResult=result;renderResult(data,snapshot,result);
  }catch(error){console.warn('AIRUN environment render:',error);}
  if(note)$('heroLocationNote').textContent=note;
}

function renderHero(data){
  const current=data.current,weather=weatherText(current.code),label=data.location?.label||ward(data.key).name;
  $('heroArea').textContent=label;$('heroTemp').textContent=round(current.temp);$('heroWeather').textContent=weather[0];$('weatherSymbol').textContent=weather[1];
  $('heroAqi').textContent=round(current.aqi);$('heroPm').textContent=round(current.pm,1);$('heroWind').textContent=round(current.wind,1);$('heroUv').textContent=round(current.uv,1);
  $('heroUpdated').textContent=new Date(data.updated).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  $('liveBadge').textContent=sourceLabel(data.source).toUpperCase();$('liveBadge').className=`source-badge ${data.source==='live'?'':data.source}`;
  if(data.location?.mode==='gps') $('heroLocationNote').textContent=`GPS ±${round(data.location.accuracy||0)} m · dữ liệu được lấy theo tọa độ hiện tại của thiết bị.`;
  else if(data.source==='demo') $('heroLocationNote').textContent='Đang dùng dữ liệu dự phòng tức thời. AIRUN sẽ tự thay bằng dữ liệu trực tiếp khi Open-Meteo phản hồi.';
  else if(data.source==='cached') $('heroLocationNote').textContent='Đang dùng dữ liệu đã lưu gần đây trong lúc chờ cập nhật mới.';
  else $('heroLocationNote').textContent='Đang dùng tọa độ đại diện của khu vực. Bấm “Dùng vị trí hiện tại” để chính xác hơn.';
}

function renderResult(data,snapshot,result){
  const info=aqiInfo(snapshot.aqi),uv=uvInfo(snapshot.uv),best=bestTimeFor(data,currentPlan());
  const label=data.location?.label||ward(data.key).name;
  $('resultSource').textContent=`${sourceLabel(data.source)} · ${label} · ${snapshot.time?.slice(11,16)||'hiện tại'}`;
  $('resultStatusPill').textContent=result.title;$('resultStatusPill').className=`result-pill ${result.tone}`;
  $('decisionPanel').className=`decision-panel ${result.tone}`;$('decisionIcon').textContent=result.icon;$('decisionTitle').textContent=result.title;$('decisionText').textContent=result.text;
  $('scoreValue').textContent=result.score;$('scoreRing').style.setProperty('--score',`${result.score*10}%`);
  $('metricAqi').textContent=round(snapshot.aqi);$('metricAqiLabel').textContent=info.label;$('metricPm').textContent=round(snapshot.pm,1);
  $('metricTemp').textContent=`${round(snapshot.temp)}°`;$('metricFeels').textContent=`Cảm giác ${round(snapshot.feels)}°`;$('metricWind').textContent=round(snapshot.wind,1);
  $('metricRain').textContent=`${round(snapshot.rain)}%`;$('metricHumidity').textContent=`Độ ẩm ${round(snapshot.humidity)}%`;
  $('metricUv').textContent=round(snapshot.uv,1);$('metricUvLabel').textContent=uv.label;
  const estimate=updatePlanEstimate();
  if($('planSummarySource'))$('planSummarySource').textContent=sourceLabel(data.source);
  if($('planSummaryForecast')){
    const fs=data.forecastSource||data.source;
    $('planSummaryForecast').textContent=fs==='live'?'Forecast trực tiếp đã sẵn sàng':fs==='partial'?'Forecast trực tiếp một phần':fs==='cached'?'Forecast từ cache':'Forecast dự phòng';
  }
  $('reasonList').innerHTML=result.reasons.map(reason=>`<li>${escapeHTML(reason)}</li>`).join('');
  if(best){$('bestTime').textContent=`${best.row.time.slice(11,16)} · ${best.result.score}/10`;$('bestTimeReason').textContent='Trong các khung giờ chạy phổ biến, đây là thời điểm có điểm thuận lợi cao nhất trong dự báo hiện có.';}
  else{$('bestTime').textContent='Chưa có dự báo giờ';$('bestTimeReason').textContent='Hãy thử cập nhật lại dữ liệu.';}
  $('mapAreaAqi').textContent=`AQI ${round(snapshot.aqi)}`;$('mapAreaTemp').textContent=`${round(snapshot.temp)}°C`;$('mapAreaScore').textContent=`${result.score}/10`;
  renderKit(snapshot,currentPlan());
}

function renderKit(snapshot,plan){
  const items=['Giày chạy và trang phục thoáng','Điện thoại đủ pin hoặc thẻ liên hệ khẩn cấp'];
  const water=Math.max(250,Math.round((plan.duration*(snapshot.feels>31?10:7))/50)*50); items.push(`Khoảng ${water} ml nước cho kế hoạch ${plan.duration} phút`);
  if(snapshot.rain>=40) items.push('Áo mưa mỏng hoặc phương án chạy trong nhà');
  if(snapshot.feels>=31||snapshot.uv>=6) items.push('Mũ và kem chống nắng; ưu tiên bóng râm nếu chạy ban ngày');
  if(snapshot.aqi>100) items.push('Ưu tiên đổi giờ; tránh chạy cường độ cao khi chất lượng không khí kém');
  if(Number(plan.time.slice(0,2))>=18||Number(plan.time.slice(0,2))<6) items.push('Phụ kiện phản quang hoặc đèn nhỏ');
  $('kitList').innerHTML=items.map(item=>`<li>${escapeHTML(item)}</li>`).join('');
}

async function getEnvironmentForActive(force=false,onProgress=null){
  if(gpsLocation){
    return fetchEnvironmentAt(gpsLocation.lat,gpsLocation.lon,{key:selectedKey,label:gpsLocation.label,cacheId:gpsLocation.cacheId,accuracy:gpsLocation.accuracy,mode:'gps',force,onProgress});
  }
  return fetchEnvironment(selectedKey,force,onProgress);
}

function setGpsPlanUi(){
  const chip=$('gpsPlanChip');
  if(gpsLocation){chip.hidden=false;$('gpsPlanLabel').textContent=`${gpsLocation.label} · ±${round(gpsLocation.accuracy)} m`;}
  else chip.hidden=true;
}

function updateMapSide(){
  const item=ward();$('mapAreaName').textContent=gpsLocation?`${item.name} · GPS`:item.name;$('mapAreaDescription').textContent=gpsLocation?'Đang phân tích theo tọa độ GPS chính xác của thiết bị; khu vực này chỉ là tên gần nhất.':item.desc;
  const lat=gpsLocation?.lat??item.lat,lon=gpsLocation?.lon??item.lon;$('openOsm').href=`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
  document.querySelectorAll('[data-ward]').forEach(button=>button.classList.toggle('active',button.dataset.ward===selectedKey));
  markers.forEach((marker,key)=>{const icon=marker.getElement();if(icon)icon.classList.toggle('selected',key===selectedKey);});
}

async function selectWard(key,{scroll=false,force=false,analyze=true}={}){
  gpsLocation=null;setGpsPlanUi();selectedKey=ward(key).key;$('area').value=selectedKey;savePlanSettings();updateMapSide();
  if(map){const item=ward();map.flyTo([item.lat,item.lon],Math.max(map.getZoom(),11),{duration:.7});markers.get(selectedKey)?.openPopup();}

  // Luôn có biến quick ở phạm vi toàn hàm; catch không còn ReferenceError như V5.7.
  let quick=fallbackData(ward(selectedKey));
  try{quick=quickEnvironmentForWard(selectedKey);renderEnvironmentInstant(quick,{updating:true});}
  catch(error){console.warn('AIRUN instant render ignored:',error);try{renderEnvironmentInstant(quick,{updating:true});}catch{}}

  // Request live bắt đầu độc lập với cache/UI.
  try{
    const data=await fetchEnvironment(selectedKey,force,(partial)=>{
      try{renderEnvironmentData(partial);}catch(error){console.warn('AIRUN partial render:',error);}
    });
    if(analyze)renderEnvironmentData(data);else{activeData=data;renderHero(data);}
  }catch(error){
    console.warn('AIRUN live update failed:',error);
    try{renderEnvironmentInstant(quick);}catch{}
    $('heroLocationNote').textContent='Proxy/API chưa phản hồi. AIRUN vẫn hoạt động với dữ liệu dự phòng; hãy xem trạng thái Weather/Air để biết lỗi cụ thể.';
  }
  if(scroll)$('planner').scrollIntoView({behavior:'smooth'});
}

async function analyzePlan(showLoading=true){
  const button=$('analyzeBtn');
  if(showLoading)setBusy(button,true,'Đang tính ngay…');
  // Planner must respond instantly, even if external APIs are slow or unavailable.
  const plan=currentPlan();
  const quick=gpsLocation?quickEnvironmentForGps(gpsLocation):quickEnvironmentForWard(selectedKey);
  try{
    const quickSnapshot=snapshotFor(quick,plan.time),quickResult=analyzeSnapshot(quickSnapshot,plan);
    activeData=quick;activeSnapshot=quickSnapshot;activeResult=quickResult;
    renderHero(quick);renderResult(quick,quickSnapshot,quickResult);updatePlanEstimate();savePlanSettings();
    if(showLoading){setBusy(button,false);showToast(`Đã tính ${planEstimate(plan).distance.toFixed(2)} km dự kiến · đang đồng bộ dữ liệu trực tiếp…`);}
  }catch(error){console.warn('AIRUN instant planner:',error);if(showLoading)setBusy(button,false);}

  // Upgrade the result when live current/forecast data arrives; this does not block the UI.
  try{
    const data=await getEnvironmentForActive(false,(partial)=>{
      const snapshot=snapshotFor(partial,plan.time),result=analyzeSnapshot(snapshot,plan);
      activeData=partial;activeSnapshot=snapshot;activeResult=result;renderHero(partial);renderResult(partial,snapshot,result);
    });
    const snapshot=snapshotFor(data,plan.time),result=analyzeSnapshot(snapshot,plan);
    activeData=data;activeSnapshot=snapshot;activeResult=result;renderHero(data);renderResult(data,snapshot,result);savePlanSettings();
  }catch(error){console.warn('AIRUN planner live upgrade:',error);}
}

function savePlanSettings(){localSet(STORAGE.plan,{key:selectedKey,time:$('time').value,duration:$('duration').value,intensity,sensitive:$('sensitive').checked,pace:$('planPace')?.value||''});}
function restorePlanSettings(){
  const plan=localGet(STORAGE.plan,localGet('airun-v50-plan',localGet('airun-v40-plan',{})));
  if(plan.key&&WARDS.some(x=>x.key===plan.key))selectedKey=plan.key;if(plan.time)$('time').value=plan.time;if(plan.duration)$('duration').value=String(plan.duration);
  if(plan.pace&&$('planPace'))$('planPace').value=String(plan.pace);
  if(['Nhẹ','Vừa','Cao'].includes(plan.intensity))intensity=plan.intensity;$('sensitive').checked=Boolean(plan.sensitive);
  document.querySelectorAll('[data-intensity]').forEach(button=>button.classList.toggle('active',button.dataset.intensity===intensity));
}

function renderWardControls(filter=''){
  const normalized=filter.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const items=WARDS.filter(item=>item.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(normalized));
  $('wardList').innerHTML=items.map(item=>`<button type="button" data-ward="${item.key}" class="${item.key===selectedKey?'active':''}">${escapeHTML(item.name)}</button>`).join('')||'<div class="empty-state">Không tìm thấy.</div>';
  $('wardList').querySelectorAll('[data-ward]').forEach(button=>button.addEventListener('click',()=>runAsyncTask('Chọn khu vực',()=>selectWard(button.dataset.ward,{analyze:true}))));
}

function loadLeaflet(){
  if(window.L)return Promise.resolve();
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';css.crossOrigin='anonymous';document.head.append(css);
  return new Promise((resolve,reject)=>{const script=document.createElement('script'),timer=setTimeout(()=>reject(new Error('Leaflet timeout')),9000);script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.crossOrigin='anonymous';script.async=true;script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);reject(new Error('Leaflet unavailable'));};document.head.append(script);});
}

function initMaps(){
  if(!window.L){$('mapFallback').hidden=false;return;}
  try{
    map=L.map('map',{scrollWheelZoom:false,zoomControl:true}).setView([15.95,108.25],9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    WARDS.forEach(item=>{const icon=L.divIcon({className:`airun-marker ${item.key===selectedKey?'selected':''}`,html:'<span></span>',iconSize:[29,29],iconAnchor:[14,14]});const marker=L.marker([item.lat,item.lon],{icon,title:item.name}).addTo(map).bindPopup(`<b>${escapeHTML(item.name)}</b><br>${escapeHTML(item.desc)}`);marker.on('click',()=>selectWard(item.key,{analyze:true}));markers.set(item.key,marker);});
  }catch{$('mapFallback').hidden=false;}
  try{
    runMap=L.map('runMap',{scrollWheelZoom:false,zoomControl:true}).setView([16.06,108.22],13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(runMap);
    $('runMapFallback').style.display='none';
  }catch{runMap=null;}
}

function haversine(lat1,lon1,lat2,lon2){
  const rad=value=>value*Math.PI/180,dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function geoError(code, message=''){
  const error = new Error(message || 'Geolocation error');
  error.code = code;
  return error;
}

async function geolocationPermissionState(){
  if(!navigator.permissions?.query) return 'unknown';
  try{
    const status = await navigator.permissions.query({name:'geolocation'});
    return status.state || 'unknown';
  }catch{return 'unknown';}
}

async function gpsReadiness(){
  if(!window.isSecureContext && location.hostname!=='localhost'){
    return {ok:false,reason:'insecure',permission:'unknown'};
  }
  if(!navigator.geolocation){
    return {ok:false,reason:'unsupported',permission:'unknown'};
  }
  const permission = await geolocationPermissionState();
  if(permission==='denied') return {ok:false,reason:'denied',permission};
  return {ok:true,reason:'ready',permission};
}

function geoPosition(options, hardTimeoutMs){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(geoError('unsupported','Geolocation unsupported'));return;}
    let settled=false;
    const timer=setTimeout(()=>{
      if(settled)return;settled=true;reject(geoError(3,'AIRUN GPS hard timeout'));
    },hardTimeoutMs);
    navigator.geolocation.getCurrentPosition(position=>{
      if(settled)return;settled=true;clearTimeout(timer);resolve(position);
    },error=>{
      if(settled)return;settled=true;clearTimeout(timer);reject(error);
    },options);
  });
}

async function requestGPSPosition(onStage = ()=>{}, {maximumAge=300000}={}){
  const readiness=await gpsReadiness();
  if(!readiness.ok) throw geoError(readiness.reason==='denied'?1:readiness.reason,readiness.reason);

  onStage(readiness.permission==='prompt'?'Hãy cho phép quyền vị trí…':'Đang tìm vị trí…');
  setSystemStatus('gps','loading',readiness.permission==='prompt'?'Chờ cấp quyền':'Đang định vị');

  const fast=geoPosition({enableHighAccuracy:false,timeout:2600,maximumAge},3200).then(position=>{position.__airunFix='fast';return position;});
  const precise=geoPosition({enableHighAccuracy:true,timeout:5600,maximumAge:0},6500).then(position=>{position.__airunFix='precise';return position;});
  try{
    const first=await Promise.any([fast,precise]);
    setSystemStatus('gps','ok',`±${round(Number(first.coords?.accuracy||0))} m`);
    return first;
  }catch(group){
    const errors=Array.isArray(group?.errors)?group.errors:[];
    const denied=errors.find(error=>error?.code===1);
    const unavailable=errors.find(error=>error?.code===2);
    const error=denied||unavailable||errors[errors.length-1]||geoError(3,'GPS timeout');
    setSystemStatus('gps','error',error?.code===1?'Bị chặn':error?.code===2?'Không có vị trí':'Quá thời gian');
    throw error;
  }
}
async function refineGPSPosition(previous, onStage = ()=>{}){
  try{
    onStage('Đang tăng độ chính xác GPS…');
    const precise=await geoPosition({enableHighAccuracy:true,timeout:6500,maximumAge:0},7200);
    const oldAcc=Number(previous?.coords?.accuracy ?? Infinity);
    const newAcc=Number(precise?.coords?.accuracy ?? Infinity);
    return newAcc < oldAcc ? precise : null;
  }catch{return null;}
}

function gpsHelpMessage(error){
  const code=error?.code;
  if(code===1 || code==='denied') return 'Quyền vị trí đang bị chặn. Hãy cho phép Location cho AIRUN trong trình duyệt rồi thử lại.';
  if(code==='insecure') return 'GPS web chỉ hoạt động trên HTTPS. Hãy mở AIRUN bằng địa chỉ https://…onrender.com.';
  if(code==='unsupported') return 'Trình duyệt/thiết bị này không cung cấp Geolocation.';
  if(code===2) return 'Thiết bị chưa xác định được vị trí. Hãy bật Location Services của máy và thử ngoài trời hoặc gần cửa sổ.';
  if(code===3) return 'Thiết bị chưa trả về vị trí trong thời gian chờ. Hãy kiểm tra Location Services, quyền trình duyệt hoặc thử trên điện thoại.';
  return 'AIRUN chưa lấy được vị trí. Hãy kiểm tra quyền Location và dịch vụ vị trí của thiết bị.';
}

function showUserMarker(lat,lon,accuracy){
  if(!map||!window.L)return;
  if(userLocationMarker)userLocationMarker.remove();
  userLocationMarker=L.circleMarker([lat,lon],{radius:8,color:'#3275dc',fillColor:'#fff',fillOpacity:1,weight:4}).addTo(map).bindPopup(`Vị trí GPS · ±${round(accuracy)} m`).openPopup();
  map.flyTo([lat,lon],14,{duration:.8});
}

async function useGPS({scroll=true}={}){
  const gpsButtons=['heroGps','gpsBtn','plannerGpsBtn'].map(id=>$(id)).filter(Boolean);
  gpsButtons.forEach(button=>setBusy(button,true,'Đang kết nối GPS…'));
  if(!navigator.geolocation){
    setSystemStatus('gps','error','Không hỗ trợ');showToast('Trình duyệt này không hỗ trợ GPS.');
    gpsButtons.forEach(button=>setBusy(button,false));return null;
  }
  const setStage=text=>{
    $('liveBadge').textContent=text.toUpperCase();
    $('liveBadge').className='source-badge loading';
    $('heroLocationNote').textContent=text;
  };
  setStage('Đã nhận lệnh · đang kiểm tra GPS…');
  setSystemStatus('gps','loading','Đang kiểm tra');
  try{
    const position=await requestGPSPosition(setStage);
    const applyPosition=async(pos,{refreshEnvironment=true}={})=>{
      const {latitude,longitude,accuracy}=pos.coords;
      const near=nearestWard(latitude,longitude);selectedKey=near.item.key;$('area').value=selectedKey;
      const close=near.distance<=25;const label=close?`${near.item.name} · GPS`:'Vị trí GPS hiện tại';
      gpsLocation={lat:latitude,lon:longitude,accuracy,label,cacheId:`gps:${latitude.toFixed(3)},${longitude.toFixed(3)}`};
      localSet('airun-v54-last-gps',{lat:latitude,lon:longitude,accuracy,label,at:Date.now()});
      setSystemStatus('gps','ok',`±${round(accuracy)} m`);
      setGpsPlanUi();updateMapSide();showUserMarker(latitude,longitude,accuracy);
      const quick=quickEnvironmentForGps(gpsLocation);renderEnvironmentInstant(quick,{updating:refreshEnvironment});
      $('heroLocationNote').textContent=`GPS đã kết nối ±${round(accuracy)} m${pos.__airunFix==='fast'?' · đang cải thiện độ chính xác ở nền':''}.`;
      if(refreshEnvironment){
        try{
          const data=await fetchEnvironmentAt(latitude,longitude,{key:selectedKey,label,cacheId:gpsLocation.cacheId,accuracy,mode:'gps',force:true,onProgress:(partial)=>renderEnvironmentData(partial,{note:`GPS ±${round(accuracy)} m · dữ liệu trực tiếp đang về từng phần.`})});
          renderEnvironmentData(data,{note:`GPS ±${round(accuracy)} m · ${sourceLabel(data.source)} theo tọa độ hiện tại.`});
        }catch(apiError){
          console.warn('AIRUN GPS environment update failed:',apiError);
          renderEnvironmentInstant(quick);
          $('heroLocationNote').textContent=`GPS ±${round(accuracy)} m đã sẵn sàng. Dữ liệu môi trường đang dùng bản dự phòng.`;
        }
      }
      savePlanSettings();
      return {near,label,accuracy};
    };

    const first=await applyPosition(position,{refreshEnvironment:true});
    showToast(`GPS đã kết nối · độ chính xác khoảng ±${round(first.accuracy)} m.`);

    if(Number(position.coords.accuracy)>20){
      void refineGPSPosition(position,text=>setSystemStatus('gps','loading','Đang tăng chính xác')).then(async better=>{
        if(!better){setSystemStatus('gps','ok',`±${round(first.accuracy)} m`);return;}
        const betterAcc=Number(better.coords.accuracy||999);
        if(!gpsLocation || betterAcc+3 < Number(gpsLocation.accuracy||999)){
          await applyPosition(better,{refreshEnvironment:false});
          $('liveBadge').textContent='GPS ĐÃ KẾT NỐI';$('liveBadge').className='source-badge live';
          $('heroLocationNote').textContent=`GPS đã cải thiện lên khoảng ±${round(betterAcc)} m.`;
        }
      }).catch(error=>console.warn('AIRUN GPS refine background:',error));
    }

    if(scroll)$('planner').scrollIntoView({behavior:'smooth'});
    return position;
  }catch(error){
    const data=quickEnvironmentForWard(selectedKey);renderEnvironmentInstant(data);
    $('liveBadge').textContent='GPS CHƯA KẾT NỐI';$('liveBadge').className='source-badge caution';
    const help=gpsHelpMessage(error);$('heroLocationNote').textContent=help;showToast(help);
    setSystemStatus('gps','error',error?.code===1?'Bị chặn':error?.code===2?'Không có vị trí':'Không kết nối');
    return null;
  }finally{
    gpsButtons.forEach(button=>setBusy(button,false));
  }
}
async function compareAreas(){
  const button=$('compareBtn');setBusy(button,true,'Đang so sánh…');$('compareGrid').innerHTML='<div class="empty-state">Đang tải dữ liệu cho 5 khu vực…</div>';
  const keys=[selectedKey,'SonTra','NguHanhSon','HoaXuan','HoiAn'].filter((key,index,array)=>array.indexOf(key)===index).slice(0,5);while(keys.length<5){const extra=WARDS.find(item=>!keys.includes(item.key));keys.push(extra.key);}
  try{
    const plan=currentPlan();const rows=await Promise.all(keys.map(async key=>{const data=await fetchEnvironment(key);const snap=snapshotFor(data,plan.time);return {key,data,snap,result:analyzeSnapshot(snap,plan)};}));rows.sort((a,b)=>b.result.score-a.result.score);
    $('compareGrid').innerHTML=rows.map((row,index)=>`<article class="compare-card ${index===0?'best':''}"><span class="compare-rank">${index===0?'ĐIỂM CAO NHẤT TRONG 5 KHU VỰC':`VỊ TRÍ ${index+1}/5`}</span><h3>${escapeHTML(ward(row.key).name)}</h3><div class="compare-score"><strong>${row.result.score}</strong><span>/10 thuận lợi</span></div><div class="compare-stats"><span>AQI ${round(row.snap.aqi)}</span><span>${round(row.snap.temp)}°C</span><span>PM2.5 ${round(row.snap.pm,1)}</span><span>UV ${round(row.snap.uv,1)}</span></div><button type="button" data-compare-key="${row.key}">Chọn khu vực này</button></article>`).join('');
    $('compareGrid').querySelectorAll('[data-compare-key]').forEach(node=>node.addEventListener('click',()=>runAsyncTask('Chọn khu vực',()=>selectWard(node.dataset.compareKey,{scroll:true,analyze:true}))));
  }catch{$('compareGrid').innerHTML='<div class="empty-state">Chưa thể so sánh lúc này. Hãy kiểm tra mạng và thử lại.</div>';}
  finally{setBusy(button,false);}
}

function calculatePace(){
  const distance=Number($('paceDistance').value),minutes=Number($('paceMinutes').value);if(distance<=0||minutes<=0){$('paceResult').textContent='—';return;}
  $('paceResult').textContent=formatPace(minutes/distance);
}

function formatDuration(seconds){
  const s=Math.max(0,Math.floor(seconds)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function formatPace(minutesPerKm){
  if(!Number.isFinite(minutesPerKm)||minutesPerKm<=0||minutesPerKm>99)return '—';
  let whole=Math.floor(minutesPerKm),seconds=Math.round((minutesPerKm-whole)*60);if(seconds===60){whole+=1;seconds=0;}return `${whole}:${String(seconds).padStart(2,'0')}`;
}

function trackerElapsedSeconds(){
  if(!tracker.startedAt)return 0;const now=tracker.status==='paused'?tracker.pauseStarted:Date.now();return Math.max(0,(now-tracker.startedAt-tracker.pausedMs)/1000);
}
function gpsLevel(accuracy){if(!Number.isFinite(accuracy))return 0;if(accuracy<=10)return 4;if(accuracy<=20)return 3;if(accuracy<=40)return 2;if(accuracy<=70)return 1;return 0;}
function updateGpsBars(accuracy){$('gpsBars').className=`gps-bars level-${gpsLevel(accuracy)}`;}
function trackerSetState(status){
  tracker.status=status;const node=$('trackerStatus');node.className=`tracker-state ${status}`;
  node.innerHTML=status==='running'?'<i></i> Đang ghi GPS':status==='paused'?'<i></i> Đang tạm dừng':status==='finished'?'<i></i> Đã kết thúc':'<i></i> Chưa bắt đầu';
}
function updateTrackerMetrics(){
  $('trackerDistance').textContent=tracker.distanceKm.toFixed(2);const seconds=trackerElapsedSeconds();$('trackerTime').textContent=formatDuration(seconds);
  $('trackerPace').textContent=tracker.distanceKm>=.05?formatPace((seconds/60)/tracker.distanceKm):'—';$('trackerSpeed').textContent=round(tracker.currentSpeed,1).toFixed(1);$('routePointCount').textContent=tracker.points.length;
}
function updateRunMap(point,accepted=true){
  if(!runMap||!window.L)return;
  const latlng=[point.lat,point.lon];
  if(!runMarker)runMarker=L.circleMarker(latlng,{radius:7,color:'#075b49',fillColor:'#c8f16b',fillOpacity:1,weight:4}).addTo(runMap);else runMarker.setLatLng(latlng);
  if(accepted){if(!runPolyline)runPolyline=L.polyline([latlng],{color:'#075b49',weight:6,opacity:.9,lineCap:'round'}).addTo(runMap);else runPolyline.addLatLng(latlng);}
  if(tracker.points.length<=2)runMap.setView(latlng,16);else runMap.panTo(latlng,{animate:true,duration:.35});
}
function resetRunMap(){if(runPolyline){runPolyline.remove();runPolyline=null;}if(runMarker){runMarker.remove();runMarker=null;}if(runMap)runMap.setView([16.06,108.22],13);}

async function requestWakeLock(){
  if(!('wakeLock' in navigator)||document.visibilityState!=='visible')return;
  try{tracker.wakeLock=await navigator.wakeLock.request('screen');tracker.wakeLock.addEventListener('release',()=>{tracker.wakeLock=null;});}catch{}
}
async function releaseWakeLock(){try{await tracker.wakeLock?.release();}catch{}tracker.wakeLock=null;}

function startTrackerWatch(){
  if(!navigator.geolocation)return;
  if(tracker.watchId!==null)navigator.geolocation.clearWatch(tracker.watchId);
  tracker.watchId=navigator.geolocation.watchPosition(handleTrackPosition,handleTrackError,{enableHighAccuracy:true,maximumAge:3000,timeout:7000});
}
function stopTrackerWatch(){if(tracker.watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(tracker.watchId);tracker.watchId=null;}}

function trackerAlert(tone,title,text,icon='◎'){
  const box=$('trackerAlert');box.className=`tracker-alert ${tone||''}`;box.innerHTML=`<span>${icon}</span><p><b>${escapeHTML(title)}</b> ${escapeHTML(text)}</p>`;
}

async function refreshTrackerEnvironment(point){
  if(Date.now()-tracker.envLastAt<8*60*1000&&tracker.envPoint&&haversine(point.lat,point.lon,tracker.envPoint.lat,tracker.envPoint.lon)<1.5)return;
  tracker.envLastAt=Date.now();tracker.envPoint=point;
  try{
    const near=nearestWard(point.lat,point.lon);const label=`${near.item.name} · GPS`;
    const data=await fetchEnvironmentAt(point.lat,point.lon,{key:near.item.key,label,cacheId:`track:${point.lat.toFixed(3)},${point.lon.toFixed(3)}`,accuracy:point.accuracy,mode:'gps',force:true});
    const plan={...currentPlan(),time:vnIso().slice(11,16)};const result=analyzeSnapshot(data.current,plan);tracker.lastEnvResult=result;
    $('trackerAqi').textContent=round(data.current.aqi);$('trackerTemp').textContent=`${round(data.current.temp)}°C`;$('trackerWind').textContent=`${round(data.current.wind)} km/h`;$('trackerAdvice').textContent=`${result.score}/10`;
    trackerAlert(result.tone,result.title,`${result.text} · ${sourceLabel(data.source)}.`,result.icon);
  }catch{trackerAlert('caution','GPS vẫn đang ghi.','Chưa cập nhật được dữ liệu môi trường; quãng đường và pace vẫn tiếp tục hoạt động.','◷');}
}

function handleTrackPosition(position){
  if(tracker.status!=='running')return;
  const c=position.coords;const point={lat:c.latitude,lon:c.longitude,accuracy:Number(c.accuracy||999),timestamp:position.timestamp||Date.now()};
  setSystemStatus('gps',point.accuracy<=80?'ok':'warn',`±${round(point.accuracy)} m`);
  const near=nearestWard(point.lat,point.lon);$('trackerLocation').textContent=near.distance<25?near.item.name:'Vị trí hiện tại';$('trackerAccuracy').textContent=`Độ chính xác ±${round(point.accuracy)} m`;updateGpsBars(point.accuracy);updateRunMap(point,false);

  if(point.accuracy>80){tracker.currentSpeed=0;updateTrackerMetrics();trackerAlert('caution','Tín hiệu GPS yếu.',`Sai số hiện tại khoảng ±${round(point.accuracy)} m. AIRUN chưa cộng điểm này vào quãng đường.`,'⌖');return;}

  if(!tracker.lastPoint){tracker.lastPoint=point;tracker.points.push(point);updateRunMap(point,true);updateTrackerMetrics();refreshTrackerEnvironment(point);return;}

  const dt=Math.max(.1,(point.timestamp-tracker.lastPoint.timestamp)/1000);const segmentKm=haversine(tracker.lastPoint.lat,tracker.lastPoint.lon,point.lat,point.lon);const segmentM=segmentKm*1000;
  const noiseThreshold=Math.max(3,Math.min(12,(point.accuracy+tracker.lastPoint.accuracy)*.14));
  if(segmentM<noiseThreshold){tracker.currentSpeed=Number.isFinite(c.speed)&&c.speed>=0?c.speed*3.6:0;updateTrackerMetrics();return;}

  const segmentSpeed=segmentKm/(dt/3600);
  if(segmentM>350||segmentSpeed>32){trackerAlert('caution','Đã bỏ một điểm GPS bất thường.',`Bước nhảy ${round(segmentM)} m không được cộng vào quãng đường.`,'⌖');return;}

  tracker.distanceKm+=segmentKm;tracker.lastPoint=point;tracker.points.push(point);
  const rawSpeed=Number.isFinite(c.speed)&&c.speed>=0?c.speed*3.6:segmentSpeed;tracker.speedSamples.push(clamp(rawSpeed,0,32));if(tracker.speedSamples.length>5)tracker.speedSamples.shift();tracker.currentSpeed=tracker.speedSamples.reduce((a,b)=>a+b,0)/tracker.speedSamples.length;
  updateRunMap(point,true);updateTrackerMetrics();refreshTrackerEnvironment(point);
}

function handleTrackError(error){
  if(error.code===1){setSystemStatus('gps','error','Bị chặn');trackerAlert('bad','Không có quyền GPS.','Hãy cho phép vị trí trong trình duyệt rồi bắt đầu lại.','!');abortTracker();}
  else if(error.code===2){setSystemStatus('gps','warn','Chưa có vị trí');trackerAlert('caution','Chưa xác định được vị trí.','Di chuyển ra nơi thoáng hơn và giữ AIRUN đang mở.','⌖');}
  else{setSystemStatus('gps','warn','Đang chờ tín hiệu');trackerAlert('caution','GPS phản hồi chậm.','AIRUN vẫn đang chờ vị trí mới.','◷');}
}

function resetTrackerData(){
  tracker.startedAt=0;tracker.pausedMs=0;tracker.pauseStarted=0;tracker.distanceKm=0;tracker.points=[];tracker.lastPoint=null;tracker.speedSamples=[];tracker.currentSpeed=0;tracker.envLastAt=0;tracker.envPoint=null;tracker.lastEnvResult=null;resetRunMap();
  $('trackerLocation').textContent='Đang chờ GPS…';$('trackerAccuracy').textContent='Độ chính xác —';updateGpsBars(NaN);$('trackerAqi').textContent='—';$('trackerTemp').textContent='—';$('trackerWind').textContent='—';$('trackerAdvice').textContent='Chưa có';$('routePointCount').textContent='0';updateTrackerMetrics();
}

async function startRun(){
  if(!navigator.geolocation){showToast('Thiết bị/trình duyệt này không hỗ trợ GPS.');return;}
  const button=$('startRunBtn');
  setBusy(button,true,'Đang kết nối GPS…');
  setSystemStatus('gps','loading','Đang kết nối');
  trackerAlert('','Đang kiểm tra GPS…','AIRUN sẽ chỉ bắt đầu tính thời gian sau khi nhận được vị trí đầu tiên.','⌖');

  try{
    const readiness=await gpsReadiness();
    if(!readiness.ok) throw geoError(readiness.reason==='denied'?1:readiness.reason,readiness.reason);

    const first=await requestGPSPosition(stage=>trackerAlert('',stage,'Nếu đang ở trong nhà, vị trí có thể mất vài giây để xuất hiện.','⌖'),{maximumAge:5000});
    resetTrackerData();
    tracker.startedAt=Date.now();trackerSetState('running');
    button.disabled=true;button.textContent='▶ Đang chạy';
    $('pauseRunBtn').disabled=false;$('finishRunBtn').disabled=false;$('pauseRunBtn').textContent='Ⅱ Tạm dừng';

    // Feed the first fix immediately so the UI never sits at “waiting GPS”.
    handleTrackPosition(first);
    const acc=Number(first.coords.accuracy||999);
    setSystemStatus('gps',acc>80?'warn':'ok',`±${round(acc)} m`);
    if(acc>80){
      trackerAlert('caution','GPS đã kết nối nhưng còn yếu.',`Độ chính xác hiện tại khoảng ±${round(acc)} m. AIRUN đang chờ tín hiệu tốt hơn trước khi cộng quãng đường.`,'⌖');
    }else{
      trackerAlert('good','GPS đã kết nối.',`Độ chính xác khoảng ±${round(acc)} m. AIRUN đang ghi lộ trình.`,'✓');
    }

    startTrackerWatch();tracker.timer=setInterval(updateTrackerMetrics,1000);requestWakeLock();
    showToast(`GPS đã kết nối · ±${round(acc)} m.`);

    // Ask for a better high-accuracy fix in the background if the first one is coarse.
    if(acc>20){
      void refineGPSPosition(first).then(better=>{
        if(better && tracker.status==='running') handleTrackPosition(better);
      });
    }
  }catch(error){
    setBusy(button,false);
    trackerSetState('idle');
    const help=gpsHelpMessage(error);
    setSystemStatus('gps','error',error?.code===1?'Bị chặn':'Không kết nối');
    trackerAlert('bad','Chưa kết nối được GPS.',help,'!');
    showToast(help);
    return;
  }
}

async function pauseOrResumeRun(){
  if(tracker.status==='running'){
    tracker.pauseStarted=Date.now();trackerSetState('paused');stopTrackerWatch();await releaseWakeLock();$('pauseRunBtn').textContent='▶ Tiếp tục';tracker.currentSpeed=0;updateTrackerMetrics();trackerAlert('caution','Đã tạm dừng.','Quãng đường không được cộng trong thời gian tạm dừng.','Ⅱ');
  }else if(tracker.status==='paused'){
    tracker.pausedMs+=Date.now()-tracker.pauseStarted;tracker.pauseStarted=0;trackerSetState('running');$('pauseRunBtn').textContent='Ⅱ Tạm dừng';startTrackerWatch();requestWakeLock();trackerAlert('','Đang tiếp tục.','AIRUN đang chờ điểm GPS tiếp theo.','⌖');
  }
}

function abortTracker(){
  stopTrackerWatch();clearInterval(tracker.timer);tracker.timer=null;releaseWakeLock();trackerSetState('idle');$('startRunBtn').disabled=false;$('pauseRunBtn').disabled=true;$('finishRunBtn').disabled=true;
}

async function finishRun(){
  if(!['running','paused'].includes(tracker.status))return;
  if(tracker.status==='paused'){tracker.pausedMs+=Date.now()-tracker.pauseStarted;tracker.pauseStarted=0;}
  stopTrackerWatch();clearInterval(tracker.timer);tracker.timer=null;await releaseWakeLock();tracker.currentSpeed=0;updateTrackerMetrics();trackerSetState('finished');
  $('startRunBtn').disabled=false;$('startRunBtn').textContent='▶ Chạy mới';$('pauseRunBtn').disabled=true;$('finishRunBtn').disabled=true;
  const seconds=trackerElapsedSeconds(),pace=tracker.distanceKm>=.05?(seconds/60)/tracker.distanceKm:null;const near=tracker.lastPoint?nearestWard(tracker.lastPoint.lat,tracker.lastPoint.lon).item:ward();
  $('runSummary').hidden=false;$('summaryTitle').textContent=tracker.points.length>=2?'Buổi chạy đã hoàn thành':'Phiên GPS đã kết thúc';$('summaryMeta').textContent=`${new Date().toLocaleString('vi-VN')} · ${near.name} · ${tracker.points.length} điểm GPS hợp lệ`;$('summaryDistance').textContent=`${tracker.distanceKm.toFixed(2)} km`;$('summaryTime').textContent=formatDuration(seconds);$('summaryPace').textContent=pace?`${formatPace(pace)} /km`:'—';
  if(tracker.points.length>=2&&seconds>=10){saveRunToJournal({seconds,pace,area:near.name});showToast('Đã lưu tóm tắt buổi chạy trên thiết bị.');}
  else showToast('Chưa đủ điểm GPS để lưu thành một buổi chạy.');
  trackerAlert(tracker.lastEnvResult?.tone||'good','Đã kết thúc.',`Quãng đường ${tracker.distanceKm.toFixed(2)} km · ${formatDuration(seconds)}. Toàn bộ chuỗi tọa độ không được lưu vào nhật ký.`,'✓');
}

function journalRows(){
  let rows=localGet(STORAGE.journal,null);
  if(rows===null){rows=localGet('airun-v40-journal',[]);localSet(STORAGE.journal,rows);}
  return Array.isArray(rows)?rows:[];
}

function saveRunToJournal({seconds,pace,area}){
  const rows=journalRows();rows.unshift({id:Date.now(),type:'run',at:new Date().toISOString(),area,distance:round(tracker.distanceKm,2),durationSec:round(seconds),pace:pace?formatPace(pace):'',aqi:tracker.lastEnvResult?$('trackerAqi').textContent:'',score:tracker.lastEnvResult?.score??'',source:'gps'});localSet(STORAGE.journal,rows.slice(0,50));renderJournal();
}

function saveJournal(){
  if(!activeResult||!activeSnapshot){showToast('Hãy phân tích kế hoạch trước khi lưu.');return;}
  if(!selectedDecision){showToast('Hãy chọn quyết định của bạn trước khi lưu.');return;}
  const rows=journalRows(),plan=currentPlan(),label=activeData?.location?.label||ward().name;
  const estimate=planEstimate(plan);
  rows.unshift({id:Date.now(),type:'plan',at:new Date().toISOString(),area:label,time:plan.time,duration:plan.duration,pace:formatPace(estimate.pace),distance:round(estimate.distance,2),intensity:plan.intensity,sensitive:plan.sensitive,decision:selectedDecision,score:activeResult.score,aqi:round(activeSnapshot.aqi),temp:round(activeSnapshot.temp),note:$('note').value.trim(),source:activeData.source});
  localSet(STORAGE.journal,rows.slice(0,50));$('note').value='';renderJournal();showToast('Đã lưu kế hoạch vào nhật ký trên thiết bị.');
}

function renderJournal(){
  const rows=journalRows();
  $('journalList').innerHTML=rows.length?rows.map(row=>{
    const date=new Date(row.at);const isRun=row.type==='run';
    const title=isRun?`🏃 Buổi chạy GPS · ${escapeHTML(row.area)}`:`${escapeHTML(row.area)} · ${escapeHTML(row.decision||'Kế hoạch')}`;
    const desc=isRun?`${row.distance??0} km · ${formatDuration(row.durationSec||0)}${row.pace?` · pace ${escapeHTML(row.pace)}/km`:''}`:`${escapeHTML(row.time||'')} · ${row.duration||0} phút · ${row.distance??'—'} km${row.pace?` · pace ${escapeHTML(row.pace)}/km`:''} · ${escapeHTML(row.intensity||'')} · AQI ${row.aqi??'—'}${row.note?` · ${escapeHTML(row.note)}`:''}`;
    const metric=isRun?`${row.distance??0} km`:`${row.score??'—'}/10`;const metricLabel=isRun?'quãng đường':'thuận lợi';
    return `<article class="journal-item"><div class="journal-date"><b>${date.toLocaleDateString('vi-VN',{day:'2-digit'})}</b><span>${date.toLocaleDateString('vi-VN',{month:'2-digit',year:'numeric'})}</span></div><div class="journal-main"><b>${title}</b><p>${desc}</p></div><div class="journal-score"><b>${metric}</b><span>${metricLabel}</span></div><button class="journal-delete" type="button" data-delete="${row.id}" aria-label="Xóa mục này">×</button></article>`;
  }).join(''):'<div class="empty-state">Chưa có dữ liệu được lưu.</div>';
  $('journalList').querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>{localSet(STORAGE.journal,rows.filter(row=>row.id!==Number(button.dataset.delete)));renderJournal();}));
}

function csvCell(value){let text=String(value??'');if(/^[=+\-@]/.test(text))text=`'${text}`;return `"${text.replace(/"/g,'""')}"`;}
function exportJournal(){
  const rows=journalRows();if(!rows.length){showToast('Nhật ký đang trống.');return;}
  const header=['Loại','Thời điểm','Khu vực','Giờ/Khoảng thời gian','Thời lượng giây','Quãng đường km','Pace','Cường độ','Quyết định','Điểm','AQI','Nhiệt độ','Nguồn','Ghi chú'];
  const body=rows.map(row=>row.type==='run'?['Buổi chạy GPS',new Date(row.at).toLocaleString('vi-VN'),row.area,'',row.durationSec,row.distance,row.pace,'','','',row.aqi,'','GPS', '']:['Kế hoạch',new Date(row.at).toLocaleString('vi-VN'),row.area,row.time,(row.duration||0)*60,'','',row.intensity,row.decision,row.score,row.aqi,row.temp,sourceLabel(row.source),row.note]);
  const lines=[header,...body].map(row=>row.map(csvCell).join(','));const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`AIRUN_Nhat_ky_${new Date().toISOString().slice(0,10)}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function initDialogs(){
  const dialog=$('dataDialog');if(!dialog)return;
  const open=()=>{if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');};
  const close=()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');};
  on('dataInfoBtn','click',open);on('footerDataBtn','click',open);on('dialogClose','click',close);on('dialogOk','click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
}

async function clearLegacyServiceWorkerControl(){
  if(!('serviceWorker' in navigator)) return false;
  try{
    const wasControlled=Boolean(navigator.serviceWorker.controller);
    const regs=await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(reg=>reg.unregister()));
    if('caches' in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('airun-')).map(k=>caches.delete(k)));}
    // Worker cũ vẫn có thể kiểm soát tab hiện tại cho tới lần reload kế tiếp.
    if(wasControlled && !sessionStorage.getItem('airun-v58-worker-cleared')){
      sessionStorage.setItem('airun-v58-worker-cleared','1');
      const url=new URL(location.href);url.searchParams.set('v58',Date.now());location.replace(url.toString());
      return true;
    }
  }catch(error){console.warn('AIRUN worker cleanup:',error);}
  return false;
}
function initPWA(){const button=$('installBtn');if(button)button.hidden=true;}

async function runDiagnostics(){
  const button=$('diagnosticBtn');setBusy(button,true,'Đang kiểm tra…');
  setSystemStatus('js','ok','V5.8 Live API đang chạy');updateConnection();
  try{
    const permission=await geolocationPermissionState();
    setSystemStatus('gps',permission==='denied'?'error':permission==='granted'?'ok':'warn',permission==='denied'?'Bị chặn':permission==='granted'?'Đã cấp quyền':'Chưa cấp quyền');
    const data=await getEnvironmentForActive(true,(partial)=>renderEnvironmentData(partial));
    renderEnvironmentData(data);
    const live=data.source==='live';
    showToast(live?'Weather + Air API đã phản hồi trực tiếp.':'AIRUN đã kiểm tra xong; xem 4 trạng thái kết nối bên dưới số liệu.');
  }catch(error){console.warn('AIRUN diagnostics:',error);showToast('Đã kiểm tra. Có nguồn dữ liệu chưa phản hồi; xem trạng thái kết nối.');}
  finally{setBusy(button,false);}
}

function bindEvents(){
  on('planForm','submit',event=>{event.preventDefault();analyzePlan(true);});
  on('area','change',event=>runAsyncTask('Đổi khu vực',()=>selectWard(event.target.value,{analyze:true,force:true})));
  on('time','change',()=>analyzePlan(false));on('duration','change',()=>{updatePlanEstimate();analyzePlan(false);});on('planPace','input',()=>{updatePlanEstimate();savePlanSettings();});on('planPace','change',()=>analyzePlan(false));on('sensitive','change',()=>analyzePlan(false));
  document.querySelectorAll('[data-intensity]').forEach(button=>button.addEventListener('click',()=>{intensity=button.dataset.intensity;document.querySelectorAll('[data-intensity]').forEach(node=>node.classList.toggle('active',node===button));updatePlanEstimate();analyzePlan(false);}));
  document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{selectedDecision=button.dataset.decision;document.querySelectorAll('[data-decision]').forEach(node=>node.classList.toggle('active',node===button));if(selectedDecision==='Đổi giờ')$('time')?.focus();if(selectedDecision==='Đổi khu vực')$('area')?.focus();}));
  on('refreshBtn','click',async()=>{const button=$('refreshBtn');setBusy(button,true,'Đang cập nhật…');try{const data=await getEnvironmentForActive(true,(partial)=>renderEnvironmentData(partial));renderEnvironmentData(data);showToast(data.source==='live'?'Đã nhận dữ liệu trực tiếp.':'Đã cập nhật bằng nguồn dữ liệu sẵn có.');}finally{setBusy(button,false);}});
  on('diagnosticBtn','click',()=>runAsyncTask('Kiểm tra kết nối',runDiagnostics));
  on('compareBtn','click',()=>runAsyncTask('So sánh khu vực',compareAreas));on('gpsBtn','click',()=>runAsyncTask('GPS',()=>useGPS({scroll:false})));on('heroGps','click',()=>runAsyncTask('GPS',()=>useGPS({scroll:false})));on('plannerGpsBtn','click',()=>runAsyncTask('GPS',()=>useGPS({scroll:true})));
  on('clearGpsPlan','click',()=>runAsyncTask('Bỏ GPS',()=>selectWard(selectedKey,{analyze:true,force:true})));on('wardSearch','input',event=>renderWardControls(event.target.value));
  on('paceDistance','input',calculatePace);on('paceMinutes','input',calculatePace);on('savePlanBtn','click',saveJournal);on('exportBtn','click',exportJournal);
  on('clearJournalBtn','click',()=>{if(journalRows().length&&confirm('Xóa toàn bộ nhật ký trên thiết bị này?')){localSet(STORAGE.journal,[]);renderJournal();showToast('Đã xóa nhật ký.');}});
  on('startRunBtn','click',startRun);on('pauseRunBtn','click',pauseOrResumeRun);on('finishRunBtn','click',finishRun);
  on('menuBtn','click',()=>{const nav=$('mainNav');if(!nav)return;const open=nav.classList.toggle('open');$('menuBtn')?.setAttribute('aria-expanded',String(open));});
  $('mainNav')?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{$('mainNav')?.classList.remove('open');$('menuBtn')?.setAttribute('aria-expanded','false');}));
  window.addEventListener('scroll',()=>{const node=$('backTop');if(node)node.classList.toggle('show',scrollY>600);},{passive:true});on('backTop','click',()=>scrollTo({top:0,behavior:'smooth'}));
  window.addEventListener('online',()=>{updateConnection();showToast('Đã kết nối lại Internet.');runAsyncTask('Kết nối lại API',runDiagnostics);});
  window.addEventListener('offline',()=>{updateConnection();setSystemStatus('weather','warn','Ngoại tuyến');setSystemStatus('air','warn','Ngoại tuyến');showToast('Mất kết nối: GPS vẫn hoạt động, dữ liệu môi trường dùng bản đã lưu/dự phòng.');});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&tracker.status==='running'&&!tracker.wakeLock)requestWakeLock();});
  window.addEventListener('beforeunload',event=>{if(tracker.status==='running'){event.preventDefault();event.returnValue='';}});
}

let airunInitialized=false;
async function init(){
  if(airunInitialized)return;airunInitialized=true;
  if(await clearLegacyServiceWorkerControl()) return;
  if(typeof window!=='undefined')window.__AIRUN_APP_READY='v58';
  setSystemStatus('js','ok','V5.8 Live API đang chạy');
  safeCall('khu vực',()=>{$('area').innerHTML=WARDS.map(item=>`<option value="${item.key}">${escapeHTML(item.name)}</option>`).join('');});
  safeCall('khôi phục cài đặt',restorePlanSettings);
  safeCall('chọn khu vực',()=>{$('area').value=selectedKey;});
  safeCall('danh sách khu vực',renderWardControls);
  safeCall('bản đồ bên',updateMapSide);
  safeCall('nhật ký',renderJournal);
  safeCall('pace',calculatePace);
  safeCall('ước tính kế hoạch',updatePlanEstimate);
  safeCall('trạng thái mạng',updateConnection);
  safeCall('nút bấm',bindEvents);
  safeCall('hộp thoại',initDialogs);
  safeCall('PWA',initPWA);
  safeCall('tracker',updateTrackerMetrics);

  const lastGps=localGet('airun-v54-last-gps',null);
  if(lastGps&&Date.now()-Number(lastGps.at||0)<60*60*1000)setSystemStatus('gps','warn',`Gần nhất ±${round(lastGps.accuracy||0)} m`);
  else setSystemStatus('gps','idle','Chưa yêu cầu');

  // Không bao giờ để dashboard trống: số dự phòng xuất hiện ngay trước khi gọi mạng.
  safeCall('dữ liệu tức thời',()=>renderEnvironmentInstant(quickEnvironmentForWard(selectedKey),{updating:true}));

  // Bản đồ, API và GPS là các luồng độc lập; một luồng lỗi không làm chết nút bấm.
  loadLeaflet().then(initMaps).catch(()=>{const fallback=$('mapFallback');if(fallback)fallback.hidden=false;});
  selectWard(selectedKey,{analyze:true,force:true}).catch(error=>{console.warn('AIRUN initial live update:',error);setApiUpdateText('API chưa phản hồi · đang dùng dữ liệu dự phòng');});
}

if(hasDom()){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else void init();
}

if(typeof module!=='undefined'&&module.exports){module.exports={WARDS,aqiInfo,uvInfo,analyzeSnapshot,fallbackData,haversine,weatherText,escapeHTML,clamp,round,formatPace,formatDuration,gpsLevel,parsePace,planEstimate,defaultPaceForIntensity,fetchEnvironmentAt};}
