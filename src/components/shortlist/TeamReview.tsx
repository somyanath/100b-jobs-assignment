import { useAppContext } from "@/hooks/useAppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { useMemo } from "react";
import type { I_CandidateWithScore } from "@/types/Candidate";

interface I_TeamReviewProps {
  onBackToBuilding: () => void;
  onStartOver: () => void;
}

const TeamReview = ({ onBackToBuilding, onStartOver }: I_TeamReviewProps) => {
  const { shortlistedTeam, teamSize } = useAppContext();

  const teamMetrics = useMemo(() => {
    const teamScore = shortlistedTeam.length > 0 
      ? Math.round(shortlistedTeam.reduce((sum, candidate) => 
          sum + (candidate.skillScore || 0), 0) / shortlistedTeam.length)
      : 0;

    const allSkills = shortlistedTeam.flatMap(candidate => candidate.skills);
    const uniqueSkills = [...new Set(allSkills)];

    return {
      teamScore,
      uniqueSkills,
      teamSize: shortlistedTeam.length,
      totalTeamSize: teamSize
    };
  }, [shortlistedTeam, teamSize]);

  const getScoreBackgroundColor = (score: number): string => {
    const intensity = Math.min((score || 0) / 100, 1);
    return `rgba(59, 130, 246, ${intensity})`;
  };

  const formatEducation = (candidate: I_CandidateWithScore) => {
    const degree = candidate.education?.degrees?.[0];
    return {
      degree: degree?.degree || 'N/A',
      school: degree?.school || ''
    };
  };

  const formatExperience = (candidate: I_CandidateWithScore) => {
    const experience = candidate.work_experiences?.[0];
    return {
      role: experience?.roleName || 'N/A',
      company: experience?.company || ''
    };
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Review</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBackToBuilding}
          >
            Back to Building
          </Button>
          <Button
            variant="outline"
            onClick={onStartOver}
          >
            Start Over
          </Button>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {teamMetrics.teamSize}
              </div>
              <div className="text-sm text-gray-500">
                Team Members
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {teamMetrics.teamScore}
              </div>
              <div className="text-sm text-gray-500">
                Average Score
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {teamMetrics.uniqueSkills.length}
              </div>
              <div className="text-sm text-gray-500">
                Unique Skills
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Skills Overview */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-bold text-gray-900 mb-4">Team Skills</h3>
          <div className="flex flex-wrap gap-2">
            {teamMetrics.uniqueSkills.slice(0, 20).map(skill => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {teamMetrics.uniqueSkills.length > 20 && (
              <Badge variant="outline">
                +{teamMetrics.uniqueSkills.length - 20} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-20">Score</TableHead>
                <TableHead>Top Skills</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Experience</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortlistedTeam.map((candidate, index) => {
                const education = formatEducation(candidate);
                const experience = formatExperience(candidate);
                
                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Badge variant="outline">Role {index + 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </TableCell>
                    <TableCell>{candidate.location}</TableCell>
                    <TableCell>
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white font-medium"
                        style={{ backgroundColor: getScoreBackgroundColor(candidate.skillScore || 0) }}
                      >
                        {Math.round(candidate.skillScore || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{education.degree}</div>
                      <div className="text-xs text-gray-500">{education.school}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{experience.role}</div>
                      <div className="text-xs text-gray-500">{experience.company}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamReview