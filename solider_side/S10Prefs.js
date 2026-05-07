/* S10Prefs — Additional preferences: soldiers, language, pets */

function S10Prefs({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const langOpts = [
    { value: 'he',    label: t('lang_he')    },
    { value: 'en',    label: t('lang_en')    },
    { value: 'ru',    label: t('lang_ru')    },
    { value: 'ar',    label: t('lang_ar')    },
    { value: 'other', label: t('lang_other') },
  ];

  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={8} total={12} />
      <SectionTitle icon="⚙️" title={t('s10_title')} sub={t('s10_sub')} />
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
      <MultiCheck
        label={t('s10_lang')}
        options={langOpts}
        values={data.languages || ['he']}
        onChange={val => set('languages')(val)}
      />
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
      <div className="mt-auto pt-2">
        <Btn onClick={onNext} disabled={!data.withSoldiers || !data.pets}>{t('continue')}</Btn>
      </div>
    </div>
  );
}
