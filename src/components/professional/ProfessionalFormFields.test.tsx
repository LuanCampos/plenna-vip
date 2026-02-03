import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfessionalFormFields } from './ProfessionalFormFields';
import {
  MOCK_SERVICE_ID,
  MOCK_SERVICE_ID_2,
  MOCK_LANGUAGE_CONTEXT,
} from '@/test/mocks';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

const mockServices = [
  { id: MOCK_SERVICE_ID, name: 'Corte' },
  { id: MOCK_SERVICE_ID_2, name: 'Barba' },
];

vi.mock('@/hooks/useServices', () => ({
  useActiveServices: () => ({ data: mockServices }),
}));

// Wrapper component to handle state updates
const TestWrapper = ({ onChangeSpy }: { onChangeSpy: ReturnType<typeof vi.fn> }) => {
  const [data, setData] = useState<{ name: string; email: string; phone: string; service_ids: string[] }>({
    name: '',
    email: '',
    phone: '',
    service_ids: [],
  });

  const handleChange = (field: string, value: string | string[] | boolean) => {
    onChangeSpy(field, value);
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ProfessionalFormFields
      data={data}
      onChange={handleChange}
      errors={{ name: 'name error' }}
    />
  );
};

describe('ProfessionalFormFields', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates fields and toggles services', async () => {
    const user = userEvent.setup();

    render(<TestWrapper onChangeSpy={onChange} />);

    await user.type(screen.getByLabelText('professionalName *'), 'Joao');
    await user.type(screen.getByLabelText('email'), 'joao@example.com');
    await user.type(screen.getByLabelText('clientPhone'), '11999999999');

    await user.click(screen.getByText('Corte'));
    await user.click(screen.getByText('Barba'));

    // Verify onChange was called - each keystroke triggers onChange
    // Check the final values by looking at all calls
    const nameCalls = onChange.mock.calls.filter((c: unknown[]) => c[0] === 'name');
    const emailCalls = onChange.mock.calls.filter((c: unknown[]) => c[0] === 'email');
    const phoneCalls = onChange.mock.calls.filter((c: unknown[]) => c[0] === 'phone');
    const serviceCalls = onChange.mock.calls.filter((c: unknown[]) => c[0] === 'service_ids');
    
    expect(nameCalls[nameCalls.length - 1]).toEqual(['name', 'Joao']);
    expect(emailCalls[emailCalls.length - 1]).toEqual(['email', 'joao@example.com']);
    expect(phoneCalls[phoneCalls.length - 1]).toEqual(['phone', '11999999999']);
    // Services toggle: clicking Corte adds it, clicking Barba adds both since state updates
    expect(serviceCalls[serviceCalls.length - 1]).toEqual(['service_ids', [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2]]);
    expect(screen.getByText('name error')).toBeInTheDocument();
  });
});
