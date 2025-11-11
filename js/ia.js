// js/ia.js — Simulación local de IA (modo retro)
const frasesRetro = [
  "🌌 Cada página que lees enciende un nuevo pixel en tu universo mental.",
  "💾 Tu mente se está actualizando... conocimiento instalado con éxito.",
  "🚀 Leer es el viaje más rápido a cualquier galaxia del tiempo.",
  "🕹️ Subiste de nivel en sabiduría. ¡No olvides guardar tu progreso!",
  "📖 En cada libro hay un portal, solo los valientes se atreven a abrirlo.",
  "💡 Cada palabra que lees brilla con luz neón dentro de ti.",
  "🎧 Las historias también tienen banda sonora, ¡escúchalas en tu imaginación!",
  "🧠 El verdadero poder retro: aprender algo nuevo cada día.",
  "💫 La nostalgia se lee entre líneas. Sigue explorando.",
  "🔥 Un lector ochentero nunca se rinde, solo cambia de misión.",
  "⚡ Tus ideas son más brillantes que un cartucho nuevo en la consola del saber.",
  "🌠 Cada libro que terminas deja un brillo permanente en tu memoria RAM.",
  "🎮 La lectura es tu joystick para controlar el universo del conocimiento.",
  "💎 Cada palabra que comprendes es un cristal de experiencia retro.",
  "🧩 Leer es desbloquear un nivel secreto en tu mente digital."
];

// 🔹 Función principal (simulada)
export async function generarFrase(tituloLibro = "tu lectura") {
  // Simula un pequeño retardo para dar efecto “IA pensando”
  await new Promise((r) => setTimeout(r, 800));

  const randomIndex = Math.floor(Math.random() * frasesRetro.length);
  const frase = frasesRetro[randomIndex].replace("tu lectura", tituloLibro);
  return frase;
}

