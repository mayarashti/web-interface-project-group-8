/* S4Verify — OTP phone verification screen */
const { useState, useEffect, useRef } = React;

function S4Verify({ phone, onNext, onBack }) {
  const { t } = useLang();
  const [code,  setCode]  = useState('');
  const [error, setError] = useState('');
  const [sent,  setSent]  = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
    const tick = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(tick);
  }, []);

  const verify = () => {
    if (code === '123456') onNext();
    else setError(t('s4_wrong'));
  };

  const resend = () => {
    setTimer(30); setSent(true); setError(''); setCode('');
  };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={verify}
      nextLabel={t('s4_btn')}
      nextDisabled={code.length !== 6}
      step={2}
      icon="📱"
      title={t('s4_title')}
    >
      <Card className="text-center mb-6 py-6">
        <p className="text-sm text-warm-500 mb-1">{t('s4_sent')}</p>
        <p className="text-lg font-bold text-gray-900" style={{ direction: 'ltr' }}>{phone || '050-XXXXXXX'}</p>
        {sent && <p className="text-xs text-green-600 mt-2 font-medium">{t('s4_resent')}</p>}
      </Card>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s4_label')}</label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          placeholder="• • • • • •"
          className={clsx(
            'otp-input w-full px-4 py-4 rounded-xl border text-center bg-white transition-all focus:outline-none focus:ring-2',
            error ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-warm-300 focus:ring-brand-300 focus:border-brand-400'
          )}
        />
        {error && <p className="mt-1.5 text-sm text-red-500 font-medium text-center">{error}</p>}
      </div>
      <p className="text-xs text-warm-400 text-center mb-6">💡 {t('s4_hint')}</p>
      
      <button
        onClick={resend}
        disabled={timer > 0}
        className="w-full text-center text-sm text-brand-600 font-medium py-2 disabled:text-warm-400 hover:underline transition-colors"
      >
        {t('s4_resend', timer)}
      </button>
    </ScreenLayout>
  );
}
