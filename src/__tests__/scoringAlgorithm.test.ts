import { describe, it, expect } from 'vitest';
import { calculateCandidateScores } from '../utils/scoringAlgorithm';
import type { I_CandidateWithScore } from '../types/Candidate';

// Mock candidate data for testing
const mockCandidates: I_CandidateWithScore[] = [
  // Candidate A: Top-tier, matches everything
  {
    id: 'c1',
    name: 'Alice Top-Tier',
    skills: ['React', 'Node.js', 'TypeScript'],
    work_experiences: [{ roleName: 'Senior Software Engineer', company: 'Tech Giant' }],
    education: {
      highest_level: 'Masters',
      degrees: [{
        degree: 'Master of Science',
        subject: 'Computer Science',
        school: 'Top University',
        isTop25: true,
        isTop50: true,
        // other fields...
        gpa: '', startDate: '', endDate: '', originalSchool: ''
      }],
    },
    // other fields...
    email: '', phone: '', location: '', submitted_at: '', work_availability: [], annual_salary_expectation: {}
  },
  // Candidate B: Mid-tier, partial matches, Top 50 school
  {
    id: 'c2',
    name: 'Bob Mid-Tier',
    skills: ['React', 'JavaScript'],
    work_experiences: [{ roleName: 'Software Engineer', company: 'Mid-Size Co' }],
    education: {
      highest_level: 'Bachelors',
      degrees: [{
        degree: 'Bachelor of Science',
        subject: 'Software Engineering',
        school: 'Good College',
        isTop25: false,
        isTop50: true,
        // other fields...
        gpa: '', startDate: '', endDate: '', originalSchool: ''
      }],
    },
    // other fields...
    email: '', phone: '', location: '', submitted_at: '', work_availability: [], annual_salary_expectation: {}
  },
  // Candidate C: Regular, no prestige, fewer matches
  {
    id: 'c3',
    name: 'Charlie Regular',
    skills: ['HTML', 'CSS'],
    work_experiences: [{ roleName: 'Web Developer', company: 'Local Agency' }],
    education: {
      highest_level: 'Bachelors',
      degrees: [{
        degree: 'Bachelor of Arts',
        subject: 'Information Technology',
        school: 'State University',
        isTop25: false,
        isTop50: false,
        // other fields...
        gpa: '', startDate: '', endDate: '', originalSchool: ''
      }],
    },
    // other fields...
    email: '', phone: '', location: '', submitted_at: '', work_availability: [], annual_salary_expectation: {}
  },
];

describe('calculateCandidateScores', () => {
  it('should return an empty array if no candidates are provided', () => {
    expect(calculateCandidateScores([], ['React'], [], [])).toEqual([]);
  });

  it('should return candidates with a score of 0 if no keywords are provided', () => {
    const result = calculateCandidateScores(mockCandidates, [], [], []);
    expect(result[0].score).toBe(0);
    expect(result[1].score).toBe(0);
    expect(result[2].score).toBe(0);
  });

  it('should score based only on skills if only skill keywords are provided', () => {
    const skillKeywords = ['React', 'Node.js'];
    const result = calculateCandidateScores(mockCandidates, skillKeywords, [], []);
    // Alice: 2/2 match -> 100% -> score 100
    expect(result[0].score).toBe(100);
    // Bob: 1/2 match -> 50% -> score 50
    expect(result[1].score).toBe(50);
    // Charlie: 0/2 match -> 0% -> score 0
    expect(result[2].score).toBe(0);
  });

  it('should score based only on experience if only experience keywords are provided', () => {
    const experienceKeywords = ['Software Engineer'];
    const result = calculateCandidateScores(mockCandidates, [], experienceKeywords, []);
    // Alice: 1/1 match -> 100% -> score 100
    expect(result[0].score).toBe(100);
    // Bob: 1/1 match -> 100% -> score 100
    expect(result[1].score).toBe(100);
    // Charlie: 0/1 match -> 0% -> score 0
    expect(result[2].score).toBe(0);
  });

  it('should correctly redistribute weights when multiple filters are active', () => {
    const skillKeywords = ['React']; // 50% weight
    const experienceKeywords = ['Software Engineer']; // 30% weight
    const result = calculateCandidateScores(mockCandidates, skillKeywords, experienceKeywords, []);

    // Total active weight = 0.5 (skills) + 0.3 (experience) = 0.8
    // Alice: 100% skill, 100% exp. Score = 100 * (0.5/0.8) + 100 * (0.3/0.8) = 62.5 + 37.5 = 100
    expect(result[0].score).toBe(100);
    // Bob: 100% skill, 100% exp. Score = 100
    expect(result[1].score).toBe(100);
    // Charlie: 0% skill, 0% exp. Score = 0
    expect(result[2].score).toBe(0);
  });

  it('should correctly apply dynamic education weights with all filters active', () => {
    const skillKeywords = ['React'];
    const experienceKeywords = ['Engineer'];
    const educationKeywords = ['Science'];

    const result = calculateCandidateScores(mockCandidates, skillKeywords, experienceKeywords, educationKeywords);

    // Alice (Top 25): edu weight = 0.2. Total weight = 0.5 + 0.3 + 0.2 = 1.0
    // All matches are 100%. Score = 100 * 0.5 + 100 * 0.3 + 100 * 0.2 = 100
    expect(result[0].score).toBe(100);
    expect(result[0].educationWeight).toBe(0.2);

    // Bob (Top 50): edu weight = 0.15. Total weight = 0.5 + 0.3 + 0.15 = 0.95
    // All matches are 100%. Score = 100 * (0.5/0.95) + 100 * (0.3/0.95) + 100 * (0.15/0.95)
    // = 52.63 + 31.57 + 15.78 = 99.98 -> rounded to 100
    expect(result[1].score).toBe(100);
    expect(result[1].educationWeight).toBe(0.15);
    
    // Charlie (Regular): edu weight = 0.1. Total weight = 0.5 + 0.3 + 0.1 = 0.9
    // 0% skill, 0% exp, 0% edu. Score = 0
    expect(result[2].score).toBe(0);
    expect(result[2].educationWeight).toBe(0.1);
  });
  
  it('should handle partial matches correctly', () => {
    const skillKeywords = ['React', 'Node.js']; // Alice 100%, Bob 50%, Charlie 0%
    const experienceKeywords = ['Senior']; // Alice 100%, Bob 0%, Charlie 0%
    const result = calculateCandidateScores(mockCandidates, skillKeywords, experienceKeywords, []);
    
    // Total active weight = 0.5 (skills) + 0.3 (experience) = 0.8
    // Alice: 100% skill, 100% exp. Score = 100 * (0.5/0.8) + 100 * (0.3/0.8) = 62.5 + 37.5 = 100
    expect(result[0].score).toBe(100);
    // Bob: 50% skill, 0% exp. Score = 50 * (0.5/0.8) + 0 * (0.3/0.8) = 31.25 -> rounded to 31.3
    expect(result[1].score).toBe(31.3);
  });

  it('should return candidates in the same order they were received (no sorting)', () => {
    const skillKeywords = ['React'];
    // Bob should score higher than Alice if we only look for 'Software Engineer'
    const experienceKeywords = ['Software Engineer'];
    const result = calculateCandidateScores(mockCandidates, skillKeywords, experienceKeywords, []);

    // Both score 100, but their original order should be preserved.
    expect(result[0].id).toBe('c1'); // Alice first
    expect(result[1].id).toBe('c2'); // Bob second
    expect(result[2].id).toBe('c3'); // Charlie third
  });
});
