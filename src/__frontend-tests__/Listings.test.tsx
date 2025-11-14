import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ListingsPage from "../pages/ListingsPage";

// ----------------------
// Mock Firebase Firestore
// ----------------------
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn((_ref, cb) => {
    cb({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "Mock Headphones",
            description: "Noise cancelling headphones",
            price: "120",
            images: ["https://example.com/img1.jpg"],
            type: "sale",
            brand: "Sony",
            ownerId: "user1",
          }),
        },
      ],
    });
    return vi.fn(); 
  }),
  deleteDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ username: "Alice", profilePicUrl: "" }),
    })
  ),
  addDoc: vi.fn(() => Promise.resolve()),
  setDoc: vi.fn(() => Promise.resolve()),
  getFirestore: vi.fn(), // needed to satisfy Vitest
  query: vi.fn(),
  where: vi.fn(),
}));

// ----------------------
// Mock Firebase Storage
// ----------------------
vi.mock("firebase/storage", () => ({
  ref: vi.fn(() => ({})), // dummy ref
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve("https://example.com/uploaded.jpg")),
}));

// ----------------------
// Mock Firebase Auth
// ----------------------
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: "user1" },
  })),
}));

// ----------------------
// Mock Firebase DB export
// ----------------------
vi.mock("../firebase/firebase", () => ({
  db: {},
  storage: {},
}));

// ----------------------
// Mock Components
// ----------------------
vi.mock("../components/NavBar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock("../components/ListingForm", () => ({
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <div>
      <p data-testid="listing-form">Mock Listing Form</p>
      <button data-testid="submit-button" onClick={onSuccess}>
        Submit
      </button>
    </div>
  ),
}));

// ----------------------
// Mock AI Price Estimator
// ----------------------
vi.mock("../GoogleAI/AiPriceEstimator", () => ({
  estimatePriceFromImage: vi.fn(() =>
    Promise.resolve({
      avgPrice: "$100",
      listings: [
        { title: "Headphones A", price: "100", url: "https://example.com/a" },
        { title: "Headphones B", price: "120", url: "https://example.com/b" },
      ],
    })
  ),
}));

// ----------------------
// Mock confirm & prompt
// ----------------------
vi.stubGlobal("confirm", vi.fn(() => true));
vi.stubGlobal("prompt", vi.fn(() => "Updated Value"));
vi.stubGlobal("alert", vi.fn());

// ----------------------
// Tests
// ----------------------
describe("ListingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders navbar and page heading", () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Marketplace/i })).toBeInTheDocument();
  });

  test("renders listing cards with owner info", async () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );

    // Wait for listing to render
    await waitFor(() => {
      expect(screen.getByText(/Mock Headphones/i)).toBeInTheDocument();
    });

    // Check price
    expect(screen.getByText(/\$120/i)).toBeInTheDocument();
    // Check owner
    expect(screen.getByText(/Alice/i)).toBeInTheDocument();
  });

  test("opens create listing modal and submits", async () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /\+ Create Listing/i });
    fireEvent.click(createButton);

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    const submitButton = within(modal).getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("deletes a listing", async () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );

    // Open listing
    fireEvent.click(await screen.findByText(/Mock Headphones/i));

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    const deleteButton = within(modal).getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("runs AI price estimator", async () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );

    // Open listing
    fireEvent.click(await screen.findByText(/Mock Headphones/i));
    const modal = await screen.findByRole("dialog");

    const aiButton = within(modal).getByRole("button", { name: /Price Estimator/i });
    fireEvent.click(aiButton);

    await waitFor(() => {
      expect(screen.getByText(/💡 \$100/i)).toBeInTheDocument();
    });
  });
});
