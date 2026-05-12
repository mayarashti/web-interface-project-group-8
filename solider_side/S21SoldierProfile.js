/* S21SoldierProfile — Soldier profile and settings */
const { useState } = React;

function S21SoldierProfile({ data, setData, onBack }) {
  const { t } = useLang();
  
  // Use local state for the form so edits are not global until saved
  const [form, setForm] = useState({
    fullName: data.fullName || '',
    phone: data.phone || '',
    email: data.email || '',
    bio: data.bio || '',
    kosher: data.kosher || 'kosher',
    allergies: data.allergies || [],
  });

  const [saved, setSaved] = useState(false);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setData(prev => ({ ...prev, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const allergyOpts = [
    { value:'lactose', label:t('s9_lact') },
    { value:'gluten',  label:t('s9_glut') },
    { value:'nuts',    label:t('s9_nuts') },
    { value:'vegan',   label:t('s9_veg') },
  ];

  return (
    <div className="screen-enter min-h-screen flex flex-col pb-12 bg-warm-50">
      <AppHeader title="הפרופיל שלי" onBack={onBack} />

      <div className="w-full max-w-md mx-auto px-5">
      <Card className="mb-4 space-y-4">
        <h2 className="section-label">פרטים אישיים</h2>
        <Input label={t('s3_full')} value={form.fullName} onChange={setF('fullName')} />
        <Input label={t('s3_phone')} value={form.phone} onChange={setF('phone')} />
        <Input label={t('s3_email')} value={form.email} onChange={setF('email')} />
      </Card>

      <Card className="mb-4 space-y-4">
        <h2 className="section-label">העדפות אירוח</h2>
        <RadioGroup label={t('s7_kosh_lev')} value={form.kosher} onChange={setF('kosher')}
          options={[
            { value:'mehadrin', label:t('s7_meh'),  sub:t('s7_meh_s') },
            { value:'kosher',   label:t('s7_kosh'), sub:t('s7_kosh_s') },
            { value:'none',     label:t('s7_none'), sub:t('s7_none_s') },
          ]}
        />
        <MultiCheck label={t('s9_title')} options={allergyOpts} values={form.allergies} onChange={setF('allergies')} />
      </Card>

      <Card className="mb-6 space-y-4">
        <h2 className="section-label">עליי</h2>
        <div>
          <label className="block text-sm font-semibold text-warm-600 mb-1.5">{t('s11_bio')}</label>
          <textarea value={form.bio} onChange={e => setF('bio')(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none" rows={4} />
        </div>
      </Card>

      <Btn onClick={handleSave} className="text-base py-4">{saved ? 'נשמר בהצלחה! ✓' : 'שמור שינויים'}</Btn>
      </div>
    </div>
  );
}
