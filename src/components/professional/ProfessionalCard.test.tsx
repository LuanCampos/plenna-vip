import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfessionalCard } from './ProfessionalCard';
import { MOCK_PROFESSIONAL_ENTITY } from '@/test/mocks';
import type { ProfessionalWithServices } from '@/types/professional';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('ProfessionalCard', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders professional info and service chips', () => {
    const professional: ProfessionalWithServices = {
      ...MOCK_PROFESSIONAL_ENTITY,
      service_ids: ['1', '2', '3', '4'],
      services: [
        { id: '1', name: 'Corte' },
        { id: '2', name: 'Barba' },
        { id: '3', name: 'Sobrancelha' },
        { id: '4', name: 'Coloração' },
      ],
    };

    render(
      <ProfessionalCard
        professional={professional}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(professional.name)).toBeInTheDocument();
    expect(screen.getByText('Corte')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('shows inactive badge and triggers actions', async () => {
    const user = userEvent.setup();
    const inactiveProfessional: ProfessionalWithServices = { ...MOCK_PROFESSIONAL_ENTITY, active: false, service_ids: [] };

    render(
      <ProfessionalCard
        professional={inactiveProfessional}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Inativo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'edit' }));
    await user.click(screen.getByRole('button', { name: 'delete' }));

    expect(onEdit).toHaveBeenCalledWith(inactiveProfessional);
    expect(onDelete).toHaveBeenCalledWith(inactiveProfessional);
  });
});
