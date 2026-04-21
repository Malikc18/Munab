"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("يرجى تعبئة جميع الحقول");
      return;
    }
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("البريد أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
    } else {
      setMessage("حدث خطأ، حاول مرة أخرى");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
    background: "#fff",
  };

  const btnStyle = {
    width: "100%",
    background: "#1D9E75",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontSize: 15,
    cursor: "pointer",
    marginTop: 4,
  };

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 32, width: "100%", maxWidth: 400 }}>

        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, textDecoration: "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "#000" }}>مُناب</span>
        </a>

        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>تسجيل الدخول</h2>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>أدخل بياناتك للدخول لحسابك</p>

        <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>البريد الإلكتروني</label>
        <input style={inputStyle} type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>كلمة المرور</label>
        <input style={inputStyle} type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />

        {message && (
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("صحيحة") || message.includes("خطأ") ? "#FFF3E0" : "#E1F5EE", color: message.includes("صحيحة") || message.includes("خطأ") ? "#E65100" : "#0F6E56", fontSize: 13 }}>
            {message}
          </div>
        )}

        <button style={btnStyle} onClick={handleLogin} disabled={loading}>
          {loading ? "جاري الدخول..." : "دخول"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 20 }}>
          ما عندك حساب؟ <a href="/register" style={{ color: "#1D9E75", textDecoration: "none" }}>سجّل الآن</a>
        </p>
      </div>
    </div>
  );
}