// js/ia.js
const API_KEY = "TU_API_KEY_GEMINI";

export async function generarFrase(titulo) {
  if (!API_KEY || API_KEY.startsWith("TU_")) {
    return "Configura tu API Key de Gemini en js/ia.js para activar las frases IA.";
  }
  const prompt = `Dame una frase motivadora con estética ochentera (synthwave/arcade) para alguien que acaba de terminar el libro "${titulo}". Usa una sola oración breve.`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json();
    const frase = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return frase || "Sigue leyendo, viajero del neón.";
  } catch (e) {
    return "La IA no respondió ahora. Inténtalo más tarde.";
  }
}
