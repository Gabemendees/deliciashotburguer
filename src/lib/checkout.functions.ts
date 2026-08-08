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
    
    // In a real scenario, we would use Google Distance Matrix API.
    // Since I don't have the API Key yet, I'll implement a robust placeholder 
    // that informs the developer how to proceed and simulates logic for demonstration
    // if the key is missing, or uses the API if present.
    
    const origin = "R. Santa Maria, 714, Pedra Azul, Contagem - MG, 32183-970";
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("GOOGLE_MAPS_API_KEY not found. Simulating distance calculation.");
      // Simulation for demo purposes until API Key is added via add_secret
      // Let's simulate a distance based on the length of the string to make it non-random
      const simulatedDistance = (data.destination.length % 5) + 1.5; 
      return { distance: simulatedDistance, simulated: true };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(data.destination)}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.rows[0].elements[0].status === "OK") {
        const distanceValue = result.rows[0].elements[0].distance.value; // distance in meters
        return { distance: distanceValue / 1000, simulated: false };
      } else {
        throw new Error("Não foi possível calcular a distância");
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      throw new Error("Erro no cálculo de distância");
    }
  });
