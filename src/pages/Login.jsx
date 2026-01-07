import { useEffect, useState } from "react";
import { api } from "../api";
import { roleLabel } from "../utils";

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [pick, setPick] = useState("");

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const chosen = users.find((u) => String(u.id) === String(pick));

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 720, margin: "50px auto", padding: "0 14px" }}>
      <div style={{ fontWeight: 900, fontSize: 22 }}>Mini HR Demo</div>
      <div style={{ color: "#666", marginTop: 6 }}>
        Login “giả lập” bằng chọn user (đủ để demo luồng nghiệp vụ trong phỏng vấn).
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Chọn tài khoản</div>

        <select value={pick} onChange={(e) => setPick(e.target.value)} style={{ width: "100%", padding: 10 }}>
          <option value="">-- Chọn user --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} • {roleLabel(u.role)}
            </option>
          ))}
        </select>

        <button
          disabled={!chosen}
          onClick={() => onLogin(chosen)}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: chosen ? "white" : "#f5f5f5",
            cursor: chosen ? "pointer" : "not-allowed",
            width: "100%",
            fontWeight: 700,
          }}
        >
          Login
        </button>

        <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
          Gợi ý demo: Employee → HR → Admin.
        </div>
      </div>
    </div>
  );
}
