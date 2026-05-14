/* ─────────────────────────────────────────
   components.js  —  Shared UI components
───────────────────────────────────────── */

const { useState, useEffect, useRef } = React;
const clsx = (...args) => args.filter(Boolean).join(' ');

function ProgressBar({ step, total }) {
  const { t } = useLang();
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-warm-600">{t('step_label', step, total)}</span>
        <span className="text-xs text-warm-500">{pct}%</span>
      </div>
      <div className="h-1.5 bg-warm-200 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
  const base = 'w-full min-h-12 py-3 px-5 rounded-xl font-semibold text-[15px] leading-5 transition-all duration-150 focus:outline-none focus:ring-4 active:scale-[0.99]';
  const variants = {
    primary:   'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-100 disabled:opacity-45 disabled:cursor-not-allowed shadow-xs',
    secondary: 'bg-white text-warm-600 border border-warm-200 hover:border-brand-200 hover:bg-brand-50 focus:ring-brand-100',
    ghost:     'text-brand-600 hover:text-brand-700 hover:bg-brand-50 py-2 focus:ring-brand-100',
    outline:   'border border-brand-300 text-brand-600 bg-transparent hover:bg-brand-50 focus:ring-brand-100',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clsx(base, variants[variant], className)}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '', error = '', hint = '' }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-warm-600 mb-1.5">{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={clsx(
          'w-full min-h-12 px-4 py-3 rounded-xl border text-base text-gray-900 bg-white transition-all duration-150 placeholder:text-warm-400 focus:outline-none focus:ring-4',
          error ? 'border-red-300 focus:ring-red-100 bg-red-50' : 'border-warm-200 focus:ring-brand-100 focus:border-brand-300'
        )}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-warm-500">{hint}</p>}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={clsx('bg-white rounded-xl border border-warm-200 p-5 shadow-xs', className)}>
      {children}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-block bg-support-50 text-support-600 border border-support-100 text-xs font-semibold px-2.5 py-1 rounded-full">
      {children}
    </span>
  );
}

function BackBtn({ onBack }) {
  const { t } = useLang();
  return (
    <button onClick={onBack} className="flex items-center gap-1.5 text-warm-600 font-semibold text-sm mb-5 hover:text-brand-700 transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
      {t('back')}
    </button>
  );
}

function CheckRow({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 flex-shrink-0 cursor-pointer"
      />
      <span className="text-sm text-warm-600 group-hover:text-gray-900 leading-relaxed">{children}</span>
    </label>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div className="mb-5">
      {label && <p className="text-sm font-semibold text-warm-600 mb-2.5">{label}</p>}
      <div className="flex flex-col gap-2.5">
        {options.map(opt => (
          <label key={opt.value} className={clsx(
            'flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
            value === opt.value ? 'border-brand-300 bg-brand-50 shadow-xs' : 'border-warm-200 bg-white hover:border-brand-200 hover:bg-warm-50'
          )}>
            <input type="radio" name={label} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="flex-shrink-0" />
            <div>
              <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
              {opt.sub && <p className="text-xs text-warm-500 mt-0.5">{opt.sub}</p>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function MultiCheck({ label, options, values, onChange }) {
  const toggle = (key) => {
    if (values.includes(key)) onChange(values.filter(v => v !== key));
    else onChange([...values, key]);
  };
  return (
    <div className="mb-5">
      {label && <p className="text-sm font-semibold text-warm-600 mb-2.5">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
            className={clsx(
              'px-3.5 py-2 rounded-full text-sm font-semibold border transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100',
              values.includes(opt.value)
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-white text-warm-600 border-warm-200 hover:border-brand-200 hover:bg-warm-50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div className="mb-7">
      {icon && <div className="section-kicker" aria-hidden="true" />}
      <h1 className="text-[28px] leading-[34px] font-bold text-gray-900 tracking-normal">{title}</h1>
      {sub && <p className="text-base text-warm-500 mt-2 leading-6">{sub}</p>}
    </div>
  );
}

function AppHeader({ eyebrow, title, actions, onBack, profileAction }) {
  return (
    <header className="app-header">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button onClick={onBack} className="app-icon-btn" aria-label="Back">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <div className="flex items-center gap-3">
          {profileAction && (
            <div className="flex-shrink-0">
              {profileAction}
            </div>
          )}
          <div className="app-greeting">
            {eyebrow && <span>{eyebrow}</span>}
            <strong>{title}</strong>
          </div>
        </div>
      </div>
      {actions && <div className="app-header-actions">{actions}</div>}
    </header>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  const { t } = useLang();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-warm-400 hover:text-gray-900 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {children}
          <div className="mt-8">
            <Btn onClick={onClose}>{t('close')}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ScreenLayout — A reusable wrapper for all app screens.
 * Handles the common structure: container, back button, progress, title, and bottom CTA.
 */
function ScreenLayout({ 
  children, onBack, onNext, 
  step, total = 12, 
  icon, title, sub, 
  nextDisabled = false,
  nextLabel,
  className = ""
}) {
  const { t } = useLang();
  return (
    <div className={clsx("screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto bg-warm-50", className)}>
      {onBack && <BackBtn onBack={onBack} />}
      {step && <ProgressBar step={step} total={total} />}
      {(icon || title || sub) && <SectionTitle icon={icon} title={title} sub={sub} />}
      
      <div className="flex-1">
        {children}
      </div>

      {onNext && (
        <div className="mt-auto pt-6">
          <Btn onClick={onNext} disabled={nextDisabled}>
            {nextLabel || t('continue')}
          </Btn>
        </div>
      )}
    </div>
  );
}
