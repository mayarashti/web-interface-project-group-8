var { useState, useEffect } = React;

function App() {
  const [screen,   setScreen]   = useState(1);
  const [lang,     setLang]     = useState('he');
  const [showInfo, setShowInfo] = useState(false);
  const [formData, setFormData] = useState({ 
    languages:['he'], 
    hostings: [
      { 
        id: 1, 
        date: new Date(Date.now() + ((5 - new Date().getDay() + 7) % 7 || 7) * 86400000).toISOString().split('T')[0], 
        time: 'friday_evening', 
        soldiers: 4, 
        note: 'נשמח לארח חיילים אצלנו!',
        guests: [
          { id: 101, name: 'יונתן כ.', unit: 'גולני' },
          { id: 102, name: 'דניאל מ.', unit: 'חי"ר' }
        ]
      }
    ],
    requests: [],
    editingRequest: null,
    selectedRequestId: null,
    editingHostingId: null,
  });

  // Note: App doesn't need useLang anymore, we removed the t() usage.
  // The Modal is now a separate component inside the provider.

  const go = (n) => { setScreen(n); window.scrollTo(0,0); };
  window.setScreen = go;

  const handleNewRequest = (requestToEdit = null) => {
    setFormData(prev => ({ ...prev, editingRequest: requestToEdit }));
    go(23);
  };

  const handleViewMatches = (requestId) => {
    setFormData(prev => ({ ...prev, selectedRequestId: requestId }));
    go(15);
  };

  const demoSoldierData = {
    firstName: 'יונתן',
    lastName: 'כהן',
    fullName: 'יונתן כהן',
    phone: '052-1234567',
    unit: 'גולני',
    serviceType: 'regular',
    languages: ['he'],
    kosher: 'kosher',
    shabbat: 'traditional',
    needsSleep: false,
    walkDistance: true,
    allergies: ['none'],
    preferWithSoldiers: true,
    requests: [
      { id: 10, when: '2026-06-22', kosher: true, shabbat: true, needSleep: false, location: 'חיפה', status: 'searching' },
      { id: 11, when: '2026-06-29', kosher: true, shabbat: true, needSleep: true,  location: 'חיפה', status: 'matched' },
    ],
  };

  const demoHostData = {
    hostName: 'משפחת כהן',
    hostPhone: '052-7654321',
    hostCity: 'חיפה',
    hostKosher: 'kosher',
    hostShabbat: 'traditional',
    hostLanguages: ['he'],
    hostCanSleep: true,
    hostCanTransport: false,
    hostCapacity: 4,
    hostVibeTags: ['kids', 'shabbat_atm'],
    hasSoldierNearby: true,
  };

  const handleDemoLogin = (role) => {
    if (role === 'host') {
      setFormData(prev => ({ ...prev, ...demoHostData }));
      go(19);
      return;
    }

    setFormData(prev => ({ ...prev, ...demoSoldierData }));
    go(24);
  };

  /* keep <html> dir + lang in sync */
  useEffect(() => {
    document.documentElement.dir  = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const screens = {
    /* login */
    0:  <S0Login      onBack={() => go(1)} onLogin={handleDemoLogin} />,
    /* soldier flow */
    1:  <S1Welcome    onSoldier={() => go(3)} onHost={() => go(16)} onLogin={() => go(0)} />,
    2:  <S2Explain    onNext={() => go(3)}  onBack={() => go(1)} />,
    3:  <S3PersonalDetails data={formData} setData={setFormData} onNext={() => go(7)}  onBack={() => go(1)} />,
    7:  <S7Preferences      data={formData} setData={setFormData} onNext={() => go(12)} onBack={() => go(3)} />,
    12: <S12Summary   data={formData} onEdit={() => go(3)} onSubmit={() => go(13)} onBack={() => go(7)} />,
    13: <S13Pending   onHome={() => go(24)} autoApprove={() => go(14)} />,
    14: <S14Success   onHome={() => go(24)} name={formData.fullName} />,
    15: <S15Home      data={formData} onNewRequest={() => handleNewRequest()} onProfile={() => go(21)} onBack={() => go(24)} />,
    23: <S15NewRequest 
          data={formData} 
          setData={setFormData} 
          onBack={() => go(24)} 
          onSubmit={(req) => { 
            setFormData(prev => {
              const requests = prev.requests || [];
              const index = requests.findIndex(r => r.id === req.id);
              if (index > -1) {
                const newRequests = [...requests];
                newRequests[index] = req;
                return { ...prev, requests: newRequests, editingRequest: null };
              }
              return { ...prev, requests: [req, ...requests], editingRequest: null };
            });
            go(24); 
          }} 
          onCancel={(id) => {
            setFormData(prev => ({
              ...prev,
              requests: (prev.requests || []).filter(r => r.id !== id),
              editingRequest: null
            }));
            go(24);
          }}
        />,
    24: <S15Landing   data={formData} onNewRequest={handleNewRequest} onViewMatches={handleViewMatches} onEditRequest={(req) => handleNewRequest(req)} onProfile={() => go(21)} />,
    /* host flow */
    18: <S18HostExplain onNext={() => go(16)} onBack={() => go(1)} />,
    16: <S16HostRegistration data={formData} setData={setFormData} onNext={() => go(17)} onBack={() => go(1)} />,
    17: <S17HostSuccess onNext={() => go(19)} />,
    19: <S19HostHome    data={formData} setData={setFormData} onEditProfile={() => go(22)} />,
    20: <S20NewHosting  data={formData} setData={setFormData} onBack={() => go(19)} onSubmit={() => go(19)} />,
    21: <S21SoldierProfile 
          data={formData} 
          setData={setFormData} 
          onBack={() => go(24)} 
          onNewRequest={() => handleNewRequest()}
          onEditRequest={(req) => handleNewRequest(req)}
          onDeleteRequest={(id) => {
            setFormData(prev => ({
              ...prev,
              requests: (prev.requests || []).filter(r => r.id !== id)
            }));
          }}
          onViewMatches={handleViewMatches}
        />,
    22: <S22HostProfile data={formData} setData={setFormData} onBack={() => go(19)} />,
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen">
        {![15, 19, 21, 24].includes(screen) && (
          <LangToggle onInfo={[3, 16].includes(screen) ? () => setShowInfo(true) : null} />
        )}
        {screens[screen] || screens[1]}
        
        {/* Global Info Modal for Registration Screens */}
        <InfoModal screen={screen} isOpen={showInfo} onClose={() => setShowInfo(false)} />
      </div>
    </LangContext.Provider>
  );
}

function InfoModal({ screen, isOpen, onClose }) {
  const { t } = useLang();
  if (!isOpen) return null;

  const isSoldier = screen === 3;
  const isHost = screen === 16;
  
  const prefix = isSoldier ? 's2' : 's18';
  const features = [
    { title: t(`${prefix}_f1_t`), desc: t(`${prefix}_f1_d`) },
    { title: t(`${prefix}_f2_t`), desc: t(`${prefix}_f2_d`) },
    { title: t(`${prefix}_f3_t`), desc: t(`${prefix}_f3_d`) },
    { title: t(`${prefix}_f4_t`), desc: t(`${prefix}_f4_d`) },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(`${prefix}_title`)}>
      <p className="text-sm text-warm-500 mb-6">{t(`${prefix}_sub`)}</p>
      <div className="space-y-3">
        {features.map((f, index) => (
          <Card key={f.title} className="flex gap-4 items-start p-4">
            <span className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-xs text-warm-500 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
