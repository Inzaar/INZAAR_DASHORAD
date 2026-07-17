import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';

function PhoneInput({ value, onChange, name }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Pakistan',
    flag: 'https://flagcdn.com/w320/pk.png',
    code: '+92',
    cca2: 'PK'
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Parse initial value if exists (e.g. "+923001234567")
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(true);

  const fetchCountries = async () => {
    if (countries.length > 0) return;
    setIsLoading(true);
    
    // Using a reliable hardcoded list instead of a deprecated external API
    const defaultCountries = [
      { name: 'Pakistan', flag: 'https://flagcdn.com/w320/pk.png', code: '+92', cca2: 'PK' },
      { name: 'India', flag: 'https://flagcdn.com/w320/in.png', code: '+91', cca2: 'IN' },
      { name: 'United States', flag: 'https://flagcdn.com/w320/us.png', code: '+1', cca2: 'US' },
      { name: 'United Kingdom', flag: 'https://flagcdn.com/w320/gb.png', code: '+44', cca2: 'GB' },
      { name: 'Canada', flag: 'https://flagcdn.com/w320/ca.png', code: '+1', cca2: 'CA' },
      { name: 'Australia', flag: 'https://flagcdn.com/w320/au.png', code: '+61', cca2: 'AU' },
      { name: 'Germany', flag: 'https://flagcdn.com/w320/de.png', code: '+49', cca2: 'DE' },
      { name: 'France', flag: 'https://flagcdn.com/w320/fr.png', code: '+33', cca2: 'FR' },
      { name: 'United Arab Emirates', flag: 'https://flagcdn.com/w320/ae.png', code: '+971', cca2: 'AE' },
      { name: 'Saudi Arabia', flag: 'https://flagcdn.com/w320/sa.png', code: '+966', cca2: 'SA' },
      { name: 'Bangladesh', flag: 'https://flagcdn.com/w320/bd.png', code: '+880', cca2: 'BD' },
      { name: 'Malaysia', flag: 'https://flagcdn.com/w320/my.png', code: '+60', cca2: 'MY' },
      { name: 'Singapore', flag: 'https://flagcdn.com/w320/sg.png', code: '+65', cca2: 'SG' },
      { name: 'South Africa', flag: 'https://flagcdn.com/w320/za.png', code: '+27', cca2: 'ZA' },
      { name: 'New Zealand', flag: 'https://flagcdn.com/w320/nz.png', code: '+64', cca2: 'NZ' },
      { name: 'Turkey', flag: 'https://flagcdn.com/w320/tr.png', code: '+90', cca2: 'TR' },
      { name: 'Egypt', flag: 'https://flagcdn.com/w320/eg.png', code: '+20', cca2: 'EG' },
      { name: 'Qatar', flag: 'https://flagcdn.com/w320/qa.png', code: '+974', cca2: 'QA' },
      { name: 'Oman', flag: 'https://flagcdn.com/w320/om.png', code: '+968', cca2: 'OM' },
      { name: 'Kuwait', flag: 'https://flagcdn.com/w320/kw.png', code: '+965', cca2: 'KW' },
      { name: 'Bahrain', flag: 'https://flagcdn.com/w320/bh.png', code: '+973', cca2: 'BH' },
      { name: 'Nigeria', flag: 'https://flagcdn.com/w320/ng.png', code: '+234', cca2: 'NG' },
      { name: 'Kenya', flag: 'https://flagcdn.com/w320/ke.png', code: '+254', cca2: 'KE' }
    ].sort((a, b) => a.name.localeCompare(b.name));

    // Simulate slight delay for UI feedback
    setTimeout(() => {
      setCountries(defaultCountries);
      setIsLoading(false);
    }, 100);
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchCountries();
    }
    setIsOpen(!isOpen);
  };

  // Sync internal state with external value if needed
  useEffect(() => {
    if (value && value.startsWith('+')) {
      // Find matching country code if possible
      // This is complex because codes vary in length (+1, +92, +971)
      // For now, let's just assume we start with Pakistan or the user picks.
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    
    const formatter = new AsYouType(country.cca2);
    const formattedValue = formatter.input(phoneNumber);
    setPhoneNumber(formattedValue);
    
    let valid = true;
    if (formattedValue.length > 0) {
      valid = isValidPhoneNumber(formattedValue, country.cca2);
    }
    setIsValid(valid);

    const rawValue = formattedValue.replace(/\D/g, '');
    const finalNumber = country.code + rawValue;
    onChange({ target: { name, value: finalNumber } });
  };

  const handlePhoneChange = (e) => {
    const formatter = new AsYouType(selectedCountry.cca2);
    const formattedValue = formatter.input(e.target.value);
    
    setPhoneNumber(formattedValue);
    
    let valid = true;
    if (formattedValue.length > 0) {
      valid = isValidPhoneNumber(formattedValue, selectedCountry.cca2);
    }
    setIsValid(valid);

    const rawValue = formattedValue.replace(/\D/g, '');
    const finalNumber = selectedCountry.code + rawValue;
    onChange({ target: { name, value: finalNumber } });
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.includes(searchTerm)
  );

  return (
    <div className='max-w-[500px] w-full mt-[10px] relative pb-5'>
      <label className='text-[16px] text-[#18181B] mb-1 block'>Phone number</label>
      <div className={`flex items-center w-full h-[52px] border rounded transition-all duration-200 focus-within:ring-1 ${
        !isValid && phoneNumber.length > 0 
          ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' 
          : 'border-[#71717A]/30 focus-within:border-[#71717A] focus-within:ring-[#71717A]'
      }`}>
        
        {/* Flag Selector */}
        <div className='relative h-full' ref={dropdownRef}>
          <button 
            type="button"
            onClick={toggleDropdown}
            className='flex items-center gap-2 h-full px-3 border-r border-[#71717A]/20 hover:bg-gray-50 transition-colors rounded-l'
          >
            <img src={selectedCountry.flag} alt={selectedCountry.cca2} className='w-6 h-4 object-cover rounded-sm' />
            <span className='text-[14px] text-[#71717A] font-medium'>{selectedCountry.code}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className='absolute top-full left-0 mt-1 w-[250px] max-h-[300px] bg-white border border-gray-200 rounded shadow-lg z-[9999] overflow-hidden flex flex-col'>
              <div className='p-2 border-b border-gray-100'>
                <input 
                  type="text" 
                  placeholder="Search country..." 
                  className='w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-[#71717A]'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className='overflow-y-auto'>
                {isLoading ? (
                  <div className='p-3 text-sm text-gray-500 text-center'>Loading countries...</div>
                ) : filteredCountries.length === 0 ? (
                  <div className='p-3 text-sm text-gray-500 text-center'>No countries found</div>
                ) : (
                  filteredCountries.map((country, idx) => (
                    <button
                      key={`${country.cca2}-${idx}`}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className='w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors'
                    >
                      <img src={country.flag} alt={country.cca2} className='w-5 h-3 object-cover rounded-sm' />
                      <span className='text-sm text-gray-700 flex-1'>{country.name}</span>
                      <span className='text-xs text-gray-400'>{country.code}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Number Input */}
        <input 
          type="tel" 
          placeholder='enter phone number' 
          className='flex-1 h-full outline-none text-[#71717A] text-[14px] px-3 bg-transparent'
          value={phoneNumber}
          onChange={handlePhoneChange}
        />
      </div>
      {!isValid && phoneNumber.length > 0 && (
        <span className='text-xs text-red-500 absolute bottom-0 left-0'>Invalid phone number for {selectedCountry.name}</span>
      )}
    </div>
  )
}

export default PhoneInput