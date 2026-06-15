/* S16 Host Registration Wizard (3 Steps) */

var { useState, useEffect, useRef } = React;

function S16HostRegistration({ data, setData, onNext, onBack, onSkipPreferences, onInfo }) {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPrefModal, setShowPrefModal] = useState(false);

  const [customLanguages, setCustomLanguages] = useState([]);
  const [newLanguageText, setNewLanguageText] = useState('');
  const fileInputRef = useRef(null);

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData(prev => ({ 
        ...prev, 
        hostFile: file, 
        hostPreview: URL.createObjectURL(file) 
      }));
    }
  };

  useEffect(() => {
    if (!data.hostLanguages) {
      setData(prev => ({ ...prev, hostLanguages: ['he'] }));
    }
  }, []);

  const staticLanguages = [
    { id: 'he', label: t('lang_he') },
    { id: 'en', label: t('lang_en') },
    { id: 'ru', label: t('lang_ru') },
    { id: 'es', label: t('lang_es') },
    { id: 'ar', label: t('lang_ar') },
  ];

  const allLanguages = [...staticLanguages, ...customLanguages.map(lang => ({ id: lang, label: lang }))];

  const handleAddLanguage = () => {
    const trimmed = newLanguageText.trim();
    if (!trimmed) return;
    const alreadyExists = allLanguages.some(l => l.id.toLowerCase() === trimmed.toLowerCase());
    if (!alreadyExists) {
      setCustomLanguages(prev => [...prev, trimmed]);
    }
    const currentLangs = data.hostLanguages || ['he'];
    if (!currentLangs.includes(trimmed)) {
      setData(prev => ({
        ...prev,
        hostLanguages: [...currentLangs, trimmed]
      }));
    }
    setNewLanguageText('');
  };


  const TOTAL_STEPS = 3;

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!data.hostName?.trim()) e.hostName = t('v_name');
      if (!data.hostPhone?.trim() || data.hostPhone.replace(/\D/g, '').length < 9) e.hostPhone = t('v_phone');
      if (!data.hostPassword || data.hostPassword.length < 6) e.hostPassword = t('v_pass');
      if (!data.hostCity?.trim()) e.hostCity = t('v_city');
    }
    if (step === 2) {
      if (!data.hostKosher) e.hostKosher = t('v_kosh');
      if (!data.hostShabbat) e.hostShabbat = t('v_shab');
      if (data.hasPets && !data.petsDetails?.trim()) e.petsDetails = t('v_pets');
    }
    if (step === 3) {
      if (!data.hostVibe?.trim()) e.hostVibe = t('v_bio');
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    // After step 1 show the preferences-prompt instead of jumping to step 2
    if (step === 1) {
      setShowPrefModal(true);
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else onNext();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const kosherOptions = [
    { id: 'none',      label: t('s16_kosh_none') },
    { id: 'separated', label: t('s16_kosh_sep') },
    { id: 'mehadrin',  label: t('s16_kosh_kit') },
  ];

  const shabbatOptions = [
    { id: 'none',        label: t('s16_shab_none') },
    { id: 'traditional', label: t('s16_shab_trad') },
    { id: 'keeps',       label: t('s16_shab_keeps') },
  ];

  const cookingOptions = [
    { id: 'veg',     label: t('alg_veg') },
    { id: 'vegan',   label: t('alg_vegan') },
    { id: 'celiac',  label: t('alg_celiac') },
    { id: 'lactose', label: t('alg_lactose') },
    { id: 'nuts',    label: t('alg_nuts') },
  ];

  const titles   = ['', t('s16_1_title'), t('s16_2_title'), t('s16_3_title')];
  const subtitles = ['', t('s16_1_sub'),  t('s16_2_sub'),  t('s16_3_sub')];
  const icons     = ['', '🏡', '🍽️', '✨'];

  return (
    <>
    <ScreenLayout
      onBack={handleBack}
      onNext={handleNext}
      step={step}
      totalSteps={TOTAL_STEPS}
      icon={icons[step]}
      title={titles[step]}
      onInfo={step === 1 ? onInfo : null}
    >
      <div className="space-y-6 pb-32">
        {/* ── Step 1: Account & Location ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Input
              label={t('s16_name')}
              value={data.hostName || ''}
              onChange={set('hostName')}
              placeholder={t('s16_name_ph')}
              error={errors.hostName}
              required
            />
            <Input
              label={t('s16_phone')}
              type="tel"
              value={data.hostPhone || ''}
              onChange={set('hostPhone')}
              placeholder="050-1234567"
              hint={t('s16_phone_hint')}
              error={errors.hostPhone}
              required
            />
            <Input
              label={t('s3_pass')}
              type="password"
              value={data.hostPassword || ''}
              onChange={set('hostPassword')}
              placeholder={t('s3_pass_ph')}
              error={errors.hostPassword}
              required
            />
            <AddressPicker
              label={t('s16_city')}
              placeholder={t('s16_city_ph')}
              hint={data.hostLat ? t('map_pin_set') : t('s16_city_hint')}
              error={errors.hostCity}
              required
              value={data.hostCity ? {
                fullString: data.hostAddress || data.hostCity,
                city: data.hostCity,
                coordinates: { lat: data.hostLat, lng: data.hostLng },
              } : null}
              onChange={(addr) => {
                setData(prev => ({
                  ...prev,
                  hostCity: addr.city || addr.fullString || '',
                  hostAddress: addr.fullString || '',
                  hostLat: addr.coordinates?.lat,
                  hostLng: addr.coordinates?.lng,
                }));
              }}
            />
          </div>
        )}

        {/* ── Step 2: Lifestyle & Accommodations ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_kosher')}</p>
              <RadioGroup
                options={kosherOptions}
                value={data.hostKosher || ''}
                onChange={set('hostKosher')}
              />
              {errors.hostKosher && <p className="text-xs text-red-600 mt-2">{errors.hostKosher}</p>}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_shabbat')}</p>
              <RadioGroup
                options={shabbatOptions}
                value={data.hostShabbat || ''}
                onChange={set('hostShabbat')}
              />
              {errors.hostShabbat && <p className="text-xs text-red-600 mt-2">{errors.hostShabbat}</p>}
            </div>

            <div>
              <CheckRow
                label={t('s16_has_pets')}
                checked={data.hasPets || false}
                onChange={set('hasPets')}
              />
              {data.hasPets && (
                <div className="mt-3 ps-1">
                  <Input
                    value={data.petsDetails || ''}
                    onChange={set('petsDetails')}
                    placeholder={t('s16_pets_ph')}
                    error={errors.petsDetails}
                  />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_cooking')}</p>
              <MultiCheck
                options={cookingOptions}
                values={data.hostCooking || []}
                onChange={set('hostCooking')}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">שפות מדוברות (לסמן את כל מה שרלוונטי)</p>
              <MultiCheck
                options={allLanguages}
                values={data.hostLanguages || ['he']}
                onChange={set('hostLanguages')}
              />
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newLanguageText}
                  onChange={(e) => setNewLanguageText(e.target.value)}
                  placeholder="הוסף שפה אחרת..."
                  className="flex-1 min-h-[44px] py-2 px-4 rounded-xl border border-warm-200 bg-white text-sm transition-all placeholder:text-warm-400 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 hover:border-warm-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                />
                <Btn
                  type="button"
                  variant="secondary"
                  onClick={handleAddLanguage}
                  className="!w-auto !py-2.5"
                >
                  הוסף
                </Btn>
              </div>
            </div>

          </div>
        )}

        {/* ── Step 3: Home Vibe ── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s16_vibe_label')}</label>
              <textarea
                value={data.hostVibe || ''}
                onChange={e => set('hostVibe')(e.target.value)}
                placeholder={t('s16_vibe_ph')}
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border text-[15px] text-gray-900 bg-white resize-none transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 ${errors.hostVibe ? 'border-red-300 focus:border-red-400' : 'border-warm-200 focus:border-brand-300'}`}
              />
              {errors.hostVibe && <p className="text-xs text-red-600 mt-1.5">{errors.hostVibe}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s16_photo_label')}</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-warm-300 bg-warm-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-50 hover:border-brand-300 transition-colors overflow-hidden"
                style={data.hostPreview ? { backgroundImage: `url(${data.hostPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', borderColor: 'transparent', height: '160px' } : {}}
              >
                {!data.hostPreview && (
                  <>
                    <span className="text-3xl mb-2">📷</span>
                    <p className="text-sm font-semibold text-gray-600">{t('s16_photo_btn')}</p>
                    <p className="text-xs text-warm-400 mt-1">{t('s6_size')}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>

    {/* Preferences questionnaire prompt — shown after step 1 completes */}
    <PreferencesPromptModal
      isOpen={showPrefModal}
      context="host_reg"
      onNow={() => { setShowPrefModal(false); setStep(2); }}
      onLater={() => { setShowPrefModal(false); if (onSkipPreferences) onSkipPreferences(); }}
    />
    </>
  );
}

/* S17 Host Summary */
function S17HostSummary({ data, onEdit, onSubmit, onBack }) {
  const { t } = useLang();

  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between items-start py-2.5 border-b border-warm-100 last:border-0">
      <span className="text-xs text-warm-500 font-medium w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-start flex-1 ms-2">{value}</span>
    </div>
  ) : null;

  const koshMap = {
    none:      t('s16_kosh_none'),
    separated: t('s16_kosh_sep'),
    mehadrin:  t('s16_kosh_kit'),
  };

  const shabbatMap = {
    none:        t('s16_shab_none'),
    traditional: t('s16_shab_trad'),
    keeps:       t('s16_shab_keeps'),
  };

  const cookingLabels = {
    veg:     t('alg_veg'),
    vegan:   t('alg_vegan'),
    celiac:  t('alg_celiac'),
    lactose: t('alg_lactose'),
    nuts:    t('alg_nuts'),
  };

  const cookingValue = (data.hostCooking || []).map(c => cookingLabels[c]).filter(Boolean).join(', ');

  const petsValue = data.hasPets
    ? (data.petsDetails?.trim() ? t('s16_sum_pets_yes') + ': ' + data.petsDetails : t('s16_sum_pets_yes'))
    : t('s16_sum_pets_no');

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onSubmit}
      nextLabel={t('s16_submit')}
      icon="📋"
      title={t('s16_sum_title')}
      sub={t('s12_sub')}
    >
      <div className="pb-32">
        <Card className="mb-4">
          <p className="section-label mb-3">{t('s12_personal')}</p>
          <Row label={t('s16_sum_name')}  value={data.hostName} />
          <Row label={t('s12_phone')}     value={data.hostPhone} />
          <Row label={t('s16_sum_city')}  value={data.hostCity} />
        </Card>

        <Card className="mb-4">
          <p className="section-label mb-3">{t('s16_2_title')}</p>
          <Row label={t('s16_sum_kosh')}       value={koshMap[data.hostKosher]} />
          <Row label={t('s16_sum_shab')}        value={shabbatMap[data.hostShabbat]} />
          <Row label={t('s16_sum_pets_label')} value={petsValue} />
          {cookingValue && <Row label={t('s16_sum_cooking')} value={cookingValue} />}
          <Row label={t('s16_langs') || 'שפות שמדברים בבית'} value={(data.hostLanguages || ['he']).map(c => t('lang_' + c) || c).join(', ')} />
        </Card>

        {data.hostVibe && (
          <Card className="mb-4 bg-brand-50 border-brand-100">
            <p className="section-label mb-2">{t('s16_sum_vibe')}</p>
            <p className="text-sm text-gray-700 leading-relaxed italic">"{data.hostVibe}"</p>
          </Card>
        )}

        <div className="mt-4">
          <Btn variant="secondary" onClick={onEdit}>{t('s12_edit')}</Btn>
        </div>
      </div>
    </ScreenLayout>
  );
}

/* S18 Host Success */
function S17HostSuccess({ onNext }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col bg-warm-50">
      <AppHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-6 shadow-sm">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('s17_title')}</h1>
        <p className="text-base text-warm-500 leading-relaxed mb-10 max-w-[300px]">
          {t('s17_sub')}
        </p>
        <Btn onClick={onNext} className="w-full max-w-xs">{t('s17_btn')}</Btn>
      </div>
    </div>
  );
}

window.S16HostRegistration = S16HostRegistration;
window.S17HostSummary = S17HostSummary;
window.S17HostSuccess = S17HostSuccess;
