/**
 * Tests for ClientInfoForm component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClientInfoForm } from './ClientInfoForm';
import { MOCK_LANGUAGE_CONTEXT } from '@/test/mocks';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

describe('ClientInfoForm', () => {
  const mockOnChangeName = vi.fn();
  const mockOnChangePhone = vi.fn();
  const mockOnChangeEmail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/clientPhone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should call onChangeName when name input changes', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Maria Silva' } });

    expect(mockOnChangeName).toHaveBeenCalledWith('Maria Silva');
  });

  it('should format phone number as user types', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    const phoneInput = screen.getByLabelText(/clientPhone/i);

    // Type digits
    fireEvent.change(phoneInput, { target: { value: '11999999999' } });

    // Should format as (11) 99999-9999
    expect(mockOnChangePhone).toHaveBeenCalledWith('(11) 99999-9999');
  });

  it('should call onChangeEmail when email input changes', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'maria@example.com' } });

    expect(mockOnChangeEmail).toHaveBeenCalledWith('maria@example.com');
  });

  it('should display error messages when errors are provided', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
        errors={{
          name: 'nameTooShort',
          phone: 'invalidPhone',
          email: 'invalidEmail',
        }}
      />
    );

    expect(screen.getByText('nameTooShort')).toBeInTheDocument();
    expect(screen.getByText('invalidPhone')).toBeInTheDocument();
    expect(screen.getByText('invalidEmail')).toBeInTheDocument();
  });

  it('should mark name and phone as required', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    // Name and phone labels should have required indicator (*)
    const nameLabel = screen.getByText(/name/i).closest('label');
    const phoneLabel = screen.getByText(/clientPhone/i).closest('label');

    expect(nameLabel?.textContent).toContain('*');
    expect(phoneLabel?.textContent).toContain('*');
  });

  it('should mark email as optional', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    // Email label should show optional indicator
    expect(screen.getByText(/optional/i)).toBeInTheDocument();
  });

  it('should display values passed as props', () => {
    render(
      <ClientInfoForm
        name="Maria Silva"
        phone="(11) 99999-9999"
        email="maria@example.com"
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    expect(screen.getByDisplayValue('Maria Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByDisplayValue('maria@example.com')).toBeInTheDocument();
  });

  it('should limit phone input to 11 digits', () => {
    render(
      <ClientInfoForm
        name=""
        phone=""
        email=""
        onChangeName={mockOnChangeName}
        onChangePhone={mockOnChangePhone}
        onChangeEmail={mockOnChangeEmail}
      />
    );

    const phoneInput = screen.getByLabelText(/clientPhone/i);

    // Type more than 11 digits
    fireEvent.change(phoneInput, { target: { value: '119999999999999' } });

    // Should only format first 11 digits
    expect(mockOnChangePhone).toHaveBeenCalledWith('(11) 99999-9999');
  });
});
