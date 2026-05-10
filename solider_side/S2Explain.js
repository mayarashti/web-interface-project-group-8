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
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel={t('s2_btn')}
      icon="👋"
      title={t('s2_title')}
      sub={t('s2_sub')}
    >
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
    </ScreenLayout>
  );
}
