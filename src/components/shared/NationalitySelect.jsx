import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COUNTRIES } from '@/constants/countries';

const NationalitySelect = ({
  value = '',
  onChange,
  name = 'Nationality',
  label,
  required = false,
  placeholder,
  className = '',
  containerClassName = 'w-full',
  labelClassName = 'text-[#18181B] text-[16px]',
  disabled = false,
  error = false,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const isNA =
    !value ||
    ['n/a', 'na', 'none', 'null', 'undefined', 'choose', 'select nationality'].includes(
      String(value).trim().toLowerCase()
    );
  const displayValue = isNA ? '' : String(value).trim();

  const displayPlaceholder = placeholder || t('select_nationality', 'Select Nationality');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter countries by search term
  const filteredCountries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleSelectCountry = (country) => {
    if (disabled) return;
    setIsOpen(false);
    setSearchTerm('');
    if (onChange) {
      // Support both React standard event pattern and direct value pattern
      const syntheticEvent = {
        target: {
          name,
          value: country,
        },
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`relative ${containerClassName}`} ref={dropdownRef}>
      {label && (
        <label className={`${labelClassName} mb-1 block`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearchTerm('');
          }
        }}
        className={`w-full h-[52px] border ${
          error
            ? 'border-red-500'
            : isOpen
            ? 'border-[#71717A] ring-1 ring-[#71717A]/20'
            : 'border-[#E4E4E7]'
        } outline-none rounded-md px-3 bg-white flex items-center justify-between text-left transition-all ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-[#71717A]/60'
        } ${className}`}
      >
        <span
          className={`text-[14px] truncate ${
            displayValue ? 'text-[#18181B] font-medium' : 'text-[#71717A]'
          }`}
        >
          {displayValue || displayPlaceholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#71717A] transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-[#18181B]' : ''
          }`}
        />
      </button>

      {/* Hidden input for form data serialization */}
      <input type="hidden" name={name} value={displayValue || ''} />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full max-h-[240px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="relative p-2 border-b border-gray-100 bg-gray-50/60">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('search_nationality', 'Search nationality...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg outline-none focus:border-[#71717A] text-[#18181B] placeholder:text-gray-400"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Scrollable Countries List */}
          <div className="overflow-y-auto max-h-[180px] py-1 divide-y divide-gray-50/50">
            {/* Top option: Select Nationality (placeholder / clear selection) */}
            {!searchTerm && (
              <button
                type="button"
                onClick={() => handleSelectCountry('')}
                className={`w-full px-3.5 py-2 text-left text-[13px] flex items-center justify-between transition-colors ${
                  !displayValue
                    ? 'bg-blue-50/80 text-blue-600 font-semibold'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <span>{displayPlaceholder}</span>
                {!displayValue && <Check size={14} className="text-blue-600 flex-shrink-0" />}
              </button>
            )}

            {/* If custom existing value not in COUNTRIES, show it on top */}
            {displayValue && !COUNTRIES.includes(displayValue) && (
              <button
                type="button"
                onClick={() => handleSelectCountry(displayValue)}
                className="w-full px-3.5 py-2 text-left text-[13px] flex items-center justify-between bg-blue-50/80 text-blue-600 font-medium hover:bg-blue-100/70 transition-colors"
              >
                <span>{displayValue}</span>
                <Check size={14} className="text-blue-600" />
              </button>
            )}

            {filteredCountries.length === 0 ? (
              <div className="py-4 text-center text-[13px] text-gray-400">
                {t('no_country_found', 'No nationality found')}
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = displayValue === country;
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`w-full px-3.5 py-2 text-left text-[13px] flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{country}</span>
                    {isSelected && <Check size={14} className="text-blue-600 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalitySelect;
