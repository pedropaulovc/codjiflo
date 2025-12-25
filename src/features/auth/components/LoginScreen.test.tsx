import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/tests/helpers';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginScreen } from './LoginScreen';
import { useAuthStore, type AuthError } from '../stores/useAuthStore';
import type { GitHubUser } from '@/api/github-client';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the auth store
vi.mock('../stores/useAuthStore', async () => {
    const actual = await vi.importActual<typeof import('../stores/useAuthStore')>('../stores/useAuthStore');
    return {
        ...actual,
        useAuthStore: vi.fn(),
    };
});

const mockUseAuthStore = vi.mocked(useAuthStore);

interface MockAuthState {
    login: (token: string) => Promise<boolean>;
    isLoading: boolean;
    error: AuthError;
    errorMessage: string | null;
    isAuthenticated: boolean;
    clearError: () => void;
    token: string | null;
    user: GitHubUser | null;
    logout: () => void;
}

describe('LoginScreen', () => {
    const createMockState = (overrides: Partial<MockAuthState> = {}): MockAuthState => ({
        login: vi.fn().mockResolvedValue(false),
        isLoading: false,
        error: null,
        errorMessage: null,
        isAuthenticated: false,
        clearError: vi.fn(),
        token: null,
        user: null,
        logout: vi.fn(),
        ...overrides,
    });

    const mockStore = (state: MockAuthState) => {
        mockUseAuthStore.mockImplementation((selector?) => {
            if (selector) {
                return selector(state);
            }
            return state;
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockStore(createMockState());
    });

    const renderLoginScreen = () => {
        return render(
            <MemoryRouter>
                <LoginScreen />
            </MemoryRouter>
        );
    };

    it('should render Connect to GitHub heading', () => {
        renderLoginScreen();
        expect(screen.getByRole('heading', { name: /connect to github/i })).toBeInTheDocument();
    });

    it('should render PAT input field with accessible label', () => {
        renderLoginScreen();
        expect(screen.getByLabelText(/personal access token/i)).toBeInTheDocument();
    });

    it('should render Connect button', () => {
        renderLoginScreen();
        expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
    });

    it('should show link to generate new token', () => {
        renderLoginScreen();
        const link = screen.getByRole('link', { name: /generate a new token/i });
        expect(link).toHaveAttribute('href', 'https://github.com/settings/tokens');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('should disable button when input is empty', () => {
        renderLoginScreen();
        expect(screen.getByRole('button', { name: /connect/i })).toBeDisabled();
    });

    it('should enable button when input has value', async () => {
        const user = userEvent.setup();
        renderLoginScreen();

        await user.type(screen.getByLabelText(/personal access token/i), 'ghp_test');

        expect(screen.getByRole('button', { name: /connect/i })).not.toBeDisabled();
    });

    it('should call login on form submit', async () => {
        const user = userEvent.setup();
        const mockLogin = vi.fn().mockResolvedValue(true);
        mockStore(createMockState({ login: mockLogin }));

        renderLoginScreen();

        await user.type(screen.getByLabelText(/personal access token/i), 'ghp_testtoken');
        await user.click(screen.getByRole('button', { name: /connect/i }));

        expect(mockLogin).toHaveBeenCalledWith('ghp_testtoken');
    });

    it('should navigate to dashboard on successful login', async () => {
        const user = userEvent.setup();
        const mockLogin = vi.fn().mockResolvedValue(true);
        mockStore(createMockState({ login: mockLogin }));

        renderLoginScreen();

        await user.type(screen.getByLabelText(/personal access token/i), 'ghp_testtoken');
        await user.click(screen.getByRole('button', { name: /connect/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    it('should display error message when login fails', () => {
        mockStore(createMockState({
            error: 'invalid_token',
            errorMessage: 'Authentication failed. Please check your token.',
        }));

        renderLoginScreen();

        const errorElement = screen.getByTestId('auth-error');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent('Authentication failed');
    });

    it('should have aria-live on error container for screen readers', () => {
        mockStore(createMockState({
            error: 'network_error',
            errorMessage: 'Connection failed.',
        }));

        renderLoginScreen();

        expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('should show loading state when isLoading is true', () => {
        mockStore(createMockState({ isLoading: true }));

        renderLoginScreen();

        expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled();
    });

    it('should clear error when user types', async () => {
        const user = userEvent.setup();
        const mockClearError = vi.fn();
        mockStore(createMockState({
            error: 'invalid_token',
            errorMessage: 'Some error',
            clearError: mockClearError,
        }));

        renderLoginScreen();

        await user.type(screen.getByLabelText(/personal access token/i), 'a');

        expect(mockClearError).toHaveBeenCalled();
    });

    it('should redirect to dashboard if already authenticated', () => {
        mockStore(createMockState({ isAuthenticated: true }));

        renderLoginScreen();

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
});
