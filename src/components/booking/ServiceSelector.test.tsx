/**
 * Tests for ServiceSelector component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceSelector } from './ServiceSelector';
import { MOCK_LANGUAGE_CONTEXT, createMockService } from '@/test/mocks';
import type { Service } from '@/types/service';
import type { SelectedService } from '@/types/booking';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

describe('ServiceSelector', () => {
  const mockServices: Service[] = [
    createMockService({ id: '1', name: 'Corte de Cabelo', price: 50, duration: 30 }) as Service,
    createMockService({ id: '2', name: 'Barba', price: 30, duration: 20 }) as Service,
    createMockService({ id: '3', name: 'Combo', price: 70, duration: 45 }) as Service,
  ];

  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all services', () => {
    render(
      <ServiceSelector
        services={mockServices}
        selectedServices={[]}
        onToggleService={mockOnToggle}
      />
    );

    expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
    expect(screen.getByText('Barba')).toBeInTheDocument();
    expect(screen.getByText('Combo')).toBeInTheDocument();
  });

  it('should display service price and duration', () => {
    render(
      <ServiceSelector
        services={mockServices}
        selectedServices={[]}
        onToggleService={mockOnToggle}
      />
    );

    // Check prices are formatted (R$ format)
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 30,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 70,00')).toBeInTheDocument();

    // Check durations
    expect(screen.getAllByText(/30.*min/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/20.*min/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/45.*min/)[0]).toBeInTheDocument();
  });

  it('should call onToggleService when service is clicked', () => {
    render(
      <ServiceSelector
        services={mockServices}
        selectedServices={[]}
        onToggleService={mockOnToggle}
      />
    );

    const serviceButton = screen.getByText('Corte de Cabelo').closest('button');
    fireEvent.click(serviceButton!);

    expect(mockOnToggle).toHaveBeenCalledWith(mockServices[0]);
  });

  it('should show selected state for selected services', () => {
    const selected: SelectedService[] = [
      { service: mockServices[0]!, order: 0 },
    ];

    render(
      <ServiceSelector
        services={mockServices}
        selectedServices={selected}
        onToggleService={mockOnToggle}
      />
    );

    // First service should have check icon (selected state)
    const serviceButton = screen.getByText('Corte de Cabelo').closest('button');
    expect(serviceButton).toHaveClass('border-primary');
  });

  it('should show total duration and price when services are selected', () => {
    const selected: SelectedService[] = [
      { service: mockServices[0]!, order: 0 },
      { service: mockServices[1]!, order: 1 },
    ];

    render(
      <ServiceSelector
        services={mockServices}
        selectedServices={selected}
        onToggleService={mockOnToggle}
      />
    );

    // Total: 50 + 30 = 80 / duration: 30 + 20 = 50
    expect(screen.getByText('R$ 80,00')).toBeInTheDocument();
    expect(screen.getByText(/50.*min/)).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    render(
      <ServiceSelector
        services={[]}
        selectedServices={[]}
        onToggleService={mockOnToggle}
        loading
      />
    );

    // Skeleton has animate-pulse class
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no services', () => {
    render(
      <ServiceSelector
        services={[]}
        selectedServices={[]}
        onToggleService={mockOnToggle}
      />
    );

    expect(screen.getByText('noServicesAvailable')).toBeInTheDocument();
  });

  it('should handle multiple selections', () => {
    const selected: SelectedService[] = [
      { service: mockServices[0]!, order: 0 },
      { service: mockServices[1]!, order: 1 },
      { service: mockServices[2]!, order: 2 },
    ];

    render(
      <ServiceSelector
        services={mockServices}
        selectedServices={selected}
        onToggleService={mockOnToggle}
      />
    );

    // Total: 50 + 30 + 70 = 150 / duration: 30 + 20 + 45 = 95
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    expect(screen.getByText(/95.*min/)).toBeInTheDocument();
  });
});
