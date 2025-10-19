/*

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/Login.tsx";

// ----------------------
// Mock Firebase Auth
// ----------------------
vi.mock("../firebase/auth.ts", () => ({
  loginUser: vi.fn(),
}));

import { loginUser } from "../firebase/auth.ts";

// ----------------------
// Mock alert
// ----------------------
const alertMock = vi.fn();
vi.stubGlobal("alert", alertMock);

// ----------------------
// Mock navigate
// ----------------------
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// ----------------------
// Tests
// ----------------------
describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the login form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Check heading
    expect(screen.getByRole("heading", { name: /login to swapstop/i })).toBeInTheDocument();

    // Check inputs
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();

    // Check button
    const loginButtons = screen.getAllByRole("button", { name: /login/i });
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  test("logs in successfully and navigates", async () => {
    (loginUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: "kris@example.com",
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const form = screen.getByTestId("login-form"); // <- add this in your LoginPage form

    fireEvent.change(within(form).getByPlaceholderText(/enter your email/i), {
      target: { value: "kris@example.com" },
    });
    fireEvent.change(within(form).getByPlaceholderText(/enter your password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(within(form).getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("kris@example.com", "password123");
      expect(alertMock).toHaveBeenCalledWith("Welcome back, kris@example.com!");
      expect(navigateMock).toHaveBeenCalledWith("/home");
    });
  });

  test("shows alert on login failure", async () => {
    (loginUser as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Invalid credentials")
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const form = screen.getByTestId("login-form"); // <- add this in your LoginPage form

    fireEvent.change(within(form).getByPlaceholderText(/enter your email/i), {
      target: { value: "kris@example.com" },
    });
    fireEvent.change(within(form).getByPlaceholderText(/enter your password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.submit(within(form).getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Login failed: Invalid credentials");
    });
  });
});

*/