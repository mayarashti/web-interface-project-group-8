/* S16 Host Registration Wizard (3 Steps) */

var { useState } = React;

function S16HostRegistration({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

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
    { id: 'kitchen',   label: t('s16_kosh_kit') },
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
    <ScreenLayout
      onBack={handleBack}
      onNext={handleNext}
      step={step}
      totalSteps={TOTAL_STEPS}
      icon={icons[step]}
      title={titles[step]}
      sub={subtitles[step]}
    >
      <div className="space-y-6">
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
            <Input
              label={t('s16_city')}
              value={data.hostCity || ''}
              onChange={set('hostCity')}
              placeholder={t('s16_city_ph')}
              hint={t('s16_city_hint')}
              error={errors.hostCity}
              required
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
              <div className="border border-dashed border-warm-300 bg-warm-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-50 hover:border-brand-300 transition-colors">
                <span className="text-3xl mb-2">📷</span>
                <p className="text-sm font-semibold text-gray-600">{t('s16_photo_btn')}</p>
                <p className="text-xs text-warm-400 mt-1">{t('s6_size')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

/* S17 Host Success */
function S17HostSuccess({ onNext }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-warm-50 text-center">
      <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-6 shadow-sm">
        <span className="text-5xl">✅</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('s17_title')}</h1>
      <p className="text-base text-warm-500 leading-relaxed mb-10 max-w-[300px]">
        {t('s17_sub')}
      </p>
      <Btn onClick={onNext} className="w-full max-w-xs">{t('s17_btn')}</Btn>
    </div>
  );
}

window.S16HostRegistration = S16HostRegistration;
window.S17HostSuccess = S17HostSuccess;
