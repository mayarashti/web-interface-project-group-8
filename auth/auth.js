var { useState } = React;

/* S0Login — Login screen */

function S0Login({ onBack, onLogin }) {
  const { t, lang } = useLang();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-warm-50">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5">
            <div className="w-5 h-5 rounded-full border-4 border-brand-500" />
          </div>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('s0_password_placeholder')}
              required
              className="w-full min-h-12 px-4 py-3 rounded-xl border border-warm-200 bg-white text-base transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300"
            />
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

        {/* Back to Registration */}
        <button
          onClick={onBack}
          className="w-full mt-3 text-sm text-warm-500 hover:text-warm-600 font-semibold transition-colors text-center"
        >
          {t('s0_back_to_register')}
        </button>
      </div>
    </div>
  );
}

/* S1Welcome — Welcome / role selector screen */

function S1Welcome({ onSoldier, onHost, onLogin }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-warm-50">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6">
            <div className="w-7 h-7 rounded-full bg-brand-500 shadow-xs" />
          </div>
          <p className="text-sm text-brand-600 font-semibold mb-2">{t('s1_subtitle')}</p>
          <h1 className="text-[32px] leading-9 font-bold text-gray-900 mb-3 tracking-normal">{t('s1_title')}</h1>
          <p className="text-lg text-warm-500 leading-7">{t('s1_tagline')}</p>
        </div>

        <Card className="space-y-3 p-4">
          <Btn onClick={onSoldier}>{t('s1_soldier')}</Btn>
          <Btn variant="secondary" onClick={onHost}>{t('s1_host')}</Btn>
        </Card>

        <button 
          onClick={onLogin}
          className="w-full mt-5 text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors"
        >
          {t('s1_login')}
        </button>
        <p className="mt-8 text-xs text-warm-500 text-center">{t('s1_footer')}</p>
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
