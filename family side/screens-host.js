/* screens-host.js — S16 through S20 + S17 + S18 + S19 */
const { useState, useEffect, useRef } = React;

/* ── shared data for host screens ── */
const VIBE_TAGS_KEYS = [
  { value:'kids',       key:'vibe_kids'  }, { value:'quiet',    key:'vibe_quiet' },
  { value:'multi',      key:'vibe_multi' }, { value:'singing',  key:'vibe_sing'  },
  { value:'pets',       key:'vibe_pets'  }, { value:'spacious', key:'vibe_space' },
  { value:'shabbat_atm',key:'vibe_shab'  }, { value:'food',     key:'vibe_food'  },
];
const LANG_KEYS = [
  { value:'he', key:'lang_he' }, { value:'en', key:'lang_en' },
  { value:'ru', key:'lang_ru' }, { value:'ar', key:'lang_ar' },
  { value:'fr', key:'lang_fr' }, { value:'other', key:'lang_other' },
];

/* ════════════════════════════════════════
   S18 — Host Explain (how it works)
════════════════════════════════════════ */
function S18HostExplain({ onNext, onBack }) {
  const { t } = useLang();
  const features = [
    { icon:'✅', title:t('s18_f1_t'), desc:t('s18_f1_d') },
    { icon:'📅', title:t('s18_f2_t'), desc:t('s18_f2_d') },
    { icon:'🎯', title:t('s18_f3_t'), desc:t('s18_f3_d') },
    { icon:'🔒', title:t('s18_f4_t'), desc:t('s18_f4_d') },
  ];
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <SectionTitle icon="🏡" title={t('s18_title')} sub={t('s18_sub')} />
      <div className="flex-1 space-y-3 mb-8">
        {features.map(f => (
          <Card key={f.icon} className="flex gap-4 items-start p-4">
            <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-xs text-warm-500 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>
      <Btn onClick={onNext}>{t('s18_btn')}</Btn>
    </div>
  );
}

/* ════════════════════════════════════════
   S16 — Host Registration (5 steps)
════════════════════════════════════════ */
function S16HostRegistration({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const [internalStep, setInternalStep] = useState(1);
  const [errors, setErrors] = useState({});
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const TOTAL = 5;

  const stepLabels = t('s16_step_labels');

  /* ── Step indicator ── */
  function StepDots() {
    return (
      <div className="flex items-center justify-center gap-0 mb-6">
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const active = n === internalStep;
          const done   = n <  internalStep;
          return (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center">
                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  done   ? 'bg-brand-600 text-white' :
                  active ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
                  'bg-warm-200 text-warm-500'
                )}>
                  {done ? '✓' : n}
                </div>
                <span className={clsx('text-xs mt-1 text-center max-w-14 leading-tight',
                  active ? 'text-brand-600 font-semibold' : 'text-warm-400'
                )}>{label}</span>
              </div>
              {i < TOTAL-1 && <div className={clsx('h-0.5 w-8 mb-4 flex-shrink-0 mx-0.5 transition-all', n < internalStep ? 'bg-brand-500' : 'bg-warm-200')} />}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  const advance = (validFn) => {
    if (validFn && !validFn()) return;
    if (internalStep < TOTAL) setInternalStep(s => s + 1);
    else onNext();
  };
  const back = () => internalStep > 1 ? setInternalStep(s => s - 1) : onBack();

  /* ────────── Step 1 — Personal info ────────── */
  if (internalStep === 1) {
    const validate = () => {
      const e = {};
      if (!data.hostFullName?.trim()) e.name  = t('v_name');
      if (!data.hostPhone?.trim() || data.hostPhone.replace(/\D/g,'').length < 9) e.phone = t('v_phone');
      if (!data.hostEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.hostEmail)) e.email = t('v_email');
      setErrors(e); return Object.keys(e).length === 0;
    };
    return (
      <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
        <BackBtn onBack={back} />
        <StepDots />
        <SectionTitle icon="👨‍👩‍👧" title={t('s16_1_title')} sub={t('s16_1_sub')} />
        <Card className="bg-brand-50 border-brand-100 flex gap-3 items-start mb-5">
          <span className="text-2xl flex-shrink-0">🕯️</span>
          <p className="text-xs text-brand-800 leading-relaxed">{t('s16_welcome')}</p>
        </Card>
        <Input label={t('s16_name')} value={data.hostFullName||''} onChange={set('hostFullName')} placeholder={t('s16_name_ph')} error={errors.name} />
        <Input label={t('s16_phone')} type="tel" value={data.hostPhone||''} onChange={set('hostPhone')} placeholder="050-1234567" hint={t('s16_phone_hint')} error={errors.phone} />
        <Input label={t('s16_email')} type="email" value={data.hostEmail||''} onChange={set('hostEmail')} placeholder="family@gmail.com" error={errors.email} />
        <div className="mt-auto pt-4"><Btn onClick={() => advance(validate)}>{t('continue')}</Btn></div>
      </div>
    );
  }

  /* ────────── Step 2 — Location & Languages ────────── */
  if (internalStep === 2) {
    const langOpts = LANG_KEYS.map(l => ({ value:l.value, label:t(l.key) }));
    const validate = () => {
      const e = {};
      if (!data.hostCity?.trim()) e.city = t('v_city');
      setErrors(e); return Object.keys(e).length === 0;
    };
    return (
      <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
        <BackBtn onBack={back} />
        <StepDots />
        <SectionTitle icon="📍" title={t('s16_2_title')} sub={t('s16_2_sub')} />
        <Input label={t('s16_city')} value={data.hostCity||''} onChange={set('hostCity')} placeholder={t('s16_city_ph')} hint={t('s16_city_hint')} error={errors.city} />
        <MultiCheck label={t('s16_langs')} options={langOpts} values={data.hostLanguages||['he']} onChange={val => set('hostLanguages')(val)} />
        <div className="mt-auto pt-4"><Btn onClick={() => advance(validate)}>{t('continue')}</Btn></div>
      </div>
    );
  }

  /* ────────── Step 3 — Lifestyle ────────── */
  if (internalStep === 3) {
    const validate = () => {
      const e = {};
      if (!data.shabbatObservance) e.shab = t('v_shab');
      if (!data.hostKosher) e.kosh = t('v_kosh');
      setErrors(e); return Object.keys(e).length === 0;
    };
    return (
      <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
        <BackBtn onBack={back} />
        <StepDots />
        <SectionTitle icon="🕯️" title={t('s16_3_title')} sub={t('s16_3_sub')} />
        <RadioGroup label={t('s16_shab_lev')} value={data.shabbatObservance||''} onChange={set('shabbatObservance')}
          options={[
            { value:'observant',   label:t('s16_obs'),  sub:t('s16_obs_s')  },
            { value:'traditional', label:t('s16_trad'), sub:t('s16_trad_s') },
            { value:'secular',     label:t('s16_sec'),  sub:t('s16_sec_s')  },
          ]}
        />
        {errors.shab && <p className="-mt-2 mb-3 text-xs text-red-500 font-medium">{errors.shab}</p>}
        <RadioGroup label={t('s16_kosh_lev')} value={data.hostKosher||''} onChange={set('hostKosher')}
          options={[
            { value:'mehadrin', label:t('s16_meh'),  sub:t('s16_meh_s')  },
            { value:'kosher',   label:t('s16_k'),    sub:t('s16_k_s')    },
            { value:'none',     label:t('s16_none'), sub:t('s16_none_s') },
          ]}
        />
        {errors.kosh && <p className="-mt-2 mb-3 text-xs text-red-500 font-medium">{errors.kosh}</p>}
        <div className="mt-auto pt-4"><Btn onClick={() => advance(validate)}>{t('continue')}</Btn></div>
      </div>
    );
  }

  /* ────────── Step 4 — Services ────────── */
  if (internalStep === 4) {
    return (
      <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
        <BackBtn onBack={back} />
        <StepDots />
        <SectionTitle icon="🤝" title={t('s16_4_title')} sub={t('s16_4_sub')} />
        <Card className="mb-5">
          <p className="text-xs text-warm-400 mb-4">{t('s16_opt')}</p>
          <div className="space-y-4">
            <CheckRow checked={!!data.hostCanSleep} onChange={set('hostCanSleep')}>
              <span><span className="font-medium text-gray-800">{t('s16_slp')}</span><br/><span className="text-warm-400">{t('s16_slp_s')}</span></span>
            </CheckRow>
            <CheckRow checked={!!data.hostCanTransport} onChange={set('hostCanTransport')}>
              <span><span className="font-medium text-gray-800">{t('s16_trn')}</span><br/><span className="text-warm-400">{t('s16_trn_s')}</span></span>
            </CheckRow>
          </div>
        </Card>
        <Card className="bg-brand-50 border-brand-100 flex gap-3 items-start">
          <span className="text-xl flex-shrink-0">💡</span>
          <p className="text-xs text-brand-800 leading-relaxed">{t('s16_tip')}</p>
        </Card>
        <div className="mt-auto pt-5"><Btn onClick={() => advance()}>{t('continue')}</Btn></div>
      </div>
    );
  }

  /* ────────── Step 5 — Home vibe + summary ────────── */
  const vibeOpts = VIBE_TAGS_KEYS.map(v => ({ value:v.value, label:t(v.key) }));
  
  const koshLabel = data.hostKosher === 'mehadrin' ? t('map_meh') : data.hostKosher === 'kosher' ? t('map_kosh') : t('map_none');
  const shabbatLabel = data.shabbatObservance === 'observant' ? t('map_obs') : data.shabbatObservance === 'traditional' ? t('map_trad') : t('map_sec');

  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto pb-12">
      <BackBtn onBack={back} />
      <StepDots />
      <SectionTitle icon="🏡" title={t('s16_5_title')} sub={t('s16_5_sub')} />
      <MultiCheck label={t('s16_vibe_label')} options={vibeOpts} values={data.hostVibeTags||[]} onChange={val => set('hostVibeTags')(val)} />
      <p className="text-xs text-warm-400 -mt-2 mb-4">{t('s16_vibe_sub')}</p>
      <Card className="mb-5 bg-warm-50 border-warm-200">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2.5">{t('s16_sum_title')}</p>
        <div className="space-y-1.5">
          {data.hostFullName && <div className="flex justify-between text-xs"><span className="text-warm-500">{t('s16_sum_name')}</span><span className="font-medium text-gray-800">{data.hostFullName}</span></div>}
          {data.hostCity     && <div className="flex justify-between text-xs"><span className="text-warm-500">{t('s16_sum_city')}</span><span className="font-medium text-gray-800">{data.hostCity}</span></div>}
          {shabbatLabel      && <div className="flex justify-between text-xs"><span className="text-warm-500">{t('s16_sum_shab')}</span><span className="font-medium text-gray-800">{shabbatLabel}</span></div>}
          {koshLabel         && <div className="flex justify-between text-xs"><span className="text-warm-500">{t('s16_sum_name')}</span><span className="font-medium text-gray-800">{koshLabel}</span></div>}
          {(data.hostVibeTags||[]).length > 0 && (
            <div className="flex justify-between text-xs items-start gap-2">
              <span className="text-warm-500 flex-shrink-0">{t('s16_sum_tags')}</span>
              <span className="font-medium text-gray-800 text-left leading-relaxed">{data.hostVibeTags.map(v => { const f = VIBE_TAGS_KEYS.find(x => x.value===v); return f ? t(f.key) : v; }).join(' · ')}</span>
            </div>
          )}
        </div>
      </Card>
      <Btn onClick={() => advance()} className="text-base py-4">{t('s16_submit')}</Btn>
    </div>
  );
}

/* ════════════════════════════════════════
   S17 — Host Registration Success
════════════════════════════════════════ */
function S17HostSuccess({ onHome, name }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center shadow-xl">
          <span className="text-5xl">🏡</span>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('s17_hi')}</h1>
      <p className="text-xl font-semibold text-brand-600 mb-2">{name}</p>
      <p className="text-base text-green-600 font-bold mb-1">{t('s17_ok')}</p>
      <p className="text-sm text-warm-500 mb-10 leading-relaxed" style={{whiteSpace:'pre-line'}}>{t('s17_desc')}</p>
      <Btn onClick={onHome} className="text-lg py-4">{t('s17_home')}</Btn>
    </div>
  );
}

/* ════════════════════════════════════════
   S19 — Host Home
════════════════════════════════════════ */
function S19HostHome({ data, setData, onNewHosting, onProfile }) {
  const { t } = useLang();
  
  const hostings = data.hostings || [];

  const handleEditHosting = (hosting) => {
    setData(prev => ({ ...prev, editingHostingId: hosting.id }));
    onNewHosting(); // Navigate to S20
  };

  const handleNewHosting = () => {
    setData(prev => ({ ...prev, editingHostingId: null }));
    onNewHosting();
  };

  const handleCancelHosting = (hosting) => {
    setData(prev => ({
      ...prev,
      hostings: prev.hostings.filter(h => h.id !== hosting.id)
    }));
  };

  const hostName = data.hostFullName || '...';
  
  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24 relative">
      {/* Header */}
      <div className="soldier-home-header">
        <div className="soldier-home-greeting">
          <span>{t('s19_hi')}</span>
          <strong>{hostName}</strong>
        </div>
        <div className="soldier-home-actions">
          <LangToggle variant="inline" />
          <button onClick={onProfile} className="soldier-home-icon-btn" title="הגדרות" aria-label="הגדרות">⚙️</button>
        </div>
      </div>

      <div className="px-5 mt-2 space-y-5">
        <Btn onClick={handleNewHosting} className="shadow-md text-base py-4">{t('s19_new')}</Btn>

        {/* My Hostings */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">{t('s19_my_hostings')}</h2>
          {hostings.length === 0 ? (
            <Card className="text-center py-6 text-warm-400">
              <span className="text-3xl block mb-2">🗓️</span>
              <p className="text-sm">{t('s19_no_hostings')}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {hostings.map(h => {
                const guests = h.guests || [];
                const guestCount = guests.length;
                const capacity = h.soldiers || 0;
                const isFull = guestCount >= capacity && capacity > 0;
                
                return (
                  <Card key={h.id} className="border-brand-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{new Date(h.date).toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'short'})}</p>
                        <p className="text-xs text-warm-500 mt-0.5">{h.time === 'friday_evening' ? t('s20_fri_time') : h.time === 'saturday_lunch' ? t('s20_sat_time') : h.customTime || t('s20_cust_time')}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {guestCount} / {capacity} {t('s19_spots_taken')}
                      </span>
                    </div>
                    
                    {/* Guests List */}
                    {guestCount > 0 ? (
                      <div className="mt-3 mb-4 bg-warm-50 p-2.5 rounded-xl border border-warm-200">
                        <p className="text-xs font-bold text-gray-700 mb-2">{t('s19_guests_title')}</p>
                        <div className="space-y-2">
                          {guests.map(g => (
                            <div key={g.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px]">🪖</div>
                              <span className="text-xs font-medium text-gray-800">{g.name} <span className="text-warm-500 font-normal">({g.unit})</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 mb-4 text-xs text-warm-400 italic">
                        {t('s19_no_guests_yet')}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button onClick={() => handleEditHosting(h)} className="flex-1 py-2 rounded-xl bg-warm-100 text-warm-600 text-xs font-bold hover:bg-warm-200 transition-colors">{t('s19_edit_hosting')}</button>
                      <button onClick={() => handleCancelHosting(h)} className="flex-1 py-2 rounded-xl bg-white border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">{t('s19_cancel_hosting')}</button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   S20 — Create New Hosting
════════════════════════════════════════ */
function S20NewHosting({ data, setData, onBack, onSubmit }) {
  const { t } = useLang();
  const editingHosting = data.hostings?.find(h => h.id === data.editingHostingId);
  const [form, setForm] = useState(() => {
    if (editingHosting) return { ...editingHosting, images: editingHosting.images || [], soldiers: String(editingHosting.soldiers) };
    return { date:'', time:'', customTime:'', soldiers:'', note:'', images:[] };
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const upcomingDates = (() => {
    const dates = []; const today = new Date(); let d = new Date(today);
    d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
    for (let i = 0; i < 4; i++) {
      const fri = new Date(d); const sat = new Date(d); sat.setDate(sat.getDate() + 1);
      dates.push({
        value: fri.toISOString().split('T')[0],
        dateLabel: fri.toLocaleDateString('he-IL', { day:'numeric', month:'long' }),
        satLabel:  sat.toLocaleDateString('he-IL', { day:'numeric', month:'long' }),
      });
      d.setDate(d.getDate() + 7);
    }
    return dates;
  })();

  const TIME_OPTIONS = [
    { value:'friday_evening', label:t('s20_fri_eve'), sub:t('s20_fri_eve_s') },
    { value:'saturday_lunch', label:t('s20_sat_lun'), sub:t('s20_sat_lun_s') },
    { value:'custom',         label:t('s20_custom'),  sub:t('s20_custom_s')  },
  ];
  const SOLDIER_OPTS = ['1','2','3','4','5+'];

  const validate = () => {
    const e = {};
    if (!form.date)    e.date    = t('v_date');
    if (!form.time)    e.time    = t('v_time');
    if (!form.soldiers) e.soldiers = t('v_sol');
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    setData(prev => {
      const hostings = prev.hostings || [];
      if (prev.editingHostingId) {
        return {
          ...prev,
          hostings: hostings.map(h => h.id === prev.editingHostingId ? { ...form } : h),
          editingHostingId: null
        };
      } else {
        return {
          ...prev,
          hostings: [...hostings, { ...form, id: Date.now(), guests: [] }]
        };
      }
    });

    setSubmitted(true);
    setTimeout(() => onSubmit(), 1800);
  };

  const handleImageAdd = () => {
    const colors = ['#fbd5b0','#f7b87a','#e87020','#c2560e','#9c420c'];
    setF('images')([...form.images, { id:Date.now(), color:colors[form.images.length % colors.length] }]);
  };

  if (submitted) return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-lg"><span className="text-5xl">✅</span></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('s20_done_title')}</h1>
      <p className="text-sm text-warm-500 leading-relaxed">{t('s20_done_sub')}</p>
      <div className="flex gap-1.5 justify-center mt-6">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
      </div>
    </div>
  );

  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto pb-12">
      <BackBtn onBack={onBack} />
      <SectionTitle icon="🏡" title={t('s20_title')} sub={t('s20_sub')} />

      {/* Date */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">{t('s20_date_label')}</p>
        <p className="text-xs text-warm-400 mb-3">{t('s20_date_sub')}</p>
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {upcomingDates.map(d => (
            <button key={d.value} type="button" onClick={() => setF('date')(d.value)}
              className={clsx('p-3.5 rounded-xl border-2 text-right transition-all duration-150 active:scale-95',
                form.date === d.value ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-warm-200 bg-white hover:border-brand-300 hover:bg-warm-50'
              )}>
              <p className={clsx('text-xs font-semibold mb-0.5', form.date === d.value ? 'text-brand-600' : 'text-warm-500')}>{t('s20_day')}</p>
              <p className={clsx('text-sm font-bold', form.date === d.value ? 'text-brand-700' : 'text-gray-800')}>{d.dateLabel}</p>
              <p className="text-xs text-warm-400 mt-0.5">{t('s20_shab')} {d.satLabel}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-warm-200" /><span className="text-xs text-warm-400">{t('s20_other')}</span><div className="flex-1 h-px bg-warm-200" />
        </div>
        <input type="date" value={form.date} onChange={e => setF('date')(e.target.value)}
          className="mt-3 w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all" />
        {errors.date && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.date}</p>}
      </div>

      {/* Time */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2.5">{t('s20_time_label')}</p>
        <div className="flex flex-col gap-2">
          {TIME_OPTIONS.map(opt => (
            <label key={opt.value} onClick={() => setF('time')(opt.value)}
              className={clsx('flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
                form.time === opt.value ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-warm-200 bg-white hover:border-brand-300 hover:bg-warm-50'
              )}>
              <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', form.time === opt.value ? 'border-brand-600' : 'border-warm-300')}>
                {form.time === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-warm-500">{opt.sub}</p>
              </div>
            </label>
          ))}
        </div>
        {form.time === 'custom' && (
          <input type="time" value={form.customTime} onChange={e => setF('customTime')(e.target.value)}
            className="mt-3 w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all" />
        )}
        {errors.time && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.time}</p>}
      </div>

      {/* Soldiers */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">{t('s20_sol_label')}</p>
        <p className="text-xs text-warm-400 mb-3">{t('s20_sol_sub')}</p>
        <div className="flex gap-2.5">
          {SOLDIER_OPTS.map(n => (
            <button key={n} type="button" onClick={() => setF('soldiers')(n)}
              className={clsx('flex-1 h-12 rounded-xl text-sm font-bold border-2 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-300',
                String(form.soldiers) === n ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-105' : 'bg-white text-gray-600 border-warm-300 hover:border-brand-400 hover:bg-brand-50'
              )}>{n}</button>
          ))}
        </div>
        {errors.soldiers && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.soldiers}</p>}
      </div>

      {/* Free text */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('s20_note_label')}</label>
        <p className="text-xs text-warm-400 mb-2">{t('s20_note_sub')}</p>
        <textarea value={form.note} onChange={e => setF('note')(e.target.value)} placeholder={t('s20_note_ph')}
          rows={4} maxLength={300}
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all" />
        <p className="text-xs text-warm-400 mt-1 text-left">{form.note.length}/300</p>
      </div>

      {/* Images */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-1.5">{t('s20_img_label')}</p>
        <p className="text-xs text-warm-400 mb-3">{t('s20_img_sub')}</p>
        <div className="flex gap-2.5 flex-wrap">
          {form.images.map((img, i) => (
            <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
              <div className="w-full h-full flex items-center justify-center text-2xl" style={{background:img.color}}>🏠</div>
              <button type="button" onClick={() => setF('images')(form.images.filter((_,j) => j!==i))}
                className="absolute top-1 left-1 w-5 h-5 bg-gray-800 bg-opacity-60 rounded-full text-white text-xs flex items-center justify-center hover:bg-opacity-80">✕</button>
            </div>
          ))}
          {form.images.length < 5 && (
            <button type="button" onClick={handleImageAdd}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-warm-300 bg-warm-50 flex flex-col items-center justify-center gap-1 hover:border-brand-400 hover:bg-brand-50 transition-all flex-shrink-0">
              <span className="text-2xl">📷</span>
              <span className="text-xs text-warm-400">{t('s20_add')}</span>
            </button>
          )}
        </div>
        {form.images.length > 0 && <p className="text-xs text-warm-400 mt-2">{t('s20_img_count', form.images.length)}</p>}
      </div>

      {/* Preview */}
      {(form.date || form.time || form.soldiers) && (
        <Card className="mb-5 bg-warm-50 border-warm-200">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2.5">{t('s20_prev_title')}</p>
          <div className="space-y-1.5">
            {form.date && (
              <div className="flex justify-between text-xs">
                <span className="text-warm-500">{t('s20_prev_date')}</span>
                <span className="font-medium text-gray-800">{new Date(form.date).toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'})}</span>
              </div>
            )}
            {form.time && (
              <div className="flex justify-between text-xs">
                <span className="text-warm-500">{t('s20_prev_time')}</span>
                <span className="font-medium text-gray-800">
                  {form.time === 'friday_evening' ? t('s20_fri_time') : form.time === 'saturday_lunch' ? t('s20_sat_time') : form.customTime || t('s20_cust_time')}
                </span>
              </div>
            )}
            {form.soldiers && (
              <div className="flex justify-between text-xs">
                <span className="text-warm-500">{t('s20_prev_slots')}</span>
                <span className="font-medium text-gray-800">{t('s20_slots_val', form.soldiers)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <Btn onClick={handleSubmit} className="text-base py-4">{t('s20_submit')}</Btn>
    </div>
  );
}
