import { useEffect, useState } from "react";
import { api } from "../api";
import { nowText, todayISO } from "../utils";

export default function Attendance({ user }) {
  const [todayRow, setTodayRow] = useState(null);
  const [recent, setRecent] = useState([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  async function refresh() {
    setErr("");
    const today = todayISO();

    // ensure today attendance row exists
    const existing = await api.getAttendanceByUserAndDate(user.id, today);
    let row = existing[0];
    if (!row) {
      row = await api.createAttendance({
        userId: user.id,
        date: today,
        checkIn: null,
        checkOut: null,
        note: "",
      });
      await api.addAuditLog({
        actorId: user.id,
        action: "CREATE_ATTENDANCE_ROW",
        targetType: "attendance",
        targetId: row.id,
        createdAt: nowText(),
      });
    }
    setTodayRow(row);

    const list = await api.getAttendanceByUser(user.id);
    setRecent(list);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function doCheckIn() {
    if (!todayRow) return;
    if (todayRow.checkIn) return setErr("Bạn đã check-in rồi.");
    setErr("");
    const patched = await api.patchAttendance(todayRow.id, { checkIn: nowText(), note });
    await api.addAuditLog({
      actorId: user.id,
      action: "CHECK_IN",
      targetType: "attendance",
      targetId: todayRow.id,
      createdAt: nowText(),
    });
    setTodayRow(patched);
    setNote("");
    refresh();
  }

  async function doCheckOut() {
    if (!todayRow) return;
    if (!todayRow.checkIn) return setErr("Chưa check-in nên không check-out được.");
    if (todayRow.checkOut) return setErr("Bạn đã check-out rồi.");
    setErr("");
    const patched = await api.patchAttendance(todayRow.id, { checkOut: nowText(), note });
    await api.addAuditLog({
      actorId: user.id,
      action: "CHECK_OUT",
      targetType: "attendance",
      targetId: todayRow.id,
      createdAt: nowText(),
    });
    setTodayRow(patched);
    setNote("");
    refresh();
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>Chấm công</div>

      {err && (
        <div style={{ border: "1px solid #f2c94c", background: "#fff7d6", borderRadius: 12, padding: 10, marginBottom: 10 }}>
          {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ color: "#666", fontSize: 13 }}>Ghi chú (tuỳ chọn)</div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: đi công tác / quên chấm..."
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
          <button onClick={doCheckIn} style={btnStyle}>
            Check-in
          </button>
          <button onClick={doCheckOut} style={btnStyle}>
            Check-out
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
        Hôm nay: <b>{todayISO()}</b> • Check-in: <b>{todayRow?.checkIn || "-"}</b> • Check-out: <b>{todayRow?.checkOut || "-"}</b>
      </div>

      <div style={{ marginTop: 16, fontWeight: 800 }}>10 ngày gần nhất</div>
      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th align="left">Ngày</th>
              <th align="left">Check-in</th>
              <th align="left">Check-out</th>
              <th align="left">Note</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{r.date}</td>
                <td>{r.checkIn || ""}</td>
                <td>{r.checkOut || ""}</td>
                <td>{r.note || ""}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan="4" style={{ color: "#666" }}>
                  Chưa có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
  width: "100%",
};
