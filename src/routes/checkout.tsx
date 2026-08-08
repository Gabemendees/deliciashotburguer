import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout")({
  component: () => <div className="p-8">Checkout em breve...</div>,
});
