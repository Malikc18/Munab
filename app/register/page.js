"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const citiesData = {
  "منطقة القصيم": {
    "بريدة": [" الربوة", " سلطانة", " الروضة", " الهدية", " الشقة", "الأخضر", " الإسكان", " المنتزه", "حي الريان", "حي الزراعي", "حي الحمر", "حي مشعل", " الصفراء", "حي النهضة", "الفايزية", "أخرى"],
    "عنيزة": ["حي الغراء", "حي النهضة", "حي الروضة", "حي المحمدية", "حي الصناعية", "حي الفلاح", "حي السلام", "أخرى"],
    "الرس": ["حي الوسط", "حي النخيل", "حي الفيصلية", "حي المروج", "حي السلام", "أخرى"],
    "المذنب": ["حي الوسط", "حي الشرقي", "حي الغربي", "حي النخيل", "أخرى"],
    "الأسياح": ["حي الوسط", "حي الشمالي", "حي الجنوبي", "أخرى"],
    "البكيرية": ["حي الوسط", "حي النخيل", "حي الفيصلية", "أخرى"],
    "البدائع": ["حي الوسط", "حي الشرقي", "حي الغربي", "أخرى"],
    "عيون الجواء": ["حي الوسط", "حي النخيل", "أخرى"],
    "ضرية": ["حي الوسط", "حي الشمالي", "أخرى"],
  },
  "منطقة الرياض": {
    "الرياض": ["حي النخيل", "حي العليا", "حي الملقا", "حي الروضة", "حي السليمانية", "حي الورود", "حي الربيع", "حي الغدير", "حي المونسية", "حي الياسمين", "حي الصحافة", "حي الشفاء", "حي المرسلات", "حي بدر", "حي الرمال", "حي الفلاح", "حي النزهة", "حي الصفا", "حي طويق", "أخرى"],
    "الخرج": ["حي الجنوبي", "حي الشمالي", "حي النزهة", "حي الروضة", "أخرى"],
    "الدرعية": ["حي الوسط", "حي الطريف", "حي النخيل", "أخرى"],
    "المجمعة": ["حي الوسط", "حي الفيصلية", "حي النزهة", "أخرى"],
    "الزلفي": ["حي الوسط", "حي الشمالي", "حي الجنوبي", "أخرى"],
    "وادي الدواسر": ["حي الوسط", "حي النخيل", "حي الروضة", "أخرى"],
  },
  "منطقة مكة المكرمة": {
    "مكة المكرمة": ["حي العزيزية", "حي الشوقية", "حي النسيم", "حي الرصيفة", "حي الهجرة", "حي العوالي", "حي الزاهر", "حي أجياد", "أخرى"],
    "جدة": ["حي الروضة", "حي الزهراء", "حي السلامة", "حي الصفا", "حي البوادي", "حي الفيصلية", "حي الحمراء", "حي النزهة", "حي الربوة", "حي مشرفة", "حي الكندرة", "حي أبحر الشمالية", "أخرى"],
    "الطائف": ["حي الفيصلية", "حي النزهة", "حي الروضة", "حي الملك فهد", "حي السلامة", "أخرى"],
  },
  "منطقة المدينة المنورة": {
    "المدينة المنورة": ["حي العزيزية", "حي قباء", "حي الجماوات", "حي السلام", "حي الحرة الغربية", "حي شوران", "حي بني حارثة", "حي المناخة", "أخرى"],
    "ينبع": ["حي الروضة", "حي الشرقي", "حي الغربي", "حي النزهة", "أخرى"],
    "العلا": ["حي الوسط", "حي الشمالي", "أخرى"],
  },
  "المنطقة الشرقية": {
    "الدمام": ["حي الشاطئ", "حي الفيصلية", "حي العنود", "حي الجلوية", "حي البادية", "حي النور", "حي الشعلة", "أخرى"],
    "الخبر": ["حي العقربية", "حي الكورنيش", "حي الراكة", "حي الثقبة", "حي الصفا", "حي اليرموك", "أخرى"],
    "الأحساء": ["حي المبرز", "حي الهفوف", "حي الكلابية", "حي الرفعة", "حي البطالية", "أخرى"],
    "الجبيل": ["حي الفناتير", "حي الروضة", "حي النزهة", "أخرى"],
    "حفر الباطن": ["حي الوسط", "حي الشمالي", "حي الجنوبي", "أخرى"],
    "القطيف": ["حي الوسط", "حي الشمالي", "حي العوامية", "أخرى"],
  },
  "منطقة عسير": {
    "أبها": ["حي المنهل", "حي الوسام", "حي الربوة", "حي الأندلس", "أخرى"],
    "خميس مشيط": ["حي الوسط", "حي الشمالي", "حي الجنوبي", "حي النزهة", "أخرى"],
    "بيشة": ["حي الوسط", "حي الشمالي", "حي الروضة", "أخرى"],
  },
  "منطقة تبوك": {
    "تبوك": ["حي الروضة", "حي الوادي", "حي الصالحية", "حي الملك فهد", "حي الأندلس", "أخرى"],
    "تيماء": ["حي الوسط", "حي الشمالي", "أخرى"],
  },
  "منطقة حائل": {
    "حائل": ["حي الروضة", "حي الفيصلية", "حي النزهة", "حي الملك فهد", "أخرى"],
    "بقعاء": ["حي الوسط", "حي الشمالي", "أخرى"],
  },
  "منطقة جازان": {
    "جازان": ["حي الروضة", "حي الكورنيش", "حي النزهة", "حي الملك فهد", "أخرى"],
    "صبيا": ["حي الوسط", "حي الشمالي", "أخرى"],
    "أبو عريش": ["حي الوسط", "حي الجنوبي", "أخرى"],
  },
  "منطقة نجران": {
    "نجران": ["حي الفيصلية", "حي النزهة", "حي الروضة", "حي الملك فهد", "أخرى"],
  },
  "منطقة الباحة": {
    "الباحة": ["حي الوسط", "حي الشمالي", "حي الروضة", "أخرى"],
    "بلجرشي": ["حي الوسط", "حي الشمالي", "أخرى"],
  },
  "منطقة الجوف": {
    "سكاكا": ["حي الروضة", "حي النزهة", "حي الملك فهد", "أخرى"],
    "دومة الجندل": ["حي الوسط", "حي الشمالي", "أخرى"],
  },
  "منطقة الحدود الشمالية": {
    "عرعر": ["حي الروضة", "حي الفيصلية", "حي النزهة", "أخرى"],
    "رفحاء": ["حي الوسط", "حي الشمالي", "أخرى"],
  },
};

const typeOptions = [
  { value: "imam", label: "إمام" },
  { value: "muathin", label: "مؤذن" },
  { value: "teacher", label: "معلم حلقة" },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [districtOther, setDistrictOther] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    types: [],
    phone: "",
    skills: "",
  });

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const toggleType = (val) => {
    setForm((prev) => {
      const current = prev.types;
      if (current.includes(val)) {
        return { ...prev, types: current.filter((t) => t !== val) };
      } else {
        return { ...prev, types: [...current, val] };
      }
    });
  };

  const getRole = () => {
    const t = form.types;
    if (t.includes("imam") && t.includes("muathin") && t.includes("teacher")) return "إمام ومؤذن ومعلم حلقة";
    if (t.includes("imam") && t.includes("muathin")) return "إمام ومؤذن";
    if (t.includes("imam") && t.includes("teacher")) return "إمام ومعلم حلقة";
    if (t.includes("muathin") && t.includes("teacher")) return "مؤذن ومعلم حلقة";
    if (t.includes("imam")) return "إمام وخطيب";
    if (t.includes("muathin")) return "مؤذن";
    if (t.includes("teacher")) return "معلم حلقة";
    return "";
  };

  const handleRegister = async () => {
    if (!form.name || form.types.length === 0 || !city || !district || !form.phone) {
      setMessage("يرجى تعبئة جميع الحقول");
      return;
    }
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setMessage("خطأ: " + error.message);
      setLoading(false);
      return;
    }
    const userId = data.user?.id;
    const finalDistrict = district === "أخرى" ? districtOther : district;
    if (userId) {
      await supabase.from("profiles").insert({
  id: userId,
  user_id: userId,
        name: form.name,
        type: form.types[0],
        city: city,
        district: finalDistrict,
        phone: form.phone,
        skills: form.skills,
        available: true,
        role: getRole(),
      });
    }
    setMessage("تم التسجيل! تحقق من بريدك الإلكتروني لتأكيد الحساب ✅");
    setLoading(false);
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

  const labelStyle = {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 32, width: "100%", maxWidth: 460 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ fontSize: 18, fontWeight: 500 }}>مُناب</span>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>إنشاء حساب جديد</h2>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>سجّل بياناتك لتظهر للباحثين عن بديل</p>

        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: step >= s ? "#1D9E75" : "#eee" }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <label style={labelStyle}>البريد الإلكتروني</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />

            <label style={labelStyle}>كلمة المرور</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="٨ أحرف على الأقل"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />

            {message && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: "#FFF3E0", color: "#E65100", fontSize: 13 }}>
                {message}
              </div>
            )}

            <button style={btnStyle} onClick={() => {
              if (!form.email || !form.password) { setMessage("يرجى تعبئة جميع الحقول"); return; }
              if (form.password.length < 8) { setMessage("كلمة المرور يجب أن تكون ٨ أحرف على الأقل"); return; }
              setMessage("");
              setStep(2);
            }}>التالي</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label style={labelStyle}>الاسم الكامل</label>
            <input
              style={inputStyle}
              placeholder="عبدالله المطيري"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />

            <label style={labelStyle}>التخصص (يمكن اختيار أكثر من واحد)</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {typeOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 99,
                    border: "1px solid",
                    borderColor: form.types.includes(t.value) ? "#1D9E75" : "#ddd",
                    background: form.types.includes(t.value) ? "#E1F5EE" : "#fff",
                    color: form.types.includes(t.value) ? "#0F6E56" : "#666",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >{t.label}</button>
              ))}
            </div>

            <label style={labelStyle}>المنطقة</label>
            <select
              style={inputStyle}
              value={region}
              onChange={(e) => { setRegion(e.target.value); setCity(""); setDistrict(""); }}
            >
              <option value="">اختر المنطقة</option>
              {Object.keys(citiesData).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {region !== "" && (
              <div>
                <label style={labelStyle}>المدينة</label>
                <select
                  style={inputStyle}
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setDistrict(""); }}
                >
                  <option value="">اختر المدينة</option>
                  {Object.keys(citiesData[region]).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {city !== "" && (
              <div>
                <label style={labelStyle}>الحي</label>
                <select
                  style={inputStyle}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">اختر الحي</option>
                  {citiesData[region][city].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {district === "أخرى" && (
              <div>
                <label style={labelStyle}>اكتب اسم الحي</label>
                <input
                  style={inputStyle}
                  placeholder="اسم الحي"
                  value={districtOther}
                  onChange={(e) => setDistrictOther(e.target.value)}
                />
              </div>
            )}

            <label style={labelStyle}>رقم الجوال</label>
            <input
              style={inputStyle}
              placeholder="05xxxxxxxx"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />

            <label style={labelStyle}>المهارات (افصل بينها بفاصلة)</label>
            <input
              style={inputStyle}
              placeholder="حافظ للقرآن، خطبة جمعة، تراويح"
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
            />

            {message && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: message.includes("خطأ") ? "#FFF3E0" : "#E1F5EE", color: message.includes("خطأ") ? "#E65100" : "#0F6E56", fontSize: 13 }}>
                {message}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...btnStyle, background: "#f5f5f3", color: "#555", width: "30%" }} onClick={() => setStep(1)}>رجوع</button>
              <button style={{ ...btnStyle, width: "70%" }} onClick={handleRegister} disabled={loading}>
                {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 20 }}>
          عندك حساب؟ <a href="/login" style={{ color: "#1D9E75", textDecoration: "none" }}>تسجيل الدخول</a>
        </p>
      </div>
    </div>
  );
}