const express = require('express');
const app = express();

// Route cho trang chủ
app.get('/', (req, res) => {
  res.send('Hello! This is your Glitch-powered web server!');
});

// Route trả về dữ liệu JSON
app.get('/data', (req, res) => {
  res.json({ status: 'success', message: 'Here is your data from Glitch!' });
});

// Lắng nghe trên cổng mặc định của Glitch
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});