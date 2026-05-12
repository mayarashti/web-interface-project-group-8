/* S22HostProfile — Host Family profile and settings */
const { useState } = React;

function S22HostProfile({ data, setData, onBack }) {
  const { t } = useLang();
  
  // Use local state for the form so edits are not global until saved
  const [form, setForm] = useState({
    hostFullName: data.hostFullName || '',
    hostPhone: data.hostPhone || '',
    hostCity: data.hostCity || '',
    hostKosher: data.hostKosher || 'kosher',
    shabbatObservance: data.shabbatObservance || 'traditional',
  });

  const [saved, setSaved] = useState(false);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setData(prev => ({ ...prev, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="screen-enter min-h-screen flex flex-col pb-12 bg-warm-50">
      <AppHeader title="פרופיל משפחה" onBack={onBack} />

      <div className="w-full max-w-md mx-auto px-5">
      <Card className="mb-4 space-y-4">
        <h2 className="section-label">פרטי המשפחה</h2>
        <Input label={t('s16_sum_name')} value={form.hostFullName} onChange={setF('hostFullName')} />
        <Input label="טלפון" value={form.hostPhone} onChange={setF('hostPhone')} />
        <Input label={t('s16_city')} value={form.hostCity} onChange={setF('hostCity')} />
      </Card>

      <Card className="mb-6 space-y-4">
        <h2 className="section-label">אורח חיים</h2>
        <RadioGroup label={t('s16_shab_lev')} value={form.shabbatObservance} onChange={setF('shabbatObservance')}
          options={[
            { value:'observant',   label:t('s16_obs') },
            { value:'traditional', label:t('s16_trad') },
            { value:'secular',     label:t('s16_sec') },
          ]}
        />
        <RadioGroup label={t('s16_kosh_lev')} value={form.hostKosher} onChange={setF('hostKosher')}
          options={[
            { value:'mehadrin', label:t('s16_meh') },
            { value:'kosher',   label:t('s16_k') },
            { value:'none',     label:t('s16_none') },
          ]}
        />
      </Card>

      <Btn onClick={handleSave} className="text-base py-4">{saved ? 'נשמר בהצלחה! ✓' : 'שמור שינויים'}</Btn>
      </div>
    </div>
  );
}
