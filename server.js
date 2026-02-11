const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 獎項設定
let prizes = [
  { name: "A", total: 3, remaining: 3 },
  { name: "B", total: 20, remaining: 20 },
  { name: "C", total: 35, remaining: 35 },
  { name: "D", total: 42, remaining: 42 }
];

// 抽獎紀錄
let history = [];

// 驗證碼管理
let codes = {}; // {code: {used: false, records: []}}

// 生成新驗證碼
function generateCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (codes[code]);
  codes[code] = { used: false, records: [] };
  return code;
}

// 抽獎邏輯
function drawPrize() {
  const totalRemaining = prizes.reduce((sum, p) => sum + p.remaining, 0);
  if (totalRemaining <= 0) return null;

  const weighted = [];
  prizes.forEach(p => {
    const weight = (p.name === "A" || p.name === "B") ? 0.15 : 0.85;
    const count = Math.round(weight * totalRemaining);
    for (let i = 0; i < count && i < p.remaining; i++) {
      weighted.push(p.name);
    }
  });

  const prizeName = weighted[Math.floor(Math.random() * weighted.length)];
  const prize = prizes.find(p => p.name === prizeName);
  prize.remaining--;
  return prizeName;
}

// API: 生成新驗證碼
app.get('/api/newcode', (req, res) => {
  const code = generateCode();
  res.json({ code });
});

// API: 驗證驗證碼
app.post('/api/verify', (req, res) => {
  const { code } = req.body;
  if (codes[code] && !codes[code].used) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// API: 抽獎
app.post('/api/draw', (req, res) => {
  const { code } = req.body;
  if (!codes[code] || codes[code].used) return res.json({ success: false, msg: "驗證碼無效或已使用" });

  const prize = drawPrize();
  if (!prize) return res.json({ success: false, msg: "已無剩餘獎項" });

  codes[code].records.push(prize);
  history.push({ code, prize, timestamp: new Date() });
  res.json({ success: true, prize, remaining: prizes.map(p => ({name:p.name, remaining:p.remaining})) });
});

// API: 查歷史
app.get('/api/history', (req, res) => {
  res.json({ history, codes });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
