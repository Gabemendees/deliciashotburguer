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
    destination: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const GOOGLE_MAPS_API_KEY = process.env['GOOGLE_MAPS_API_KEY'];
    const origin = "R. Santa Maria, 714, Pedra Azul, Contagem - MG, 32183-970";
    
    console.log("--- CÁLCULO DE DISTÂNCIA ---");
    console.log("ORIGEM:", origin);
    console.log("DESTINO:", data.destination);

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("GOOGLE_MAPS_API_KEY not found. Simulating distance calculation.");
      // Simulated robust distance based on common testing addresses in the region
      // If destination contains specific keywords, we can return deterministic values for testing
      let simulatedDistanceInMeters = 2000; // Default 2km
      if (data.destination.toLowerCase().includes("contagem")) {
        simulatedDistanceInMeters = 5234; // 5.23km
      }
      
      console.log("DISTÂNCIA EM METROS (SIMULADA):", simulatedDistanceInMeters);
      return { 
        distanceMeters: simulatedDistanceInMeters, 
        simulated: true,
        origin,
        destination: data.destination
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(data.destination)}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.rows?.[0]?.elements?.[0]?.status === "OK") {
        const distanceValue = result.rows[0].elements[0].distance.value; // distance in meters
        console.log("DISTÂNCIA EM METROS (API):", distanceValue);
        return { 
          distanceMeters: distanceValue, 
          simulated: false,
          origin,
          destination: data.destination
        };
      } else {
        const status = result.rows?.[0]?.elements?.[0]?.status || "UNKNOWN_ERROR";
        console.error("API Response Status:", status);
        throw new Error(`Não foi possível localizar o endereço com precisão (${status}). Verifique o CEP, número e endereço informado.`);
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      throw error instanceof Error ? error : new Error("Erro no cálculo de distância");
    }
  });
