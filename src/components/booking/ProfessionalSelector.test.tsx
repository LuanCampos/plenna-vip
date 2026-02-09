/**
 * Tests for ProfessionalSelector component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfessionalSelector } from './ProfessionalSelector';
import { MOCK_LANGUAGE_CONTEXT, createMockProfessional } from '@/test/mocks';
import type { Professional } from '@/types/professional';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

describe('ProfessionalSelector', () => {
  const mockProfessionals: Professional[] = [
    createMockProfessional({ id: '1', name: 'João Silva', email: 'joao@salon.com' }) as Professional,
    createMockProfessional({ id: '2', name: 'Maria Santos', email: 'maria@salon.com' }) as Professional,
    createMockProfessional({ id: '3', name: 'Pedro Costa' }) as Professional,
  ];

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all professionals', () => {
    render(
      <ProfessionalSelector
        professionals={mockProfessionals}
        selectedProfessionalId={null}
        onSelectProfessional={mockOnSelect}
      />
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
  });

  it('should display professional email when available', () => {
    render(
      <ProfessionalSelector
        professionals={mockProfessionals}
        selectedProfessionalId={null}
        onSelectProfessional={mockOnSelect}
      />
    );

    expect(screen.getByText('joao@salon.com')).toBeInTheDocument();
    expect(screen.getByText('maria@salon.com')).toBeInTheDocument();
  });

  it('should call onSelectProfessional when professional is clicked', () => {
    render(
      <ProfessionalSelector
        professionals={mockProfessionals}
        selectedProfessionalId={null}
        onSelectProfessional={mockOnSelect}
      />
    );

    const professionalButton = screen.getByText('João Silva').closest('button');
    fireEvent.click(professionalButton!);

    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('should show selected state for selected professional', () => {
    render(
      <ProfessionalSelector
        professionals={mockProfessionals}
        selectedProfessionalId="2"
        onSelectProfessional={mockOnSelect}
      />
    );

    const selectedButton = screen.getByText('Maria Santos').closest('button');
    expect(selectedButton).toHaveClass('border-primary');
  });

  it('should show avatar initials', () => {
    render(
      <ProfessionalSelector
        professionals={mockProfessionals}
        selectedProfessionalId={null}
        onSelectProfessional={mockOnSelect}
      />
    );

    // Check initials are rendered in avatars
    expect(screen.getByText('JS')).toBeInTheDocument(); // João Silva
    expect(screen.getByText('MS')).toBeInTheDocument(); // Maria Santos
    expect(screen.getByText('PC')).toBeInTheDocument(); // Pedro Costa
  });

  it('should show loading skeleton when loading', () => {
    render(
      <ProfessionalSelector
        professionals={[]}
        selectedProfessionalId={null}
        onSelectProfessional={mockOnSelect}
        loading
      />
    );

    // Skeleton has animate-pulse class
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no professionals', () => {
    render(
      <ProfessionalSelector
        professionals={[]}
        selectedProfessionalId={null}
        onSelectProfessional={mockOnSelect}
      />
    );

    expect(screen.getByText('noProfessionalsAvailable')).toBeInTheDocument();
  });

  it('should allow reselecting different professional', () => {
    render(
      <ProfessionalSelector
        professionals={mockProfessionals}
        selectedProfessionalId="1"
        onSelectProfessional={mockOnSelect}
      />
    );

    // Click on a different professional
    const professionalButton = screen.getByText('Maria Santos').closest('button');
    fireEvent.click(professionalButton!);

    expect(mockOnSelect).toHaveBeenCalledWith('2');
  });
});
