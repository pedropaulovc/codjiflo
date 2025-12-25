import { describe, it, expect } from "vitest";
import { render, screen } from "./tests/helpers";
import App from "./App";

describe("App", () => {
  it("renders the CodjiFlo heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /codjiflo/i })).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<App />);
    expect(screen.getByText(/code review tool for power users/i)).toBeInTheDocument();
  });
});
