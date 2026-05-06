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
  const TOTAL_STEPS = 4;
  const [internalStep, setInternalStep] = useState(1);
  const [errors, setErrors]             = useState({});

  const set = (key) => (val) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const STEP_LABELS = ['פרטים אישיים', 'סוג אירוח', 'אורח החיים', 'אופי הבית'];

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
      return e;
    },
    4: () => {
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

  /* ══ STEP 3 — Shabbat Observance · Services ══ */
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

      <Card className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">שירותים נוספים</p>
        <p className="text-xs text-warm-400 mb-3.5">אופציונלי — כל תוספת תסייע לחיילים</p>
        <div className="space-y-3.5">
          <CheckRow checked={!!data.hostCanSleep} onChange={set('hostCanSleep')}>
            <span><span className="font-medium text-gray-800">🛏️ מקום לינה</span><br/><span className="text-warm-400">יכולים לספק מקום שינה לחייל/ת בשבת</span></span>
          </CheckRow>
          <CheckRow checked={!!data.hostCanTransport} onChange={set('hostCanTransport')}>
            <span><span className="font-medium text-gray-800">🚗 הסעה</span><br/><span className="text-warm-400">יכולים להסיע מ/לבסיס או לתחנה קרובה</span></span>
          </CheckRow>
        </div>
      </Card>

      <div className="mt-auto pt-2"><Btn onClick={advance}>המשך ←</Btn></div>
    </div>
  );

  /* ══ STEP 4 — Capacity · Home Atmosphere ══ */
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