"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const typeLabels = { all: "الكل", imam: "إمام", muathin: "مؤذن", both: "إمام ومؤذن", teacher: "معلم حلقة" };

export default function Home() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, requests: 0 });
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [togglingAvail, setTogglingAvail] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setUserProfile(profile);
      }
      const { data: profiles } = await supabase.from("profiles").select("*");
      if (profiles) {
        setData(profiles);
        setStats({
          total: profiles.length,
          available: profiles.filter(p => p.available).length,
          requests: 0,
        });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const toggleAvailable = async () => {
    if (!userProfile) return;
    setTogglingAvail(true);
    const newVal = !userProfile.available;
    await supabase.from("profiles").update({ available: newVal }).eq("id", user.id);
    setUserProfile({ ...userProfile, available: newVal });
    setData(data.map(p => p.id === user.id ? { ...p, available: newVal } : p));
    setTogglingAvail(false);
  };

  const filtered = data.filter((p) => {
    const matchSearch = p.name?.includes(search) || p.city?.includes(search) || p.district?.includes(search);
    const matchType = type === "all" || p.type === type;
    const matchAvail = !onlyAvailable || p.available;
    return matchSearch && matchType && matchAvail;
  });

  const handleContact = (phone) => {
    const clean = phone?.replace(/\D/g, "");
    const wa = clean?.startsWith("0") ? "966" + clean.slice(1) : clean;
    window.open(`https://wa.me/${wa}`, "_blank");
  };

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7" }}>

      {/* الهيدر */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "#000" }}>مُناب</span>
        </a>

        <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#666" }}>
          <a href="/requests" style={{ color: "#666", textDecoration: "none" }}>الطلبات</a>
          <a href="#how" style={{ color: "#666", textDecoration: "none" }}>كيف يعمل</a>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user && userProfile ? (
            <>
              <button
                onClick={toggleAvailable}
                disabled={togglingAvail}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 99, border: "1px solid",
                  borderColor: userProfile.available ? "#1D9E75" : "#E65100",
                  background: userProfile.available ? "#E1F5EE" : "#FFF3E0",
                  color: userProfile.available ? "#0F6E56" : "#E65100",
                  fontSize: 13, cursor: "pointer",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: userProfile.available ? "#1D9E75" : "#E65100" }} />
                {togglingAvail ? "..." : userProfile.available ? "متاح" : "مشغول"}
              </button>
              <button onClick={() => window.location.href = "/dashboard"} style={{ background: "#f5f5f3", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", color: "#555" }}>حسابي</button>
            </>
          ) : (
            <>
              <button onClick={() => window.location.href = "/login"} style={{ background: "transparent", border: "1px solid #ddd", borderRadius: 8, padding: "7px 16px", fontSize: 14, cursor: "pointer", color: "#555" }}>دخول</button>
              <button onClick={() => window.location.href = "/register"} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 14, cursor: "pointer" }}>سجّل الآن</button>
            </>
          )}
        </div>
      </div>

      {/* الهيرو */}
      <div style={{ textAlign: "center", padding: "50px 24px 36px", background: "#f0faf6" }}>
        <div style={{ display: "inline-block", background: "#E1F5EE", color: "#0F6E56", fontSize: 12, padding: "4px 14px", borderRadius: 99, marginBottom: 16 }}>منصة النيابة للأئمة والمؤذنين ومعلمي الحلقات</div>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>ابحث عن إمام أو مؤذن<br />أو معلم حلقة بديل</h1>
        <p style={{ color: "#666", fontSize: 15, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>منصة تربط أئمة المساجد ومعلمي الحلقات بمن يحتاج بديلاً — بسهولة وسرعة وأمان</p>
        <div style={{ display: "flex", gap: 8, maxWidth: 500, margin: "0 auto 20px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المدينة أو الحي..." style={{ flex: 1, border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, background: "#fff" }} />
          <button style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>بحث</button>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button onClick={() => window.location.href = "/requests"} style={{ background: "#fff", color: "#1D9E75", border: "1px solid #1D9E75", borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer" }}>ارفع طلب</button>
        </div>
      </div>

      {/* الإحصائيات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "24px 24px 0", maxWidth: 700, margin: "0 auto" }}>
        {[
          { num: stats.total, label: "مسجّل في المنصة" },
          { num: stats.available, label: "متاح الآن" },
          { num: stats.requests, label: "طلب منشور" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: "#1D9E75" }}>{loading ? "..." : s.num}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* كيف يعمل */}
      <div id="how" style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 24, textAlign: "center" }}>كيف يعمل مُناب؟</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { num: "١", title: "سجّل حسابك", desc: "أنشئ ملفك الشخصي كإمام أو مؤذن أو معلم حلقة" },
            { num: "٢", title: "حدّد توفرك", desc: "غيّر حالتك إلى متاح لما تكون جاهز للنيابة" },
            { num: "٣", title: "استقبل الطلبات", desc: "يصلك طلب تواصل مباشرة عند احتياج أحد لبديل" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: 20, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{s.num}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* الفلاتر */}
      <div style={{ padding: "0 24px 16px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>المتاحون للنيابة</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {Object.entries(typeLabels).map(([key, label]) => (
            <button key={key} onClick={() => setType(key)} style={{ padding: "6px 16px", borderRadius: 99, border: "1px solid", borderColor: type === key ? "#1D9E75" : "#ddd", background: type === key ? "#E1F5EE" : "#fff", color: type === key ? "#0F6E56" : "#666", fontSize: 13, cursor: "pointer" }}>{label}</button>
          ))}
          <button onClick={() => setOnlyAvailable(!onlyAvailable)} style={{ padding: "6px 16px", borderRadius: 99, border: "1px solid", borderColor: onlyAvailable ? "#1D9E75" : "#ddd", background: onlyAvailable ? "#E1F5EE" : "#fff", color: onlyAvailable ? "#0F6E56" : "#666", fontSize: 13, cursor: "pointer" }}>متاح الآن فقط</button>
        </div>
      </div>

      {/* البطاقات */}
      <div style={{ padding: "0 24px 40px", maxWidth: 900, margin: "0 auto" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#999" }}>جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>لا توجد نتائج</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>{filtered.length} نتيجة</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {filtered.map((p) => (
                <div key={p.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: p.type === "teacher" ? "#EEEDFE" : "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: p.type === "teacher" ? "#534AB7" : "#0F6E56" }}>
                      {p.name?.slice(0, 2)}
                    </div>
                    <div>
                      <a href={`/profile/${p.id}`} style={{ fontSize: 14, fontWeight: 500, color: "#000", textDecoration: "none" }}>{p.name}</a>
                      <div style={{ fontSize: 12, color: "#888" }}>{p.role}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: p.available ? "#E1F5EE" : "#FFF3E0", color: p.available ? "#0F6E56" : "#E65100" }}>
                      {p.available ? "متاح" : "مشغول"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {p.skills?.split("،").map((s) => (
                      <span key={s} style={{ fontSize: 11, background: "#f5f5f3", color: "#555", padding: "3px 8px", borderRadius: 6 }}>{s.trim()}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{p.city} · {p.district}</span>
                    {p.available ? (
                      <button onClick={() => handleContact(p.phone)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", cursor: "pointer" }}>واتساب</button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#ccc" }}>غير متاح</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* الفوتر */}
      <div style={{ background: "#fff", borderTop: "1px solid #eee", padding: "24px", textAlign: "center", fontSize: 13, color: "#888" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 8, textDecoration: "none" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontWeight: 500, color: "#333" }}>مُناب</span>
        </a>
        <p>منصة النيابة للأئمة والمؤذنين ومعلمي الحلقات</p>
      </div>
    </div>
  );
}
