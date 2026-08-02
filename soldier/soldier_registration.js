/* S3PersonalDetails — Personal details */
var { useState } = React;

function S3PersonalDetails({ data, setData, onNext, onBack, onInfo, onSkipPreferences }) {
  const { t } = useLang();
  const [errors, setErrors] = useState({});
  const [showPrefModal, setShowPrefModal] = useState(false);

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
    <React.Fragment>
      <ScreenLayout
        onBack={onBack}
        onNext={() => { if (validate()) setShowPrefModal(true); }}
        step={1}
        total={4}
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
      <PreferencesPromptModal
        isOpen={showPrefModal}
        context="soldier_reg"
        onNow={() => { setShowPrefModal(false); onNext(); }}
        onLater={() => { setShowPrefModal(false); if (onSkipPreferences) onSkipPreferences(); }}
      />
    </React.Fragment>
  );
}

/* S4Profile — Profile photo & self-introduction */
var { useState: useStateS4, useRef: useRefS4 } = React;

function S4Profile({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const fileInputRef = useRefS4(null);

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData(prev => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    }
  };

  const afterMealOpts = [
    { value: 'board', label: t('s11_am_board') },
    { value: 'talk',  label: t('s11_am_talk')  },
    { value: 'tv',    label: t('s11_am_tv')    },
    { value: 'other', label: t('s11_am_other') },
  ];

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      step={2}
      total={4}
      icon="📸"
      title={t('s11_title')}
      sub={t('s11_sub')}
    >
      <div className="pb-32">
        <div className="flex justify-center mb-6">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div onClick={() => fileInputRef.current?.click()} className="relative w-20 h-20 rounded-full cursor-pointer group">
            {data.avatarPreview ? (
              data.avatarPreview.startsWith('blob:') ? (
                <img src={data.avatarPreview} className="w-20 h-20 rounded-full object-cover shadow-md" alt="Avatar Preview" />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  style={{ background: data.avatarPreview }}
                >
                  {(data.fullName || '?')[0]}
                </div>
              )
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
        <p className="text-center text-[11px] text-warm-400 mb-1">{t('s11_photo')}</p>
        <p className="text-center text-[11px] text-warm-400 mb-6">{t('s11_photo_note')}</p>

        <p className="text-sm text-warm-500 leading-relaxed mb-6">{t('s11_q_intro')}</p>

        <div className="space-y-5">
          <Input
            label={t('s11_q_origin')}
            value={data.qOrigin || ''}
            onChange={set('qOrigin')}
          />
          <Input
            label={t('s11_q_offduty')}
            value={data.qOffDuty || ''}
            onChange={set('qOffDuty')}
          />
          <Input
            label={t('s11_q_tradition')}
            value={data.qFridayTradition || ''}
            onChange={set('qFridayTradition')}
          />
          <Input
            label={t('s11_q_dish')}
            value={data.qFavoriteDish || ''}
            onChange={set('qFavoriteDish')}
          />
          <Input
            label={t('s11_q_dislike')}
            value={data.qDislikedFood || ''}
            onChange={set('qDislikedFood')}
          />

          <div>
            <MultiCheck
              label={t('s11_q_aftermeal')}
              options={afterMealOpts}
              values={data.qAfterMeal || []}
              onChange={set('qAfterMeal')}
            />
            <p className="text-[11px] text-warm-400 mt-2">{t('s11_q_aftermeal_sub')}</p>
            {(data.qAfterMeal || []).includes('other') && (
              <div className="mt-3">
                <input
                  type="text"
                  value={data.qAfterMealOther || ''}
                  onChange={e => set('qAfterMealOther')(e.target.value)}
                  placeholder={t('s11_am_other_ph')}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-warm-200 text-[15px] bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t('s11_q_more')}</label>
            <textarea
              value={data.qMoreInfo || ''}
              onChange={e => set('qMoreInfo')(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
              rows={3}
              maxLength={300}
            />
          </div>
        </div>
      </div>
    </ScreenLayout>
  );
}

/* S7Preferences — Consolidated preferences page */
var { useState, useRef } = React;

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
    { value: 'veg',        label: t('a_veg')     },
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
      step={3}
      total={4}
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
            { value: 'mehadrin',  label: t('s7_meh'),    sub: t('s7_meh_s')    },
            { value: 'separated', label: t('s7_kosh_k'), sub: t('s7_kosh_k_s') },
            { value: 'none',      label: t('s7_none'),   sub: t('s7_none_s')   },
          ]}
        />

        {/* Shabbat Section */}
        <RadioGroup
          label={t('s7_shab')}
          value={data.shabbatKeeps || ''}
          onChange={set('shabbatKeeps')}
          options={[
            { value: 'keeps',       label: t('s7_yes'),        sub: t('s7_yes_s')     },
            { value: 'traditional', label: t('s16_shab_trad'), sub: t('s7_trad_s')   },
            { value: 'none',        label: t('s7_no'),         sub: t('s7_no_s')      },
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

      </div>
    </ScreenLayout>
  );
}

/* S12Summary — Live, editable preview of the profile exactly as host families see it */
var { useState: useStateS12, useRef: useRefS12 } = React;

function S12Summary({ data, setData, onSubmit, onBack }) {
  const { t, lang } = useLang();
  const [isSubmitting, setIsSubmitting] = useStateS12(false);
  const [showEdit, setShowEdit] = useStateS12(false);
  const fileInputRef = useRefS12(null);

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData(prev => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const allergyOpts = [
    { value: 'gluten',     label: t('a_gluten')  },
    { value: 'lactose',    label: t('a_lactose') },
    { value: 'nuts',       label: t('a_nuts')    },
    { value: 'peanuts',    label: t('a_peanuts') },
    { value: 'veg',        label: t('a_veg')     },
    { value: 'vegan',      label: t('a_vegan')   },
    { value: 'fish',       label: t('a_fish')    },
    { value: 'other',      label: t('a_other')   },
  ];

  const langOpts = [
    { value: 'he',    label: t('lang_he')    },
    { value: 'en',    label: t('lang_en')    },
    { value: 'ru',    label: t('lang_ru')    },
    { value: 'ar',    label: t('lang_ar')    },
    { value: 'other', label: t('lang_other') },
  ];

  const afterMealOpts = [
    { value: 'board', label: t('s11_am_board') },
    { value: 'talk',  label: t('s11_am_talk')  },
    { value: 'tv',    label: t('s11_am_tv')    },
    { value: 'other', label: t('s11_am_other') },
  ];

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={handleNext}
      isNextLoading={isSubmitting}
      nextLabel={t('s12_submit')}
      step={4}
      total={4}
      icon="🎉"
      title={t('s12_title')}
      sub={t('s12_sub')}
    >
      {/* Live preview — the exact same GuestProfileCard host families see on your registered-soldier card */}
      <p className="section-label mb-2 flex items-center gap-1.5">
        <span>👀</span><span>{t('s12_preview_badge')}</span>
      </p>
      <Card className="mb-2 p-4 border border-warm-200 shadow-sm bg-white">
        <GuestProfileCard
          lang={lang}
          guest={{
            name: data.fullName,
            age: data.age,
            photoUrl: data.avatarPreview && data.avatarPreview.startsWith('blob:') ? data.avatarPreview : null,
            avatarColor: data.avatarPreview && !data.avatarPreview.startsWith('blob:') ? data.avatarPreview : '#B0BA99',
            kosher: data.kosher,
            allergies: data.allergies,
            qOrigin: data.qOrigin,
            qOffDuty: data.qOffDuty,
            qFridayTradition: data.qFridayTradition,
            qFavoriteDish: data.qFavoriteDish,
            qDislikedFood: data.qDislikedFood,
            qAfterMeal: data.qAfterMeal,
            qAfterMealOther: data.qAfterMealOther,
            qMoreInfo: data.qMoreInfo,
            bio: data.bio,
          }}
        />
      </Card>

      <button
        type="button"
        onClick={() => setShowEdit(v => !v)}
        className="w-full flex items-center justify-between gap-3 mt-6 mb-4 py-2 text-start"
      >
        <p className="text-xs text-warm-500 flex-1">{t('s12_edit_sub')}</p>
        <svg
          className="w-5 h-5 text-warm-400 flex-shrink-0 transition-transform duration-200"
          style={{ transform: showEdit ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {!showEdit ? null : (
      <React.Fragment>
      {/* Hero: photo + name/phone/age — click the avatar to change or add a photo */}
      <Card className="mb-4 p-5 text-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="flex justify-center mb-2">
          <div onClick={() => fileInputRef.current?.click()} className="relative w-20 h-20 rounded-full cursor-pointer group">
            {data.avatarPreview ? (
              data.avatarPreview.startsWith('blob:') ? (
                <img src={data.avatarPreview} className="w-20 h-20 rounded-full object-cover shadow-md" alt="Avatar Preview" />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  style={{ background: data.avatarPreview }}
                >
                  {(data.fullName || '?')[0]}
                </div>
              )
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
        <p className="text-[11px] text-warm-400 mb-5">{t('s12_photo_edit')}</p>

        <Input label={t('s12_full')}  value={data.fullName || ''} onChange={set('fullName')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('s12_phone')} type="tel" value={data.phone || ''} onChange={set('phone')} />
          <Input label={t('s12_age')} type="number" value={data.age || ''} onChange={set('age')} />
        </div>
      </Card>

      {/* Preferences — same fields families see on your request card */}
      <Card className="mb-4 p-5">
        <p className="section-label mb-4">🍽️ {t('s12_prefs')}</p>
        <RadioGroup
          label={t('s7_kosh')}
          value={data.kosher || ''}
          onChange={set('kosher')}
          options={[
            { value: 'mehadrin',  label: t('s7_meh'),    sub: t('s7_meh_s')    },
            { value: 'separated', label: t('s7_kosh_k'), sub: t('s7_kosh_k_s') },
            { value: 'none',      label: t('s7_none'),   sub: t('s7_none_s')   },
          ]}
        />
        <RadioGroup
          label={t('s7_shab')}
          value={data.shabbatKeeps || ''}
          onChange={set('shabbatKeeps')}
          options={[
            { value: 'keeps',       label: t('s7_yes'),        sub: t('s7_yes_s')     },
            { value: 'traditional', label: t('s16_shab_trad'), sub: t('s7_trad_s')   },
            { value: 'none',        label: t('s7_no'),         sub: t('s7_no_s')      },
          ]}
        />
        <div className="mt-2">
          <MultiCheck
            label={t('s9_title')}
            options={allergyOpts}
            values={data.allergies || []}
            onChange={set('allergies')}
          />
          {(data.allergies || []).includes('other') && (
            <div className="mt-3">
              <textarea
                value={data.allergyNote || ''}
                onChange={e => set('allergyNote')(e.target.value)}
                placeholder={t('s9_note_ph')}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
                rows={2}
              />
            </div>
          )}
        </div>
        <div className="mt-5">
          <MultiCheck
            label={t('s10_lang')}
            options={langOpts}
            values={data.languages || ['he']}
            onChange={set('languages')}
          />
        </div>
        <div className="mt-5">
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
        </div>
      </Card>

      {/* About you — the warm answers families read on your card */}
      <Card className="mb-4 p-5 bg-brand-50 border-brand-100">
        <p className="section-label mb-4">💬 {t('s12_about_title')}</p>
        <div className="space-y-4">
          <Input label={t('s11_q_origin')}   value={data.qOrigin || ''}          onChange={set('qOrigin')} />
          <Input label={t('s11_q_offduty')}  value={data.qOffDuty || ''}         onChange={set('qOffDuty')} />
          <Input label={t('s11_q_tradition')} value={data.qFridayTradition || ''} onChange={set('qFridayTradition')} />
          <Input label={t('s11_q_dish')}     value={data.qFavoriteDish || ''}    onChange={set('qFavoriteDish')} />
          <Input label={t('s11_q_dislike')}  value={data.qDislikedFood || ''}    onChange={set('qDislikedFood')} />

          <div>
            <MultiCheck
              label={t('s11_q_aftermeal')}
              options={afterMealOpts}
              values={data.qAfterMeal || []}
              onChange={set('qAfterMeal')}
            />
            {(data.qAfterMeal || []).includes('other') && (
              <div className="mt-3">
                <input
                  type="text"
                  value={data.qAfterMealOther || ''}
                  onChange={e => set('qAfterMealOther')(e.target.value)}
                  placeholder={t('s11_am_other_ph')}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-warm-200 text-[15px] bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t('s11_q_more')}</label>
            <textarea
              value={data.qMoreInfo || ''}
              onChange={e => set('qMoreInfo')(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
              rows={3}
              maxLength={300}
            />
          </div>
        </div>
      </Card>
      </React.Fragment>
      )}
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
    if (approved && autoApprove) {
      const tm = setTimeout(() => autoApprove(), 1200);
      return () => clearTimeout(tm);
    }
  }, [approved, autoApprove]);

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
