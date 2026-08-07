import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#fcfbf8] p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        PROMPT PARA LOVABLE — SITE DELÍCIA'S HOT BURGUER'S
      </h1>
      <p className="text-gray-700">
        Crie um site completo, moderno, profissional e responsivo para uma hamburgueria chamada{" "}
        <strong>DELÍCIA'S HOT BURGUER'S</strong>.
      </p>
      {/* Rest of the content would go here, but I will focus on implementing the structure first. */}
    </div>
  );
}
