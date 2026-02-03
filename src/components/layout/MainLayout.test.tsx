import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('./Sidebar', () => ({ Sidebar: () => <div data-testid="sidebar">sidebar</div> }));
vi.mock('./Header', () => ({ Header: () => <div data-testid="header">header</div> }));

import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  it('renders sidebar, header, and outlet content', () => {
    render(
      <MemoryRouter initialEntries={['/']}> 
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<div>home content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('home content')).toBeInTheDocument();
  });
});
