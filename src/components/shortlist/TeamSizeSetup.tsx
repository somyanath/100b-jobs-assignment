import { useAppContext } from "@/hooks/useAppContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEAM_SIZE_CONSTRAINTS } from "@/constants";

interface I_TeamSizeSetupProps {
  onSubmit: () => void;
  onBack: () => void;
}

/**
 * Team size setup component
 * Allows users to define the number of team members needed
 */
const TeamSizeSetup = ({ onSubmit, onBack }: I_TeamSizeSetupProps) => {
  const { teamSize, setTeamSize } = useAppContext();
  const [inputValue, setInputValue] = useState('');

  // Initialize input with existing team size
  useEffect(() => {
    if (teamSize && teamSize > 0) {
      setInputValue(teamSize.toString());
    }
  }, [teamSize]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const size = parseInt(inputValue);

    if (isNaN(size) || size < TEAM_SIZE_CONSTRAINTS.MIN || size > TEAM_SIZE_CONSTRAINTS.MAX) {
      return;
    }
    // If we get here, validation passed
    setTeamSize(size);
    onSubmit();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const isValidSize = () => {
    const size = parseInt(inputValue);
    return !isNaN(size) && size >= 1 && size <= 15;
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Step 1: Define Your Team Size
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label 
            htmlFor="team-size-input"
            className="block text-sm font-medium mb-2"
          >
            How many team members do you need?
          </label>
          
          <Input
            id="team-size-input"
            type="number"
            min={TEAM_SIZE_CONSTRAINTS.MIN}
            max={TEAM_SIZE_CONSTRAINTS.MAX}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Enter team size (${TEAM_SIZE_CONSTRAINTS.MIN}-${TEAM_SIZE_CONSTRAINTS.MAX})`}
            required
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            className="flex-1"
            variant={isValidSize() ? "default" : "outline"}
          >
            Continue to Team Building
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamSizeSetup;