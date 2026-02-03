import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from './LanguageContext';

const LanguageConsumer = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-language">{language}</span>
      <span data-testid="translated-text">{t('save')}</span>
      <button onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}>
        toggle
      </button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('provides default language and translations', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('pt');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Salvar');
  });

  it('updates language when setLanguage is called', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>
    );

    await user.click(screen.getByText('toggle'));

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Save');
  });

  it('returns key when translation is missing', () => {
    const MissingKeyConsumer = () => {
      const { t } = useLanguage();
      return <span data-testid="missing">{t('nonexistentKey' as 'save')}</span>;
    };
    render(
      <LanguageProvider>
        <MissingKeyConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistentKey');
  });

  it('throws when useLanguage is used outside LanguageProvider', () => {
    const Consumer = () => {
      useLanguage();
      return null;
    };
    expect(() => render(<Consumer />)).toThrow('useLanguage must be used within a LanguageProvider');
  });
});
