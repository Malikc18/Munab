"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const typeLabels = { all: "الكل", imam: "إمام", muathin: "مؤذن", both: "إمام ومؤذن", teacher: "معلم حلقة" };

const mockData = [
  { id: 1, name: "عبدالله المطيري", role: "إمام وخطيب", city: "الرياض", district: "حي النخيل", available: true, skills: "حافظ للقرآن، خطبة جمعة، تراويح", type: "imam" },
  { id: 2, name: "سعد الغامدي", role: "مؤذن", city: "الرياض", district: "حي العليا", available: true, skills: "صوت متميز، خبرة ١٠ سنوات", type: "muathin" },
  { id: 3, name: "فهد العنزي", role: "إمام وخطيب", city: "جدة", district: "حي الملقا", available: false, skills: "حافظ للقرآن، دروس دينية", type: "imam" },
  { id: 4, name: "خالد الشمري", role: "إمام ومؤذن", city: "الرياض", district: "حي الروضة", available: true, skills: "إمام ومؤذن، تعليم أطفال", type: "both" },
  { id: 5, name: "أحمد القحطاني", role: "معلم حلقة", city: "الدمام", district: "حي الشاطئ", available: true, skills: "تحفيظ قرآن، تجويد، أطفال وكبار", type: "teacher" },
  { id: 6, name: "محمد العسيري", role: "معلم حلقة", city: "الرياض", district: "حي السليمانية", available: false, skills: "تحفيظ قرآن، إجازة برواية حفص", type: "teacher" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: rows, error } = await supabase.from("profiles").select("*");
      if (!error && rows && rows.length > 0) {
        setData(rows);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = data.filter((p) => {
    const matchSearch = p.name?.includes(search) || p.city?.includes(search) || p.district?.includes(search);
    const matchType = type === "all" || p.type === type;
    const matchAvail = !onlyAvailable || p.available;
    return matchSearch && matchType && matchAvail;
  });

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500 }}>مُناب</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#666" }}>
          <span>للأئمة</span>
          <span>للمساجد</span>
          <span>كيف يعمل</span>
        </div>
        <button style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 14, cursor: "pointer" }}>سجّل الآن</button>
      </div>

      <div style={{ textAlign: "center", padding: "40px 24px 28px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 10 }}>ابحث عن إمام أو مؤذن أو معلم حلقة بديل</h1>
        <p style={{ color: "#666", fontSize: 15, marginBottom: 24 }}>منصة تربط أئمة المساجد ومعلمي الحلقات بمن يحتاج بديلاً</p>
        <div style={{ display: "flex", gap: 8, maxWidth: 500, margin: "0 auto" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المدينة أو الحي..." style={{ flex: 1, border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14 }} />
          <button style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 14, cursor: "pointer" }}>بحث</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", padding: "0 24px 20px" }}>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button key={key} onClick={() => setType(key)} style={{ padding: "6px 16px", borderRadius: 99, border: "1px solid", borderColor: type === key ? "#1D9E75" : "#ddd", background: type === key ? "#E1F5EE" : "#fff", color: type === key ? "#0F6E56" : "#666", fontSize: 13, cursor: "pointer" }}>{label}</button>
        ))}
        <button onClick={() => setOnlyAvailable(!onlyAvailable)} style={{ padding: "6px 16px", borderRadius: 99, border: "1px solid", borderColor: onlyAvailable ? "#1D9E75" : "#ddd", background: onlyAvailable ? "#E1F5EE" : "#fff", color: onlyAvailable ? "#0F6E56" : "#666", fontSize: 13, cursor: "pointer" }}>متاح الآن فقط</button>
      </div>

      <div style={{ padding: "0 24px 40px", maxWidth: 900, margin: "0 auto" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#999" }}>جاري التحميل...</p>
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
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{p.role}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: p.available ? "#E1F5EE" : "#FFF3E0", color: p.available ? "#0F6E56" : "#E65100" }}>{p.available ? "متاح" : "مشغول"}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {p.skills?.split("،").map((s) => <span key={s} style={{ fontSize: 11, background: "#f5f5f3", color: "#555", padding: "3px 8px", borderRadius: 6 }}>{s.trim()}</span>)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{p.city} · {p.district}</span>
                    <button style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #1D9E75", color: "#0F6E56", background: "transparent", cursor: "pointer" }}>تواصل</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
