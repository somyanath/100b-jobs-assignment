import { useCallback } from "react";
import { Button } from "../ui/button";
import KeywordInput from "./KeywordInput";

export interface I_RoleFilters {
  skills: string[];
  education: string[];
  experience: string[];
}

interface I_CandidateFiltersProps {
  roleFilters: I_RoleFilters;
  onFilterChange: (filters: I_RoleFilters) => void;
}

/**
 * Candidate filters component
 * Provides filtering options for skills, experience, and education
 */
const CandidateFilters = ({ roleFilters, onFilterChange }: I_CandidateFiltersProps) => {

  // make a generic function to handle all the above three functions
  const handleFilterChange = useCallback((filterType: 'skills' | 'experience' | 'education', value: string[]) => {
    onFilterChange({ ...roleFilters, [filterType]: value });
  }, [roleFilters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    onFilterChange({ skills: [], education: [], experience: [] });
  }, [onFilterChange]);

  const totalFiltersCount = roleFilters.skills.length + roleFilters.experience.length + roleFilters.education.length;

  return (
    <div className="w-full">
      {/* Header with Clear All Button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Candidate Filters</h3>
          <p className="text-xs text-gray-600 mt-1">
            Add keywords to filter candidates
          </p>
        </div>
        {totalFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
          >
            Clear All ({totalFiltersCount})
          </Button>
        )}
      </div>

      {/* Skills Filter */}
      <KeywordInput
        label="Skills"
        keywords={roleFilters.skills}
        onKeywordsChange={(keywords) => handleFilterChange('skills', keywords)}
        placeholder="e.g., React, Python, JavaScript"
        inputClassName="border-blue-200 focus:border-blue-500"
      />

      {/* Experience Filter */}
      <KeywordInput
        label="Experience"
        keywords={roleFilters.experience}
        onKeywordsChange={(keywords) => handleFilterChange('experience', keywords)}
        placeholder="e.g., Senior, Lead, Manager"
        inputClassName="border-green-200 focus:border-green-500"
      />

      {/* Education Filter */}
      <KeywordInput
        label="Education"
        keywords={roleFilters.education}
        onKeywordsChange={(keywords) => handleFilterChange('education', keywords)}
        placeholder="e.g., Computer Science, Engineering"
        inputClassName="border-purple-200 focus:border-purple-500"
      />
    </div>
  );
}

export default CandidateFilters