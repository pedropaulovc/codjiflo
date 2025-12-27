'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { parseGitHubPRUrl } from '@/features/pr';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useRequireAuth } from '@/features/auth/hooks';

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { isAuthenticated } = useRequireAuth();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const parsed = parseGitHubPRUrl(url);
    if (!parsed) {
      setError('Invalid GitHub PR URL. Please enter a URL like: https://github.com/owner/repo/pull/123');
      return;
    }

    router.push(`/pr/${parsed.owner}/${parsed.repo}/${String(parsed.number)}`);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">CodjiFlo</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            View Pull Request
          </h2>
          <p className="text-gray-600 mb-6">
            Enter a GitHub Pull Request URL to start reviewing
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="pr-url"
              label="GitHub Pull Request URL"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://github.com/owner/repo/pull/123"
              error={error}
              required
              autoFocus
            />

            <Button
              type="submit"
              label="Load Pull Request"
              disabled={!url.trim()}
            />
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Paste any public GitHub pull request URL to view its changes
        </p>
      </main>
    </div>
  );
}
