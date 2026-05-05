/* ─────────────────────────────────────────
   screens-soldier.js  —  S1 through S15
   (soldier registration + home screen)
───────────────────────────────────────── */

/* SCREEN 1 — Welcome */
function S1Welcome({ onSoldier, onHost }) {
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-brand-50 via-warm-50 to-white">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-brand-600 flex items-center justify-center shadow-xl">
              <span className="text-4xl">🕯️</span>
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-md text-xl">🏠</div>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">מארחי שבת</h1>
        <p className="text-sm text-brand-600 font-semibold mb-2 uppercase tracking-widest">Shabbat Hosts</p>
        <p className="text-xl font-semibold text-warm-500 mb-10 leading-snug">מצא ארוחת שישי חמה לידך</p>
        <div className="space-y-3">
          <Btn onClick={onSoldier} className="text-lg py-4">🪖  אני חייל</Btn>
          <Btn variant="secondary" onClick={onHost}>🏡  אני משפחה מארחת</Btn>
        </div>
        <p className="mt-8 text-xs text-warm-400">מחברים חיילים עם משפחות מארחות לשישי ✨</p>
      </div>
    </div>
  );
}

/* SCREEN 2 — Explanation */
function S2Explain({ onNext, onBack }) {
  const features = [
    { icon: '📍', title: 'מיקום קרוב',    desc: 'מצא משפחות מארחות בקרבת הבסיס שלך' },
    { icon: '✅', title: 'התאמה אישית',   desc: 'כשרות, אלרגיות והעדפות — הכל לפי מה שמתאים לך' },
    { icon: '📅', title: 'גמישות מלאה',   desc: 'אשר אירוח לשישי הקרוב בכמה לחיצות' },
    { icon: '🔒', title: 'תקשורת בטוחה', desc: 'דברו עם המשפחה דרך מערכת מוגנת ובטוחה' },
  ];
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <div className="flex-1">
        <SectionTitle icon="👋" title="איך זה עובד?" sub="כל מה שצריך לדעת לפני שמתחילים" />
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

/* SCREEN 3 — Create Account */
function S3Account({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.firstName?.trim()) e.firstName = 'שם פרטי הוא שדה חובה';
    if (!data.lastName?.trim())  e.lastName  = 'שם משפחה הוא שדה חובה';
    if (!data.phone?.trim() || data.phone.replace(/\D/g,'').length < 9) e.phone = 'הכנס מספר טלפון תקין';
    if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'הכנס כתובת אימייל תקינה';
    if (!data.password || data.password.length < 6) e.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
    if (!data.terms) e.terms = 'יש לאשר את תנאי השימוש';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={1} total={12} />
      <SectionTitle icon="📝" title="יצירת חשבון" sub="כמה פרטים קטנים ואתה בפנים!" />
      <div className="flex gap-3">
        <div className="flex-1"><Input label="שם פרטי"   value={data.firstName||''} onChange={set('firstName')} placeholder="ישראל" error={errors.firstName} /></div>
        <div className="flex-1"><Input label="שם משפחה" value={data.lastName||''}  onChange={set('lastName')}  placeholder="כהן"   error={errors.lastName}  /></div>
      </div>
      <Input label="מספר טלפון" type="tel"      value={data.phone||''}    onChange={set('phone')}    placeholder="050-1234567"   error={errors.phone}    />
      <Input label="אימייל"     type="email"    value={data.email||''}    onChange={set('email')}    placeholder="israel@gmail.com" error={errors.email} />
      <Input label="סיסמה"      type="password" value={data.password||''} onChange={set('password')} placeholder="לפחות 6 תווים"  error={errors.password} hint="הסיסמה שמורה בצורה מאובטחת" />
      <div className="mb-6 mt-1">
        <CheckRow checked={!!data.terms} onChange={set('terms')}>
          <span>אני מאשר/ת את{' '}<span className="text-brand-600 underline cursor-pointer">תנאי השימוש</span>{' '}ו<span className="text-brand-600 underline cursor-pointer">מדיניות הפרטיות</span></span>
        </CheckRow>
        {errors.terms && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.terms}</p>}
      </div>
      <Btn onClick={() => { if (validate()) onNext(); }}>המשך</Btn>
    </div>
  );
}

/* SCREEN 4 — Phone Verification */
function S4Verify({ phone, onNext, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRef = useRef();
  useEffect(() => {
    inputRef.current?.focus();
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);
  const verify = () => { if (code === '123456') onNext(); else setError('קוד שגוי, נסה שוב 🙈'); };
  const resend = () => { setTimer(30); setSent(true); setError(''); setCode(''); };
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={2} total={12} />
      <SectionTitle icon="📱" title="אימות מספר טלפון" />
      <Card className="text-center mb-6 py-6">
        <p className="text-sm text-warm-500 mb-1">שלחנו קוד אימות ב-SMS אל</p>
        <p className="text-lg font-bold text-gray-900" style={{direction:'ltr'}}>{phone || '050-XXXXXXX'}</p>
        {sent && <p className="text-xs text-green-600 mt-2 font-medium">✅ הקוד נשלח מחדש!</p>}
      </Card>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">קוד אימות (6 ספרות)</label>
        <input ref={inputRef} type="text" inputMode="numeric" maxLength={6} value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g,'')); setError(''); }}
          placeholder="• • • • • •"
          className={clsx('otp-input w-full px-4 py-4 rounded-xl border text-center bg-white transition-all focus:outline-none focus:ring-2',
            error ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-warm-300 focus:ring-brand-300 focus:border-brand-400')}
        />
        {error && <p className="mt-1.5 text-sm text-red-500 font-medium text-center">{error}</p>}
      </div>
      <p className="text-xs text-warm-400 text-center mb-6">💡 לצורך הדגמה, הכנס: <strong className="text-brand-600">123456</strong></p>
      <div className="space-y-3">
        <Btn onClick={verify} disabled={code.length !== 6}>אמת</Btn>
        <button onClick={resend} disabled={timer > 0} className="w-full text-center text-sm text-brand-600 font-medium py-2 disabled:text-warm-400 hover:underline transition-colors">
          {timer > 0 ? `שלח קוד מחדש (${timer}ש)` : 'שלח קוד מחדש'}
        </button>
      </div>
    </div>
  );
}

/* SCREEN 5 — Service Status */
function S5Service({ data, setData, onNext, onBack }) {
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={3} total={12} />
      <SectionTitle icon="🪖" title="סטטוס שירות" sub="ספר לנו על השירות הצבאי שלך" />
      <RadioGroup label="סוג שירות" value={data.serviceType||''} onChange={set('serviceType')}
        options={[
          { value: 'regular', label: 'שירות סדיר', sub: 'חייל/ת בשירות חובה' },
          { value: 'reserve', label: 'מילואים',     sub: 'שירות מילואים פעיל' },
          { value: 'career',  label: 'קבע',          sub: 'קצין/ת או נגד קבע'  },
        ]}
      />
      <Input label="יחידה / בסיס (אופציונלי)" value={data.unit||''} onChange={set('unit')}
        placeholder="לדוגמה: בסיס רמת דוד, גולני..." hint="לא חובה — עוזר להתאמה טובה יותר" />
      <div className="mt-auto pt-4"><Btn onClick={onNext} disabled={!data.serviceType}>המשך</Btn></div>
    </div>
  );
}

/* SCREEN 6 — Upload Document */
function S6Upload({ data, setData, onNext, onBack }) {
  const [uploaded,  setUploaded]  = useState(!!data.docUploaded);
  const [docType,   setDocType]   = useState(data.docType||'');
  const [uploading, setUploading] = useState(false);
  const mockUpload = () => {
    if (!docType) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false); setUploaded(true);
      setData(prev => ({ ...prev, docUploaded: true, docType }));
    }, 1800);
  };
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={4} total={12} />
      <SectionTitle icon="📄" title="אימות מסמך שירות" sub="העלה מסמך לאימות — הכל מאובטח ומוגן" />
      <RadioGroup label="סוג מסמך" value={docType} onChange={setDocType}
        options={[
          { value: 'tag',     label: 'צילום חוגר (תג)' },
          { value: 'reserve', label: 'אישור מילואים'    },
          { value: 'other',   label: 'מסמך אחר'         },
        ]}
      />
      {!uploaded ? (
        <div className="mb-5">
          <div onClick={() => docType && mockUpload()} className={clsx(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
            docType ? 'border-brand-400 bg-brand-50 hover:bg-brand-100' : 'border-warm-300 bg-warm-50 cursor-not-allowed opacity-60'
          )}>
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-brand-600 font-medium">מעלה מסמך...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">📸</span>
                <p className="font-semibold text-gray-700 text-sm">לחץ להעלאה / צילום</p>
                <p className="text-xs text-warm-400">JPG, PNG, PDF — עד 10MB</p>
              </div>
            )}
          </div>
          {!docType && <p className="text-xs text-amber-600 mt-2 text-center">בחר סוג מסמך תחילה</p>}
        </div>
      ) : (
        <Card className="flex items-center gap-4 mb-5 border-green-200 bg-green-50">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-2xl">✅</span></div>
          <div><p className="font-semibold text-green-800 text-sm">המסמך הועלה בהצלחה!</p><p className="text-xs text-green-600 mt-0.5">הקובץ נשמר בצורה מאובטחת</p></div>
        </Card>
      )}
      <Card className="flex items-start gap-3 mb-6 bg-amber-50 border-amber-200">
        <span className="text-xl flex-shrink-0">🔒</span>
        <p className="text-xs text-amber-800 leading-relaxed">המסמך משמש <strong>לאימות בלבד</strong>. הוא אינו מועבר למשפחות המארחות ונמחק לאחר האימות.</p>
      </Card>
      <div className="mt-auto"><Btn onClick={onNext} disabled={!uploaded}>המשך</Btn></div>
    </div>
  );
}

/* SCREEN 7 — Kosher & Shabbat observance */
function S7Kosher({ data, setData, onNext, onBack }) {
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={5} total={12} />
      <SectionTitle icon="🕍" title="כשרות ושבת" sub="נשתמש במידע הזה כדי להתאים לך את המשפחה המושלמת" />
      <RadioGroup label="כשרות" value={data.kosher||''} onChange={set('kosher')}
        options={[
          { value: 'none',     label: 'לא חשוב',    sub: 'מקבל/ת כל סוג אוכל'       },
          { value: 'kosher',   label: 'כשר',         sub: 'בשר/חלב נפרדים ותו הכשר' },
          { value: 'mehadrin', label: 'כשר למהדרין', sub: 'הכשר מהדרין בלבד'          },
        ]}
      />
      <RadioGroup label="שמירת שבת" value={data.shabbatKeeps||''} onChange={set('shabbatKeeps')}
        options={[
          { value: 'yes', label: '🙏 שומר/ת שבת',    sub: 'חשוב לי להיות בבית שומר שבת' },
          { value: 'no',  label: '✌️ לא שומר/ת שבת',  sub: 'מתאים לי גם בית לא דתי'       },
        ]}
      />
      <div className="mt-auto">
        <Btn onClick={onNext} disabled={!data.kosher || !data.shabbatKeeps}>המשך</Btn>
      </div>
    </div>
  );
}

/* SCREEN 8 — Hosting Options */
function S8Location({ data, setData, onNext, onBack }) {
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={6} total={12} />
      <SectionTitle icon="🏠" title="צרכי אירוח" sub="ספר לנו מה אתה צריך — נמצא משפחה שתתאים בדיוק" />

      <Card className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">מה אתה צריך לשישי?</p>
        <p className="text-xs text-warm-400 mb-4">אפשר לסמן יותר מאפשרות אחת</p>
        <div className="space-y-4">
          <CheckRow checked={!!data.needSleep} onChange={set('needSleep')}>
            <span>
              <span className="font-medium text-gray-800">🛏️ צריך/ה מקום לישון</span>
              <br/>
              <span className="text-warm-400">אשאר לישון אצל המשפחה בשבת</span>
            </span>
          </CheckRow>
          <CheckRow checked={!!data.walkDistance} onChange={set('walkDistance')}>
            <span>
              <span className="font-medium text-gray-800">🚶 צריך/ה מרחק הליכה מהבסיס</span>
              <br/>
              <span className="text-warm-400">אני לא נוסע בשבת, המשפחה צריכה להיות קרובה</span>
            </span>
          </CheckRow>
        </div>
      </Card>

      <Card className="bg-brand-50 border-brand-100 flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">💡</span>
        <p className="text-xs text-brand-800 leading-relaxed">
          אם לא סימנת כלום — נמצא לך משפחה לארוחה בלבד. תמיד אפשר לעדכן בפרופיל שלך.
        </p>
      </Card>

      <div className="mt-auto pt-5">
        <Btn onClick={onNext}>המשך</Btn>
      </div>
    </div>
  );
}

/* SCREEN 9 — Allergies */
function S9Allergies({ data, setData, onNext, onBack }) {
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const allergyOpts = [
    { value: 'gluten',     label: '🌾 ללא גלוטן'         },
    { value: 'lactose',    label: '🥛 ללא לקטוז'          },
    { value: 'nuts',       label: '🌰 אלרגיה לאגוזים'     },
    { value: 'peanuts',    label: '🥜 אלרגיה לבוטנים'     },
    { value: 'vegetarian', label: '🥗 צמחוני'             },
    { value: 'vegan',      label: '🌿 טבעוני'             },
    { value: 'fish',       label: '🐟 דגים בלבד'          },
    { value: 'other',      label: '➕ אחר'                },
  ];
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={7} total={12} />
      <SectionTitle icon="🥗" title="אלרגיות והעדפות אוכל" sub="המשפחה המארחת תדע בדיוק מה להכין בשבילך" />
      <MultiCheck label="בחר/י את כל מה שרלוונטי" options={allergyOpts} values={data.allergies||[]} onChange={val => set('allergies')(val)} />
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">יש משהו נוסף שכדאי למשפחה לדעת?</label>
        <textarea value={data.allergyNote||''} onChange={e => set('allergyNote')(e.target.value)}
          placeholder="לדוגמה: אני לא אוכל ירקות מסוגים מסוימים, יש לי אלרגיה לחומרי ניקוי..."
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all" rows={3}
        />
      </div>
      <div className="mt-auto"><Btn onClick={onNext}>המשך</Btn></div>
    </div>
  );
}

/* SCREEN 10 — Preferences */
function S10Prefs({ data, setData, onNext, onBack }) {
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={8} total={12} />
      <SectionTitle icon="⚙️" title="העדפות נוספות" sub="נשתמש בזה כדי למצוא לך את ההתאמה הטובה ביותר" />
      <RadioGroup label="מעדיף/ה להתארח עם חיילים נוספים?" value={data.withSoldiers||''} onChange={set('withSoldiers')}
        options={[
          { value: 'yes',      label: '👥 כן, אשמח'         },
          { value: 'no',       label: '🙋 מעדיף/ה לבד'      },
          { value: 'dontmind', label: '💛 לא משנה לי'        },
        ]}
      />
      <MultiCheck label="שפה מועדפת לתקשורת"
        options={[
          { value: 'he',    label: '🇮🇱 עברית'  },
          { value: 'en',    label: '🇺🇸 אנגלית' },
          { value: 'ru',    label: '🇷🇺 רוסית'  },
          { value: 'ar',    label: '🇸🇦 ערבית'  },
          { value: 'other', label: '🌍 אחר'    },
        ]}
        values={data.languages||['he']} onChange={val => set('languages')(val)}
      />
      <RadioGroup label="נוחות עם חיות מחמד" value={data.pets||''} onChange={set('pets')}
        options={[
          { value: 'ok',      label: '🐶 נוח עם חיות'           },
          { value: 'notok',   label: '🙅 לא נוח'                 },
          { value: 'allergy', label: '🤧 יש לי אלרגיה לחיות'     },
        ]}
      />
      <div className="mt-auto pt-2"><Btn onClick={onNext} disabled={!data.withSoldiers || !data.pets}>המשך</Btn></div>
    </div>
  );
}

/* SCREEN 11 — Profile */
function S11Profile({ data, setData, onNext, onBack }) {
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const [imgPreview, setImgPreview] = useState(data.avatarPreview||null);
  const mockUploadImg = () => {
    const colors = ['#c2560e','#2563eb','#16a34a','#7c3aed','#db2777'];
    const col = colors[Math.floor(Math.random()*colors.length)];
    setImgPreview(col);
    setData(prev => ({ ...prev, avatarPreview: col }));
  };
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={9} total={12} />
      <SectionTitle icon="😊" title="הפרופיל שלך" sub="פרופיל עשיר עוזר למשפחות להכיר אותך לפני שמגיע שישי" />
      <div className="flex justify-center mb-6">
        <div onClick={mockUploadImg} className="relative w-24 h-24 rounded-full cursor-pointer group">
          {imgPreview ? (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md" style={{ background: imgPreview }}>
              {(data.firstName||'?')[0]}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-warm-200 flex items-center justify-center border-2 border-dashed border-warm-400 group-hover:border-brand-400 transition-colors">
              <span className="text-3xl">📷</span>
            </div>
          )}
          <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-sm">+</span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-warm-400 mb-5">לחץ לבחירת תמונה (אופציונלי)</p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">ספר לנו עליך 💬</label>
        <textarea value={data.bio||''} onChange={e => set('bio')(e.target.value)}
          placeholder="היי, אני דניאל, משרת באזור חיפה ומחפש ארוחת שישי חמה כשאני יוצא מהבסיס."
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all"
          rows={4} maxLength={300}
        />
        <p className="text-xs text-warm-400 mt-1 text-left">{(data.bio||'').length}/300</p>
      </div>
      <div className="mt-auto"><Btn onClick={onNext}>המשך</Btn></div>
    </div>
  );
}

/* SCREEN 12 — Summary */
function S12Summary({ data, onEdit, onSubmit, onBack }) {
  const serviceMap  = { regular: 'שירות סדיר', reserve: 'מילואים', career: 'קבע' };
  const kosherMap   = { none: 'לא חשוב', kosher: 'כשר', mehadrin: 'כשר למהדרין' };
  const petsMap     = { ok: 'נוח', notok: 'לא נוח', allergy: 'אלרגי לחיות' };
  const soldiersMap = { yes: 'כן', no: 'לא', dontmind: 'לא משנה' };
  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between items-start py-2.5 border-b border-warm-100 last:border-0">
      <span className="text-xs text-warm-500 font-medium w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-left flex-1 mr-2">{value}</span>
    </div>
  ) : null;
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={10} total={12} />
      <SectionTitle icon="📋" title="סיכום הרשמה" sub="בדוק שהכל נכון לפני השליחה" />
      <Card className="mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">פרטים אישיים</p>
        <Row label="שם מלא" value={`${data.firstName||''} ${data.lastName||''}`} />
        <Row label="טלפון"  value={data.phone} />
        <Row label="אימייל" value={data.email} />
      </Card>
      <Card className="mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">שירות צבאי</p>
        <Row label="סוג שירות" value={serviceMap[data.serviceType]} />
        <Row label="יחידה"     value={data.unit} />
        <Row label="מסמך"      value={data.docUploaded ? '✅ הועלה' : '—'} />
      </Card>
      <Card className="mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">העדפות</p>
        <Row label="כשרות"      value={kosherMap[data.kosher]} />
        <Row label="שמירת שבת"  value={data.shabbatKeeps === 'yes' ? '🙏 שומר/ת שבת' : data.shabbatKeeps === 'no' ? '✌️ לא שומר/ת שבת' : null} />
        <Row label="לינה"       value={data.needSleep ? '🛏️ צריך/ה מקום לישון' : null} />
        <Row label="מרחק הליכה" value={data.walkDistance ? '🚶 נדרש מרחק הליכה' : null} />
        <Row label="אלרגיות"    value={(data.allergies||[]).join(', ') || 'ללא'} />
        <Row label="חיות מחמד"  value={petsMap[data.pets]} />
        <Row label="עם חיילים"  value={soldiersMap[data.withSoldiers]} />
      </Card>
      {data.bio && (
        <Card className="mb-4 bg-brand-50 border-brand-100">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">תיאור אישי</p>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{data.bio}"</p>
        </Card>
      )}
      <div className="space-y-3 mt-4">
        <Btn onClick={onSubmit}>שלח פרופיל 🚀</Btn>
        <Btn variant="secondary" onClick={onEdit}>ערוך פרטים</Btn>
      </div>
    </div>
  );
}

/* SCREEN 13 — Verification Pending */
function S13Pending({ onHome, autoApprove }) {
  const [approved, setApproved] = useState(false);
  useEffect(() => { const t = setTimeout(() => setApproved(true), 3500); return () => clearTimeout(t); }, []);
  useEffect(() => { if (approved) { const t = setTimeout(() => autoApprove(), 1200); return () => clearTimeout(t); } }, [approved]);
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      {!approved ? (
        <>
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center"><span className="text-4xl">⏳</span></div>
            <div className="pulse-ring absolute inset-0 rounded-full border-4 border-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">הפרופיל שלך בבדיקה</h1>
          <p className="text-sm text-warm-500 leading-relaxed mb-6">לאחר אישור, תוכל ליצור בקשת אירוח ולהתחבר למשפחות מארחות בכל הארץ</p>
          <div className="flex gap-1.5 justify-center">
            {[0,1,2].map(i => (<div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />))}
          </div>
          <p className="mt-4 text-xs text-warm-400">בדרך כלל לוקח פחות מדקה 😊</p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-lg"><span className="text-5xl">✅</span></div>
          <h1 className="text-2xl font-bold text-green-700">האימות הושלם בהצלחה!</h1>
          <p className="text-sm text-warm-500 mt-2">מעביר אותך לדף הבית...</p>
        </div>
      )}
    </div>
  );
}

/* SCREEN 14 — Success */
function S14Success({ onHome, name }) {
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      <div className="mb-6 relative">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center shadow-xl"><span className="text-5xl">🎉</span></div>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">ברוך הבא!</h1>
      <p className="text-xl font-semibold text-brand-600 mb-2">{name}</p>
      <p className="text-base text-green-600 font-bold mb-1">✅ האימות הושלם בהצלחה</p>
      <p className="text-sm text-warm-500 mb-10 leading-relaxed">אתה עכשיו חלק מקהילת מארחי שבת.<br />אפשר להתחיל לחפש ארוחת שישי חמה! 🕯️</p>
      <Btn onClick={onHome} className="text-lg py-4">לעמוד הבית 🏠</Btn>
    </div>
  );
}

/* SCREEN 15 — Home */
function S15Home({ data, onNewRequest }) {
  const matches = [
    { name: 'משפחת לוי', city: 'חיפה',       kosher: 'כשר',           dist: '2.3 ק"מ', slots: 3, rating: 4.9 },
    { name: 'משפחת כהן', city: 'קריית אתא',  kosher: 'כשר למהדרין',   dist: '5.1 ק"מ', slots: 2, rating: 4.7 },
    { name: 'משפחת גולן', city: 'נשר',        kosher: 'לא חשוב',       dist: '6.8 ק"מ', slots: 4, rating: 4.8 },
  ];
  const nextFriday = new Date(Date.now()+((5-new Date().getDay()+7)%7)*86400000).toLocaleDateString('he-IL',{day:'numeric',month:'long'});
  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24">
      <div className="bg-gradient-to-l from-brand-700 to-brand-600 text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <p className="text-sm opacity-80 mb-0.5">שלום,</p>
        <h1 className="text-2xl font-bold mb-1">{data.firstName} {data.lastName} 👋</h1>
        <div className="flex items-center gap-2 mt-3">
          <div className="bg-green-400 w-2.5 h-2.5 rounded-full flex-shrink-0" />
          <span className="text-sm font-medium opacity-90">סטטוס: חייל/ת מאומת/ת ✅</span>
        </div>
      </div>
      <div className="px-5 mt-5 space-y-3">
        <Btn onClick={onNewRequest} className="shadow-md">🍽  צור בקשת אירוח לשישי</Btn>
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 mt-5">שבת קרובה 🕯️</h2>
          <Card className="bg-amber-50 border-amber-200 text-center py-5">
            <p className="text-sm font-semibold text-amber-800 mb-1">שישי, {nextFriday}</p>
            <p className="text-xs text-amber-600 mb-3">3 משפחות זמינות באזורך</p>
            <Btn variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-100 py-2.5 text-sm">צפה בהתאמות</Btn>
          </Card>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">התאמות מומלצות 🏠</h2>
          <div className="space-y-3">
            {matches.map(m => (
              <Card key={m.name} className="flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0 text-xl">🏡</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                    <div className="flex items-center gap-0.5"><span className="text-xs font-bold text-gray-700">{m.rating}</span><span className="text-xs">⭐</span></div>
                  </div>
                  <p className="text-xs text-warm-500">{m.city} · {m.dist}</p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <Tag>{m.kosher}</Tag>
                    <Tag>{m.slots} מקומות פנויים</Tag>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">אירוחים קודמים 📅</h2>
          <Card className="text-center py-6 text-warm-400">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-sm">עדיין לא היו לך אירוחים — <br/>בוא נחפש את הראשון שלך! 🎉</p>
          </Card>
        </div>
      </div>
    </div>
  );
}