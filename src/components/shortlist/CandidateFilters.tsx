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
  isVisible: boolean;
}

/**
 * Candidate filters component
 * Provides filtering options for skills, experience, and education
 */
const CandidateFilters = ({ roleFilters, onFilterChange, isVisible }: I_CandidateFiltersProps) => {

  // make a generic function to handle all the above three functions
  const handleFilterChange = useCallback((filterType: 'skills' | 'experience' | 'education', value: string[]) => {
    onFilterChange({ ...roleFilters, [filterType]: value });
  }, [roleFilters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    onFilterChange({ skills: [], education: [], experience: [] });
  }, [onFilterChange]);

  const totalFiltersCount = roleFilters.skills.length + roleFilters.experience.length + roleFilters.education.length;

  if (!isVisible) return null;

  const filters = {
    skills: { label: 'Skills', keywords: roleFilters.skills, onKeywordsChange: (keywords: string[]) => handleFilterChange('skills', keywords), placeholder: 'e.g., React, Python, JavaScript', inputClassName: 'border-blue-200 focus:border-blue-500' },
    experience: { label: 'Experience', keywords: roleFilters.experience, onKeywordsChange: (keywords: string[]) => handleFilterChange('experience', keywords), placeholder: 'e.g., Senior, Lead, Manager', inputClassName: 'border-green-200 focus:border-green-500' },
    education: { label: 'Education', keywords: roleFilters.education, onKeywordsChange: (keywords: string[]) => handleFilterChange('education', keywords), placeholder: 'e.g., Computer Science, Engineering', inputClassName: 'border-purple-200 focus:border-purple-500' },
  };

  const renderFilters = (filters: { [key: string]: { label: string; keywords: string[]; onKeywordsChange: (keywords: string[]) => void; placeholder: string; inputClassName: string } }) => {
    return Object.entries(filters).map(([key, value]) => {
      return <KeywordInput key={key} label={value.label} keywords={value.keywords} onKeywordsChange={value.onKeywordsChange} placeholder={value.placeholder} inputClassName={value.inputClassName} />
    });
  };



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
      {renderFilters(filters)}
      
    </div>
  );
}

export default CandidateFilters