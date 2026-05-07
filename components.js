/* ─────────────────────────────────────────
   components.js  —  Shared UI components
───────────────────────────────────────── */
const { useState, useEffect, useRef } = React;
const clsx = (...args) => args.filter(Boolean).join(' ');

function ProgressBar({ step, total }) {
  const { t } = useLang();
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-brand-600">{t('step_label', step, total)}</span>
        <span className="text-xs text-warm-500">{pct}%</span>
      </div>
      <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-l from-brand-500 to-brand-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
  const base = 'w-full py-3.5 px-6 rounded-2xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';
  const variants = {
    primary:   'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed',
    secondary: 'bg-warm-100 text-brand-700 border border-brand-200 hover:bg-warm-200 focus:ring-brand-300',
    ghost:     'text-brand-600 underline underline-offset-2 hover:text-brand-800 py-2',
    outline:   'border-2 border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50 focus:ring-brand-400',
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
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={clsx(
          'w-full px-4 py-3 rounded-xl border text-base bg-white transition-all duration-150 focus:outline-none focus:ring-2',
          error ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-warm-300 focus:ring-brand-300 focus:border-brand-400'
        )}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-warm-500">{hint}</p>}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={clsx('bg-white rounded-3xl shadow-sm border border-warm-200 p-5', className)}>
      {children}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      {children}
    </span>
  );
}

function BackBtn({ onBack }) {
  const { t } = useLang();
  return (
    <button onClick={onBack} className="flex items-center gap-1.5 text-brand-600 font-medium text-sm mb-4 hover:text-brand-800 transition-colors">
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
        className="mt-0.5 w-4.5 h-4.5 flex-shrink-0 cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed">{children}</span>
    </label>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div className="mb-5">
      {label && <p className="text-sm font-semibold text-gray-700 mb-2.5">{label}</p>}
      <div className="flex flex-col gap-2.5">
        {options.map(opt => (
          <label key={opt.value} className={clsx(
            'flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
            value === opt.value ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-warm-200 bg-white hover:border-brand-300 hover:bg-warm-50'
          )}>
            <input type="radio" name={label} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="flex-shrink-0" />
            <div>
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
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
      {label && <p className="text-sm font-semibold text-gray-700 mb-2.5">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
            className={clsx(
              'px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-150',
              values.includes(opt.value)
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-gray-700 border-warm-300 hover:border-brand-400 hover:bg-warm-50'
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
    <div className="mb-6">
      {icon && <div className="text-4xl mb-2">{icon}</div>}
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {sub && <p className="text-sm text-warm-500 mt-1.5 leading-relaxed">{sub}</p>}
    </div>
  );
}