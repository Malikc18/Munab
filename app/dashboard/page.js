"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    city: "",
    district: "",
    phone: "",
    skills: "",
    available: true,
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setProfile(profile);
        setForm({
          name: profile.name || "",
          city: profile.city || "",
          district: profile.district || "",
          phone: profile.phone || "",
          skills: profile.skills || "",
          available: profile.available ?? true,
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        city: form.city,
        district: form.district,
        phone: form.phone,
        skills: form.skills,
        available: form.available,
      })
      .eq("id", user.id);
    if (error) {
      setMessage("حدث خطأ أثناء الحفظ");
    } else {
      setMessage("تم حفظ التغييرات ✅");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
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

  if (loading) {
    return (
      <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888" }}>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7" }}>
      
      {/* الهيدر */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500 }}>مُناب</span>
        </div>
        <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#666", cursor: "pointer" }}>
          تسجيل الخروج
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        
        {/* بطاقة الحالة */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>حالتك الحالية</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: form.available ? "#1D9E75" : "#E65100" }} />
              <span style={{ fontSize: 16, fontWeight: 500 }}>{form.available ? "متاح للنيابة" : "مشغول حالياً"}</span>
            </div>
            <button
              onClick={() => setForm({ ...form, available: !form.available })}
              style={{
                padding: "8px 20px",
                borderRadius: 99,
                border: "none",
                background: form.available ? "#FFF3E0" : "#E1F5EE",
                color: form.available ? "#E65100" : "#0F6E56",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {form.available ? "تغيير إلى مشغول" : "تغيير إلى متاح"}
            </button>
          </div>
        </div>

        {/* بيانات الملف الشخصي */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>بياناتك الشخصية</h2>

          <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>الاسم</label>
          <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>المدينة</label>
          <input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

          <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>الحي</label>
          <input style={inputStyle} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />

          <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>رقم الجوال</label>
          <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>المهارات</label>
          <input style={inputStyle} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />

          {message && (
            <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("خطأ") ? "#FFF3E0" : "#E1F5EE", color: message.includes("خطأ") ? "#E65100" : "#0F6E56", fontSize: 13 }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: "100%", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
