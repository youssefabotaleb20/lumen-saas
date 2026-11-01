import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PricingTable } from "@/components/pricing-table";

describe("PricingTable", () => {
  it("shows monthly prices first and switches to yearly", async () => {
    const user = userEvent.setup();
    render(<PricingTable mode="marketing" />);

    expect(screen.getByTestId("price-pro")).toHaveTextContent("$12");
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: /Yearly/ }));

    expect(screen.getByTestId("price-pro")).toHaveTextContent("$10");
    expect(screen.getByText("$120 billed yearly")).toBeInTheDocument();
  });

  it("can be switched with the keyboard", async () => {
    const user = userEvent.setup();
    render(<PricingTable mode="marketing" />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Monthly" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: /Yearly/ })).toBeChecked();
  });

  it("links every plan to sign-up on the marketing site", () => {
    render(<PricingTable mode="marketing" />);
    expect(screen.getByRole("link", { name: "Start for free" })).toHaveAttribute("href", "/sign-in");
    expect(screen.getByRole("link", { name: "Choose Pro" })).toHaveAttribute("href", "/dashboard/billing");
  });

  it("offers upgrades to a Free user in the dashboard", () => {
    render(<PricingTable mode="billing" currentPlan="free" checkoutAction={vi.fn()} />);
    const plans = screen.getByRole("list", { name: "Plans" });
    expect(within(plans).getByRole("button", { name: "Your current plan" })).toBeDisabled();
    expect(within(plans).getByRole("button", { name: "Upgrade to Pro, billed monthly" })).toBeEnabled();
    expect(within(plans).getByRole("button", { name: "Upgrade to Team, billed monthly" })).toBeEnabled();
  });

  it("sends paying users to the portal instead of a second checkout", () => {
    render(<PricingTable mode="billing" currentPlan="pro" checkoutAction={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Upgrade to/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("Switch plans from Manage billing.")).toHaveLength(1);
  });

  it("disables upgrades when billing is not configured", () => {
    render(<PricingTable mode="billing" currentPlan="free" checkoutAction={vi.fn()} billingEnabled={false} />);
    expect(screen.getByRole("button", { name: "Upgrade to Pro, billed monthly" })).toBeDisabled();
  });
});
