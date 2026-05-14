/* S21SoldierProfile — Soldier profile and request dashboard */
const { useState } = React;

function S21SoldierProfile({ data, setData, onBack, onNewRequest, onEditRequest, onDeleteRequest, onViewMatches }) {
  const { t, lang } = useLang();
  
  // Use local state for the form so edits are not global until saved
  const [form, setForm] = useState({
    fullName: data.fullName || '',
    phone: data.phone || '',
    email: data.email || '',
    bio: data.bio || '',
    kosher: data.kosher || 'kosher',
    shabbat: data.shabbat || 'no',
    allergies: data.allergies || [],
  });

  const [saved, setSaved] = useState(false);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setData(prev => ({ ...prev, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const allergyOpts = [
    { value:'gluten',  label:t('a_gluten') },
    { value:'lactose', label:t('a_lactose') },
    { value:'nuts',    label:t('a_nuts') },
    { value:'peanuts', label:t('a_peanuts') },
    { value:'veg',     label:t('a_veg') },
    { value:'vegan',   label:t('a_vegan') },
    { value:'fish',    label:t('a_fish') },
  ];

  // Logic to calculate matches for each request
  const getMatchCount = (req) => {
    const families = window.MAP_FAMILIES || [];
    return families.filter(fam => {
      if (req.kosher) {
        if (fam.kosher === 'none' && req.kosher !== 'none') return false;
        if (req.kosher === 'mehadrin' && fam.kosher !== 'mehadrin') return false;
      }
      if (req.shabbat && fam.shabbat === 'secular') return false;
      if (req.needSleep && !fam.canSleep) return false;
      return true;
    }).length;
  };

  const requests = data.requests || [];

  return (
    <div className="screen-enter min-h-screen flex flex-col pb-12 bg-warm-50">
      <AppHeader title={t('s15_landing_profile_title')} onBack={onBack} />

      <div className="w-full max-w-md mx-auto px-5 space-y-6">
        
        {/* Open Requests Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('s15_open_requests')}</h2>
          </div>

          {/* Small plus button above all requests */}
          <div className="flex justify-start">
            <button 
              onClick={onNewRequest}
              className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm hover:bg-brand-600 transition-colors"
              title={t('s15_new_req')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {requests.length === 0 ? (
              <p className="text-warm-500 text-sm italic">{t('s15_no_requests_title')}</p>
            ) : (
              requests.map(req => {
                const matchCount = getMatchCount(req);
                const formatDate = (dateStr) => {
                  if (!dateStr) return '';
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return dateStr;
                  return d.toLocaleDateString('he-IL').replace(/\//g, '.');
                };
                
                return (
                  <div key={req.id} className="relative flex items-center gap-3">
                    <button
                      onClick={() => {
                        console.log('Viewing matches for request:', req.id);
                        onViewMatches(req.id);
                      }}
                      className="flex-1 text-right p-5 pr-6 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-200 transition-all flex items-center justify-between group/btn"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-900">{formatDate(req.when)}</span>
                        <span className={matchCount > 0 ? "text-brand-600 text-xs font-semibold" : "text-warm-400 text-xs"}>
                          {matchCount === 0 ? t('s15_no_matches_found') : t('s15_matches_found', matchCount)}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center group-hover/btn:bg-brand-500 group-hover/btn:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                    </button>
                    
                    {/* Action buttons next to the request button */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditRequest(req); }}
                        className="w-10 h-10 rounded-xl bg-white text-warm-500 border border-warm-200 flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 shadow-sm transition-colors"
                        title={t('s15_edit_req')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if(confirm(lang==='he'?'האם למחוק את הבקשה?':'Delete this request?')) onDeleteRequest(req.id); }}
                        className="w-10 h-10 rounded-xl bg-white text-warm-500 border border-warm-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors"
                        title={lang === 'he' ? 'מחק בקשה' : 'Delete Request'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Personal Details Section */}
        <Card className="space-y-4">
          <h2 className="section-label">{t('s12_personal')}</h2>
          <Input label={t('s3_first')} value={form.fullName} onChange={setF('fullName')} />
          <Input label={t('s3_phone')} value={form.phone} onChange={setF('phone')} />
          <Input label={t('s3_email')} value={form.email} onChange={setF('email')} />
        </Card>

        {/* Preferences Section */}
        <Card className="space-y-4">
          <h2 className="section-label">{t('s12_prefs')}</h2>
          <RadioGroup 
            label={t('s7_kosh')} 
            value={form.kosher} 
            onChange={setF('kosher')}
            options={[
              { value:'mehadrin', label:t('s7_meh'),    sub:t('s7_meh_s') },
              { value:'kosher',   label:t('s7_kosh_k'), sub:t('s7_kosh_k_s') },
              { value:'none',     label:t('s7_none'),   sub:t('s7_none_s') },
            ]}
          />
          <RadioGroup 
            label={t('s7_shab')} 
            value={form.shabbat} 
            onChange={setF('shabbat')}
            options={[
              { value:'yes', label:t('s7_yes'), sub:t('s7_yes_s') },
              { value:'no',  label:t('s7_no'),  sub:t('s7_no_s') },
            ]}
          />
          <MultiCheck label={t('s9_title')} options={allergyOpts} values={form.allergies} onChange={setF('allergies')} />
        </Card>

        {/* Bio Section */}
        <Card className="space-y-4">
          <h2 className="section-label">{t('s11_bio')}</h2>
          <div>
            <textarea value={form.bio} onChange={e => setF('bio')(e.target.value)}
              placeholder={t('s11_bio_ph')}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none" rows={4} />
          </div>
        </Card>

        <Btn onClick={handleSave} className="text-base py-4 shadow-lg">
          {saved ? (lang === 'he' ? 'נשמר בהצלחה! ✓' : 'Saved successfully! ✓') : (lang === 'he' ? 'שמור שינויים' : 'Save Changes')}
        </Btn>
      </div>
    </div>
  );
}
