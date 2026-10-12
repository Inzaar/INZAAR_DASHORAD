export const PREDEFINED_QUALIFICATIONS = [
  "Matriculation / O-Levels",
  "Intermediate / A-Levels / FA / FSc",
  "Bachelor's / BS / Graduation",
  "Master's / MS / MPhil",
  "PhD / Doctorate",
  "Diploma / DAE",
  "Darse-Nizami / Religious Qualification",
  "Undergraduate / Studying",
];

export const ALL_QUALIFICATION_OPTIONS = [
  ...PREDEFINED_QUALIFICATIONS,
  "Other",
];

/**
 * Parses an existing qualification string from DB or state.
 * If the value matches one of the predefined qualifications, it is selected directly.
 * If the value is non-empty and NOT in the predefined list, "Other" is selected,
 * and the custom field is populated with that value.
 * If the value is "Other", "Other" is selected with an empty custom field.
 * If empty or null, placeholder (empty string) is selected.
 */
export const parseQualification = (rawVal) => {
  if (!rawVal || !String(rawVal).trim()) {
    return { selected: "", custom: "" };
  }
  const trimmed = String(rawVal).trim();
  if (PREDEFINED_QUALIFICATIONS.includes(trimmed)) {
    return { selected: trimmed, custom: "" };
  }
  if (trimmed === "Other") {
    return { selected: "Other", custom: "" };
  }
  return { selected: "Other", custom: trimmed };
};
