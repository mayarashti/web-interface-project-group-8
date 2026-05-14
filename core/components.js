/* components.js — Shared UI components */

var { useState, useEffect, useRef } = React;
window.clsx = (...args) => args.filter(Boolean).join(' ');
const clsx = window.clsx;

function ProgressBar({ step, total }) {
  const { t } = useLang();
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-warm-600">{t('step_label', step, total)}</span>
        <span className="text-xs font-bold text-brand-600">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-warm-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) {
  const base = "w-full py-3.5 px-4 rounded-xl font-bold text-[15px] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] shadow-sm hover:shadow-md",
    secondary: "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 active:scale-[0.98]",
    outline: "bg-white text-gray-700 border border-warm-200 hover:bg-warm-50 hover:border-warm-300 active:scale-[0.98]",
    ghost: "bg-transparent text-warm-600 hover:bg-warm-50 active:scale-[0.98]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-[0.98]"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={clsx(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', hint, error, required = false, className = '' }) {
  return (
    <div className={clsx("w-full mb-5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex justify-between items-baseline">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
          {hint && <span className="text-xs font-normal text-warm-500">{hint}</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={clsx(
          "w-full min-h-[48px] px-4 py-3 rounded-xl border bg-white text-[15px] transition-all duration-200 placeholder:text-warm-400 focus:outline-none focus:ring-4",
          error 
            ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30" 
            : "border-warm-200 focus:border-brand-400 focus:ring-brand-50 hover:border-warm-300"
        )}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
}

function Card({ children, className = '', onClick }) {
  const isClickable = !!onClick;
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden",
        isClickable && "cursor-pointer transition-all duration-200 hover:border-brand-300 hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}

function Tag({ label, selected, onClick, className = '' }) {
  const isClickable = !!onClick;
  return (
    <span 
      onClick={onClick}
      className={clsx(
        "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200",
        isClickable && "cursor-pointer active:scale-95",
        selected 
          ? "bg-brand-50 border-brand-200 text-brand-700 shadow-sm" 
          : "bg-white border-warm-200 text-gray-600 hover:bg-warm-50 hover:border-warm-300",
        className
      )}
    >
      {label}
    </span>
  );
}

function BackBtn({ onClick }) {
  const { lang } = useLang();
  const isHeb = lang === 'he';
  return (
    <button 
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-warm-200 text-gray-600 hover:bg-warm-50 hover:text-brand-600 transition-colors shadow-sm mb-6 active:scale-95"
      aria-label="Back"
    >
      {isHeb ? '→' : '←'}
    </button>
  );
}

function CheckRow({ label, sub, checked, onChange, children }) {
  const displayLabel = label || children;
  return (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-warm-200 bg-white hover:bg-brand-50/30 hover:border-brand-200 transition-colors cursor-pointer group">
      <div className="flex-shrink-0 pt-0.5">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 rounded border-warm-300 text-brand-600 focus:ring-brand-500 focus:ring-2 transition-all cursor-pointer"
        />
      </div>
      <div className="flex-col">
        <span className="block text-sm font-semibold text-gray-800 group-hover:text-brand-800">{displayLabel}</span>
        {sub && <span className="block text-xs text-warm-500 mt-1">{sub}</span>}
      </div>
    </label>
  );
}

function RadioGroup({ options, value, onChange, vertical = true, label }) {
  return (
    <div>
      {label && <p className="text-sm font-semibold text-gray-800 mb-3">{label}</p>}
      <div className={clsx('flex gap-3', vertical ? 'flex-col' : 'flex-row flex-wrap')}>
        {options.map(opt => {
          // Support both 'id' and 'value' in option objects for backwards compat
          const optId = opt.id ?? opt.value;
          const isSel = value === optId;
          return (
            <label 
              key={optId} 
              className={clsx(
                'relative flex items-start p-4 rounded-xl border cursor-pointer transition-all duration-200',
                vertical ? 'w-full' : 'flex-1 min-w-[140px]',
                isSel 
                  ? 'bg-brand-50 border-brand-300 shadow-sm' 
                  : 'bg-white border-warm-200 hover:border-brand-200 hover:bg-warm-50'
              )}
            >
              <div className="flex-shrink-0 pt-0.5 mr-3 ml-3">
                <div className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSel ? 'border-brand-600' : 'border-warm-300'
                )}>
                  {isSel && <div className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pop-in" />}
                </div>
              </div>
              <div className="flex flex-col">
                <span className={clsx('block text-sm font-semibold', isSel ? 'text-brand-900' : 'text-gray-800')}>
                  {opt.label}
                </span>
                {opt.sub && (
                  <span className={clsx('block text-xs mt-1 leading-relaxed', isSel ? 'text-brand-700' : 'text-warm-500')}>
                    {opt.sub}
                  </span>
                )}
              </div>
              <input 
                type="radio" 
                name={`radiogroup-${label || 'default'}`} 
                className="sr-only" 
                checked={isSel} 
                onChange={() => onChange(optId)} 
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MultiCheck({ options, values, onChange, label }) {
  const toggle = (id) => {
    // Support both 'id' and 'value' in option objects
    const key = id;
    if (values.includes(key)) onChange(values.filter(x => x !== key));
    else onChange([...values, key]);
  };
  return (
    <div>
      {label && <p className="text-sm font-semibold text-gray-800 mb-3">{label}</p>}
      <div className="flex flex-col gap-3">
        {options.map(opt => {
          const optId = opt.id ?? opt.value;
          return (
            <CheckRow 
              key={optId}
              label={opt.label}
              sub={opt.sub}
              checked={values.includes(optId)}
              onChange={() => toggle(optId)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight mb-1">{title}</h2>
      {sub && <p className="text-sm text-warm-500 leading-relaxed">{sub}</p>}
    </div>
  );
}

function AppHeader({ title, onProfile }) {
  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-warm-200">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        {onProfile && (
          <button 
            onClick={onProfile}
            className="w-10 h-10 rounded-full bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center hover:bg-brand-100 transition-colors active:scale-95"
            aria-label="Profile Settings"
          >
            <span className="text-xl leading-none">⚙️</span>
          </button>
        )}
      </div>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        <div className="px-6 py-5 border-b border-warm-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-warm-50 text-gray-500 hover:bg-warm-100 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

function ScreenLayout({ children, onBack, onNext, nextLabel, title, sub, icon, step, totalSteps, total }) {
  const { lang } = useLang();
  // Accept both 'totalSteps' and 'total' for backward compat
  const steps = totalSteps || total;
  return (
    <div className="min-h-screen bg-warm-50 flex justify-center screen-enter">
      <div className="w-full max-w-md bg-white min-h-screen shadow-sm flex flex-col relative">
        <div className="flex-1 px-6 pt-8 pb-32">
          {onBack && <BackBtn onClick={onBack} />}
          
          {(step && steps) && <ProgressBar step={step} total={steps} />}

          <div className="mb-8">
            {icon && typeof icon === 'string' && <div className="text-4xl mb-4 animate-fade-in">{icon}</div>}
            {title && <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2 tracking-tight">{title}</h1>}
            {sub && <p className="text-[15px] text-warm-500 leading-relaxed">{sub}</p>}
          </div>

          <div className="animate-fade-in delay-100">
            {children}
          </div>
        </div>

        {onNext && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-10 flex justify-center">
            <div className="w-full max-w-md pointer-events-auto">
              <Btn onClick={onNext} className="shadow-lg shadow-brand-500/20">
                {nextLabel || (lang === 'he' ? 'המשך' : 'Continue')}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.ProgressBar = ProgressBar;
window.Btn = Btn;
window.Input = Input;
window.Card = Card;
window.Tag = Tag;
window.BackBtn = BackBtn;
window.CheckRow = CheckRow;
window.RadioGroup = RadioGroup;
window.MultiCheck = MultiCheck;
window.SectionTitle = SectionTitle;
window.AppHeader = AppHeader;
window.Modal = Modal;
window.ScreenLayout = ScreenLayout;
