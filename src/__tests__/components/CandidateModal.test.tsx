import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CandidateModal from '@/components/shortlist/CandidateModal';
import type { I_CandidateWithScore } from '@/types/Candidate';

// Mock data for a candidate with complete information
const mockFullCandidate: I_CandidateWithScore = {
  id: 'c1',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '123-456-7890',
  location: 'New York, NY',
  submitted_at: '2025-07-31T12:00:00Z',
  work_availability: ['full-time', 'remote'],
  annual_salary_expectation: { hourly: '$50', annually: '$100,000' },
  work_experiences: [
    { roleName: 'Senior Developer', company: 'Tech Corp' },
    { roleName: 'Junior Developer', company: 'Startup Inc' },
  ],
  education: {
    highest_level: 'Masters',
    degrees: [
      {
        degree: 'Master of Science',
        subject: 'Computer Science',
        school: 'MIT',
        isTop25: true,
        isTop50: true,
        gpa: '3.9',
        startDate: '2020-09-01',
        endDate: '2022-05-20',
        originalSchool: 'MIT',
      },
    ],
  },
  skills: ['React', 'TypeScript', 'Node.js'],
  score: 8.5,
  skillMatchPercentage: 80,
  experienceMatchPercentage: 90,
  educationMatchPercentage: 100,
  educationWeight: 0.2,
  currentRole: 'Senior Developer',
  currentCompany: 'Tech Corp',
  highestEducation: 'Master of Science in Computer Science',
};

// Mock data for a candidate with minimal information
const mockMinimalCandidate: I_CandidateWithScore = {
  id: 'c2',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '987-654-3210',
  location: 'San Francisco, CA',
  submitted_at: '',
  work_availability: [],
  annual_salary_expectation: {},
  work_experiences: [],
  education: { highest_level: '', degrees: [] },
  skills: [],
};


describe('CandidateModal', () => {
  // Mock handler functions
  const handleClose = vi.fn();
  const handleSelect = vi.fn();

  // Cleanup mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not be visible when isOpen is false', () => {
    render(
      <CandidateModal
        candidate={mockFullCandidate}
        isOpen={false}
        onClose={handleClose}
      />
    );
    // The dialog content should not be in the document
    expect(screen.queryByText('Jane Doe')).toBeNull();
  });

  it('should be visible when isOpen is true', () => {
    render(
      <CandidateModal
        candidate={mockFullCandidate}
        isOpen={true}
        onClose={handleClose}
      />
    );
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
  });

  describe('Data Display with Full Data', () => {
    beforeEach(() => {
      render(
        <CandidateModal
          candidate={mockFullCandidate}
          isOpen={true}
          onClose={handleClose}
        />
      );
    });

    it('should display header information correctly', () => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer at Tech Corp')).toBeInTheDocument();
    });

    it('should display contact information', () => {
      expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('New York, NY')).toBeInTheDocument();
      expect(screen.getByText(/Applied: Jul 2025/)).toBeInTheDocument();
    });

    it('should display work availability and salary', () => {
      expect(screen.getByText('full-time')).toBeInTheDocument();
      expect(screen.getByText('remote')).toBeInTheDocument();
      expect(screen.getByText(/Hourly: \$50 | Annually: \$100,000/)).toBeInTheDocument();
    });

    it('should display work experience', () => {
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Junior Developer')).toBeInTheDocument();
      expect(screen.getByText('Startup Inc')).toBeInTheDocument();
    });

    it('should display education with a Top 25 badge', () => {
      expect(screen.getByText('Master of Science in Computer Science')).toBeInTheDocument();
      expect(screen.getByText('MIT')).toBeInTheDocument();
      expect(screen.getByText('Top 25')).toBeInTheDocument();
    });

    it('should display skills', () => {
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('should display the match score and scoring breakdown', () => {
      expect(screen.getByText('8.5')).toBeInTheDocument();
      expect(screen.getByText('Scoring Breakdown')).toBeInTheDocument();
      expect(screen.getByText('80.0%')).toBeInTheDocument(); // Skill Score
      expect(screen.getByText('90.0%')).toBeInTheDocument(); // Experience Score
      expect(screen.getByText('20.0%')).toBeInTheDocument(); // Education Score (100% * 0.2 weight)
    });
  });

  describe('Data Display with Minimal Data', () => {
    beforeEach(() => {
      render(
        <CandidateModal
          candidate={mockMinimalCandidate}
          isOpen={true}
          onClose={handleClose}
        />
      );
    });

    it('should display fallbacks for missing role and company', () => {
      expect(screen.getByText('Role: Not specified')).toBeInTheDocument();
    });

    it('should display fallbacks for work experience, education, and skills', () => {
      expect(screen.getByText('No work experience listed')).toBeInTheDocument();
      expect(screen.getByText('No education information listed')).toBeInTheDocument();
      expect(screen.getByText('No skills listed')).toBeInTheDocument();
    });

    it('should display "Not specified" for salary', () => {
        expect(screen.getByText('Not specified')).toBeInTheDocument();
    });

    it('should hide score and scoring breakdown when not available', () => {
      expect(screen.queryByText('Match Score')).toBeNull();
      expect(screen.queryByText('Scoring Breakdown')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when the Close button is clicked', () => {
      render(
        <CandidateModal
          candidate={mockFullCandidate}
          isOpen={true}
          onClose={handleClose}
        />
      );
      
      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  
    it('should not show the Select button if showSelectButton is false', () => {
      render(
        <CandidateModal
          candidate={mockFullCandidate}
          isOpen={true}
          onClose={handleClose}
          onSelect={handleSelect}
          showSelectButton={false}
        />
      );
      expect(screen.queryByTestId('modal-select-button')).toBeNull();
    });
  
    it('should show the Select button and call onSelect and onClose when clicked', () => {
      render(
        <CandidateModal
          candidate={mockFullCandidate}
          isOpen={true}
          onClose={handleClose}
          onSelect={handleSelect}
          showSelectButton={true}
        />
      );
      
      const selectButton = screen.getByTestId('modal-select-button');
      expect(selectButton).toBeInTheDocument();
  
      fireEvent.click(selectButton);
  
      // It should call onSelect with the correct candidate
      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith(mockFullCandidate);
  
      // It should also close the modal upon selection
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
