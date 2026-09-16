'use strict';
const assert=require('node:assert/strict');
const {WARDS,aqiInfo,analyzeSnapshot,fallbackData,haversine,escapeHTML}=require('./app.js');

assert.equal(WARDS.length,23,'AIRUN phải có đủ 23 phường');
assert.equal(new Set(WARDS.map(x=>x.key)).size,23,'Mã phường không được trùng');
assert.equal(new Set(WARDS.map(x=>x.name)).size,23,'Tên phường không được trùng');
assert.ok(WARDS.every(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)),'Mỗi phường phải có tọa độ');

const plan={intensity:'Nhẹ',duration:30,sensitive:false};
const good={aqi:35,pm:7,temp:26,feels:27,wind:8,rain:10};
const bad={aqi:180,pm:70,temp:35,feels:40,wind:40,rain:85};
const goodResult=analyzeSnapshot(good,plan),badResult=analyzeSnapshot(bad,plan);
assert.ok(goodResult.score>=7.5,'Điều kiện tốt phải có điểm cao');
assert.ok(badResult.score<5,'Điều kiện xấu phải có điểm thấp');
assert.ok(analyzeSnapshot({...good,aqi:90},{...plan,sensitive:true}).score<analyzeSnapshot({...good,aqi:90},plan).score,'Nhóm nhạy cảm phải được chấm thận trọng hơn');
assert.equal(aqiInfo(50).label,'Tốt');
assert.equal(aqiInfo(151).tone,'bad');

const fallback=fallbackData(WARDS[0]);
assert.equal(fallback.source,'fallback');
assert.equal(fallback.hourly.length,36);
assert.ok(fallback.hourly.every(x=>Number.isFinite(x.aqi)&&Number.isFinite(x.temp)));
assert.ok(haversine(16.06,108.22,16.06,108.22)<.001);
assert.equal(escapeHTML('<script>'),'&lt;script&gt;');

console.log('AIRUN tests: OK');
