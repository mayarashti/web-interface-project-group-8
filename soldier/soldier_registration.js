/* S3PersonalDetails — Personal details */
var { useState } = React;

function S3PersonalDetails({ data, setData, onNext, onBack, onInfo }) {
  const { t } = useLang();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.fullName?.trim()) e.fullName = t('v_name');
    if (!data.phone?.trim() || data.phone.replace(/\D/g, '').length < 9) e.phone = t('err_phone');
    const age = parseInt(data.age);
    if (!data.age || isNaN(age) || age < 18 ) e.age = t('s3_age_err');
    if (!data.password || data.password.length < 6) e.password = t('err_pass');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={() => { if (validate()) onNext(); }}
      step={1}
      total={3}
      icon="🪶"
      title={t('s3_title')}
      onInfo={onInfo}
    >
      <div className="space-y-6 pb-32">
        <div className="space-y-4">
          <Input
            label={t('s16_name')}
            value={data.fullName || ''}
            onChange={set('fullName')}
            placeholder={t('s16_name_ph')}
            error={errors.fullName}
          />
          <Input
            label={t('s3_phone')}
            type="tel"
            value={data.phone || ''}
            onChange={set('phone')}
            placeholder="050-1234567"
            error={errors.phone}
          />
          <Input
            label={t('s3_age')}
            type="number"
            value={data.age || ''}
            onChange={set('age')}
            placeholder={t('s3_age_ph')}
            error={errors.age}
          />
          <Input
            label={t('s3_pass')}
            type="password"
            value={data.password || ''}
            onChange={set('password')}
            placeholder={t('s3_pass_ph')}
            error={errors.password}
            hint={t('s3_pass_hint')}
          />
        </div>
      </div>
    </ScreenLayout>
  );
}

/* S7Preferences — Consolidated preferences page */
var { useState } = React;

function S7Preferences({ data, setData, onNext, onBack }) {
  const { t, lang } = useLang();

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const langOpts = [
    { value: 'he',    label: t('lang_he')    },
    { value: 'en',    label: t('lang_en')    },
    { value: 'ru',    label: t('lang_ru')    },
    { value: 'ar',    label: t('lang_ar')    },
    { value: 'other', label: t('lang_other') },
  ];

  const allergyOpts = [
    { value: 'gluten',     label: t('a_gluten')  },
    { value: 'lactose',    label: t('a_lactose') },
    { value: 'nuts',       label: t('a_nuts')    },
    { value: 'peanuts',    label: t('a_peanuts') },
    { value: 'vegetarian', label: t('a_veg')     },
    { value: 'vegan',      label: t('a_vegan')   },
    { value: 'fish',       label: t('a_fish')    },
    { value: 'other',      label: t('a_other')   },
  ];

  const validate = () => {
    return data.kosher && data.shabbatKeeps && data.pets;
  };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={() => { if (validate()) onNext(); }}
      step={2}
      total={3}
      icon="🍽️"
      title={t('s7_title')}
      sub={t('s7_sub')}
    >
      <div className="space-y-8 pb-32">

        {/* Kosher Section */}
        <RadioGroup
          label={t('s7_kosh')}
          value={data.kosher || ''}
          onChange={set('kosher')}
          options={[
            { value: 'mehadrin', label: t('s7_meh'),    sub: t('s7_meh_s')    },
            { value: 'kosher',   label: t('s7_kosh_k'), sub: t('s7_kosh_k_s') },
            { value: 'none',     label: t('s7_none'),   sub: t('s7_none_s')   },
          ]}
        />

        {/* Shabbat Section */}
        <RadioGroup
          label={t('s7_shab')}
          value={data.shabbatKeeps || ''}
          onChange={set('shabbatKeeps')}
          options={[
            { value: 'yes', label: t('s7_yes'), sub: t('s7_yes_s') },
            { value: 'no',  label: t('s7_no'),  sub: t('s7_no_s')  },
          ]}
        />

        {/* Allergies Section */}
        <div>
          <MultiCheck
            label={t('s9_title')}
            options={allergyOpts}
            values={data.allergies || []}
            onChange={val => set('allergies')(val)}
          />
          {(data.allergies || []).includes('other') && (
            <div className="mt-3">
              <textarea
                value={data.allergyNote || ''}
                onChange={e => set('allergyNote')(e.target.value)}
                placeholder={t('s9_note_ph')}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
                rows={3}
              />
            </div>
          )}
        </div>



        {/* Languages Section */}
        <MultiCheck
          label={t('s10_lang')}
          options={langOpts}
          values={data.languages || ['he']}
          onChange={val => set('languages')(val)}
        />

        {/* Pets Section */}
        <RadioGroup
          label={t('s10_pets')}
          value={data.pets || ''}
          onChange={set('pets')}
          options={[
            { value: 'ok',      label: t('s10_pets_ok') },
            { value: 'notok',   label: t('s10_pets_no') },
            { value: 'allergy', label: t('s10_pets_al') },
          ]}
        />

        {/* Profile Section (Bio & Photo) */}
        <div className="pt-6 border-t border-warm-200">
          <p className="text-sm font-semibold text-warm-600 mb-4">{t('s11_title')}</p>

          <div className="flex justify-center mb-6">
            <div onClick={() => {
              const colors = ['#b86442', '#6f8f72', '#687076', '#d59f83', '#5e7b61'];
              const col = colors[Math.floor(Math.random() * colors.length)];
              set('avatarPreview')(col);
            }} className="relative w-20 h-20 rounded-full cursor-pointer group">
              {data.avatarPreview ? (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  style={{ background: data.avatarPreview }}
                >
                  {(data.fullName || '?')[0]}
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center border border-dashed border-warm-300 group-hover:border-brand-200 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-white border border-warm-200 flex items-center justify-center text-lg leading-none" aria-hidden="true">+</span>
                </div>
              )}
              <div className="absolute -bottom-1 -left-1 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs">+</span>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-warm-400 mb-5">{t('s11_photo')}</p>

          <textarea
            value={data.bio || ''}
            onChange={e => set('bio')(e.target.value)}
            placeholder={t('s11_bio_ph')}
            className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
            rows={4}
            maxLength={300}
          />
          <p className="text-[10px] text-warm-400 mt-1 text-start">{(data.bio || '').length}/300</p>
        </div>
      </div>
    </ScreenLayout>
  );
}

/* S12Summary — Registration summary & submit */

function S12Summary({ data, onEdit, onSubmit, onBack }) {
  const { t } = useLang();

  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between items-start py-2.5 border-b border-warm-100 last:border-0">
      <span className="text-xs text-warm-500 font-medium w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-start flex-1 ms-2">{value}</span>
    </div>
  ) : null;

  const kosh = { none: t('map_none'), kosher: t('map_kosh'), mehadrin: t('map_meh') };
  const pets = { ok: t('map_pets_ok'), notok: t('map_pets_no'), allergy: t('map_pets_al') };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onSubmit}
      nextLabel={t('s12_submit')}
      step={3}
      total={3}
      icon="📋"
      title={t('s12_title')}
      sub={t('s12_sub')}
    >
      <Card className="mb-4">
        <p className="section-label mb-3">{t('s12_personal')}</p>
        <Row label={t('s12_full')}  value={data.fullName} />
        <Row label={t('s12_phone')} value={data.phone} />
        <Row label={t('s12_age')}   value={data.age} />
      </Card>



      <Card className="mb-4">
        <p className="section-label mb-3">{t('s12_prefs')}</p>
        <Row label={t('s12_kosh')}   value={kosh[data.kosher]} />
        <Row label={t('s12_shab')}   value={data.shabbatKeeps === 'yes' ? t('s7_yes') : data.shabbatKeeps === 'no' ? t('s7_no') : null} />
        <Row label={t('s12_allerg')} value={(data.allergies || []).map(a => a === 'other' ? t('a_other') : t('a_' + a)).join(', ') || t('s12_no_allerg')} />
        <Row label={t('s12_pets')}   value={pets[data.pets]} />
      </Card>

      {data.bio && (
        <Card className="mb-4 bg-brand-50 border-brand-100">
          <p className="section-label mb-2">{t('s12_bio')}</p>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{data.bio}"</p>
        </Card>
      )}

      <div className="mt-4">
        <Btn variant="secondary" onClick={onEdit}>{t('s12_edit')}</Btn>
      </div>
    </ScreenLayout>
  );
}

/* S13Pending — Profile under review (auto-advances after 3.5s) */
var { useState: useStateS13, useEffect: useEffectS13 } = React;

function S13Pending({ onHome, autoApprove }) {
  const { t } = useLang();
  const [approved, setApproved] = React.useState(false);

  React.useEffect(() => {
    const tm = setTimeout(() => setApproved(true), 3500);
    return () => clearTimeout(tm);
  }, []);

  React.useEffect(() => {
    if (approved) {
      const tm = setTimeout(() => autoApprove(), 1200);
      return () => clearTimeout(tm);
    }
  }, [approved]);

  return (
    <div className="screen-enter min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
        {!approved ? (
          <>
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
              </div>
              <div className="pulse-ring absolute inset-0 rounded-full border-4 border-brand-200" />
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
            <div className="w-20 h-20 rounded-full bg-support-50 border border-support-100 flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-support-500" />
            </div>
            <h1 className="text-2xl font-bold text-green-700">{t('s13_done')}</h1>
            <p className="text-sm text-warm-500 mt-2">{t('s13_redir')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* S14Success — Registration complete, welcome screen */

function S14Success({ onHome, name }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('s14_hi')}</h1>
        <p className="text-xl font-semibold text-brand-600 mb-2">{name}</p>
        <p className="text-base text-green-600 font-bold mb-1">{t('s14_ok')}</p>
        <p className="text-sm text-warm-500 mb-10 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{t('s14_desc')}</p>
        <Btn onClick={onHome} className="text-lg py-4">{t('s14_home')}</Btn>
      </div>
    </div>
  );
}


window.S3PersonalDetails = S3PersonalDetails;
window.S7Preferences = S7Preferences;
window.S12Summary = S12Summary;
window.S13Pending = S13Pending;
window.S14Success = S14Success;
