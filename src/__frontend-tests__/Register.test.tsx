import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../pages/Register";

// ----------------------
// Mock Firebase Auth
// ----------------------
const mockRegisterUser = vi.fn((email: string, _password: string) =>
  Promise.resolve({ uid: "mockUser123", email })
);

vi.mock("../firebase/auth.ts", () => ({
  registerUser: (email: string, password: string) => mockRegisterUser(email, password),
}));

// ----------------------
// Mock Firestore
// ----------------------
const mockDoc = vi.fn((db: any, collection: string, uid: string) => ({ db, collection, uid }));
const mockSetDoc = vi.fn((_docRef: any, _data: any) => Promise.resolve());

vi.mock("firebase/firestore", () => ({
  doc: (db: any, collection: string, uid: string) => mockDoc(db, collection, uid),
  setDoc: (docRef: any, data: any) => mockSetDoc(docRef, data),
}));

vi.mock("../firebase/firebase", () => ({
  db: {},
}));

// ----------------------
// Mock NavBar
// ----------------------
vi.mock("../components/NavBar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

// ----------------------
// Mock react-router-dom navigate
// ----------------------
export const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ----------------------
// Mock alert
// ----------------------
vi.stubGlobal("alert", vi.fn());

// ----------------------
// Tests
// ----------------------
describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders navbar and heading", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Create a SwapStop Account/i })).toBeInTheDocument();
  });

  test("allows typing in all input fields", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/Choose a username/i);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const confirmInput = screen.getByPlaceholderText(/Confirm your password/i);

    fireEvent.change(usernameInput, { target: { value: "TestUser" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.change(confirmInput, { target: { value: "123456" } });

    expect(usernameInput).toHaveValue("TestUser");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("123456");
    expect(confirmInput).toHaveValue("123456");
  });

  test("alerts if passwords do not match", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: "123" } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), { target: { value: "456" } });

    fireEvent.submit(screen.getByRole("button", { name: /Register/i }).closest("form")!);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith("Passwords do not match!");
    });
  });

test("renders headings and description text", () => {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /Create a SwapStop Account/i })).toBeInTheDocument();
  expect(
    screen.getByText(/Join SwapStop and start bartering, buying, and selling sustainably/i)
  ).toBeInTheDocument();
});

test("renders the NavBar component", () => {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

  expect(screen.getByTestId("navbar")).toBeInTheDocument();
});

test("renders all input placeholders", () => {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

  expect(screen.getByPlaceholderText(/Choose a username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Confirm your password/i)).toBeInTheDocument();
});

test("renders login link with correct href", () => {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

  const loginLink = screen.getByText(/Login/i);
  expect(loginLink).toBeInTheDocument();
  expect(loginLink).toHaveAttribute("href", "/login");
});
});
