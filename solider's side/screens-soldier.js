/* screens-soldier.js — S1 through S15 */

function S1Welcome({ onSoldier, onHost }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-brand-50 via-warm-50 to-white">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-brand-600 flex items-center justify-center shadow-xl"><span className="text-4xl">🕯️</span></div>
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

function S2Explain({ onNext, onBack }) {
  const { t } = useLang();
  const features = [
    { icon:'📍', title:t('s2_f1_t'), desc:t('s2_f1_d') },
    { icon:'✅', title:t('s2_f2_t'), desc:t('s2_f2_d') },
    { icon:'📅', title:t('s2_f3_t'), desc:t('s2_f3_d') },
    { icon:'🔒', title:t('s2_f4_t'), desc:t('s2_f4_d') },
  ];
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <div className="flex-1">
        <SectionTitle icon="👋" title={t('s2_title')} sub={t('s2_sub')} />
        <div className="space-y-3 mb-8">
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
      </div>
      <Btn onClick={onNext}>{t('s2_btn')}</Btn>
    </div>
  );
}

function S3Account({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.firstName?.trim()) e.firstName = t('err_first');
    if (!data.lastName?.trim())  e.lastName  = t('err_last');
    if (!data.phone?.trim() || data.phone.replace(/\D/g,'').length < 9) e.phone = t('err_phone');
    if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = t('err_email');
    if (!data.password || data.password.length < 6) e.password = t('err_pass');
    if (!data.terms) e.terms = t('err_terms');
    setErrors(e); return Object.keys(e).length === 0;
  };
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={1} total={12} />
      <SectionTitle icon="📝" title={t('s3_title')} sub={t('s3_sub')} />
      <div className="flex gap-3">
        <div className="flex-1"><Input label={t('s3_first')} value={data.firstName||''} onChange={set('firstName')} placeholder={t('s3_ph_first')} error={errors.firstName} /></div>
        <div className="flex-1"><Input label={t('s3_last')}  value={data.lastName||''}  onChange={set('lastName')}  placeholder={t('s3_ph_last')}  error={errors.lastName}  /></div>
      </div>
      <Input label={t('s3_phone')} type="tel"      value={data.phone||''}    onChange={set('phone')}    placeholder="050-1234567"      error={errors.phone}    />
      <Input label={t('s3_email')} type="email"    value={data.email||''}    onChange={set('email')}    placeholder={t('s3_ph_email')} error={errors.email}    />
      <Input label={t('s3_pass')}  type="password" value={data.password||''} onChange={set('password')} placeholder={t('s3_pass_ph')}  error={errors.password} hint={t('s3_pass_hint')} />
      <div className="mb-6 mt-1">
        <CheckRow checked={!!data.terms} onChange={set('terms')}>
          <span>{t('s3_terms_pre')}{' '}<span className="text-brand-600 underline cursor-pointer">{t('s3_terms_link1')}</span>{' '}{t('s3_terms_and')}{' '}<span className="text-brand-600 underline cursor-pointer">{t('s3_terms_link2')}</span></span>
        </CheckRow>
        {errors.terms && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.terms}</p>}
      </div>
      <Btn onClick={() => { if (validate()) onNext(); }}>{t('continue')}</Btn>
    </div>
  );
}

function S4Verify({ phone, onNext, onBack }) {
  const { t } = useLang();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRef = useRef();
  useEffect(() => {
    inputRef.current?.focus();
    const tick = setInterval(() => setTimer(p => p > 0 ? p-1 : 0), 1000);
    return () => clearInterval(tick);
  }, []);
  const verify = () => { if (code === '123456') onNext(); else setError(t('s4_wrong')); };
  const resend = () => { setTimer(30); setSent(true); setError(''); setCode(''); };
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={2} total={12} />
      <SectionTitle icon="📱" title={t('s4_title')} />
      <Card className="text-center mb-6 py-6">
        <p className="text-sm text-warm-500 mb-1">{t('s4_sent')}</p>
        <p className="text-lg font-bold text-gray-900" style={{direction:'ltr'}}>{phone || '050-XXXXXXX'}</p>
        {sent && <p className="text-xs text-green-600 mt-2 font-medium">{t('s4_resent')}</p>}
      </Card>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s4_label')}</label>
        <input ref={inputRef} type="text" inputMode="numeric" maxLength={6} value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g,'')); setError(''); }}
          placeholder="• • • • • •"
          className={clsx('otp-input w-full px-4 py-4 rounded-xl border text-center bg-white transition-all focus:outline-none focus:ring-2',
            error ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-warm-300 focus:ring-brand-300 focus:border-brand-400')}
        />
        {error && <p className="mt-1.5 text-sm text-red-500 font-medium text-center">{error}</p>}
      </div>
      <p className="text-xs text-warm-400 text-center mb-6">💡 {t('s4_hint')}</p>
      <div className="space-y-3">
        <Btn onClick={verify} disabled={code.length !== 6}>{t('s4_btn')}</Btn>
        <button onClick={resend} disabled={timer > 0} className="w-full text-center text-sm text-brand-600 font-medium py-2 disabled:text-warm-400 hover:underline transition-colors">
          {t('s4_resend', timer)}
        </button>
      </div>
    </div>
  );
}

function S5Service({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={3} total={12} />
      <SectionTitle icon="🪖" title={t('s5_title')} sub={t('s5_sub')} />
      <RadioGroup label={t('s5_type')} value={data.serviceType||''} onChange={set('serviceType')}
        options={[
          { value:'regular', label:t('s5_reg'), sub:t('s5_reg_s') },
          { value:'reserve', label:t('s5_res'), sub:t('s5_res_s') },
          { value:'career',  label:t('s5_car'), sub:t('s5_car_s') },
        ]}
      />
      <Input label={t('s5_unit')} value={data.unit||''} onChange={set('unit')} placeholder={t('s5_unit_ph')} hint={t('s5_unit_hint')} />
      <div className="mt-auto pt-4"><Btn onClick={onNext} disabled={!data.serviceType}>{t('continue')}</Btn></div>
    </div>
  );
}

function S6Upload({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const [uploaded, setUploaded] = useState(!!data.docUploaded);
  const [docType, setDocType] = useState(data.docType||'');
  const [uploading, setUploading] = useState(false);
  const mockUpload = () => {
    if (!docType) return;
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploaded(true); setData(prev => ({ ...prev, docUploaded:true, docType })); }, 1800);
  };
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={4} total={12} />
      <SectionTitle icon="📄" title={t('s6_title')} sub={t('s6_sub')} />
      <RadioGroup label={t('s6_doc')} value={docType} onChange={setDocType}
        options={[
          { value:'tag',     label:t('s6_tag') },
          { value:'reserve', label:t('s6_res') },
          { value:'other',   label:t('s6_oth') },
        ]}
      />
      {!uploaded ? (
        <div className="mb-5">
          <div onClick={() => docType && mockUpload()} className={clsx(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
            docType ? 'border-brand-400 bg-brand-50 hover:bg-brand-100' : 'border-warm-300 bg-warm-50 cursor-not-allowed opacity-60'
          )}>
            {uploading
              ? <div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /><p className="text-sm text-brand-600 font-medium">{t('s6_loading')}</p></div>
              : <div className="flex flex-col items-center gap-2"><span className="text-4xl">📸</span><p className="font-semibold text-gray-700 text-sm">{t('s6_tap')}</p><p className="text-xs text-warm-400">{t('s6_size')}</p></div>
            }
          </div>
          {!docType && <p className="text-xs text-amber-600 mt-2 text-center">{t('s6_pick_first')}</p>}
        </div>
      ) : (
        <Card className="flex items-center gap-4 mb-5 border-green-200 bg-green-50">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-2xl">✅</span></div>
          <div><p className="font-semibold text-green-800 text-sm">{t('s6_done')}</p><p className="text-xs text-green-600 mt-0.5">{t('s6_saved')}</p></div>
        </Card>
      )}
      <Card className="flex items-start gap-3 mb-6 bg-amber-50 border-amber-200">
        <span className="text-xl flex-shrink-0">🔒</span>
        <p className="text-xs text-amber-800 leading-relaxed">{t('s6_note')}</p>
      </Card>
      <div className="mt-auto"><Btn onClick={onNext} disabled={!uploaded}>{t('continue')}</Btn></div>
    </div>
  );
}

function S7Kosher({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={5} total={12} />
      <SectionTitle icon="🕍" title={t('s7_title')} sub={t('s7_sub')} />
      <RadioGroup label={t('s7_kosh')} value={data.kosher||''} onChange={set('kosher')}
        options={[
          { value:'none',     label:t('s7_none'),   sub:t('s7_none_s')   },
          { value:'kosher',   label:t('s7_kosh_k'), sub:t('s7_kosh_k_s') },
          { value:'mehadrin', label:t('s7_meh'),    sub:t('s7_meh_s')    },
        ]}
      />
      <RadioGroup label={t('s7_shab')} value={data.shabbatKeeps||''} onChange={set('shabbatKeeps')}
        options={[
          { value:'yes', label:t('s7_yes'), sub:t('s7_yes_s') },
          { value:'no',  label:t('s7_no'),  sub:t('s7_no_s')  },
        ]}
      />
      <div className="mt-auto"><Btn onClick={onNext} disabled={!data.kosher || !data.shabbatKeeps}>{t('continue')}</Btn></div>
    </div>
  );
}

function S8Location({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={6} total={12} />
      <SectionTitle icon="🏠" title={t('s8_title')} sub={t('s8_sub')} />
      <Card className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">{t('s8_section')}</p>
        <p className="text-xs text-warm-400 mb-4">{t('s8_multi')}</p>
        <div className="space-y-4">
          <CheckRow checked={!!data.needSleep} onChange={set('needSleep')}>
            <span><span className="font-medium text-gray-800">{t('s8_sleep')}</span><br/><span className="text-warm-400">{t('s8_sleep_s')}</span></span>
          </CheckRow>
          <CheckRow checked={!!data.walkDistance} onChange={set('walkDistance')}>
            <span><span className="font-medium text-gray-800">{t('s8_walk')}</span><br/><span className="text-warm-400">{t('s8_walk_s')}</span></span>
          </CheckRow>
        </div>
      </Card>
      <Card className="bg-brand-50 border-brand-100 flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">💡</span>
        <p className="text-xs text-brand-800 leading-relaxed">{t('s8_tip')}</p>
      </Card>
      <div className="mt-auto pt-5"><Btn onClick={onNext}>{t('continue')}</Btn></div>
    </div>
  );
}

function S9Allergies({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const opts = [
    { value:'gluten',     label:t('a_gluten')  }, { value:'lactose', label:t('a_lactose') },
    { value:'nuts',       label:t('a_nuts')    }, { value:'peanuts', label:t('a_peanuts') },
    { value:'vegetarian', label:t('a_veg')     }, { value:'vegan',   label:t('a_vegan')   },
    { value:'fish',       label:t('a_fish')    }, { value:'other',   label:t('a_other')   },
  ];
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={7} total={12} />
      <SectionTitle icon="🥗" title={t('s9_title')} sub={t('s9_sub')} />
      <MultiCheck label={t('s9_label')} options={opts} values={data.allergies||[]} onChange={val => set('allergies')(val)} />
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s9_note_label')}</label>
        <textarea value={data.allergyNote||''} onChange={e => set('allergyNote')(e.target.value)} placeholder={t('s9_note_ph')}
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all" rows={3} />
      </div>
      <div className="mt-auto"><Btn onClick={onNext}>{t('continue')}</Btn></div>
    </div>
  );
}

function S10Prefs({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const langOpts = [
    { value:'he', label:t('lang_he') }, { value:'en', label:t('lang_en') },
    { value:'ru', label:t('lang_ru') }, { value:'ar', label:t('lang_ar') }, { value:'other', label:t('lang_other') },
  ];
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={8} total={12} />
      <SectionTitle icon="⚙️" title={t('s10_title')} sub={t('s10_sub')} />
      <RadioGroup label={t('s10_sol')} value={data.withSoldiers||''} onChange={set('withSoldiers')}
        options={[
          { value:'yes', label:t('s10_sol_yes') }, { value:'no', label:t('s10_sol_no') }, { value:'dontmind', label:t('s10_sol_dm') },
        ]}
      />
      <MultiCheck label={t('s10_lang')} options={langOpts} values={data.languages||['he']} onChange={val => set('languages')(val)} />
      <RadioGroup label={t('s10_pets')} value={data.pets||''} onChange={set('pets')}
        options={[
          { value:'ok', label:t('s10_pets_ok') }, { value:'notok', label:t('s10_pets_no') }, { value:'allergy', label:t('s10_pets_al') },
        ]}
      />
      <div className="mt-auto pt-2"><Btn onClick={onNext} disabled={!data.withSoldiers || !data.pets}>{t('continue')}</Btn></div>
    </div>
  );
}

function S11Profile({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const [imgPreview, setImgPreview] = useState(data.avatarPreview||null);
  const mockUploadImg = () => {
    const colors = ['#c2560e','#2563eb','#16a34a','#7c3aed','#db2777'];
    const col = colors[Math.floor(Math.random()*colors.length)];
    setImgPreview(col); setData(prev => ({ ...prev, avatarPreview: col }));
  };
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={9} total={12} />
      <SectionTitle icon="😊" title={t('s11_title')} sub={t('s11_sub')} />
      <div className="flex justify-center mb-6">
        <div onClick={mockUploadImg} className="relative w-24 h-24 rounded-full cursor-pointer group">
          {imgPreview
            ? <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md" style={{background:imgPreview}}>{(data.firstName||'?')[0]}</div>
            : <div className="w-24 h-24 rounded-full bg-warm-200 flex items-center justify-center border-2 border-dashed border-warm-400 group-hover:border-brand-400 transition-colors"><span className="text-3xl">📷</span></div>
          }
          <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center shadow-md"><span className="text-white text-sm">+</span></div>
        </div>
      </div>
      <p className="text-center text-xs text-warm-400 mb-5">{t('s11_photo')}</p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s11_bio')}</label>
        <textarea value={data.bio||''} onChange={e => set('bio')(e.target.value)} placeholder={t('s11_bio_ph')}
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all" rows={4} maxLength={300} />
        <p className="text-xs text-warm-400 mt-1 text-left">{(data.bio||'').length}/300</p>
      </div>
      <div className="mt-auto"><Btn onClick={onNext}>{t('continue')}</Btn></div>
    </div>
  );
}

function S12Summary({ data, onEdit, onSubmit, onBack }) {
  const { t } = useLang();
  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between items-start py-2.5 border-b border-warm-100 last:border-0">
      <span className="text-xs text-warm-500 font-medium w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-left flex-1 mr-2">{value}</span>
    </div>
  ) : null;
  const svc  = { regular:t('map_reg'), reserve:t('map_res'), career:t('map_car') };
  const kosh = { none:t('map_none'), kosher:t('map_kosh'), mehadrin:t('map_meh') };
  const pets = { ok:t('map_pets_ok'), notok:t('map_pets_no'), allergy:t('map_pets_al') };
  const sol  = { yes:t('map_sol_yes'), no:t('map_sol_no'), dontmind:t('map_sol_dm') };
  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={10} total={12} />
      <SectionTitle icon="📋" title={t('s12_title')} sub={t('s12_sub')} />
      <Card className="mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">{t('s12_personal')}</p>
        <Row label={t('s12_full')}  value={`${data.firstName||''} ${data.lastName||''}`} />
        <Row label={t('s12_phone')} value={data.phone} />
        <Row label={t('s12_email')} value={data.email} />
      </Card>
      <Card className="mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">{t('s12_mil')}</p>
        <Row label={t('s12_stype')} value={svc[data.serviceType]} />
        <Row label={t('s12_unit')}  value={data.unit} />
        <Row label={t('s12_doc')}   value={data.docUploaded ? t('s12_uploaded') : '—'} />
      </Card>
      <Card className="mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">{t('s12_prefs')}</p>
        <Row label={t('s12_kosh')}   value={kosh[data.kosher]} />
        <Row label={t('s12_shab')}   value={data.shabbatKeeps === 'yes' ? t('s7_yes') : data.shabbatKeeps === 'no' ? t('s7_no') : null} />
        <Row label={t('s12_sleep')}  value={data.needSleep    ? t('map_sleep') : null} />
        <Row label={t('s12_walk')}   value={data.walkDistance ? t('map_walk')  : null} />
        <Row label={t('s12_allerg')} value={(data.allergies||[]).join(', ') || t('s12_no_allerg')} />
        <Row label={t('s12_pets')}   value={pets[data.pets]} />
        <Row label={t('s12_sol')}    value={sol[data.withSoldiers]} />
      </Card>
      {data.bio && (
        <Card className="mb-4 bg-brand-50 border-brand-100">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">{t('s12_bio')}</p>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{data.bio}"</p>
        </Card>
      )}
      <div className="space-y-3 mt-4">
        <Btn onClick={onSubmit}>{t('s12_submit')}</Btn>
        <Btn variant="secondary" onClick={onEdit}>{t('s12_edit')}</Btn>
      </div>
    </div>
  );
}

function S13Pending({ onHome, autoApprove }) {
  const { t } = useLang();
  const [approved, setApproved] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setApproved(true), 3500); return () => clearTimeout(tm); }, []);
  useEffect(() => { if (approved) { const tm = setTimeout(() => autoApprove(), 1200); return () => clearTimeout(tm); } }, [approved]);
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      {!approved ? (
        <>
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center"><span className="text-4xl">⏳</span></div>
            <div className="pulse-ring absolute inset-0 rounded-full border-4 border-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('s13_title')}</h1>
          <p className="text-sm text-warm-500 leading-relaxed mb-6">{t('s13_sub')}</p>
          <div className="flex gap-1.5 justify-center">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
          </div>
          <p className="mt-4 text-xs text-warm-400">{t('s13_eta')}</p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-lg"><span className="text-5xl">✅</span></div>
          <h1 className="text-2xl font-bold text-green-700">{t('s13_done')}</h1>
          <p className="text-sm text-warm-500 mt-2">{t('s13_redir')}</p>
        </div>
      )}
    </div>
  );
}

function S14Success({ onHome, name }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
      <div className="mb-6"><div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center shadow-xl"><span className="text-5xl">🎉</span></div></div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('s14_hi')}</h1>
      <p className="text-xl font-semibold text-brand-600 mb-2">{name}</p>
      <p className="text-base text-green-600 font-bold mb-1">{t('s14_ok')}</p>
      <p className="text-sm text-warm-500 mb-10 leading-relaxed" style={{whiteSpace:'pre-line'}}>{t('s14_desc')}</p>
      <Btn onClick={onHome} className="text-lg py-4">{t('s14_home')}</Btn>
    </div>
  );
}

/* ══════════════════════════════════════════
   Mock host-family data for the map
   Coordinates are neighbourhood-level (fuzzy)
══════════════════════════════════════════ */
const MAP_FAMILIES = [
  {
    id: 1, name: 'משפחת לוי', city: 'חיפה — הכרמל',
    lat: 32.7943, lng: 34.9890,
    kosher: 'kosher', shabbat: 'traditional', capacity: 3,
    canSleep: false, canTransport: true,
    hostingTypes: ['friday_dinner'],
    tags: ['kids', 'singing'],
    rating: 4.9,
  },
  {
    id: 2, name: 'משפחת כהן', city: 'קריית אתא',
    lat: 32.8072, lng: 35.1073,
    kosher: 'mehadrin', shabbat: 'observant', capacity: 2,
    canSleep: true, canTransport: false,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['quiet', 'shabbat_atm'],
    rating: 4.7,
  },
  {
    id: 3, name: 'משפחת גולן', city: 'נשר',
    lat: 32.7730, lng: 35.0460,
    kosher: 'none', shabbat: 'secular', capacity: 4,
    canSleep: false, canTransport: true,
    hostingTypes: ['friday_dinner'],
    tags: ['food', 'spacious'],
    rating: 4.8,
  },
  {
    id: 4, name: 'משפחת אברהם', city: 'חיפה — נווה שאנן',
    lat: 32.8021, lng: 35.0018,
    kosher: 'kosher', shabbat: 'traditional', capacity: 3,
    canSleep: true, canTransport: false,
    hostingTypes: ['shabbat_lunch'],
    tags: ['multilingual', 'spacious'],
    rating: 4.6,
  },
  {
    id: 5, name: 'משפחת שמיר', city: 'קריית ביאליק',
    lat: 32.8350, lng: 35.0850,
    kosher: 'mehadrin', shabbat: 'observant', capacity: 2,
    canSleep: false, canTransport: false,
    hostingTypes: ['friday_dinner'],
    tags: ['kids', 'shabbat_atm'],
    rating: 5.0,
  },
  {
    id: 6, name: 'משפחת פרץ', city: 'טירת כרמל',
    lat: 32.7608, lng: 34.9700,
    kosher: 'kosher', shabbat: 'traditional', capacity: 5,
    canSleep: true, canTransport: true,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['food', 'pets', 'spacious'],
    rating: 4.5,
  },
];

/* ══════════════════════════════════════════
   FamilySheet — bottom drawer shown on marker click
══════════════════════════════════════════ */
function FamilySheet({ family, onClose }) {
  const { t } = useLang();

  const koshLabel = family.kosher === 'mehadrin' ? t('map_meh')
    : family.kosher === 'kosher' ? t('map_kosh') : t('map_none');
  const shabLabel = family.shabbat === 'observant' ? t('map_obs')
    : family.shabbat === 'traditional' ? t('map_trad') : t('map_sec');

  const hostingLabels = family.hostingTypes.map(h =>
    h === 'friday_dinner' ? t('map_friday') :
    h === 'shabbat_lunch' ? t('map_lunch') : t('map_delivery')
  ).join('  ·  ');

  const vibeKeyMap = {
    kids:'vibe_kids', quiet:'vibe_quiet', multilingual:'vibe_multi',
    singing:'vibe_sing', pets:'vibe_pets', spacious:'vibe_space',
    shabbat_atm:'vibe_shab', food:'vibe_food',
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="family-sheet">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mt-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-3xl flex-shrink-0">🏡</div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{family.name}</h2>
              <p className="text-sm text-warm-500 mt-0.5">📍 {family.city}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-gray-700">{family.rating}</span>
                <span className="text-xs">⭐</span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-500 hover:bg-warm-200 transition-colors text-sm flex-shrink-0">
            ✕
          </button>
        </div>

        {/* Key badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200">✡️ {koshLabel}</span>
          <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200">🕯️ {shabLabel}</span>
          <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200">👥 {t('map_slots', family.capacity)}</span>
        </div>

        {/* Hosting types */}
        <p className="text-xs text-warm-500 font-medium mb-2">סוג אירוח</p>
        <p className="text-sm font-semibold text-gray-800 mb-4">{hostingLabels}</p>

        {/* Extras */}
        {(family.canSleep || family.canTransport) && (
          <div className="flex gap-2 mb-4">
            {family.canSleep     && <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">{t('map_sleep_yes')}</span>}
            {family.canTransport && <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">{t('map_transport_yes')}</span>}
          </div>
        )}

        {/* Vibe tags */}
        {family.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {family.tags.map(tag => (
              <span key={tag} className="bg-warm-100 text-warm-600 text-xs px-2.5 py-1 rounded-full">
                {t(vibeKeyMap[tag] || tag)}
              </span>
            ))}
          </div>
        )}

        {/* Approximate location note */}
        <p className="text-xs text-warm-400 mb-5 text-center">📍 {t('map_approx')}</p>

        {/* CTA */}
        <Btn onClick={onClose} className="py-4 text-base">{t('map_request')} 🍽️</Btn>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   MapView — Leaflet map with fuzzy markers
══════════════════════════════════════════ */
function MapView({ families, onSelect, selectedId }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({});

  useEffect(() => {
    if (mapRef.current || !window.L) return;

    const map = L.map(containerRef.current, {
      center: [32.800, 35.020],
      zoom: 12,
      zoomControl: false,
    });

    // Soft map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    families.forEach(fam => {
      // Fuzzy halo — rough neighbourhood radius
      L.circle([fam.lat, fam.lng], {
        radius: 380,
        color: '#c2560e',
        fillColor: '#f7b87a',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4 4',
      }).addTo(map);

      // Custom pin icon
      const makeIcon = (selected) => L.divIcon({
        className: '',
        html: `<div class="host-marker-outer${selected ? ' selected' : ''}"><span class="host-marker-inner">🏡</span></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -48],
      });

      const marker = L.marker([fam.lat, fam.lng], { icon: makeIcon(false) })
        .addTo(map)
        .on('click', () => onSelect(fam));

      markersRef.current[fam.id] = { marker, makeIcon };
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current = {}; };
  }, []);

  // Update marker colour when selection changes
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, { marker, makeIcon }]) => {
      marker.setIcon(makeIcon(Number(id) === selectedId));
    });
  }, [selectedId]);

  return (
    <div ref={containerRef}
      style={{ height: '310px', width: '100%' }}
      className="rounded-2xl overflow-hidden shadow-md border border-warm-200"
    />
  );
}

/* ══════════════════════════════════════════
   S15Home — Soldier home with embedded map
══════════════════════════════════════════ */
function S15Home({ data, onNewRequest }) {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);

  const nextFriday = new Date(
    Date.now() + ((5 - new Date().getDay() + 7) % 7 || 7) * 86400000
  ).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24">

      {/* Header */}
      <div className="bg-gradient-to-l from-brand-700 to-brand-600 text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <p className="text-sm opacity-80 mb-0.5">{t('s15_hi')}</p>
        <h1 className="text-2xl font-bold mb-1">{data.firstName} {data.lastName} 👋</h1>
        <div className="flex items-center gap-2 mt-3">
          <div className="bg-green-400 w-2.5 h-2.5 rounded-full flex-shrink-0" />
          <span className="text-sm font-medium opacity-90">{t('s15_status')}</span>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5">

        {/* New request CTA */}
        <Btn onClick={onNewRequest} className="shadow-md">{t('s15_new')}</Btn>

        {/* ── Map section ── */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">{t('map_title')}</h2>
          <p className="text-xs text-warm-400 mb-3">{t('map_approx')}</p>
          <MapView
            families={MAP_FAMILIES}
            selectedId={selected?.id ?? null}
            onSelect={fam => setSelected(fam)}
          />

          {/* Tap hint */}
          <p className="text-xs text-center text-warm-400 mt-2">
            {t('s15_hi') === 'שלום,' ? 'לחץ על אייקון 🏡 לפרטים על המשפחה' : 'Tap a 🏡 icon to see family details'}
          </p>
        </div>

        {/* Scrollable family chips below the map */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth:'none' }}>
          {MAP_FAMILIES.map(fam => (
            <button key={fam.id}
              onClick={() => setSelected(fam)}
              className={clsx(
                'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all whitespace-nowrap',
                selected?.id === fam.id
                  ? 'border-brand-600 bg-brand-600 text-white shadow-md'
                  : 'border-warm-200 bg-white text-gray-700 hover:border-brand-400'
              )}
            >
              🏡 {fam.name}
              <span className={clsx('text-xs', selected?.id === fam.id ? 'text-white opacity-80' : 'text-warm-500')}>
                ⭐{fam.rating}
              </span>
            </button>
          ))}
        </div>

        {/* Next Shabbat quick card */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">{t('s15_shab')}</h2>
          <Card className="bg-amber-50 border-amber-200 text-center py-5">
            <p className="text-sm font-semibold text-amber-800 mb-1">{t('s15_friday')} {nextFriday}</p>
            <p className="text-xs text-amber-600 mb-3">{t('s15_avail', MAP_FAMILIES.length)}</p>
            <Btn variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-100 py-2.5 text-sm">{t('s15_view')}</Btn>
          </Card>
        </div>

        {/* Past meals */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">{t('s15_past')}</h2>
          <Card className="text-center py-6 text-warm-400">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-sm">{t('s15_no_past')}</p>
          </Card>
        </div>
      </div>

      {/* Bottom sheet */}
      {selected && <FamilySheet family={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}