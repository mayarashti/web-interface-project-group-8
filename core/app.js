var { useState, useEffect } = React;


function App() {
  const {
    S0Login, S1Welcome, S2Explain, S3PersonalDetails, S7Preferences,
    S12Summary, S13Pending, S14Success, S15Home, S15NewRequest, S15Landing,
    S18HostExplain, S16HostRegistration, S17HostSummary, S17HostSuccess, S19HostHome,
    S20NewHosting, S21SoldierProfile, S22HostProfile,
    LangContext, LangToggle, Modal, Card, Btn, useLang,
    PreferencesPromptModal,
  } = window;
  const [screen,   setScreen]   = useState(1);
  const [lang,     setLang]     = useState('he');
  const [showInfo, setShowInfo] = useState(false);
  const [prefPrompt, setPrefPrompt]               = useState({ show: false, context: null });
  const [nextScreenAfterPrefs, setNextScreenAfterPrefs] = useState(12);
  const [formData, setFormData] = useState({ 
    languages:['he'], 
    hostings: [
      { 
        id: 1, 
        date: new Date(Date.now() + ((5 - new Date().getDay() + 7) % 7 || 7) * 86400000).toISOString().split('T')[0], 
        time: 'friday_evening', 
        soldiers: 4, 
        note: '',
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

  /* ── Preferences prompt helpers ── */
  const triggerPrefPrompt = (context) => {
    setPrefPrompt({ show: true, context });
  };

  const handlePrefNow = () => {
    const ctx = prefPrompt.context;
    setPrefPrompt({ show: false, context: null });
    if (ctx === 'soldier_reg') {
      setNextScreenAfterPrefs(12);
      go(7);
    } else if (ctx === 'first_request') {
      setFormData(prev => ({ ...prev, prefPromptedBeforeRequest: true }));
      setNextScreenAfterPrefs(23);
      go(7);
    }
  };

  const handlePrefLater = () => {
    const ctx = prefPrompt.context;
    setPrefPrompt({ show: false, context: null });
    if (ctx === 'soldier_reg') {
      setFormData(prev => ({ ...prev, preferencesSkipped: true }));
      go(13);
    } else if (ctx === 'first_request') {
      // Soldier chose not to fill preferences — stay on the landing screen.
      // Do NOT navigate to the request and do NOT mark as prompted,
      // so the requirement reappears every time they try to open a request.
      go(24);
    }
  };

  const handleNewRequest = (requestToEdit = null) => {
    setFormData(prev => ({ ...prev, editingRequest: requestToEdit }));
    // Show preferences prompt before the very first accommodation request
    // only when the soldier skipped preferences during registration.
    const isFirstRequest = !requestToEdit && (formData.requests || []).length === 0;
    if (isFirstRequest && formData.preferencesSkipped && !formData.prefPromptedBeforeRequest) {
      triggerPrefPrompt('first_request');
      return;
    }
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
    hostings: [
      {
        id: 101, date: '2026-06-27', time: 'friday_evening', soldiers: 3, note: '', status: 'open',
        guests: [
          {
            id: 1, name: '\u05d9\u05d5\u05e0\u05ea\u05df \u05db\u05d4\u05df', unit: '\u05d2\u05d5\u05dc\u05e0\u05d9', phone: '052-1234567', age: 21,
            groupSize: 2, kosher: 'kosher', allergies: ['lactose'],
            needsSleep: false, needsTransport: true, walkDistance: false,
            bio: '\u05d9\u05d5\u05e6\u05d0 \u05de\u05d4\u05d1\u05e1\u05d9\u05e1 \u05d1\u05db\u05dc \u05e9\u05d9\u05e9\u05d9 \u05e9\u05d0\u05e4\u05e9\u05e8. \u05e9\u05de\u05d7 \u05dc\u05d1\u05d5\u05d0 \u05e2\u05dd \u05d7\u05d1\u05e8 \u05de\u05d4\u05d9\u05d7\u05d9\u05d3\u05d4.',
            avatarColor: '#6f8f72',
          },
          {
            id: 2, name: '\u05d3\u05e0\u05d9\u05d0\u05dc \u05de.', unit: '\u05d7\u05d9"\u05e8', phone: '052-9876543', age: 23,
            groupSize: 1, kosher: 'mehadrin', allergies: ['gluten'],
            needsSleep: true, needsTransport: false, walkDistance: true,
            bio: '',
            avatarColor: '#b86442',
          },
        ],
      },
      { id: 102, date: '2026-07-04', time: 'friday_evening', soldiers: 2, guests: [], note: '', status: 'canceled' },
    ],
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
    3:  <S3PersonalDetails data={formData} setData={setFormData} onNext={() => triggerPrefPrompt('soldier_reg')} onBack={() => go(1)} />,
    7:  <S7Preferences      data={formData} setData={setFormData} onNext={() => go(nextScreenAfterPrefs)} onBack={() => nextScreenAfterPrefs === 23 ? go(24) : go(3)} />,
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
    16: <S16HostRegistration data={formData} setData={setFormData} onNext={() => go(25)} onBack={() => go(1)} onSkipPreferences={() => { setFormData(prev => ({ ...prev, hostPreferencesSkipped: true })); go(17); }} />,
    25: <S17HostSummary data={formData} onEdit={() => go(16)} onSubmit={() => go(17)} onBack={() => go(16)} />,
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

        {/* Screen 1 has its own navbar with a language toggle, so skip the floating one there */}
        {![1, 15, 19, 21, 24].includes(screen) && (
          <LangToggle onInfo={[3, 16].includes(screen) ? () => setShowInfo(true) : null} />
        )}
        {screens[screen] || screens[1]}
        
        {/* Global Info Modal for Registration Screens */}
        <InfoModal screen={screen} isOpen={showInfo} onClose={() => setShowInfo(false)} />

        {/* Preferences Questionnaire Prompt */}
        <PreferencesPromptModal
          isOpen={prefPrompt.show}
          context={prefPrompt.context}
          onNow={handlePrefNow}
          onLater={handlePrefLater}
        />
      </div>
    </LangContext.Provider>
  );
}

function InfoModal({ screen, isOpen, onClose }) {
  const { useLang, Modal, Card } = window;
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
    <Modal isOpen={isOpen} onClose={onClose} title={t(`${prefix}_title`)} className="max-w-xl">
      <p className="text-sm text-warm-500 mb-3">{t(`${prefix}_sub`)}</p>
      <div className="grid grid-cols-2 gap-2">
        {features.map((f, index) => (
          <Card key={f.title} className="flex gap-3 items-start p-3">
            <span className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
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
