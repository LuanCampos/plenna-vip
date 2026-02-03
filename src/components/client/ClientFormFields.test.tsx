import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientFormFields } from './ClientFormFields';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Wrapper component to handle state updates
const TestWrapper = ({ onChangeSpy }: { onChangeSpy: ReturnType<typeof vi.fn> }) => {
  const [data, setData] = useState({ name: '', phone: '', email: '', notes: '' });

  const handleChange = (field: string, value: string) => {
    onChangeSpy(field, value);
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ClientFormFields
      data={data}
      onChange={handleChange}
      errors={{ name: 'name error', phone: 'phone error', email: 'email error', notes: 'notes error' }}
    />
  );
};

describe('ClientFormFields', () => {
  it('renders without errors when errors prop is not provided', () => {
    const onChange = vi.fn();
    render(
      <ClientFormFields
        data={{ name: 'Ana', phone: '11999999999', email: '', notes: '' }}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText('clientName *')).toHaveValue('Ana');
    expect(screen.getByLabelText('clientPhone *')).toHaveValue('11999999999');
    expect(screen.queryByText('name error')).not.toBeInTheDocument();
  });

  it('calls onChange for each field and shows errors', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<TestWrapper onChangeSpy={handleChange} />);

    await user.type(screen.getByLabelText('clientName *'), 'Ana');
    await user.type(screen.getByLabelText('clientPhone *'), '11999999999');
    await user.type(screen.getByLabelText('clientEmail'), 'user@example.com');
    await user.type(screen.getByLabelText('clientNotes'), 'VIP');

    // Verify onChange was called - each keystroke triggers onChange
    // Check the final values by looking at all calls
    const nameCalls = handleChange.mock.calls.filter((c: string[]) => c[0] === 'name');
    const phoneCalls = handleChange.mock.calls.filter((c: string[]) => c[0] === 'phone');
    const emailCalls = handleChange.mock.calls.filter((c: string[]) => c[0] === 'email');
    const notesCalls = handleChange.mock.calls.filter((c: string[]) => c[0] === 'notes');
    
    expect(nameCalls[nameCalls.length - 1]).toEqual(['name', 'Ana']);
    expect(phoneCalls[phoneCalls.length - 1]).toEqual(['phone', '11999999999']);
    expect(emailCalls[emailCalls.length - 1]).toEqual(['email', 'user@example.com']);
    expect(notesCalls[notesCalls.length - 1]).toEqual(['notes', 'VIP']);

    expect(screen.getByText('name error')).toBeInTheDocument();
    expect(screen.getByText('phone error')).toBeInTheDocument();
    expect(screen.getByText('email error')).toBeInTheDocument();
    expect(screen.getByText('notes error')).toBeInTheDocument();
  });
});
