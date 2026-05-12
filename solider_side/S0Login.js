/* S0Login — Login screen */

function S0Login({ onBack, onLogin }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginKey = email.trim();

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

    setError('להתחברות דמו הזינו בשדה המייל: חייל או משפחה');
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality coming soon!');
  };

  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-brand-50 via-warm-50 to-white">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center shadow-xl">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{t('s0_title')}</h1>
          <p className="text-sm text-warm-500">{t('s0_subtitle')}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s0_email')}</label>
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder={t('s0_email_placeholder')}
              required
              className="w-full px-4 py-3 rounded-xl border border-warm-300 bg-white text-base transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
            />
            {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s0_password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('s0_password_placeholder')}
              required
              className="w-full px-4 py-3 rounded-xl border border-warm-300 bg-white text-base transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
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
              <span className="ml-2 text-sm text-gray-600">{t('s0_remember')}</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium underline underline-offset-2"
            >
              {t('s0_forgot')}
            </button>
          </div>

          {/* Login Button */}
          <Btn type="submit" className="text-lg py-4 mt-6">
            {t('s0_login_button')}
          </Btn>
        </form>

        {/* Back to Registration */}
        <button
          onClick={onBack}
          className="w-full mt-6 text-sm text-warm-500 hover:text-warm-600 font-medium underline underline-offset-2 transition-colors text-center"
        >
          {t('s0_back_to_register')}
        </button>
      </div>
    </div>
  );
}
