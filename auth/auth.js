var { useState } = React;

/* S0Login — Login screen */

function S0Login({ onBack, onLogin }) {
  const { t, lang } = useLang();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginKey = phone.trim();

    if (loginKey === 'חייל') {
      setError('');
      onLogin('soldier');
      return;
    }

    if (loginKey === 'משפחה') {
      setError('');
      onLogin('host');
      return;
    }

    setError(t('s0_login_demo_error'));
  };

  const handleForgotPassword = () => {
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 4000);
  };

  return (
    <div className="screen-enter min-h-screen flex flex-col bg-warm-50">
      <AppHeader onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] leading-[34px] font-bold text-gray-900 mb-2">{t('s0_title')}</h1>
          <p className="text-base text-warm-500 leading-6">{t('s0_subtitle')}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-warm-200 rounded-xl p-4 shadow-xs">
          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">{t('s0_phone')}</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError('');
              }}
              placeholder={t('s0_phone_placeholder')}
              required
              className="w-full min-h-12 px-4 py-3 rounded-xl border border-warm-200 bg-white text-base transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300"
            />
            {error && <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">{t('s0_password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('s0_password_placeholder')}
                required
                className="w-full min-h-12 ps-4 pe-12 py-3 rounded-xl border border-warm-200 bg-white text-base transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 end-0 flex items-center px-3 text-warm-400 hover:text-brand-500 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>
                    <line x1="48" y1="40" x2="208" y2="216" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand-600 bg-white border-warm-300 rounded focus:ring-brand-500 focus:ring-2"
              />
              <span className="ms-2 text-sm text-gray-600">{t('s0_remember')}</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-brand-600 hover:text-brand-700 font-semibold"
            >
              {t('s0_forgot')}
            </button>
          </div>

          {forgotSent && (
            <p className="text-xs text-center text-support-600 font-medium animate-fade-in">
              {lang === 'he' ? 'קישור לאיפוס סיסמה נשלח ✓' : 'Password reset link sent ✓'}
            </p>
          )}

          {/* Login Button */}
          <Btn type="submit" className="mt-6">
            {t('s0_login_button')}
          </Btn>
        </form>

        <p className="mt-5 text-xs text-center text-warm-400 leading-relaxed">
          {t('demo_hint')}
        </p>

      </div>
      </div>
    </div>
  );
}

/* S1Welcome — Welcome / role selector screen */

function S1Welcome({ onSoldier, onHost, onLogin }) {
  const { t, lang, setLang } = useLang();

  return (
    <div className="screen-enter min-h-screen flex flex-col bg-warm-50">

      {/* ── Top Navbar ── */}
      <header
        dir="ltr"
        style={{ backgroundColor: 'var(--brand-600)' }}
        className="w-full shadow-sm"
      >
        {/* full-width grid — no max-width so buttons reach the screen edges */}
        <div className="grid grid-cols-3 items-center w-full px-2 py-1">

          {/* Col 1 — Language toggle: pushed to the far left */}
          <div className="flex justify-start pl-1">
            <button
              onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold transition-all hover:bg-warm-100 active:scale-95"
              style={{ color: 'var(--warm-600)' }}
              aria-label={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
            >
              {lang === 'he' ? 'EN' : 'עב'}
            </button>
          </div>

          {/* Col 2 — Logo: enlarged image centred */}
          <div className="flex flex-col items-center gap-1">
            <img
              src="MEMULAIM.png"
              alt="לוגו משולאים"
              className="h-16 w-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Col 3 — Login button: pushed to the far right */}
          <div className="flex justify-end pr-1">
            <button
              onClick={onLogin}
              className="px-4 py-1.5 rounded-full border-2 border-white text-white text-sm font-semibold hover:bg-white hover:text-brand-700 transition-all active:scale-95"
            >
              {t('s1_login')}
            </button>
          </div>

        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-[32px] leading-9 font-bold text-gray-900 mb-3 tracking-normal">{t('s1_title')}</h1>
            <p className="text-lg text-warm-500 leading-7">{t('s1_tagline')}</p>
          </div>

          <Card className="space-y-3 p-4">
            {/* Soldier button — icon pinned to the far right */}
            <Btn onClick={onSoldier}>
              <span className="relative flex items-center justify-center w-full">
                {t('s1_soldier')}
                <img
                  src="Designe- image/solider icon'.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 object-contain"
                />
              </span>
            </Btn>

            {/* Host/family button — icon pinned to the far right */}
            <Btn variant="secondary" onClick={onHost}>
              <span className="relative flex items-center justify-center w-full">
                {t('s1_host')}
                <img
                  src="Designe- image/hala.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 object-contain"
                />
              </span>
            </Btn>
          </Card>

          {/* Already have an account */}
          <p className="mt-5 text-sm text-center text-warm-500">
            {lang === 'he' ? 'כבר יש לך חשבון?' : 'Already have an account?'}{' '}
            <button
              onClick={onLogin}
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              {t('s1_login')}
            </button>
          </p>

          <p className="mt-4 text-xs text-warm-500 text-center">{t('s1_footer')}</p>
        </div>
      </div>

    </div>
  );
}

/* S2Explain — How it works screen (soldier flow) */

function S2Explain({ onNext, onBack }) {
  const { t } = useLang();
  const features = [
    { title: t('s2_f1_t'), desc: t('s2_f1_d') },
    { title: t('s2_f2_t'), desc: t('s2_f2_d') },
    { title: t('s2_f3_t'), desc: t('s2_f3_d') },
    { title: t('s2_f4_t'), desc: t('s2_f4_d') },
  ];
  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel={t('s2_btn')}
      icon="🏡"
      title={t('s2_title')}
      sub={t('s2_sub')}
    >
      <div className="space-y-3 mb-8">
        {features.map((f, index) => (
          <Card key={f.title} className="flex gap-4 items-start p-4">
            <span className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-xs text-warm-500 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </ScreenLayout>
  );
}

function S18HostExplain({ onNext, onBack }) {
  const { t } = useLang();
  const features = [
    { title: t('s18_f1_t'), desc: t('s18_f1_d') },
    { title: t('s18_f2_t'), desc: t('s18_f2_d') },
    { title: t('s18_f3_t'), desc: t('s18_f3_d') },
    { title: t('s18_f4_t'), desc: t('s18_f4_d') },
  ];
  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel={t('s18_btn')}
      icon="🏡"
      title={t('s18_title')}
      sub={t('s18_sub')}
    >
      <div className="space-y-3 mb-8">
        {features.map((f, index) => (
          <Card key={f.title} className="flex gap-4 items-start p-4">
            <span className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-xs text-warm-500 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </ScreenLayout>
  );
}

window.S0Login = S0Login;
window.S1Welcome = S1Welcome;
window.S2Explain = S2Explain;
window.S18HostExplain = S18HostExplain;
