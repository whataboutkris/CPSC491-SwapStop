/* Commented out conflicts with front end tests

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/Register.tsx";

// ----------------------
// Mock Firebase modules
// ----------------------
vi.mock("../firebase/auth.js", () => ({
  registerUser: vi.fn(),
}));

vi.mock("../firebase/firebase.ts", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

import { registerUser } from "../firebase/auth.js";
import { setDoc } from "firebase/firestore";

// ----------------------
// Mock alert
// ----------------------
const alertMock = vi.fn();
vi.stubGlobal("alert", alertMock);

// ----------------------
// Helper to render with router
// ----------------------
function renderWithRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

// ----------------------
// Tests
// ----------------------
describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the register form", () => {
    renderWithRouter(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: /create a swapstop account/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/choose a username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
  });

  test("shows alert if passwords do not match", async () => {
    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/choose a username/i), {
      target: { value: "kris" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "kris@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), {
      target: { value: "different123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Passwords do not match!");
    });
  });

  test("registers user and saves to Firestore", async () => {
    // Type-safe Firebase Auth mock
    (registerUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      uid: "123",
      email: "kris@example.com",
      emailVerified: false,
      isAnonymous: false,
      metadata: {} as any,
      phoneNumber: null,
      providerData: [],
      reload: async () => {},
      tenantId: null,
      delete: async () => {},
      refreshToken: "",
      toJSON: () => ({}),
      getIdToken: async () => "token",
      getIdTokenResult: async () => ({ token: "token" }),
      displayName: null,
      photoURL: null,
      providerId: "firebase",
    });

    (setDoc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/choose a username/i), {
      target: { value: "kris" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "kris@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith("kris@example.com", "password123");
      expect(setDoc).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith("Account created for kris!");
    });
  });

  test("handles Firebase errors gracefully", async () => {
    (registerUser as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Firebase error")
    );

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/choose a username/i), {
      target: { value: "kris" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "kris@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Error creating account: Firebase error"
      );
    });
  });
});

*/