import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAddressFromZip = createServerFn({ method: "GET" })
  .inputValidator((data) => z.string().min(8).parse(data))
  .handler(async ({ data: zip }) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zip.replace(/\D/g, "")}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        throw new Error("CEP não encontrado");
      }
      
      return {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      };
    } catch (error) {
      console.error("Error fetching address:", error);
      throw new Error("Erro ao buscar endereço");
    }
  });

export const calculateDeliveryDistance = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    destination: z.string().min(5)
  }).parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env['LOVABLE_API_KEY'];
    const GOOGLE_MAPS_API_KEY = process.env['GOOGLE_MAPS_API_KEY'];
    const origin = "R. Santa Maria, 714, Pedra Azul, Contagem - MG, 32183-970";

    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      throw new Error("Integração de mapas indisponível. Tente novamente mais tarde.");
    }

    const response = await fetch(
      "https://connector-gateway.lovable.dev/google_maps/routes/distanceMatrix/v2:computeRouteMatrix",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "originIndex,destinationIndex,distanceMeters,status,condition",
        },
        body: JSON.stringify({
          origins: [{ waypoint: { address: origin } }],
          destinations: [{ waypoint: { address: data.destination } }],
          travelMode: "DRIVE",
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Google Maps gateway falhou [${response.status}]: ${errorBody}`);
      throw new Error(`Erro ao calcular distância [${response.status}].`);
    }

    const result = (await response.json()) as Array<{
      distanceMeters?: number;
      condition?: string;
    }>;
    const element = Array.isArray(result) ? result[0] : undefined;

    if (!element || element.condition !== "ROUTE_EXISTS" || typeof element.distanceMeters !== "number") {
      throw new Error("Não foi possível encontrar uma rota para o endereço informado. Verifique o número e o CEP.");
    }

    console.log("DISTÂNCIA DA ROTA (API):", element.distanceMeters, "metros ->", data.destination);

    return {
      distanceMeters: element.distanceMeters,
      simulated: false,
      origin,
      destination: data.destination,
    };
  });

