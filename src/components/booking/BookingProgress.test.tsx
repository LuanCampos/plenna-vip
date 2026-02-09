/**
 * Tests for BookingProgress component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingProgress } from './BookingProgress';
import { MOCK_LANGUAGE_CONTEXT } from '@/test/mocks';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

describe('BookingProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all 5 steps', () => {
    render(<BookingProgress currentStep="services" />);

    // Check step numbers are rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should highlight current step', () => {
    render(<BookingProgress currentStep="professional" />);

    // Step 2 should be current (aria-current)
    const currentStep = document.querySelector('[aria-current="step"]');
    expect(currentStep).toBeInTheDocument();
    expect(currentStep?.textContent).toBe('2');
  });

  it('should mark completed steps with check icon', () => {
    render(<BookingProgress currentStep="datetime" />);

    // Steps 1 and 2 should be completed (have check icon, not numbers)
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // current
    expect(screen.getByText('4')).toBeInTheDocument(); // pending
    expect(screen.getByText('5')).toBeInTheDocument(); // pending
  });

  it('should render progress navigation landmark', () => {
    render(<BookingProgress currentStep="services" />);

    const nav = screen.getByRole('navigation', { name: /booking progress/i });
    expect(nav).toBeInTheDocument();
  });

  it('should render step labels on larger screens', () => {
    render(<BookingProgress currentStep="services" />);

    // Step labels are rendered (hidden on small screens via CSS)
    expect(screen.getByText('stepServices')).toBeInTheDocument();
    expect(screen.getByText('stepProfessional')).toBeInTheDocument();
    expect(screen.getByText('stepDateTime')).toBeInTheDocument();
    expect(screen.getByText('stepInfo')).toBeInTheDocument();
    expect(screen.getByText('stepConfirm')).toBeInTheDocument();
  });

  it('should handle first step', () => {
    render(<BookingProgress currentStep="services" />);

    // First step should be current
    const currentStep = document.querySelector('[aria-current="step"]');
    expect(currentStep?.textContent).toBe('1');
  });

  it('should handle last step', () => {
    render(<BookingProgress currentStep="confirm" />);

    // Last step should be current
    const currentStep = document.querySelector('[aria-current="step"]');
    expect(currentStep?.textContent).toBe('5');

    // All previous steps should be completed (no numbers 1-4)
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });
});
