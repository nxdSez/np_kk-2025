const base = import.meta.env.VITE_API_BASE || "/api";

export async function fetchPaymentQueue({ status = "PENDING_REVIEW", q = "", page = 1, pageSize = 10, token }) {
  const url = new URL(`${base}/admin/payments`, window.location.origin);
  url.searchParams.set("status", status);
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("page", page);
  url.searchParams.set("pageSize", pageSize);

  const res = await fetch(url.toString().replace(window.location.origin, ""), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Load queue failed");
  return res.json();
}

export async function approvePayment(orderId, token) {
  const res = await fetch(`${base}/admin/payments/${orderId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Approve failed");
  return res.json();
}

export async function rejectPayment(orderId, reviewNote, token) {
  const res = await fetch(`${base}/admin/payments/${orderId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reviewNote }),
  });
  if (!res.ok) throw new Error("Reject failed");
  return res.json();
}

export async function getPaymentDetail(orderId, token) {
  const res = await fetch(`${base}/admin/payments/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Load payment failed');
  return res.json();
}

export async function fetchSlipBlob(orderId, token) {
  const res = await fetch(`${base}/admin/payments/${orderId}/slip-proxy`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Load slip failed');
  return await res.blob();
}