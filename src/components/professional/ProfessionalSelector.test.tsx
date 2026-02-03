import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfessionalSelector } from './ProfessionalSelector';

const mockUseActiveProfessionals = vi.fn();

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/useProfessionals', () => ({
  useActiveProfessionals: (serviceId?: string) => mockUseActiveProfessionals(serviceId),
}));

describe('ProfessionalSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeletons', () => {
    mockUseActiveProfessionals.mockReturnValue({ data: undefined, isLoading: true });

    render(<ProfessionalSelector value={null} onChange={vi.fn()} />);

    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state when no professionals', () => {
    mockUseActiveProfessionals.mockReturnValue({ data: [], isLoading: false });

    render(<ProfessionalSelector value={null} onChange={vi.fn()} />);

    expect(screen.getByText('noProfessionals')).toBeInTheDocument();
  });

  it('selects professional when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    mockUseActiveProfessionals.mockReturnValue({
      data: [{ id: 'prof-1', name: 'Ana', avatar_url: null, active: true }],
      isLoading: false,
    });

    render(<ProfessionalSelector value={null} onChange={onChange} />);

    await user.click(screen.getByText('Ana'));
    expect(onChange).toHaveBeenCalledWith('prof-1');
  });

  it('deselects professional when already selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    mockUseActiveProfessionals.mockReturnValue({
      data: [{ id: 'prof-1', name: 'Ana', avatar_url: null, active: true }],
      isLoading: false,
    });

    // Render with prof-1 already selected
    render(<ProfessionalSelector value="prof-1" onChange={onChange} />);

    await user.click(screen.getByText('Ana'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders avatar image when professional has avatar_url', () => {
    mockUseActiveProfessionals.mockReturnValue({
      data: [{ id: 'prof-1', name: 'Ana', avatar_url: 'https://example.com/avatar.jpg', active: true }],
      isLoading: false,
    });

    render(<ProfessionalSelector value={null} onChange={vi.fn()} />);

    const img = document.querySelector('img[src="https://example.com/avatar.jpg"]');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Ana');
  });
});
