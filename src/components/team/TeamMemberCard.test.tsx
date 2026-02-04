/**
 * Tests for TeamMemberCard component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamMemberCard } from './TeamMemberCard';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { MOCK_TENANT_CONTEXT, MOCK_AUTH_CONTEXT, MOCK_TENANT_ID, MOCK_USER_ID } from '@/test/mocks';
import type { TenantUserWithProfile } from '@/types/user';
import type { ReactNode } from 'react';

// Mock contexts
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => MOCK_AUTH_CONTEXT,
}));

// Mock tenantUserService for RoleGuard
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    getUserRole: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return wrapper;
};

const MOCK_MEMBER: TenantUserWithProfile = {
  id: 'tenant-user-1',
  tenant_id: MOCK_TENANT_ID,
  user_id: 'user-2',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  user_profile: {
    id: 'user-2',
    name: 'John Doe',
    phone: '11999999999',
    avatar_url: undefined,
    email: 'john@example.com',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
};

const MOCK_OWNER_MEMBER: TenantUserWithProfile = {
  ...MOCK_MEMBER,
  id: 'tenant-user-owner',
  user_id: MOCK_USER_ID,
  role: 'owner',
  user_profile: {
    id: MOCK_USER_ID,
    name: 'Owner User',
    phone: '11888888888',
    avatar_url: undefined,
    email: 'owner@example.com',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
};

describe('TeamMemberCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current user as owner for role guard to show buttons
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue({
      id: 'tenant-user-owner',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_ID,
      role: 'owner',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  });

  it('should render member name and email', () => {
    const wrapper = createWrapper();

    render(<TeamMemberCard member={MOCK_MEMBER} />, { wrapper });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should render role badge', () => {
    const wrapper = createWrapper();

    render(<TeamMemberCard member={MOCK_MEMBER} />, { wrapper });

    expect(screen.getByText('roleAdmin')).toBeInTheDocument();
  });

  it('should render initials in avatar', () => {
    const wrapper = createWrapper();

    render(<TeamMemberCard member={MOCK_MEMBER} />, { wrapper });

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const wrapper = createWrapper();

    render(<TeamMemberCard member={MOCK_MEMBER} onEdit={onEdit} />, { wrapper });

    // Wait for RoleGuard to render buttons
    const editButton = await screen.findByRole('button', { name: 'editMember' });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(MOCK_MEMBER);
  });

  it('should call onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const wrapper = createWrapper();

    render(<TeamMemberCard member={MOCK_MEMBER} onRemove={onRemove} />, { wrapper });

    // Wait for RoleGuard to render buttons
    const removeButton = await screen.findByRole('button', { name: 'removeMember' });
    await user.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith(MOCK_MEMBER);
  });

  it('should not show edit/remove buttons for owner member', () => {
    const wrapper = createWrapper();

    render(<TeamMemberCard member={MOCK_OWNER_MEMBER} />, { wrapper });

    expect(screen.queryByRole('button', { name: 'editMember' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'removeMember' })).not.toBeInTheDocument();
  });

  it('should show owner badge for owner member', () => {
    const wrapper = createWrapper();

    render(<TeamMemberCard member={MOCK_OWNER_MEMBER} />, { wrapper });

    expect(screen.getByText('roleOwner')).toBeInTheDocument();
  });

  it('should show staff badge for staff member', () => {
    const wrapper = createWrapper();
    const staffMember: TenantUserWithProfile = {
      ...MOCK_MEMBER,
      role: 'staff',
    };

    render(<TeamMemberCard member={staffMember} />, { wrapper });

    expect(screen.getByText('roleStaff')).toBeInTheDocument();
  });
});
