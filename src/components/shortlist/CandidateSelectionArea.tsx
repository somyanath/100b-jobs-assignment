import { useAppContext } from "@/hooks/useAppContext";
import CandidatesDataTable from "./CandidatesDataTable";
import type { I_RoleFilters } from "./CandidateFilters";
import type { I_CandidateWithScore } from "@/types/Candidate";
import { useCallback, useMemo } from "react";
import { useCandidateScoreCache } from "@/hooks/useCandidateScoreCache";

interface I_CandidateSelectionAreaProps {
  roleFilters: I_RoleFilters;
  onCandidateSelect: (candidate: I_CandidateWithScore) => void;
  onCandidateViewDetails: (candidate: I_CandidateWithScore) => void;
  showSelectButtons?: boolean;
  selectedCandidates?: I_CandidateWithScore[];
  activeRoleIndex?: number;
}

/**
 * Candidate selection area component
 * Handles filtering, scoring, and displaying candidates for a given role
 */
const CandidateSelectionArea = ({ 
  roleFilters,
  onCandidateSelect,
  onCandidateViewDetails,
  showSelectButtons = true,
  selectedCandidates = [],
  activeRoleIndex = -1
}: I_CandidateSelectionAreaProps) => {
  const { candidates } = useAppContext();
  const { getCachedScores } = useCandidateScoreCache();

  // Memoize filter criteria for stable dependencies
  const filterCriteria = useMemo(() => ({
    skills: roleFilters.skills,
    experience: roleFilters.experience,
    education: roleFilters.education,
    selectedIds: selectedCandidates.filter(c => c !== null).map(c => c.id).join(','),
    activeRoleIndex
  }), [roleFilters, selectedCandidates, activeRoleIndex]);

  // Filter candidates based on role filters
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Filter out already selected candidates (unless they are the one being replaced)
      const isSelected = selectedCandidates.some(selected => selected !== null && selected.id === candidate.id);
      const isBeingReplaced = activeRoleIndex >= 0 && selectedCandidates[activeRoleIndex] !== null && selectedCandidates[activeRoleIndex]?.id === candidate.id;
      
      if (isSelected && !isBeingReplaced) {
        return false;
      }

      // Skills filtering
      if (filterCriteria.skills.length > 0) {
        const candidateSkills = candidate.skills?.map(skill => skill.toLowerCase()) || [];
        const hasMatchingSkill = filterCriteria.skills.some(filterSkill => 
          candidateSkills.some(skill => skill.includes(filterSkill.toLowerCase()))
        );
        if (!hasMatchingSkill) return false;
      }

      // Experience filtering
      if (filterCriteria.experience.length > 0) {
        const candidateExperience = candidate.work_experiences?.map(exp => 
          `${exp.roleName} ${exp.company}`.toLowerCase()
        ).join(' ') || '';
        const hasMatchingExperience = filterCriteria.experience.some(filterExp => 
          candidateExperience.includes(filterExp.toLowerCase())
        );
        if (!hasMatchingExperience) return false;
      }

      // Education filtering
      if (filterCriteria.education.length > 0) {
        const candidateEducation = candidate.education?.degrees?.map(degree => 
          `${degree.degree} ${degree.subject}`.toLowerCase()
        ).join(' ') || '';
        const hasMatchingEducation = filterCriteria.education.some(filterEdu => 
          candidateEducation.includes(filterEdu.toLowerCase())
        );
        if (!hasMatchingEducation) return false;
      }

      return true;
    });
  }, [activeRoleIndex, filterCriteria.education, filterCriteria.experience, filterCriteria.skills, selectedCandidates]);

  const filteredCandidatesWithScores = useMemo(() => {
    return getCachedScores(filteredCandidates, filterCriteria);
  }, [filteredCandidates, filterCriteria, getCachedScores]);

  const handleCandidateSelect = useCallback((candidate: I_CandidateWithScore) => {
    onCandidateSelect(candidate);
  }, [onCandidateSelect]);

  const handleViewDetails = useCallback((candidate: I_CandidateWithScore) => {
    onCandidateViewDetails(candidate);
  }, [onCandidateViewDetails]);

  // Computed values
  const activeFiltersCount = filterCriteria.skills.length + filterCriteria.experience.length + filterCriteria.education.length;
  const hasActiveFilters = activeFiltersCount > 0;

  // Filter summary text
  const filterSummaryText = useMemo(() => {
    if (!hasActiveFilters) {
      return `Showing all ${filteredCandidatesWithScores.length} candidates (no filters applied)`;
    }
    
    const filterParts = [];
    if (filterCriteria.skills.length > 0) filterParts.push(`${filterCriteria.skills.length} skills`);
    if (filterCriteria.experience.length > 0) filterParts.push(`${filterCriteria.experience.length} experience`);
    if (filterCriteria.education.length > 0) filterParts.push(`${filterCriteria.education.length} education`);
    
    return `Showing ${filteredCandidatesWithScores.length} candidates matching ${activeFiltersCount} filter criteria`;
  }, [hasActiveFilters, activeFiltersCount, filterCriteria, filteredCandidatesWithScores.length]);
  
  return (
    <div className="space-y-4">
      {/* Header with filter info */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ranked Candidates
          </h3>
          <p className="text-sm text-gray-600">
            {filterSummaryText}
          </p>
        </div>
        
        {hasActiveFilters && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Active filters:</div>
            <div className="text-xs text-blue-600">
              {filterCriteria.skills.length > 0 && `${filterCriteria.skills.length} skills`}
              {filterCriteria.skills.length > 0 && (filterCriteria.experience.length > 0 || filterCriteria.education.length > 0) && ', '}
              {filterCriteria.experience.length > 0 && `${filterCriteria.experience.length} experience`}
              {filterCriteria.experience.length > 0 && filterCriteria.education.length > 0 && ', '}
              {filterCriteria.education.length > 0 && `${filterCriteria.education.length} education`}
            </div>
          </div>
        )}
      </div>

      {/* Candidates DataTable */}
      <CandidatesDataTable
        candidates={filteredCandidatesWithScores}
        onViewDetails={handleViewDetails}
        onSelectForTeam={handleCandidateSelect}
        showSelectButtons={showSelectButtons}
      />
    </div>
  );
}

export default CandidateSelectionArea