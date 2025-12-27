'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useOAuthFlow, useRedirectIfAuthenticated } from '@/features/auth/hooks';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function LoginPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [showPATSection, setShowPATSection] = useState(false);
  const { validateToken, error, isValidating, clearError } = useAuthStore();
  const { initiateOAuth, isInitiating } = useOAuthFlow();
  const { isAuthenticated } = useRedirectIfAuthenticated();
  const router = useRouter();

  const handleOAuthLogin = () => {
    initiateOAuth();
  };

  const handlePATSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void (async () => {
      const success = await validateToken(tokenInput);
      if (success) {
        router.replace('/dashboard');
      }
    })();
  };

  const handleInputChange = (value: string) => {
    setTokenInput(value);
    if (error) {
      clearError();
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Connect to GitHub
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to start reviewing pull requests
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            type="button"
            label={isInitiating ? 'Redirecting...' : 'Login with GitHub'}
            onClick={handleOAuthLogin}
            disabled={isInitiating}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPATSection(!showPATSection)}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
          >
            {showPATSection ? 'Hide' : 'Use'} Personal Access Token
          </button>

          {showPATSection && (
            <form onSubmit={handlePATSubmit} className="space-y-4">
              <Input
                id="pat"
                label="Personal Access Token"
                type="password"
                value={tokenInput}
                onChange={(e) => handleInputChange(e.target.value)}
                {...(error && { error })}
                disabled={isValidating}
                placeholder="ghp_xxxxxxxxxxxx or github_pat_xxxxxxxxxxxx"
                helperText="Your token must start with 'ghp_' or 'github_pat_'"
                required
              />

              <Button
                type="submit"
                label={isValidating ? 'Validating...' : 'Connect with PAT'}
                disabled={isValidating || !tokenInput.trim()}
              />
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have a GitHub account?{' '}
            <a
              href="https://github.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
