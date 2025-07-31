import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TEAM_SIZE_CONSTRAINTS } from "@/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/hooks/useAppContext";

interface I_TeamSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (size: number) => void;
  currentTeamSize: number;
}

/**
 * Team size modal component
 * Allows users to change the team size during team building
 */
const TeamSizeModal = ({ isOpen, onClose, onConfirm, currentTeamSize }: I_TeamSizeModalProps) => {
  const { teamSize, setTeamSize } = useAppContext();
  const [error, setError] = useState<string>('');

  // Initialize team size when modal opens
  useEffect(() => {
    if (isOpen) {
      setTeamSize(currentTeamSize);
      setError('');
    }
  }, [isOpen, currentTeamSize, setTeamSize]);

  // Validate team size input
  const validateTeamSize = (size: number): boolean => {
    return size >= TEAM_SIZE_CONSTRAINTS.MIN && size <= TEAM_SIZE_CONSTRAINTS.MAX;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const size = teamSize;
    
    if (isNaN(size)) {
      setError('Please enter a valid number');
      return;
    }

    if (!validateTeamSize(size)) {
      setError(`Team size must be between ${TEAM_SIZE_CONSTRAINTS.MIN} and ${TEAM_SIZE_CONSTRAINTS.MAX}`);
      return;
    }

    setError('');
    onConfirm(size);
    onClose();
  };

  // Handle cancel action
  const handleCancel = () => {
    setTeamSize(currentTeamSize);
    setError('');
    onClose();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamSize(parseInt(value));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Check if current input is valid
  const isValidInput = () => {
    const size = teamSize;
    return !isNaN(size) && validateTeamSize(size);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Team Size</DialogTitle>
          <DialogDescription>
            How many team members do you want to hire? You can always change this later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team-size" className="text-right">
                Team Size
              </Label>
              <Input
                id="team-size"
                type="number"
                min={TEAM_SIZE_CONSTRAINTS.MIN}
                max={TEAM_SIZE_CONSTRAINTS.MAX}
                value={teamSize}
                onChange={handleInputChange}
                className={`col-span-3 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder={`Enter team size (${TEAM_SIZE_CONSTRAINTS.MIN}-${TEAM_SIZE_CONSTRAINTS.MAX})`}
                autoFocus
                aria-describedby={error ? "team-size-error" : "team-size-help"}
              />
            </div>
            
            {error && (
              <div id="team-size-error" className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            
            <div id="team-size-help" className="text-sm text-gray-500 text-center">
              Current team size: {currentTeamSize} member{currentTeamSize !== 1 ? 's' : ''}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValidInput()}
            >
              Update Team Size
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TeamSizeModal