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
app.use(cors())

// 1) โหลดทุก routes ยกเว้น promptpay.js แบบ prefix /api
readdirSync(path.join(__dirname, 'routes'))
  .filter((f) => f !== 'promptpay.js')         // <<— กรอง promptpay ออก
  .forEach((f) => app.use('/api', require('./routes/' + f)))

// 2) โหลด promptpay.js แยกด้วย prefix /api/promptpay
app.use('/api/promptpay', require('./routes/promptpay'))

// start
app.listen(5001, () => console.log('Server is running on port 5001'))
