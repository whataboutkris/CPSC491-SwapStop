import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Listings from "../pages/ListingsPage.tsx";

// ----------------------
// Mock NavBar
// ----------------------
vi.mock("../components/NavBar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

// ----------------------
// Mock Button component
// ----------------------
vi.mock("../components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// ----------------------
// Mock alert
// ----------------------
const alertMock = vi.fn();
vi.stubGlobal("alert", alertMock);

// ----------------------
// Tests
// ----------------------
describe("Listings page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Listings page heading and navbar", () => {
    render(
      <MemoryRouter>
        <Listings />
      </MemoryRouter>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /browse listings/i })).toBeInTheDocument();
  });

  test("renders all dummy listings", () => {
    render(
      <MemoryRouter>
        <Listings />
      </MemoryRouter>
    );

    const listings = screen.getAllByRole("img");
    expect(listings.length).toBe(4); // 4 dummy listings

    expect(screen.getByText(/Wireless Headphones/i)).toBeInTheDocument();
    expect(screen.getByText(/Vintage Gaming Laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/Vintage Camera/i)).toBeInTheDocument();
    expect(screen.getByText(/Mountain Bike/i)).toBeInTheDocument();
  });

  test("clicking View button triggers alert with correct title", () => {
    render(
      <MemoryRouter>
        <Listings />
      </MemoryRouter>
    );

    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    expect(viewButtons.length).toBe(4);

    viewButtons.forEach((button, index) => {
      fireEvent.click(button);
      const titles = ["Wireless Headphones", "Vintage Gaming Laptop", "Vintage Camera", "Mountain Bike"];
      expect(alertMock).toHaveBeenCalledWith(`Viewing ${titles[index]} (PLACEHOLDER)`);
    });
  });
});
