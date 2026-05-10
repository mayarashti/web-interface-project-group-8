/* S3Account — Create account / registration form */
const { useState } = React;

function S3Account({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.firstName?.trim()) e.firstName = t('err_first');
    if (!data.lastName?.trim())  e.lastName  = t('err_last');
    if (!data.phone?.trim() || data.phone.replace(/\D/g, '').length < 9) e.phone = t('err_phone');
    if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = t('err_email');
    if (!data.password || data.password.length < 6) e.password = t('err_pass');
    if (!data.terms) e.terms = t('err_terms');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={() => { if (validate()) onNext(); }}
      step={1}
      icon="📝"
      title={t('s3_title')}
      sub={t('s3_sub')}
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label={t('s3_first')} value={data.firstName || ''} onChange={set('firstName')} placeholder={t('s3_ph_first')} error={errors.firstName} />
        </div>
        <div className="flex-1">
          <Input label={t('s3_last')} value={data.lastName || ''} onChange={set('lastName')} placeholder={t('s3_ph_last')} error={errors.lastName} />
        </div>
      </div>
      <Input label={t('s3_phone')} type="tel"      value={data.phone || ''}    onChange={set('phone')}    placeholder="050-1234567"      error={errors.phone}    />
      <Input label={t('s3_email')} type="email"    value={data.email || ''}    onChange={set('email')}    placeholder={t('s3_ph_email')} error={errors.email}    />
      <Input label={t('s3_pass')}  type="password" value={data.password || ''} onChange={set('password')} placeholder={t('s3_pass_ph')}  error={errors.password} hint={t('s3_pass_hint')} />
      <div className="mb-6 mt-1">
        <CheckRow checked={!!data.terms} onChange={set('terms')}>
          <span>
            {t('s3_terms_pre')}{' '}
            <span className="text-brand-600 underline cursor-pointer">{t('s3_terms_link1')}</span>
            {' '}{t('s3_terms_and')}{' '}
            <span className="text-brand-600 underline cursor-pointer">{t('s3_terms_link2')}</span>
          </span>
        </CheckRow>
        {errors.terms && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.terms}</p>}
      </div>
    </ScreenLayout>
  );
}
