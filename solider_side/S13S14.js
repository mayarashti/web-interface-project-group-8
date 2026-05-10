/* S13Pending — Profile under review (auto-advances after 3.5s) */
const { useState, useEffect } = React;

function S13Pending({ onHome, autoApprove }) {
  const { t } = useLang();
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setApproved(true), 3500);
    return () => clearTimeout(tm);
  }, []);

  useEffect(() => {
    if (approved) {
      const tm = setTimeout(() => autoApprove(), 1200);
      return () => clearTimeout(tm);
    }
  }, [approved]);

  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      {!approved ? (
        <>
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-4xl">⏳</span>
            </div>
            <div className="pulse-ring absolute inset-0 rounded-full border-4 border-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('s13_title')}</h1>
          <p className="text-sm text-warm-500 leading-relaxed mb-6">{t('s13_sub')}</p>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="mt-4 text-xs text-warm-400">{t('s13_eta')}</p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-lg">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-green-700">{t('s13_done')}</h1>
          <p className="text-sm text-warm-500 mt-2">{t('s13_redir')}</p>
        </div>
      )}
    </div>
  );
}


/* S14Success — Registration complete, welcome screen */

function S14Success({ onHome, name }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center shadow-xl">
          <span className="text-5xl">🎉</span>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('s14_hi')}</h1>
      <p className="text-xl font-semibold text-brand-600 mb-2">{name}</p>
      <p className="text-base text-green-600 font-bold mb-1">{t('s14_ok')}</p>
      <p className="text-sm text-warm-500 mb-10 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{t('s14_desc')}</p>
      <Btn onClick={onHome} className="text-lg py-4">{t('s14_home')}</Btn>
    </div>
  );
}
