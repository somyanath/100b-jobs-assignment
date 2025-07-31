import { useAppContext } from "@/hooks/useAppContext";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import RoleSlotPanel from "./RoleSlotPanel";
import CandidateFilters, { type I_RoleFilters } from "./CandidateFilters";
import CandidateSelectionArea from "./CandidateSelectionArea";
import type { I_CandidateWithScore } from "@/types/Candidate";
import TeamSizeModal from "./TeamSizeModal";

interface I_TeamBuilderProps {
  onCandidateViewDetails: (candidate: I_CandidateWithScore) => void;
  onReviewTeam?: () => void;
}

/**
 * Main team building component
 * Manages role selection, candidate filtering, and team assembly
 */
const TeamBuilder = ({ onCandidateViewDetails, onReviewTeam }: I_TeamBuilderProps) => {
  const { 
    shortlistedTeam,
    teamSize,
    setShortlistedTeam,
    replaceInShortlist,
    setTeamSize
  } = useAppContext();
  
  const [activeRoleIndex, setActiveRoleIndex] = useState<number>(-1);
  const [showChangeTeamSizeModal, setShowChangeTeamSizeModal] = useState<boolean>(false);
  const [shouldAutoProgress, setShouldAutoProgress] = useState(false);
  const [lastSelectedCandidate, setLastSelectedCandidate] = useState<I_CandidateWithScore | null>(null);
  const [roleFilters, setRoleFilters] = useState<I_RoleFilters>({
    skills: [],
    education: [],
    experience: []
  });

  // Initialize active role index
  useEffect(() => {
    const firstEmptyRoleIndex = shortlistedTeam.length < teamSize ? shortlistedTeam.length : -1;
    setActiveRoleIndex(firstEmptyRoleIndex);
  }, [shortlistedTeam.length, teamSize]);

  const findNextEmptyRoleIndex = useCallback((team: I_CandidateWithScore[]) => {
    for (let i = 0; i < teamSize; i++) {
      if (team[i] === null || team[i] === undefined) {
        return i;
      }
    }
    return -1; // No empty roles found
  }, [teamSize]);

  // Event handlers
  const handleCandidateSelect = useCallback((candidate: I_CandidateWithScore) => {
    if (activeRoleIndex < 0) return;
  
    // Check if candidate is already selected for another role
    const isAlreadySelected = shortlistedTeam.some((teamMember, index) => 
      teamMember !== null && teamMember.id === candidate.id && index !== activeRoleIndex
    );
    
    if (isAlreadySelected) return;

    const isReplacing = activeRoleIndex < shortlistedTeam.length && shortlistedTeam[activeRoleIndex] !== null;
    
    if (isReplacing) {
      replaceInShortlist(candidate, activeRoleIndex);
    } else {
      const newTeam = [...shortlistedTeam];
      while (newTeam.length <= activeRoleIndex) {
        newTeam.push(null as unknown as I_CandidateWithScore);
      }
      newTeam[activeRoleIndex] = candidate;
      setShortlistedTeam(newTeam);
    }
    
    // trigger auto-progression to next role
    setShouldAutoProgress(true);
    setLastSelectedCandidate(candidate);
  }, [activeRoleIndex, shortlistedTeam, replaceInShortlist, setShortlistedTeam]);

  // Auto-progress effect
  useEffect(() => {
    if (shouldAutoProgress && lastSelectedCandidate) {
      const updatedTeam = shortlistedTeam.map((member, index) => 
        index === activeRoleIndex ? lastSelectedCandidate : member
      );
      const nextEmptyRoleIndex = findNextEmptyRoleIndex(updatedTeam);
      setActiveRoleIndex(nextEmptyRoleIndex);
      setShouldAutoProgress(false);
      setLastSelectedCandidate(null);
    }
  }, [shouldAutoProgress, lastSelectedCandidate, shortlistedTeam, activeRoleIndex, findNextEmptyRoleIndex]);

  const handleFilterChange = useCallback((filters: I_RoleFilters) => {
    setRoleFilters(filters);
  }, []);

  const handleRoleSelect = useCallback((roleIndex: number) => {
    if (roleIndex < 0 || roleIndex >= teamSize) return;
    
    setActiveRoleIndex(roleIndex);
  }, [teamSize]);

  const handleChangeTeamSize = () => {
    setShowChangeTeamSizeModal(true);
  };

  const handleTeamSizeConfirm = (newSize: number) => {
    setTeamSize(newSize);
    setShowChangeTeamSizeModal(false);
  };

  const validSelectedCandidates = shortlistedTeam.filter(candidate => candidate !== null && candidate !== undefined).slice(0, teamSize);
  const filledRolesCount = validSelectedCandidates.length;
  const isTeamComplete = filledRolesCount === teamSize;
  const hasActiveRole = activeRoleIndex >= 0;
  const isReplacingRole = hasActiveRole && activeRoleIndex < shortlistedTeam.length && shortlistedTeam[activeRoleIndex] !== null;
  const showFilters = hasActiveRole;
  const showSelectButtons = !isTeamComplete || isReplacingRole;

  return (
    <div className="w-full min-h-screen max-w-full overflow-x-hidden">
      <div className="w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full max-w-full">
          {/* Left Panel - Team Builder Module */}
          <div className="lg:col-span-1 space-y-6 w-full">
            {/* Team Roles Section */}
            <div className="bg-white rounded-lg border shadow-sm w-full">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Team Builder
                  </h2>
                  <button
                    onClick={handleChangeTeamSize}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Size
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {filledRolesCount} of {teamSize} roles filled
                </p>
              </div>

              <div className="p-4">
                <RoleSlotPanel 
                  activeRoleIndex={activeRoleIndex}
                  onRoleSelect={handleRoleSelect}
                />
              </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="bg-white rounded-lg border shadow-sm w-full">
                <div className="p-4 border-b">
                  <h3 className="text-md font-medium text-gray-900">
                    Filters for: Role {activeRoleIndex + 1}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Role {activeRoleIndex + 1}
                  </p>
                </div>

                <div className="p-4">
                  <CandidateFilters 
                    roleFilters={roleFilters}
                    onFilterChange={handleFilterChange}
                    isVisible={showFilters}
                  />
                </div>
              </div>
            )}

            {/* Team Complete Message */}
            {isTeamComplete && !hasActiveRole && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      Team Complete!
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      All {teamSize} roles have been filled. Ready to review your team.
                    </p>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={onReviewTeam}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!onReviewTeam}
                    >
                      Review Team
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Candidates DataTable */}
          <div className="lg:col-span-3 w-full">
            <div className="bg-white rounded-lg border shadow-sm w-full">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activeRoleIndex >= 0 
                        ? `Candidates for Role ${activeRoleIndex + 1}`
                        : 'All Candidates'
                      }
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeRoleIndex >= 0 
                        ? (activeRoleIndex < validSelectedCandidates.length 
                            ? `Replacing candidate for Role ${activeRoleIndex + 1}` 
                            : `Selecting candidate for Role ${activeRoleIndex + 1}`
                          )
                        : 'All roles have been filled. You can review your team or make changes.'
                      }
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Click "Select" to add a candidate to your team
                  </div>
                </div>
              </div>

              <div className="p-4">
                <CandidateSelectionArea
                  roleFilters={roleFilters}
                  onCandidateSelect={handleCandidateSelect}
                  onCandidateViewDetails={onCandidateViewDetails}
                  showSelectButtons={showSelectButtons}
                  selectedCandidates={shortlistedTeam}
                  activeRoleIndex={activeRoleIndex}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Size Modal */}
        <TeamSizeModal
          isOpen={showChangeTeamSizeModal}
          onClose={() => setShowChangeTeamSizeModal(false)}
          onConfirm={handleTeamSizeConfirm}
          currentTeamSize={teamSize}
        />
      </div>
    </div>
  );
}

export default TeamBuilder