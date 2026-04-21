"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const prayerOptions = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء", "الجمعة", "التراويح"];
const typeOptions = [
  { value: "imam", label: "إمام" },
  { value: "muathin", label: "مؤذن" },
  { value: "both", label: "إمام ومؤذن" },
  { value: "teacher", label: "معلم حلقة" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("info");
  const [myRequests, setMyRequests] = useState([]);
  const [form, setForm] = useState({
    name: "", city: "", district: "", phone: "", skills: "",
    available: true, preferred_areas: "", preferred_prayers: [],
    type: "", role: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      const currentUser = session.user;
      setUser(currentUser);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profile) {
        setForm({
          name: profile.name || "",
          city: profile.city || "",
          district: profile.district || "",
          phone: profile.phone || "",
          skills: profile.skills || "",
          available: profile.available ?? true,
          preferred_areas: profile.preferred_areas || "",
          preferred_prayers: profile.preferred_prayers ? profile.preferred_prayers.split("، ") : [],
          type: profile.type || "",
          role: profile.role || "",
        });
      }

      const { data: requests } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (requests) setMyRequests(requests);
      setLoading(false);
    }
    load();
  }, []);

  const togglePrayer = (p) => {
    const current = form.preferred_prayers;
    if (current.includes(p)) {
      setForm({ ...form, preferred_prayers: current.filter(x => x !== p) });
    } else {
      setForm({ ...form, preferred_prayers: [...current, p] });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("profiles").update({
      name: form.name, city: form.city, district: form.district,
      phone: form.phone, skills: form.skills, available: form.available,
      preferred_areas: form.preferred_areas,
      preferred_prayers: form.preferred_prayers.join("، "),
      type: form.type,
      role: form.role,
    }).eq("id", user.id);

    if (error) {
      setMessage("حدث خطأ: " + error.message);
    } else {
      setMessage("تم حفظ التغييرات ✅");
    }
    setSaving(false);
  };

  const handleToggleAvailable = async () => {
    if (!user) return;
    const newVal = !form.available;
    await supabase.from("profiles").update({ available: newVal }).eq("id", user.id);
    setForm({ ...form, available: newVal });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleRequestStatusChange = async (id, status) => {
    await supabase.from("requests").update({ status }).eq("id", id);
    setMyRequests(myRequests.map(r => r.id === id ? { ...r, status } : r));
  };

  const inputStyle = {
    width: "100%", border: "1px solid #ddd", borderRadius: 8,
    padding: "10px 14px", fontSize: 14, marginBottom: 12,
    boxSizing: "border-box", background: "#fff",
  };
  const labelStyle = { fontSize: 13, color: "#555", marginBottom: 4, display: "block" };

  if (loading) return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#888" }}>جاري التحميل...</p>
    </div>
  );

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7" }}>

      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "#000" }}>مُناب</span>
        </a>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={handleToggleAvailable} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, border: "1px solid", borderColor: form.available ? "#1D9E75" : "#E65100", background: form.available ? "#E1F5EE" : "#FFF3E0", color: form.available ? "#0F6E56" : "#E65100", fontSize: 13, cursor: "pointer" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: form.available ? "#1D9E75" : "#E65100" }} />
            {form.available ? "متاح" : "مشغول"}
          </button>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #ddd", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#666", cursor: "pointer" }}>خروج</button>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>أهلاً {form.name || ""}!</h1>
          <p style={{ fontSize: 13, color: "#888" }}>لوحة التحكم</p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f0f0ee", borderRadius: 10, padding: 4 }}>
          {[
            { key: "info", label: "معلوماتي" },
            { key: "prefs", label: "تفضيلاتي" },
            { key: "requests", label: `طلباتي (${myRequests.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#000" : "#888", fontSize: 13, fontWeight: tab === t.key ? 500 : 400, cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>

        {tab === "info" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 20 }}>
            <label style={labelStyle}>الاسم</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

            <label style={labelStyle}>التخصص</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {typeOptions.map(t => (
                <button key={t.value} onClick={() => setForm({ ...form, type: t.value, role: t.label })} style={{ padding: "7px 16px", borderRadius: 99, border: "1px solid", borderColor: form.type === t.value ? "#1D9E75" : "#ddd", background: form.type === t.value ? "#E1F5EE" : "#fff", color: form.type === t.value ? "#0F6E56" : "#666", fontSize: 13, cursor: "pointer" }}>{t.label}</button>
              ))}
            </div>

            <label style={labelStyle}>المدينة</label>
            <input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />

            <label style={labelStyle}>الحي</label>
            <input style={inputStyle} value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />

            <label style={labelStyle}>رقم الجوال</label>
            <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

            <label style={labelStyle}>المهارات (افصل بينها بفاصلة)</label>
            <input style={inputStyle} placeholder="حافظ للقرآن، خطبة جمعة، تراويح" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />

            {message && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("خطأ") ? "#FFF3E0" : "#E1F5EE", color: message.includes("خطأ") ? "#E65100" : "#0F6E56", fontSize: 13 }}>{message}</div>
            )}
            <button onClick={handleSave} disabled={saving} style={{ width: "100%", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}>
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        )}

        {tab === "prefs" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 20 }}>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>هذه المعلومات اختيارية وتساعد في تحسين نتائج البحث</p>

            <label style={labelStyle}>الأحياء المفضلة للنيابة فيها</label>
            <input style={inputStyle} placeholder="مثال: حي النزهة، حي الصفا، حي الروضة" value={form.preferred_areas} onChange={e => setForm({ ...form, preferred_areas: e.target.value })} />
            <p style={{ fontSize: 12, color: "#aaa", marginTop: -8, marginBottom: 12 }}>افصل بين الأحياء بفاصلة</p>

            <label style={labelStyle}>الصلوات التي تقبل النيابة فيها</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {prayerOptions.map(p => (
                <button key={p} onClick={() => togglePrayer(p)} style={{ padding: "7px 16px", borderRadius: 99, border: "1px solid", borderColor: form.preferred_prayers.includes(p) ? "#1D9E75" : "#ddd", background: form.preferred_prayers.includes(p) ? "#E1F5EE" : "#fff", color: form.preferred_prayers.includes(p) ? "#0F6E56" : "#666", fontSize: 13, cursor: "pointer" }}>{p}</button>
              ))}
            </div>

            {message && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("خطأ") ? "#FFF3E0" : "#E1F5EE", color: message.includes("خطأ") ? "#E65100" : "#0F6E56", fontSize: 13 }}>{message}</div>
            )}
            <button onClick={handleSave} disabled={saving} style={{ width: "100%", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}>
              {saving ? "جاري الحفظ..." : "حفظ التفضيلات"}
            </button>
          </div>
        )}

        {tab === "requests" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#888" }}>الطلبات التي رفعتها</p>
              <button onClick={() => window.location.href = "/requests"} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "none", background: "#1D9E75", color: "#fff", cursor: "pointer" }}>+ طلب جديد</button>
            </div>
            {myRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#888", background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
                <p>لم ترفع أي طلب بعد</p>
                <button onClick={() => window.location.href = "/requests"} style={{ marginTop: 12, fontSize: 13, padding: "8px 16px", borderRadius: 8, border: "none", background: "#1D9E75", color: "#fff", cursor: "pointer" }}>ارفع طلبك الأول</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myRequests.map(r => (
                  <div key={r.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{r.title}</p>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#E1F5EE", color: "#0F6E56" }}>{r.type}</span>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: r.status === "نشط" ? "#E1F5EE" : r.status === "تم العثور" ? "#E6F1FB" : "#f5f5f3", color: r.status === "نشط" ? "#0F6E56" : r.status === "تم العثور" ? "#185FA5" : "#888" }}>{r.status || "نشط"}</span>
                        </div>
                      </div>
                      <button onClick={() => window.location.href = "/requests"} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "1px solid #ddd", color: "#555", background: "#fff", cursor: "pointer" }}>تعديل</button>
                    </div>
                    <p style={{ fontSize: 12, color: "#888" }}>📍 {r.city}{r.district ? ` · ${r.district}` : ""}{r.mosque ? ` · ${r.mosque}` : ""}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {r.status !== "تم العثور" && (
                        <button onClick={() => handleRequestStatusChange(r.id, "تم العثور")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: "1px solid #185FA5", color: "#185FA5", background: "#E6F1FB", cursor: "pointer" }}>تم العثور ✅</button>
                      )}
                      {r.status !== "ملغي" && (
                        <button onClick={() => handleRequestStatusChange(r.id, "ملغي")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: "1px solid #ddd", color: "#888", background: "#f5f5f3", cursor: "pointer" }}>إلغاء</button>
                      )}
                      {r.status !== "نشط" && (
                        <button onClick={() => handleRequestStatusChange(r.id, "نشط")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: "1px solid #1D9E75", color: "#0F6E56", background: "#E1F5EE", cursor: "pointer" }}>إعادة تفعيل</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}