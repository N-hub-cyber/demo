const BASE = "http://localhost:3001";

async function j(url, options) {
  const r = await fetch(url, options);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const api = {
  // users
  getUsers: () => j(`${BASE}/users`),

  // attendance
  getAttendanceByUserAndDate: (userId, date) =>
    j(`${BASE}/attendance?userId=${userId}&date=${date}`),

  getAttendanceByUser: (userId) =>
    j(`${BASE}/attendance?userId=${userId}&_sort=date&_order=desc&_limit=10`),

  createAttendance: (row) =>
    j(`${BASE}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    }),

  patchAttendance: (id, patch) =>
    j(`${BASE}/attendance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }),

  // requests
  getRequestsByUser: (userId) =>
    j(`${BASE}/requests?userId=${userId}&_sort=createdAt&_order=desc`),

  getAllRequests: () =>
    j(`${BASE}/requests?_sort=createdAt&_order=desc`),

  createRequest: (row) =>
    j(`${BASE}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    }),

  patchRequest: (id, patch) =>
    j(`${BASE}/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }),

  // audit
  getAuditLogs: () => j(`${BASE}/auditLogs?_sort=createdAt&_order=desc&_limit=30`),

  addAuditLog: (row) =>
    j(`${BASE}/auditLogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    }),
};
