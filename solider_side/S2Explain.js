/* S2Explain — How it works screen (soldier flow) */

function S2Explain({ onNext, onBack }) {
  const { t } = useLang();
  const features = [
    { icon: '📍', title: t('s2_f1_t'), desc: t('s2_f1_d') },
    { icon: '✅', title: t('s2_f2_t'), desc: t('s2_f2_d') },
    { icon: '📅', title: t('s2_f3_t'), desc: t('s2_f3_d') },
    { icon: '🔒', title: t('s2_f4_t'), desc: t('s2_f4_d') },
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
