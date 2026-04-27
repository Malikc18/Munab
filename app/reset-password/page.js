"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!password || !confirm) {
      setMessage("يرجى تعبئة جميع الحقول");
      return;
    }
    if (password !== confirm) {
      setMessage("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 8) {
      setMessage("كلمة المرور يجب أن تكون ٨ أحرف على الأقل");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage("حدث خطأ، حاول مرة أخرى");
    } else {
      setMessage("تم تغيير كلمة المرور بنجاح ✅");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 32, width: "100%", maxWidth: 400 }}>

        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, textDecoration: "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "#000" }}>مُناب</span>
        </a>

        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>تعيين كلمة مرور جديدة</h2>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>أدخل كلمة المرور الجديدة</p>

        <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>كلمة المرور الجديدة</label>
        <input
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 12, boxSizing: "border-box", background: "#fff" }}
          type="password"
          placeholder="٨ أحرف على الأقل"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>تأكيد كلمة المرور</label>
        <input
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 12, boxSizing: "border-box", background: "#fff" }}
          type="password"
          placeholder="أعد إدخال كلمة المرور"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {message && (
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("خطأ") || message.includes("يرجى") || message.includes("غير") ? "#FFF3E0" : "#E1F5EE", color: message.includes("خطأ") || message.includes("يرجى") || message.includes("غير") ? "#E65100" : "#0F6E56", fontSize: 13 }}>
            {message}
          </div>
        )}

        <button onClick={handleReset} disabled={loading} style={{ width: "100%", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}>
          {loading ? "جاري الحفظ..." : "تعيين كلمة المرور"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 20 }}>
          <a href="/login" style={{ color: "#1D9E75", textDecoration: "none" }}>رجوع لتسجيل الدخول</a>
        </p>
      </div>
    </div>
  );
}