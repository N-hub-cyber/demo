import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
console.log("api ready", api);
import { clearSession, getSessionUser, setSessionUser } from "./session";
import { roleLabel } from "./utils";
import Login from "./pages/Login";
import Attendance from "./pages/Attendance";
import MyRequests from "./pages/MyRequests";
import HrApprove from "./pages/HrApprove";
import Audit from "./pages/Audit";

function Button({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "white",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Nav({ items, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {items.map((it) => (
        <Button
          key={it.key}
          onClick={() => onChange(it.key)}
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid #ddd",
            background: active === it.key ? "#f5f5f5" : "white",
            cursor: "pointer",
          }}
        >
          {it.label}
        </Button>
      ))}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(getSessionUser());
  const [tab, setTab] = useState("attendance");

  useEffect(() => {
    if (!user) return;
    setSessionUser(user);
  }, [user]);

  const tabs = useMemo(() => {
    if (!user) return [];
    const base = [
      { key: "attendance", label: "Chấm công" },
      { key: "myRequests", label: "Phiếu của tôi" },
    ];
    if (user.role === "hr" || user.role === "admin") {
      base.push({ key: "hrApprove", label: "HR: Duyệt phiếu" });
    }
    if (user.role === "admin") {
      base.push({ key: "audit", label: "Admin: Audit log" });
    }
    return base;
  }, [user]);

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 980, margin: "30px auto", padding: "0 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Mini HR Internal System</div>
          <div style={{ color: "#666", fontSize: 13 }}>React + JSON Server • demo chạy local</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>
            {user.name} <span style={{ color: "#666", fontWeight: 400 }}>({roleLabel(user.role)})</span>
          </div>
          <div style={{ fontSize: 13 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                clearSession();
                setUser(null);
              }}
            >
              Logout
            </a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 14, border: "1px solid #ddd", borderRadius: 14 }}>
        <Nav items={tabs} active={tab} onChange={setTab} />
      </div>

      <div style={{ marginTop: 16 }}>
        {tab === "attendance" && <Attendance user={user} />}
        {tab === "myRequests" && <MyRequests user={user} />}
        {tab === "hrApprove" && <HrApprove user={user} />}
        {tab === "audit" && <Audit user={user} />}
      </div>

      <div style={{ marginTop: 30, color: "#666", fontSize: 12 }}>
        Tip demo phỏng vấn: Login employee → check-in/out → tạo phiếu → logout → login HR → duyệt phiếu.
      </div>
    </div>
  );
}
