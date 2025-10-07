// server.js
const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')
const path = require('path')

// middleware
app.use(morgan('dev'))
app.use(express.json({ limit: '20mb' }))
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: false, // ใช้ Bearer เป็นหลัก; ถ้าเปลี่ยนไปใช้ cookie ค่อยสลับเป็น true
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))

// โหลด routes ยกเว้นไฟล์ที่ mount แยกเอง
const skip = new Set(['promptpay.js', 'adminPayment.js'])   // ✅ กันซ้ำ
readdirSync(path.join(__dirname, 'routes'))
  .filter((f) => !skip.has(f))
  .forEach((f) => app.use('/api', require('./routes/' + f)))

// mount กลุ่มที่ต้องการ base path พิเศษ
app.use('/api/promptpay', require('./routes/promptpay'))
app.use('/api/admin', require('./routes/adminPayment'))

app.listen(5001, () => console.log('Server is running on port 5001'))
