import CandidateModal from "@/components/shortlist/CandidateModal";
import ProgressIndicator from "@/components/shortlist/ProgressIndicator";
import TeamBuilder from "@/components/shortlist/TeamBuilder";
import TeamReview from "@/components/shortlist/TeamReview";
import TeamSizeSetup from "@/components/shortlist/TeamSizeSetup";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/hooks/useAppContext";
import type { I_CandidateWithScore } from "@/types/Candidate";
import { useEffect, useState } from "react";

// Step enumeration for better type safety
const E_WorkflowStep = {
  EMPTY: 0,
  TEAM_SETUP: 1,
  BUILDING: 2,
  REVIEW: 3,
} as const;

type T_WorkflowStep = typeof E_WorkflowStep[keyof typeof E_WorkflowStep];


/**
 * Main team building workflow page
 * Manages the 4-step process: Empty → Setup → Building → Review
 */
const ShortlistPage = () => {
  const { 
    shortlistedTeam, 
    teamSize,
    loading,
    clearShortlist,
    storageAvailable,
    addToShortlist,
  } = useAppContext();
  
  const [step, setStep] = useState<T_WorkflowStep | -1>(-1);
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<I_CandidateWithScore | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize workflow step based on existing data
  useEffect(() => {
    if (loading || storageAvailable === undefined) {
      return;
    }
    
    let initialStep: T_WorkflowStep;
    
    if (shortlistedTeam.length > 0 && teamSize > 0) {
      initialStep = E_WorkflowStep.BUILDING;
    } else if (teamSize > 0) {
      initialStep = E_WorkflowStep.BUILDING;
    } else {
      initialStep = E_WorkflowStep.EMPTY;
    }
    
    setStep(initialStep);
    setIsInitializing(false);
  }, [loading, storageAvailable, teamSize, shortlistedTeam.length]);

  // Workflow navigation handlers
  const handleStartBuilding = () => {
    clearShortlist();
    setStep(E_WorkflowStep.TEAM_SETUP);
  };

  const handleTeamSizeSubmit = () => {
    setStep(E_WorkflowStep.BUILDING);
  };
  
  const handleBackFromTeamSize = () => {
    setStep(E_WorkflowStep.EMPTY);
  };
  
  const handleBackToBuilding = () => {
    setStep(E_WorkflowStep.BUILDING);
  };

  const handleReviewTeam = () => {
    setStep(E_WorkflowStep.REVIEW);
  };

  // Modal handlers
  const handleCandidateViewDetails = (candidate: I_CandidateWithScore) => {
    setSelectedCandidateForModal(candidate);
  };
  
  const handleCloseModal = () => {
    setSelectedCandidateForModal(null);
  };

  const handleCandidateSelectFromModal = (candidate: I_CandidateWithScore) => {
    addToShortlist(candidate);
  };

  // Render empty state (step 0)
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <h2 className="text-2xl font-bold mb-4">Build Your Dream Team</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Start the process of building your custom team by selecting the right candidates for each role.
      </p>
      <Button size="lg" onClick={handleStartBuilding}>
        Start Building
      </Button>
    </div>
  );
  
  // Render loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <h2 className="text-xl font-semibold mb-2">Loading Team Builder</h2>
      <p className="text-gray-500 text-center">
        {isInitializing 
          ? "Initializing your team building workspace..." 
          : "Determining your current step..."
        }
      </p>
    </div>
  );

  // Render workflow step content
  const renderStepContent = () => {
    switch (step) {
      case E_WorkflowStep.EMPTY:
        return renderEmptyState();
        
      case E_WorkflowStep.TEAM_SETUP:
        return (
          <TeamSizeSetup onSubmit={handleTeamSizeSubmit} onBack={handleBackFromTeamSize} />
        );
        
      case E_WorkflowStep.BUILDING:
        return (
          <TeamBuilder onCandidateViewDetails={handleCandidateViewDetails} onReviewTeam={handleReviewTeam} />
        );
        
      case E_WorkflowStep.REVIEW:
        return (
          <TeamReview onBackToBuilding={handleBackToBuilding} onStartOver={handleStartBuilding} />
        );
        
      default:
        return renderEmptyState();
    }
  };
  
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-4 text-center sm:text-left">
        Team Builder
      </h1>
      {/* Show loading state during initialization */}
      {isInitializing || step === -1 ? (
        renderLoadingState()
      ) : (
        <>
          {/* Progress Indicator - only show for active workflow steps */}
          {step > E_WorkflowStep.EMPTY && (
            <ProgressIndicator currentStep={step} totalSteps={3} />
          )}
          {renderStepContent()}
        </>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidateForModal && (
        <CandidateModal
          candidate={selectedCandidateForModal}
          isOpen={true}
          onClose={handleCloseModal}
          onSelect={handleCandidateSelectFromModal}
          showSelectButton={step === E_WorkflowStep.BUILDING && shortlistedTeam.length < teamSize}
        />
      )}
    </div>
  )
}

export default ShortlistPage