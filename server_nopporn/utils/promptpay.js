// server/utils/promptpay.js
const generatePayload = require("promptpay-qr");
const QRCode = require("qrcode");

async function createPromptPayQR({ promptpayId, amountTHB }) {
  const payload = generatePayload(promptpayId, { amount: amountTHB });
  const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: "H", margin: 1, scale: 6 });
  return { payload, dataUrl };
}

module.exports = { createPromptPayQR };
