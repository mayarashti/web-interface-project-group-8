
const { useState, useEffect } = React;

function App() {
  const [screen,   setScreen]   = useState(1);
  const [lang,     setLang]     = useState('he');
  const [showInfo, setShowInfo] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [formData, setFormData] = useState({ 
    languages:['he'], 
    hostings: [],
    requests: [],
    editingRequest: null,
    selectedRequestId: null,
    editingHostingId: null,
  });

  const go = (n) => { setScreen(n); window.scrollTo(0,0); };

  // Make `go` available globally for components that use `window.setScreen`
  window.setScreen = go;

  const handleLogout = async () => {
    try { if (window.auth) await window.auth.signOut(); } catch (e) {}
    setFormData({ languages: ['he'], hostings: [], requests: [], editingRequest: null, selectedRequestId: null, editingHostingId: null });
    go(1);
  };

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
    email: 'soldier@example.com',
    unit: 'גולני',
    serviceType: 'regular',
    languages: ['he'],
    kosher: 'separated',
    shabbat: 'traditional',
    needsSleep: false,
    walkDistance: true,
    allergies: ['none'],
    preferWithSoldiers: true,
    requests: [
      { id: 10, when: '2026-06-22', kosher: 'separated', shabbat: 'traditional', needSleep: false, location: 'חיפה' },
      { id: 11, when: '2026-06-29', kosher: 'separated', shabbat: 'keeps',       needSleep: true,  location: 'חיפה' },
    ],
  };

  const demoHostData = {
    hostFullName: 'משפחת כהן',
    hostPhone: '052-7654321',
    hostEmail: 'family@example.com',
    hostCity: 'חיפה',
    hostKosher: 'separated',
    hostShabbat: 'traditional',
    hostLanguages: ['he'],
    hostCanSleep: true,
    hostCanTransport: false,
    hostCapacity: 4,
    hostVibeTags: ['kids', 'shabbat_atm'],
  };

  useEffect(() => {
    if (!window.auth) {
      setLoadingUser(false);
      return;
    }
    const unsubscribe = window.auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (!window.DB) {
          setLoadingUser(false);
          return;
        }
        
        // Try to fetch soldier profile
        const soldierProfile = await window.DB.getSoldierProfile(user.uid);
        if (soldierProfile) {
          setFormData(prev => ({ ...prev, ...soldierProfile, uid: user.uid, role: 'soldier' }));
          
          // Real-time listener for soldier requests
          window.db.collection('soldier_hosting_searches')
            .where('soldier_id', '==', user.uid)
            .onSnapshot(snapshot => {
              const reqs = snapshot.docs.map(doc => {
                const d = doc.data();
                return { ...d, id: doc.id, status: d.is_match ? 'matched' : (d.status || 'searching') };
              });
              setFormData(prev => ({ ...prev, requests: reqs }));
            });

          setScreen(24); // Soldier Landing
          setLoadingUser(false);
          return;
        }

        // Try to fetch host profile
        const familyProfile = await window.DB.getFamilyProfile(user.uid);
        if (familyProfile) {
          setFormData(prev => ({ ...prev, ...familyProfile, uid: user.uid, role: 'host' }));
          
          // Real-time listener for family hostings
          window.db.collection('family_hostings')
            .where('family_id', '==', user.uid)
            .onSnapshot(snapshot => {
              const hostings = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
              setFormData(prev => ({ ...prev, hostings: hostings }));
            });

          setScreen(19); // Host Home
          setLoadingUser(false);
          return;
        }
        
        // Signed in but no profile yet (in middle of registration)
        setFormData(prev => ({ ...prev, uid: user.uid, email: user.email, name: user.displayName }));
        setScreen(prev => {
          if (prev === 0) return 1; // From login, go to welcome screen
          return prev; // Otherwise, stay wherever they are
        });
      } else {
        // Not signed in
        setScreen(1);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDemoLogin = (role, data) => {
    if (role === 'soldier') {
      setFormData(prev => ({ ...prev, ...data, role: 'soldier' }));
      go(24);
    } else if (role === 'host') {
      setFormData(prev => ({ ...prev, ...data, role: 'host' }));
      go(19);
    } else if (role === 'new_user') {
      setFormData(prev => ({ ...prev, ...data }));
      go(1); // go to welcome screen where they pick soldier/host
    } else {
      // old demo fallback
      if (role === 'host') {
        setFormData(prev => ({ ...prev, ...demoHostData, role: 'host' }));
        go(19);
        return;
      }
      setFormData(prev => ({ ...prev, ...demoSoldierData, role: 'soldier' }));
      go(24);
    }
  };

  /* keep <html> dir + lang in sync */
  useEffect(() => {
    document.documentElement.dir  = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const registerSoldier = async (nextScreen, skipped = false) => {
    if (window.DB) {
      let uid = formData.uid;
      if (!uid && formData.phone && formData.password) {
        try {
          const cred = await window.auth.createUserWithEmailAndPassword(formData.phone + "@memulaim.com", formData.password);
          uid = cred.user.uid;
          setFormData(prev => ({ ...prev, uid }));
        } catch (err) {
          alert("Error creating account: " + err.message);
          return;
        }
      }
      if (uid) {
        try {
          const toSave = { ...formData, soldierPreferencesSkipped: skipped };
          await window.DB.saveSoldierProfile(uid, toSave);
          setFormData(prev => ({ ...prev, role: 'soldier', soldierPreferencesSkipped: skipped }));
          go(nextScreen);
        } catch (err) {
          alert("Error saving profile: " + err.message + "\n\nDid you create the Firestore Database and update the Rules?");
        }
      } else {
        if (skipped) setFormData(prev => ({ ...prev, soldierPreferencesSkipped: true }));
        go(nextScreen);
      }
    } else {
      if (skipped) setFormData(prev => ({ ...prev, soldierPreferencesSkipped: true }));
      go(nextScreen);
    }
  };

  const registerHost = async (nextScreen, skipped = false) => {
    if (window.DB) {
      let uid = formData.uid;
      if (!uid && formData.hostPhone && formData.hostPassword) {
        try {
          const cred = await window.auth.createUserWithEmailAndPassword(formData.hostPhone + "@memulaim.com", formData.hostPassword);
          uid = cred.user.uid;
          setFormData(prev => ({ ...prev, uid }));
        } catch (err) {
          alert("Error creating account: " + err.message);
          return;
        }
      }
      if (uid) {
        try {
          const { languages, requests, hostings, editingRequest, editingHostingId, selectedRequestId, pendingNewRequest, ...hostFields } = formData;
          const toSave = { ...hostFields, hostPreferencesSkipped: skipped };
          await window.DB.saveFamilyProfile(uid, toSave);
          setFormData(prev => ({ ...prev, role: 'host', hostPreferencesSkipped: skipped }));
          go(nextScreen);
        } catch (err) {
          alert("Error saving profile: " + err.message + "\n\nDid you create the Firestore Database and update the Rules?");
        }
      } else {
        if (skipped) setFormData(prev => ({ ...prev, hostPreferencesSkipped: true }));
        go(nextScreen);
      }
    } else {
      if (skipped) setFormData(prev => ({ ...prev, hostPreferencesSkipped: true }));
      go(nextScreen);
    }
  };

  const screens = {
    /* login */
    0:  <S0Login      onBack={() => go(1)} onLogin={handleDemoLogin} />,
    /* soldier flow */
    1:  <S1Welcome    onSoldier={() => go(3)} onHost={() => go(16)} onLogin={() => go(0)} />,
    2:  <S2Explain    onNext={() => go(3)}  onBack={() => go(1)} />,
    3:  <S3PersonalDetails data={formData} setData={setFormData} onNext={() => go(7)}  onBack={() => go(1)} onSkipPreferences={() => registerSoldier(13, true)} onInfo={() => setShowInfo(true)} />,
    7:  <S7Preferences      data={formData} setData={setFormData} onNext={() => go(12)} onBack={() => go(3)} />,
    12: <S12Summary   data={formData} onEdit={() => go(3)} onSubmit={() => registerSoldier(13)} onBack={() => go(7)} />,
    13: <S13Pending   onHome={() => go(24)} autoApprove={() => go(14)} />,
    14: <S14Success   onHome={() => go(24)} name={formData.fullName} />,
    15: <S15Home      data={formData} setData={setFormData} onNewRequest={() => handleNewRequest()} onProfile={() => go(21)} onBack={() => go(24)} onLogout={handleLogout} />,
    23: <S15NewRequest 
          data={formData} 
          setData={setFormData} 
          onBack={() => go(24)} 
          onSubmit={async (req) => { 
            if (window.DB && formData.uid) {
              if (formData.editingRequest) {
                 // Update existing request
                 await window.db.collection('soldier_hosting_searches').doc(req.id).set(req, { merge: true });
              } else {
                 // Create new
                 await window.DB.createHostingSearch(formData.uid, req);
              }
            } else {
              // fallback to local state if no DB
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
            }
            // Clear edit state
            setFormData(prev => ({ ...prev, editingRequest: null }));
            go(24); 
          }} 
          onCancel={async (id) => {
            if (window.DB) {
               await window.db.collection('soldier_hosting_searches').doc(id).delete();
            } else {
              setFormData(prev => ({
                ...prev,
                requests: (prev.requests || []).filter(r => r.id !== id),
                editingRequest: null
              }));
            }
            setFormData(prev => ({ ...prev, editingRequest: null }));
            go(24);
          }}
        />,
    24: <S15Landing   data={formData} setData={setFormData} onNewRequest={handleNewRequest} onViewMatches={handleViewMatches} onEditRequest={(req) => handleNewRequest(req)} onProfile={() => go(21)} onLogout={handleLogout} />,
    /* host flow */
    18: <S18HostExplain onNext={() => go(16)} onBack={() => go(1)} />,
    16: <S16HostRegistration data={formData} setData={setFormData} onNext={() => registerHost(17)} onBack={() => go(1)} onSkipPreferences={() => registerHost(17, true)} onInfo={() => setShowInfo(true)} />,
    17: <S17HostSuccess onHome={() => go(19)} name={formData.hostFullName || formData.hostName || (lang === 'he' ? 'משפחה מארחת' : 'Host Family')} />,
    19: <S19HostHome    data={formData} setData={setFormData} onNewHosting={() => go(20)} onProfile={() => go(22)} onLogout={handleLogout} />,
    20: <S20NewHosting  
          data={formData} 
          setData={setFormData} 
          onBack={() => go(19)} 
          onSubmit={async (hosting) => { 
            if (window.DB && formData.uid) {
              if (formData.editingHostingId) {
                // Update existing
                await window.db.collection('family_hostings').doc(hosting.id).set(hosting, { merge: true });
              } else {
                // Create new
                await window.DB.createFamilyHosting(formData.uid, hosting);
              }
            } else {
              // fallback local
              setFormData(prev => {
                const hostings = prev.hostings || [];
                if (prev.editingHostingId) {
                  return { ...prev, hostings: hostings.map(h => h.id === prev.editingHostingId ? hosting : h) };
                }
                return { ...prev, hostings: [...hostings, { ...hosting, id: Date.now().toString() }] };
              });
            }
            setFormData(prev => ({ ...prev, editingHostingId: null }));
            go(19); 
          }} 
        />,
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
          onLogout={handleLogout}
        />,
    22: <S22HostProfile data={formData} setData={setFormData} onBack={() => go(19)} onLogout={handleLogout} />,
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-warm-600 font-medium">{lang === 'he' ? 'טוען...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen">
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
