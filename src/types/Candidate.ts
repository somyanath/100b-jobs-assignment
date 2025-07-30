// Core candidate data interfaces based on candidatesData.json structure

/**
 * Work experience entry for a candidate
 */
export interface I_WorkExperience {
  company: string;
  roleName: string;
}

/**
 * Educational degree information
 */
export interface I_Degree {
  degree: string;
  subject: string;
  school: string;
  gpa: string;
  startDate: string;
  endDate: string;
  originalSchool: string;
  isTop50: boolean;
  isTop25?: boolean; // Optional field present in some records
}

/**
 * Complete education profile
 */
export interface I_Education {
  highest_level: string;
  degrees: I_Degree[];
}

/**
 * Salary expectations by work type
 */
export interface I_SalaryExpectation {
  'full-time'?: string;
  'part-time'?: string;
}

/**
 * Base candidate type matching the JSON data structure
 */
export interface I_Candidate {
  name: string;
  email: string;
  phone: string;
  location: string;
  submitted_at: string;
  work_availability: string[];
  annual_salary_expectation: Record<string, string>;
  work_experiences: I_WorkExperience[];
  education: I_Education;
  skills: string[];
}

/**
 * Filter state for candidate search and filtering
 */
export interface I_FilterState {
  search: string;
  workAvailability: string;
  selectedRoles: string[];
  selectedDegrees: string[];
  selectedSkills: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
}

/**
 * Sorting configuration
 */
export interface I_SortState {
  field: keyof I_Candidate | 'score';
  direction: 'asc' | 'desc';
}

/**
 * Pagination state
 */
export interface I_PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

/**
 * Enhanced candidate with calculated fields and scoring
 */
export interface I_CandidateWithScore extends I_Candidate {
  id: string; // Generated unique identifier
  score?: number; // Calculated skill score
  skillScore?: number; // Weighted scoring algorithm result
  skillMatchPercentage?: number; // Skill match percentage
  experienceMatchPercentage?: number; // Experience match percentage
  educationMatchPercentage?: number; // Education match percentage
  educationWeight?: number; // Education weight percentage
  currentRole?: string; // Most recent role
  currentCompany?: string; // Most recent company
  highestEducation?: string; // Highest degree
}

/**
 * Team role definition
 */
export interface I_TeamRole {
  id: string;
  title: string;
  requiredSkills: string[];
  salaryBudget?: number;
  educationRequirements: string[];
  candidate?: I_CandidateWithScore;
}

/**
 * Complete team structure
 */
export interface I_Team {
  id: string;
  name: string;
  size: number;
  roles: I_TeamRole[];
  createdAt: string;
  updatedAt: string;
}

// Utility types for better type safety
export type T_WorkAvailability = 'full-time' | 'part-time';