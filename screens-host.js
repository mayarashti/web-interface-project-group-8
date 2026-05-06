/* ─────────────────────────────────────────
   screens-host.js  —  S18 + S16 + S17
   (host family flow)
───────────────────────────────────────── */

/* SCREEN 18 — Host Explanation */
function S18HostExplain({ onNext, onBack }) {
  const features = [
    { icon: '🪖', title: 'חיילים מאומתים',    desc: 'כל חייל עובר תהליך אימות לפני שיכול לפנות למשפחות' },
    { icon: '📅', title: 'אתם קובעים מתי',    desc: 'אתם מחליטים אם ומתי לארח — אין התחייבות קבועה' },
    { icon: '✅', title: 'התאמה מדויקת',       desc: 'נתאים לכם חיילים לפי כשרות, שפה והעדפות הבית' },
    { icon: '🔒', title: 'תקשורת מאובטחת',    desc: 'כל התקשורת עם החיילים עוברת דרך המערכת שלנו' },
  ];
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <div className="flex-1">
        <SectionTitle icon="🏡" title="איך זה עובד?" sub="כל מה שצריך לדעת לפני שמתחילים" />
        <div className="space-y-3 mb-8">
          {features.map(f => (
            <Card key={f.icon} className="flex gap-4 items-start p-4">
              <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-xs text-warm-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Btn onClick={onNext}>התחל הרשמה ←</Btn>
    </div>
  );
}

/* SCREEN 16 — Host Family Registration (4 internal steps) */
function S16HostRegistration({ data, setData, onNext, onBack }) {
  const TOTAL_STEPS = 5;
  const [internalStep, setInternalStep] = useState(1);
  const [errors, setErrors]             = useState({});

  const set = (key) => (val) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const STEP_LABELS = ['פרטים אישיים', 'סוג אירוח', 'אורח החיים', 'שירותים', 'אופי הבית'];

  const CAPACITY_OPTIONS = ['1', '2', '3', '4', '5+'];

  const LANG_OPTIONS = [
    { value: 'he',    label: '🇮🇱 עברית'  },
    { value: 'en',    label: '🇺🇸 אנגלית' },
    { value: 'ru',    label: '🇷🇺 רוסית'  },
    { value: 'ar',    label: '🇸🇦 ערבית'  },
    { value: 'fr',    label: '🇫🇷 צרפתית' },
    { value: 'other', label: '🌍 אחר'    },
  ];

  const VIBE_TAGS = [
    { value: 'kids',         label: '👨‍👩‍👧 בית עם ילדים' },
    { value: 'quiet',        label: '🤫 בית שקט'         },
    { value: 'multilingual', label: '🌍 דוברי שפות'       },
    { value: 'singing',      label: '🎵 אוהבי שירה'       },
    { value: 'pets',         label: '🐾 יש חיות בית'      },
    { value: 'spacious',     label: '🏠 בית מרווח'         },
    { value: 'shabbat_atm',  label: '🕯️ אווירה שבתית'     },
    { value: 'food_lovers',  label: '🍲 אוהבי בישול'      },
  ];

  /* ── validators, one per step ── */
  const validators = {
    1: () => {
      const e = {};
      if (!data.hostFullName?.trim()) e.hostFullName = 'שם מלא הוא שדה חובה';
      if (!data.hostPhone?.trim() || data.hostPhone.replace(/\D/g,'').length < 9) e.hostPhone = 'הכנס מספר טלפון תקין';
      if (!data.hostEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.hostEmail)) e.hostEmail = 'הכנס כתובת אימייל תקינה';
      return e;
    },
    2: () => {
      const e = {};
      if (!data.hostingTypes?.length) e.hostingTypes = 'יש לבחור לפחות סוג אירוח אחד';
      if (!data.hostCity?.trim())     e.hostCity      = 'יש להזין עיר או כתובת';
      return e;
    },
    3: () => {
      const e = {};
      if (!data.shabbatObservance) e.shabbatObservance = 'יש לבחור רמת שמירת שבת';
      if (!data.hostKosher)        e.hostKosher        = 'יש לבחור רמת כשרות';
      return e;
    },
    4: () => ({}), /* שירותים — הכל אופציונלי */
    5: () => {
      const e = {};
      if (!data.hostCapacity) e.hostCapacity = 'יש לבחור מספר חיילים מרבי';
      return e;
    },
  };

  /* ── navigation ── */
  const advance = () => {
    const e = validators[internalStep]();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    if (internalStep < TOTAL_STEPS) setInternalStep(s => s + 1);
    else onNext();
  };

  const handleBack = () => {
    setErrors({});
    if (internalStep === 1) onBack();
    else setInternalStep(s => s - 1);
  };

  /* ── step indicator (shared across all 4 steps) ── */
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div key={n} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="flex items-center w-full">
              <div className={clsx('flex-1 h-px transition-all duration-300',
                n === 1 ? 'invisible' : internalStep >= n ? 'bg-brand-400' : 'bg-warm-200')} />
              <div className={clsx(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 flex-shrink-0',
                internalStep === n ? 'bg-brand-600 text-white shadow-md ring-4 ring-brand-100'
                  : internalStep > n ? 'bg-brand-500 text-white'
                  : 'bg-warm-200 text-warm-400'
              )}>
                {internalStep > n ? '✓' : n}
              </div>
              <div className={clsx('flex-1 h-px transition-all duration-300',
                n === TOTAL_STEPS ? 'invisible' : internalStep > n ? 'bg-brand-400' : 'bg-warm-200')} />
            </div>
            <span
              className={clsx('text-center leading-tight transition-colors',
                internalStep === n ? 'text-brand-600 font-semibold' : 'text-warm-400')}
              style={{ fontSize: '0.65rem', maxWidth: '3.5rem' }}
            >
              {STEP_LABELS[n - 1]}
            </span>
          </div>
        ))}
      </div>
      <ProgressBar step={internalStep} total={TOTAL_STEPS} />
    </div>
  );

  /* ══ STEP 1 — Personal Details ══ */
  if (internalStep === 1) return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={handleBack} />
      <StepIndicator />
      <SectionTitle icon="🏡" title="הרשמת משפחה מארחת" sub="בואו נכיר אתכם לפני שנפגיש אתכם עם חיילים 🕯️" />

      <Card className="mb-5 bg-brand-50 border-brand-100 flex gap-3 items-start">
        <span className="text-2xl flex-shrink-0">💛</span>
        <p className="text-sm text-brand-800 leading-relaxed">תודה שבחרתם לפתוח את ביתכם לחיילים. מלאו את הפרטים ונחזור אליכם בהקדם!</p>
      </Card>

      <Input label="שם מלא"        value={data.hostFullName||''} onChange={set('hostFullName')} placeholder="שם פרטי ושם משפחה" error={errors.hostFullName} />
      <Input label="מספר טלפון" type="tel"   value={data.hostPhone||''}    onChange={set('hostPhone')}    placeholder="050-1234567"       error={errors.hostPhone}    hint="נשתמש בו ליצירת קשר לפני שישי" />
      <Input label="כתובת אימייל" type="email" value={data.hostEmail||''}  onChange={set('hostEmail')}    placeholder="family@gmail.com"  error={errors.hostEmail} />

      <div className="mt-auto pt-4"><Btn onClick={advance}>המשך ←</Btn></div>
    </div>
  );

  /* ══ STEP 2 — Hosting Type · Location · Language ══ */
  if (internalStep === 2) return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto pb-10">
      <BackBtn onBack={handleBack} />
      <StepIndicator />
      <SectionTitle icon="🍽️" title="סוג אירוח ומיקום" sub="ספרו לנו מה אתם מציעים ואיפה אתם נמצאים" />

      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2.5">סוג אירוח מועדף</p>
        <p className="text-xs text-warm-400 mb-3">אפשר לבחור יותר מאפשרות אחת</p>
        <div className="flex flex-col gap-2.5">
          {[
            { value: 'friday_dinner', label: '🍽️ ארוחת ליל שישי',    sub: 'סעודת שבת — ארוחה ראשונה'       },
            { value: 'shabbat_lunch', label: '☀️ ארוחת צהריים שבת',   sub: 'סעודת היום — ארוחה שנייה'        },
            { value: 'delivery',      label: '📦 משלוח מנות לבסיסים', sub: 'שליחת מנות חמות לחיילים בבסיס'   },
          ].map(opt => {
            const selected = (data.hostingTypes||[]).includes(opt.value);
            const toggle = () => {
              const cur = data.hostingTypes||[];
              set('hostingTypes')(selected ? cur.filter(v => v !== opt.value) : [...cur, opt.value]);
            };
            return (
              <label key={opt.value} onClick={toggle} className={clsx(
                'flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
                selected ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-warm-200 bg-white hover:border-brand-300 hover:bg-warm-50'
              )}>
                <div className={clsx(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  selected ? 'bg-brand-600 border-brand-600' : 'border-warm-300 bg-white'
                )}>
                  {selected && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                  <p className="text-xs text-warm-500 mt-0.5">{opt.sub}</p>
                </div>
              </label>
            );
          })}
        </div>
        {errors.hostingTypes && <p className="mt-2 text-xs text-red-500 font-medium">{errors.hostingTypes}</p>}
      </div>

      <Input label="כתובת בית / עיר" value={data.hostCity||''} onChange={set('hostCity')}
        placeholder="לדוגמה: חיפה, רחוב הרצל 12..." error={errors.hostCity}
        hint="כתובת מדויקת מאפשרת התאמה מיטבית לחיילים מקרוב" />

      <MultiCheck label="שפות שמדברים בבית" options={LANG_OPTIONS} values={data.hostLanguages||[]} onChange={val => set('hostLanguages')(val)} />

      <div className="mt-auto pt-4"><Btn onClick={advance}>המשך ←</Btn></div>
    </div>
  );

  /* ══ STEP 3 — Shabbat Observance · Kashrut ══ */
  if (internalStep === 3) return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto pb-10">
      <BackBtn onBack={handleBack} />
      <StepIndicator />
      <SectionTitle icon="🕯️" title="אורח החיים" sub="פרטים אלו עוזרים לנו להתאים חיילים עם אותן ציפיות" />

      <RadioGroup label="רמת שמירת שבת" value={data.shabbatObservance||''} onChange={set('shabbatObservance')}
        options={[
          { value: 'observant',   label: '🕯️ שומרי שבת', sub: 'ללא חשמל, שבת מלאה לפי ההלכה'    },
          { value: 'traditional', label: '🍷 מסורתי',      sub: 'קידוש, ארוחה חמה ואווירה שבתית'  },
          { value: 'secular',     label: '✌️ חילוני',       sub: 'ארוחה חמה ואווירה נעימה ומשפחתית' },
        ]}
      />
      {errors.shabbatObservance && <p className="text-xs text-red-500 font-medium -mt-3 mb-4">{errors.shabbatObservance}</p>}

      <RadioGroup label="כשרות" value={data.hostKosher||''} onChange={set('hostKosher')}
        options={[
          { value: 'mehadrin', label: '✡️ כשר למהדרין', sub: 'הכשר מהדרין, ללא חשש עירוב' },
          { value: 'kosher',   label: '🍽️ כשר',          sub: 'בשר/חלב נפרדים ותו הכשר'   },
          { value: 'none',     label: '🤝 לא חשוב',       sub: 'מתאים לכל סוג חייל'         },
        ]}
      />
      {errors.hostKosher && <p className="text-xs text-red-500 font-medium -mt-3 mb-4">{errors.hostKosher}</p>}

      <div className="mt-auto pt-2"><Btn onClick={advance}>המשך ←</Btn></div>
    </div>
  );

  /* ══ STEP 4 — Additional Services ══ */
  if (internalStep === 4) return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto pb-10">
      <BackBtn onBack={handleBack} />
      <StepIndicator />
      <SectionTitle icon="🤝" title="שירותים נוספים" sub="כל תוספת עוזרת לנו להתאים לכם חיילים שמחפשים בדיוק את זה" />

      <Card className="mb-4">
        <div className="space-y-4">
          <CheckRow checked={!!data.hostCanSleep} onChange={set('hostCanSleep')}>
            <span>
              <span className="font-medium text-gray-800">🛏️ מקום לינה</span>
              <br/><span className="text-warm-400">יכולים לספק מקום שינה לחייל/ת בשבת</span>
            </span>
          </CheckRow>
          <CheckRow checked={!!data.hostCanTransport} onChange={set('hostCanTransport')}>
            <span>
              <span className="font-medium text-gray-800">🚗 הסעה</span>
              <br/><span className="text-warm-400">יכולים להסיע מ/לבסיס או לתחנה קרובה</span>
            </span>
          </CheckRow>
        </div>
      </Card>

      <Card className="bg-brand-50 border-brand-100 flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">💡</span>
        <p className="text-xs text-brand-800 leading-relaxed">
          אם לא תסמנו כלום — נתאים לכם חיילים לארוחה בלבד. אפשר לעדכן בכל עת מהפרופיל.
        </p>
      </Card>

      <div className="mt-auto pt-5"><Btn onClick={advance}>המשך ←</Btn></div>
    </div>
  );

  /* ══ STEP 5 — Capacity · Home Atmosphere ══ */
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto pb-10">
      <BackBtn onBack={handleBack} />
      <StepIndicator />
      <SectionTitle icon="🏠" title="אופי הבית" sub="כמה פרטים אחרונים ואתם מוכנים!" />

      {/* Capacity selector */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">מקסימום חיילים לאירוח</p>
        <p className="text-xs text-warm-400 mb-3">כמה חיילים תוכלו לארח בסעודה אחת?</p>
        <div className="flex gap-2.5">
          {CAPACITY_OPTIONS.map(cap => (
            <button key={cap} type="button" onClick={() => set('hostCapacity')(cap)}
              className={clsx(
                'flex-1 h-12 rounded-xl text-sm font-bold border-2 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-300',
                data.hostCapacity === cap
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-105'
                  : 'bg-white text-gray-600 border-warm-300 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700'
              )}
            >{cap}</button>
          ))}
        </div>
        {errors.hostCapacity && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.hostCapacity}</p>}
      </div>

      {/* Home atmosphere tags */}
      <div className="mb-2">
        <p className="text-sm font-semibold text-gray-700 mb-1.5">תגיות אופי הבית</p>
        <p className="text-xs text-warm-400 mb-3">בחרו תגיות שמתארות את הבית שלכם — עוזר לחיילים להרגיש בנוח</p>
        <MultiCheck options={VIBE_TAGS} values={data.hostVibeTags||[]} onChange={val => set('hostVibeTags')(val)} />
      </div>

      <div className="border-t border-warm-200 my-5" />

      {/* Live summary */}
      <Card className="mb-5 bg-warm-50 border-warm-200">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">סיכום הרשמה</p>
        <div className="space-y-2">
          {[
            { label: 'שם',     val: data.hostFullName },
            { label: 'עיר',    val: data.hostCity },
            { label: 'אירוח',  val: (data.hostingTypes||[]).map(t =>
                t === 'friday_dinner' ? 'ארוחת ליל שישי' :
                t === 'shabbat_lunch' ? 'ארוחת צהריים שבת' :
                t === 'delivery'      ? 'משלוח לבסיסים' : t
              ).join(', ') || null },
            { label: 'שבת',    val: data.shabbatObservance === 'observant' ? 'שומרי שבת' : data.shabbatObservance === 'traditional' ? 'מסורתי' : data.shabbatObservance === 'secular' ? 'חילוני' : null },
            { label: 'כשרות',  val: data.hostKosher === 'mehadrin' ? 'כשר למהדרין' : data.hostKosher === 'kosher' ? 'כשר' : data.hostKosher === 'none' ? 'לא חשוב' : null },
            { label: 'קיבולת', val: data.hostCapacity ? `עד ${data.hostCapacity} חיילים` : null },
          ].filter(r => r.val).map(r => (
            <div key={r.label} className="flex justify-between text-xs">
              <span className="text-warm-500">{r.label}</span>
              <span className="font-medium text-gray-800">{r.val}</span>
            </div>
          ))}
          {data.hostVibeTags?.length > 0 && (
            <div className="flex justify-between text-xs items-start gap-2">
              <span className="text-warm-500 flex-shrink-0">תגיות</span>
              <span className="font-medium text-gray-800 text-left leading-relaxed">
                {data.hostVibeTags.map(t => VIBE_TAGS.find(v => v.value === t)?.label || t).join(' · ')}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Btn onClick={advance} className="text-base py-4">השלם ורשום פרופיל 🏡</Btn>
    </div>
  );
}

/* SCREEN 17 — Host Registration Success */
function S17HostSuccess({ onHome, name }) {
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center shadow-xl">
          <span className="text-5xl">🏡</span>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">ברוכים הבאים!</h1>
      <p className="text-xl font-semibold text-brand-600 mb-2">{name}</p>
      <p className="text-base text-green-600 font-bold mb-1">✅ ההרשמה הושלמה בהצלחה</p>
      <p className="text-sm text-warm-500 mb-10 leading-relaxed">
        אתם עכשיו חלק ממשפחת מארחי שבת.<br/>חיילים יוכלו למצוא אתכם ולבקש אירוח לשישי! 🕯️
      </p>
      <Btn onClick={onHome} className="text-lg py-4">לעמוד הבית 🏠</Btn>
    </div>
  );
}

/* SCREEN 20 — Create New Hosting */
function S20NewHosting({ data, onBack, onSubmit }) {
  const [form, setForm] = useState({
    date: '',
    time: '',
    customTime: '',
    soldiers: data.hostCapacity || '',
    note: '',
    images: [],
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  /* ── generate next 4 Fridays and their Saturdays ── */
  const upcomingDates = (() => {
    const dates = [];
    const today = new Date();
    let d = new Date(today);
    // advance to next Friday
    d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
    for (let i = 0; i < 4; i++) {
      const fri = new Date(d);
      const sat = new Date(d); sat.setDate(sat.getDate() + 1);
      dates.push({
        value: fri.toISOString().split('T')[0],
        dayLabel: "שישי",
        dateLabel: fri.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' }),
        satLabel: sat.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' }),
      });
      d.setDate(d.getDate() + 7);
    }
    return dates;
  })();

  const TIME_OPTIONS = [
    { value: 'friday_evening', label: '🌆 ערב שישי', sub: 'ארוחת ליל שבת ~19:00' },
    { value: 'saturday_lunch', label: '☀️ צהריים שבת', sub: 'ארוחת שבת ~12:30' },
    { value: 'custom',         label: '🕐 שעה אחרת', sub: 'בחר שעה מותאמת אישית' },
  ];

  const SOLDIER_OPTIONS = ['1', '2', '3', '4', '5+'];

  const validate = () => {
    const e = {};
    if (!form.date)    e.date    = 'יש לבחור תאריך';
    if (!form.time)    e.time    = 'יש לבחור שעה';
    if (!form.soldiers) e.soldiers = 'יש לבחור מספר חיילים';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => onSubmit(), 1800);
  };

  const handleImageAdd = () => {
    // mock — add a placeholder image
    const colors = ['#fbd5b0','#f7b87a','#e87020','#c2560e','#9c420c'];
    const color = colors[form.images.length % colors.length];
    setF('images')([...form.images, { id: Date.now(), color }]);
  };

  if (submitted) return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-lg">
        <span className="text-5xl">✅</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">האירוח פורסם!</h1>
      <p className="text-sm text-warm-500 leading-relaxed">חיילים באזורכם יוכלו לראות את האירוח ולבקש להצטרף</p>
      <div className="flex gap-1.5 justify-center mt-6">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
      </div>
    </div>
  );

  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto pb-12">
      <BackBtn onBack={onBack} />
      <SectionTitle icon="🏡" title="פתיחת אירוח חדש" sub="מלאו את הפרטים וחיילים יוכלו להירשם" />

      {/* ── Date picker ── */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">בחרו תאריך</p>
        <p className="text-xs text-warm-400 mb-3">השישי הקרוב מסומן ראשון</p>
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {upcomingDates.map(d => (
            <button key={d.value} type="button" onClick={() => setF('date')(d.value)}
              className={clsx(
                'p-3.5 rounded-xl border-2 text-right transition-all duration-150 active:scale-95',
                form.date === d.value
                  ? 'border-brand-500 bg-brand-50 shadow-sm'
                  : 'border-warm-200 bg-white hover:border-brand-300 hover:bg-warm-50'
              )}
            >
              <p className={clsx('text-xs font-semibold mb-0.5', form.date === d.value ? 'text-brand-600' : 'text-warm-500')}>
                {d.dayLabel}
              </p>
              <p className={clsx('text-sm font-bold', form.date === d.value ? 'text-brand-700' : 'text-gray-800')}>
                {d.dateLabel}
              </p>
              <p className="text-xs text-warm-400 mt-0.5">שבת {d.satLabel}</p>
            </button>
          ))}
        </div>
        {/* Custom date fallback */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-warm-200" />
          <span className="text-xs text-warm-400">או בחרו תאריך אחר</span>
          <div className="flex-1 h-px bg-warm-200" />
        </div>
        <input
          type="date"
          value={form.date}
          onChange={e => setF('date')(e.target.value)}
          className="mt-3 w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
        />
        {errors.date && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.date}</p>}
      </div>

      {/* ── Time ── */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2.5">שעת האירוח</p>
        <div className="flex flex-col gap-2">
          {TIME_OPTIONS.map(opt => (
            <label key={opt.value} onClick={() => setF('time')(opt.value)}
              className={clsx(
                'flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
                form.time === opt.value ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-warm-200 bg-white hover:border-brand-300 hover:bg-warm-50'
              )}
            >
              <div className={clsx(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                form.time === opt.value ? 'border-brand-600' : 'border-warm-300'
              )}>
                {form.time === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-warm-500">{opt.sub}</p>
              </div>
            </label>
          ))}
        </div>
        {form.time === 'custom' && (
          <input
            type="time"
            value={form.customTime}
            onChange={e => setF('customTime')(e.target.value)}
            className="mt-3 w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
          />
        )}
        {errors.time && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.time}</p>}
      </div>

      {/* ── Soldier count ── */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">כמה חיילים לאירוח זה?</p>
        <p className="text-xs text-warm-400 mb-3">ניתן לשנות לכל אירוח בנפרד</p>
        <div className="flex gap-2.5">
          {SOLDIER_OPTIONS.map(n => (
            <button key={n} type="button" onClick={() => setF('soldiers')(n)}
              className={clsx(
                'flex-1 h-12 rounded-xl text-sm font-bold border-2 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-300',
                form.soldiers === n
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-105'
                  : 'bg-white text-gray-600 border-warm-300 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700'
              )}
            >{n}</button>
          ))}
        </div>
        {errors.soldiers && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.soldiers}</p>}
      </div>

      {/* ── Free text ── */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">הערה חופשית (אופציונלי)</label>
        <p className="text-xs text-warm-400 mb-2">ספרו לחיילים משהו על האירוח — מה יהיה בתפריט, אווירה, וכו'</p>
        <textarea
          value={form.note}
          onChange={e => setF('note')(e.target.value)}
          placeholder="לדוגמה: נכין חמין מסורתי, יש פסנתר בבית, מרפסת נוף לים... 🎵"
          rows={4}
          maxLength={300}
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all"
        />
        <p className="text-xs text-warm-400 mt-1 text-left">{form.note.length}/300</p>
      </div>

      {/* ── Images ── */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-1.5">תמונות (אופציונלי)</p>
        <p className="text-xs text-warm-400 mb-3">תמונות של הבית, הארוחה או האווירה — עוזר לחיילים להתחבר</p>
        <div className="flex gap-2.5 flex-wrap">
          {form.images.map((img, i) => (
            <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
              <div className="w-full h-full flex items-center justify-center text-2xl" style={{background: img.color}}>
                🏠
              </div>
              <button
                type="button"
                onClick={() => setF('images')(form.images.filter((_,j) => j !== i))}
                className="absolute top-1 left-1 w-5 h-5 bg-gray-800 bg-opacity-60 rounded-full text-white text-xs flex items-center justify-center hover:bg-opacity-80"
              >✕</button>
            </div>
          ))}
          {form.images.length < 5 && (
            <button type="button" onClick={handleImageAdd}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-warm-300 bg-warm-50 flex flex-col items-center justify-center gap-1 hover:border-brand-400 hover:bg-brand-50 transition-all flex-shrink-0"
            >
              <span className="text-2xl">📷</span>
              <span className="text-xs text-warm-400">הוסף</span>
            </button>
          )}
        </div>
        {form.images.length > 0 && (
          <p className="text-xs text-warm-400 mt-2">{form.images.length}/5 תמונות</p>
        )}
      </div>

      {/* ── Summary preview ── */}
      {(form.date || form.time || form.soldiers) && (
        <Card className="mb-5 bg-warm-50 border-warm-200">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2.5">תצוגה מקדימה</p>
          <div className="space-y-1.5">
            {form.date && (
              <div className="flex justify-between text-xs">
                <span className="text-warm-500">תאריך</span>
                <span className="font-medium text-gray-800">
                  {new Date(form.date).toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long' })}
                </span>
              </div>
            )}
            {form.time && (
              <div className="flex justify-between text-xs">
                <span className="text-warm-500">שעה</span>
                <span className="font-medium text-gray-800">
                  {form.time === 'friday_evening' ? 'ערב שישי ~19:00'
                    : form.time === 'saturday_lunch' ? 'צהריים שבת ~12:30'
                    : form.customTime || 'שעה מותאמת'}
                </span>
              </div>
            )}
            {form.soldiers && (
              <div className="flex justify-between text-xs">
                <span className="text-warm-500">מקומות</span>
                <span className="font-medium text-gray-800">עד {form.soldiers} חיילים</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <Btn onClick={handleSubmit} className="text-base py-4">פרסם אירוח 🕯️</Btn>
    </div>
  );
}

function S19HostHome({ data, onNewHosting }) {
  const nextFriday = new Date(Date.now()+((5-new Date().getDay()+7)%7)*86400000)
    .toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  const kosherLabel = data.hostKosher === 'mehadrin' ? 'כשר למהדרין'
    : data.hostKosher === 'kosher' ? 'כשר' : 'לא חשוב';

  const shabbatLabel = data.shabbatObservance === 'observant' ? 'שומרי שבת'
    : data.shabbatObservance === 'traditional' ? 'מסורתי' : 'חילוני';

  const hostingLabels = (data.hostingTypes||[]).map(t =>
    t === 'friday_dinner' ? 'ליל שישי' :
    t === 'shabbat_lunch' ? 'צהריים שבת' : 'משלוח'
  ).join(' · ');

  const pendingRequests = [
    { name: 'יונתן כ.', unit: 'גולני', kosher: 'כשר', needSleep: true,  lang: 'עברית' },
    { name: 'דניאל מ.', unit: 'חי"ר', kosher: 'לא חשוב', needSleep: false, lang: 'עברית' },
  ];

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24">

      {/* Header */}
      <div className="bg-gradient-to-l from-brand-700 to-brand-600 text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <p className="text-sm opacity-80 mb-0.5">שלום,</p>
        <h1 className="text-2xl font-bold mb-1">{data.hostFullName || 'משפחה מארחת'} 👋</h1>
        <div className="flex items-center gap-2 mt-2 mb-4">
          <div className="bg-green-400 w-2.5 h-2.5 rounded-full flex-shrink-0" />
          <span className="text-sm font-medium opacity-90">משפחה מארחת מאומתת ✅</span>
        </div>
        {/* Profile chips */}
        <div className="flex flex-wrap gap-2">
          {hostingLabels && (
            <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-2.5 py-1 rounded-full">🍽️ {hostingLabels}</span>
          )}
          {data.hostCapacity && (
            <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-2.5 py-1 rounded-full">👥 עד {data.hostCapacity} חיילים</span>
          )}
          {data.hostKosher && (
            <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-2.5 py-1 rounded-full">✡️ {kosherLabel}</span>
          )}
          {data.shabbatObservance && (
            <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-2.5 py-1 rounded-full">🕯️ {shabbatLabel}</span>
          )}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5">

        {/* Main CTA */}
        <Btn onClick={onNewHosting} className="shadow-md text-base py-4">
          🏡 פתח אירוח לשישי הקרוב
        </Btn>

        {/* Next Shabbat card */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">שבת קרובה 🕯️</h2>
          <Card className="bg-amber-50 border-amber-200 text-center py-5">
            <p className="text-sm font-semibold text-amber-800 mb-1">שישי, {nextFriday}</p>
            <p className="text-xs text-amber-600 mb-3">2 חיילים מחפשים אירוח באזורכם</p>
            <Btn variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-100 py-2.5 text-sm">
              צפה בבקשות
            </Btn>
          </Card>
        </div>

        {/* Pending requests */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">בקשות ממתינות 🪖</h2>
          <div className="space-y-3">
            {pendingRequests.map(r => (
              <Card key={r.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0 text-xl">🪖</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                      <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">ממתין</span>
                    </div>
                    <p className="text-xs text-warm-500 mb-1.5">יחידה: {r.unit}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Tag>{r.kosher}</Tag>
                      {r.needSleep && <Tag>🛏️ צריך לינה</Tag>}
                      <Tag>🌐 {r.lang}</Tag>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors">
                    ✅ אשר
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-warm-100 text-warm-600 text-xs font-bold hover:bg-warm-200 transition-colors">
                    ❌ דחה
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Past hostings */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">אירוחים קודמים 📅</h2>
          <Card className="text-center py-6 text-warm-400">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-sm">עדיין לא אירחתם — <br/>פתחו את האירוח הראשון שלכם! 🎉</p>
          </Card>
        </div>

      </div>
    </div>
  );
}