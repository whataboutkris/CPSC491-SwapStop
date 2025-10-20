import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ListingsPage from "../pages/ListingsPage";

// ----------------------
// Mock Firebase Firestore
// ----------------------
const mockOnSnapshot = vi.fn();
const mockGetDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn((_db, path, id) => ({ path, id })),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
}));

// ----------------------
// Mock Firebase DB export
// ----------------------
vi.mock("../firebase/firebase", () => ({
  db: {},
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
// Mock confirm & prompt
// ----------------------
vi.stubGlobal("confirm", vi.fn(() => true));
vi.stubGlobal("prompt", vi.fn(() => "Updated Value"));

// ----------------------
// Helper listings data
// ----------------------
const mockListings = [
  {
    id: "1",
    title: "Wireless Headphones",
    description: "Noise cancelling headphones",
    price: "120",
    images: ["https://example.com/img1.jpg"],
    type: "sale",
    brand: "Sony",
    ownerId: "user1",
  },
  {
    id: "2",
    title: "Mountain Bike",
    description: "Trail bike in good condition",
    price: "450",
    images: [],
    type: "trade",
    brand: "Giant",
    ownerId: "user2",
  },
];

// ✅ Fix: add type-safe Record for mockUsers
const mockUsers: Record<
  string,
  { exists: () => boolean; data: () => { username: string; profilePicUrl: string } }
> = {
  user1: {
    exists: () => true,
    data: () => ({ username: "Alice", profilePicUrl: "" }),
  },
  user2: {
    exists: () => true,
    data: () => ({ username: "Bob", profilePicUrl: "" }),
  },
};

// ----------------------
// Tests
// ----------------------
describe("ListingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Simulate Firestore snapshot and getDoc
    mockOnSnapshot.mockImplementation((_colRef, callback) => {
      callback({
        docs: mockListings.map((l) => ({ id: l.id, data: () => l })),
      });
      return () => {};
    });

    // ✅ Fix: type docRef to include 'id: string'
    mockGetDoc.mockImplementation(async (docRef: { id: string }) => mockUsers[docRef.id]);
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

  test("renders listings and associated user data", async () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );

    // Wait for listings to load
    await waitFor(() => {
      expect(screen.getByText(/Wireless Headphones/i)).toBeInTheDocument();
      expect(screen.getByText(/Mountain Bike/i)).toBeInTheDocument();
    });

    // Check prices
    expect(screen.getByText(/\$120/i)).toBeInTheDocument();
    expect(screen.getByText(/\$450/i)).toBeInTheDocument();

    // Check owners appear
    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob/i)).toBeInTheDocument();
    });
  });

  test("clicking submit on ListingForm calls onSuccess", async () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );

    const openModalButton = screen.getByRole("button", { name: /\+ Create Listing/i });
    fireEvent.click(openModalButton);

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    const modalWithin = within(modal);
    const submitButton = modalWithin.getByTestId("submit-button");
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("clicking delete button calls handleDelete and closes modal", async () => {
    render(
      <MemoryRouter>
        <ListingsPage />
      </MemoryRouter>
    );

    // Wait for listing to appear
    await waitFor(() => screen.getByText(/Wireless Headphones/i));

    // Click the listing to open the modal
    fireEvent.click(screen.getByText(/Wireless Headphones/i));

    // Wait for the modal dialog to appear
    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    const modalWithin = within(modal);
    const deleteButton = modalWithin.getByRole("button", { name: /Delete/i });
    expect(deleteButton).toBeInTheDocument();

    // Click Delete → should call mockDeleteDoc
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });

    // Modal should close after deletion
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
