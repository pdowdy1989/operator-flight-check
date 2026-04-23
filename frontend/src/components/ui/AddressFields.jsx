import { useEffect, useRef, useState } from 'react';
import './AddressFields.css';

let nominatimTimer = 0;

async function searchNominatim(query) {
  const now = Date.now();
  const wait = 1100 - (now - nominatimTimer);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  nominatimTimer = Date.now();

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=us&q=${encodeURIComponent(query)}`
  );
  return res.json();
}

function buildCombined({ street, city, state, zip }) {
  const stateZip = [state.trim(), zip.trim()].filter(Boolean).join(' ');
  return [street.trim(), city.trim(), stateZip].filter(Boolean).join(', ');
}

function parseSuggestion(item) {
  const a = item.address ?? {};
  const street = [a.house_number, a.road].filter(Boolean).join(' ');
  const city = a.city || a.town || a.village || a.hamlet || a.county || '';
  const state = a.state || '';
  const zip = (a.postcode || '').split('-')[0];
  return { street, city, state, zip };
}

function parseDefaultValue(combined) {
  if (!combined) return { street: '', city: '', state: '', zip: '' };
  const segments = combined.split(',').map(s => s.trim()).filter(Boolean);
  const street = segments[0] || '';
  const city = segments[1] || '';
  const stateZip = segments[2] || '';
  const zipMatch = stateZip.match(/^(.+?)\s+(\d{5}(?:-\d{4})?)$/);
  return {
    street,
    city,
    state: zipMatch ? zipMatch[1] : stateZip,
    zip: zipMatch ? zipMatch[2].split('-')[0] : '',
  };
}

export default function AddressFields({ onChange, error, required = false, defaultValue = '' }) {
  const [parts, setParts] = useState(() => parseDefaultValue(defaultValue));
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    onChange(buildCombined(parts));
  }, [parts]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleStreetChange(e) {
    const val = e.target.value;
    setParts(p => ({ ...p, street: val }));
    clearTimeout(debounce.current);
    if (val.length < 5) { setSuggestions([]); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchNominatim(val);
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {}
      setLoading(false);
    }, 350);
  }

  function pick(item) {
    setParts(parseSuggestion(item));
    setSuggestions([]);
    setOpen(false);
  }

  function setPart(key) {
    return e => setParts(p => ({ ...p, [key]: e.target.value }));
  }

  return (
    <div className="addr-fields" ref={wrapRef}>
      <div className="addr-fields__street-wrap">
        <input
          className={`addr-fields__input addr-fields__input--full${error ? ' addr-fields__input--error' : ''}`}
          placeholder={`Street address${required ? ' *' : ''}`}
          value={parts.street}
          onChange={handleStreetChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="addr-fields__spinner" aria-hidden="true" />}
        {open && suggestions.length > 0 && (
          <ul className="addr-fields__suggestions" role="listbox">
            {suggestions.map(s => {
              const p = parseSuggestion(s);
              return (
                <li
                  key={s.place_id}
                  className="addr-fields__suggestion"
                  role="option"
                  onMouseDown={() => pick(s)}
                >
                  <span className="addr-fields__suggestion-main">
                    {p.street || s.display_name.split(',')[0]}
                  </span>
                  <span className="addr-fields__suggestion-sub">
                    {[p.city, p.state, p.zip].filter(Boolean).join(', ')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="addr-fields__row">
        <input
          className="addr-fields__input addr-fields__input--city"
          placeholder="City"
          value={parts.city}
          onChange={setPart('city')}
          autoComplete="off"
        />
        <input
          className="addr-fields__input addr-fields__input--state"
          placeholder="State"
          value={parts.state}
          onChange={setPart('state')}
          autoComplete="off"
          maxLength={30}
        />
        <input
          className="addr-fields__input addr-fields__input--zip"
          placeholder="ZIP"
          value={parts.zip}
          onChange={setPart('zip')}
          autoComplete="off"
          maxLength={10}
        />
      </div>

      {error && <p className="addr-fields__error">{error}</p>}
    </div>
  );
}
