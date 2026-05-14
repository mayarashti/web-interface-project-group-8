/* S7Preferences — Consolidated preferences page */
const { useState } = React;

function S7Preferences({ data, setData, onNext, onBack }) {
  const { t } = useLang();

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
    return data.kosher && data.shabbatKeeps && data.withSoldiers && data.pets;
  };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={() => { if (validate()) onNext(); }}
      step={2}
      total={3}
      icon
      title={t('s7_title')}
      sub={t('s7_sub')}
    >
      <div className="space-y-8 pb-10">
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
            <div className="mt-3 animate-enter">
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

        {/* With Soldiers Section */}
        <RadioGroup
          label={t('s10_sol')}
          value={data.withSoldiers || ''}
          onChange={set('withSoldiers')}
          options={[
            { value: 'yes',      label: t('s10_sol_yes') },
            { value: 'no',       label: t('s10_sol_no')  },
            { value: 'dontmind', label: t('s10_sol_dm')  },
          ]}
        />

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
          <p className="text-[10px] text-warm-400 mt-1 text-left">{(data.bio || '').length}/300</p>
        </div>
      </div>
    </ScreenLayout>
  );
}
