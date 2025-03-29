// Years range for filtering (2017-2025)
export const YEARS = Array.from({ length: 9 }, (_, i) => 2025 - i);

// Subject options
export const SUBJECTS = ["math", "science", "arts", "social", "language"];

// Difficulty options
export const DIFFICULTIES = ["district", "regional", "state"];

// Subject map for displaying labels
export const SUBJECTS_MAP: Record<string, string> = {
  math: "Math",
  science: "Science",
  arts: "Arts and Humanities",
  social: "Social Studies",
  language: "Language Arts"
};

// Difficulty map for displaying labels
export const DIFFICULTY_MAP: Record<string, string> = {
  district: "District",
  regional: "Regional",
  state: "State"
};
