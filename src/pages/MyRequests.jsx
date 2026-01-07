import { useEffect, useState } from "react";
import { api } from "../api";
import { nowText } from "../utils";

const TYPES = [
  { value: "FORGOT_CHECKIN", label: "Quên chấm công" },
  { value: "LEAVE", label: "Xin nghỉ" },
  { value: "SHIFT_CHANGE", label: "Đổi ca" },
];

export default function MyRequests({ user }) {
  const [list, setList] = useState([]);
  const [type, setType] = useState("FORGOT_CHECKIN");
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");

  async function refresh() {
    const rows = await api.getRequestsByUser(user.id);
    setList(rows);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function submit() {
    setErr("");
    if (!content.trim()) return setErr("Nội dung phiếu không được trống.");
    const row = await api.createRequest({
      userId: user.id,
      type,
      content: content.trim(),
      status: "PENDING",
      approverId: null,
      decisionNote: "",
      createdAt: nowText(),
    });
    await api.addAuditLog({
      actorId: user.id,
      action: "CREATE_REQUEST",
      targetType: "requests",
      targetId: row.id,
      createdAt: nowText(),
    });
    setContent("");
    refresh();
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>Phiếu của tôi</div>

      {err && (
        <div style={{ border: "1px solid #f2c94c", background: "#fff7d6", borderRadius: 12, padding: 10, marginBottom: 10 }}>
          {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <div>
          <div style={{ color: "#666", fontSize: 13 }}>Loại phiếu</div>
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ color: "#666", fontSize: 13 }}>Nội dung</div>
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung..." style={inputStyle} />
        </div>
      </div>

      <button onClick={submit} style={{ ...btnStyle, marginTop: 12 }}>
        Tạo phiếu
      </button>

      <div style={{ marginTop: 16, fontWeight: 800 }}>Danh sách phiếu</div>

      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th align="left">Thời gian</th>
              <th align="left">Loại</th>
              <th align="left">Nội dung</th>
              <th align="left">Trạng thái</th>
              <th align="left">Ghi chú duyệt</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{r.createdAt}</td>
                <td>{r.type}</td>
                <td>{r.content}</td>
                <td>
                  <b>{r.status}</b>
                </td>
                <td>{r.decisionNote || ""}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="5" style={{ color: "#666" }}>
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

const inputStyle = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" };
const btnStyle = { padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: 700 };
