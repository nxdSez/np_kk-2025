// utils/promptpay.js
const generatePayload = require("promptpay-qr");

function validateTarget(target) {
  const cleaned = String(target || "").trim();
  if (!cleaned) {
    const e = new Error("Missing PromptPay target (set PROMPTPAY_PHONE or pass body.target)");
    e.status = 500;
    throw e;
  }
  // รองรับเบอร์ 10 / ปชช. 13 / e-Wallet 15
  if (!/^\d{10}$|^\d{13}$|^\d{15}$/.test(cleaned)) {
    const e = new Error("Invalid PromptPay target format");
    e.status = 400;
    throw e;
  }
  return cleaned;
}

function normalizeAmount(amount) {
  if (amount === undefined || amount === null || `${amount}`.trim() === "") return undefined;
  const n = Number(amount);
  if (Number.isNaN(n) || n <= 0) {
    const e = new Error("Invalid amount");
    e.status = 400;
    throw e;
  }
  return Math.round(n * 100) / 100; // ทศนิยม 2 ตำแหน่ง
}

function createPromptPayQR({ target, amountTHB, message }) {
  const cleaned = validateTarget(target);
  const amt = normalizeAmount(amountTHB);
  const payload = generatePayload(cleaned, { amount: amt, message }); // สตริงพร้อมเอาไปวาด QR ที่ฝั่ง client
  return { payload, target: cleaned, amount: amt ?? null };
}

module.exports = { createPromptPayQR };
