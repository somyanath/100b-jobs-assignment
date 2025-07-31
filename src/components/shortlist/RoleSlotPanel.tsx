import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface I_RoleSlotPanelProps {
  activeRoleIndex: number;
  onRoleSelect: (index: number) => void;
}

// Role state types for better type safety
type T_RoleState = 'empty' | 'filled' | 'active' | 'replacing';

const RoleSlotPanel = ({ activeRoleIndex, onRoleSelect }: I_RoleSlotPanelProps) => {
  const { shortlistedTeam, teamSize } = useAppContext();

  // Determine role state and styling
  const getRoleState = (index: number): T_RoleState => {
    const candidate = shortlistedTeam[index];
    const isFilled = candidate !== null && candidate !== undefined;
    const isActive = index === activeRoleIndex;
    
    if (isFilled && isActive) return 'replacing';
    if (isFilled) return 'filled';
    if (isActive) return 'active';
    return 'empty';
  };

  const getRoleStyling = (state: T_RoleState) => {
    switch (state) {
      case 'replacing':
        return {
          cardClass: 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100',
          badgeClass: 'bg-yellow-100 text-yellow-800',
          badgeText: 'Replacing'
        };
      case 'filled':
        return {
          cardClass: 'bg-green-50 border-green-200 hover:bg-green-100',
          badgeClass: 'bg-green-100 text-green-800',
          badgeText: 'Filled'
        };
      case 'active':
        return {
          cardClass: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
          badgeClass: 'bg-blue-100 text-blue-800',
          badgeText: 'Active'
        };
      default: // empty
        return {
          cardClass: 'hover:bg-gray-100 border-gray-200',
          badgeClass: '',
          badgeText: ''
        };
    }
  };

  const handleRoleClick = (index: number) => {
    onRoleSelect(index);
  };
  
  return (
    <div className="space-y-2">
      {/* Team progress header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900">Team Roles</h3>
        <Badge variant="secondary">
          {shortlistedTeam.length}/{teamSize}
        </Badge>
      </div>
      
      {/* Role slots */}
      <div className="space-y-2">
        {Array.from({ length: teamSize }).map((_, index) => {
          const roleState = getRoleState(index);
          const styling = getRoleStyling(roleState);
          const isFilled = roleState === 'filled' || roleState === 'replacing';
          const candidate = shortlistedTeam[index];
          
          return (
            <Card 
              key={index}
              className={`cursor-pointer transition-colors py-2 ${styling.cardClass}`}
              onClick={() => handleRoleClick(index)}
            >
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Role {index + 1}</span>
                  {styling.badgeText && (
                    <Badge className={`text-xs ${styling.badgeClass}`}>
                      {styling.badgeText}
                    </Badge>
                  )}
                </div>
                
                {/* Show candidate info if role is filled */}
                {isFilled && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-900">
                      {candidate.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {candidate.skills.slice(0, 2).join(', ')}
                    </div>

                    {/* Replace button for filled roles */}
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleClick(index)}
                        className="w-full text-xs h-7 bg-white hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Click to Replace
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSlotPanel