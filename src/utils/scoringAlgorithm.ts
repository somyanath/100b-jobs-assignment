import type { I_CandidateWithScore } from '../types/Candidate';

/**
 * Advanced keyword-based scoring with dynamic weight redistribution.
 * - Weights of unused filters are proportionally redistributed to active filters.
 * - If no keywords are provided for a category, it contributes 0 to the score.
 * - A score of 0 is given if no keywords are provided at all.
 *
 * @param candidates - Array of candidates to score
 * @param skillKeywords - Array of skill keywords to match against
 * @param experienceKeywords - Array of experience/role keywords to match against
 * @param educationKeywords - Array of education keywords to match against
 * @returns Array of candidates with calculated scores, sorted by score descending
 */
export const calculateCandidateScores = (
  candidates: I_CandidateWithScore[],
  skillKeywords: string[],
  experienceKeywords: string[],
  educationKeywords: string[] = []
): I_CandidateWithScore[] => {
  if (candidates.length === 0) {
    return [];
  }

  // Determine which filters are active based on keyword presence
  const isSkillsActive = skillKeywords.length > 0;
  const isExperienceActive = experienceKeywords.length > 0;
  const isEducationActive = educationKeywords.length > 0;

  const scored = candidates.map(candidate => {
    // Step 1: Calculate match percentages for each category (or 0 if inactive)
    const skillMatchPercentage = isSkillsActive
      ? (skillKeywords.filter(keyword =>
          candidate.skills.some(skill =>
            skill.toLowerCase().includes(keyword.toLowerCase())
          )
        ).length / skillKeywords.length) * 100
      : 0;

    const experienceMatchPercentage = isExperienceActive
      ? (experienceKeywords.filter(keyword =>
          candidate.work_experiences.some(exp =>
            exp.roleName.toLowerCase().includes(keyword.toLowerCase())
          )
        ).length / experienceKeywords.length) * 100
      : 0;
        
    const educationMatchPercentage = isEducationActive
      ? (educationKeywords.filter(keyword =>
          candidate.education.degrees.some(degree =>
            degree.degree.toLowerCase().includes(keyword.toLowerCase()) ||
            degree.subject.toLowerCase().includes(keyword.toLowerCase())
          )
        ).length / educationKeywords.length) * 100
      : 0;

    // Step 2: Determine dynamic education weight and total active weight for this candidate
    const hasTop25 = candidate.education.degrees.some(degree => degree.isTop25);
    const hasTop50 = candidate.education.degrees.some(degree => degree.isTop50);
    
    let baseEducationWeight;
    if (hasTop25) {
      baseEducationWeight = 0.2; // 20%
    } else if (hasTop50) {
      baseEducationWeight = 0.15; // 15%
    } else {
      baseEducationWeight = 0.1; // 10%
    }

    let totalActiveWeight = 0;
    if (isSkillsActive) totalActiveWeight += 0.5;
    if (isExperienceActive) totalActiveWeight += 0.3;
    if (isEducationActive) totalActiveWeight += baseEducationWeight;

    // Step 3: Calculate final score using normalized weights
    let totalScore = 0;
    if (totalActiveWeight > 0) {
      if (isSkillsActive) {
        totalScore += skillMatchPercentage * (0.5 / totalActiveWeight);
      }
      if (isExperienceActive) {
        totalScore += experienceMatchPercentage * (0.3 / totalActiveWeight);
      }
      if (isEducationActive) {
        totalScore += educationMatchPercentage * (baseEducationWeight / totalActiveWeight);
      }
    }
    // If totalActiveWeight is 0, score remains 0, which is correct.

    return {
      ...candidate,
      score: Math.round(totalScore * 10) / 10,
      skillScore: Math.round(totalScore * 10) / 10, // Alias for compatibility
      skillMatchPercentage: Math.round(skillMatchPercentage * 10) / 10,
      experienceMatchPercentage: Math.round(experienceMatchPercentage * 10) / 10,
      educationMatchPercentage: Math.round(educationMatchPercentage * 10) / 10,
      educationWeight: isEducationActive ? baseEducationWeight : 0, // Show the weight only if used
    };
  });

  // Sorting logic remains the same
  const sortedScored = scored.sort((a, b) => {
    if (Math.abs(a.score! - b.score!) < 0.1) { // Tie situation
      const aHasTop25 = a.education.degrees.some(degree => degree.isTop25);
      const bHasTop25 = b.education.degrees.some(degree => degree.isTop25);
      const aHasTop50 = a.education.degrees.some(degree => degree.isTop50);
      const bHasTop50 = b.education.degrees.some(degree => degree.isTop50);
      
      if (aHasTop25 && !bHasTop25) return -1;
      if (!aHasTop25 && bHasTop25) return 1;
      
      if (!aHasTop25 && !bHasTop25) {
        if (aHasTop50 && !bHasTop50) return -1;
        if (!aHasTop50 && bHasTop50) return 1;
      }
    }
    return b.score! - a.score!; // Higher score first
  });

  return sortedScored;
};