import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Add providers here as the app grows (e.g., theme, router, etc.)
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
