/**
 * Tests for AppointmentCard component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentCard } from './AppointmentCard';
import { MOCK_APPOINTMENT_WITH_DETAILS } from '@/test/mocks';
import type { AppointmentWithDetails } from '@/types/appointment';

// Mock LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('AppointmentCard', () => {
  const appointment: AppointmentWithDetails = {
    ...MOCK_APPOINTMENT_WITH_DETAILS,
    services: [
      {
        id: 'as-1',
        tenant_id: MOCK_APPOINTMENT_WITH_DETAILS.tenant_id,
        appointment_id: MOCK_APPOINTMENT_WITH_DETAILS.id,
        service_id: 'srv-1',
        service_name_at_booking: 'Corte Masculino',
        price_at_booking: 50,
        duration_at_booking: 30,
        order_index: 0,
        created_at: '2026-01-15T10:00:00Z',
      },
    ],
  };

  it('should render client name', () => {
    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
  });

  it('should render service names', () => {
    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText('Corte Masculino')).toBeInTheDocument();
  });

  it('should render professional name', () => {
    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText('João Barbeiro')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<AppointmentCard appointment={appointment} />);

    // Should show status badge (mocked t function returns the key)
    expect(screen.getByText('statusScheduled')).toBeInTheDocument();
  });

  it('should render formatted price', () => {
    render(<AppointmentCard appointment={appointment} />);

    // Price formatting uses CURRENCY_SYMBOL
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<AppointmentCard appointment={appointment} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render compact version', () => {
    const { container } = render(<AppointmentCard appointment={appointment} compact />);

    // Compact version has simpler structure
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('p-2');
  });

  it('should show walkIn text when no client', () => {
    const appointmentWithoutClient: AppointmentWithDetails = {
      ...appointment,
      client: undefined,
    };

    render(<AppointmentCard appointment={appointmentWithoutClient} />);

    expect(screen.getByText('walkIn')).toBeInTheDocument();
  });

  it('should apply cancelled opacity', () => {
    const cancelledAppointment: AppointmentWithDetails = {
      ...appointment,
      status: 'cancelled',
    };

    const { container } = render(<AppointmentCard appointment={cancelledAppointment} />);
    const card = container.firstChild as HTMLElement;

    expect(card.className).toContain('opacity-60');
    expect(card.className).toContain('border-l-red');
  });

  it('should apply confirmed border color', () => {
    const confirmedAppointment: AppointmentWithDetails = {
      ...appointment,
      status: 'confirmed',
    };

    const { container } = render(<AppointmentCard appointment={confirmedAppointment} />);
    const card = container.firstChild as HTMLElement;

    expect(card.className).toContain('border-l-green');
  });

  it('should have accessible button with aria-label', () => {
    render(<AppointmentCard appointment={appointment} />);

    const card = screen.getByRole('button', { name: 'viewAppointment' });
    expect(card).toBeInTheDocument();
  });

  it('should render multiple services', () => {
    const multiServiceAppointment: AppointmentWithDetails = {
      ...appointment,
      services: [
        { ...appointment.services[0]!, service_name_at_booking: 'Corte' },
        {
          id: 'as-2',
          tenant_id: appointment.tenant_id,
          appointment_id: appointment.id,
          service_id: 'srv-2',
          service_name_at_booking: 'Barba',
          price_at_booking: 30,
          duration_at_booking: 20,
          order_index: 1,
          created_at: '2026-01-15T10:00:00Z',
        },
      ],
    };

    render(<AppointmentCard appointment={multiServiceAppointment} />);

    expect(screen.getByText('Corte, Barba')).toBeInTheDocument();
  });
});
