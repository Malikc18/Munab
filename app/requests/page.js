"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const prayerOptions = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء", "الجمعة", "التراويح"];
const typeOptions = ["إمام", "مؤذن", "معلم حلقة"];

const statusColors = {
  "نشط": { bg: "#E1F5EE", color: "#0F6E56" },
  "تم العثور": { bg: "#E6F1FB", color: "#185FA5" },
  "ملغي": { bg: "#f5f5f3", color: "#888" },
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "", city: "", district: "", mosque: "",
    date_from: "", date_to: "", prayers: [], notes: "", phone: "",
    latitude: null, longitude: null, location_name: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const { data } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
      if (data) setRequests(data);
      setLoading(false);
    }
    load();
  }, []);

  const togglePrayer = (p) => {
    const current = form.prayers;
    if (current.includes(p)) {
      setForm({ ...form, prayers: current.filter(x => x !== p) });
    } else {
      setForm({ ...form, prayers: [...current, p] });
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const name = data.display_name?.split("،")[0] || "موقعك الحالي";
          setForm({ ...form, latitude: lat, longitude: lng, location_name: name });
        } catch {
          setForm({ ...form, latitude: lat, longitude: lng, location_name: "موقعك الحالي" });
        }
        setLocating(false);
      },
      () => {
        alert("تعذر تحديد الموقع، تأكد من السماح بالوصول");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!form.title || !form.type || !form.city || !form.phone) {
      setMessage("يرجى تعبئة الحقول المطلوبة");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("requests").insert({
      title: form.title, type: form.type, city: form.city,
      district: form.district, mosque: form.mosque,
      date_from: form.date_from || null, date_to: form.date_to || null,
      prayers: form.prayers.join("، "), notes: form.notes,
      phone: form.phone, user_id: user?.id || null, status: "نشط",
      latitude: form.latitude, longitude: form.longitude,
      location_name: form.location_name,
    });
    if (error) {
      setMessage("حدث خطأ، حاول مرة أخرى");
    } else {
      setMessage("تم رفع الطلب بنجاح ✅");
      setShowForm(false);
      const { data } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
      if (data) setRequests(data);
      setForm({ title: "", type: "", city: "", district: "", mosque: "", date_from: "", date_to: "", prayers: [], notes: "", phone: "", latitude: null, longitude: null, location_name: "" });
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from("requests").update({ status: newStatus }).eq("id", id);
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleContact = (phone) => {
    const clean = phone?.replace(/\D/g, "");
    const wa = clean?.startsWith("0") ? "966" + clean.slice(1) : clean;
    window.open(`https://wa.me/${wa}`, "_blank");
  };

  const openMap = (lat, lng, name) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17&hl=ar`, "_blank");
  };

  const inputStyle = {
    width: "100%", border: "1px solid #ddd", borderRadius: 8,
    padding: "10px 14px", fontSize: 14, marginBottom: 12,
    boxSizing: "border-box", background: "#fff",
  };
  const labelStyle = { fontSize: 13, color: "#555", marginBottom: 4, display: "block" };

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7" }}>

      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "#000" }}>مُناب</span>
        </a>
        <button onClick={() => window.location.href = "/"} style={{ background: "transparent", border: "1px solid #ddd", borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: "pointer", color: "#555" }}>الرئيسية</button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>الطلبات</h1>
            <p style={{ fontSize: 13, color: "#888" }}>طلبات تحتاج إماماً أو مؤذناً أو معلم حلقة</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
            {showForm ? "إلغاء" : "+ أضف طلب"}
          </button>
        </div>

        {showForm && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>رفع طلب جديد</h2>

            <label style={labelStyle}>عنوان الطلب *</label>
            <input style={inputStyle} placeholder="مثال: أبغى إمام لصلاة الجمعة" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

            <label style={labelStyle}>نوع المطلوب *</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {typeOptions.map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })} style={{ padding: "7px 16px", borderRadius: 99, border: "1px solid", borderColor: form.type === t ? "#1D9E75" : "#ddd", background: form.type === t ? "#E1F5EE" : "#fff", color: form.type === t ? "#0F6E56" : "#666", fontSize: 13, cursor: "pointer" }}>{t}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>المدينة *</label>
                <input style={inputStyle} placeholder="بريدة" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>الحي</label>
                <input style={inputStyle} placeholder="حي النزهة" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
              </div>
            </div>

            <label style={labelStyle}>اسم المسجد أو المركز</label>
            <input style={inputStyle} placeholder="مسجد الرحمن" value={form.mosque} onChange={e => setForm({ ...form, mosque: e.target.value })} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>من تاريخ</label>
                <input style={inputStyle} type="date" value={form.date_from} onChange={e => setForm({ ...form, date_from: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>إلى تاريخ</label>
                <input style={inputStyle} type="date" value={form.date_to} onChange={e => setForm({ ...form, date_to: e.target.value })} />
              </div>
            </div>

            <label style={labelStyle}>الصلوات المطلوبة</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {prayerOptions.map(p => (
                <button key={p} onClick={() => togglePrayer(p)} style={{ padding: "6px 14px", borderRadius: 99, border: "1px solid", borderColor: form.prayers.includes(p) ? "#1D9E75" : "#ddd", background: form.prayers.includes(p) ? "#E1F5EE" : "#fff", color: form.prayers.includes(p) ? "#0F6E56" : "#666", fontSize: 12, cursor: "pointer" }}>{p}</button>
              ))}
            </div>

            {/* موقع المسجد */}
            <label style={labelStyle}>موقع المسجد على الخريطة</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={getLocation} disabled={locating} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #ddd", background: form.latitude ? "#E1F5EE" : "#fff", color: form.latitude ? "#0F6E56" : "#555", fontSize: 13, cursor: "pointer" }}>
                {locating ? "جاري التحديد..." : form.latitude ? `✅ ${form.location_name}` : "📍 حدد موقعي تلقائياً"}
              </button>
              {form.latitude && (
                <button onClick={() => setForm({ ...form, latitude: null, longitude: null, location_name: "" })} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#888", fontSize: 13, cursor: "pointer" }}>مسح</button>
              )}
            </div>

            <label style={labelStyle}>رقم التواصل (واتساب) *</label>
            <input style={inputStyle} placeholder="05xxxxxxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

            <label style={labelStyle}>ملاحظات إضافية</label>
            <textarea style={{ ...inputStyle, height: 80, resize: "none" }} placeholder="أي تفاصيل إضافية..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

            {message && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("خطأ") || message.includes("يرجى") ? "#FFF3E0" : "#E1F5EE", color: message.includes("خطأ") || message.includes("يرجى") ? "#E65100" : "#0F6E56", fontSize: 13 }}>
                {message}
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}>
              {submitting ? "جاري الرفع..." : "رفع الطلب"}
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", color: "#999" }}>جاري التحميل...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>لا توجد طلبات حالياً</p>
            <p style={{ fontSize: 13 }}>كن أول من يرفع طلب!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {requests.map((r) => (
              <div key={r.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: 20, opacity: r.status === "ملغي" ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{r.title}</h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "#E1F5EE", color: "#0F6E56" }}>{r.type}</span>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: statusColors[r.status]?.bg || "#f5f5f3", color: statusColors[r.status]?.color || "#888" }}>{r.status || "نشط"}</span>
                    </div>
                  </div>
                  {r.status !== "ملغي" && r.status !== "تم العثور" && (
                    <button onClick={() => handleContact(r.phone)} style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>واتساب</button>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#666", marginBottom: 12 }}>
                  {r.city && <span>📍 {r.city}{r.district ? ` · ${r.district}` : ""}</span>}
                  {r.mosque && <span>🕌 {r.mosque}</span>}
                  {r.date_from && <span>📅 {r.date_from}{r.date_to ? ` إلى ${r.date_to}` : ""}</span>}
                  {r.prayers && <span>🕐 {r.prayers}</span>}
                </div>

                {/* زر الخريطة */}
                {r.latitude && r.longitude && (
                  <button onClick={() => openMap(r.latitude, r.longitude, r.mosque)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#f9f9f7", color: "#555", cursor: "pointer", marginBottom: 10 }}>
                    🗺️ عرض على الخريطة
                  </button>
                )}

                {r.notes && <p style={{ fontSize: 13, color: "#888", marginBottom: 12, borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>{r.notes}</p>}

                {user && r.user_id === user.id && (
                  <div style={{ display: "flex", gap: 8, borderTop: "1px solid #f0f0f0", paddingTop: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>تغيير الحالة:</span>
                    {r.status !== "مكتمل" && (
                      <button onClick={() => handleStatusChange(r.id, "تم العثور")} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #185FA5", color: "#185FA5", background: "#E6F1FB", cursor: "pointer" }}>تم العثور ✅</button>
                    )}
                    {r.status !== "ملغي" && (
                      <button onClick={() => handleStatusChange(r.id, "ملغي")} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #ddd", color: "#888", background: "#f5f5f3", cursor: "pointer" }}>إلغاء الطلب</button>
                    )}
                    {r.status !== "نشط" && (
                      <button onClick={() => handleStatusChange(r.id, "نشط")} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #1D9E75", color: "#0F6E56", background: "#E1F5EE", cursor: "pointer" }}>إعادة تفعيل</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
