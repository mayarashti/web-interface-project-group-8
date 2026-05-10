/* S1Welcome — Welcome / role selector screen */

function S1Welcome({ onSoldier, onHost }) {
  const { t } = useLang();
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{t('s1_title')}</h1>
        <p className="text-sm text-brand-600 font-semibold mb-2 uppercase tracking-widest">{t('s1_subtitle')}</p>
        <p className="text-xl font-semibold text-warm-500 mb-10 leading-snug">{t('s1_tagline')}</p>
        <div className="space-y-3">
          <Btn onClick={onSoldier} className="text-lg py-4">{t('s1_soldier')}</Btn>
          <Btn variant="secondary" onClick={onHost}>{t('s1_host')}</Btn>
        </div>
        <p className="mt-8 text-xs text-warm-400">{t('s1_footer')}</p>
      </div>
    </div>
  );
}
