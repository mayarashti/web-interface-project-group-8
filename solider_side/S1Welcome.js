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
