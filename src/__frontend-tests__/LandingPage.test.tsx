import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

// ----------------------
// Mock NavBar links to prevent router errors
// ----------------------
vi.mock("../components/NavBar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock("../components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("../assets/SwapStop-Logo-Transparent.png", () => ({
  default: "logo.png",
}));

// ----------------------
// Helper to render with router
// ----------------------
function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// ----------------------
// Tests
// ----------------------
describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the navbar", () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("renders the hero section with logo, heading, and buttons", () => {
    renderWithRouter(<LandingPage />);

    // Logo
    expect(screen.getByAltText(/swapstop logo/i)).toBeInTheDocument();

    // Heading
    expect(
      screen.getByRole("heading", { name: /revolutionize your trading experience/i })
    ).toBeInTheDocument();

    // Hero buttons
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
    expect(screen.getByText(/learn more/i)).toBeInTheDocument();
  });

  test("renders the features section", () => {
    renderWithRouter(<LandingPage />);
    expect(
      screen.getByRole("heading", { name: /why choose swapstop\?/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/ai-powered trading/i)).toBeInTheDocument();
    expect(screen.getByText(/secure transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/community driven/i)).toBeInTheDocument();
  });

  test("renders the call to action section", () => {
    renderWithRouter(<LandingPage />);
    expect(
      screen.getByRole("heading", { name: /ready to start swapping smarter\?/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/sign up now/i)).toBeInTheDocument();
  });

  test("renders the footer with current year", () => {
    renderWithRouter(<LandingPage />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year} SwapStop`, "i"))).toBeInTheDocument();
  });
});
