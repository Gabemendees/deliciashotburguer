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
    
    console.log("--- DEBUG CÁLCULO DE DISTÂNCIA ---");
    console.log("ORIGEM:", origin);
    console.log("DESTINO:", data.destination);

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("GOOGLE_MAPS_API_KEY não configurada. Falhando conforme solicitado.");
      throw new Error("Não foi possível calcular a distância real (API Key ausente).");
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(data.destination)}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.status === "OK" && result.rows?.[0]?.elements?.[0]?.status === "OK") {
        const distanceValue = result.rows[0].elements[0].distance.value; // distância em metros
        const distanceText = result.rows[0].elements[0].distance.text;
        
        console.log("DISTÂNCIA DA ROTA (API):", distanceValue, "metros");
        console.log("TEXTO DA DISTÂNCIA:", distanceText);
        
        return { 
          distanceMeters: distanceValue, 
          simulated: false,
          origin,
          destination: data.destination
        };
      } else {
        const elementStatus = result.rows?.[0]?.elements?.[0]?.status || "UNKNOWN_ELEMENT_STATUS";
        const topStatus = result.status || "UNKNOWN_TOP_STATUS";
        console.error("Erro na API Distance Matrix:", topStatus, "/", elementStatus);
        
        if (elementStatus === "ZERO_RESULTS" || elementStatus === "NOT_FOUND") {
          throw new Error("Não foi possível encontrar uma rota para o endereço informado. Verifique o número e o CEP.");
        }
        
        throw new Error(`Erro ao calcular distância (${elementStatus}). Tente novamente.`);
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      throw error instanceof Error ? error : new Error("Erro no cálculo de distância");
    }
  });
