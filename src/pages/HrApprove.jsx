import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { nowText } from "../utils";

export default function HrApprove({ user }) {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [decisionNote, setDecisionNote] = useState("");

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  async function refresh() {
    const [reqs, us] = await Promise.all([api.getAllRequests(), api.getUsers()]);
    setList(reqs);
    setUsers(us);
  }

  useEffect(() => {
    if (!(user.role === "hr" || user.role === "admin")) return;
    refresh().catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  async function approve(id) {
    setErr("");
    const patched = await api.patchRequest(id, {
      status: "APPROVED",
      approverId: user.id,
      decisionNote: decisionNote.trim(),
    });
    await api.addAuditLog({
      actorId: user.id,
      action: "APPROVE_REQUEST",
      targetType: "requests",
      targetId: patched.id,
      createdAt: nowText(),
    });
    setDecisionNote("");
    refresh();
  }

  async function reject(id) {
    setErr("");
    const patched = await api.patchRequest(id, {
      status: "REJECTED",
      approverId: user.id,
      decisionNote: decisionNote.trim(),
    });
    await api.addAuditLog({
      actorId: user.id,
      action: "REJECT_REQUEST",
      targetType: "requests",
      targetId: patched.id,
      createdAt: nowText(),
    });
    setDecisionNote("");
    refresh();
  }

  if (!(user.role === "hr" || user.role === "admin")) {
    return (
      <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        Bạn không có quyền truy cập.
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>HR: Duyệt phiếu</div>

      {err && (
        <div style={{ border: "1px solid #f2c94c", background: "#fff7d6", borderRadius: 12, padding: 10, marginBottom: 10 }}>
          {err}
        </div>
      )}

      <div style={{ color: "#666", fontSize: 13 }}>Ghi chú duyệt (áp dụng cho lần bấm duyệt tiếp theo)</div>
      <input
        value={decisionNote}
        onChange={(e) => setDecisionNote(e.target.value)}
        placeholder="VD: OK, cập nhật ca..."
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
      />

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th align="left">Thời gian</th>
              <th align="left">Nhân viên</th>
              <th align="left">Loại</th>
              <th align="left">Nội dung</th>
              <th align="left">Trạng thái</th>
              <th align="left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const owner = userMap.get(r.userId);
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                  <td>{r.createdAt}</td>
                  <td>{owner ? owner.name : `User#${r.userId}`}</td>
                  <td>{r.type}</td>
                  <td>{r.content}</td>
                  <td>
                    <b>{r.status}</b>
                    <div style={{ color: "#666", fontSize: 12 }}>{r.decisionNote || ""}</div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button disabled={r.status !== "PENDING"} onClick={() => approve(r.id)} style={btnStyle}>
                      Approve
                    </button>{" "}
                    <button disabled={r.status !== "PENDING"} onClick={() => reject(r.id)} style={btnStyle}>
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan="6" style={{ color: "#666" }}>
                  Chưa có phiếu.
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
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};
