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
  plan:'airun-v50-plan', journal:'airun-v50-journal', cache:'airun-v50-live-cache', migrated:'airun-v50-migrated'
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

async function fetchJSON(url, timeout = 12000){
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout);
  try{
    const response = await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

function nearestWard(lat,lon){
  return [...WARDS].map(item=>({item,distance:haversine(lat,lon,item.lat,item.lon)})).sort((a,b)=>a.distance-b.distance)[0];
}

async function fetchEnvironmentAt(lat, lon, options = {}){
  const nearest = nearestWard(lat,lon);
  const key = options.key || nearest.item.key;
  const label = options.label || nearest.item.name;
  const cacheId = options.cacheId || `geo:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const force = Boolean(options.force);
  const location = {lat,lon,label,accuracy:options.accuracy ?? null,mode:options.mode || 'ward'};

  const mem = memoryCache.get(cacheId);
  if(!force && mem && Date.now()-mem.updated < 10*60*1000) return mem;
  const stored = !force && getPersistentCache(cacheId);
  if(stored){memoryCache.set(cacheId,stored);return stored;}
  if(typeof navigator !== 'undefined' && !navigator.onLine){
    const stale = getStaleCache(cacheId); return stale ? {...stale,source:'cached'} : fallbackData(nearest.item,location);
  }

  const point = `latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&timezone=Asia%2FHo_Chi_Minh&forecast_days=2`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${point}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${point}&current=us_aqi,pm2_5,pm10&hourly=us_aqi,pm2_5,pm10`;

  const [weatherSettled, airSettled] = await Promise.allSettled([fetchJSON(weatherUrl),fetchJSON(airUrl)]);
  if(weatherSettled.status==='rejected' && airSettled.status==='rejected'){
    console.warn('AIRUN APIs unavailable:',weatherSettled.reason?.message,airSettled.reason?.message);
    const stale = getStaleCache(cacheId); return stale ? {...stale,source:'cached'} : fallbackData(nearest.item,location);
  }

  const backup = getStaleCache(cacheId) || fallbackData(nearest.item,location);
  const hourlyMap = new Map((backup.hourly||[]).map(row=>[row.time,{...row}]));
  let current = {...backup.current};

  if(weatherSettled.status==='fulfilled'){
    const w = weatherSettled.value; const wc = w.current || {};
    const times = w.hourly?.time || [];
    times.forEach((time,index)=>{
      const old = hourlyMap.get(time) || {time};
      hourlyMap.set(time,{...old,time,temp:w.hourly.temperature_2m?.[index],feels:w.hourly.apparent_temperature?.[index],humidity:w.hourly.relative_humidity_2m?.[index],rain:w.hourly.precipitation_probability?.[index],wind:w.hourly.wind_speed_10m?.[index],uv:w.hourly.uv_index?.[index],code:w.hourly.weather_code?.[index]});
    });
    const currentHour = String(wc.time || vnIso()).slice(0,13)+':00';
    const currentHourly = hourlyMap.get(currentHour) || {};
    current = {...current,temp:wc.temperature_2m,feels:wc.apparent_temperature,humidity:wc.relative_humidity_2m,wind:wc.wind_speed_10m,code:wc.weather_code,rain:Number.isFinite(currentHourly.rain)?currentHourly.rain:(wc.precipitation>0?100:0),uv:Number.isFinite(currentHourly.uv)?currentHourly.uv:current.uv};
  }

  if(airSettled.status==='fulfilled'){
    const a = airSettled.value; const ac = a.current || {};
    const times = a.hourly?.time || [];
    times.forEach((time,index)=>{
      const old = hourlyMap.get(time) || {time};
      hourlyMap.set(time,{...old,time,aqi:a.hourly.us_aqi?.[index],pm:a.hourly.pm2_5?.[index],pm10:a.hourly.pm10?.[index]});
    });
    current = {...current,aqi:ac.us_aqi,pm:ac.pm2_5,pm10:ac.pm10};
  }

  const source = weatherSettled.status==='fulfilled' && airSettled.status==='fulfilled' ? 'live' : 'partial';
  const result = {cacheId,key,source,updated:Date.now(),location,current,hourly:[...hourlyMap.values()].sort((a,b)=>a.time.localeCompare(b.time))};
  if(!Number.isFinite(result.current.temp) || !Number.isFinite(result.current.aqi)) return fallbackData(nearest.item,location);
  memoryCache.set(cacheId,result); savePersistentCache(result); return result;
}

function fetchEnvironment(key, force = false){
  const item = ward(key);
  return fetchEnvironmentAt(item.lat,item.lon,{key:item.key,label:item.name,cacheId:`ward:${item.key}`,mode:'ward',force});
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

function currentPlan(){
  return {key:selectedKey,time:$('time').value,duration:Number($('duration').value),intensity,sensitive:$('sensitive').checked};
}

function bestTimeFor(data, plan){
  const candidates=(data.hourly||[]).filter(row=>{const hour=Number(row.time.slice(11,13));return (hour>=5&&hour<=9)||(hour>=16&&hour<=21);}).slice(0,24);
  if(!candidates.length) return null;
  return candidates.map(row=>({row,result:analyzeSnapshot({...data.current,...row},plan)})).sort((a,b)=>b.result.score-a.result.score)[0];
}

function weatherText(code){ return WEATHER_TEXT[code] || ['Thời tiết thay đổi','◌']; }
function sourceLabel(source){
  return source==='live'?'Dữ liệu trực tiếp':source==='partial'?'Dữ liệu trực tiếp một phần':source==='cached'?'Dữ liệu đã lưu gần đây':'Dữ liệu mô phỏng';
}

function renderHero(data){
  const current=data.current,weather=weatherText(current.code),label=data.location?.label||ward(data.key).name;
  $('heroArea').textContent=label;$('heroTemp').textContent=round(current.temp);$('heroWeather').textContent=weather[0];$('weatherSymbol').textContent=weather[1];
  $('heroAqi').textContent=round(current.aqi);$('heroPm').textContent=round(current.pm,1);$('heroWind').textContent=round(current.wind,1);$('heroUv').textContent=round(current.uv,1);
  $('heroUpdated').textContent=new Date(data.updated).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  $('liveBadge').textContent=sourceLabel(data.source).toUpperCase();$('liveBadge').className=`source-badge ${data.source==='live'?'':data.source}`;
  if(data.location?.mode==='gps') $('heroLocationNote').textContent=`GPS ±${round(data.location.accuracy||0)} m · dữ liệu được lấy theo tọa độ hiện tại của thiết bị.`;
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

async function getEnvironmentForActive(force=false){
  if(gpsLocation){
    return fetchEnvironmentAt(gpsLocation.lat,gpsLocation.lon,{key:selectedKey,label:gpsLocation.label,cacheId:gpsLocation.cacheId,accuracy:gpsLocation.accuracy,mode:'gps',force});
  }
  return fetchEnvironment(selectedKey,force);
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
  $('heroArea').textContent=ward().name;$('liveBadge').textContent='ĐANG TẢI DỮ LIỆU';$('liveBadge').className='source-badge loading';
  const data=await fetchEnvironment(selectedKey,force);activeData=data;renderHero(data);if(analyze)await analyzePlan(false);if(scroll)$('planner').scrollIntoView({behavior:'smooth'});
}

async function analyzePlan(showLoading=true){
  const button=$('analyzeBtn');if(showLoading)setBusy(button,true,'Đang phân tích…');
  try{
    const plan=currentPlan(); const data=await getEnvironmentForActive(false); const snapshot=snapshotFor(data,plan.time),result=analyzeSnapshot(snapshot,plan);
    activeData=data;activeSnapshot=snapshot;activeResult=result;renderHero(data);renderResult(data,snapshot,result);savePlanSettings();
    if(showLoading)showToast(`${result.title} · điểm thuận lợi ${result.score}/10`);
  }catch(error){console.warn(error);showToast('Chưa thể phân tích. Hãy thử cập nhật lại dữ liệu.');}
  finally{if(showLoading)setBusy(button,false);}
}

function savePlanSettings(){localSet(STORAGE.plan,{key:selectedKey,time:$('time').value,duration:$('duration').value,intensity,sensitive:$('sensitive').checked});}
function restorePlanSettings(){
  const plan=localGet(STORAGE.plan,localGet('airun-v40-plan',{}));
  if(plan.key&&WARDS.some(x=>x.key===plan.key))selectedKey=plan.key;if(plan.time)$('time').value=plan.time;if(plan.duration)$('duration').value=String(plan.duration);
  if(['Nhẹ','Vừa','Cao'].includes(plan.intensity))intensity=plan.intensity;$('sensitive').checked=Boolean(plan.sensitive);
  document.querySelectorAll('[data-intensity]').forEach(button=>button.classList.toggle('active',button.dataset.intensity===intensity));
}

function renderWardControls(filter=''){
  const normalized=filter.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const items=WARDS.filter(item=>item.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(normalized));
  $('wardList').innerHTML=items.map(item=>`<button type="button" data-ward="${item.key}" class="${item.key===selectedKey?'active':''}">${escapeHTML(item.name)}</button>`).join('')||'<div class="empty-state">Không tìm thấy.</div>';
  $('wardList').querySelectorAll('[data-ward]').forEach(button=>button.addEventListener('click',()=>selectWard(button.dataset.ward,{analyze:true})));
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

function requestGPSPosition(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error('unsupported'));return;}
    navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000,maximumAge:5000});
  });
}

function showUserMarker(lat,lon,accuracy){
  if(!map||!window.L)return;
  if(userLocationMarker)userLocationMarker.remove();
  userLocationMarker=L.circleMarker([lat,lon],{radius:8,color:'#3275dc',fillColor:'#fff',fillOpacity:1,weight:4}).addTo(map).bindPopup(`Vị trí GPS · ±${round(accuracy)} m`).openPopup();
  map.flyTo([lat,lon],14,{duration:.8});
}

async function useGPS({scroll=true}={}){
  if(!navigator.geolocation){showToast('Trình duyệt này không hỗ trợ GPS.');return null;}
  showToast('Đang lấy vị trí GPS chính xác…');
  try{
    const position=await requestGPSPosition();const {latitude,longitude,accuracy}=position.coords;const near=nearestWard(latitude,longitude);selectedKey=near.item.key;$('area').value=selectedKey;
    const close=near.distance<=25;const label=close?`${near.item.name} · GPS`:'Vị trí GPS hiện tại';
    gpsLocation={lat:latitude,lon:longitude,accuracy,label,cacheId:`gps:${latitude.toFixed(3)},${longitude.toFixed(3)}`};setGpsPlanUi();updateMapSide();showUserMarker(latitude,longitude,accuracy);
    $('liveBadge').textContent='ĐANG TẢI DỮ LIỆU';$('liveBadge').className='source-badge loading';
    const data=await fetchEnvironmentAt(latitude,longitude,{key:selectedKey,label,cacheId:gpsLocation.cacheId,accuracy,mode:'gps',force:true});activeData=data;renderHero(data);await analyzePlan(false);savePlanSettings();
    if(scroll)$('planner').scrollIntoView({behavior:'smooth'});showToast(`Đã dùng GPS ±${round(accuracy)} m để lấy dữ liệu.`);return position;
  }catch(error){
    const code=error?.code;showToast(code===1?'Bạn chưa cấp quyền vị trí cho AIRUN.':code===3?'GPS mất quá lâu để phản hồi. Hãy thử ngoài trời.':'Chưa lấy được vị trí GPS.');return null;
  }
}

async function compareAreas(){
  const button=$('compareBtn');setBusy(button,true,'Đang so sánh…');$('compareGrid').innerHTML='<div class="empty-state">Đang tải dữ liệu cho 5 khu vực…</div>';
  const keys=[selectedKey,'SonTra','NguHanhSon','HoaXuan','HoiAn'].filter((key,index,array)=>array.indexOf(key)===index).slice(0,5);while(keys.length<5){const extra=WARDS.find(item=>!keys.includes(item.key));keys.push(extra.key);}
  try{
    const plan=currentPlan();const rows=await Promise.all(keys.map(async key=>{const data=await fetchEnvironment(key);const snap=snapshotFor(data,plan.time);return {key,data,snap,result:analyzeSnapshot(snap,plan)};}));rows.sort((a,b)=>b.result.score-a.result.score);
    $('compareGrid').innerHTML=rows.map((row,index)=>`<article class="compare-card ${index===0?'best':''}"><span class="compare-rank">${index===0?'ĐIỂM CAO NHẤT TRONG 5 KHU VỰC':`VỊ TRÍ ${index+1}/5`}</span><h3>${escapeHTML(ward(row.key).name)}</h3><div class="compare-score"><strong>${row.result.score}</strong><span>/10 thuận lợi</span></div><div class="compare-stats"><span>AQI ${round(row.snap.aqi)}</span><span>${round(row.snap.temp)}°C</span><span>PM2.5 ${round(row.snap.pm,1)}</span><span>UV ${round(row.snap.uv,1)}</span></div><button type="button" data-compare-key="${row.key}">Chọn khu vực này</button></article>`).join('');
    $('compareGrid').querySelectorAll('[data-compare-key]').forEach(node=>node.addEventListener('click',()=>selectWard(node.dataset.compareKey,{scroll:true,analyze:true})));
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
  tracker.watchId=navigator.geolocation.watchPosition(handleTrackPosition,handleTrackError,{enableHighAccuracy:true,maximumAge:1000,timeout:15000});
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
  if(error.code===1){trackerAlert('bad','Không có quyền GPS.','Hãy cho phép vị trí trong trình duyệt rồi bắt đầu lại.','!');abortTracker();}
  else if(error.code===2)trackerAlert('caution','Chưa xác định được vị trí.','Di chuyển ra nơi thoáng hơn và giữ AIRUN đang mở.','⌖');
  else trackerAlert('caution','GPS phản hồi chậm.','AIRUN vẫn đang chờ vị trí mới.','◷');
}

function resetTrackerData(){
  tracker.startedAt=0;tracker.pausedMs=0;tracker.pauseStarted=0;tracker.distanceKm=0;tracker.points=[];tracker.lastPoint=null;tracker.speedSamples=[];tracker.currentSpeed=0;tracker.envLastAt=0;tracker.envPoint=null;tracker.lastEnvResult=null;resetRunMap();
  $('trackerLocation').textContent='Đang chờ GPS…';$('trackerAccuracy').textContent='Độ chính xác —';updateGpsBars(NaN);$('trackerAqi').textContent='—';$('trackerTemp').textContent='—';$('trackerWind').textContent='—';$('trackerAdvice').textContent='Chưa có';$('routePointCount').textContent='0';updateTrackerMetrics();
}

async function startRun(){
  if(!navigator.geolocation){showToast('Thiết bị/trình duyệt này không hỗ trợ GPS.');return;}
  resetTrackerData();tracker.startedAt=Date.now();trackerSetState('running');$('startRunBtn').disabled=true;$('pauseRunBtn').disabled=false;$('finishRunBtn').disabled=false;$('pauseRunBtn').textContent='Ⅱ Tạm dừng';
  trackerAlert('','Đang khóa GPS…','Hãy đứng nơi thoáng trong vài giây để AIRUN nhận điểm đầu tiên.','⌖');startTrackerWatch();tracker.timer=setInterval(updateTrackerMetrics,1000);requestWakeLock();
  showToast('AIRUN đã bắt đầu theo dõi GPS.');
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
  rows.unshift({id:Date.now(),type:'plan',at:new Date().toISOString(),area:label,time:plan.time,duration:plan.duration,intensity:plan.intensity,sensitive:plan.sensitive,decision:selectedDecision,score:activeResult.score,aqi:round(activeSnapshot.aqi),temp:round(activeSnapshot.temp),note:$('note').value.trim(),source:activeData.source});
  localSet(STORAGE.journal,rows.slice(0,50));$('note').value='';renderJournal();showToast('Đã lưu kế hoạch vào nhật ký trên thiết bị.');
}

function renderJournal(){
  const rows=journalRows();
  $('journalList').innerHTML=rows.length?rows.map(row=>{
    const date=new Date(row.at);const isRun=row.type==='run';
    const title=isRun?`🏃 Buổi chạy GPS · ${escapeHTML(row.area)}`:`${escapeHTML(row.area)} · ${escapeHTML(row.decision||'Kế hoạch')}`;
    const desc=isRun?`${row.distance??0} km · ${formatDuration(row.durationSec||0)}${row.pace?` · pace ${escapeHTML(row.pace)}/km`:''}`:`${escapeHTML(row.time||'')} · ${row.duration||0} phút · ${escapeHTML(row.intensity||'')} · AQI ${row.aqi??'—'}${row.note?` · ${escapeHTML(row.note)}`:''}`;
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
  const dialog=$('dataDialog'),open=()=>dialog.showModal(),close=()=>dialog.close();$('dataInfoBtn').addEventListener('click',open);$('footerDataBtn').addEventListener('click',open);$('dialogClose').addEventListener('click',close);$('dialogOk').addEventListener('click',close);dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
}

function initPWA(){
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;$('installBtn').hidden=false;});
  $('installBtn').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').hidden=true;});
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
}

function bindEvents(){
  $('planForm').addEventListener('submit',event=>{event.preventDefault();analyzePlan(true);});
  $('area').addEventListener('change',event=>selectWard(event.target.value,{analyze:true}));
  $('time').addEventListener('change',()=>analyzePlan(false));$('duration').addEventListener('change',()=>analyzePlan(false));$('sensitive').addEventListener('change',()=>analyzePlan(false));
  document.querySelectorAll('[data-intensity]').forEach(button=>button.addEventListener('click',()=>{intensity=button.dataset.intensity;document.querySelectorAll('[data-intensity]').forEach(node=>node.classList.toggle('active',node===button));analyzePlan(false);}));
  document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{selectedDecision=button.dataset.decision;document.querySelectorAll('[data-decision]').forEach(node=>node.classList.toggle('active',node===button));if(selectedDecision==='Đổi giờ')$('time').focus();if(selectedDecision==='Đổi khu vực')$('area').focus();}));
  $('refreshBtn').addEventListener('click',async()=>{setBusy($('refreshBtn'),true,'Đang cập nhật…');try{const data=await getEnvironmentForActive(true);activeData=data;renderHero(data);await analyzePlan(false);showToast('Đã cập nhật dữ liệu mới.');}finally{setBusy($('refreshBtn'),false);}});
  $('compareBtn').addEventListener('click',compareAreas);$('gpsBtn').addEventListener('click',()=>useGPS({scroll:false}));$('heroGps').addEventListener('click',()=>useGPS({scroll:false}));$('plannerGpsBtn').addEventListener('click',()=>useGPS({scroll:true}));
  $('clearGpsPlan').addEventListener('click',()=>selectWard(selectedKey,{analyze:true}));$('wardSearch').addEventListener('input',event=>renderWardControls(event.target.value));
  $('paceDistance').addEventListener('input',calculatePace);$('paceMinutes').addEventListener('input',calculatePace);$('savePlanBtn').addEventListener('click',saveJournal);$('exportBtn').addEventListener('click',exportJournal);
  $('clearJournalBtn').addEventListener('click',()=>{if(journalRows().length&&confirm('Xóa toàn bộ nhật ký trên thiết bị này?')){localSet(STORAGE.journal,[]);renderJournal();showToast('Đã xóa nhật ký.');}});
  $('startRunBtn').addEventListener('click',startRun);$('pauseRunBtn').addEventListener('click',pauseOrResumeRun);$('finishRunBtn').addEventListener('click',finishRun);
  $('menuBtn').addEventListener('click',()=>{const open=$('mainNav').classList.toggle('open');$('menuBtn').setAttribute('aria-expanded',String(open));});$('mainNav').querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{$('mainNav').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false');}));
  window.addEventListener('scroll',()=>$('backTop').classList.toggle('show',scrollY>600),{passive:true});$('backTop').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  window.addEventListener('online',()=>{updateConnection();showToast('Đã kết nối lại Internet.');});window.addEventListener('offline',()=>{updateConnection();showToast('Mất kết nối: GPS vẫn hoạt động, dữ liệu môi trường có thể dùng bản đã lưu.');});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&tracker.status==='running'&&!tracker.wakeLock)requestWakeLock();});
  window.addEventListener('beforeunload',event=>{if(tracker.status==='running'){event.preventDefault();event.returnValue='';}});
}

async function init(){
  $('area').innerHTML=WARDS.map(item=>`<option value="${item.key}">${escapeHTML(item.name)}</option>`).join('');restorePlanSettings();$('area').value=selectedKey;renderWardControls();updateMapSide();renderJournal();calculatePace();updateConnection();bindEvents();initDialogs();initPWA();updateTrackerMetrics();
  loadLeaflet().then(initMaps).catch(()=>{$('mapFallback').hidden=false;});
  await selectWard(selectedKey,{analyze:true});
}

if(hasDom())document.addEventListener('DOMContentLoaded',init);
if(typeof module!=='undefined'&&module.exports){module.exports={WARDS,aqiInfo,uvInfo,analyzeSnapshot,fallbackData,haversine,weatherText,escapeHTML,clamp,round,formatPace,formatDuration,gpsLevel};}
