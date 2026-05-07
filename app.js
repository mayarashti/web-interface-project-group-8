/* app.js — Root App component + render */

function App() {
  const [screen,   setScreen]   = useState(1);
  const [lang,     setLang]     = useState('he');
  const [formData, setFormData] = useState({ languages:['he'], allergies:[] });

  const go = (n) => { setScreen(n); window.scrollTo(0,0); };

  /* keep <html> dir + lang in sync */
  useEffect(() => {
    document.documentElement.dir  = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const screens = {
    /* soldier flow */
    1:  <S1Welcome    onSoldier={() => go(2)} onHost={() => go(18)} />,
    2:  <S2Explain    onNext={() => go(3)}  onBack={() => go(1)} />,
    3:  <S3Account    data={formData} setData={setFormData} onNext={() => go(4)}  onBack={() => go(2)} />,
    4:  <S4Verify     phone={formData.phone} onNext={() => go(5)} onBack={() => go(3)} />,
    5:  <S5Service    data={formData} setData={setFormData} onNext={() => go(6)}  onBack={() => go(4)} />,
    6:  <S6Upload     data={formData} setData={setFormData} onNext={() => go(7)}  onBack={() => go(5)} />,
    7:  <S7Kosher     data={formData} setData={setFormData} onNext={() => go(8)}  onBack={() => go(6)} />,
    8:  <S8Location   data={formData} setData={setFormData} onNext={() => go(9)}  onBack={() => go(7)} />,
    9:  <S9Allergies  data={formData} setData={setFormData} onNext={() => go(10)} onBack={() => go(8)} />,
    10: <S10Prefs     data={formData} setData={setFormData} onNext={() => go(11)} onBack={() => go(9)} />,
    11: <S11Profile   data={formData} setData={setFormData} onNext={() => go(12)} onBack={() => go(10)} />,
    12: <S12Summary   data={formData} onEdit={() => go(3)} onSubmit={() => go(13)} onBack={() => go(11)} />,
    13: <S13Pending   onHome={() => go(15)} autoApprove={() => go(14)} />,
    14: <S14Success   onHome={() => go(15)} name={`${formData.firstName||''} ${formData.lastName||''}`} />,
    15: <S15Home      data={formData} onNewRequest={() => {}} />,
    /* host flow */
    18: <S18HostExplain onNext={() => go(16)} onBack={() => go(1)} />,
    16: <S16HostRegistration data={formData} setData={setFormData} onNext={() => go(17)} onBack={() => go(18)} />,
    17: <S17HostSuccess onHome={() => go(19)} name={formData.hostFullName || (lang === 'he' ? 'משפחה מארחת' : 'Host Family')} />,
    19: <S19HostHome    data={formData} onNewHosting={() => go(20)} />,
    20: <S20NewHosting  data={formData} onBack={() => go(19)} onSubmit={() => go(19)} />,
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen">
        <LangToggle />
        {screens[screen] || screens[1]}
      </div>
    </LangContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);