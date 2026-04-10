import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

function PhoneInput({ value, onChange, name }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Pakistan',
    flag: 'https://flagcdn.com/w320/pk.png',
    code: '+92',
    cca2: 'PK'
  });
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Parse initial value if exists (e.g. "+923001234567")
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Fetch countries data
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2');
        const data = await response.json();
        
        const formattedCountries = data.map(country => {
          let dialCode = '';
          if (country.idd.root) {
            dialCode = country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '');
          }
          return {
            name: country.name.common,
            flag: country.flags.png || country.flags.svg,
            code: dialCode,
            cca2: country.cca2
          };
        }).filter(c => c.code) // only countries with dial codes
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

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
    // Notify parent of the change with new combined value
    const finalNumber = country.code + phoneNumber;
    onChange({ target: { name, value: finalNumber } });
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // only digits
    // Remove leading 0 if present (common in many countries like Pakistan)
    const processedValue = rawValue.startsWith('0') ? rawValue.substring(1) : rawValue;
    
    setPhoneNumber(processedValue);
    
    // Notify parent
    const finalNumber = selectedCountry.code + processedValue;
    onChange({ target: { name, value: finalNumber } });
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.includes(searchTerm)
  );

  return (
    <div className='max-w-[500px] w-full mt-[10px] relative'>
      <label className='text-[16px] text-[#18181B] mb-1 block'>Phone number</label>
      <div className='flex items-center w-full h-[52px] border border-[#71717A]/30 rounded transition-all duration-200 focus-within:border-[#71717A] focus-within:ring-1 focus-within:ring-[#71717A]'>
        
        {/* Flag Selector */}
        <div className='relative h-full' ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
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
                {filteredCountries.map((country, idx) => (
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
                ))}
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
    </div>
  )
}

export default PhoneInput