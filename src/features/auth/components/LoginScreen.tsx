import { useState, FormEvent } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useNavigate } from "react-router-dom";

export function LoginScreen() {
  const [tokenInput, setTokenInput] = useState("");
  const { validateToken, error, isValidating, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleAuthentication = async () => {
    try {
      const success = await validateToken(tokenInput);
      if (success) {
        void navigate("/dashboard");
      }
    } catch {
      // Error is already handled in the store
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleAuthentication();
  };

  const handleInputChange = (value: string) => {
    setTokenInput(value);
    if (error) {
      clearError();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Connect to GitHub
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your Personal Access Token to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
            autoFocus
          />

          <Button
            type="submit"
            label={isValidating ? "Validating..." : "Connect"}
            disabled={isValidating || !tokenInput.trim()}
          />
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have a token?{" "}
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Create one on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
