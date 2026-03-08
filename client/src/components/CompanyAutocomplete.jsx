import React, { useState } from 'react';

const CompanyAutocomplete = ({ value, onSelect, placeholder, section }) => {
  const [input, setInput] = useState(value.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInput = async (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.length > 1) {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies/search?q=${encodeURIComponent(val)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setSuggestions(data.companies || []);
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (company) => {
    setInput(company.name);
    setSuggestions([]);
    onSelect(company, section);
  };

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={input}
        onChange={handleInput}
        placeholder={placeholder}
        autoComplete="off"
        className="form-input"
      />
      {loading && <div className="autocomplete-loading">Searching...</div>}
      {suggestions.length > 0 && (
        <div className="autocomplete-list">
          {suggestions.map(comp => (
            <div key={comp._id} className="autocomplete-item" onClick={() => handleSelect(comp)}>
              {comp.name} <span className="autocomplete-id">({comp.companyId || 'No ID'})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyAutocomplete;
