import { useState, useRef, useEffect } from 'react';

export default function MultiSelect({ options, value = [], onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const toggle = (val) => {
    const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val];
    onChange(next);
  };

  const labelByValue = new Map(options.map((opt) => [opt.value, opt.label]));
  const display = value.length
    ? value.map((v) => labelByValue.get(v) || v).join(', ')
    : placeholder;

  return (
    <div className="custom-multiselect" ref={ref}>
      <div className="multiselect-select-box" onClick={() => setOpen(!open)}>
        <span className={value.length ? '' : 'placeholder-text'}>{display}</span>
        <span className="dropdown-arrow">▼</span>
      </div>
      {open && (
        <div className="multiselect-options-panel">
          {options.map((opt) => (
            <label key={opt.value} className="multiselect-option">
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
