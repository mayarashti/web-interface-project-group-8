/* S15NewRequest — Form for soldiers to request accommodation */
const { useState } = React;

function S15NewRequest({ onBack, onSubmit, onCancel, data, setData }) {
  const { t, lang } = useLang();
  
  const initialRequest = data.editingRequest || {
    id: Date.now(),
    when: '',
    shabbat: data.shabbat === 'observant' || data.shabbat === 'traditional',
    kosher: data.kosher === 'kosher' || data.kosher === 'mehadrin',
    duration: 'dinner',
    transport: false,
    needSleep: data.needsSleep || false,
    travelDistance: 10,
    location: data.unit || ''
  };

  const [request, setRequest] = useState(initialRequest);

  const handleChange = (field, value) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(request);
  };

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-10">
      <AppHeader 
        title={data.editingRequest ? (lang === 'he' ? 'עריכת בקשה' : 'Edit Request') : t('s15_form_title')} 
        onBack={onBack}
      />
      
      <div className="px-5 mt-6 max-w-md mx-auto">
        <p className="text-base text-warm-500 mb-8 leading-6">{t('s15_form_sub')}</p>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Input 
            label={t('s15_when')}
            type="date"
            value={request.when}
            onChange={(val) => handleChange('when', val)}
            required
          />

          <RadioGroup 
            label={t('s15_shabbat')}
            value={request.shabbat ? 'yes' : 'no'}
            onChange={(val) => handleChange('shabbat', val === 'yes')}
            options={[
              { value: 'yes', label: t('s15_yes') },
              { value: 'no', label: t('s15_no') }
            ]}
          />

          <RadioGroup 
            label={t('s15_kosher')}
            value={request.kosher ? 'yes' : 'no'}
            onChange={(val) => handleChange('kosher', val === 'yes')}
            options={[
              { value: 'yes', label: t('s15_yes') },
              { value: 'no', label: t('s15_no') }
            ]}
          />

          <RadioGroup 
            label={t('s15_duration')}
            value={request.duration}
            onChange={(val) => handleChange('duration', val)}
            options={[
              { value: 'dinner', label: t('s15_duration_dinner') },
              { value: 'full', label: t('s15_duration_full') },
              { value: 'weekend', label: t('s15_duration_weekend') }
            ]}
          />

          <RadioGroup 
            label={t('s15_transport')}
            value={request.transport ? 'yes' : 'no'}
            onChange={(val) => handleChange('transport', val === 'yes')}
            options={[
              { value: 'yes', label: t('s15_yes') },
              { value: 'no', label: t('s15_no') }
            ]}
          />

          <RadioGroup 
            label={t('s15_need_sleep')}
            value={request.needSleep ? 'yes' : 'no'}
            onChange={(val) => handleChange('needSleep', val === 'yes')}
            options={[
              { value: 'yes', label: t('s15_yes') },
              { value: 'no', label: t('s15_no') }
            ]}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">
              {t('s15_travel_dist')}: {request.travelDistance}
            </label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={request.travelDistance} 
              onChange={(e) => handleChange('travelDistance', e.target.value)}
              className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          <Input 
            label={t('s15_location')}
            placeholder={t('s15_location_ph')}
            value={request.location}
            onChange={(val) => handleChange('location', val)}
            required
          />

          <div className="pt-4 space-y-3">
            <Btn type="submit">
              {data.editingRequest ? (lang === 'he' ? 'שמור שינויים' : 'Save Changes') : t('s15_submit_request')}
            </Btn>
            
            {data.editingRequest && (
              <button 
                type="button"
                onClick={() => onCancel(request.id)}
                className="w-full py-4 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
              >
                {lang === 'he' ? 'בטל בקשה' : 'Cancel Request'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}


