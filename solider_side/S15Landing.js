/* S15Landing — Landing screen for soldiers after login */

function S15Landing({ onNewRequest, onViewMatches, onEditRequest, onProfile, data }) {
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
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                {data.requests.map(req => {
                  const families = window.MAP_FAMILIES || [];
                  const matchCount = families.filter(fam => {
                    if (req.kosher) {
                      if (fam.kosher === 'none' && req.kosher !== 'none') return false;
                      if (req.kosher === 'mehadrin' && fam.kosher !== 'mehadrin') return false;
                    }
                    if (req.shabbat && fam.shabbat === 'secular') return false;
                    if (req.needSleep && !fam.canSleep) return false;
                    return true;
                  }).length;

                  return (
                    <div key={req.id} className="flex items-center gap-2">
                      <button 
                        onClick={() => onViewMatches(req.id)}
                        className="flex-1 px-5 py-3 bg-white text-gray-900 text-sm font-bold rounded-2xl border border-warm-200 shadow-sm hover:border-brand-200 transition-all flex items-center justify-between group/btn"
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span>{req.when} - {req.location}</span>
                          <span className={matchCount > 0 ? "text-brand-600 text-[11px] font-semibold" : "text-warm-400 text-[11px] font-medium"}>
                            {matchCount === 0 ? t('s15_no_matches_found') : t('s15_matches_found', matchCount)}
                          </span>
                        </div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500 group-hover/btn:translate-x-1 transition-transform rtl:group-hover/btn:-translate-x-1">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => onEditRequest(req)}
                        className="w-12 h-12 rounded-2xl bg-white border border-warm-200 text-warm-500 flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 shadow-sm transition-colors"
                        title={t('s15_edit_req')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
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

        <div className="flex justify-center">
          <button 
            onClick={onProfile}
            className="w-full max-w-[200px] flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-200 transition-all group"
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


