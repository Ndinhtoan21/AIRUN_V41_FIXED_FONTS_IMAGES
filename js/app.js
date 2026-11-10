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
  plan:'airun-v70-plan', journal:'airun-v70-journal', cache:'airun-v70-live-cache', migrated:'airun-v70-migrated'
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
  distanceKm:0, points:[], rawPoints:[], rawPoint:null, lastPoint:null, speedSamples:[], currentSpeed:0,
  wakeLock:null, envLastAt:0, envPoint:null, lastEnvResult:null,
  lastFixAt:0, recoveryTimer:null, recoveryBusy:false, mapBounds:null, mapSrc:'', plannedRoute:null
};

const routePlanner={targetKm:null,usePlan:true,seed:0,current:null,busy:false};
const ROUTE_CONFIG_KEYS={mapbox:'airun-v70-mapbox-token',graphhopper:'airun-v70-graphhopper-key'};
const advancedMap={map:null,loaded:false,loading:null,startMarker:null,kmMarkers:[],routeReady:false};
const routeFallbackMap={map:null,loading:null,startMarker:null,kmMarkers:[],routeReady:false,lastFitSignature:''};
const runAdvancedMap={map:null,ready:false,userAt:0,loading:null,currentMarker:null,startMarker:null,lastFitSignature:'',resizeTimer:null};
const runFallbackMap={map:null,ready:false,userAt:0,loading:null,currentMarker:null,startMarker:null,lastFitSignature:'',resizeTimer:null};

function ward(key = selectedKey){ return WARDS.find(item => item.key === key) || WARDS[0]; }
function safeJSON(raw, fallback){ try{return JSON.parse(raw)}catch{return fallback} }
// V8: localStorage.getItem() trả null với người dùng mới → JSON.parse(null) = null (không lỗi) nên phải tự trả fallback.
function localGet(key, fallback){ try{const raw=localStorage.getItem(key);if(raw===null||raw===undefined)return fallback;const value=safeJSON(raw,fallback);return value===null||value===undefined?fallback:value;}catch{return fallback} }
const fmt=(value,digits=0,empty='—')=>value===null||value===undefined||value===''||!Number.isFinite(Number(value))?empty:round(value,digits);
const hasNum=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));
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
    setSystemStatus('js','warn','V8.0 · tác vụ phụ lỗi');
    showToast(`${name} chưa hoàn tất. Các chức năng khác vẫn hoạt động.`);
  });
}

if(typeof window!=='undefined'){
  window.addEventListener('error',event=>{
    console.error('AIRUN global error:',event.error||event.message);
    setSystemStatus('js','warn','V8.0 · có lỗi phụ');
    setApiUpdateText(`Lỗi giao diện phụ: ${String(event.message||'không xác định').slice(0,80)}`);
  });
  window.addEventListener('unhandledrejection',event=>{
    console.error('AIRUN rejected promise:',event.reason);
    // Một tác vụ phụ (bản đồ/GPS refine/animation) không được làm người dùng nghĩ toàn app đã chết.
    setSystemStatus('js','warn','V8.0 · tác vụ phụ lỗi');
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
  const nearest=nearestWard(lat,lon);
  const key=options.key||nearest.item.key;
  const label=options.label||nearest.item.name;
  const cacheId=options.cacheId||`geo:${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
  const location={lat:Number(lat),lon:Number(lon),label,accuracy:options.accuracy??null,mode:options.mode||'ward'};
  const onProgress=typeof options.onProgress==='function'?options.onProgress:null;
  // V8: không trộn số mô phỏng vào dữ liệu thật. Trường nào chưa có từ API thì để null.
  const hourlyMap=new Map();
  let current={temp:null,feels:null,humidity:null,wind:null,rain:null,precip:null,uv:null,code:null,aqi:null,pm:null,pm10:null};
  let weatherOk=false,airOk=false,weatherMs=null,airMs=null;

  setSystemStatus('weather','loading','Đang kết nối…');
  setSystemStatus('air','loading','Đang kết nối…');
  setApiUpdateText(`Đang lấy dữ liệu trực tiếp cho ${label}…`);

  const failedBackup=()=>({...fallbackData(nearest.item,location),failed:true});
  if(typeof navigator!=='undefined'&&!navigator.onLine){
    setSystemStatus('weather','warn','Ngoại tuyến');
    setSystemStatus('air','warn','Ngoại tuyến');
    const stale=getStaleCache(cacheId);
    return stale?{...stale,source:'cached'}:failedBackup();
  }

  const safeLat=Number(lat).toFixed(5),safeLon=Number(lon).toFixed(5);
  const weatherUrl=`/api/weather/${safeLat}/${safeLon}`;
  const airUrl=`/api/air/${safeLat}/${safeLon}`;
  const nowHour=vnIso().slice(0,13)+':00';

  const buildResult=()=>{
    const hourly=[...hourlyMap.values()].sort((a,b)=>a.time.localeCompare(b.time));
    // Khả năng mưa hiện tại lấy từ dự báo giờ hiện tại (không còn gán 100% chỉ vì có vài giọt mưa).
    const row=hourlyMap.get(nowHour);
    const cur={...current};
    if(row&&hasNum(row.rain))cur.rain=row.rain;else if(hasNum(cur.precip))cur.rain=cur.precip>0.2?80:cur.precip>0?40:0;
    if(!hasNum(cur.uv)&&row&&hasNum(row.uv))cur.uv=row.uv;
    return {
      cacheId,key,
      source:weatherOk&&airOk?'live':(weatherOk||airOk?'partial':'demo'),
      forecastSource:weatherOk&&airOk?'live':(weatherOk||airOk)?'partial':'demo',
      updated:Date.now(),location,current:cur,hourly,
      liveParts:{weather:weatherOk,air:airOk},latency:{weather:weatherMs,air:airMs}
    };
  };
  const publish=part=>{
    const data=buildResult();
    if(onProgress){try{onProgress(data,part);}catch(error){console.warn('AIRUN progress:',error);}}
    return data;
  };

  async function readProxy(url){
    const response=await fetch(url,{cache:'no-store',headers:{Accept:'application/json'}});
    const text=await response.text();
    if(!response.ok)throw new Error(`HTTP ${response.status}: ${text.slice(0,100)}`);
    let json;try{json=JSON.parse(text);}catch{throw new Error(/<html/i.test(text)?'PROXY_NOT_CONFIGURED':'API_NOT_JSON');}
    if(!json||json.error)throw new Error(json?.reason||'API_INVALID');
    return json;
  }
  const mergeHour=(time,patch)=>{const old=hourlyMap.get(time)||{time};const next={...old};for(const [k,v] of Object.entries(patch)){if(hasNum(v))next[k]=Number(v);}hourlyMap.set(time,next);};

  const weatherTask=(async()=>{
    const started=performance.now();
    try{
      const w=await readProxy(weatherUrl),wc=w.current||{};
      current={...current,
        temp:asNumber(wc.temperature_2m,null),
        feels:asNumber(wc.apparent_temperature,null),
        humidity:asNumber(wc.relative_humidity_2m,null),
        wind:asNumber(wc.wind_speed_10m,null),
        code:asNumber(wc.weather_code,null),
        precip:asNumber(wc.precipitation,null)
      };
      const h=w.hourly||{},times=Array.isArray(h.time)?h.time:[];
      times.forEach((time,index)=>mergeHour(time,{temp:h.temperature_2m?.[index],feels:h.apparent_temperature?.[index],humidity:h.relative_humidity_2m?.[index],rain:h.precipitation_probability?.[index],wind:h.wind_speed_10m?.[index],code:h.weather_code?.[index],uvW:h.uv_index?.[index]}));
      weatherOk=true;weatherMs=Math.max(1,Math.round(performance.now()-started));setSystemStatus('weather','ok',`${weatherMs} ms`);publish('weather');
    }catch(error){console.warn('AIRUN Weather proxy:',error);setSystemStatus('weather','error',apiErrorLabel(error));}
  })();

  const airTask=(async()=>{
    const started=performance.now();
    try{
      const a=await readProxy(airUrl),ac=a.current||{};
      current={...current,aqi:asNumber(ac.us_aqi,null),pm:asNumber(ac.pm2_5,null),pm10:asNumber(ac.pm10,null),uv:asNumber(ac.uv_index,current.uv)};
      const h=a.hourly||{},times=Array.isArray(h.time)?h.time:[];
      times.forEach((time,index)=>mergeHour(time,{aqi:h.us_aqi?.[index],pm:h.pm2_5?.[index],pm10:h.pm10?.[index],uv:h.uv_index?.[index]}));
      airOk=true;airMs=Math.max(1,Math.round(performance.now()-started));
      setSystemStatus('air','ok',times.length?`${airMs} ms`:`${airMs} ms · chưa có dự báo giờ`);publish('air');
    }catch(error){console.warn('AIRUN Air proxy:',error);setSystemStatus('air','error',apiErrorLabel(error));}
  })();

  await Promise.allSettled([weatherTask,airTask]);
  // UV theo giờ: ưu tiên Air API, nếu thiếu dùng UV của Weather API.
  for(const row of hourlyMap.values()){if(!hasNum(row.uv)&&hasNum(row.uvW))row.uv=row.uvW;delete row.uvW;}
  const result=buildResult();
  if(weatherOk||airOk){
    memoryCache.set(cacheId,result);
    try{savePersistentCache(result);}catch(error){console.warn('AIRUN cache:',error);}
    const nowText=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    setApiUpdateText(`${weatherOk&&airOk?'Weather + Air trực tiếp':'Đã nhận một phần dữ liệu trực tiếp'} · ${nowText}`);
    publish('ready');
    return result;
  }
  const stale=getStaleCache(cacheId);
  if(stale){setApiUpdateText('API chưa phản hồi · đang dùng dữ liệu thật đã lưu gần đây');return {...stale,source:'cached'};}
  setApiUpdateText('API chưa phản hồi · chỉ có số liệu mô phỏng (không dùng để quyết định)');
  return failedBackup();
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

// V8: hiệu chỉnh theo phản hồi của chính người dùng (nút "quá khắt khe / quá dễ dãi" sau mỗi buổi chạy).
function personalHeatAdjustment(){
  try{
    const rows=(typeof journalRows==='function'?journalRows():[]).filter(r=>r.feedback&&hasNum(r.feedback.feels)&&Number(r.feedback.feels)>=30);
    const strict=rows.filter(r=>r.feedback.verdict==='qua_khat_khe').length,lenient=rows.filter(r=>r.feedback.verdict==='qua_de_dai').length;
    if(strict+lenient<2)return {value:0,strict,lenient};
    return {value:clamp((strict-lenient)*.3,-1,1),strict,lenient};
  }catch{return {value:0,strict:0,lenient:0};}
}

function analyzeSnapshot(snapshot, plan, options = {}){
  let score = 10; const reasons = [];
  const has={aqi:hasNum(snapshot.aqi),pm:hasNum(snapshot.pm),feels:hasNum(snapshot.feels)||hasNum(snapshot.temp),wind:hasNum(snapshot.wind),rain:hasNum(snapshot.rain),uv:hasNum(snapshot.uv)};
  const aqi=Number(snapshot.aqi??0),pm=Number(snapshot.pm??0),feels=Number(snapshot.feels??snapshot.temp??25),wind=Number(snapshot.wind??0),rain=Number(snapshot.rain??0),uv=Number(snapshot.uv??0);
  const code=Number(snapshot.code);

  if(!has.aqi) reasons.push('Chưa lấy được AQI cho giờ này nên AIRUN chưa tính chất lượng không khí vào điểm.');
  else if(aqi<=50) reasons.push(`AQI Mỹ ${round(aqi)} ở mức tốt, ít cản trở hoạt động ngoài trời.`);
  else if(aqi<=100){score-=(aqi-50)/28;reasons.push(`AQI Mỹ ${round(aqi)} ở mức trung bình; nên chú ý cảm giác hô hấp.`);}
  else if(aqi<=150){score-=3+(aqi-100)/35;reasons.push(`AQI Mỹ ${round(aqi)} không thuận lợi cho nhóm nhạy cảm.`);}
  else{score-=6+Math.min(2,(aqi-150)/50);reasons.push(`AQI Mỹ ${round(aqi)} ở mức có hại; nên tránh chạy ngoài trời cường độ cao.`);}

  if(has.pm){
    if(pm>35.5){score-=1.5;reasons.push(`PM2.5 ${round(pm,1)} µg/m³ khá cao; cân nhắc đổi giờ hoặc chạy trong nhà.`);}
    else if(pm>15){score-=Math.min(.8,(pm-15)/25);reasons.push(`PM2.5 ${round(pm,1)} µg/m³ cần được theo dõi, nhất là khi chạy lâu.`);}
    else reasons.push(`PM2.5 ${round(pm,1)} µg/m³ đang thấp trong dữ liệu hiện có.`);
  }

  // V8: thang nhiệt hiệu chỉnh cho người chạy đã quen nắng nóng ẩm ở Đà Nẵng (BTC nhận xét V7 quá khắt khe).
  let heatPenalty=0;
  if(!has.feels) reasons.push('Chưa có nhiệt độ cho giờ này.');
  else if(feels>=39){heatPenalty=3.6+(feels-39)*.45;reasons.push(`Nhiệt cảm nhận ${round(feels)}°C rất nóng; nguy cơ say nắng cao, nên đổi sang sáng sớm/tối muộn.`);}
  else if(feels>35){heatPenalty=1.3+(feels-35)*.55;reasons.push(`Cảm giác ${round(feels)}°C nóng; nếu vẫn chạy, giảm pace, rút ngắn và uống nước mỗi 15–20 phút.`);}
  else if(feels>30){heatPenalty=(feels-30)*.26;reasons.push(`Cảm giác ${round(feels)}°C hơi nóng nhưng vẫn chạy nhẹ được; mang nước và ưu tiên tuyến có gió/bóng râm.`);}
  else if(feels<14){heatPenalty=Math.min(1.5,(14-feels)*.15);reasons.push(`Cảm giác ${round(feels)}°C khá mát; cần khởi động kỹ.`);}
  else reasons.push(`Nhiệt cảm nhận ${round(feels)}°C tương đối phù hợp cho vận động.`);
  const personal=options.personal===false?{value:0}:personalHeatAdjustment();
  if(heatPenalty>0&&feels>30&&feels<39&&personal.value){
    const before=heatPenalty;heatPenalty=Math.max(0,heatPenalty-personal.value);
    reasons.push(`Điều chỉnh theo phản hồi của bạn (${personal.strict} lần “quá khắt khe”, ${personal.lenient} lần “quá dễ dãi” khi trời nóng): ${personal.value>0?'+':''}${round(before-heatPenalty,1)} điểm.`);
  }
  score-=heatPenalty;

  if([95,96,99].includes(code)){score-=3;reasons.push('Dự báo có dông; không nên chạy ngoài trời trong khung giờ này.');}
  if(has.rain){
    if(rain>=70){score-=2.2;reasons.push(`Khả năng mưa ${round(rain)}%; nên có phương án trong nhà hoặc hoãn chạy.`);}
    else if(rain>=40){score-=.9;reasons.push(`Khả năng mưa ${round(rain)}%; nên kiểm tra bầu trời trước khi xuất phát.`);}
  }
  if(has.wind){
    if(wind>=35){score-=1.8;reasons.push(`Gió khoảng ${round(wind)} km/h có thể làm buổi chạy kém an toàn.`);}
    else if(wind>=22){score-=.7;reasons.push(`Gió khoảng ${round(wind)} km/h; lưu ý ở cầu và ven biển.`);}
  }

  if(has.uv){
    if(uv>=8){score-=1.4;reasons.push(`UV ${round(uv,1)} rất cao; ưu tiên đổi giờ hoặc tăng bảo vệ nắng.`);}
    else if(uv>=6){score-=.8;reasons.push(`UV ${round(uv,1)} cao; nên dùng mũ và chống nắng nếu chạy ban ngày.`);}
    else if(uv>=3){score-=.25;reasons.push(`UV ${round(uv,1)} ở mức trung bình.`);}
  }

  if(plan.intensity==='Cao'){
    if(has.aqi&&aqi>50){score-=1;reasons.push('Cường độ cao làm lượng không khí hít vào tăng, nên tiêu chuẩn không khí cần nghiêm ngặt hơn.');}
    if(feels>32) score-=.6;
  } else if(plan.intensity==='Vừa'&&((has.aqi&&aqi>100)||feels>34)) score-=.4;
  if(plan.duration>=60&&feels>31){score-=.6;reasons.push(`Thời lượng ${plan.duration} phút trong điều kiện nóng cần bổ sung nước và nghỉ hợp lý.`);}
  if(plan.sensitive&&has.aqi&&aqi>50){score-=aqi>100?2.2:1;reasons.push('Bạn đã chọn nhóm nhạy cảm nên AIRUN áp dụng ngưỡng thận trọng hơn.');}

  score=round(clamp(score,0,10),1);
  let tone='good',title=score>=8.5?'Rất hợp để chạy':'Hợp để chạy',text='Điều kiện thuận lợi. Khởi động kỹ rồi chạy theo kế hoạch.',icon='✓';
  if(score<5||(has.aqi&&aqi>150)||feels>=41){tone='bad';title='Không nên chạy ngoài trời';text='Nên đổi sang giờ khác hoặc chạy trong nhà để an toàn.';icon='!';}
  else if(score<7.5){tone='caution';title=score>=6.5?'Chạy được, nên chạy nhẹ':'Nên đổi giờ hoặc chạy nhẹ';text=score>=6.5?'Vẫn chạy được: giảm tốc độ, mang nước, chọn đường có gió/bóng râm.':'Điều kiện chưa tốt: nên chuyển sang giờ có cột xanh bên dưới, hoặc chạy ngắn và nhẹ.';icon='◷';}
  return {score,tone,title,text,icon,reasons:reasons.slice(0,7)};
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
  if(typeof syncRoutePlanCard==='function')syncRoutePlanCard(estimate);
  return estimate;
}

/* ===== V8.2 · Hiển thị thân thiện: kết luận bằng lời, số liệu là phụ ===== */
function levelAir(aqi){if(!hasNum(aqi))return {word:'Chưa có',tone:'none'};aqi=Number(aqi);if(aqi<=50)return {word:'Trong lành',tone:'good'};if(aqi<=100)return {word:'Trung bình',tone:'ok'};if(aqi<=150)return {word:'Kém',tone:'warn'};return {word:'Xấu',tone:'bad'};}
function levelHeat(f){if(!hasNum(f))return {word:'Chưa có',tone:'none'};f=Number(f);if(f<24)return {word:'Mát',tone:'good'};if(f<30)return {word:'Dễ chịu',tone:'good'};if(f<35)return {word:'Hơi nóng',tone:'ok'};if(f<39)return {word:'Nóng',tone:'warn'};return {word:'Rất nóng',tone:'bad'};}
function levelUv(u){if(!hasNum(u))return {word:'Chưa có',tone:'none'};u=Number(u);if(u<3)return {word:'Thấp',tone:'good'};if(u<6)return {word:'Vừa',tone:'ok'};if(u<8)return {word:'Cao',tone:'warn'};return {word:'Rất cao',tone:'bad'};}
function levelRain(r){if(!hasNum(r))return {word:'Chưa có',tone:'none'};r=Number(r);if(r<30)return {word:'Ít mưa',tone:'good'};if(r<60)return {word:'Có thể mưa',tone:'ok'};return {word:'Dễ mưa',tone:'warn'};}
function levelWind(w){if(!hasNum(w))return {word:'Chưa có',tone:'none'};w=Number(w);if(w<20)return {word:'Gió nhẹ',tone:'good'};if(w<35)return {word:'Gió khá mạnh',tone:'ok'};return {word:'Gió mạnh',tone:'bad'};}
function setLvl(id,l){const n=$(id);if(!n)return;n.textContent=l.word;n.className=`lvl ${l.tone}`;}
function verdictEmoji(result){if(!result)return '◌';return result.tone==='bad'?'😟':result.tone==='caution'?(result.score>=6.5?'🙂':'😐'):'😀';}

function renderFriendlyGrid(s){
  const grid=$('friendlyGrid');if(!grid)return;
  if(!s){grid.innerHTML='';return;}
  const air=levelAir(s.aqi),heat=levelHeat(s.feels),uv=levelUv(s.uv),rain=levelRain(s.rain),wind=levelWind(s.wind);
  const rainWind=rain.tone==='warn'||wind.tone==='bad'?(rain.tone==='warn'?rain:wind):rain.tone==='ok'?rain:wind.tone==='ok'?wind:rain;
  const items=[
    {ic:'🌡️',name:'Nhiệt độ',l:heat,detail:hasNum(s.feels)?`Cảm giác ${round(s.feels)}°C · thực ${fmt(s.temp)}°C`:'—'},
    {ic:'🌫️',name:'Không khí',l:air,detail:hasNum(s.aqi)?`AQI ${round(s.aqi)} · bụi mịn ${fmt(s.pm,0)} µg/m³`:'Chưa có AQI'},
    {ic:'☀️',name:'Nắng (UV)',l:uv,detail:hasNum(s.uv)?`Chỉ số UV ${round(s.uv,1)}`:'—'},
    {ic:'🌦️',name:'Mưa & gió',l:rainWind,detail:`${hasNum(s.rain)?`Mưa ${round(s.rain)}%`:'Mưa —'} · ${hasNum(s.wind)?`gió ${round(s.wind)} km/h`:'gió —'}`}
  ];
  grid.innerHTML=items.map(i=>`<div class="cond ${i.l.tone}"><span class="cond-ic" aria-hidden="true">${i.ic}</span><div><small>${i.name}</small><b>${escapeHTML(i.l.word)}</b><em>${escapeHTML(i.detail)}</em></div></div>`).join('');
}

function renderHourStrip(data,plan){
  const box=$('hourStrip');if(!box)return;
  if(!data||isNoData(data)){box.innerHTML='<div class="hour-empty">Đang chờ dự báo theo giờ…</div>';return;}
  const today=vnIso().slice(0,10);
  const rows=upcomingHours(data,40).filter(r=>{const h=Number(r.time.slice(11,13));return h>=5&&h<=21;}).slice(0,18);
  if(!rows.length){box.innerHTML='<div class="hour-empty">Chưa có dự báo theo giờ.</div>';return;}
  const scored=rows.map(r=>({r,res:analyzeSnapshot({...data.current,...r},plan)}));
  const best=bestTimeFor(data,plan);const bestTime=best?.row.time;
  const target=targetIso(plan.time);
  let lastDay='';
  box.innerHTML=scored.map(({r,res})=>{
    const day=r.time.slice(0,10),h=Number(r.time.slice(11,13));
    const sep=day!==lastDay?`<span class="hour-day">${day===today?'Hôm nay':'Ngày mai'}</span>`:'';lastDay=day;
    const isBest=r.time===bestTime,isSel=r.time===target;
    const title=`${h}h${day===today?'':' ngày mai'}: ${res.score}/10 · cảm giác ${fmt(r.feels)}°C · AQI ${fmt(r.aqi)} · UV ${fmt(r.uv,1)}`;
    return `${sep}<button type="button" role="listitem" class="hour-bar ${res.tone}${isBest?' best':''}${isSel?' sel':''}" data-hour="${String(h).padStart(2,'0')}:00" title="${escapeHTML(title)}" aria-label="${escapeHTML(title)}"><span class="hb-fill" style="--h:${Math.max(12,res.score*10)}%"></span><b>${isBest?'★':''}${res.score.toFixed(1)}</b><small>${h}h</small></button>`;
  }).join('');
  box.querySelectorAll('[data-hour]').forEach(btn=>btn.addEventListener('click',()=>{
    $('time').value=btn.dataset.hour;savePlanSettings();analyzePlan(false);
    showToast(`Đã đổi giờ chạy sang ${btn.dataset.hour}${btn.textContent.includes('★')?' (giờ tốt nhất)':''}.`);
  }));
  // Chỉ cuộn ngang trong dải giờ — không dùng scrollIntoView vì nó kéo cả trang xuống.
  const sel=box.querySelector('.sel')||box.querySelector('.best');if(sel)box.scrollLeft=Math.max(0,sel.offsetLeft-box.offsetLeft-box.clientWidth/2+sel.offsetWidth/2);
}

function renderHeroVerdict(data){
  const node=$('heroVerdict');if(!node)return;
  if(!data||isNoData(data)){node.hidden=true;return;}
  const now={...data.current,time:vnIso()};
  const res=analyzeSnapshot(now,{...currentPlan(),time:vnIso().slice(11,16)});
  const best=bestTimeFor(data,currentPlan());
  node.hidden=false;node.className=`hero-verdict ${res.tone}`;
  node.innerHTML=`<span>${verdictEmoji(res)}</span><span><b>Ngay bây giờ: ${escapeHTML(res.title.toLowerCase())}</b>${best?`<small>Giờ tốt nhất sắp tới: ${best.row.time.slice(11,16)}${best.row.time.slice(0,10)!==vnIso().slice(0,10)?' ngày mai':''}</small>`:''}</span>`;
}

function upcomingHours(data,hours=30){
  const nowHour=vnIso().slice(0,13)+':00';
  return (data?.hourly||[]).filter(row=>row.time>=nowHour).slice(0,hours);
}
function bestTimeFor(data, plan){
  // V8: chỉ xét các giờ CHƯA trôi qua (V7 có thể gợi ý 05:00 sáng nay khi đã 10:00).
  const candidates=upcomingHours(data,30).filter(row=>{const hour=Number(row.time.slice(11,13));return (hour>=5&&hour<=9)||(hour>=16&&hour<=21);});
  if(!candidates.length) return null;
  return candidates.map(row=>({row,result:analyzeSnapshot({...data.current,...row},plan)})).sort((a,b)=>b.result.score-a.result.score||a.row.time.localeCompare(b.row.time))[0];
}

function weatherText(code){ return WEATHER_TEXT[code] || ['Thời tiết thay đổi','◌']; }
function sourceLabel(source){
  return source==='live'?'Dữ liệu trực tiếp':source==='partial'?'Dữ liệu trực tiếp một phần':source==='cached'?'Dữ liệu thật đã lưu gần đây':'Chưa có dữ liệu thật';
}
const isNoData=data=>!data||data.source==='demo';

function quickEnvironmentForWard(key = selectedKey){
  const item=ward(key);
  const cached=memoryCache.get(`ward:${item.key}`)||getStaleCache(`ward:${item.key}`);
  return cached?{...cached,source:cached.source==='live'||cached.source==='partial'?'cached':cached.source}:fallbackData(item);
}

function quickEnvironmentForGps(location){
  const near=nearestWard(location.lat,location.lon).item;
  const cacheId=location.cacheId||`gps:${Number(location.lat).toFixed(3)},${Number(location.lon).toFixed(3)}`;
  const cached=memoryCache.get(cacheId)||getStaleCache(cacheId);
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
      ? `Đã có vị trí GPS ±${round(data.location.accuracy||0)} m · đang lấy thời tiết và AQI trực tiếp.`
      : isNoData(data)?'Đang lấy thời tiết và AQI trực tiếp từ Open-Meteo…':'Đang hiển thị dữ liệu thật đã lưu gần đây trong lúc cập nhật.';
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
  const noData=isNoData(data);
  const current=noData?{}:data.current,weather=noData?[data?.failed?'Không lấy được dữ liệu':'Đang tải…','◌']:weatherText(current.code),label=data.location?.label||ward(data.key).name;
  const dash=data?.failed?'—':'…';
  $('heroArea').textContent=label;$('heroTemp').textContent=fmt(current.temp,0,dash);$('heroWeather').textContent=weather[0];$('weatherSymbol').textContent=weather[1];
  $('heroAqi').textContent=fmt(current.aqi,0,dash);$('heroPm').textContent=fmt(current.pm,1,dash);$('heroWind').textContent=fmt(current.wind,0,dash);$('heroUv').textContent=fmt(current.uv,1,dash);if($('heroFeels'))$('heroFeels').textContent=fmt(current.feels,0,dash);
  setLvl('heroAqiLvl',levelAir(current.aqi));setLvl('heroFeelsLvl',levelHeat(current.feels));setLvl('heroUvLvl',levelUv(current.uv));setLvl('heroWindLvl',levelWind(current.wind));renderHeroVerdict(data);
  $('heroUpdated').textContent=new Date(data.updated).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  $('liveBadge').textContent=noData?(data.failed?'CHƯA CÓ DỮ LIỆU THẬT':'ĐANG TẢI DỮ LIỆU THẬT'):sourceLabel(data.source).toUpperCase();
  $('liveBadge').className=`source-badge ${data.source==='live'?'':noData?(data.failed?'demo':'loading'):data.source}`;
  if(data.location?.mode==='gps'&&!noData) $('heroLocationNote').textContent=`GPS ±${round(data.location.accuracy||0)} m · dữ liệu được lấy theo tọa độ hiện tại của thiết bị.`;
  else if(noData) $('heroLocationNote').textContent=data.failed?'Không kết nối được Open-Meteo. AIRUN không hiển thị số mô phỏng để tránh hiểu nhầm; bấm “Kiểm tra kết nối ngay” để thử lại.':'AIRUN đang lấy thời tiết và AQI trực tiếp; số liệu sẽ hiện sau 1–3 giây.';
  else if(data.source==='cached') $('heroLocationNote').textContent='Đang dùng dữ liệu thật đã lưu gần đây trong lúc chờ cập nhật mới.';
  else if(data.source==='partial') $('heroLocationNote').textContent=`Mới nhận được ${data.liveParts?.weather?'thời tiết':'chất lượng không khí'}; phần còn lại đang được thử lại.`;
  else $('heroLocationNote').textContent='Đang dùng tọa độ đại diện của khu vực. Bấm “Dùng vị trí hiện tại” để chính xác hơn.';
}

function renderResult(data,snapshot,result){
  const label=data.location?.label||ward(data.key).name;
  const estimate=updatePlanEstimate();
  const metricIds=['metricAqi','metricPm','metricTemp','metricWind','metricRain','metricUv'];
  if(isNoData(data)){
    const failed=Boolean(data.failed);
    activeResult=null;activeSnapshot=null;
    $('resultSource').textContent=failed?`Chưa có dữ liệu thật · ${label}`:`Đang lấy dữ liệu thật · ${label}`;
    $('resultStatusPill').textContent=failed?'Chưa chấm điểm':'Đang tải';$('resultStatusPill').className='result-pill neutral';
    $('decisionPanel').className='decision-panel neutral';$('decisionIcon').textContent='◌';
    $('decisionTitle').textContent=failed?'Chưa thể đánh giá':'Đang đọc dữ liệu thật';
    $('decisionText').textContent=failed?'Open-Meteo chưa phản hồi. AIRUN không chấm điểm bằng số liệu mô phỏng; hãy thử “Cập nhật dữ liệu” sau ít phút.':'AIRUN chỉ chấm điểm khi có thời tiết và AQI trực tiếp.';
    $('scoreValue').textContent='—';$('scoreRing').style.setProperty('--score','0%');
    metricIds.forEach(id=>{const n=$(id);if(n)n.textContent=failed?'—':'…';});
    $('metricAqiLabel').textContent='Chưa có';$('metricFeels').textContent='Cảm giác —';$('metricHumidity').textContent='Độ ẩm —';$('metricUvLabel').textContent='Chưa có';
    if($('planSummarySource'))$('planSummarySource').textContent=failed?'Chưa có':'Đang tải';
    if($('planSummaryForecast'))$('planSummaryForecast').textContent=failed?'Open-Meteo chưa phản hồi':'Đang đồng bộ forecast…';
    $('reasonList').innerHTML=`<li>${failed?'Không có dữ liệu thật để giải thích.':'Đang chờ dữ liệu trực tiếp…'}</li>`;
    $('bestTime').textContent=failed?'Chưa có dự báo giờ':'Đang tính…';$('bestTimeReason').textContent='AIRUN so sánh các giờ chạy phổ biến trong dự báo trực tiếp.';
    $('mapAreaAqi').textContent='AQI —';$('mapAreaTemp').textContent='—°C';$('mapAreaScore').textContent='—/10';
    renderKit({},currentPlan());renderFriendlyGrid(null);renderHourStrip(null);if(typeof renderHomeSummary==='function')renderHomeSummary(data,null,null);
    if(typeof renderCoachWaiting==='function')renderCoachWaiting(failed);
    return;
  }
  const info=hasNum(snapshot.aqi)?aqiInfo(snapshot.aqi):{label:'Chưa có'},uv=hasNum(snapshot.uv)?uvInfo(snapshot.uv):{label:'Chưa có'},best=bestTimeFor(data,currentPlan());
  const missing=[];if(!hasNum(snapshot.aqi))missing.push('AQI');if(!hasNum(snapshot.feels))missing.push('nhiệt độ');
  $('resultSource').textContent=`${sourceLabel(data.source)} · ${label} · ${snapshot.time?.slice(11,16)||'hiện tại'}${missing.length?` · thiếu ${missing.join(', ')}`:''}`;
  $('resultStatusPill').textContent=result.title;$('resultStatusPill').className=`result-pill ${result.tone}`;
  $('decisionPanel').className=`decision-panel ${result.tone}`;$('decisionIcon').textContent=verdictEmoji(result);$('decisionTitle').textContent=result.title;$('decisionText').textContent=result.text;
  renderFriendlyGrid(snapshot);renderHourStrip(data,currentPlan());
  if(typeof renderHomeSummary==='function')renderHomeSummary(data,snapshot,result);
  if($('decisionWhen')){const t=snapshot.time||'';$('decisionWhen').textContent=`NẾU CHẠY LÚC ${t.slice(11,16)||currentPlan().time}${t&&t.slice(0,10)!==vnIso().slice(0,10)?' NGÀY MAI':' HÔM NAY'}`;}
  $('scoreValue').textContent=result.score;$('scoreRing').style.setProperty('--score',`${result.score*10}%`);
  $('metricAqi').textContent=fmt(snapshot.aqi);$('metricAqiLabel').textContent=info.label;$('metricPm').textContent=fmt(snapshot.pm,1);
  $('metricTemp').textContent=hasNum(snapshot.temp)?`${round(snapshot.temp)}°`:'—';$('metricFeels').textContent=`Cảm giác ${hasNum(snapshot.feels)?round(snapshot.feels)+'°':'—'}`;$('metricWind').textContent=fmt(snapshot.wind,1);
  $('metricRain').textContent=hasNum(snapshot.rain)?`${round(snapshot.rain)}%`:'—';$('metricHumidity').textContent=`Độ ẩm ${hasNum(snapshot.humidity)?round(snapshot.humidity)+'%':'—'}`;
  $('metricUv').textContent=fmt(snapshot.uv,1);$('metricUvLabel').textContent=uv.label;
  if($('planSummarySource'))$('planSummarySource').textContent=sourceLabel(data.source);
  if($('planSummaryForecast')){
    const fs=data.forecastSource||data.source;
    $('planSummaryForecast').textContent=fs==='live'?'Forecast trực tiếp đã sẵn sàng':fs==='partial'?'Forecast trực tiếp một phần':fs==='cached'?'Forecast đã lưu gần đây':'Chưa có forecast';
  }
  $('reasonList').innerHTML=result.reasons.map(reason=>`<li>${escapeHTML(reason)}</li>`).join('');
  if(best){$('bestTime').textContent=`Tốt nhất: ${best.row.time.slice(11,16)}${best.row.time.slice(0,10)!==vnIso().slice(0,10)?' ngày mai':''} (${best.result.score}/10)`;$('bestTimeReason').textContent='Cột càng cao càng dễ chạy. Bấm vào một cột để đổi giờ chạy.';}
  else{$('bestTime').textContent='Chưa có dự báo giờ';$('bestTimeReason').textContent='Hãy thử cập nhật lại dữ liệu.';}
  $('mapAreaAqi').textContent=`AQI ${fmt(snapshot.aqi)}`;$('mapAreaTemp').textContent=`${fmt(snapshot.temp)}°C`;$('mapAreaScore').textContent=`${result.score}/10`;
  renderKit(snapshot,currentPlan());
  if(typeof scheduleCoach==='function')scheduleCoach();
}

function renderKit(snapshot,plan){
  const items=['Giày chạy và trang phục thoáng','Điện thoại đủ pin hoặc thẻ liên hệ khẩn cấp'];
  const feels=Number(snapshot.feels??0),rain=Number(snapshot.rain??0),uv=Number(snapshot.uv??0),aqi=Number(snapshot.aqi??0);
  const water=Math.max(250,Math.round((plan.duration*(feels>31?10:7))/50)*50); items.push(`Khoảng ${water} ml nước cho kế hoạch ${plan.duration} phút`);
  if(rain>=40) items.push('Áo mưa mỏng hoặc phương án chạy trong nhà');
  if(feels>=31||uv>=6) items.push('Mũ và kem chống nắng; ưu tiên bóng râm nếu chạy ban ngày');
  if(aqi>100) items.push('Ưu tiên đổi giờ; tránh chạy cường độ cao khi chất lượng không khí kém');
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

function renderAreaMap(lat,lon,label){
  if(!SERVER_CFG.loaded)return; // chờ cấu hình máy chủ để biết dùng Google Maps hay OpenFreeMap
  if(useGoogleMaps()){if(gmaps.route.map||mapsAllowed())void gRouteArea(lat,lon).catch(error=>console.warn('AIRUN Google route map:',error));return;}
  const fallback=$('mapFallback');if(fallback)fallback.hidden=true;
  const frame=$('areaMapFrame');if(frame){frame.style.visibility='hidden';frame.removeAttribute('src');}
  void ensureRouteMapLibre().then(map=>{if(!map)return;map.resize();map.easeTo({center:[Number(lon),Number(lat)],zoom:14.2,duration:450});}).catch(error=>{
    console.warn('AIRUN OpenFreeMap area:',error);
    if(fallback){fallback.hidden=false;const p=fallback.querySelector('p');if(p)p.textContent='Không tải được Mapbox/OpenFreeMap. Kiểm tra mạng hoặc kết nối lại Mapbox.';}
  });
}
function updateMapSide(){
  const item=ward();
  $('mapAreaName').textContent=gpsLocation?`${item.name} · GPS`:item.name;
  $('mapAreaDescription').textContent=gpsLocation?'Đang phân tích theo tọa độ GPS chính xác của thiết bị; khu vực này chỉ là tên gần nhất.':item.desc;
  const lat=gpsLocation?.lat??item.lat,lon=gpsLocation?.lon??item.lon;
  $('openOsm').href=`https://www.google.com/maps?q=${lat},${lon}`;
  document.querySelectorAll('[data-ward]').forEach(button=>button.classList.toggle('active',button.dataset.ward===selectedKey));
  renderAreaMap(lat,lon,gpsLocation?.label||item.name);
  if(typeof syncRouteOrigin==='function')syncRouteOrigin();
}

async function selectWard(key,{scroll=false,force=false,analyze=true}={}){
  gpsLocation=null;setGpsPlanUi();{const prevKey=selectedKey;selectedKey=ward(key).key;if(prevKey!==selectedKey&&routePlanner.customStart){routePlanner.customStart=null;const r=$('originResetBtn');if(r)r.hidden=true;}}$('area').value=selectedKey;savePlanSettings();updateMapSide();
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

function loadLeaflet(){return Promise.resolve();}
function initMaps(){
  updateMapSide();
  const fallback=$('mapFallback');if(fallback)fallback.hidden=true;
  resetRunMap();
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

  const fast=geoPosition({enableHighAccuracy:false,timeout:8000,maximumAge},9000).then(position=>{position.__airunFix='fast';return position;});
  const precise=geoPosition({enableHighAccuracy:true,timeout:20000,maximumAge:0},21000).then(position=>{position.__airunFix='precise';return position;});
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
    const precise=await geoPosition({enableHighAccuracy:true,timeout:20000,maximumAge:0},21000);
    const oldAcc=Number(previous?.coords?.accuracy ?? Infinity);
    const newAcc=Number(precise?.coords?.accuracy ?? Infinity);
    return newAcc < oldAcc ? precise : null;
  }catch{return null;}
}

function gpsHelpMessage(error){
  const code=error?.code;
  // Trình duyệt trong Zalo/Facebook/Messenger thường chặn GPS.
  if(/Zalo|FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\//i.test(navigator.userAgent||''))return 'Bạn đang mở AIRUN trong trình duyệt của Zalo/Facebook nên GPS bị chặn. Hãy bấm ⋯ → “Mở bằng trình duyệt” (Chrome/Safari) rồi thử lại.';
  if(code===1 || code==='denied') return 'Quyền vị trí đang bị chặn. Bấm biểu tượng ổ khóa cạnh địa chỉ trang → Quyền → Vị trí → Cho phép, rồi tải lại trang.';
  if(code==='insecure') return 'GPS web chỉ hoạt động trên HTTPS. Hãy mở AIRUN bằng địa chỉ https://…onrender.com.';
  if(code==='unsupported') return 'Trình duyệt/thiết bị này không cung cấp Geolocation.';
  if(code===2) return 'Thiết bị chưa xác định được vị trí. Hãy bật Location Services của máy và thử ngoài trời hoặc gần cửa sổ.';
  if(code===3) return 'Thiết bị chưa trả về vị trí sau 20 giây. Hãy bật Vị trí (Location) của điện thoại, ra chỗ thoáng rồi thử lại. Máy tính bàn thường không có GPS — nên dùng điện thoại.';
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
      if(tracker.status==='idle'){
        const preview={lat:latitude,lon:longitude,accuracy:Number(accuracy||999),timestamp:Date.now()};
        tracker.rawPoint=preview;tracker.rawPoints=[{...preview,_seenAt:Date.now()}];tracker.mapBounds=runMapBoundsAround(latitude,longitude);tracker.mapSrc='';setRunBasemap(tracker.mapBounds,true);renderRunRoute();
        setRunMapHint(`Vị trí GPS đã sẵn sàng ±${round(accuracy)} m · bấm “Bắt đầu chạy” để ghi quãng đường.`,true);
      }
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


// V8: cấu hình dịch vụ do MÁY CHỦ cung cấp qua /api/config. Không còn nhập/lưu key trong trình duyệt.
const SERVER_CFG={loaded:false,server:false,ai:false,routing:false,mapboxToken:'',googleMapsKey:'',googlePlaces:false,routePlan:false,accounts:false,feedback:false,version:null};
async function loadServerConfig(){
  try{
    const response=await fetch('/api/config',{cache:'no-store',headers:{Accept:'application/json'}});
    const data=await response.json();
    Object.assign(SERVER_CFG,{loaded:true,server:Boolean(data.server),ai:Boolean(data.ai),routing:Boolean(data.routing),mapboxToken:String(data.mapboxToken||''),feedback:Boolean(data.feedback),version:data.version||null,aiModel:data.aiModel||null,googleMapsKey:String(data.googleMapsKey||''),googlePlaces:Boolean(data.googlePlaces),routePlan:Boolean(data.routePlan),accounts:Boolean(data.accounts)});
  }catch{Object.assign(SERVER_CFG,{loaded:true,server:false});}
  // Xóa khóa cũ mà V7 từng lưu trong trình duyệt.
  try{localStorage.removeItem(ROUTE_CONFIG_KEYS.graphhopper);localStorage.removeItem(ROUTE_CONFIG_KEYS.mapbox);}catch{}
  syncRouteProviderStatus();
  if(typeof syncCoachAvailability==='function')syncCoachAvailability();
  if(typeof onServerConfigReady==='function')onServerConfigReady();
  return SERVER_CFG;
}
function routeConfig(){
  return {mapbox:SERVER_CFG.mapboxToken.startsWith('pk.')?SERVER_CFG.mapboxToken:'',graphhopper:SERVER_CFG.routing||SERVER_CFG.googlePlaces};
}
function syncRouteProviderStatus(message=''){
  if(!hasDom())return;const node=$('routeProviderStatus'),cfg=routeConfig();if(!node)return;
  if(message){node.textContent=message;return;}
  if(!SERVER_CFG.loaded){node.textContent='Đang kiểm tra dịch vụ tạo cung chạy trên máy chủ…';node.className='route-provider-status';return;}
  const mapName=useGoogleMaps()?'Google Maps':cfg.mapbox?'Mapbox':'OpenFreeMap';
  if(cfg.graphhopper){node.textContent=`✓ Cung chạy theo đường đi bộ thật (${SERVER_CFG.routing?'GraphHopper':'Google Routes'}) · bản đồ ${mapName} · khoá API giữ trên máy chủ.`;node.className='route-provider-status ready';}
  else{node.textContent=`Cung chạy ghép theo đường đi bộ OpenStreetMap (Valhalla) · bản đồ ${mapName}.`;node.className='route-provider-status';}
}
// V8.1: dùng chung một promise cho mỗi file. V7 để 2 bản đồ cùng tải MapLibre → bên sau xóa thẻ của bên trước → một bản đồ treo mãi.
const externalAssetLoads=new Map();
function loadExternalAsset(type,url,id){
  const key=`${id}|${url}`;
  if(externalAssetLoads.has(key))return externalAssetLoads.get(key);
  const existing=document.getElementById(id);
  if(existing&&existing.dataset.airunLoaded==='1'&&(existing.src===url||existing.href===url))return Promise.resolve();
  const promise=new Promise((resolve,reject)=>{
    const old=document.getElementById(id);if(old&&old.dataset.airunLoaded!=='1')old.remove();
    const el=document.createElement(type==='script'?'script':'link');el.id=id;
    if(type==='script'){el.src=url;el.async=true;}else{el.rel='stylesheet';el.href=url;}
    const timer=setTimeout(()=>{el.remove();reject(new Error(`Tải quá lâu: ${url}`));},20000);
    el.onload=()=>{clearTimeout(timer);el.dataset.airunLoaded='1';resolve();};
    el.onerror=()=>{clearTimeout(timer);el.remove();reject(new Error(`Không tải được ${url}`));};
    document.head.appendChild(el);
  });
  externalAssetLoads.set(key,promise);
  promise.catch(()=>externalAssetLoads.delete(key));
  return promise;
}
let mapLibreAssetsPromise=null;
/* ===== V9.3 · Bản đồ Sáng/Tối (OpenFreeMap, miễn phí, không cần khoá) ===== */
const MAP_STYLES={light:'https://tiles.openfreemap.org/styles/positron',dark:'https://tiles.openfreemap.org/styles/dark',classic:'https://tiles.openfreemap.org/styles/liberty'};
const MAP_THEME_KEY='airun-v93-map-theme';
let mapTheme=(()=>{const saved=localGet(MAP_THEME_KEY,null);if(saved==='light'||saved==='dark')return saved;const h=Number(vnIso().slice(11,13));return h>=18||h<6?'dark':'light';})();
const mapStyleCheck={};
// Kiểm tra kiểu bản đồ tải được không; nếu không, quay về kiểu "liberty" quen thuộc.
async function mapStyleUrl(theme=mapTheme){
  const url=MAP_STYLES[theme]||MAP_STYLES.classic;
  if(!(theme in mapStyleCheck))mapStyleCheck[theme]=(async()=>{try{const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);const r=await fetch(url,{signal:c.signal});clearTimeout(t);return r.ok;}catch{return false;}})();
  return (await mapStyleCheck[theme])?url:MAP_STYLES.classic;
}
function mapPalette(theme=mapTheme){
  return theme==='dark'
    ?{casing:'#08130f',main:'#c8f16b',core:'#f2ffd2',plan:'#8fbcff',raw:'#9fd3c4',actualCase:'#08130f',actual:'#c8f16b'}
    :{casing:'#ffffff',main:'#08745a',core:'#c8f16b',plan:'#2d72d9',raw:'#5b9988',actualCase:'#ffffff',actual:'#08745a'};
}
function syncMapThemeButtons(){
  if(!hasDom())return;
  document.body.classList.toggle('map-dark',mapTheme==='dark');
  document.querySelectorAll('[data-map-theme]').forEach(btn=>{
    const dark=mapTheme==='dark';btn.setAttribute('aria-pressed',String(dark));
    btn.title=dark?'Đang dùng bản đồ tối · chạm để chuyển sang sáng':'Đang dùng bản đồ sáng · chạm để chuyển sang tối';
    const use=btn.querySelector('use');if(use)use.setAttribute('href',dark?'#i-sun':'#w-moon');
    const label=btn.querySelector('span');if(label)label.textContent=dark?'Sáng':'Tối';
  });
}
async function setMapTheme(theme,{silent=false,remember=true}={}){
  mapTheme=theme==='dark'?'dark':'light';if(remember)localSet(MAP_THEME_KEY,mapTheme);syncMapThemeButtons();
  const url=await mapStyleUrl();
  for(const [map,kind] of [[routeFallbackMap.map,'route'],[runFallbackMap.map,'run']]){
    if(!map)continue;
    map.__airunStyleReady=false;
    map.once('style.load',()=>{
      map.__airunStyleReady=true;
      try{
        if(kind==='route'){if(routePlanner.current)void renderMapLibreRoute(routePlanner.current);}
        else{runSetSource(map,'airun-run-plan-src',[]);runSetSource(map,'airun-run-raw-src',[]);runSetSource(map,'airun-run-actual-src',[]);runAddLayers(map);void refreshRunMapLibre();}
      }catch(error){console.warn('AIRUN map theme:',error);}
    });
    // diff:false để MapLibre dựng lại toàn bộ style và bắn 'style.load' (chế độ diff sẽ âm thầm xoá lớp đường chạy).
    try{map.setStyle(url,{diff:false});}catch(error){console.warn('AIRUN setStyle:',error);map.__airunStyleReady=true;}
  }
  if(!silent)showToast(mapTheme==='dark'?'Đã chuyển sang bản đồ tối.':'Đã chuyển sang bản đồ sáng.');
}
if(hasDom())document.addEventListener('click',event=>{const btn=event.target.closest?.('[data-map-theme]');if(btn){event.preventDefault();const next=mapTheme==='dark'?'light':'dark';if(document.body.classList.contains('run-mode')){localSet('airun-v95-run-theme',next);void setMapTheme(next,{remember:false});}else void setMapTheme(next);}});

function ensureMapLibreAssets(){
  if(window.maplibregl)return Promise.resolve(true);
  if(mapLibreAssetsPromise)return mapLibreAssetsPromise;
  mapLibreAssetsPromise=(async()=>{
    const cssSources=['https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.css','https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css'];
    const jsSources=['https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js','https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js'];
    let cssOk=false;for(const url of cssSources){try{await loadExternalAsset('style',url,'airun-maplibre-css');cssOk=true;break;}catch{}}
    let jsOk=false;for(const url of jsSources){try{await loadExternalAsset('script',url,'airun-maplibre-js');if(window.maplibregl){jsOk=true;break;}}catch{}}
    if(!jsOk||!window.maplibregl)throw new Error('Không tải được MapLibre từ các CDN dự phòng');
    if(!cssOk)console.warn('AIRUN: MapLibre CSS chưa tải được, bản đồ vẫn chạy.');
    return true;
  })();
  mapLibreAssetsPromise.catch(()=>{mapLibreAssetsPromise=null;});
  return mapLibreAssetsPromise;
}
async function ensureMapbox(){
  const cfg=routeConfig();if(!cfg.mapbox)throw new Error('Chưa có Mapbox token');if(advancedMap.map)return advancedMap.map;if(advancedMap.loading)return advancedMap.loading;
  advancedMap.loading=(async()=>{
    await loadExternalAsset('style','https://api.mapbox.com/mapbox-gl-js/v3.30.0/mapbox-gl.css','airun-mapbox-css');
    await loadExternalAsset('script','https://api.mapbox.com/mapbox-gl-js/v3.30.0/mapbox-gl.js','airun-mapbox-js');
    if(!window.mapboxgl)throw new Error('Mapbox GL JS chưa sẵn sàng');
    mapboxgl.accessToken=cfg.mapbox;const origin=routeOrigin();const container=$('mapboxRouteMap');container.hidden=false;const free=$('routeMapLibreMap');if(free)free.hidden=true;container.closest('.map-wrap')?.classList.remove('openfree-active');
    const fallback=$('areaMapFrame');if(fallback){fallback.style.visibility='hidden';fallback.removeAttribute('src');}const svg=$('suggestedRouteSvg');if(svg)svg.style.display='none';
    advancedMap.map=new mapboxgl.Map({container:'mapboxRouteMap',style:'mapbox://styles/mapbox/outdoors-v12',center:[origin.lon,origin.lat],zoom:14,attributionControl:true});
    advancedMap.map.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right');
    await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('Mapbox tải quá lâu')),10000);advancedMap.map.once('load',()=>{clearTimeout(t);resolve();});advancedMap.map.once('error',e=>{if(!advancedMap.loaded){clearTimeout(t);reject(e?.error||new Error('Mapbox lỗi'));}});});
    advancedMap.loaded=true;return advancedMap.map;
  })().finally(()=>{advancedMap.loading=null;});
  return advancedMap.loading;
}
function clearMapboxMarkers(){
  if(advancedMap.startMarker){advancedMap.startMarker.remove();advancedMap.startMarker=null;}
  advancedMap.kmMarkers.forEach(m=>m.remove());advancedMap.kmMarkers=[];
}
async function renderMapboxRoute(route){
  const cfg=routeConfig();if(!cfg.mapbox||!route?.points?.length)return false;
  try{
    const map=await ensureMapbox(),coords=route.points.map(p=>[p.lon,p.lat]),geo={type:'Feature',properties:{},geometry:{type:'LineString',coordinates:coords}};
    const update=()=>{
      if(map.getSource('airun-route'))map.getSource('airun-route').setData(geo);else{
        map.addSource('airun-route',{type:'geojson',data:geo});
        map.addLayer({id:'airun-route-casing',type:'line',source:'airun-route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#ffffff','line-width':['interpolate',['linear'],['zoom'],11,5.5,16,8.5],'line-opacity':.96}});
        map.addLayer({id:'airun-route-main',type:'line',source:'airun-route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#08745a','line-width':['interpolate',['linear'],['zoom'],11,3.2,16,6]}});
        map.addLayer({id:'airun-route-core',type:'line',source:'airun-route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#c8f16b','line-width':['interpolate',['linear'],['zoom'],11,1,16,2.2],'line-opacity':.92}});
      }
      clearMapboxMarkers();const first=route.points[0],el=document.createElement('div');el.className='airun-start-marker';el.innerHTML='<i></i><span>Bắt đầu / Kết thúc</span>';advancedMap.startMarker=new mapboxgl.Marker({element:el,anchor:'left'}).setLngLat([first.lon,first.lat]).addTo(map);
      const kmMarks=routeDistanceMarkers(route.points,1).filter(m=>m.km<Math.max(1,Math.ceil(route.distanceKm)));
      for(const m of kmMarks){const k=document.createElement('div');k.className='airun-km-marker';k.textContent=String(m.km);advancedMap.kmMarkers.push(new mapboxgl.Marker({element:k}).setLngLat([m.lon,m.lat]).addTo(map));}
      const bounds=new mapboxgl.LngLatBounds();coords.forEach(c=>bounds.extend(c));map.fitBounds(bounds,{padding:{top:70,bottom:80,left:70,right:70},duration:850,maxZoom:16});
      setTimeout(()=>map.resize(),80);
    };
    if(map.loaded())update();else map.once('load',update);advancedMap.routeReady=true;return true;
  }catch(error){console.warn('AIRUN Mapbox render:',error);const container=$('mapboxRouteMap');if(container)container.hidden=true;const fallback=$('areaMapFrame');if(fallback){fallback.style.visibility='hidden';fallback.removeAttribute('src');}const svg=$('suggestedRouteSvg');if(svg)svg.style.display='';syncRouteProviderStatus(`Mapbox lỗi · đang chuyển sang OpenFreeMap (${apiErrorLabel(error)})`);return false;}
}

function clearRouteMapLibreMarkers(){
  if(routeFallbackMap.startMarker){routeFallbackMap.startMarker.remove();routeFallbackMap.startMarker=null;}
  routeFallbackMap.kmMarkers.forEach(m=>m.remove());routeFallbackMap.kmMarkers=[];
}
// V8.1: không coi "tải chậm" là lỗi. Mạng di động hoặc tab bị ẩn có thể làm bản đồ load chậm;
// V7 hủy bản đồ sau 12 giây nên người dùng không bao giờ thấy bản đồ. Chỉ lỗi style mới là lỗi thật.
function waitMapLoad(map,kind){
  return new Promise((resolve,reject)=>{
    if(map.loaded()){resolve();return;}
    const slow=setTimeout(()=>{
      const text='Bản đồ đang tải chậm… GPS và quãng đường vẫn hoạt động bình thường.';
      if(kind==='run'){const p=$('runMapProvider');if(p)p.textContent='OpenFreeMap · đang tải chậm';setRunMapHint(text,true);}
      else{const b=$('routeMapBadge');if(b)b.textContent='Bản đồ đang tải…';}
    },15000);
    map.once('load',()=>{clearTimeout(slow);resolve();});
    const onError=e=>{
      if(map.loaded())return;
      if(e&&(e.sourceId||e.tile))return; // lỗi 1 ô bản đồ không làm hỏng cả bản đồ
      clearTimeout(slow);map.off?.('error',onError);reject(e?.error||new Error('Không tải được kiểu bản đồ OpenFreeMap'));
    };
    map.on('error',onError);
  });
}
async function ensureRouteMapLibre(){
  if(routeFallbackMap.map){requestAnimationFrame(()=>routeFallbackMap.map.resize());return routeFallbackMap.map;}
  if(routeFallbackMap.loading)return routeFallbackMap.loading;
  routeFallbackMap.loading=(async()=>{
    await ensureMapLibreAssets();
    const container=$('routeMapLibreMap'),wrap=container?.closest('.map-wrap'),iframe=$('areaMapFrame'),mapbox=$('mapboxRouteMap');
    if(!container)throw new Error('Thiếu vùng bản đồ OpenFreeMap');
    container.hidden=false;if(mapbox)mapbox.hidden=true;if(iframe){iframe.style.visibility='hidden';iframe.removeAttribute('src');}
    wrap?.classList.add('openfree-active');
    const origin=routeOrigin();
    const map=new maplibregl.Map({container:'routeMapLibreMap',style:await mapStyleUrl(),center:[origin.lon,origin.lat],zoom:14.2,attributionControl:true});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');routeFallbackMap.map=map;attachMapLibrePick(map);
    await waitMapLoad(map,'route');map.__airunStyleReady=true;syncMapThemeButtons();
    requestAnimationFrame(()=>{map.resize();setTimeout(()=>map.resize(),180);});return map;
  })().catch(error=>{console.warn('AIRUN route OpenFreeMap:',error);routeFallbackMap.map=null;const c=$('routeMapLibreMap'),fallback=$('mapFallback');if(c)c.hidden=true;if(fallback){fallback.hidden=false;const p=fallback.querySelector('p');if(p)p.textContent='Không tải được OpenFreeMap. Nếu có Mapbox token, hãy kết nối lại bản đồ nâng cao.';}return null;}).finally(()=>{routeFallbackMap.loading=null;});
  return routeFallbackMap.loading;
}
async function renderMapLibreRoute(route){
  if(!route?.points?.length)return false;const map=await ensureRouteMapLibre();if(!map)return false;
  const coords=route.points.map(p=>[p.lon,p.lat]),geo={type:'Feature',properties:{},geometry:{type:'LineString',coordinates:coords}};
  const update=()=>{
    if(map.getSource('airun-route-free'))map.getSource('airun-route-free').setData(geo);else{
      map.addSource('airun-route-free',{type:'geojson',data:geo});
      map.addLayer({id:'airun-route-free-casing',type:'line',source:'airun-route-free',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':mapPalette().casing,'line-width':['interpolate',['linear'],['zoom'],11,5.2,16,8.2],'line-opacity':.96}});
      map.addLayer({id:'airun-route-free-main',type:'line',source:'airun-route-free',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':mapPalette().main,'line-width':['interpolate',['linear'],['zoom'],11,3.0,16,5.6]}});
      map.addLayer({id:'airun-route-free-core',type:'line',source:'airun-route-free',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':mapPalette().core,'line-width':['interpolate',['linear'],['zoom'],11,.9,16,2.0],'line-opacity':.9}});
    }
    clearRouteMapLibreMarkers();const first=route.points[0],el=document.createElement('div');el.className='airun-start-marker';el.innerHTML='<i></i><span>Bắt đầu / Kết thúc</span>';routeFallbackMap.startMarker=new maplibregl.Marker({element:el,anchor:'left'}).setLngLat([first.lon,first.lat]).addTo(map);
    const kmMarks=routeDistanceMarkers(route.points,1).filter(m=>m.km<Math.max(1,Math.ceil(route.distanceKm)));for(const m of kmMarks){const k=document.createElement('div');k.className='airun-km-marker';k.textContent=String(m.km);routeFallbackMap.kmMarkers.push(new maplibregl.Marker({element:k}).setLngLat([m.lon,m.lat]).addTo(map));}
    const bounds=new maplibregl.LngLatBounds();coords.forEach(c=>bounds.extend(c));map.fitBounds(bounds,{padding:{top:70,bottom:80,left:70,right:70},duration:700,maxZoom:16});setTimeout(()=>map.resize(),100);
  };
  if(map.__airunStyleReady!==false&&(map.__airunStyleReady||map.loaded()))update();else map.once('style.load',()=>{map.__airunStyleReady=true;update();});routeFallbackMap.routeReady=true;const badge=$('routeMapBadge');if(badge)badge.textContent='OpenFreeMap · cung chạy';return true;
}

async function fetchGraphHopperRoundTrip(origin,targetKm,seed=0){
  if(!routeConfig().graphhopper)throw new Error('Máy chủ chưa cấu hình GraphHopper');
  const qs=new URLSearchParams({lat:String(Number(origin.lat).toFixed(5)),lon:String(Number(origin.lon).toFixed(5)),km:String(Math.max(.8,targetKm).toFixed(2)),seed:String(seed)});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    const res=await fetch(`/api/route?${qs}`,{cache:'no-store',signal:controller.signal});const data=await res.json();
    if(!res.ok||data.error||!Array.isArray(data.points))throw new Error(data?.reason||`Route HTTP ${res.status}`);
    return {points:data.points,distanceKm:Number(data.distanceKm),durationMs:data.durationMs||null,source:data.source||'graphhopper',seed,roads:data.roads||null,steps:data.steps||null};
  }finally{clearTimeout(timer);}
}
function decodePolyline5(str){
  let index=0,lat=0,lon=0;const coords=[],factor=1e5;while(index<str.length){let result=0,shift=0,b;do{b=str.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20&&index<str.length);lat+=(result&1)?~(result>>1):(result>>1);result=0;shift=0;do{b=str.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20&&index<str.length);lon+=(result&1)?~(result>>1):(result>>1);coords.push({lat:lat/factor,lon:lon/factor});}return coords;
}

function syncRoutePlanCard(estimate=planEstimate(currentPlan())){
  if(routePlanner.usePlan||!Number.isFinite(routePlanner.targetKm))routePlanner.targetKm=clamp(Number(estimate.distance)||3,1,30);
  const value=$('routeTargetValue'),hint=$('routeTargetHint');
  if(value)value.textContent=routePlanner.targetKm.toFixed(routePlanner.targetKm<10?2:1);
  if(hint)hint.textContent=routePlanner.usePlan?`Theo kế hoạch ${currentPlan().duration} phút · pace ${formatPace(estimate.pace)}/km.`:'Bạn đã chọn nhanh số km riêng cho cung chạy.';
  document.querySelectorAll('[data-route-km]').forEach(btn=>btn.classList.toggle('active',!routePlanner.usePlan&&Math.abs(Number(btn.dataset.routeKm)-routePlanner.targetKm)<.05));
  const usePlan=$('routeUsePlan');if(usePlan)usePlan.classList.toggle('active',routePlanner.usePlan);
  const gen=$('generateRouteBtn');if(gen&&!routePlanner.busy)gen.textContent=`⌁ Tạo cung khoảng ${routePlanner.targetKm.toFixed(routePlanner.targetKm<10?1:0)} km`;
}
function routeOrigin(){
  if(routePlanner.customStart)return {...routePlanner.customStart};
  if(gpsLocation)return {lat:gpsLocation.lat,lon:gpsLocation.lon,label:gpsLocation.label||'Vị trí GPS',accuracy:gpsLocation.accuracy,mode:'gps'};
  const item=ward();return {lat:item.lat,lon:item.lon,label:item.name,accuracy:null,mode:'ward'};
}
function syncRouteOrigin(){
  const origin=routeOrigin();
  if($('routeOriginName'))$('routeOriginName').textContent=origin.label;
  if($('routeOriginNote'))$('routeOriginNote').textContent=origin.mode==='place'?'Địa điểm bạn chọn · cung chạy xuất phát và quay về đây.':origin.mode==='pick'?'Điểm bạn chạm trên bản đồ · cung chạy xuất phát từ đây.':origin.mode==='gps'?`GPS ±${round(origin.accuracy||0)} m · sẽ dùng làm điểm xuất phát.`:'Đang dùng tâm khu vực đại diện. Bấm “Dùng vị trí của tôi” để chính xác hơn.';
}
function setRouteStatus(text,tone=''){
  const node=$('routeStatusText');if(!node)return;node.textContent=text;node.className=`route-status ${tone}`.trim();
}
function routeBounds(points){
  if(!points?.length){const o=routeOrigin();return runMapBoundsAround(o.lat,o.lon);}
  const lats=points.map(p=>p.lat),lons=points.map(p=>p.lon);let minLat=Math.min(...lats),maxLat=Math.max(...lats),minLon=Math.min(...lons),maxLon=Math.max(...lons);
  const centerLat=(minLat+maxLat)/2,cos=Math.max(.35,Math.cos(centerLat*Math.PI/180));
  const minLatSpan=.010,minLonSpan=.012/cos;let latSpan=Math.max(maxLat-minLat,minLatSpan),lonSpan=Math.max(maxLon-minLon,minLonSpan);latSpan*=1.3;lonSpan*=1.3;
  const cLat=(minLat+maxLat)/2,cLon=(minLon+maxLon)/2;return {left:cLon-lonSpan/2,right:cLon+lonSpan/2,bottom:cLat-latSpan/2,top:cLat+latSpan/2};
}
function projectRoute(points,bounds,w=700,h=500){
  // OpenStreetMap uses Web Mercator. Projecting latitude the same way keeps
  // the SVG route aligned much more closely with the embedded OSM basemap.
  const mercY=lat=>Math.log(Math.tan(Math.PI/4+(clamp(lat,-85,85)*Math.PI/180)/2));
  const topY=mercY(bounds.top),bottomY=mercY(bounds.bottom),spanY=Math.max(1e-9,topY-bottomY);
  const x=lon=>((lon-bounds.left)/(bounds.right-bounds.left))*w;
  const y=lat=>((topY-mercY(lat))/spanY)*h;
  return {x,y,path:points.map((p,i)=>`${i?'L':'M'} ${x(p.lon).toFixed(1)} ${y(p.lat).toFixed(1)}`).join(' ')};
}
function routeDistanceMarkers(points,stepKm=1){
  if(!points?.length||points.length<2)return [];
  const markers=[];let travelled=0,next=stepKm;
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],seg=haversine(a.lat,a.lon,b.lat,b.lon);
    if(!Number.isFinite(seg)||seg<=0)continue;
    while(travelled+seg>=next){
      const ratio=(next-travelled)/seg;
      markers.push({km:next,lat:a.lat+(b.lat-a.lat)*ratio,lon:a.lon+(b.lon-a.lon)*ratio});
      next+=stepKm;
    }
    travelled+=seg;
  }
  return markers;
}
function routeArrowPoints(points,count=3){
  if(!points?.length||points.length<3)return [];
  const total=points.slice(1).reduce((sum,p,i)=>sum+haversine(points[i].lat,points[i].lon,p.lat,p.lon),0);
  if(total<=0)return [];
  const targets=Array.from({length:count},(_,i)=>total*(i+1)/(count+1));
  const out=[];let travelled=0,ti=0;
  for(let i=1;i<points.length&&ti<targets.length;i++){
    const a=points[i-1],b=points[i],seg=haversine(a.lat,a.lon,b.lat,b.lon);
    while(ti<targets.length&&travelled+seg>=targets[ti]){
      const r=(targets[ti]-travelled)/Math.max(seg,1e-9);
      out.push({lat:a.lat+(b.lat-a.lat)*r,lon:a.lon+(b.lon-a.lon)*r,from:a,to:b});ti++;
    }
    travelled+=seg;
  }
  return out;
}
function renderSuggestedRoute(route){
  if(!route?.points?.length)return;
  const mb=$('mapboxRouteMap'),frame=$('areaMapFrame'),svg=$('suggestedRouteSvg');
  if(frame){frame.style.visibility='hidden';frame.removeAttribute('src');}
  if(useGoogleMaps()){if(mb)mb.hidden=true;void renderGRoute(route).catch(error=>console.warn('AIRUN Google route:',error));}
  else if(routeConfig().mapbox){void renderMapboxRoute(route).then(ok=>{if(!ok)void renderMapLibreRoute(route);});}else{if(mb)mb.hidden=true;void renderMapLibreRoute(route);}
  const bounds=routeBounds(route.points);
  if(svg){
    const {x,y,path}=projectRoute(route.points,bounds),first=route.points[0],last=route.points[route.points.length-1];
    const network=route.source==='network'||route.source==='graphhopper'||route.source==='google',stroke=network?'#08745a':'#d28a22',inner=network?'#b7f34c':'#ffe0a8';
    const dash=network?'':'stroke-dasharray="13 10"';
    const startX=x(first.lon).toFixed(1),startY=y(first.lat).toFixed(1),lastX=x(last.lon).toFixed(1),lastY=y(last.lat).toFixed(1);
    const kmMarks=routeDistanceMarkers(route.points,1).filter(m=>m.km<Math.max(1,Math.floor(route.distanceKm)+.001));
    const arrows=routeArrowPoints(route.points,Math.min(4,Math.max(2,Math.round(route.distanceKm/2))));
    let markup=`<defs><filter id="routeShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#062d24" flood-opacity=".28"/></filter></defs>`;
    // Strong white casing + green route + lime core keeps the line visible over dense streets.
    markup+=`<path d="${path}" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity=".98"/>`;
    markup+=`<path d="${path}" fill="none" stroke="${stroke}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" ${dash} filter="url(#routeShadow)"/>`;
    if(network)markup+=`<path d="${path}" fill="none" stroke="${inner}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
    // Direction arrows.
    for(const a of arrows){
      const px=x(a.lon),py=y(a.lat),ax=x(a.from.lon),ay=y(a.from.lat),bx=x(a.to.lon),by=y(a.to.lat),angle=Math.atan2(by-ay,bx-ax)*180/Math.PI;
      markup+=`<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${angle.toFixed(1)})"><path d="M -8 -6 L 7 0 L -8 6 Z" fill="#fff" opacity=".95"/><path d="M -5 -3.5 L 4 0 L -5 3.5 Z" fill="${stroke}"/></g>`;
    }
    // 1 km, 2 km, ... markers.
    for(const m of kmMarks){const px=x(m.lon).toFixed(1),py=y(m.lat).toFixed(1);markup+=`<g transform="translate(${px} ${py})"><circle r="14" fill="#fff" stroke="${stroke}" stroke-width="4"/><text x="0" y="4" text-anchor="middle" font-size="11" font-weight="900" font-family="Arial, sans-serif" fill="${stroke}">${m.km}</text></g>`;}
    // Start/end label. Loop routes end near start, so one combined marker is clearer.
    const loopGap=haversine(first.lat,first.lon,last.lat,last.lon);
    markup+=`<g transform="translate(${startX} ${startY})" filter="url(#routeShadow)"><circle r="18" fill="#fff" stroke="${stroke}" stroke-width="6"/><circle r="8" fill="${stroke}"/><rect x="24" y="-15" rx="9" width="112" height="30" fill="#fff" stroke="${stroke}" stroke-width="2"/><text x="80" y="4" text-anchor="middle" font-size="11" font-weight="900" font-family="Arial, sans-serif" fill="#073f31">BẮT ĐẦU${loopGap<.15?' / KẾT THÚC':''}</text></g>`;
    if(loopGap>=.15)markup+=`<g transform="translate(${lastX} ${lastY})"><circle r="14" fill="#fff" stroke="#1f4db8" stroke-width="5"/><circle r="5" fill="#1f4db8"/></g>`;
    svg.innerHTML=markup;
  }
  const badge=$('routeMapBadge');if(badge)badge.textContent=`${routeSourceName(route.source)} · ${route.distanceKm.toFixed(2)} km`;
  const legend=$('routeMapLegend');if(legend)legend.hidden=false;
  const summary=$('routeMapSummary');if(summary)summary.hidden=false;
  const mapDist=$('routeMapDistance');if(mapDist)mapDist.textContent=`${route.distanceKm.toFixed(2)} km`;
  const pace=planEstimate().pace,mapEta=$('routeMapEta');if(mapEta)mapEta.textContent=`≈ ${Math.round(route.distanceKm*pace)} phút`;
}
function destinationPoint(lat,lon,distanceKm,bearingDeg){
  const R=6371,δ=distanceKm/R,θ=bearingDeg*Math.PI/180,φ1=lat*Math.PI/180,λ1=lon*Math.PI/180;
  const φ2=Math.asin(Math.sin(φ1)*Math.cos(δ)+Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));
  const λ2=λ1+Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
  return {lat:φ2*180/Math.PI,lon:λ2*180/Math.PI};
}
function decodePolyline6(str){
  let index=0,lat=0,lon=0;const coords=[],factor=1e6;
  while(index<str.length){let result=0,shift=0,b;do{b=str.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20&&index<=str.length);const dlat=(result&1)?~(result>>1):(result>>1);lat+=dlat;result=0;shift=0;do{b=str.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20&&index<=str.length);const dlon=(result&1)?~(result>>1):(result>>1);lon+=dlon;coords.push({lat:lat/factor,lon:lon/factor});}
  return coords;
}
async function fetchPedestrianLoop(origin,targetKm,bearing){
  // Use two via points to form a real loop instead of drawing the same out-and-back line twice.
  const radius=Math.max(.35,targetKm/4.15);
  const via1=destinationPoint(origin.lat,origin.lon,radius,bearing);
  const via2=destinationPoint(origin.lat,origin.lon,radius,(bearing+112)%360);
  const body={locations:[{lat:origin.lat,lon:origin.lon},{lat:via1.lat,lon:via1.lon},{lat:via2.lat,lon:via2.lon},{lat:origin.lat,lon:origin.lon}],costing:'pedestrian',units:'kilometers',directions_options:{units:'kilometers'}};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5200);
  try{
    const res=await fetch('https://valhalla1.openstreetmap.de/route',{method:'POST',mode:'cors',cache:'no-store',signal:controller.signal,headers:{'Content-Type':'application/json','X-Client-Id':'airun-da-nang.onrender.com'},body:JSON.stringify(body)});
    const data=await res.json();if(!res.ok||!data?.trip?.legs?.length)throw new Error(data?.error||`Routing HTTP ${res.status}`);
    const pts=[];for(const leg of data.trip.legs){const legPts=decodePolyline6(leg.shape||'');if(pts.length&&legPts.length)legPts.shift();pts.push(...legPts);}
    const distance=Number(data.trip.summary?.length)||targetKm;return {points:pts,distanceKm:distance,source:'network',bearing};
  }finally{clearTimeout(timer);}
}
function approximateLoop(origin,targetKm,seed=0){
  const radius=Math.max(.3,targetKm/(2*Math.PI)),bearings=[270,315,0,45,90,135,180,225].map(v=>(v+seed*35)%360),pts=[{lat:origin.lat,lon:origin.lon}];
  for(let i=0;i<8;i++)pts.push(destinationPoint(origin.lat,origin.lon,radius,bearings[i]));pts.push({lat:origin.lat,lon:origin.lon});
  let d=0;for(let i=1;i<pts.length;i++)d+=haversine(pts[i-1].lat,pts[i-1].lon,pts[i].lat,pts[i].lon);return {points:pts,distanceKm:d,source:'approx',bearing:null};
}
async function generateSuggestedRoute({regenerate=false}={}){
  if(routePlanner.busy)return;routePlanner.busy=true;const btn=$('generateRouteBtn');setBusy(btn,true,'Đang tìm cung chạy…');
  if(regenerate)routePlanner.seed=(routePlanner.seed+1)%20;
  const target=clamp(Number(routePlanner.targetKm||planEstimate().distance)||3,1,30),origin=routeOrigin(),cfg=routeConfig();
  setRouteStatus(`Đang tạo cung vòng khoảng ${target.toFixed(1)} km từ ${origin.label}…`);
  let route=null,networkError=null;
  if(cfg.graphhopper){
    try{route=await fetchGraphHopperRoundTrip(origin,target,routePlanner.seed);if(route?.points?.length>5)syncRouteProviderStatus(`✓ Máy chủ đã tạo cung vòng bằng ${routeSourceName(route.source)}.`);}
    catch(error){networkError=error;console.warn('AIRUN GraphHopper:',error);syncRouteProviderStatus(`Dịch vụ tạo cung lỗi · ${apiErrorLabel(error)} · đang thử tuyến dự phòng.`);route=null;}
  }
  if(!route){
    const bearings=[270,0,180,225,315,90],bearing=bearings[routePlanner.seed%bearings.length];
    try{const candidate=await fetchPedestrianLoop(origin,target,bearing);if(candidate.points.length>5)route=candidate;}catch(error){networkError=networkError||error;console.warn('AIRUN fallback route service:',error);}
  }
  if(!route)route=approximateLoop(origin,target,routePlanner.seed);
  route.targetKm=target;route.origin=origin;route.generatedAt=Date.now();routePlanner.current=route;renderSuggestedRoute(route);
  const pace=planEstimate().pace,etaMin=route.distanceKm*pace,score=activeResult?.score??null;
  $('routeResult').hidden=false;$('routeDistanceResult').textContent=`${route.distanceKm.toFixed(2)} km`;$('routeEta').textContent=`≈ ${Math.round(etaMin)} phút`;$('routeEnvScore').textContent=score!==null?`${score}/10`:'—';
  const realRoute=route.source==='graphhopper'||route.source==='google',engine=route.source==='google'?'Google Maps':'GraphHopper';
  $('routeSourcePill').textContent=realRoute?routeSourceName(route.source).toUpperCase():route.source==='network'?'THEO ĐƯỜNG THỰC TẾ':'PHÁC THẢO THAM KHẢO';
  $('routeResultTitle').textContent=realRoute?`Cung chạy vòng từ ${origin.label}`:route.source==='network'?'Cung vòng dễ theo dõi':'Vùng chạy ước tính';
  $('routeResultText').textContent=realRoute?`${engine} tạo cung vòng theo đường đi bộ từ đúng điểm xuất phát. Mục tiêu ${target.toFixed(1)} km; thực tế ${route.distanceKm.toFixed(2)} km. Bấm “Tạo cung khác” để nhận một vòng khác.`:route.source==='network'?`Cung vòng dự phòng được ghép theo mạng đường đi bộ, gần mục tiêu ${target.toFixed(1)} km.`:'Dịch vụ định tuyến chưa phản hồi. Đường nét đứt chỉ minh họa phạm vi quãng đường, không dùng để dẫn đường.';
  const diff=route.distanceKm-target;
  setRouteStatus(realRoute?`${engine}: ${route.distanceKm.toFixed(2)} km · chênh ${diff>=0?'+':''}${diff.toFixed(2)} km so với mục tiêu.`:route.source==='network'?`Đã tạo cung dự phòng ${route.distanceKm.toFixed(2)} km.`:`Chưa lấy được đường phố thực tế${networkError?' · '+apiErrorLabel(networkError):''}. Đang hiển thị phác thảo.`,route.source==='approx'?'error':'ok');
  const open=$('openOsm');if(open)open.href=`https://www.google.com/maps?q=${origin.lat},${origin.lon}`;
  setBusy(btn,false);routePlanner.busy=false;syncRoutePlanCard();return route;
}
function useSuggestedRoute(){
  const route=routePlanner.current;if(!route){showToast('Hãy tạo cung chạy trước.');return;}
  tracker.plannedRoute=route;runAdvancedMap.lastFitSignature='';
  tracker.mapBounds=routeBounds(route.points);tracker.mapSrc='';setRunBasemap(tracker.mapBounds,true);renderRunRoute();scheduleRunMapResize(true);
  setRunMapHint(`Đã nạp cung gợi ý ${route.distanceKm.toFixed(2)} km · đường xanh lam là kế hoạch, GPS thực tế sẽ được vẽ khi bạn chạy.`,true);
  $('tracker').scrollIntoView({behavior:'smooth'});showToast(`Đã đưa cung ${route.distanceKm.toFixed(2)} km vào GPS Tracker.`);
}
async function compareAreas(){
  const button=$('compareBtn');setBusy(button,true,'Đang so sánh…');$('compareGrid').innerHTML='<div class="empty-state">Đang tải dữ liệu cho 5 khu vực…</div>';
  const keys=[selectedKey,'SonTra','NguHanhSon','HoaXuan','HoiAn'].filter((key,index,array)=>array.indexOf(key)===index).slice(0,5);while(keys.length<5){const extra=WARDS.find(item=>!keys.includes(item.key));keys.push(extra.key);}
  try{
    const plan=currentPlan();const all=await Promise.all(keys.map(async key=>{const data=await fetchEnvironment(key);const snap=snapshotFor(data,plan.time);return {key,data,snap,result:analyzeSnapshot(snap,plan)};}));const rows=all.filter(row=>!isNoData(row.data));if(!rows.length)throw new Error('NO_LIVE_DATA');rows.sort((a,b)=>b.result.score-a.result.score);
    $('compareGrid').innerHTML=rows.map((row,index)=>`<article class="compare-card ${index===0?'best':''}"><span class="compare-rank">${index===0?`ĐIỂM CAO NHẤT TRONG ${rows.length} KHU VỰC`:`VỊ TRÍ ${index+1}/${rows.length}`}</span><h3>${escapeHTML(ward(row.key).name)}</h3><div class="compare-score"><strong>${row.result.score}</strong><span>/10 thuận lợi</span></div><div class="compare-stats"><span>AQI ${fmt(row.snap.aqi)}</span><span>${fmt(row.snap.temp)}°C</span><span>PM2.5 ${fmt(row.snap.pm,1)}</span><span>UV ${fmt(row.snap.uv,1)}</span></div><button type="button" data-compare-key="${row.key}">Chọn khu vực này</button></article>`).join('');
    $('compareGrid').querySelectorAll('[data-compare-key]').forEach(node=>node.addEventListener('click',()=>runAsyncTask('Chọn khu vực',()=>selectWard(node.dataset.compareKey,{scroll:true,analyze:true}))));
  }catch{$('compareGrid').innerHTML='<div class="empty-state">Chưa thể so sánh lúc này. Hãy kiểm tra mạng và thử lại.</div>';}
  finally{setBusy(button,false);}
}

function calculatePace(){
  const distance=Number($('paceDistance').value),minutes=Number($('paceMinutes').value);
  if(distance<=0||minutes<=0){$('paceResult').textContent='—';if($('paceSpeedResult'))$('paceSpeedResult').textContent='—';return;}
  const pace=minutes/distance,whole=Math.floor(pace),sec=Math.round((pace-whole)*60),speed=60/pace;
  $('paceResult').textContent=`${whole} phút ${String(sec===60?0:sec).padStart(2,'0')} giây`;
  if($('paceSpeedResult'))$('paceSpeedResult').textContent=`≈ ${speed.toFixed(1)} km/h`;
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
  try{document.body.classList.toggle('is-running',status==='running'||status==='paused');setTimeout(()=>{if(typeof renderHomeRun==='function')renderHomeRun();},0);}catch{}
  tracker.status=status;const node=$('trackerStatus');node.className=`tracker-state ${status}`;
  node.innerHTML=status==='running'?'<i></i> Đang ghi GPS':status==='paused'?'<i></i> Đang tạm dừng':status==='finished'?'<i></i> Đã kết thúc':'<i></i> Chưa bắt đầu';
}
function updateTrackerMetrics(){
  try{if(currentView==='home')renderHomeRun();}catch{}
  $('trackerDistance').textContent=tracker.distanceKm.toFixed(2);const seconds=trackerElapsedSeconds();$('trackerTime').textContent=formatDuration(seconds);
  $('trackerPace').textContent=tracker.distanceKm>=.05?formatPace((seconds/60)/tracker.distanceKm):'—';$('trackerSpeed').textContent=round(tracker.currentSpeed,1).toFixed(1);$('routePointCount').textContent=tracker.points.length;
}
function runMapboxConfigured(){return Boolean(routeConfig().mapbox);}
function runGeoJSON(points){return {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:(points||[]).map(p=>[Number(p.lon),Number(p.lat)])}};}
function runSetSource(map,id,points){const data=runGeoJSON(points);const src=map.getSource(id);if(src)src.setData(data);else map.addSource(id,{type:'geojson',data});}
function runAddLayers(map){
  if(!map.getLayer('airun-run-plan'))map.addLayer({id:'airun-run-plan',type:'line',source:'airun-run-plan-src',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':mapPalette().plan,'line-width':['interpolate',['linear'],['zoom'],11,2.6,16,4.5],'line-opacity':.86,'line-dasharray':[2.2,1.7]}});
  if(!map.getLayer('airun-run-raw'))map.addLayer({id:'airun-run-raw',type:'line',source:'airun-run-raw-src',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':mapPalette().raw,'line-width':['interpolate',['linear'],['zoom'],11,1.4,16,2.3],'line-opacity':.36,'line-dasharray':[1.5,2.2]}});
  if(!map.getLayer('airun-run-actual-case'))map.addLayer({id:'airun-run-actual-case',type:'line',source:'airun-run-actual-src',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':mapPalette().actualCase,'line-width':['interpolate',['linear'],['zoom'],11,4.5,16,7.2],'line-opacity':.9}});
  if(!map.getLayer('airun-run-actual'))map.addLayer({id:'airun-run-actual',type:'line',source:'airun-run-actual-src',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':mapPalette().actual,'line-width':['interpolate',['linear'],['zoom'],11,2.8,16,4.8]}});
}
function makeRunMarker(cls){const el=document.createElement('div');el.className=cls;return el;}
async function ensureRunMapbox(){
  if(!runMapboxConfigured())return null;if(runAdvancedMap.map){return runAdvancedMap.map;}if(runAdvancedMap.loading)return runAdvancedMap.loading;
  runAdvancedMap.loading=(async()=>{await loadExternalAsset('style','https://api.mapbox.com/mapbox-gl-js/v3.30.0/mapbox-gl.css','airun-mapbox-css');await loadExternalAsset('script','https://api.mapbox.com/mapbox-gl-js/v3.30.0/mapbox-gl.js','airun-mapbox-js');if(!window.mapboxgl)throw new Error('Mapbox GL JS chưa sẵn sàng');mapboxgl.accessToken=routeConfig().mapbox;
    const container=$('runMapboxMap'),wrap=$('trackerMapWrap'),fallback=$('runMapFrame'),free=$('runMapLibreMap');container.hidden=false;if(free)free.hidden=true;wrap?.classList.add('mapbox-active');wrap?.classList.remove('maplibre-active');if(fallback){fallback.style.visibility='hidden';fallback.removeAttribute('src');}const base=gpsLocation||ward();
    const map=new mapboxgl.Map({container:'runMapboxMap',style:'mapbox://styles/mapbox/outdoors-v12',center:[base.lon,base.lat],zoom:14.8,attributionControl:true});map.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right');runAdvancedMap.map=map;
    await new Promise((resolve,reject)=>{map.once('load',resolve);map.once('error',e=>{if(!map.loaded())reject(e?.error||new Error('Mapbox load error'));});});
    runSetSource(map,'airun-run-plan-src',[]);runSetSource(map,'airun-run-raw-src',[]);runSetSource(map,'airun-run-actual-src',[]);runAddLayers(map);runAdvancedMap.ready=true;bindRunMapGestures(map,runAdvancedMap,container);const provider=$('runMapProvider');if(provider)provider.textContent='Mapbox · GPS trực tiếp';requestAnimationFrame(()=>{map.resize();setTimeout(()=>map.resize(),180);});return map;
  })().catch(error=>{console.warn('AIRUN run Mapbox:',error);runAdvancedMap.map=null;runAdvancedMap.ready=false;const c=$('runMapboxMap'),w=$('trackerMapWrap'),f=$('runMapFrame');if(c)c.hidden=true;w?.classList.remove('mapbox-active');if(f){f.style.visibility='hidden';f.removeAttribute('src');}const provider=$('runMapProvider');if(provider)provider.textContent='Đang chuyển sang OpenFreeMap…';void refreshRunMapLibre({fit:true});return null;}).finally(()=>{runAdvancedMap.loading=null;});return runAdvancedMap.loading;
}

async function ensureRunMapLibre(){
  if(runFallbackMap.map){return runFallbackMap.map;}
  if(runFallbackMap.loading)return runFallbackMap.loading;
  runFallbackMap.loading=(async()=>{
    await ensureMapLibreAssets();
    const container=$('runMapLibreMap'),wrap=$('trackerMapWrap'),iframe=$('runMapFrame'),mapbox=$('runMapboxMap');
    if(!container)throw new Error('Thiếu vùng bản đồ MapLibre');
    container.hidden=false;if(mapbox)mapbox.hidden=true;wrap?.classList.add('maplibre-active');wrap?.classList.remove('mapbox-active');if(iframe){iframe.style.visibility='hidden';iframe.removeAttribute('src');}
    const base=tracker.rawPoint||gpsLocation||ward();
    const map=new maplibregl.Map({container:'runMapLibreMap',style:await mapStyleUrl(),center:[base.lon,base.lat],zoom:14.8,attributionControl:true});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');runFallbackMap.map=map;
    await waitMapLoad(map,'run');map.__airunStyleReady=true;syncMapThemeButtons();
    runSetSource(map,'airun-run-plan-src',[]);runSetSource(map,'airun-run-raw-src',[]);runSetSource(map,'airun-run-actual-src',[]);runAddLayers(map);runFallbackMap.ready=true;bindRunMapGestures(map,runFallbackMap,container);
    const provider=$('runMapProvider');if(provider)provider.textContent='OpenFreeMap · MapLibre';
    requestAnimationFrame(()=>{map.resize();setTimeout(()=>map.resize(),180);});return map;
  })().catch(error=>{
    console.warn('AIRUN OpenFreeMap fallback:',error);runFallbackMap.map=null;runFallbackMap.ready=false;
    const c=$('runMapLibreMap'),w=$('trackerMapWrap'),f=$('runMapFrame');if(c)c.hidden=true;w?.classList.remove('maplibre-active');if(f){f.style.visibility='hidden';f.removeAttribute('src');}
    const provider=$('runMapProvider');if(provider)provider.textContent='Bản đồ dự phòng chưa tải được';
    setRunMapHint('Không tải được Mapbox/OpenFreeMap. GPS vẫn ghi được quãng đường; hãy kiểm tra mạng hoặc kết nối lại Mapbox.',true);
    return null;
  }).finally(()=>{runFallbackMap.loading=null;});return runFallbackMap.loading;
}
// V8.1: bản đồ GPS không bị "đơ" — không chặn cập nhật khi nền đang tải, không resize liên tục, tôn trọng thao tác kéo/zoom.
const RUN_MAP_USER_PAUSE_MS=20000;
function runMapUserBusy(state){return Date.now()-Number(state.userAt||0)<RUN_MAP_USER_PAUSE_MS;}
function runMapShouldFollow(state){return (typeof tracker!=='undefined'&&tracker.status==='running')||Boolean(typeof window!=='undefined'&&window.__airunFollow);}
function bindRunMapGestures(map,state,container){
  const mark=e=>{if(e&&e.originalEvent)state.userAt=Date.now();};
  ['dragstart','zoomstart','rotatestart','pitchstart','touchstart','wheel'].forEach(type=>map.on(type,mark));
  try{if(container&&typeof ResizeObserver!=='undefined'){let w=0,h=0;new ResizeObserver(entries=>{const r=entries[0]?.contentRect;if(!r||(Math.round(r.width)===w&&Math.round(r.height)===h))return;w=Math.round(r.width);h=Math.round(r.height);if(w>0&&h>0)map.resize();}).observe(container);}}catch{}
}
function followRunPoint(map,state,raw){
  if(!raw||!runMapShouldFollow(state)||runMapUserBusy(state)||map.isMoving?.())return;
  const lat=Number(raw.lat),lon=Number(raw.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
  const b=map.getBounds(),n=b.getNorth(),s=b.getSouth(),e=b.getEast(),w=b.getWest(),mh=(n-s)*.25,mw=(e-w)*.25;
  const pro=hasDom()&&document.body.classList.contains('run-mode');
  if(!pro&&lat<n-mh&&lat>s+mh&&lon<e-mw&&lon>w+mw)return;
  map.easeTo(pro?{center:[lon,lat],zoom:Math.max(map.getZoom?.()||16,16.3),duration:600}:{center:[lon,lat],duration:700});
}
function fitRunMapLibre(map,points,force=false){
  const pts=(points||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lon));if(!pts.length)return;
  const sig=pts.length+':'+pts[0].lat.toFixed(5)+':'+pts[0].lon.toFixed(5)+':'+pts[pts.length-1].lat.toFixed(5)+':'+pts[pts.length-1].lon.toFixed(5);if(!force&&runFallbackMap.lastFitSignature===sig)return;runFallbackMap.lastFitSignature=sig;
  if(pts.length===1){map.easeTo({center:[pts[0].lon,pts[0].lat],zoom:15.5,duration:400});return;}
  const b=new maplibregl.LngLatBounds();pts.forEach(p=>b.extend([p.lon,p.lat]));map.fitBounds(b,{padding:{top:52,bottom:68,left:52,right:52},duration:520,maxZoom:15.7});
}
async function refreshRunMapLibre({fit=false}={}){
  const map=await ensureRunMapLibre();if(!map||!runFallbackMap.ready||map.__airunStyleReady===false)return false;
  const planned=tracker.plannedRoute?.points||[],rawPts=tracker.rawPoints||[],actual=tracker.points||[];
  runSetSource(map,'airun-run-plan-src',planned);runSetSource(map,'airun-run-raw-src',rawPts);runSetSource(map,'airun-run-actual-src',actual);
  const raw=tracker.rawPoint||gpsLocation;
  if(raw){if(!runFallbackMap.currentMarker)runFallbackMap.currentMarker=new maplibregl.Marker({element:makeRunMarker('airun-run-marker')}).setLngLat([raw.lon,raw.lat]).addTo(map);else runFallbackMap.currentMarker.setLngLat([raw.lon,raw.lat]);}
  if(actual.length){const first=actual[0];if(!runFallbackMap.startMarker)runFallbackMap.startMarker=new maplibregl.Marker({element:makeRunMarker('airun-run-start-marker')}).setLngLat([first.lon,first.lat]).addTo(map);else runFallbackMap.startMarker.setLngLat([first.lon,first.lat]);}
  const fitPts=planned.length?planned:(actual.length?actual:(raw?[raw]:[]));if(!runFallbackMap.lastFitSignature||(fit&&!runMapShouldFollow(runFallbackMap)&&!runMapUserBusy(runFallbackMap)))fitRunMapLibre(map,fitPts,true);else followRunPoint(map,runFallbackMap,raw);return true;
}
function scheduleRunFallbackResize(fit=false){clearTimeout(runFallbackMap.resizeTimer);runFallbackMap.resizeTimer=setTimeout(()=>{if(runFallbackMap.map){runFallbackMap.map.resize();void refreshRunMapLibre({fit});}},220);}

function fitRunMapbox(map,points,force=false){const pts=(points||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lon));if(!pts.length)return;const sig=pts.length+':'+pts[0].lat.toFixed(5)+':'+pts[0].lon.toFixed(5)+':'+pts[pts.length-1].lat.toFixed(5)+':'+pts[pts.length-1].lon.toFixed(5);if(!force&&runAdvancedMap.lastFitSignature===sig)return;runAdvancedMap.lastFitSignature=sig;if(pts.length===1){map.easeTo({center:[pts[0].lon,pts[0].lat],zoom:15.5,duration:400});return;}const b=new mapboxgl.LngLatBounds();pts.forEach(p=>b.extend([p.lon,p.lat]));map.fitBounds(b,{padding:{top:52,bottom:68,left:52,right:52},duration:520,maxZoom:15.7});}
async function refreshRunMapbox({fit=false}={}){if(!runMapboxConfigured())return false;const map=await ensureRunMapbox();if(!map||!runAdvancedMap.ready)return false;const planned=tracker.plannedRoute?.points||[],rawPts=tracker.rawPoints||[],actual=tracker.points||[];runSetSource(map,'airun-run-plan-src',planned);runSetSource(map,'airun-run-raw-src',rawPts);runSetSource(map,'airun-run-actual-src',actual);const raw=tracker.rawPoint||gpsLocation;if(raw){if(!runAdvancedMap.currentMarker)runAdvancedMap.currentMarker=new mapboxgl.Marker({element:makeRunMarker('airun-run-marker')}).setLngLat([raw.lon,raw.lat]).addTo(map);else runAdvancedMap.currentMarker.setLngLat([raw.lon,raw.lat]);}if(actual.length){const first=actual[0];if(!runAdvancedMap.startMarker)runAdvancedMap.startMarker=new mapboxgl.Marker({element:makeRunMarker('airun-run-start-marker')}).setLngLat([first.lon,first.lat]).addTo(map);else runAdvancedMap.startMarker.setLngLat([first.lon,first.lat]);}const fitPts=planned.length?planned:(actual.length?actual:(raw?[raw]:[]));if(!runAdvancedMap.lastFitSignature||(fit&&!runMapShouldFollow(runAdvancedMap)&&!runMapUserBusy(runAdvancedMap)))fitRunMapbox(map,fitPts,true);else followRunPoint(map,runAdvancedMap,raw);return true;}
function scheduleRunMapResize(fit=false){clearTimeout(runAdvancedMap.resizeTimer);runAdvancedMap.resizeTimer=setTimeout(()=>{if(runAdvancedMap.map){runAdvancedMap.map.resize();void refreshRunMapbox({fit});}},220);}

function runMapBoundsAround(lat,lon){
  const centerLat=Number(lat),centerLon=Number(lon);
  const halfLat=.0062;
  const cos=Math.max(.35,Math.cos(centerLat*Math.PI/180));
  const halfLon=.0078/cos;
  return {left:centerLon-halfLon,right:centerLon+halfLon,bottom:centerLat-halfLat,top:centerLat+halfLat};
}
function pointInsideRunBounds(point,bounds,margin=.12){
  if(!point||!bounds)return false;
  const w=bounds.right-bounds.left,h=bounds.top-bounds.bottom;
  return point.lon>bounds.left+w*margin&&point.lon<bounds.right-w*margin&&point.lat>bounds.bottom+h*margin&&point.lat<bounds.top-h*margin;
}
function expandedRunBounds(point){
  const pts=[...(tracker.plannedRoute?.points||[]),...(tracker.rawPoints||[]),...(tracker.points||[])];if(point)pts.push(point);
  if(!pts.length){const item=ward();return runMapBoundsAround(item.lat,item.lon);}
  const lats=pts.map(p=>p.lat),lons=pts.map(p=>p.lon);
  let minLat=Math.min(...lats),maxLat=Math.max(...lats),minLon=Math.min(...lons),maxLon=Math.max(...lons);
  const centerLat=(minLat+maxLat)/2,cos=Math.max(.35,Math.cos(centerLat*Math.PI/180));
  const minLatSpan=.0124,minLonSpan=.0156/cos;
  let latSpan=Math.max(maxLat-minLat,minLatSpan),lonSpan=Math.max(maxLon-minLon,minLonSpan);
  const centerLon=(minLon+maxLon)/2;latSpan*=1.28;lonSpan*=1.28;
  return {left:centerLon-lonSpan/2,right:centerLon+lonSpan/2,bottom:centerLat-latSpan/2,top:centerLat+latSpan/2};
}
function setRunBasemap(bounds,force=false){
  const frame=$('runMapFrame');if(frame){frame.style.visibility='hidden';frame.removeAttribute('src');}
  dispatchRunMap(force);
}
function setRunMapHint(text,visible=true){
  const node=$('runMapFallback');if(!node)return;
  node.style.display=visible?'flex':'none';
  const p=node.querySelector('p');if(p)p.textContent=text||'';
}
function ensureRunMapBounds(point,force=false){
  if(!tracker.mapBounds||force||!pointInsideRunBounds(point,tracker.mapBounds,.10)){
    tracker.mapBounds=expandedRunBounds(point);setRunBasemap(tracker.mapBounds,true);
  }
}
function renderRunRoute(){
  const svg=$('runRouteSvg');if(!svg)return;
  const raw=tracker.rawPoint;
  if(!tracker.mapBounds){const base=raw||gpsLocation||ward();tracker.mapBounds=runMapBoundsAround(base.lat,base.lon);setRunBasemap(tracker.mapBounds,true);}
  const bounds=tracker.mapBounds,w=600,h=420;
  const x=lon=>((lon-bounds.left)/(bounds.right-bounds.left))*w;
  const y=lat=>h-((lat-bounds.bottom)/(bounds.top-bounds.bottom))*h;
  const pathFor=pts=>pts.map((p,i)=>`${i?'L':'M'} ${x(p.lon).toFixed(1)} ${y(p.lat).toFixed(1)}`).join(' ');
  const accepted=tracker.points||[],rawPts=tracker.rawPoints||[];
  let markup='';
  const planned=tracker.plannedRoute?.points||[];
  if(planned.length>=2)markup+=`<path d="${pathFor(planned)}" fill="none" stroke="#246bce" stroke-opacity=".85" stroke-width="3.5" stroke-dasharray="9 7" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(rawPts.length>=2)markup+=`<path d="${pathFor(rawPts)}" fill="none" stroke="#4b8f7e" stroke-opacity=".35" stroke-width="2.3" stroke-dasharray="7 8" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(accepted.length>=2)markup+=`<path d="${pathFor(accepted)}" fill="none" stroke="#08664f" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(accepted.length){const first=accepted[0];markup+=`<circle cx="${x(first.lon).toFixed(1)}" cy="${y(first.lat).toFixed(1)}" r="8" fill="#fff" stroke="#08664f" stroke-width="5"/>`;}
  if(raw){
    const centerLat=(bounds.top+bounds.bottom)/2;
    const metersPerPxX=((bounds.right-bounds.left)*111320*Math.max(.35,Math.cos(centerLat*Math.PI/180)))/w;
    const metersPerPxY=((bounds.top-bounds.bottom)*111320)/h;
    const radius=clamp(Number(raw.accuracy||0)/Math.max(1,(metersPerPxX+metersPerPxY)/2),6,75);
    const cx=x(raw.lon),cy=y(raw.lat);
    markup+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(1)}" fill="#3275dc" fill-opacity=".10" stroke="#3275dc" stroke-opacity=".38" stroke-width="2"/>`;
    markup+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="10" fill="#3275dc" stroke="#fff" stroke-width="5"/>`;
  }
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);const glActive=Boolean(runAdvancedMap.map||runFallbackMap.map||gmaps.run.map);svg.innerHTML=glActive?'':markup;dispatchRunMap(false);
}
function updateRunMap(point,accepted=true){
  if(point){
    tracker.rawPoint=point;tracker.lastFixAt=Date.now();
    if(Number(point.accuracy||999)<=220){
      const prev=tracker.rawPoints[tracker.rawPoints.length-1];
      if(!prev||Date.now()-Number(prev._seenAt||0)>2500||haversine(prev.lat,prev.lon,point.lat,point.lon)*1000>4){
        tracker.rawPoints.push({...point,_seenAt:Date.now()});if(tracker.rawPoints.length>80)tracker.rawPoints.shift();
      }
    }
    ensureRunMapBounds(point);
  }
  renderRunRoute();
}
function resetRunMap(){
  const svg=$('runRouteSvg');if(svg)svg.innerHTML='';
  tracker.rawPoint=null;tracker.rawPoints=[];tracker.mapSrc='';runAdvancedMap.lastFitSignature='';runFallbackMap.lastFitSignature='';
  const base=gpsLocation||ward();tracker.mapBounds=tracker.plannedRoute?.points?.length?routeBounds(tracker.plannedRoute.points):runMapBoundsAround(base.lat,base.lon);setRunBasemap(tracker.mapBounds,true);renderRunRoute();
  setRunMapHint(tracker.plannedRoute?`Cung gợi ý ${tracker.plannedRoute.distanceKm.toFixed(2)} km đã sẵn sàng · bấm “Bắt đầu chạy”.`:'Bản đồ đã sẵn sàng · bấm “Bắt đầu chạy” để định vị và vẽ lộ trình.',true);
}

async function requestWakeLock(){
  if(!('wakeLock' in navigator)||document.visibilityState!=='visible')return;
  try{tracker.wakeLock=await navigator.wakeLock.request('screen');tracker.wakeLock.addEventListener('release',()=>{tracker.wakeLock=null;});}catch{}
}
async function releaseWakeLock(){try{await tracker.wakeLock?.release();}catch{}tracker.wakeLock=null;}

function startTrackerWatch(){
  if(!navigator.geolocation)return;
  stopTrackerWatch();
  tracker.lastFixAt=Date.now();
  tracker.watchId=navigator.geolocation.watchPosition(handleTrackPosition,handleTrackError,{enableHighAccuracy:true,maximumAge:1500,timeout:20000});
  tracker.recoveryTimer=setInterval(async()=>{
    if(tracker.status!=='running'||tracker.recoveryBusy)return;
    if(Date.now()-tracker.lastFixAt<12000)return;
    tracker.recoveryBusy=true;
    try{
      const fallback=await geoPosition({enableHighAccuracy:false,timeout:5000,maximumAge:10000},6200);
      if(tracker.status==='running')handleTrackPosition(fallback);
    }catch{}finally{tracker.recoveryBusy=false;}
  },8000);
}
function stopTrackerWatch(){
  if(tracker.watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(tracker.watchId);tracker.watchId=null;}
  if(tracker.recoveryTimer){clearInterval(tracker.recoveryTimer);tracker.recoveryTimer=null;}
  tracker.recoveryBusy=false;
}

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
    if(isNoData(data))throw new Error('NO_LIVE_DATA');
    tracker.lastEnv={...data.current,source:data.source};
    $('trackerAqi').textContent=fmt(data.current.aqi);$('trackerTemp').textContent=`${fmt(data.current.temp)}°C`;$('trackerWind').textContent=`${fmt(data.current.wind)} km/h`;$('trackerAdvice').textContent=`${result.score}/10`;
    trackerAlert(result.tone,result.title,`${result.text} · ${sourceLabel(data.source)}.`,result.icon);
    if(typeof requestLiveCue==='function')requestLiveCue(data,result);
  }catch{trackerAlert('caution','GPS vẫn đang ghi.','Chưa cập nhật được dữ liệu môi trường; quãng đường và pace vẫn tiếp tục hoạt động.','◷');}
}

function handleTrackPosition(position){
  if(tracker.status!=='running')return;
  const c=position.coords;const point={lat:c.latitude,lon:c.longitude,accuracy:Number(c.accuracy||999),timestamp:position.timestamp||Date.now()};
  tracker.lastFixAt=Date.now();
  setSystemStatus('gps',point.accuracy<=80?'ok':'warn',`±${round(point.accuracy)} m`);
  const near=nearestWard(point.lat,point.lon);
  $('trackerLocation').textContent=near.distance<25?near.item.name:'Vị trí hiện tại';
  $('trackerAccuracy').textContent=`Độ chính xác ±${round(point.accuracy)} m`;
  updateGpsBars(point.accuracy);

  // Luôn vẽ vị trí lên bản đồ, kể cả tín hiệu còn yếu. Chỉ phép tính quãng đường mới lọc điểm xấu.
  updateRunMap(point,false);

  if(point.accuracy>80){
    tracker.currentSpeed=0;updateTrackerMetrics();
    setRunMapHint(`Đã định vị ±${round(point.accuracy)} m · bản đồ vẫn theo dõi, nhưng AIRUN chờ sai số ≤80 m trước khi cộng quãng đường.`,true);
    trackerAlert('caution','Đã có vị trí, nhưng GPS còn yếu.',`Sai số khoảng ±${round(point.accuracy)} m. Bản đồ vẫn cập nhật; quãng đường chưa được cộng để tránh sai số.`,'⌖');
    return;
  }

  setRunMapHint(`GPS ±${round(point.accuracy)} m · đang ghi lộ trình chính xác.`,tracker.points.length<2);
  if(!tracker.lastPoint){
    tracker.lastPoint=point;tracker.points.push(point);updateRunMap(point,true);updateTrackerMetrics();refreshTrackerEnvironment(point);return;
  }

  const dt=Math.max(.1,(point.timestamp-tracker.lastPoint.timestamp)/1000);
  const segmentKm=haversine(tracker.lastPoint.lat,tracker.lastPoint.lon,point.lat,point.lon),segmentM=segmentKm*1000;
  const noiseThreshold=Math.max(3,Math.min(12,(point.accuracy+tracker.lastPoint.accuracy)*.14));
  if(segmentM<noiseThreshold){tracker.currentSpeed=Number.isFinite(c.speed)&&c.speed>=0?c.speed*3.6:0;updateTrackerMetrics();return;}

  const segmentSpeed=segmentKm/(dt/3600);
  if(segmentM>350||segmentSpeed>32){trackerAlert('caution','Đã bỏ một điểm GPS bất thường.',`Bước nhảy ${round(segmentM)} m không được cộng vào quãng đường.`,'⌖');return;}

  tracker.distanceKm+=segmentKm;tracker.lastPoint=point;tracker.points.push(point);
  const rawSpeed=Number.isFinite(c.speed)&&c.speed>=0?c.speed*3.6:segmentSpeed;
  tracker.speedSamples.push(clamp(rawSpeed,0,32));if(tracker.speedSamples.length>5)tracker.speedSamples.shift();
  tracker.currentSpeed=tracker.speedSamples.reduce((a,b)=>a+b,0)/tracker.speedSamples.length;
  updateRunMap(point,true);updateTrackerMetrics();refreshTrackerEnvironment(point);checkKmCue();
  if(tracker.points.length>=2)setRunMapHint('',false);
}

function handleTrackError(error){
  if(error.code===1){
    setSystemStatus('gps','error','Bị chặn');trackerAlert('bad','Không có quyền GPS.','Hãy cho phép vị trí trong trình duyệt rồi bắt đầu lại.','!');abortTracker();
  }else if(error.code===2){
    setSystemStatus('gps','warn','Đang tìm lại vị trí');trackerAlert('caution','Tạm mất tín hiệu GPS.','AIRUN vẫn giữ bản đồ và đang tự tìm lại vị trí. Hãy giữ trang mở và ra nơi thoáng hơn.','⌖');
  }else{
    setSystemStatus('gps','warn','Chờ điểm GPS mới');trackerAlert('caution','GPS chưa có điểm mới.','AIRUN vẫn tiếp tục theo dõi và sẽ tự thử một vị trí dự phòng nếu tín hiệu chính xác cao bị đứng.','◷');
  }
}

function resetTrackerData(){
  tracker.startedAt=0;tracker.pausedMs=0;tracker.pauseStarted=0;tracker.distanceKm=0;tracker.points=[];tracker.rawPoints=[];tracker.rawPoint=null;tracker.lastPoint=null;tracker.speedSamples=[];tracker.currentSpeed=0;tracker.envLastAt=0;tracker.envPoint=null;tracker.lastEnvResult=null;tracker.lastFixAt=0;resetRunMap();
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
    tracker.startedAt=Date.now();trackerSetState('running');coach.lastKmCue=0;coach.lastLiveAt=0;speak('Bắt đầu chạy. Chúc bạn có buổi chạy tốt.');
    button.disabled=true;button.textContent='▶ Đang chạy';
    $('pauseRunBtn').disabled=false;$('finishRunBtn').disabled=false;$('pauseRunBtn').textContent='Ⅱ Tạm dừng';

    // Feed the first fix immediately so the UI never sits at “waiting GPS”.
    handleTrackPosition(first);
    const acc=Number(first.coords.accuracy||999);
    setSystemStatus('gps',acc>80?'warn':'ok',`±${round(acc)} m`);
    if(acc>80){
      trackerAlert('caution','GPS đã kết nối nhưng còn yếu.',`Độ chính xác hiện tại khoảng ±${round(acc)} m. Vị trí vẫn hiện trên bản đồ; AIRUN chờ tín hiệu tốt hơn trước khi cộng quãng đường.`,'⌖');
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
  let runId=null;
  if(tracker.points.length>=2&&seconds>=10){runId=saveRunToJournal({seconds,pace,area:near.name});showToast('Đã lưu buổi chạy · hãy đánh giá khuyến nghị ở bên dưới.');}
  else showToast('Chưa đủ điểm GPS để lưu thành một buổi chạy.');
  lastRunInfo={id:runId,at:Date.now(),seconds,distanceKm:tracker.distanceKm,pace:pace?formatPace(pace):'',area:near.name,score:tracker.lastEnvResult?.score??activeResult?.score??null,env:tracker.lastEnv?{...tracker.lastEnv,time:vnIso()}:null};
  syncFeedbackContext();speak(`Đã kết thúc. ${tracker.distanceKm.toFixed(1)} ki lô mét. Hãy đánh giá khuyến nghị của AIRUN nhé.`);
  {const ff=$('feedbackFold');if(ff)ff.open=true;}
  setTimeout(()=>$('runSummary')?.scrollIntoView({behavior:'smooth',block:'start'}),600);
  trackerAlert(tracker.lastEnvResult?.tone||'good','Đã kết thúc.',`Quãng đường ${tracker.distanceKm.toFixed(2)} km · ${formatDuration(seconds)}. Bản đồ hành trình chỉ lưu trên máy này, không gửi lên máy chủ.`,'✓');
}

function journalRows(){
  let rows=localGet(STORAGE.journal,null);
  if(rows===null){rows=localGet('airun-v40-journal',[]);localSet(STORAGE.journal,rows);}
  return Array.isArray(rows)?rows:[];
}

function saveRunToJournal({seconds,pace,area}){
  const rows=journalRows();rows.unshift({id:Date.now(),type:'run',at:new Date().toISOString(),area,distance:round(tracker.distanceKm,2),durationSec:round(seconds),pace:pace?formatPace(pace):'',aqi:tracker.lastEnvResult?$('trackerAqi').textContent:'',score:tracker.lastEnvResult?.score??'',source:'gps',feels:tracker.lastEnv?.feels??''});localSet(STORAGE.journal,rows.slice(0,150));renderJournal();cloudLog('run',rows[0]);return rows[0].id;
}

function saveJournal(){
  if(!activeResult||!activeSnapshot){showToast('Hãy phân tích kế hoạch trước khi lưu.');return;}
  if(!selectedDecision){showToast('Hãy chọn quyết định của bạn trước khi lưu.');return;}
  const rows=journalRows(),plan=currentPlan(),label=activeData?.location?.label||ward().name;
  const estimate=planEstimate(plan);
  rows.unshift({id:Date.now(),type:'plan',at:new Date().toISOString(),area:label,time:plan.time,duration:plan.duration,pace:formatPace(estimate.pace),distance:round(estimate.distance,2),intensity:plan.intensity,sensitive:plan.sensitive,decision:selectedDecision,score:activeResult.score,aqi:fmt(activeSnapshot.aqi,0,''),temp:fmt(activeSnapshot.temp,0,''),feels:fmt(activeSnapshot.feels,0,''),note:$('note').value.trim(),source:activeData.source});
  localSet(STORAGE.journal,rows.slice(0,150));$('note').value='';renderJournal();cloudLog('plan',rows[0]);showToast(session?'Đã lưu kế hoạch vào nhật ký và tài khoản của bạn.':'Đã lưu kế hoạch vào nhật ký trên thiết bị.');
}

const FB_LABEL={dung:'✓ Khuyến nghị đúng',qua_khat_khe:'▲ Quá khắt khe',qua_de_dai:'▼ Quá dễ dãi'};
function feedbackBadge(fb){if(!fb)return '';const cls=fb.verdict==='qua_khat_khe'?'strict':fb.verdict==='qua_de_dai'?'lenient':'';return `<span class="journal-fb ${cls}">${escapeHTML(FB_LABEL[fb.verdict]||'Đã đánh giá')}</span>`;}
function renderJournal(){
  const rows=journalRows();
  $('journalList').innerHTML=rows.length?rows.map(row=>{
    const date=new Date(row.at);const isRun=row.type==='run',isFb=row.type==='feedback';
    const title=isRun?`🏃 Buổi chạy GPS · ${escapeHTML(row.area)}`:isFb?`☑ Đánh giá sau buổi chạy · ${escapeHTML(row.area)}`:`${escapeHTML(row.area)} · ${escapeHTML(row.decision||'Kế hoạch')}`;
    const fbText=row.feedback?` · nóng ${row.feedback.heat}/5 · khó thở ${row.feedback.breath}/5${row.feedback.note?` · ${escapeHTML(row.feedback.note)}`:''}`:'';
    const desc=isRun?`${row.distance??0} km · ${formatDuration(row.durationSec||0)}${row.pace?` · pace ${escapeHTML(row.pace)}/km`:''}${fbText}`
      :isFb?`${escapeHTML(row.time||'')} · ${row.duration||0} phút · cảm giác ${row.feels??'—'}°C · AQI ${row.aqi??'—'}${fbText}`
      :`${escapeHTML(row.time||'')} · ${row.duration||0} phút · ${row.distance??'—'} km${row.pace?` · pace ${escapeHTML(row.pace)}/km`:''} · ${escapeHTML(row.intensity||'')} · AQI ${row.aqi??'—'}${row.note?` · ${escapeHTML(row.note)}`:''}`;
    const metric=isRun?`${row.distance??0} km`:`${row.score===''||row.score==null?'—':row.score}/10`;const metricLabel=isRun?'quãng đường':'điểm AIRUN';
    return `<article class="journal-item"><div class="journal-date"><b>${date.toLocaleDateString('vi-VN',{day:'2-digit'})}</b><span>${date.toLocaleDateString('vi-VN',{month:'2-digit',year:'numeric'})}</span></div><div class="journal-main"><b>${title}</b>${feedbackBadge(row.feedback)}<p>${desc}</p></div><div class="journal-score"><b>${metric}</b><span>${metricLabel}</span></div><button class="journal-delete" type="button" data-delete="${row.id}" aria-label="Xóa mục này">×</button></article>`;
  }).join(''):'<div class="empty-state">Chưa có dữ liệu được lưu.</div>';
  if(typeof renderHomeRun==='function')renderHomeRun();
  if(typeof renderProfile==='function'&&!cloudProfile)renderProfile();
  $('journalList').querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>{localSet(STORAGE.journal,rows.filter(row=>row.id!==Number(button.dataset.delete)));renderJournal();if(typeof updateFeedbackStats==='function')updateFeedbackStats();}));
}

function csvCell(value){let text=String(value??'');if(/^[=+\-@]/.test(text))text=`'${text}`;return `"${text.replace(/"/g,'""')}"`;}
function exportJournal(){
  const rows=journalRows();if(!rows.length){showToast('Nhật ký đang trống.');return;}
  const header=['Loại','Thời điểm','Khu vực','Giờ dự kiến','Thời lượng (giây)','Quãng đường km','Pace','Cường độ','Quyết định','Điểm AIRUN','AQI','Nhiệt độ','Cảm giác °C','Nguồn','Ghi chú','Đánh giá khuyến nghị','Nóng 1-5','Khó thở 1-5','Mệt 1-5','Cung đường','Ghi chú phản hồi','Người thử'];
  const fbCols=fb=>fb?[FB_LABEL[fb.verdict]||'',fb.heat,fb.breath,fb.effort,fb.route,fb.note,fb.tester]:['','','','','','',''];
  const body=rows.map(row=>row.type==='run'
    ?['Buổi chạy GPS',new Date(row.at).toLocaleString('vi-VN'),row.area,'',row.durationSec,row.distance,row.pace,'','',row.score,row.aqi,'',row.feels??'','GPS','',...fbCols(row.feedback)]
    :row.type==='feedback'
    ?['Đánh giá (không GPS)',new Date(row.at).toLocaleString('vi-VN'),row.area,row.time,(row.duration||0)*60,'','',row.intensity,'',row.score,row.aqi,row.temp,row.feels,sourceLabel(row.source),'',...fbCols(row.feedback)]
    :['Kế hoạch',new Date(row.at).toLocaleString('vi-VN'),row.area,row.time,(row.duration||0)*60,row.distance,row.pace,row.intensity,row.decision,row.score,row.aqi,row.temp,row.feels??'',sourceLabel(row.source),row.note,...fbCols(row.feedback)]);
  const lines=[header,...body].map(row=>row.map(csvCell).join(','));const url=URL.createObjectURL(new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`AIRUN_Nhat_ky_${new Date().toISOString().slice(0,10)}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function initDialogs(){
  const dialog=$('dataDialog');if(!dialog)return;
  const open=()=>{if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');};
  const close=()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');};
  on('dataInfoBtn','click',open);on('footerDataBtn','click',open);on('dialogClose','click',close);on('dialogOk','click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
}

async function clearLegacyServiceWorkerControl(){
  if(!('serviceWorker' in navigator))return false;
  try{
    const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(reg=>reg.unregister()));
    if('caches' in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('airun-')).map(k=>caches.delete(k)));}
  }catch(error){console.warn('AIRUN cache cleanup:',error);}
  return false;
}

function initPWA(){const button=$('installBtn');if(button)button.hidden=true;}

async function runDiagnostics(){
  const button=$('diagnosticBtn');setBusy(button,true,'Đang kiểm tra…');
  setSystemStatus('js','ok','V9.6 · HLV online, cộng đồng');updateConnection();
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
  document.querySelectorAll('[data-route-km]').forEach(button=>button.addEventListener('click',()=>{routePlanner.usePlan=false;routePlanner.targetKm=Number(button.dataset.routeKm);syncRoutePlanCard();}));
  on('routeUsePlan','click',()=>{routePlanner.usePlan=true;routePlanner.targetKm=planEstimate().distance;syncRoutePlanCard();});
  on('generateRouteBtn','click',()=>runAsyncTask('Tạo cung chạy',()=>generateSuggestedRoute()));on('regenerateRouteBtn','click',()=>runAsyncTask('Tạo cung khác',()=>generateSuggestedRoute({regenerate:true})));
  syncRouteProviderStatus();on('useSuggestedRouteBtn','click',useSuggestedRoute);
  on('routeFromPlanBtn','click',()=>{routePlanner.usePlan=true;routePlanner.targetKm=planEstimate().distance;syncRoutePlanCard();$('mapSection').scrollIntoView({behavior:'smooth'});setTimeout(()=>runAsyncTask('Tạo cung chạy',()=>generateSuggestedRoute()),450);});
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

/* ===================== V8 · AI COACH ===================== */
const coach={timer:null,inflight:null,lastSig:'',cache:new Map(),chat:[],lastLiveAt:0,lastKmCue:0,mode:'idle'};
let lastRunInfo=null;

function coachSetPill(text,tone=''){const n=$('coachPill');if(!n)return;n.textContent=text;n.className=`coach-pill ${tone}`;}
function coachList(id,items){const n=$(id);if(!n)return;const list=(Array.isArray(items)?items:[items]).filter(Boolean).slice(0,4);n.innerHTML=list.length?list.map(x=>`<li>${escapeHTML(x)}</li>`).join(''):'<li>—</li>';}
function syncCoachAvailability(){
  const ai=SERVER_CFG.ai;const send=$('coachSendBtn');if(send)send.disabled=false;
  const basis=$('coachBasis');
  if(basis)basis.textContent=ai?`AI chỉ dùng số liệu trên trang · không gửi tọa độ GPS chính xác · không thay thế tư vấn y tế.`:'Máy chủ chưa bật AI (thiếu OPENAI_API_KEY) · đang dùng phần giải thích tự động từ công thức.';
  if(activeResult&&activeData&&!isNoData(activeData))scheduleCoach(true);
}

function renderCoachWaiting(failed=false){
  const card=$('coachCard');if(!card)return;
  card.classList.remove('is-loading');$('coachGrid').hidden=true;$('coachScoreComment').hidden=true;
  $('coachHeadline').textContent=failed?'Chưa có dữ liệu thật để AI đọc':'AI Coach đang chờ dữ liệu thật';
  $('coachSummary').textContent=failed?'Open-Meteo chưa phản hồi nên AIRUN không nhờ AI đọc số mô phỏng. Hãy thử cập nhật lại sau ít phút.':'Khi thời tiết và AQI trực tiếp về, AI sẽ tóm tắt tình hình và gợi ý cụ thể.';
  coachSetPill(failed?'Chưa có dữ liệu':'Chờ dữ liệu','off');coach.lastSig='';
}

function coachNum(v,d=0){return hasNum(v)?round(v,d):null;}
function coachSnapshot(s){
  if(!s)return null;
  return {time:s.time?String(s.time).replace('T',' '):null,weather:hasNum(s.code)?weatherText(s.code)[0]:null,temp_c:coachNum(s.temp),feels_like_c:coachNum(s.feels),humidity_pct:coachNum(s.humidity),rain_prob_pct:coachNum(s.rain),wind_kmh:coachNum(s.wind,1),uv_index:coachNum(s.uv,1),us_aqi:coachNum(s.aqi),aqi_level:hasNum(s.aqi)?aqiInfo(s.aqi).label:null,pm25_ugm3:coachNum(s.pm,1)};
}
function feedbackHistory(){
  const rows=journalRows().filter(r=>r.feedback);
  const c=v=>rows.filter(r=>r.feedback.verdict===v).length;
  return {total:rows.length,dung:c('dung'),qua_khat_khe:c('qua_khat_khe'),qua_de_dai:c('qua_de_dai'),
    recent:rows.slice(0,4).map(r=>({date:String(r.at).slice(0,10),verdict:r.feedback.verdict,feels_c:r.feedback.feels??null,airun_score:r.score??r.feedback.score??null,heat_1_5:r.feedback.heat,breath_1_5:r.feedback.breath,note:(r.feedback.note||'').slice(0,120)}))};
}
function coachContext(){
  const plan=currentPlan(),est=planEstimate(plan),data=activeData,snap=activeSnapshot,res=activeResult;
  const best=data&&!isNoData(data)?bestTimeFor(data,plan):null;
  const area=ward(data?.key||selectedKey);
  return {
    app:'AIRUN Đà Nẵng',now_local:vnIso().replace('T',' '),
    location:{name:data?.location?.label||area.name,mode:data?.location?.mode==='gps'?'GPS (chỉ gửi tên khu vực)':'khu vực chọn sẵn',area_note:area.desc},
    data_source:sourceLabel(data?.source),data_updated:data?.updated?new Date(data.updated).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):null,
    plan:{start_time:plan.time,start_day:targetIso(plan.time).slice(0,10)===vnIso().slice(0,10)?'hôm nay':'ngày mai (giờ này hôm nay đã qua)',duration_min:plan.duration,pace_min_per_km:formatPace(est.pace),distance_km:round(est.distance,2),intensity:plan.intensity,sensitive_group:plan.sensitive},
    at_planned_time:coachSnapshot(snap),
    now:coachSnapshot({...(data?.current||{}),time:vnIso()}),
    airun_score:res?{score:res.score,verdict:res.title,reasons:res.reasons,scale:'0–10, càng cao càng thuận lợi. Công thức cố định; AI không đổi điểm.'}:null,
    best_upcoming_time:best?{time:best.row.time.replace('T',' '),score:best.result.score}:null,
    next_hours:data&&!isNoData(data)?upcomingHours(data,18).map(r=>({time:r.time.slice(5).replace('T',' '),feels_c:coachNum(r.feels),temp_c:coachNum(r.temp),rain_pct:coachNum(r.rain),wind_kmh:coachNum(r.wind),uv:coachNum(r.uv,1),aqi:coachNum(r.aqi),pm25:coachNum(r.pm,1),weather:hasNum(r.code)?weatherText(r.code)[0]:null,airun_score:analyzeSnapshot({...data.current,...r},plan).score})):[],
    suggested_route:routePlanner.current?{distance_km:round(routePlanner.current.distanceKm,2),type:routePlanner.current.source==='graphhopper'?'cung vòng GraphHopper':routePlanner.current.source==='network'?'cung vòng theo đường đi bộ':'phác thảo'}:null,
    user_feedback_history:feedbackHistory(),
    runner_profile:typeof compactProfile==='function'?compactProfile():null,
    runner_name:session?.user?.ten||null,
    ...(typeof window!=='undefined'&&typeof window.__airunCoachExtra==='function'?window.__airunCoachExtra():{})
  };
}
function coachSignature(){
  const plan=currentPlan(),d=activeData;
  return JSON.stringify([d?.location?.label,d?.key,d?.source==='cached'?'cached':'live',plan.time,plan.duration,plan.intensity,plan.sensitive,plan.pace,activeSnapshot?.time,activeResult?.score,coachNum(activeSnapshot?.aqi),coachNum(activeSnapshot?.feels)]);
}

/* Giải thích tự động (khi máy chủ chưa bật AI hoặc AI lỗi) — vẫn dựa đúng trên số liệu. */
function ruleCoach(){
  const plan=currentPlan(),s=activeSnapshot||{},r=activeResult,best=activeData?bestTimeFor(activeData,plan):null;
  const feels=Number(s.feels??s.temp),est=planEstimate(plan);
  const parts=[];
  if(hasNum(s.feels))parts.push(`cảm giác ${round(s.feels)}°C`);if(hasNum(s.aqi))parts.push(`AQI ${round(s.aqi)} (${aqiInfo(s.aqi).label.toLowerCase()})`);if(hasNum(s.uv))parts.push(`UV ${round(s.uv,1)}`);if(hasNum(s.rain))parts.push(`mưa ${round(s.rain)}%`);if(hasNum(s.wind))parts.push(`gió ${round(s.wind)} km/h`);
  const adjust=[];
  if(feels>=35)adjust.push(`Chậm lại khoảng 45–60 giây/km so với pace ${formatPace(est.pace)} và rút còn ${Math.max(20,Math.round(plan.duration*.7))} phút.`);
  else if(feels>31)adjust.push(`Chạy nhẹ hơn pace ${formatPace(est.pace)} khoảng 20–30 giây/km, chọn tuyến ven biển/ven sông có gió.`);
  if(hasNum(s.aqi)&&s.aqi>100)adjust.push('Giảm cường độ, tránh chạy biến tốc vì AQI cao.');
  if(hasNum(s.rain)&&s.rain>=40)adjust.push('Chuẩn bị phương án chạy trong nhà nếu trời chuyển mưa.');
  if(!adjust.length)adjust.push(`Giữ kế hoạch ${est.distance.toFixed(1)} km với pace ${formatPace(est.pace)}/km.`);
  const bring=[...document.querySelectorAll('#kitList li')].map(li=>li.textContent).slice(2,5);
  return {headline:r?.title||'Đã có dữ liệu',summary:`Lúc ${String(s.time||'').slice(11,16)||'bạn chọn'}${String(s.time||'').slice(0,10)>vnIso().slice(0,10)?' ngày mai':''} ở ${activeData?.location?.label||ward().name}: ${parts.join(', ')}. AIRUN chấm ${r?.score??'—'}/10.`,
    when:best?`${best.row.time.slice(11,16)}${best.row.time.slice(0,10)!==vnIso().slice(0,10)?' ngày mai':''} có điểm cao nhất (${best.result.score}/10) trong các khung giờ chạy phổ biến sắp tới.`:'Chưa có dự báo theo giờ.',
    adjust,bring:bring.length?bring:['Nước uống','Điện thoại đủ pin'],watch:['Chóng mặt, buồn nôn, tim đập bất thường hoặc khó thở → dừng, vào bóng râm, uống nước.'],score_comment:''};
}

function renderCoachResult(result,{source='ai',model=''}={}){
  const card=$('coachCard');if(!card||!result)return;
  card.classList.remove('is-loading');
  $('coachHeadline').textContent=result.headline||activeResult?.title||'AI Coach';
  $('coachSummary').textContent=result.summary||'';
  $('coachWhen').textContent=result.when||'—';
  coachList('coachAdjust',result.adjust);coachList('coachBring',result.bring);coachList('coachWatch',result.watch);
  $('coachGrid').hidden=false;
  const sc=$('coachScoreComment');if(sc){sc.hidden=!result.score_comment;sc.textContent=result.score_comment?`Về điểm số: ${result.score_comment}`:'';}
  renderHomeAi(result,source);
  if(source==='ai')coachSetPill(`AI · ${model||'OpenAI'}`,'ok');
  else coachSetPill(SERVER_CFG.ai?'Giải thích tự động (AI lỗi)':'Giải thích tự động','off');
}

async function postCoach(mode,context,messages,extra={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  try{
    const res=await fetch('/api/coach',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({mode,context,messages,...extra}),signal:controller.signal});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||data.error)throw new Error(data.reason||`HTTP ${res.status}`);
    return data;
  }finally{clearTimeout(timer);}
}

function scheduleCoach(force=false){
  if(!$('coachCard'))return;
  if(!activeResult||!activeData||isNoData(activeData)){renderCoachWaiting(Boolean(activeData?.failed));return;}
  clearTimeout(coach.timer);
  coach.timer=setTimeout(()=>{void runCoach(force);},force?50:1100);
}
async function runCoach(force=false){
  if(!activeResult||!activeData||isNoData(activeData))return;
  const sig=coachSignature();
  if(!force&&sig===coach.lastSig)return;
  coach.lastSig=sig;
  // Dữ liệu "đã lưu" chỉ dùng tạm: chờ dữ liệu trực tiếp rồi mới gọi AI.
  if(!SERVER_CFG.ai||activeData.source==='cached'){renderCoachResult(ruleCoach(),{source:'rule'});if(activeData.source==='cached'&&SERVER_CFG.ai)coachSetPill('Chờ dữ liệu trực tiếp…','loading');return;}
  if(coach.cache.has(sig)){const c=coach.cache.get(sig);renderCoachResult(c.result,{source:'ai',model:c.model});return;}
  const card=$('coachCard');card.classList.add('is-loading');coachSetPill('AI đang đọc số liệu…','loading');
  $('coachSummary').textContent='AI đang đọc thời tiết, AQI, UV, kế hoạch và dự báo theo giờ…';
  try{
    const data=await postCoach('plan',coachContext());
    if(sig!==coach.lastSig)return; // người dùng đã đổi kế hoạch trong lúc chờ
    coach.cache.set(sig,{result:data.result,model:data.model});
    renderCoachResult(data.result,{source:'ai',model:data.model});
  }catch(error){
    console.warn('AIRUN coach:',error);
    if(sig!==coach.lastSig)return;
    renderCoachResult(ruleCoach(),{source:'rule'});
    coachSetPill('AI tạm lỗi · giải thích tự động','off');
    coach.lastSig='';
  }
}

function appendChat(role,text){
  const box=$('coachChat');if(!box)return null;box.hidden=false;
  const el=document.createElement('div');el.className=`coach-msg ${role}`;el.textContent=text;box.appendChild(el);box.scrollTop=box.scrollHeight;return el;
}
async function askCoach(question){return sendAgent(question,{box:'coach'});}

/* ---- Khi đang chạy: nhắc ngắn bằng giọng nói ---- */
function speak(text){
  try{
    if(!$('voiceCue')?.checked||!('speechSynthesis' in window)||!text)return;
    const u=new SpeechSynthesisUtterance(text);u.lang='vi-VN';u.rate=1.02;
    const vi=speechSynthesis.getVoices().find(v=>/^vi/i.test(v.lang));if(vi)u.voice=vi;
    speechSynthesis.cancel();speechSynthesis.speak(u);
  }catch(error){console.warn('AIRUN voice:',error);}
}
function liveRuleCue(env,result){
  const km=tracker.distanceKm,pace=km>=.2?(trackerElapsedSeconds()/60)/km:null;
  let cue=`Bạn đã chạy ${km.toFixed(1)} ki lô mét${pace?`, pace trung bình ${formatPace(pace).replace(':',' phút ')} giây`:''}.`;
  const f=Number(env?.feels);if(f>=35)cue+=' Trời rất nóng, hãy chạy chậm lại và uống nước.';else if(f>31)cue+=' Trời khá nóng, nhớ uống nước.';
  if(hasNum(env?.aqi)&&env.aqi>100)cue+=' Không khí kém, giảm cường độ.';
  if(result?.tone==='bad')cue+=' Điều kiện đang bất lợi, cân nhắc kết thúc sớm.';
  return cue;
}
async function requestLiveCue(data,result,reason='env'){
  if(tracker.status!=='running')return;
  const env=data?.current||tracker.lastEnv||{};
  const now=Date.now();
  if(SERVER_CFG.ai&&now-coach.lastLiveAt>3*60*1000){
    coach.lastLiveAt=now;
    try{
      const secs=trackerElapsedSeconds(),km=tracker.distanceKm;
      const context={...coachContext(),run_now:{reason,distance_km:round(km,2),elapsed_min:round(secs/60,1),avg_pace:km>=.2?formatPace((secs/60)/km):null,current_speed_kmh:round(tracker.currentSpeed||0,1),planned_distance_km:round(planEstimate().distance,2),conditions_now:coachSnapshot({...env,time:vnIso()}),airun_score_now:result?.score??tracker.lastEnvResult?.score??null}};
      const res=await postCoach('live',context);
      const cue=String(res.result?.cue||'').trim();
      if(cue&&tracker.status==='running'){trackerAlert(result?.tone||tracker.lastEnvResult?.tone||'good','AI Coach:',cue,'✦');speak(cue);return;}
    }catch(error){console.warn('AIRUN live cue:',error);}
  }
  if(reason==='km'){const cue=liveRuleCue(env,result||tracker.lastEnvResult);speak(cue);}
}
function checkKmCue(){
  const km=Math.floor(tracker.distanceKm);
  if(km>=1&&km>coach.lastKmCue){coach.lastKmCue=km;void requestLiveCue({current:tracker.lastEnv},tracker.lastEnvResult,'km');}
}

/* ---- Phản hồi sau buổi chạy ---- */
function updateFeedbackStats(server=null){
  const h=feedbackHistory();const node=$('feedbackStats');if(!node)return;
  const parts=[];if(h.total)parts.push(`Bạn: ${h.dung} đúng · ${h.qua_khat_khe} khắt khe · ${h.qua_de_dai} dễ dãi`);
  if(server&&server.total)parts.push(`Tất cả: ${server.total} lượt`);
  node.textContent=parts.join(' · ')||'Chưa có đánh giá';
}
function feedbackConditions(){
  const env=lastRunInfo&&Date.now()-lastRunInfo.at<3*3600*1000&&lastRunInfo.env?lastRunInfo.env:activeSnapshot||{};
  return {feels:coachNum(env.feels),temp:coachNum(env.temp),aqi:coachNum(env.aqi),pm:coachNum(env.pm,1),uv:coachNum(env.uv,1),rain:coachNum(env.rain),wind:coachNum(env.wind,1),time:String(env.time||vnIso()).slice(0,16),source:activeData?.source||''};
}
function syncFeedbackContext(){
  const node=$('feedbackContext');if(!node)return;
  if(lastRunInfo&&Date.now()-lastRunInfo.at<3*3600*1000)node.textContent=`Buổi chạy ${lastRunInfo.distanceKm.toFixed(2)} km · ${formatDuration(lastRunInfo.seconds)} ở ${lastRunInfo.area}. AIRUN đã chấm ${lastRunInfo.score??'—'}/10 trước/trong buổi chạy.`;
  else if(activeResult)node.textContent=`Đánh giá kế hoạch hiện tại: ${activeData?.location?.label||ward().name}, lúc ${currentPlan().time}, AIRUN chấm ${activeResult.score}/10 (“${activeResult.title}”). Dùng được cả khi bạn không bật GPS.`;
}
async function submitFeedback(event){
  event.preventDefault();
  const form=$('feedbackForm'),status=$('feedbackStatus'),btn=$('feedbackSubmit');
  const verdict=form.querySelector('input[name="fbVerdict"]:checked')?.value;
  if(!verdict){status.textContent='Hãy chọn: Đúng / Quá khắt khe / Quá dễ dãi.';status.className='fb-status err';return;}
  const recentRun=lastRunInfo&&Date.now()-lastRunInfo.at<3*3600*1000?lastRunInfo:null;
  const plan=currentPlan();
  const conditions=feedbackConditions();
  const payload={id:String(Date.now()),verdict,route:form.querySelector('input[name="fbRoute"]:checked')?.value||'khong_dung',heat:Number($('fbHeat').value),breath:Number($('fbBreath').value),effort:Number($('fbEffort').value),note:$('fbNote').value.trim(),tester:$('fbTester').value.trim(),
    area:recentRun?.area||activeData?.location?.label||ward().name,hasGps:Boolean(recentRun),score:recentRun?.score??activeResult?.score??null,scoreTitle:activeResult?.title||'',conditions,
    run:recentRun?{distanceKm:round(recentRun.distanceKm,2),durationSec:recentRun.seconds,pace:recentRun.pace||''}:{},plan:{durationMin:plan.duration,intensity:plan.intensity,sensitive:plan.sensitive,paceMin:round(planEstimate(plan).pace,2)}};
  // 1) Lưu vào nhật ký trên máy (để hiệu chỉnh cá nhân + xuất CSV làm minh chứng)
  const fb={verdict,route:payload.route,heat:payload.heat,breath:payload.breath,effort:payload.effort,note:payload.note,tester:payload.tester,feels:conditions.feels,aqi:conditions.aqi,uv:conditions.uv,score:payload.score};
  const rows=journalRows();const target=recentRun?rows.find(r=>r.id===recentRun.id):null;
  if(target)target.feedback=fb;else rows.unshift({id:Date.now(),type:'feedback',at:new Date().toISOString(),area:payload.area,score:payload.score??'',aqi:conditions.aqi??'',temp:conditions.temp??'',feels:conditions.feels??'',time:plan.time,duration:plan.duration,intensity:plan.intensity,feedback:fb,source:activeData?.source||''});
  localSet(STORAGE.journal,rows.slice(0,150));renderJournal();
  btn.disabled=true;status.textContent='Đang gửi…';status.className='fb-status';
  // 2) Gửi về máy chủ để nhóm tổng hợp
  let server=null;
  if(SERVER_CFG.server&&SERVER_CFG.feedback){
    try{const res=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(payload)});const data=await res.json();if(res.ok&&data.ok)server=data.summary;}catch(error){console.warn('AIRUN feedback:',error);}
  }
  status.textContent=server?'✓ Đã lưu trên máy và gửi về nhóm AIRUN. Cảm ơn bạn!':'✓ Đã lưu trong nhật ký trên máy (chưa gửi được lên máy chủ).';status.className='fb-status ok';
  updateFeedbackStats(server);
  // 3) Điểm của các lần sau tự hiệu chỉnh theo phản hồi → cập nhật lại kết quả hiện tại
  if(activeData&&!isNoData(activeData))renderEnvironmentData(activeData);
  // 4) AI nhận xét buổi chạy
  await requestRunReview(payload);
  btn.disabled=false;form.reset();['fbHeat','fbBreath','fbEffort'].forEach(id=>{const o=$(id+'Out');if(o)o.textContent=$(id).value;});
}
async function requestRunReview(payload){
  const card=$('runAiCard');if(!card)return;
  const show=(r,label)=>{card.hidden=false;$('runAiHeadline').textContent=r.headline||'Nhận xét buổi chạy';$('runAiSummary').textContent=r.summary||'';const ul=$('runAiNext');ul.innerHTML=(r.next_time||[]).slice(0,3).map(x=>`<li>${escapeHTML(x)}</li>`).join('');const sr=$('runAiScore');sr.hidden=!r.score_review;sr.textContent=r.score_review?`Về điểm số: ${r.score_review}`:'';card.querySelector('.eyebrow').textContent=label;};
  const verdictText={dung:'đúng với cảm nhận',qua_khat_khe:'quá khắt khe',qua_de_dai:'quá dễ dãi'}[payload.verdict];
  if(!SERVER_CFG.ai){
    show({headline:`Bạn đánh giá khuyến nghị ${verdictText}`,summary:`Đã ghi nhận: nóng ${payload.heat}/5, khó thở ${payload.breath}/5, mệt ${payload.effort}/5${payload.run?.distanceKm?`, ${payload.run.distanceKm} km`:''}. Những lần sau AIRUN dùng phản hồi này để hiệu chỉnh điểm khi trời nóng.`,next_time:[]},'GHI NHẬN PHẢN HỒI');return;
  }
  card.hidden=false;$('runAiHeadline').textContent='AI đang nhận xét buổi chạy…';$('runAiSummary').textContent='';$('runAiNext').innerHTML='';
  try{
    const ctx={...coachContext(),finished_run:{verdict_on_airun_advice:verdictText,heat_1_5:payload.heat,breath_1_5:payload.breath,effort_1_5:payload.effort,route_feedback:payload.route,note:payload.note,run:payload.run,conditions_during_run:payload.conditions,airun_score_before:payload.score}};
    const data=await postCoach('run',ctx);show(data.result,'AI NHẬN XÉT BUỔI CHẠY');
  }catch(error){show({headline:`Đã ghi nhận: khuyến nghị ${verdictText}`,summary:`AI chưa phản hồi (${error.message}). Phản hồi của bạn vẫn được lưu để hiệu chỉnh điểm.`,next_time:[]},'GHI NHẬN PHẢN HỒI');}
}

function bindCoachEvents(){
  on('coachForm','submit',event=>{event.preventDefault();void askCoach($('coachInput').value);});
  document.querySelectorAll('[data-coach-q]').forEach(b=>b.addEventListener('click',()=>void askCoach(b.dataset.coachQ)));
  on('coachRefreshBtn','click',()=>{coach.cache.clear();coach.lastSig='';scheduleCoach(true);});
  on('feedbackForm','submit',event=>void submitFeedback(event));
  ['fbHeat','fbBreath','fbEffort'].forEach(id=>on(id,'input',()=>{const o=$(id+'Out');if(o)o.textContent=$(id).value;}));
  document.querySelectorAll('input[name="fbVerdict"]').forEach(r=>r.addEventListener('change',syncFeedbackContext));
  on('voiceCue','change',event=>{if(event.target.checked)speak('Đã bật nhắc bằng giọng nói.');});
  updateFeedbackStats();syncFeedbackContext();
  if(SERVER_CFG.server)fetch('/api/feedback/summary',{cache:'no-store'}).then(r=>r.json()).then(s=>updateFeedbackStats(s)).catch(()=>{});
}

/* ===================== V8.3 · ĐIỀU HƯỚNG THEO TAB ===================== */
const VIEWS=['home','weather','plan','coach','run','community','journal','guide'];
let currentView='home';
function viewOfElement(el){return el?.closest?.('.view')?.dataset.view||null;}
function resizeVisibleMaps(name){
  setTimeout(()=>{
    try{[routeFallbackMap.map,advancedMap.map,runFallbackMap.map,runAdvancedMap.map].forEach(m=>{if(m&&m.getContainer?.().offsetWidth)m.resize();});}catch{}
    if(name==='run'){try{if(useGoogleMaps())void refreshGRunMap({fit:!gmaps.run.fitted});else{scheduleRunFallbackResize(false);scheduleRunMapResize(false);}}catch{}}
    if(name==='plan'||name==='run'){try{updateMapSide();}catch{}}
  },60);
}
function activateView(name,{scroll=true}={}){
  if(!VIEWS.includes(name))name='home';
  const changed=name!==currentView;currentView=name;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
  document.querySelectorAll('[data-tab]').forEach(t=>{const on=t.dataset.tab===name||(t.dataset.tabAlso||'').split(' ').includes(name);t.classList.toggle('active',on);if(on)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');});
  document.body.dataset.view=name;
  // Giữ địa chỉ khớp với trang đang hiện (AI hoặc nút bấm có thể đổi trang mà không đổi hash → bấm lại tab cũ không ăn).
  try{const h=location.hash||'',hv=h.startsWith('#/')?h.slice(2).split('-')[0]:null;if(hv!==name)history.replaceState(history.state,'',`#/${name}`);}catch{}
  if(scroll&&changed)window.scrollTo({top:0,behavior:'auto'});
  if(changed)resizeVisibleMaps(name);
  $('mainNav')?.classList.remove('open');
  if(changed){try{if(!$('aiDrawer')?.hidden)renderDrawerSuggest();if(name==='journal')renderProfile();}catch{}}
  try{document.dispatchEvent(new CustomEvent('airun:view',{detail:{view:name,changed}}));}catch{}
}
// Các đoạn code cũ dùng el.scrollIntoView() để "nhảy tới" một phần → tự mở đúng tab trước khi cuộn.
(function patchScrollIntoView(){
  if(typeof Element==='undefined'||Element.prototype.__airunPatched)return;
  const original=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(...args){
    const v=viewOfElement(this);
    if(v&&v!==currentView)activateView(v,{scroll:false});
    return original.apply(this,args);
  };
  Element.prototype.__airunPatched=true;
})();
function handleRoute(){
  const h=decodeURIComponent(location.hash||'');
  if(h==='#/run-feedback'){activateView('run');const ff=$('feedbackFold');if(ff)ff.open=true;setTimeout(()=>$('feedbackFold')?.scrollIntoView({behavior:'smooth',block:'start'}),80);return;}
  if(h==='#/run-gps'){activateView('run');setTimeout(()=>$('tracker')?.scrollIntoView({behavior:'smooth',block:'start'}),80);return;}
  if(h.startsWith('#/')){activateView(h.slice(2));return;}
  const target=h.length>1?document.getElementById(h.slice(1)):null;
  const v=viewOfElement(target);
  if(v){activateView(v,{scroll:false});setTimeout(()=>target.scrollIntoView({block:'start'}),40);return;}
  activateView('home',{scroll:false});
}
function initTabs(){
  window.addEventListener('hashchange',handleRoute);
  handleRoute();
}

/* ---- Thẻ tóm tắt ở trang chủ ---- */
function renderHomeSummary(data,snapshot,result){
  setTimeout(()=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('airun:update'));},0);
  const plan=currentPlan(),est=planEstimate(plan);
  if($('homePlanLine'))$('homePlanLine').textContent=`Kế hoạch: ${plan.time} · ${plan.duration} phút · ${est.distance.toFixed(1)} km · ${plan.intensity.toLowerCase()}.`;
  const best=$('homeBest'),hours=$('homeHours');
  if(!data||isNoData(data)||!result){if(best)best.textContent=data?.failed?'Chưa có dữ liệu thật':'Đang tính…';if(hours)hours.innerHTML='';return;}
  const b=bestTimeFor(data,plan);
  if(best)best.textContent=b?`${b.row.time.slice(11,16)}${b.row.time.slice(0,10)!==vnIso().slice(0,10)?' ngày mai':' hôm nay'} · ${b.result.score}/10`:'Chưa có dự báo giờ';
  if(hours){
    const rows=upcomingHours(data,40).filter(r=>{const h=Number(r.time.slice(11,13));return h>=5&&h<=21;}).slice(0,10);
    hours.innerHTML=rows.map(r=>{const res=analyzeSnapshot({...data.current,...r},plan);const isBest=b&&r.time===b.row.time;return `<span class="hh ${res.tone}${isBest?' best':''}" title="${Number(r.time.slice(11,13))}h: ${res.score}/10"><i style="--h:${Math.max(14,res.score*10)}%"></i><em>${Number(r.time.slice(11,13))}h</em></span>`;}).join('');
  }
  const line=$('coachContextLine');
  if(line)line.textContent=`Đang xem: ${data.location?.label||ward().name} · ${plan.time} · ${plan.duration} phút · ${plan.intensity} — AIRUN chấm ${result.score}/10 (“${result.title}”).`;
}
function renderHomeAi(result,source){
  setTimeout(()=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('airun:update'));},0);
  const h=$('homeAiHead'),t=$('homeAiText');if(!h||!t||!result)return;
  h.textContent=result.headline||'AI Coach';
  const first=String(result.summary||'').split(/(?<=[.!?])\s+/)[0]||'';
  t.textContent=(first.length>170?first.slice(0,167)+'…':first)+(source==='ai'?'':' (giải thích tự động)');
}
function renderHomeRun(){
  setTimeout(()=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('airun:update'));},0);
  const head=$('homeRunHead'),text=$('homeRunText');if(!head||!text)return;
  if(tracker.status==='running'||tracker.status==='paused'){head.textContent=`Đang chạy · ${tracker.distanceKm.toFixed(2)} km`;text.textContent='Buổi chạy đang được ghi. Mở trang chạy để xem bản đồ.';return;}
  const last=journalRows().find(r=>r.type==='run');
  if(last){head.textContent=`Lần gần nhất: ${last.distance} km`;text.textContent=`${new Date(last.at).toLocaleDateString('vi-VN')} · ${formatDuration(last.durationSec||0)}${last.pace?` · pace ${last.pace}/km`:''} · ${last.area}`;}
  else{head.textContent='Sẵn sàng chạy';text.textContent='Chọn số km, AIRUN tạo một vòng chạy rồi ghi quãng đường bằng GPS.';}
}

/* ===================== V9 · GOOGLE MAPS (tải khi mở tab Chạy) ===================== */
const gmaps={loading:null,failed:false,route:{map:null,lines:[],markers:[],startMarker:null},run:{map:null,lines:{},current:null,accuracy:null,start:null,userAt:0,fitted:false}};
const GMAP_STYLE=[{featureType:'poi.business',stylers:[{visibility:'off'}]},{featureType:'poi',elementType:'labels.icon',stylers:[{saturation:-60}]},{featureType:'transit',elementType:'labels.icon',stylers:[{visibility:'off'}]},{featureType:'road',elementType:'labels.icon',stylers:[{visibility:'off'}]}];
function useGoogleMaps(){return Boolean(SERVER_CFG.googleMapsKey)&&!gmaps.failed;}
function mapsAllowed(){try{return currentView==='run';}catch{return false;}}
function loadGoogleMaps(){
  if(window.google?.maps?.Map&&window.google?.maps?.Polyline)return Promise.resolve(window.google.maps);
  if(gmaps.loading)return gmaps.loading;
  gmaps.loading=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Google Maps tải quá lâu')),25000);
    window.__airunGmapsReady=async()=>{
      try{if(google.maps.importLibrary)await Promise.all([google.maps.importLibrary('maps'),google.maps.importLibrary('marker'),google.maps.importLibrary('core')]);clearTimeout(timer);resolve(google.maps);}
      catch(error){clearTimeout(timer);reject(error);}
    };
    window.gm_authFailure=()=>{console.warn('AIRUN: Google Maps từ chối khoá');failGoogleMaps('Khoá Google Maps chưa hợp lệ hoặc chưa bật Maps JavaScript API');};
    const s=document.createElement('script');
    s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(SERVER_CFG.googleMapsKey)}&v=weekly&language=vi&region=VN&loading=async&callback=__airunGmapsReady`;
    s.async=true;s.onerror=()=>{clearTimeout(timer);reject(new Error('Không tải được Google Maps'));};
    document.head.appendChild(s);
  }).catch(error=>{failGoogleMaps(error.message);throw error;});
  return gmaps.loading;
}
function failGoogleMaps(reason){
  if(gmaps.failed)return;gmaps.failed=true;
  ['routeGoogleMap','runGoogleMap'].forEach(id=>{const n=$(id);if(n)n.hidden=true;});
  document.querySelectorAll('.gmap-active').forEach(n=>n.classList.remove('gmap-active'));
  gmaps.route.map=null;gmaps.run.map=null;
  showToast(`Google Maps chưa dùng được (${reason}) · AIRUN chuyển sang bản đồ dự phòng.`);
  try{syncRouteProviderStatus();}catch{}
  setTimeout(()=>{try{updateMapSide();if(routePlanner.current)renderSuggestedRoute(routePlanner.current);tracker.mapBounds=null;renderRunRoute();}catch(error){console.warn('AIRUN fallback maps:',error);}},50);
}
const gLL=p=>({lat:Number(p.lat),lng:Number(p.lon)});
function gDot(fill,stroke='#ffffff',scale=7,weight=3){return {path:google.maps.SymbolPath.CIRCLE,fillColor:fill,fillOpacity:1,strokeColor:stroke,strokeWeight:weight,scale};}
function gLabel(text,size=12){return {text:String(text),color:'#ffffff',fontSize:`${size}px`,fontWeight:'800',fontFamily:'Be Vietnam Pro, Arial, sans-serif'};}
function gClear(list){(list||[]).forEach(o=>{try{o.setMap(null);}catch{}});return [];}
function gFit(map,points,pad=56){
  const pts=(points||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lon));if(!pts.length)return;
  if(pts.length===1){map.setCenter(gLL(pts[0]));map.setZoom(15.5);return;}
  const b=new google.maps.LatLngBounds();pts.forEach(p=>b.extend(gLL(p)));map.fitBounds(b,pad);
}
async function ensureGRouteMap(){
  if(gmaps.route.map)return gmaps.route.map;
  await loadGoogleMaps();
  const el=$('routeGoogleMap'),wrap=el?.closest('.map-wrap');if(!el)return null;
  el.hidden=false;['routeMapLibreMap','mapboxRouteMap'].forEach(id=>{const n=$(id);if(n)n.hidden=true;});
  const frame=$('areaMapFrame');if(frame){frame.style.visibility='hidden';frame.removeAttribute('src');}
  wrap?.classList.add('gmap-active');
  const o=routeOrigin();
  const map=new google.maps.Map(el,{center:gLL(o),zoom:14.2,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,clickableIcons:false,gestureHandling:'cooperative',styles:GMAP_STYLE});
  map.addListener('click',e=>{if(routePlanner.picking&&e.latLng)setCustomStart({lat:e.latLng.lat(),lon:e.latLng.lng(),label:'Điểm chọn trên bản đồ',mode:'pick'});});
  gmaps.route.map=map;const badge=$('routeMapBadge');if(badge&&!routePlanner.current)badge.textContent='Google Maps · chưa tạo cung';
  return map;
}
function gStartMarker(map,state,origin){
  if(!state.startMarker)state.startMarker=new google.maps.Marker({map,position:gLL(origin),icon:gDot('#08664f','#ffffff',10,4),label:gLabel('▶',11),title:`Xuất phát: ${origin.label||''}`,zIndex:30});
  else{state.startMarker.setPosition(gLL(origin));state.startMarker.setMap(map);state.startMarker.setTitle(`Xuất phát: ${origin.label||''}`);}
}
async function gRouteArea(lat,lon){
  const map=await ensureGRouteMap();if(!map)return;
  if(routePlanner.current&&!gmaps.route.lines.length){await renderGRoute(routePlanner.current);return;}
  const o=routeOrigin();gStartMarker(map,gmaps.route,routePlanner.current?{...routePlanner.current.points[0],label:o.label}:o);
  if(!routePlanner.current){map.panTo(gLL(o));if(map.getZoom()<13)map.setZoom(14.2);}
}
/* Một điểm vào cho bản đồ GPS: Google → Mapbox → OpenFreeMap. Chờ /api/config để không tải 2 loại bản đồ. */
function dispatchRunMap(fit=false){
  if(!SERVER_CFG.loaded)return;
  if(useGoogleMaps()){void refreshGRunMap({fit});return;}
  if(runMapboxConfigured())void refreshRunMapbox({fit}).then(ok=>{if(!ok)void refreshRunMapLibre({fit});});else void refreshRunMapLibre({fit});
}
function onServerConfigReady(){
  try{syncAccountUi();renderProfile();}catch(error){console.warn('AIRUN account ui:',error);}
  void refreshAccount();
  try{updateMapSide();}catch(error){console.warn('AIRUN map side:',error);}
  try{renderRunRoute();}catch(error){console.warn('AIRUN run map:',error);}
}
function compactProfile(){
  const p=currentProfile();
  return {source:p.source,total_runs:p.total_runs,total_km:p.total_km,avg_km:p.avg_km,longest_km:p.longest_km,avg_pace:p.avg_pace,usual_start_hour:p.usual_start_hour,favorite_area:p.favorite_area,runs_last_28_days:p.runs_last_28_days,km_last_28_days:p.km_last_28_days,last_run:p.last_run,plans_saved:p.plans_saved,usual_intensity:p.usual_intensity,recent_notes:p.recent_notes||undefined};
}
async function renderGRoute(route){
  const map=await ensureGRouteMap();if(!map)return false;
  const st=gmaps.route;st.lines=gClear(st.lines);st.markers=gClear(st.markers);
  const path=route.points.map(gLL);
  st.lines.push(new google.maps.Polyline({map,path,strokeColor:'#ffffff',strokeOpacity:1,strokeWeight:10,zIndex:1}));
  st.lines.push(new google.maps.Polyline({map,path,strokeColor:'#08664f',strokeOpacity:.95,strokeWeight:6,zIndex:2,icons:[{icon:{path:google.maps.SymbolPath.FORWARD_CLOSED_ARROW,scale:2.4,strokeColor:'#ffffff',strokeWeight:1,fillColor:'#c8f16b',fillOpacity:1},offset:'10%',repeat:'18%'}]}));
  routeDistanceMarkers(route.points,1).filter(m=>m.km<Math.max(1,Math.ceil(route.distanceKm))).forEach(m=>st.markers.push(new google.maps.Marker({map,position:gLL(m),icon:gDot('#ffffff','#08664f',9,3),label:{...gLabel(m.km,11),color:'#08664f'},title:`${m.km} km`,zIndex:20})));
  (route.waypoints||[]).forEach((w,i)=>st.markers.push(new google.maps.Marker({map,position:gLL(w),icon:gDot('#ef8a35','#ffffff',11,3),label:gLabel(i+1,12),title:w.label||`Điểm ${i+1}`,zIndex:25})));
  gStartMarker(map,st,route.points[0]?{...route.points[0],label:route.start?.label||routeOrigin().label}:routeOrigin());
  gFit(map,route.points,48);
  const badge=$('routeMapBadge');if(badge)badge.textContent=`${routeSourceName(route.source)} · ${route.distanceKm.toFixed(2)} km`;
  return true;
}
async function ensureGRunMap(){
  if(gmaps.run.map)return gmaps.run.map;
  await loadGoogleMaps();
  const el=$('runGoogleMap'),wrap=$('trackerMapWrap');if(!el)return null;
  el.hidden=false;['runMapLibreMap','runMapboxMap'].forEach(id=>{const n=$(id);if(n)n.hidden=true;});
  const frame=$('runMapFrame');if(frame){frame.style.visibility='hidden';frame.removeAttribute('src');}
  const svg=$('runRouteSvg');if(svg)svg.innerHTML='';
  wrap?.classList.add('gmap-active');
  const base=tracker.rawPoint||gpsLocation||routeOrigin();
  const map=new google.maps.Map(el,{center:gLL(base),zoom:15.6,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,clickableIcons:false,gestureHandling:'cooperative',styles:GMAP_STYLE});
  const mark=()=>{gmaps.run.userAt=Date.now();};
  map.addListener('dragstart',mark);el.addEventListener('wheel',mark,{passive:true});el.addEventListener('touchstart',e=>{if(e.touches?.length>1)mark();},{passive:true});
  gmaps.run.map=map;const provider=$('runMapProvider');if(provider)provider.textContent='Google Maps · GPS trực tiếp';
  return map;
}
function gSetLine(map,key,points,opts){
  const st=gmaps.run.lines;const path=(points||[]).map(gLL);
  if(path.length<2){if(st[key]){st[key].forEach(l=>l.setMap(null));delete st[key];}return;}
  if(!st[key]){
    const lines=[];
    if(opts.casing)lines.push(new google.maps.Polyline({map,path,strokeColor:'#ffffff',strokeOpacity:1,strokeWeight:opts.weight+4,zIndex:opts.z-1}));
    const line=opts.dashed?new google.maps.Polyline({map,path,strokeOpacity:0,zIndex:opts.z,icons:[{icon:{path:'M 0,-1 0,1',strokeOpacity:opts.opacity??.9,strokeColor:opts.color,scale:opts.weight},offset:'0',repeat:`${opts.weight*4}px`}]}):new google.maps.Polyline({map,path,strokeColor:opts.color,strokeOpacity:opts.opacity??1,strokeWeight:opts.weight,zIndex:opts.z});
    lines.push(line);st[key]=lines;
  }else st[key].forEach(l=>l.setPath(path));
}
async function refreshGRunMap({fit=false}={}){
  if(!useGoogleMaps())return false;
  if(!gmaps.run.map&&!mapsAllowed())return false;
  let map;try{map=await ensureGRunMap();}catch{return false;}if(!map)return false;
  const planned=tracker.plannedRoute?.points||[],rawPts=tracker.rawPoints||[],actual=tracker.points||[];
  gSetLine(map,'plan',planned,{color:'#246bce',weight:4,dashed:true,z:3});
  gSetLine(map,'raw',rawPts,{color:'#4b8f7e',weight:3,opacity:.45,z:4});
  gSetLine(map,'actual',actual,{color:'#08664f',weight:6,casing:true,z:6});
  const raw=tracker.rawPoint||gpsLocation;
  if(raw){
    const pos=gLL(raw);
    if(!gmaps.run.current)gmaps.run.current=new google.maps.Marker({map,position:pos,icon:gDot('#3275dc','#ffffff',9,4),title:'Vị trí của bạn',zIndex:40});else gmaps.run.current.setPosition(pos);
    const acc=Math.min(200,Number(raw.accuracy||0));
    if(acc>0){if(!gmaps.run.accuracy)gmaps.run.accuracy=new google.maps.Circle({map,center:pos,radius:acc,strokeColor:'#3275dc',strokeOpacity:.35,strokeWeight:1,fillColor:'#3275dc',fillOpacity:.1,clickable:false,zIndex:2});else{gmaps.run.accuracy.setCenter(pos);gmaps.run.accuracy.setRadius(acc);}}
  }
  if(actual.length){const first=actual[0];if(!gmaps.run.start)gmaps.run.start=new google.maps.Marker({map,position:gLL(first),icon:gDot('#08664f','#ffffff',8,4),title:'Điểm bắt đầu',zIndex:35});else gmaps.run.start.setPosition(gLL(first));}
  else if(gmaps.run.start){gmaps.run.start.setMap(null);gmaps.run.start=null;}
  const running=tracker.status==='running';
  const fitPts=planned.length?planned:(actual.length?actual:(raw?[raw]:[]));
  if(!gmaps.run.fitted||(fit&&!running&&Date.now()-gmaps.run.userAt>20000)){gFit(map,fitPts,40);gmaps.run.fitted=true;}
  else if(raw&&running&&Date.now()-gmaps.run.userAt>20000){
    const b=map.getBounds();if(b){const ne=b.getNorthEast(),sw=b.getSouthWest(),mh=(ne.lat()-sw.lat())*.22,mw=(ne.lng()-sw.lng())*.22;
      if(!(raw.lat<ne.lat()-mh&&raw.lat>sw.lat()+mh&&raw.lon<ne.lng()-mw&&raw.lon>sw.lng()+mw))map.panTo(gLL(raw));}
  }
  return true;
}
function routeSourceName(src){return src==='google'?'Google Maps · đường đi bộ':src==='graphhopper'?'GraphHopper · đường đi bộ':src==='network'?'Đường phố OpenStreetMap':'Phác thảo tham khảo';}

/* ===================== V9 · ĐIỂM XUẤT PHÁT ===================== */
routePlanner.customStart=null;routePlanner.picking=false;
function setCustomStart(p,{silent=false}={}){
  if(!p||!Number.isFinite(Number(p.lat))||!Number.isFinite(Number(p.lon)))return;
  routePlanner.customStart={lat:Number(p.lat),lon:Number(p.lon),label:p.label||p.name||'Điểm đã chọn',accuracy:null,mode:p.mode||'place'};
  routePlanner.picking=false;const hint=$('pickHint');if(hint)hint.hidden=true;
  const reset=$('originResetBtn');if(reset)reset.hidden=false;
  const results=$('originResults');if(results)results.hidden=true;
  syncRouteOrigin();
  if(useGoogleMaps()&&gmaps.route.map){gStartMarker(gmaps.route.map,gmaps.route,routePlanner.customStart);if(!routePlanner.current)gmaps.route.map.panTo(gLL(routePlanner.customStart));}
  else{try{const m=routeFallbackMap.map;if(m&&!routePlanner.current)m.easeTo({center:[routePlanner.customStart.lon,routePlanner.customStart.lat],zoom:15,duration:400});}catch{}}
  if(!silent)showToast(`Điểm xuất phát: ${routePlanner.customStart.label}`);
}
function clearCustomStart(){routePlanner.customStart=null;const reset=$('originResetBtn');if(reset)reset.hidden=true;const input=$('originSearch');if(input)input.value='';syncRouteOrigin();updateMapSide();}
let originTimer=null,originSeq=0;
async function searchOrigin(q){
  const box=$('originResults');if(!box)return;const seq=++originSeq;
  box.hidden=false;box.innerHTML='<div class="origin-empty">Đang tìm…</div>';
  try{
    const o=routeOrigin();
    const res=await fetch(`/api/places?q=${encodeURIComponent(q)}&lat=${o.lat.toFixed(4)}&lon=${o.lon.toFixed(4)}`,{cache:'no-store'});
    const data=await res.json();if(seq!==originSeq)return;
    const list=data.results||[];
    if(!list.length){box.innerHTML='<div class="origin-empty">Không tìm thấy. Thử thêm tên phường hoặc “Đà Nẵng”.</div>';return;}
    box.innerHTML=list.map((p,i)=>`<button type="button" role="option" data-i="${i}"><b>${escapeHTML(p.name)}</b><small>${escapeHTML(p.address||'')}</small></button>`).join('')+`<p class="origin-source">Nguồn: ${data.provider==='google'?'Google Maps':'OpenStreetMap'}</p>`;
    box.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click',()=>{const p=list[Number(b.dataset.i)];$('originSearch').value=p.name;setCustomStart({lat:p.lat,lon:p.lon,label:p.name,mode:'place'});}));
  }catch{if(seq===originSeq)box.innerHTML='<div class="origin-empty">Chưa tìm được, kiểm tra mạng rồi thử lại.</div>';}
}
function startPickOnMap(){
  activateView('run');routePlanner.picking=true;const hint=$('pickHint');if(hint)hint.hidden=false;
  $('mapSection')?.scrollIntoView({behavior:'smooth',block:'start'});
  showToast('Chạm vào bản đồ để chọn điểm xuất phát.');
}
function attachMapLibrePick(map){
  if(!map||map.__airunPick)return;map.__airunPick=true;
  try{map.on('click',e=>{if(routePlanner.picking&&e?.lngLat)setCustomStart({lat:e.lngLat.lat,lon:e.lngLat.lng,label:'Điểm chọn trên bản đồ',mode:'pick'});});}catch{}
}

/* ===================== V9 · AI TẠO CUNG THEO MÔ TẢ ===================== */
function showRouteResult(route,{pill,title,text,status,tone='ok'}={}){
  const pace=planEstimate().pace,score=activeResult?.score??null;
  $('routeResult').hidden=false;$('routeDistanceResult').textContent=`${route.distanceKm.toFixed(2)} km`;$('routeEta').textContent=`≈ ${Math.round(route.distanceKm*pace)} phút`;$('routeEnvScore').textContent=score!==null?`${score}/10`:'—';
  if(pill)$('routeSourcePill').textContent=pill;if(title)$('routeResultTitle').textContent=title;if(text)$('routeResultText').textContent=text;
  if(status)setRouteStatus(status,tone);
}
async function planRouteFromIntent(intent,{reply=''}={}){
  activateView('run');
  const o=routeOrigin();
  const useCurrent=intent.use_current_start||!intent.start_text;
  const body={start:useCurrent?{lat:o.lat,lon:o.lon,label:o.label}:intent.start_text,waypoints:intent.waypoints||[],km:intent.distance_km||((intent.waypoints||[]).length?null:round(routePlanner.targetKm||planEstimate().distance,2)),loop:intent.loop!==false,near:{lat:o.lat,lon:o.lon},seed:routePlanner.seed};
  setRouteStatus(`Đang tìm ${body.waypoints.length?`${body.waypoints.length} điểm muốn đi qua`:'vòng chạy'} và vẽ đường…`);
  const btn=$('aiRouteBtn');setBusy(btn,true,'Đang vẽ cung…');
  try{
    const res=await fetch('/api/route/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(!res.ok||data.error||!Array.isArray(data.points)){setRouteStatus(`Chưa tạo được cung: ${data.reason||res.status}`,'error');showToast(data.reason||'Chưa tạo được cung chạy');return null;}
    if(!useCurrent&&data.start)setCustomStart({...data.start,mode:'place'},{silent:true});
    const route={points:data.points,distanceKm:Number(data.distanceKm),source:data.source,roads:data.roads||null,steps:data.steps||null,waypoints:data.waypoints||[],start:data.start,ai:true,targetKm:data.targetKm||null,origin:data.start,generatedAt:Date.now()};
    routePlanner.current=route;renderSuggestedRoute(route);
    const via=(route.waypoints||[]).map(w=>w.label).filter(Boolean);
    const missing=(data.notFound||[]).filter(Boolean);
    const txt=[reply,via.length?`Đi qua: ${via.join(' → ')}${route.waypoints.length&&body.loop?' → về điểm xuất phát':''}.`:'',missing.length?`Chưa tìm thấy: ${missing.join(', ')} — thử ghi rõ hơn.`:'',data.targetKm?`Mục tiêu ${Number(data.targetKm).toFixed(1)} km, cung thực tế ${route.distanceKm.toFixed(2)} km.`:''].filter(Boolean).join(' ');
    showRouteResult(route,{pill:`AI · ${routeSourceName(route.source).toUpperCase()}`,title:`Cung chạy AI đề xuất từ ${data.start?.label||o.label}`,text:txt,status:`Đã vẽ cung ${route.distanceKm.toFixed(2)} km · bấm “Dùng cung này & chạy” để đưa vào GPS.`});
    $('mapSection')?.scrollIntoView({behavior:'smooth',block:'start'});
    return route;
  }catch(error){setRouteStatus(`Chưa tạo được cung: ${error.message}`,'error');return null;}
  finally{setBusy(btn,false);}
}
async function aiPlanRoute(text){
  const t=String(text||'').trim();if(t.length<4){showToast('Hãy mô tả cung chạy bạn muốn, ví dụ: “5 km qua Cầu Rồng”.');return;}
  const reply=$('aiRouteReply');
  if(!SERVER_CFG.ai){if(reply){reply.hidden=false;reply.textContent='AI chưa bật trên máy chủ nên chưa hiểu được mô tả. Bạn vẫn có thể tìm điểm xuất phát và chọn số km ở dưới.';}return;}
  const btn=$('aiRouteBtn');setBusy(btn,true,'AI đang đọc mô tả…');if(reply){reply.hidden=false;reply.textContent='AI đang đọc mô tả của bạn…';}
  try{
    const o=routeOrigin();
    const data=await postCoach('route_intent',{...coachContext(),current_start:{label:o.label,mode:o.mode},plan_distance_km:round(planEstimate().distance,1)},null,{text:t});
    const intent=data.result||{};
    if(reply)reply.textContent=intent.reply||'Mình sẽ tạo cung theo mô tả của bạn.';
    setBusy(btn,false);
    await planRouteFromIntent(intent,{reply:''});
  }catch(error){if(reply)reply.textContent=`AI chưa xử lý được: ${error.message}`;}
  finally{setBusy(btn,false);}
}

/* ===================== V9 · TÀI KHOẢN NGƯỜI CHẠY ===================== */
const SESSION_KEY='airun-v9-session';
let session=localGet(SESSION_KEY,null);
let cloudProfile=null;
let accMode='login';
function authHeaders(){return session?.token?{Authorization:`Bearer ${session.token}`}:{};}
function syncAccountUi(){
  const name=session?.user?.ten;
  const t=$('accountBtnText');if(t)t.textContent=name||'Đăng nhập';
  const av=document.querySelector('#accountBtn .acc-avatar');if(av){if(name)av.textContent=name.trim().charAt(0).toUpperCase();else av.innerHTML='<svg class="ic" aria-hidden="true"><use href="#i-user-round"/></svg>';}
  $('accountBtn')?.classList.toggle('logged',Boolean(name));
  const lb=$('profileLoginBtn'),lo=$('logoutBtn');if(lb)lb.hidden=Boolean(name);if(lo)lo.hidden=!name;
  const title=$('profileTitle'),lead=$('profileLead');
  if(title)title.textContent=name?`Chào ${name} 👋`:'Thói quen chạy của bạn';
  if(lead)lead.textContent=name?'Buổi chạy, kế hoạch và đánh giá của bạn được lưu vào tài khoản. AI Coach dùng chúng để gợi ý đúng thói quen của bạn.':(SERVER_CFG.accounts?'Đăng nhập để AIRUN nhớ các buổi chạy trên mọi thiết bị và AI Coach gợi ý theo thói quen của bạn. Hiện đang tính từ dữ liệu trên máy này.':'Đang tính từ dữ liệu trên máy này. (Máy chủ chưa kết nối Google Sheet nên chưa tạo tài khoản được.)');
}
function setAccMode(m){
  accMode=m;document.querySelectorAll('[data-acc-tab]').forEach(b=>b.classList.toggle('active',b.dataset.accTab===m));
  $('accPin2Wrap').hidden=m!=='register';$('accSubmit').textContent=m==='register'?'Tạo tài khoản':'Đăng nhập';$('accountTitle').textContent=m==='register'?'Tạo tài khoản người chạy':'Đăng nhập AIRUN';
  $('accStatus').textContent='';
}
function openAccount(m='login'){
  const d=$('accountDialog');if(!d)return;
  if(session){activateView('journal');$('profileSection')?.scrollIntoView({behavior:'smooth'});return;}
  setAccMode(m);
  if(!SERVER_CFG.accounts){$('accStatus').textContent='Máy chủ chưa kết nối Google Sheet nên chưa tạo/đăng nhập tài khoản được.';$('accStatus').className='fb-status err';}
  if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
  setTimeout(()=>$('accName')?.focus(),60);
}
function closeAccount(){const d=$('accountDialog');if(!d)return;if(typeof d.close==='function')d.close();else d.removeAttribute('open');}
async function submitAccount(event){
  event.preventDefault();
  const name=$('accName').value.trim(),pin=$('accPin').value.trim(),pin2=$('accPin2').value.trim(),st=$('accStatus');
  if(name.length<2){st.textContent='Tên người chạy cần ít nhất 2 ký tự.';st.className='fb-status err';return;}
  if(!/^\d{4,6}$/.test(pin)){st.textContent='Mã PIN gồm 4–6 chữ số.';st.className='fb-status err';return;}
  if(accMode==='register'&&pin!==pin2){st.textContent='Hai lần nhập mã PIN chưa khớp.';st.className='fb-status err';return;}
  const btn=$('accSubmit');setBusy(btn,true,accMode==='register'?'Đang tạo…':'Đang đăng nhập…');st.textContent='';
  try{
    const res=await fetch(`/api/account/${accMode==='register'?'register':'login'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,pin})});
    const data=await res.json();
    if(!res.ok||!data.ok){st.textContent=data.reason||'Chưa đăng nhập được.';st.className='fb-status err';return;}
    session={token:data.token,user:data.user};localSet(SESSION_KEY,session);cloudProfile=data.profile||null;
    if(data.history)mergeCloudHistory(data.history);
    if(accMode==='register')pushLocalHistoryToCloud();
    $('accPin').value='';$('accPin2').value='';closeAccount();syncAccountUi();renderProfile();
    showToast(accMode==='register'?`Đã tạo tài khoản ${data.user.ten}. AI Coach sẽ nhớ thói quen của bạn.`:`Chào ${data.user.ten}! Đã tải lịch sử chạy của bạn.`);
  }catch(error){st.textContent=`Chưa kết nối được: ${error.message}`;st.className='fb-status err';}
  finally{setBusy(btn,false);}
}
async function refreshAccount(){
  if(!session?.token||!SERVER_CFG.accounts)return;
  try{
    const res=await fetch('/api/account/me',{cache:'no-store',headers:authHeaders()});
    if(res.status===401){logout(true);return;}
    const data=await res.json();if(data.ok){cloudProfile=data.profile||null;mergeCloudHistory(data.history||{});renderProfile();}
  }catch{}
}
function logout(silent=false){session=null;try{localStorage.removeItem(SESSION_KEY);}catch{}cloudProfile=null;syncAccountUi();renderProfile();if(!silent)showToast('Đã đăng xuất. Nhật ký trên máy này vẫn được giữ.');}
function mergeCloudHistory(h){
  const rows=journalRows(),ids=new Set(rows.map(r=>String(r.id)));let added=0;
  (h.buoi_chay||[]).forEach(r=>{const id=String(r.ma_buoi||'');if(!id||ids.has(id))return;ids.add(id);added++;rows.push({id:Number(id)||Date.parse(r.thoi_diem)||Date.now(),type:'run',at:r.thoi_diem,area:r.khu_vuc||'',distance:Number(r.km)||0,durationSec:Number(r.thoi_gian_giay)||0,pace:r.pace||'',score:r.diem_airun??'',aqi:r.aqi??'',feels:r.cam_giac_c??'',source:'cloud'});});
  (h.ke_hoach||[]).forEach(r=>{const id=String(r.ma||'');if(!id||ids.has(id))return;ids.add(id);added++;rows.push({id:Number(id)||Date.parse(r.thoi_diem)||Date.now(),type:'plan',at:r.thoi_diem,area:r.khu_vuc||'',time:r.gio_chay||'',duration:Number(r.thoi_luong_phut)||0,distance:Number(r.km_du_kien)||'',pace:r.pace||'',intensity:r.cuong_do||'',decision:r.quyet_dinh||'',score:r.diem_airun??'',aqi:r.aqi??'',temp:r.nhiet_do??'',note:r.ghi_chu||'',source:'cloud'});});
  if(added){rows.sort((a,b)=>String(b.at).localeCompare(String(a.at)));localSet(STORAGE.journal,rows.slice(0,150));renderJournal();}
}
function cloudLog(kind,data){
  if(!session?.token||!SERVER_CFG.accounts)return;
  fetch('/api/account/log',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({kind,data:kind==='run'?{...data,hidden:localGet('airun-v96-lb-hidden',false)===true}:data})})
    .then(r=>{if(r.ok){clearTimeout(cloudLog.timer);cloudLog.timer=setTimeout(()=>void refreshAccount(),1500);}}).catch(()=>{});
}
function pushLocalHistoryToCloud(){journalRows().filter(r=>r.source!=='cloud').slice(0,20).reverse().forEach(r=>{if(r.type==='run')cloudLog('run',r);else if(r.type==='plan')cloudLog('plan',r);});}

/* Hồ sơ thói quen (máy chủ tính khi đăng nhập; nếu chưa đăng nhập thì tính từ nhật ký trên máy). */
function localProfile(){
  const rows=journalRows(),runs=rows.filter(r=>r.type==='run'&&Number(r.distance)>0.05),plans=rows.filter(r=>r.type==='plan');
  const kms=runs.map(r=>Number(r.distance)||0),paces=runs.map(r=>{const m=String(r.pace||'').match(/^(\d+):(\d{1,2})$/);return m?Number(m[1])+Number(m[2])/60:null;}).filter(Number.isFinite);
  const hourOf=r=>{const d=new Date(new Date(r.at).getTime()-(Number(r.durationSec)||0)*1000);return Number.isFinite(d.getTime())?Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',hourCycle:'h23'}).format(d)):null;};
  const modeOf=arr=>{const c=new Map();arr.forEach(v=>{if(v!==null&&v!==undefined&&v!=='')c.set(v,(c.get(v)||0)+1);});let best=null,n=0;c.forEach((count,val)=>{if(count>n){n=count;best=val;}});return best;};
  const last28=runs.filter(r=>Date.now()-new Date(r.at).getTime()<28*864e5);
  const avgPace=paces.length?paces.reduce((a,b)=>a+b,0)/paces.length:null;
  const fb=feedbackHistory();
  return {total_runs:runs.length,total_km:round(kms.reduce((a,b)=>a+b,0),1),avg_km:runs.length?round(kms.reduce((a,b)=>a+b,0)/runs.length,1):null,longest_km:runs.length?Math.max(...kms):null,avg_pace:avgPace?formatPace(avgPace):null,usual_start_hour:modeOf(runs.map(hourOf).filter(v=>v!==null))??modeOf(plans.map(p=>Number(String(p.time||'').slice(0,2))).filter(Number.isFinite)),favorite_area:modeOf(runs.map(r=>r.area).concat(plans.map(p=>p.area))),runs_last_28_days:last28.length,km_last_28_days:round(last28.reduce((a,r)=>a+(Number(r.distance)||0),0),1),last_run:runs[0]?{date:String(runs[0].at).slice(0,10),km:runs[0].distance,pace:runs[0].pace||null}:null,plans_saved:plans.length,usual_intensity:modeOf(plans.map(p=>p.intensity)),feedback:{total:fb.total,dung:fb.dung,qua_khat_khe:fb.qua_khat_khe,qua_de_dai:fb.qua_de_dai}};
}
function currentProfile(){return cloudProfile?{...cloudProfile,source:'tài khoản AIRUN',name:session?.user?.ten||null}:{...localProfile(),source:'nhật ký trên máy này'};}
function renderProfile(){
  const box=$('profileStats');if(!box)return;const p=currentProfile();
  const items=[['🏃','Buổi chạy',p.total_runs||0,''],['📏','Tổng quãng đường',`${p.total_km||0}`,'km'],['⏱','Pace trung bình',p.avg_pace||'—','/km'],['🕔','Giờ hay chạy',p.usual_start_hour!==null&&p.usual_start_hour!==undefined?`${p.usual_start_hour}h`:'—',''],['📍','Khu vực quen',p.favorite_area||'—',''],['📅','28 ngày qua',`${p.runs_last_28_days||0} buổi`,`${p.km_last_28_days||0} km`]];
  box.innerHTML=items.map(([ic,label,val,unit])=>`<div class="pstat"><span aria-hidden="true">${ic}</span><small>${label}</small><b>${escapeHTML(String(val))}${unit?` <i>${escapeHTML(unit)}</i>`:''}</b></div>`).join('')+`<p class="pstat-source">Nguồn: ${escapeHTML(p.source)}</p>`;
}
async function aiWeekly(){
  const btn=$('weeklyBtn');
  if(!SERVER_CFG.ai){$('weeklySummary').textContent='AI chưa bật trên máy chủ nên chưa lập kế hoạch tuần được.';return;}
  setBusy(btn,true,'AI đang lập kế hoạch…');
  try{
    const data=await postCoach('weekly',coachContext());const r=data.result||{};
    $('weeklyHeadline').textContent=r.headline||'Kế hoạch 7 ngày';$('weeklySummary').textContent=r.summary||'';
    const list=$('weeklyList'),sessions=Array.isArray(r.sessions)?r.sessions.slice(0,7):[];
    list.innerHTML=sessions.map((s,i)=>{const rest=/nghỉ/i.test(String(s.type||''));return `<div class="wk ${rest?'rest':''}"><div class="wk-day"><b>${escapeHTML(s.day||`Ngày ${i+1}`)}</b><small>${escapeHTML(s.time||'')}</small></div><div class="wk-main"><b>${escapeHTML(s.type||'')}</b><span>${rest?'':`${Number(s.km)||'—'} km · ${Number(s.duration_min)||'—'} phút`}</span><small>${escapeHTML(s.why||'')}</small></div>${rest?'':`<button type="button" class="chip-btn" data-wk="${i}">Dùng buổi này</button>`}</div>`;}).join('');
    list.querySelectorAll('[data-wk]').forEach(b=>b.addEventListener('click',()=>{const s=sessions[Number(b.dataset.wk)];runAgentAction({type:'set_plan',time:/^\d{1,2}:\d{2}$/.test(String(s.time||''))?String(s.time).padStart(5,'0'):null,duration_min:Number(s.duration_min)||null,intensity:/biến tốc|nhanh/i.test(String(s.type))?'Vừa':'Nhẹ',area:null});}));
    const tip=$('weeklyTip');if(tip){tip.hidden=!r.tip;tip.textContent=r.tip?`💡 ${r.tip}`:'';}
  }catch(error){$('weeklySummary').textContent=`AI chưa trả lời được: ${error.message}`;}
  finally{setBusy(btn,false);}
}

/* ===================== V9 · AI COACH Ở MỌI TAB ===================== */
const agent={chat:[],busy:false};
const TAB_SUGGEST={
  home:['Hôm nay chạy lúc nào là tốt nhất?','Tạo cho mình cung 5 km gần đây','Tuần này mình nên chạy thế nào?'],
  plan:['Giờ mình chọn có ổn không?','Đổi sang 5:30 sáng mai, chạy 40 phút','Nên chạy pace bao nhiêu?'],
  coach:['BMI của mình như vậy nên tập thế nào?','Ăn gì trước và sau buổi chạy?','Lập giúp mình lộ trình chạy 5 km'],
  run:['Tạo cung 5 km qua Cầu Rồng và Cầu Tình Yêu','Cung này có hợp thời tiết không?','Khởi động thế nào trước khi chạy?'],
  journal:['Nhận xét thói quen chạy của mình','Mình nên tăng quãng đường thế nào?'],
  weather:['Cuối tuần này thời tiết thế nào?','Hội An ngày mai có mưa không?','Giờ nào ít nắng nhất hôm nay?'],
  community:['Làm sao để lên bảng xếp hạng?','Tuần này mình nên chạy bao nhiêu km?'],
  guide:['Hướng dẫn mình chạy buổi đầu tiên','GPS không bắt được thì làm sao?']
};
const TAB_NAMES={home:'Trang chủ',weather:'Thời tiết',plan:'Kế hoạch',coach:'AI Coach',run:'Chạy',community:'Cộng đồng',journal:'Nhật ký',guide:'Cẩm nang'};
function agentContext(){
  const o=routeOrigin(),r=routePlanner.current;
  return {...coachContext(),current_tab:currentView,available_areas:WARDS.map(w=>w.name),current_start:{label:o.label,mode:o.mode},current_route:r?{distance_km:round(r.distanceKm,2),source:r.source,waypoints:(r.waypoints||[]).map(w=>w.label),ai:Boolean(r.ai)}:null,run_status:tracker.status,is_logged_in:Boolean(session)};
}
function renderDrawerSuggest(){
  const box=$('aiDrawerSuggest');if(!box)return;
  box.innerHTML=(TAB_SUGGEST[currentView]||TAB_SUGGEST.home).map(q=>`<button type="button" data-q="${escapeHTML(q)}">${escapeHTML(q)}</button>`).join('');
  box.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>void sendAgent(b.dataset.q,{box:'drawer'})));
  const sub=$('aiDrawerSub');if(sub)sub.textContent=`Đang ở tab ${TAB_NAMES[currentView]||''} · AI có thể làm giúp bạn`;
}
function openAiDrawer(){const d=$('aiDrawer');if(!d)return;d.hidden=false;document.body.classList.add('ai-open');renderDrawerSuggest();setTimeout(()=>$('aiDrawerInput')?.focus(),60);}
function closeAiDrawer(){const d=$('aiDrawer');if(!d)return;d.hidden=true;document.body.classList.remove('ai-open');}
function msgBox(kind){return kind==='coach'?$('coachChat'):$('aiDrawerBody');}
function appendMsg(kind,role,text){
  const box=msgBox(kind);if(!box)return null;box.hidden=false;
  const el=document.createElement('div');el.className=`coach-msg ${role}`;el.textContent=text;box.appendChild(el);box.scrollTop=box.scrollHeight;return el;
}
function describeAction(a){
  if(a.type==='plan_route'){const from=a.use_current_start||!a.start_text?'điểm xuất phát hiện tại':a.start_text;return `Tạo cung chạy từ ${from}${a.waypoints?.length?` qua ${a.waypoints.join(', ')}`:''}${a.distance_km?` · khoảng ${a.distance_km} km`:''}${a.loop?' · quay về':''}`;}
  if(a.type==='set_plan'){const parts=[];if(a.time)parts.push(`giờ chạy ${a.time}`);if(a.duration_min)parts.push(`${a.duration_min} phút`);if(a.intensity)parts.push(`cường độ ${a.intensity.toLowerCase()}`);if(a.area)parts.push(`khu vực ${a.area}`);return `Đổi kế hoạch: ${parts.join(', ')||'theo gợi ý'}`;}
  if(a.type==='open_tab')return `Mở tab ${TAB_NAMES[a.tab]||a.tab}`;
  return 'Thực hiện gợi ý';
}
function appendAction(kind,action){
  const box=msgBox(kind);if(!box||!action)return;
  const card=document.createElement('div');card.className='ai-action';
  card.innerHTML=`<span>${escapeHTML(describeAction(action))}</span><button type="button" class="primary">${action.type==='plan_route'?'⌁ Tạo cung':'✓ Làm luôn'}</button>`;
  card.querySelector('button').addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;b.textContent='Đang làm…';try{await runAgentAction(action);b.textContent='✓ Xong';}catch{b.disabled=false;b.textContent='Thử lại';}});
  box.appendChild(card);box.scrollTop=box.scrollHeight;
}
function appendPlaces(kind,list){
  const box=msgBox(kind);if(!box)return;
  const card=document.createElement('div');card.className='ai-places';
  card.innerHTML=list.slice(0,4).map(p=>`<a href="${escapeHTML(/^https:\/\/www\.google\.com\/maps\//.test(String(p.map_link||''))?p.map_link:'#')}" target="_blank" rel="noopener"><b>${escapeHTML(p.name||'Địa điểm')}</b><small>${escapeHTML([hasNum(p.distance_km)?`${p.distance_km} km`:'',p.address||''].filter(Boolean).join(' · '))}</small></a>`).join('');
  box.appendChild(card);box.scrollTop=box.scrollHeight;
}
function findWardByName(name){
  const n=String(name||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase();
  return WARDS.find(w=>w.name.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase()===n)||WARDS.find(w=>n.includes(w.name.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase()));
}
async function runAgentAction(a){
  if(!a)return;
  if(a.type==='open_tab'){activateView(a.tab);return;}
  if(a.type==='plan_route'){if(window.innerWidth<780)closeAiDrawer();await planRouteFromIntent(a);return;}
  if(a.type==='set_plan'){
    if(a.time)$('time').value=a.time;
    if(a.duration_min){const sel=$('duration');if(![...sel.options].some(o=>Number(o.value)===a.duration_min)){const opt=document.createElement('option');opt.value=String(a.duration_min);opt.textContent=`${a.duration_min} phút`;sel.appendChild(opt);}sel.value=String(a.duration_min);}
    if(a.intensity){intensity=a.intensity;document.querySelectorAll('[data-intensity]').forEach(b=>b.classList.toggle('active',b.dataset.intensity===intensity));}
    const w=a.area?findWardByName(a.area):null;
    activateView('plan');
    if(w&&w.key!==selectedKey)await selectWard(w.key,{analyze:true});else{updatePlanEstimate();savePlanSettings();await analyzePlan(false);}
    showToast('Đã cập nhật kế hoạch theo gợi ý của AI.');
  }
}
async function sendAgent(question,{box='drawer'}={}){
  const q=String(question||'').trim().slice(0,400);if(!q||agent.busy)return;
  appendMsg(box,'user',q);agent.chat.push({role:'user',content:q});
  if(box==='drawer'){const i=$('aiDrawerInput');if(i)i.value='';}else{const i=$('coachInput');if(i)i.value='';}
  if(!SERVER_CFG.ai){appendMsg(box,'err','Máy chủ AIRUN chưa bật AI (thiếu OPENAI_API_KEY) nên chưa trả lời được câu hỏi tự do.');agent.chat.pop();return;}
  agent.busy=true;const pending=appendMsg(box,'ai','HLV đang trả lời…');
  ['aiDrawerSend','coachSendBtn'].forEach(id=>{const b=$(id);if(b)b.disabled=true;});
  try{
    const o=routeOrigin();
    const data=await postCoach('agent',agentContext(),agent.chat.slice(-10),{near:hasNum(o?.lat)&&hasNum(o?.lon)?{lat:round(o.lat,3),lon:round(o.lon,3)}:null});
    const r=data.result||{};const answer=String(r.reply||'').trim()||'Mình chưa có câu trả lời.';
    pending.textContent=answer;agent.chat.push({role:'assistant',content:answer});
    if(r.looked?.type==='place'&&Array.isArray(r.looked.results)&&r.looked.results.length)appendPlaces(box,r.looked.results);
    if(r.action){if(r.action.type==='open_tab')void runAgentAction(r.action);else appendAction(box,r.action);}
  }catch(error){pending.className='coach-msg err';pending.textContent=`AI chưa trả lời được: ${error.message}`;agent.chat.pop();}
  finally{agent.busy=false;['aiDrawerSend','coachSendBtn'].forEach(id=>{const b=$(id);if(b)b.disabled=false;});}
}

/* ---- Góp ý về app ---- */
async function submitAppFeedback(event){
  event.preventDefault();
  const stars=Number(document.querySelector('input[name="afStars"]:checked')?.value||0),st=$('afStatus');
  if(!stars){st.textContent='Hãy chọn số sao cho AIRUN.';st.className='fb-status err';return;}
  const btn=$('afSubmit');setBusy(btn,true,'Đang gửi…');
  try{
    const res=await fetch('/api/app-feedback',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({stars,easy:Number($('afEasy').value),useful:Number($('afUseful').value),liked:$('afLiked').value,text:$('afText').value.trim(),tab:currentView})});
    const data=await res.json();
    if(!res.ok||!data.ok){st.textContent=data.reason||'Chưa gửi được.';st.className='fb-status err';return;}
    st.textContent=data.stored?'✓ Cảm ơn bạn! Góp ý đã được lưu vào bảng tổng hợp của nhóm.':'✓ Cảm ơn bạn! (Máy chủ chưa kết nối Google Sheet nên góp ý chưa được lưu lâu dài.)';st.className='fb-status ok';
    $('appFeedbackForm').reset();$('afEasyOut').textContent='4';$('afUsefulOut').textContent='4';
  }catch(error){st.textContent=`Chưa gửi được: ${error.message}`;st.className='fb-status err';}
  finally{setBusy(btn,false);}
}

function bindV9Events(){
  on('accountBtn','click',()=>openAccount('login'));on('profileLoginBtn','click',()=>openAccount('login'));on('logoutBtn','click',()=>logout());
  on('accountClose','click',closeAccount);on('accountForm','submit',e=>void submitAccount(e));
  document.querySelectorAll('[data-acc-tab]').forEach(b=>b.addEventListener('click',()=>setAccMode(b.dataset.accTab)));
  const dlg=$('accountDialog');if(dlg)dlg.addEventListener('click',e=>{if(e.target===dlg)closeAccount();});
  on('aiFab','click',()=>{const d=$('aiDrawer');if(d&&!d.hidden)closeAiDrawer();else openAiDrawer();});on('aiDrawerClose','click',closeAiDrawer);
  on('aiDrawerForm','submit',e=>{e.preventDefault();void sendAgent($('aiDrawerInput').value,{box:'drawer'});});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('aiDrawer')?.hidden)closeAiDrawer();});
  on('aiRouteBtn','click',()=>void aiPlanRoute($('aiRouteText').value));
  document.querySelectorAll('[data-ai-route]').forEach(b=>b.addEventListener('click',()=>{$('aiRouteText').value=b.dataset.aiRoute;void aiPlanRoute(b.dataset.aiRoute);}));
  on('originSearch','input',e=>{clearTimeout(originTimer);const q=e.target.value.trim();if(q.length<3){$('originResults').hidden=true;return;}originTimer=setTimeout(()=>void searchOrigin(q),600);});
  on('originSearch','keydown',e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(originTimer);const q=e.target.value.trim();if(q.length>=2)void searchOrigin(q);}});
  on('originGpsBtn','click',()=>{routePlanner.customStart=null;$('originResetBtn').hidden=true;runAsyncTask('GPS',()=>useGPS({scroll:false}));});
  on('originPickBtn','click',startPickOnMap);on('pickCancelBtn','click',()=>{routePlanner.picking=false;$('pickHint').hidden=true;});
  on('originResetBtn','click',clearCustomStart);
  on('gpsBtn','click',()=>{if(routePlanner.customStart){routePlanner.customStart=null;$('originResetBtn').hidden=true;}});
  on('weeklyBtn','click',()=>void aiWeekly());
  on('appFeedbackForm','submit',e=>void submitAppFeedback(e));
  [['afEasy','afEasyOut'],['afUseful','afUsefulOut']].forEach(([i,o])=>on(i,'input',()=>{$(o).textContent=$(i).value;}));
  syncAccountUi();renderProfile();
}

let airunInitialized=false;
async function init(){
  if(airunInitialized)return;airunInitialized=true;
  if(await clearLegacyServiceWorkerControl()) return;
  if(typeof window!=='undefined')window.__AIRUN_APP_READY='v96';
  setSystemStatus('js','ok','V9.6 · HLV online, cộng đồng');
  safeCall('khu vực',()=>{$('area').innerHTML=WARDS.map(item=>`<option value="${item.key}">${escapeHTML(item.name)}</option>`).join('');});
  safeCall('khôi phục cài đặt',restorePlanSettings);
  safeCall('chọn khu vực',()=>{$('area').value=selectedKey;});
  safeCall('danh sách khu vực',renderWardControls);
  safeCall('bản đồ bên',updateMapSide);
  safeCall('nhật ký',renderJournal);
  safeCall('pace',calculatePace);
  safeCall('ước tính kế hoạch',updatePlanEstimate);
  safeCall('cung chạy',()=>{syncRoutePlanCard();syncRouteOrigin();});
  safeCall('trạng thái mạng',updateConnection);
  safeCall('nút bấm',bindEvents);
  safeCall('hộp thoại',initDialogs);
  safeCall('PWA',initPWA);
  safeCall('tracker',updateTrackerMetrics);
  safeCall('AI Coach',bindCoachEvents);
  safeCall('V9 tài khoản · AI mọi tab',bindV9Events);
  safeCall('tab',initTabs);
  loadServerConfig().catch(()=>{});

  const lastGps=localGet('airun-v54-last-gps',null);
  if(lastGps&&Date.now()-Number(lastGps.at||0)<60*60*1000)setSystemStatus('gps','warn',`Gần nhất ±${round(lastGps.accuracy||0)} m`);
  else setSystemStatus('gps','idle','Chưa yêu cầu');

  // Không bao giờ để dashboard trống: số dự phòng xuất hiện ngay trước khi gọi mạng.
  safeCall('dữ liệu tức thời',()=>renderEnvironmentInstant(quickEnvironmentForWard(selectedKey),{updating:true}));

  // Bản đồ, API và GPS là các luồng độc lập; một luồng lỗi không làm chết nút bấm.
  loadLeaflet().then(initMaps).catch(error=>{console.warn('AIRUN map init:',error);const fallback=$('mapFallback');if(fallback)fallback.hidden=false;});
  selectWard(selectedKey,{analyze:true,force:true}).catch(error=>{console.warn('AIRUN initial live update:',error);setApiUpdateText('API chưa phản hồi · đang dùng dữ liệu dự phòng');});
}

if(hasDom()){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else void init();
}

if(typeof module!=='undefined'&&module.exports){module.exports={WARDS,aqiInfo,uvInfo,analyzeSnapshot,fallbackData,haversine,weatherText,escapeHTML,clamp,round,formatPace,formatDuration,gpsLevel,parsePace,planEstimate,defaultPaceForIntensity,fetchEnvironmentAt};}

