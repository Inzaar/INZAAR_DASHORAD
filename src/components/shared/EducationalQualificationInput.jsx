import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ALL_QUALIFICATION_OPTIONS, parseQualification } from "@/constants/educationalQualifications";

const EducationalQualificationInput = ({
  value = "",
  onChange,
  label = "Educational Qualification",
  required = false,
  labelClassName = "font-medium text-[14px]",
  selectClassName = "w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none bg-white",
  inputClassName = "w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none mt-2",
  containerClassName = "flex flex-col gap-[8px] w-full",
  name = "educationQualification",
  id,
  placeholder = "Select Educational Qualification",
  otherPlaceholder = "Specify your qualification",
  disabled = false,
}) => {
  const { t } = useTranslation();
  const selectId = id || (name ? `${name}-select` : "educational-qualification-select");

  const parsed = parseQualification(value);
  const [selectedOption, setSelectedOption] = useState(parsed.selected);
  const [customQualification, setCustomQualification] = useState(parsed.custom);

  // Keep track of the last value emitted via onChange to avoid resetting state while user is actively typing
  const lastEmittedValueRef = useRef(value);

  useEffect(() => {
    // Only re-parse if external value changed independently (e.g. initial fetch or form reset)
    if (value !== lastEmittedValueRef.current) {
      const p = parseQualification(value);
      setSelectedOption(p.selected);
      setCustomQualification(p.custom);
      lastEmittedValueRef.current = value;
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const newSelected = e.target.value;
    setSelectedOption(newSelected);

    let newVal = "";
    if (newSelected === "Other") {
      newVal = customQualification && customQualification.trim() ? customQualification : "Other";
    } else {
      newVal = newSelected;
    }

    lastEmittedValueRef.current = newVal;
    if (onChange) {
      onChange(newVal);
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomQualification(val);
    lastEmittedValueRef.current = val;
    if (onChange) {
      onChange(val);
    }
  };

  const resolvedValue =
    selectedOption === "Other"
      ? (customQualification && customQualification.trim() ? customQualification.trim() : "Other")
      : selectedOption;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={selectId} className={labelClassName}>
          {typeof label === "string" ? t(label, label) : label}
          {required && " *"}
        </label>
      )}

      <select
        id={selectId}
        value={selectedOption}
        onChange={handleSelectChange}
        disabled={disabled}
        className={selectClassName}
      >
        <option value="" disabled>
          {t("select_educational_qualification", placeholder)}
        </option>
        {ALL_QUALIFICATION_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {selectedOption === "Other" && (
        <input
          type="text"
          id={name ? `${name}-custom` : undefined}
          placeholder={t("specify_qualification", otherPlaceholder)}
          value={customQualification}
          onChange={handleCustomChange}
          disabled={disabled}
          className={inputClassName}
        />
      )}

      {name && (
        <input
          type="hidden"
          name={name}
          value={resolvedValue || ""}
        />
      )}
    </div>
  );
};

export default EducationalQualificationInput;
