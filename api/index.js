// Vercel Serverless Function: dùng chung bộ xử lý với server.js (Render/Node).
const { handler } = require('../server.js');
module.exports = (req, res) => handler(req, res);
