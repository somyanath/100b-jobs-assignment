import { useAppContext } from "@/hooks/useAppContext";
import CandidatesDataTable from "./CandidatesDataTable";
import type { I_RoleFilters } from "./CandidateFilters";
import type { I_CandidateWithScore } from "@/types/Candidate";
import { useCallback, useMemo } from "react";
import { useCandidateScoreCache } from "@/hooks/useCandidateScoreCache";
import { useProgressiveLoading } from "@/hooks/useProgressiveLoading";

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
  const { getScoredCandidates } = useCandidateScoreCache();

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
  }, [candidates, roleFilters, selectedCandidates, activeRoleIndex]);

  const filteredCandidatesWithScores = useMemo(() => {
    const scoredCandidates = getScoredCandidates(filteredCandidates, roleFilters);
    return scoredCandidates.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [filteredCandidates, roleFilters, getScoredCandidates]);

  const { loadedData: displayCandidates, isLoading: isProgressiveLoading } = useProgressiveLoading(filteredCandidatesWithScores, 25);

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
      return `${filteredCandidatesWithScores.length} candidates (please apply filters to get weighted scores based results and filter out candidates)`;
    }
    
    const filterParts = [];
    if (roleFilters.skills.length > 0) filterParts.push(`${roleFilters.skills.length} skills`);
    if (roleFilters.experience.length > 0) filterParts.push(`${roleFilters.experience.length} experience`);
    if (roleFilters.education.length > 0) filterParts.push(`${roleFilters.education.length} education`);
    
    return `${filteredCandidatesWithScores.length} candidates matching ${activeFiltersCount} filter criteria`;
  }, [hasActiveFilters, activeFiltersCount, roleFilters, filteredCandidatesWithScores.length]);
  
  return (
    <div className="space-y-4">
      {/* Header with filter info */}
      <div className="flex justify-between items-center">
      <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Ranked Candidates
            </h3>
            {/* Circular Progress Loader - Only show when loading */}
            {isProgressiveLoading && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="text-xs text-gray-400">
                  Loading candidates...
                </span>
              </div>
            )}
          </div>
          <div>
            <p className={`text-sm font-semibold ${hasActiveFilters ? 'text-blue-600' : 'text-red-500'}`}>
              {filterSummaryText}
            </p>
          </div>
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
        candidates={displayCandidates}
        onViewDetails={handleViewDetails}
        onSelectForTeam={handleCandidateSelect}
        showSelectButtons={showSelectButtons}
      />
    </div>
  );
}

export default CandidateSelectionArea