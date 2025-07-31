import { useAppContext } from "@/hooks/useAppContext";
import CandidatesDataTable from "./CandidatesDataTable";
import type { I_RoleFilters } from "./CandidateFilters";
import type { I_CandidateWithScore } from "@/types/Candidate";
import { useCallback, useMemo } from "react";

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

  // Memoize filter criteria for stable dependencies
  const filterCriteria = useMemo(() => ({
    skills: roleFilters.skills.join(','),
    experience: roleFilters.experience.join(','),
    education: roleFilters.education.join(','),
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
      if (roleFilters.skills.length > 0) {
        const candidateSkills = candidate.skills?.map(skill => skill.toLowerCase()) || [];
        const hasMatchingSkill = roleFilters.skills.some(filterSkill => 
          candidateSkills.some(skill => skill.includes(filterSkill.toLowerCase()))
        );
        if (!hasMatchingSkill) return false;
      }

      // Experience filtering
      if (roleFilters.experience.length > 0) {
        const candidateExperience = candidate.work_experiences?.map(exp => 
          `${exp.roleName} ${exp.company}`.toLowerCase()
        ).join(' ') || '';
        const hasMatchingExperience = roleFilters.experience.some(filterExp => 
          candidateExperience.includes(filterExp.toLowerCase())
        );
        if (!hasMatchingExperience) return false;
      }

      // Education filtering
      if (roleFilters.education.length > 0) {
        const candidateEducation = candidate.education?.degrees?.map(degree => 
          `${degree.degree} ${degree.subject}`.toLowerCase()
        ).join(' ') || '';
        const hasMatchingEducation = roleFilters.education.some(filterEdu => 
          candidateEducation.includes(filterEdu.toLowerCase())
        );
        if (!hasMatchingEducation) return false;
      }

      return true;
    });
  }, [candidates, filterCriteria]);

  const handleCandidateSelect = useCallback((candidate: I_CandidateWithScore) => {
    onCandidateSelect(candidate);
  }, [onCandidateSelect]);

  const handleViewDetails = useCallback((candidate: I_CandidateWithScore) => {
    onCandidateViewDetails(candidate);
  }, [onCandidateViewDetails]);

  // Computed values
  const activeFiltersCount = roleFilters.skills.length + roleFilters.experience.length + roleFilters.education.length;
  const hasActiveFilters = activeFiltersCount > 0;

  // Filter summary text
  const filterSummaryText = useMemo(() => {
    if (!hasActiveFilters) {
      return `Showing all ${filteredCandidates.length} candidates (no filters applied)`;
    }
    
    const filterParts = [];
    if (roleFilters.skills.length > 0) filterParts.push(`${roleFilters.skills.length} skills`);
    if (roleFilters.experience.length > 0) filterParts.push(`${roleFilters.experience.length} experience`);
    if (roleFilters.education.length > 0) filterParts.push(`${roleFilters.education.length} education`);
    
    return `Showing ${filteredCandidates.length} candidates matching ${activeFiltersCount} filter criteria`;
  }, [hasActiveFilters, activeFiltersCount, roleFilters, filteredCandidates.length]);
  
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
              {roleFilters.skills.length > 0 && `${roleFilters.skills.length} skills`}
              {roleFilters.skills.length > 0 && (roleFilters.experience.length > 0 || roleFilters.education.length > 0) && ', '}
              {roleFilters.experience.length > 0 && `${roleFilters.experience.length} experience`}
              {roleFilters.experience.length > 0 && roleFilters.education.length > 0 && ', '}
              {roleFilters.education.length > 0 && `${roleFilters.education.length} education`}
            </div>
          </div>
        )}
      </div>

      {/* Candidates DataTable */}
      <CandidatesDataTable
        candidates={filteredCandidates}
        onViewDetails={handleViewDetails}
        onSelectForTeam={handleCandidateSelect}
        showSelectButtons={showSelectButtons}
      />
    </div>
  );
}

export default CandidateSelectionArea