import { useState, useRef, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components';
import { useAuthStore } from '../stores/useAuthStore';

export function LoginScreen() {
    const [token, setToken] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const errorRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { login, isLoading, error, errorMessage, isAuthenticated, clearError } = useAuthStore();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            void navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Focus management on error
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.focus();
        }
    }, [error]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        const trimmedToken = token.trim();
        if (!trimmedToken) {
            return;
        }

        const success = await login(trimmedToken);
        if (success) {
            void navigate('/dashboard', { replace: true });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setToken(e.target.value);
        if (error) {
            clearError();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Connect to GitHub
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your Personal Access Token to get started
                    </p>
                </div>

                {error && (
                    <div
                        ref={errorRef}
                        tabIndex={-1}
                        role="alert"
                        aria-live="polite"
                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
                        data-testid="auth-error"
                    >
                        <p className="text-sm text-red-700">
                            {errorMessage}
                        </p>
                    </div>
                )}

                <form onSubmit={(e) => void handleSubmit(e)} noValidate>
                    <div className="mb-6">
                        <Input
                            ref={inputRef}
                            label="Personal Access Token"
                            type="password"
                            name="token"
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            value={token}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            autoComplete="off"
                            data-testid="token-input"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Token must start with <code className="bg-gray-100 px-1 rounded">ghp_</code> or{' '}
                            <code className="bg-gray-100 px-1 rounded">github_pat_</code>
                        </p>
                    </div>

                    <Button
                        label={isLoading ? 'Connecting...' : 'Connect'}
                        disabled={isLoading || !token.trim()}
                        variant="primary"
                    />
                </form>

                <div className="mt-6 text-center">
                    <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        Generate a new token on GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
