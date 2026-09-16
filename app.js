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
  {key:'TamKy',name:'Tam Kỳ',lat:15.5686,lon:108.4835,desc:'Trung tâm phía nam thành phố mới, có nhiều tuyến đô thị bằng phẳng.',mock:[55,15,29,33,77,9]},
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

const STORAGE = {plan:'airun-v40-plan',journal:'airun-v40-journal',cache:'airun-v40-live-cache'};
const memoryCache = new Map();
const markers = new Map();
let map = null;
let selectedKey = 'HaiChau';
let intensity = 'Nhẹ';
let activeData = null;
let activeSnapshot = null;
let activeResult = null;
let selectedDecision = '';
let toastTimer = null;
let installPrompt = null;

function ward(key = selectedKey){ return WARDS.find(item => item.key === key) || WARDS[0]; }
function safeJSON(raw, fallback){ try{return JSON.parse(raw)}catch{return fallback} }
function localGet(key, fallback){ try{return safeJSON(localStorage.getItem(key), fallback)}catch{return fallback} }
function localSet(key, value){ try{localStorage.setItem(key, JSON.stringify(value));return true}catch{return false} }

function showToast(message){
  const node = $('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 3200);
}

function setBusy(button, busy, busyText = 'Đang tải…'){
  if(!button) return;
  if(busy){button.dataset.label = button.textContent;button.textContent = busyText;button.disabled = true}
  else{button.textContent = button.dataset.label || button.textContent;button.disabled = false}
}

function updateConnection(){
  const online = navigator.onLine;
  $('connectionText').textContent = online ? 'Đang trực tuyến · sẵn sàng lấy dữ liệu mới' : 'Đang ngoại tuyến · dùng dữ liệu dự phòng';
  document.querySelector('.pulse')?.classList.toggle('offline', !online);
}

function fallbackData(item){
  const [aqi,pm,temp,feels,humidity,wind] = item.mock;
  const now = new Date();
  const hourly = [];
  for(let i=0;i<36;i++){
    const date = new Date(now.getTime() + i*3600000);
    const hour = Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',hourCycle:'h23'}).format(date));
    const cool = hour < 8 || hour >= 18 ? -2 : hour >= 11 && hour <= 15 ? 2 : 0;
    const aqiShift = hour >= 7 && hour <= 9 || hour >= 16 && hour <= 19 ? 8 : -3;
    hourly.push({time:vnIso(date),temp:temp+cool,feels:feels+cool,rain:hour===15?35:12,wind:wind+(hour>=14?3:0),code:hour===15?2:1,aqi:Math.max(18,aqi+aqiShift),pm:Math.max(5,pm+aqiShift*.18)});
  }
  return {key:item.key,source:'fallback',updated:Date.now(),current:{temp,feels,humidity,wind,rain:12,code:1,aqi,pm,pm10:round(pm*1.55,1)},hourly};
}

function vnIso(date = new Date()){
  const parts = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date);
  return parts.replace(' ','T');
}

function getPersistentCache(key){
  const all = localGet(STORAGE.cache, {});
  const row = all[key];
  return row && Date.now()-row.updated < 30*60*1000 ? row : null;
}

function savePersistentCache(data){
  const all = localGet(STORAGE.cache, {});
  all[data.key] = data;
  const trimmed = Object.fromEntries(Object.entries(all).sort((a,b)=>b[1].updated-a[1].updated).slice(0,8));
  localSet(STORAGE.cache, trimmed);
}

async function fetchJSON(url, timeout = 10000){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try{
    const response = await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }finally{clearTimeout(timer)}
}

async function fetchEnvironment(key, force = false){
  const item = ward(key);
  const cached = memoryCache.get(key);
  if(!force && cached && Date.now()-cached.updated < 10*60*1000) return cached;
  const stored = !force && getPersistentCache(key);
  if(stored){memoryCache.set(key,stored);return stored}
  if(!navigator.onLine) return fallbackData(item);

  const point = `latitude=${item.lat}&longitude=${item.lon}&timezone=Asia%2FBangkok&forecast_days=2`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${point}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${point}&current=us_aqi,pm2_5,pm10&hourly=us_aqi,pm2_5`;
  try{
    const [weatherData,airData] = await Promise.all([fetchJSON(weatherUrl),fetchJSON(airUrl)]);
    const weather = weatherData.current || {};
    const air = airData.current || {};
    const airByTime = new Map((airData.hourly?.time || []).map((time,index)=>[time,{aqi:airData.hourly.us_aqi?.[index],pm:airData.hourly.pm2_5?.[index]}]));
    const hourly = (weatherData.hourly?.time || []).map((time,index)=>({
      time,
      temp:weatherData.hourly.temperature_2m?.[index],
      feels:weatherData.hourly.apparent_temperature?.[index],
      rain:weatherData.hourly.precipitation_probability?.[index],
      wind:weatherData.hourly.wind_speed_10m?.[index],
      code:weatherData.hourly.weather_code?.[index],
      aqi:airByTime.get(time)?.aqi,
      pm:airByTime.get(time)?.pm
    }));
    const result = {key,source:'live',updated:Date.now(),current:{
      temp:weather.temperature_2m,feels:weather.apparent_temperature,humidity:weather.relative_humidity_2m,
      wind:weather.wind_speed_10m,rain:weather.precipitation > 0 ? 100 : 0,code:weather.weather_code,
      aqi:air.us_aqi,pm:air.pm2_5,pm10:air.pm10
    },hourly};
    if(!Number.isFinite(result.current.temp) || !Number.isFinite(result.current.aqi)) throw new Error('Dữ liệu thiếu');
    memoryCache.set(key,result);savePersistentCache(result);return result;
  }catch(error){
    console.warn('AIRUN live data unavailable:',error.message);
    const last = getPersistentCache(key);
    return last ? {...last,source:'cached'} : fallbackData(item);
  }
}

function targetIso(timeValue){
  const now = vnIso();
  const date = now.slice(0,10);
  const hour = String(Number((timeValue || '17:30').slice(0,2))).padStart(2,'0');
  let target = `${date}T${hour}:00`;
  if(target < now.slice(0,13)+':00'){
    const tomorrow = new Date(Date.now()+86400000);
    target = `${vnIso(tomorrow).slice(0,10)}T${hour}:00`;
  }
  return target;
}

function snapshotFor(data, timeValue){
  const target = targetIso(timeValue);
  const row = data.hourly?.find(item=>item.time === target);
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

function analyzeSnapshot(snapshot, plan){
  let score = 10;
  const reasons = [];
  const aqi = Number(snapshot.aqi ?? 0), pm = Number(snapshot.pm ?? 0), feels = Number(snapshot.feels ?? snapshot.temp ?? 25);
  const wind = Number(snapshot.wind ?? 0), rain = Number(snapshot.rain ?? 0);

  if(aqi <= 50) reasons.push(`AQI Mỹ ${round(aqi)} ở mức tốt, ít gây cản trở cho hoạt động ngoài trời.`);
  else if(aqi <= 100){score -= (aqi-50)/28;reasons.push(`AQI Mỹ ${round(aqi)} ở mức trung bình; nên giảm nhịp nếu cảm thấy khó chịu.`)}
  else if(aqi <= 150){score -= 3+(aqi-100)/35;reasons.push(`AQI Mỹ ${round(aqi)} không thuận lợi cho nhóm nhạy cảm.`)}
  else{score -= 6+Math.min(2,(aqi-150)/50);reasons.push(`AQI Mỹ ${round(aqi)} ở mức có hại; hoạt động ngoài trời cường độ cao không phù hợp.`)}

  if(pm > 35.5){score -= 1.5;reasons.push(`PM2.5 ${round(pm,1)} µg/m³ khá cao, nên cân nhắc đổi giờ hoặc chạy trong nhà.`)}
  else if(pm > 9){score -= Math.min(1,(pm-9)/30);reasons.push(`PM2.5 ${round(pm,1)} µg/m³ cần được theo dõi, nhất là khi chạy lâu.`)}
  else reasons.push(`PM2.5 ${round(pm,1)} µg/m³ đang ở mức thấp trong dữ liệu dự báo.`);

  if(feels > 34){score -= 2.2+(feels-34)*.18;reasons.push(`Nhiệt độ cảm nhận ${round(feels)}°C làm tăng nguy cơ quá nóng và mất nước.`)}
  else if(feels > 30){score -= (feels-30)*.32;reasons.push(`Cảm giác ${round(feels)}°C khá nóng; nên giảm cường độ và mang thêm nước.`)}
  else if(feels < 14){score -= Math.min(1.5,(14-feels)*.15);reasons.push(`Cảm giác ${round(feels)}°C khá mát; cần khởi động kỹ.`)}
  else reasons.push(`Nhiệt độ cảm nhận ${round(feels)}°C tương đối phù hợp cho vận động.`);

  if(rain >= 70){score -= 2.4;reasons.push(`Khả năng mưa ${round(rain)}%; nên có phương án trong nhà hoặc hoãn chạy.`)}
  else if(rain >= 40){score -= 1;reasons.push(`Khả năng mưa ${round(rain)}%; nên kiểm tra bầu trời trước khi xuất phát.`)}
  if(wind >= 35){score -= 1.8;reasons.push(`Gió khoảng ${round(wind)} km/h có thể làm buổi chạy kém an toàn.`)}
  else if(wind >= 22){score -= .7;reasons.push(`Gió khoảng ${round(wind)} km/h; lưu ý khi chạy ở cầu hoặc ven biển.`)}

  if(plan.intensity === 'Cao'){
    if(aqi > 50){score -= 1;reasons.push('Cường độ cao làm lượng không khí hít vào tăng, nên tiêu chuẩn không khí phải nghiêm ngặt hơn.')}
    if(feels > 29) score -= .7;
  }else if(plan.intensity === 'Vừa' && (aqi > 100 || feels > 32)) score -= .45;
  if(plan.duration >= 60 && feels > 30){score -= .7;reasons.push(`Thời lượng ${plan.duration} phút trong điều kiện nóng cần bổ sung nước và nghỉ hợp lý.`)}
  if(plan.sensitive && aqi > 50){score -= aqi > 100 ? 2.2 : 1;reasons.push('Bạn đã chọn nhóm nhạy cảm nên AIRUN áp dụng ngưỡng thận trọng hơn.')}

  score = round(clamp(score,0,10),1);
  let tone='good',title='Nên chạy',text='Điều kiện khá thuận lợi. Hãy khởi động và quan sát thực tế trước khi xuất phát.',icon='✓';
  if(score < 5 || aqi > 150){tone='bad';title='Nên đổi kế hoạch';text='Ưu tiên chạy trong nhà, đổi giờ hoặc chọn ngày khác để giảm rủi ro.';icon='!'}
  else if(score < 7.5){tone='caution';title='Nên điều chỉnh';text='Bạn vẫn có thể cân nhắc chạy nhẹ hơn, ngắn hơn hoặc chuyển sang khung giờ tốt hơn.';icon='◷'}
  return {score,tone,title,text,icon,reasons:reasons.slice(0,5)};
}

function currentPlan(){
  return {key:selectedKey,time:$('time').value,duration:Number($('duration').value),intensity,sensitive:$('sensitive').checked};
}

function bestTimeFor(data, plan){
  const candidates = (data.hourly || []).filter(row=>{
    const hour=Number(row.time.slice(11,13));return (hour>=5&&hour<=9)||(hour>=16&&hour<=21);
  }).slice(0,20);
  if(!candidates.length) return null;
  return candidates.map(row=>({row,result:analyzeSnapshot({...data.current,...row},plan)})).sort((a,b)=>b.result.score-a.result.score)[0];
}

function weatherText(code){ return WEATHER_TEXT[code] || ['Thời tiết thay đổi','◌']; }
function sourceLabel(source){ return source==='live'?'Dữ liệu trực tiếp':source==='cached'?'Dữ liệu đã lưu gần đây':'Dữ liệu dự phòng'; }

function renderHero(data){
  const current=data.current,item=ward(data.key),weather=weatherText(current.code);
  $('heroArea').textContent=item.name;$('heroTemp').textContent=round(current.temp);$('heroWeather').textContent=weather[0];$('weatherSymbol').textContent=weather[1];
  $('heroAqi').textContent=round(current.aqi);$('heroPm').textContent=round(current.pm,1);$('heroWind').textContent=round(current.wind,1);
  $('heroUpdated').textContent=new Date(data.updated).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  $('liveBadge').textContent=sourceLabel(data.source).toUpperCase();$('liveBadge').className='source-badge'+(data.source==='live'?'':' fallback');
}

function renderResult(data, snapshot, result){
  const info=aqiInfo(snapshot.aqi),best=bestTimeFor(data,currentPlan());
  $('resultSource').textContent=`${sourceLabel(data.source)} · ${ward(data.key).name} · ${snapshot.time?.slice(11,16)||'hiện tại'}`;
  $('resultStatusPill').textContent=result.title;$('resultStatusPill').className=`result-pill ${result.tone}`;
  $('decisionPanel').className=`decision-panel ${result.tone}`;$('decisionIcon').textContent=result.icon;$('decisionTitle').textContent=result.title;$('decisionText').textContent=result.text;
  $('scoreValue').textContent=result.score;$('scoreRing').style.setProperty('--score',`${result.score*10}%`);
  $('metricAqi').textContent=round(snapshot.aqi);$('metricAqiLabel').textContent=info.label;$('metricPm').textContent=round(snapshot.pm,1);
  $('metricTemp').textContent=`${round(snapshot.temp)}°`;$('metricFeels').textContent=`Cảm giác ${round(snapshot.feels)}°`;$('metricWind').textContent=round(snapshot.wind,1);
  $('metricRain').textContent=`${round(snapshot.rain)}%`;$('metricHumidity').textContent=`Độ ẩm ${round(snapshot.humidity)}%`;
  $('reasonList').innerHTML=result.reasons.map(reason=>`<li>${escapeHTML(reason)}</li>`).join('');
  if(best){$('bestTime').textContent=`${best.row.time.slice(11,16)} · ${best.result.score}/10`;$('bestTimeReason').textContent=`Trong các khung giờ chạy phổ biến, đây là lựa chọn có điểm thuận lợi cao nhất trong dữ liệu hiện có.`}
  else{$('bestTime').textContent='Chưa có dự báo giờ';$('bestTimeReason').textContent='Hãy thử cập nhật lại dữ liệu.'}
  $('mapAreaAqi').textContent=`AQI ${round(snapshot.aqi)}`;$('mapAreaTemp').textContent=`${round(snapshot.temp)}°C`;$('mapAreaScore').textContent=`${result.score}/10`;
  renderKit(snapshot,currentPlan());
}

function renderKit(snapshot, plan){
  const items=['Giày chạy và trang phục thoáng','Điện thoại đủ pin hoặc thẻ liên hệ khẩn cấp'];
  const water=Math.max(250,Math.round((plan.duration*(snapshot.feels>31?10:7))/50)*50);
  items.push(`Khoảng ${water} ml nước cho kế hoạch ${plan.duration} phút`);
  if(snapshot.rain>=40) items.push('Áo mưa mỏng hoặc phương án chạy trong nhà');
  if(snapshot.feels>=31) items.push('Mũ, kem chống nắng và khăn thấm mồ hôi');
  if(snapshot.aqi>100) items.push('Ưu tiên đổi giờ; khẩu trang không phù hợp khi đang chạy cường độ cao');
  if(Number(plan.time.slice(0,2))>=18||Number(plan.time.slice(0,2))<6) items.push('Phụ kiện phản quang hoặc đèn nhỏ');
  $('kitList').innerHTML=items.map(item=>`<li>${escapeHTML(item)}</li>`).join('');
}

function updateMapSide(){
  const item=ward();$('mapAreaName').textContent=item.name;$('mapAreaDescription').textContent=item.desc;
  $('openOsm').href=`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=14/${item.lat}/${item.lon}`;
  document.querySelectorAll('[data-ward]').forEach(button=>button.classList.toggle('active',button.dataset.ward===selectedKey));
  markers.forEach((marker,key)=>{const icon=marker.getElement();if(icon)icon.classList.toggle('selected',key===selectedKey)});
}

async function selectWard(key,{scroll=false,force=false,analyze=true}={}){
  selectedKey=ward(key).key;$('area').value=selectedKey;savePlanSettings();updateMapSide();
  if(map){const item=ward();map.flyTo([item.lat,item.lon],Math.max(map.getZoom(),11),{duration:.7});markers.get(selectedKey)?.openPopup()}
  $('heroArea').textContent=ward().name;$('liveBadge').textContent='ĐANG TẢI DỮ LIỆU';$('liveBadge').className='source-badge loading';
  const data=await fetchEnvironment(selectedKey,force);activeData=data;renderHero(data);
  if(analyze) await analyzePlan(false);
  if(scroll) $('planner').scrollIntoView({behavior:'smooth'});
}

async function analyzePlan(showLoading=true){
  const button=$('analyzeBtn');if(showLoading)setBusy(button,true,'Đang phân tích…');
  try{
    const plan=currentPlan(),data=activeData?.key===selectedKey?activeData:await fetchEnvironment(selectedKey);
    const snapshot=snapshotFor(data,plan.time),result=analyzeSnapshot(snapshot,plan);
    activeData=data;activeSnapshot=snapshot;activeResult=result;renderHero(data);renderResult(data,snapshot,result);savePlanSettings();
    if(showLoading)showToast(`${result.title} · điểm thuận lợi ${result.score}/10`);
  }catch{showToast('Chưa thể phân tích. Hãy thử lại sau.')}
  finally{if(showLoading)setBusy(button,false)}
}

function savePlanSettings(){localSet(STORAGE.plan,{key:selectedKey,time:$('time').value,duration:$('duration').value,intensity,sensitive:$('sensitive').checked})}
function restorePlanSettings(){
  const plan=localGet(STORAGE.plan,{});if(plan.key&&ward(plan.key))selectedKey=plan.key;if(plan.time)$('time').value=plan.time;if(plan.duration)$('duration').value=String(plan.duration);
  if(['Nhẹ','Vừa','Cao'].includes(plan.intensity))intensity=plan.intensity;$('sensitive').checked=Boolean(plan.sensitive);
  document.querySelectorAll('[data-intensity]').forEach(button=>button.classList.toggle('active',button.dataset.intensity===intensity));
}

function renderWardControls(filter=''){
  const normalized=filter.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const items=WARDS.filter(item=>item.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(normalized));
  $('wardList').innerHTML=items.map(item=>`<button type="button" data-ward="${item.key}" class="${item.key===selectedKey?'active':''}">${escapeHTML(item.name)}</button>`).join('')||'<div class="empty-state">Không tìm thấy.</div>';
  $('wardList').querySelectorAll('[data-ward]').forEach(button=>button.addEventListener('click',()=>selectWard(button.dataset.ward,{analyze:true})));
}

function initMap(){
  if(!window.L){$('mapFallback').hidden=false;return}
  try{
    map=L.map('map',{scrollWheelZoom:false,zoomControl:true}).setView([15.95,108.25],9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    WARDS.forEach(item=>{
      const icon=L.divIcon({className:`airun-marker ${item.key===selectedKey?'selected':''}`,html:'<span></span>',iconSize:[29,29],iconAnchor:[14,14]});
      const marker=L.marker([item.lat,item.lon],{icon,title:item.name}).addTo(map).bindPopup(`<b>${escapeHTML(item.name)}</b><br>${escapeHTML(item.desc)}`);
      marker.on('click',()=>selectWard(item.key,{analyze:true}));markers.set(item.key,marker);
    });
  }catch{$('mapFallback').hidden=false}
}

function loadLeaflet(){
  if(window.L) return Promise.resolve();
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';css.crossOrigin='anonymous';document.head.append(css);
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script'),timer=setTimeout(()=>reject(new Error('Leaflet timeout')),8000);
    script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.crossOrigin='anonymous';script.async=true;
    script.onload=()=>{clearTimeout(timer);resolve()};script.onerror=()=>{clearTimeout(timer);reject(new Error('Leaflet unavailable'))};document.head.append(script);
  });
}

function haversine(lat1,lon1,lat2,lon2){
  const rad=value=>value*Math.PI/180,dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function useGPS(){
  if(!navigator.geolocation){showToast('Trình duyệt này không hỗ trợ GPS.');return}
  showToast('Đang xin vị trí từ thiết bị…');
  navigator.geolocation.getCurrentPosition(position=>{
    const {latitude,longitude}=position.coords;
    const nearest=[...WARDS].sort((a,b)=>haversine(latitude,longitude,a.lat,a.lon)-haversine(latitude,longitude,b.lat,b.lon))[0];
    selectWard(nearest.key,{scroll:true,analyze:true});showToast(`Khu vực gần nhất trong danh sách: ${nearest.name}.`);
    if(map)L.circleMarker([latitude,longitude],{radius:8,color:'#3676df',fillColor:'#fff',fillOpacity:1,weight:4}).addTo(map).bindPopup('Vị trí gần đúng của bạn').openPopup();
  },error=>showToast(error.code===1?'Bạn chưa cấp quyền vị trí.':'Chưa lấy được GPS. Hãy thử lại ngoài trời.'),{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
}

async function compareAreas(){
  const button=$('compareBtn');setBusy(button,true,'Đang so sánh…');
  $('compareGrid').innerHTML='<div class="empty-state">Đang tải dữ liệu cho 5 khu vực…</div>';
  const keys=[selectedKey,'SonTra','NguHanhSon','HoaXuan','HoiAn'].filter((key,index,array)=>array.indexOf(key)===index).slice(0,5);
  while(keys.length<5){const extra=WARDS.find(item=>!keys.includes(item.key));keys.push(extra.key)}
  try{
    const plan=currentPlan();
    const rows=await Promise.all(keys.map(async key=>{const data=await fetchEnvironment(key);const snap=data.current;return {key,data,snap,result:analyzeSnapshot(snap,plan)}}));
    rows.sort((a,b)=>b.result.score-a.result.score);
    $('compareGrid').innerHTML=rows.map((row,index)=>`<article class="compare-card ${index===0?'best':''}"><span class="compare-rank">${index===0?'GỢI Ý TỐT NHẤT':`XẾP HẠNG ${index+1}`}</span><h3>${escapeHTML(ward(row.key).name)}</h3><div class="compare-score"><strong>${row.result.score}</strong><span>/10 thuận lợi</span></div><div class="compare-stats"><span>AQI ${round(row.snap.aqi)}</span><span>${round(row.snap.temp)}°C</span><span>PM2.5 ${round(row.snap.pm,1)}</span><span>Gió ${round(row.snap.wind)} km/h</span></div><button type="button" data-compare-key="${row.key}">Chọn khu vực này</button></article>`).join('');
    $('compareGrid').querySelectorAll('[data-compare-key]').forEach(node=>node.addEventListener('click',()=>selectWard(node.dataset.compareKey,{scroll:true,analyze:true})));
  }catch{$('compareGrid').innerHTML='<div class="empty-state">Chưa thể so sánh lúc này. Hãy kiểm tra mạng và thử lại.</div>'}
  finally{setBusy(button,false)}
}

function calculatePace(){
  const distance=Number($('paceDistance').value),minutes=Number($('paceMinutes').value);
  if(distance<=0||minutes<=0){$('paceResult').textContent='—';return}
  const pace=minutes/distance,whole=Math.floor(pace),seconds=Math.round((pace-whole)*60);
  $('paceResult').textContent=`${whole}:${String(seconds===60?0:seconds).padStart(2,'0')}`;
}

function journalRows(){return localGet(STORAGE.journal,[])}
function saveJournal(){
  if(!activeResult||!activeSnapshot){showToast('Hãy phân tích kế hoạch trước khi lưu.');return}
  if(!selectedDecision){showToast('Hãy chọn quyết định của bạn trước khi lưu.');return}
  const rows=journalRows(),plan=currentPlan();
  rows.unshift({id:Date.now(),at:new Date().toISOString(),area:ward().name,time:plan.time,duration:plan.duration,intensity:plan.intensity,sensitive:plan.sensitive,decision:selectedDecision,score:activeResult.score,aqi:round(activeSnapshot.aqi),temp:round(activeSnapshot.temp),note:$('note').value.trim(),source:activeData.source});
  localSet(STORAGE.journal,rows.slice(0,30));$('note').value='';renderJournal();showToast('Đã lưu kế hoạch vào nhật ký trên thiết bị.');
}

function renderJournal(){
  const rows=journalRows();
  $('journalList').innerHTML=rows.length?rows.map(row=>{const date=new Date(row.at);return `<article class="journal-item"><div class="journal-date"><b>${date.toLocaleDateString('vi-VN',{day:'2-digit'})}</b><span>${date.toLocaleDateString('vi-VN',{month:'2-digit',year:'numeric'})}</span></div><div class="journal-main"><b>${escapeHTML(row.area)} · ${escapeHTML(row.decision)}</b><p>${escapeHTML(row.time)} · ${row.duration} phút · ${escapeHTML(row.intensity)} · AQI ${row.aqi}${row.note?` · ${escapeHTML(row.note)}`:''}</p></div><div class="journal-score"><b>${row.score}/10</b><span>thuận lợi</span></div><button class="journal-delete" type="button" data-delete="${row.id}" aria-label="Xóa mục này">×</button></article>`}).join(''):'<div class="empty-state">Chưa có kế hoạch nào được lưu.</div>';
  $('journalList').querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>{localSet(STORAGE.journal,rows.filter(row=>row.id!==Number(button.dataset.delete)));renderJournal()}));
}

function csvCell(value){
  let text=String(value??'');if(/^[=+\-@]/.test(text))text=`'${text}`;return `"${text.replace(/"/g,'""')}"`;
}
function exportJournal(){
  const rows=journalRows();if(!rows.length){showToast('Nhật ký đang trống.');return}
  const header=['Thời điểm','Khu vực','Giờ chạy','Thời lượng','Cường độ','Quyết định','Điểm','AQI','Nhiệt độ','Nguồn dữ liệu','Ghi chú'];
  const lines=[header,...rows.map(row=>[new Date(row.at).toLocaleString('vi-VN'),row.area,row.time,row.duration,row.intensity,row.decision,row.score,row.aqi,row.temp,sourceLabel(row.source),row.note])].map(row=>row.map(csvCell).join(','));
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`AIRUN_Nhat_ky_${new Date().toISOString().slice(0,10)}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function initDialogs(){
  const dialog=$('dataDialog'),open=()=>dialog.showModal(),close=()=>dialog.close();
  $('dataInfoBtn').addEventListener('click',open);$('footerDataBtn').addEventListener('click',open);$('dialogClose').addEventListener('click',close);$('dialogOk').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
}

function initPWA(){
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;$('installBtn').hidden=false});
  $('installBtn').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').hidden=true});
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
}

function bindEvents(){
  $('planForm').addEventListener('submit',event=>{event.preventDefault();analyzePlan(true)});
  $('area').addEventListener('change',event=>selectWard(event.target.value,{analyze:true}));
  $('time').addEventListener('change',()=>analyzePlan(false));$('duration').addEventListener('change',()=>analyzePlan(false));$('sensitive').addEventListener('change',()=>analyzePlan(false));
  document.querySelectorAll('[data-intensity]').forEach(button=>button.addEventListener('click',()=>{intensity=button.dataset.intensity;document.querySelectorAll('[data-intensity]').forEach(node=>node.classList.toggle('active',node===button));analyzePlan(false)}));
  document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{selectedDecision=button.dataset.decision;document.querySelectorAll('[data-decision]').forEach(node=>node.classList.toggle('active',node===button));if(selectedDecision==='Đổi giờ')$('time').focus();if(selectedDecision==='Đổi khu vực')$('area').focus()}));
  $('refreshBtn').addEventListener('click',()=>selectWard(selectedKey,{force:true,analyze:true}));$('compareBtn').addEventListener('click',compareAreas);
  $('gpsBtn').addEventListener('click',useGPS);$('heroGps').addEventListener('click',useGPS);$('wardSearch').addEventListener('input',event=>renderWardControls(event.target.value));
  $('paceDistance').addEventListener('input',calculatePace);$('paceMinutes').addEventListener('input',calculatePace);$('savePlanBtn').addEventListener('click',saveJournal);$('exportBtn').addEventListener('click',exportJournal);
  $('clearJournalBtn').addEventListener('click',()=>{if(journalRows().length&&confirm('Xóa toàn bộ nhật ký trên thiết bị này?')){localSet(STORAGE.journal,[]);renderJournal();showToast('Đã xóa nhật ký.')}});
  $('menuBtn').addEventListener('click',()=>{const open=$('mainNav').classList.toggle('open');$('menuBtn').setAttribute('aria-expanded',String(open))});
  $('mainNav').querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{$('mainNav').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false')}));
  window.addEventListener('scroll',()=>$('backTop').classList.toggle('show',scrollY>600),{passive:true});$('backTop').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  window.addEventListener('online',()=>{updateConnection();showToast('Đã kết nối lại Internet.')});window.addEventListener('offline',()=>{updateConnection();showToast('Mất kết nối: AIRUN sẽ dùng dữ liệu dự phòng.')});
}

async function init(){
  $('area').innerHTML=WARDS.map(item=>`<option value="${item.key}">${escapeHTML(item.name)}</option>`).join('');
  restorePlanSettings();$('area').value=selectedKey;renderWardControls();updateMapSide();renderJournal();calculatePace();updateConnection();bindEvents();initDialogs();initPWA();
  loadLeaflet().then(initMap).catch(()=>{$('mapFallback').hidden=false});
  await selectWard(selectedKey,{analyze:true});
}

if(typeof document !== 'undefined') document.addEventListener('DOMContentLoaded',init);
if(typeof module !== 'undefined' && module.exports){
  module.exports={WARDS,aqiInfo,analyzeSnapshot,fallbackData,haversine,weatherText,escapeHTML,clamp,round};
}
