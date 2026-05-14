/* S15Landing — Landing screen for soldiers after login */

function S15Landing({ onNewRequest, onBrowse, onProfile, data }) {
  const { t, lang } = useLang();
  const soldierName = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '';
  const hasRequests = data.requests && data.requests.length > 0;

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-10">
      <AppHeader
        eyebrow={t('s15_hi')}
        title={soldierName}
      />

      <div className="px-5 mt-8 space-y-6 max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {hasRequests ? t('s15_landing_title') : (lang === 'he' ? 'בוא נמצא לך בית לשבת' : 'Let\'s find you a home for Shabbat')}
          </h1>
          {hasRequests ? (
            <div className="space-y-3">
              <p className="text-warm-500">{t('s15_landing_has_req_sub', data.requests.length)}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {data.requests.map(req => (
                  <button 
                    key={req.id}
                    onClick={() => onNewRequest(req)}
                    className="px-4 py-2 bg-brand-50 text-brand-700 text-sm font-semibold rounded-full border border-brand-100 hover:bg-brand-100 transition-colors flex items-center gap-2"
                  >
                    <span>{req.when} - {req.location}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-warm-500">{t('s15_landing_new_req_sub')}</p>
          )}
        </div>
        
        <button 
          onClick={() => onNewRequest()}
          className="w-full text-right p-8 rounded-3xl bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <div className="flex-1 text-left rtl:text-right">
              <h2 className="text-xl font-bold">{t('s15_landing_new_req_title')}</h2>
              <p className="text-brand-100 text-sm opacity-90">{t('s15_form_sub')}</p>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onBrowse}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-warm-50 flex items-center justify-center text-warm-600 mb-3 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">{t('s15_landing_browse_title')}</span>
          </button>

          <button 
            onClick={onProfile}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-warm-50 flex items-center justify-center text-warm-600 mb-3 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">{t('s15_landing_profile_title')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


