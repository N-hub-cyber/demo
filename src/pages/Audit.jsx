import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function Audit({ user }) {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  async function refresh() {
    const [ls, us] = await Promise.all([api.getAuditLogs(), api.getUsers()]);
    setLogs(ls);
    setUsers(us);
  }

  useEffect(() => {
    if (user.role !== "admin") return;
    refresh().catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  if (user.role !== "admin") {
    return (
      <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        Bạn không có quyền truy cập.
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>Admin: Audit log</div>
      {err && (
        <div style={{ border: "1px solid #f2c94c", background: "#fff7d6", borderRadius: 12, padding: 10, marginBottom: 10 }}>
          {err}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th align="left">Time</th>
              <th align="left">Actor</th>
              <th align="left">Action</th>
              <th align="left">Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => {
              const actor = userMap.get(l.actorId);
              return (
                <tr key={l.id} style={{ borderTop: "1px solid #eee" }}>
                  <td>{l.createdAt}</td>
                  <td>{actor ? actor.name : `User#${l.actorId}`}</td>
                  <td><b>{l.action}</b></td>
                  <td>{l.targetType}#{l.targetId}</td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ color: "#666" }}>
                  Chưa có log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
