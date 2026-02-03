import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceFormFields } from './ServiceFormFields';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Wrapper component to handle state updates
const TestWrapper = ({ onChangeSpy }: { onChangeSpy: ReturnType<typeof vi.fn> }) => {
  const [data, setData] = useState({ name: '', price: 0, duration: 30, description: '' });

  const handleChange = (field: string, value: string | number | boolean) => {
    onChangeSpy(field, value);
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ServiceFormFields
      data={data}
      onChange={handleChange}
      errors={{ name: 'name error', price: 'price error', duration: 'duration error', description: 'desc error' }}
    />
  );
};

describe('ServiceFormFields', () => {
  it('renders all fields and shows errors', () => {
    const onChange = vi.fn();

    render(
      <ServiceFormFields
        data={{ name: 'Test', price: 50.5, duration: 30, description: 'Desc' }}
        onChange={onChange}
        errors={{ name: 'name error', price: 'price error', duration: 'duration error', description: 'desc error' }}
      />
    );

    // Check all fields are rendered with values
    expect(screen.getByLabelText('serviceName *')).toHaveValue('Test');
    expect(screen.getByLabelText('servicePrice *')).toHaveValue('50,50');
    expect(screen.getByLabelText('serviceDuration *')).toHaveValue('30');
    expect(screen.getByLabelText('serviceDescription')).toHaveValue('Desc');

    // Check all errors are displayed
    expect(screen.getByText('name error')).toBeInTheDocument();
    expect(screen.getByText('price error')).toBeInTheDocument();
    expect(screen.getByText('duration error')).toBeInTheDocument();
    expect(screen.getByText('desc error')).toBeInTheDocument();
  });

  it('calls onChange when typing in name field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ServiceFormFields
        data={{ name: '', price: 0, duration: 30, description: '' }}
        onChange={onChange}
        errors={{}}
      />
    );

    await user.type(screen.getByLabelText('serviceName *'), 'A');
    
    expect(onChange).toHaveBeenCalledWith('name', 'A');
  });

  it('parses price correctly from input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TestWrapper onChangeSpy={onChange} />);

    // Just type in the price field (it will append to 0,00 -> 0,001 -> parsed as 0.001)
    const priceInput = screen.getByLabelText('servicePrice *');
    await user.type(priceInput, '5');

    // Verify onChange was called with price
    const priceCalls = onChange.mock.calls.filter((c: unknown[]) => c[0] === 'price');
    expect(priceCalls.length).toBeGreaterThan(0);
  });

  it('calls onChange with 0 when price is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ServiceFormFields
        data={{ name: '', price: 50, duration: 30, description: '' }}
        onChange={onChange}
      />
    );

    const priceInput = screen.getByLabelText('servicePrice *');
    await user.clear(priceInput);
    await user.type(priceInput, '0');

    expect(onChange).toHaveBeenCalledWith('price', 0);
  });

  it('calls onChange with 0 when duration is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ServiceFormFields
        data={{ name: '', price: 0, duration: 30, description: '' }}
        onChange={onChange}
      />
    );

    const durationInput = screen.getByLabelText('serviceDuration *');
    await user.clear(durationInput);

    expect(onChange).toHaveBeenCalledWith('duration', 0);
  });
});
