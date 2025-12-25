import { describe, it, expect } from "vitest";
import { render, screen } from "./tests/helpers";
import App from "./App";

describe("App", () => {
  it("redirects to Dashboard by default", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
  });

  it("renders placeholder text", () => {
    render(<App />);
    expect(screen.getByText(/Placeholder for S-1.2/i)).toBeInTheDocument();
  });
});
