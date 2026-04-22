"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { use } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Profile({ params }) {
  const { id } = use(params);
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [ratingForm, setRatingForm] = useState({ name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (profile) setProfile(profile);

      const { data: ratings } = await supabase
        .from("ratings")
        .select("*")
        .eq("profile_id", id)
        .order("created_at", { ascending: false });
      if (ratings) setRatings(ratings);

      setLoading(false);
    }
    load();
  }, [id]);

  const handleContact = () => {
    const clean = profile.phone?.replace(/\D/g, "");
    const wa = clean?.startsWith("0") ? "966" + clean.slice(1) : clean;
    window.open(`https://wa.me/${wa}`, "_blank");
  };

  const handleRating = async () => {
    if (!ratingForm.name || !ratingForm.rating) {
      setMessage("يرجى تعبئة الاسم والتقييم");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("ratings").insert({
      profile_id: id,
      reviewer_name: ratingForm.name,
      rating: ratingForm.rating,
      comment: ratingForm.comment,
    });
    if (!error) {
      await supabase.from("profiles").update({
        rating_count: (profile.rating_count || 0) + 1,
        rating_total: (profile.rating_total || 0) + ratingForm.rating,
      }).eq("id", id);
      setMessage("شكراً على تقييمك ✅");
      setShowRating(false);
      setRatingForm({ name: "", rating: 5, comment: "" });
      const { data } = await supabase.from("ratings").select("*").eq("profile_id", id).order("created_at", { ascending: false });
      if (data) setRatings(data);
      const { data: updatedProfile } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (updatedProfile) setProfile(updatedProfile);
    } else {
      setMessage("حدث خطأ، حاول مرة أخرى");
    }
    setSubmitting(false);
  };

  const avgRating = profile?.rating_count > 0
    ? (profile.rating_total / profile.rating_count).toFixed(1)
    : null;

  const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

  if (loading) return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#888" }}>جاري التحميل...</p>
    </div>
  );

  if (!profile) return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#888" }}>لم يتم العثور على هذا الملف</p>
    </div>
  );

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7" }}>

      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "#000" }}>مُناب</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>الرئيسية</a>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>

        {/* بطاقة الملف الشخصي */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: profile.type === "teacher" ? "#EEEDFE" : "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 500, color: profile.type === "teacher" ? "#534AB7" : "#0F6E56", flexShrink: 0 }}>
              {profile.name?.slice(0, 2)}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{profile.name}</h1>
              <p style={{ fontSize: 14, color: "#888" }}>{profile.role}</p>
              {avgRating && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ color: "#F59E0B", fontSize: 14 }}>{stars(avgRating)}</span>
                  <span style={{ fontSize: 13, color: "#666" }}>{avgRating} ({profile.rating_count} تقييم)</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: profile.available ? "#E1F5EE" : "#FFF3E0", color: profile.available ? "#0F6E56" : "#E65100" }}>
              {profile.available ? "متاح للنيابة" : "مشغول حالياً"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {profile.city && (
              <div style={{ background: "#f9f9f7", borderRadius: 10, padding: 12 }}>
                <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>المدينة</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>📍 {profile.city}</p>
              </div>
            )}
            {profile.district && (
              <div style={{ background: "#f9f9f7", borderRadius: 10, padding: 12 }}>
                <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>الحي</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{profile.district}</p>
              </div>
            )}
          </div>

          {profile.skills && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>المهارات</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.skills.split("،").map(s => (
                  <span key={s} style={{ fontSize: 12, background: "#E1F5EE", color: "#0F6E56", padding: "4px 10px", borderRadius: 99 }}>{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {profile.preferred_areas && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>الأحياء المفضلة للنيابة</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.preferred_areas.split("،").map(a => (
                  <span key={a} style={{ fontSize: 12, background: "#f5f5f3", color: "#555", padding: "4px 10px", borderRadius: 99 }}>{a.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {profile.preferred_prayers && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>الصلوات التي يقبل النيابة فيها</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.preferred_prayers.split("،").map(p => (
                  <span key={p} style={{ fontSize: 12, background: "#f5f5f3", color: "#555", padding: "4px 10px", borderRadius: 99 }}>{p.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {profile.available && (
            <button onClick={handleContact} style={{ width: "100%", background: "#25D366", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, cursor: "pointer", marginBottom: 8 }}>
              تواصل عبر واتساب
            </button>
          )}

          {/* زر التقييم */}
          {currentUser ? (
            <button onClick={() => setShowRating(!showRating)} style={{ width: "100%", background: "transparent", color: "#1D9E75", border: "1px solid #1D9E75", borderRadius: 10, padding: "10px", fontSize: 14, cursor: "pointer" }}>
              {showRating ? "إلغاء" : "أضف تقييمك"}
            </button>
          ) : (
            <button onClick={() => window.location.href = "/login"} style={{ width: "100%", background: "transparent", color: "#888", border: "1px solid #ddd", borderRadius: 10, padding: "10px", fontSize: 14, cursor: "pointer" }}>
              سجّل دخول لإضافة تقييم
            </button>
          )}
        </div>

        {/* نموذج التقييم */}
        {showRating && currentUser && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>أضف تقييمك</h3>

            <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>اسمك</label>
            <input style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} placeholder="اسمك الكريم" value={ratingForm.name} onChange={e => setRatingForm({ ...ratingForm, name: e.target.value })} />

            <label style={{ fontSize: 13, color: "#555", marginBottom: 8, display: "block" }}>التقييم</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRatingForm({ ...ratingForm, rating: n })} style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid", borderColor: ratingForm.rating >= n ? "#F59E0B" : "#ddd", background: ratingForm.rating >= n ? "#FEF3C7" : "#fff", color: ratingForm.rating >= n ? "#F59E0B" : "#888", fontSize: 18, cursor: "pointer" }}>★</button>
              ))}
            </div>

            <label style={{ fontSize: 13, color: "#555", marginBottom: 4, display: "block" }}>تعليق (اختياري)</label>
            <textarea style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 12, boxSizing: "border-box", height: 80, resize: "none" }} placeholder="شاركنا تجربتك..." value={ratingForm.comment} onChange={e => setRatingForm({ ...ratingForm, comment: e.target.value })} />

            {message && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("خطأ") || message.includes("يرجى") ? "#FFF3E0" : "#E1F5EE", color: message.includes("خطأ") || message.includes("يرجى") ? "#E65100" : "#0F6E56", fontSize: 13 }}>{message}</div>
            )}

            <button onClick={handleRating} disabled={submitting} style={{ width: "100%", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}>
              {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </div>
        )}

        {/* التقييمات */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: ratings.length === 0 ? 0 : 16 }}>
            التقييمات {ratings.length > 0 ? `(${ratings.length})` : ""}
          </h3>
          {ratings.length === 0 ? (
            <p style={{ fontSize: 13, color: "#aaa", marginTop: 8 }}>لا توجد تقييمات بعد</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ratings.map(r => (
                <div key={r.id} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{r.reviewer_name}</span>
                    <span style={{ color: "#F59E0B", fontSize: 14 }}>{stars(r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: "#666" }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}