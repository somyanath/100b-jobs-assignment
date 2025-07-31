import type { I_CandidateWithScore } from "@/types/Candidate";
import { useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Briefcase, Calendar, Clock, GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface I_CandidateModalProps {
  candidate: I_CandidateWithScore;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (candidate: I_CandidateWithScore) => void;
  showSelectButton?: boolean;
}

const CandidateModal = ({
  candidate,
  isOpen,
  onClose,
  onSelect,
  showSelectButton = false
}: I_CandidateModalProps) => {
  const formatSalary = useCallback((salaryObj: Record<string, string>) => {
    if (!salaryObj || Object.keys(salaryObj).length === 0) return 'Not specified';
    
    const entries = Object.entries(salaryObj);
    return entries.map(([type, amount]) => 
      `${type.charAt(0).toUpperCase() + type.slice(1)}: ${amount}`
    ).join(' | ');
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return 'Not specified';
    
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  const handleSelectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(candidate);
      onClose();
    }
  }, [onSelect, candidate, onClose]);

  const scoreBackgroundColor = useMemo(() => {
    if (!candidate.score) return 'rgba(156, 163, 175, 0.5)'; // Gray for no score
    const intensity = Math.min((candidate.score || 0) / 10, 1);
    return `rgba(59, 130, 246, ${intensity})`;
  }, [candidate.score]);

  const hasScoringDetails = useMemo(() => {
    return candidate.skillMatchPercentage !== undefined || 
           candidate.experienceMatchPercentage !== undefined ||
           candidate.educationMatchPercentage !== undefined;
  }, [candidate.skillMatchPercentage, candidate.experienceMatchPercentage, candidate.educationMatchPercentage]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl md:max-w-3xl max-h-[90vh] overflow-y-auto mx-2 md:mx-0">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex-1">
              <div className="font-bold text-gray-900">{candidate.name}</div>
              <div className="text-sm text-gray-600 font-normal">
                {candidate.currentRole || 'Role: Not specified'} 
                {candidate.currentCompany && ` at ${candidate.currentCompany}`}
              </div>
            </div>
            {candidate.score && (
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Match Score</div>
                <div 
                  className="inline-flex items-center justify-center px-3 py-1 rounded-full text-white font-semibold text-sm"
                  style={{ backgroundColor: scoreBackgroundColor }}
                >
                  {candidate.score.toFixed(1)}
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-gray-500" />
                <span>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-500" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-500" />
                <span>{candidate.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span>Applied: {formatDate(candidate.submitted_at)}</span>
              </div>
            </div>
          </div>

          {/* Work Availability & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Work Availability
              </h3>
              <div className="flex flex-wrap gap-1">
                {candidate.work_availability?.map(availability => (
                  <Badge key={availability} variant="secondary">
                    {availability}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Salary Expectations</h3>
              <div className="text-sm text-gray-700">
                {formatSalary(candidate.annual_salary_expectation)}
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work Experience
            </h3>
            <div className="space-y-3">
              {candidate.work_experiences?.length > 0 ? (
                candidate.work_experiences.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4 pb-2">
                    <div className="font-medium text-gray-900">{exp.roleName}</div>
                    <div className="text-sm text-gray-600">{exp.company}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No work experience listed</div>
              )}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </h3>
            <div className="space-y-3">
              {candidate.education?.degrees?.length > 0 ? (
                candidate.education.degrees.map((degree, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {degree.degree} in {degree.subject}
                          {degree.isTop25 && (
                            <Badge variant="default" className="bg-yellow-500 text-white text-xs">
                              Top 25
                            </Badge>
                          )}
                          {!degree.isTop25 && degree.isTop50 && (
                            <Badge variant="default" className="bg-yellow-500 text-white text-xs">
                              Top 50
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{degree.school}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(degree.startDate)} - {formatDate(degree.endDate)}
                          {degree.gpa && ` • GPA: ${degree.gpa}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No education information listed</div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.length > 0 ? (
                candidate.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No skills listed</div>
              )}
            </div>
          </div>

          {/* Scoring Details */}
          {hasScoringDetails && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Scoring Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {candidate.skillMatchPercentage !== undefined && (
                  <div>
                    <div className="text-gray-600">Skill Score</div>
                    <div className="font-semibold text-blue-700">
                      {candidate.skillMatchPercentage.toFixed(1)}%
                    </div>
                  </div>
                )}
                {candidate.experienceMatchPercentage !== undefined && (
                  <div>
                    <div className="text-gray-600">Experience Score</div>
                    <div className="font-semibold text-blue-700">
                      {candidate.experienceMatchPercentage.toFixed(1)}%
                    </div>
                  </div>
                )}
                {candidate.educationMatchPercentage && candidate.educationWeight && (
                  <div>
                    <div className="text-gray-600">Education Score</div>
                    <div className="font-semibold text-blue-700">
                      {(candidate.educationMatchPercentage * candidate.educationWeight).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="modal-close-button">
            Close
          </Button>
          {showSelectButton && onSelect && (
            <Button 
              onClick={handleSelectClick}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="modal-select-button"
            >
              Select for Team
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CandidateModal