// js/ia.js — Frases retro + máquina de escribir + voz robótica sincronizada
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

// 🔹 Generar frase retro aleatoria y mostrar con efecto + voz
export async function generarFrase(tituloLibro = "tu lectura") {
  await new Promise((r) => setTimeout(r, 700)); // Simula IA pensando
  const randomIndex = Math.floor(Math.random() * frasesRetro.length);
  const frase = frasesRetro[randomIndex].replace("tu lectura", tituloLibro);
  await escribirTextoConEfecto("fraseIA", frase);
  reproducirVozRobotica(frase);
  return frase;
}

// ✨ Efecto máquina de escribir (devuelve promesa para sincronizar)
function escribirTextoConEfecto(elementId, texto, velocidad = 35) {
  return new Promise((resolve) => {
    const elemento = document.getElementById(elementId);
    if (!elemento) return resolve();
    elemento.textContent = "";
    let i = 0;
    const intervalo = setInterval(() => {
      elemento.textContent += texto.charAt(i);
      i++;
      if (i >= texto.length) {
        clearInterval(intervalo);
        resolve();
      }
    }, velocidad);
  });
}

// 🔊 Reproducir voz robótica retro (Speech Synthesis API)
function reproducirVozRobotica(texto) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utter = new SpeechSynthesisUtterance(texto);

    // Buscar voz con tono robótico o español
    const voces = synth.getVoices();
    const vozRobot =
      voces.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("google español")) ||
      voces.find(v => v.lang.startsWith("es")) ||
      voces[0];

    utter.voice = vozRobot;
    utter.lang = "es-ES";
    utter.rate = 1.0;   // velocidad normal
    utter.pitch = 0.65; // tono más grave, efecto robot
    utter.volume = 1;   // volumen máximo

    synth.cancel();     // detener voz anterior
    synth.speak(utter);
  } catch (err) {
    console.warn("🎙️ Error al usar la voz robótica:", err);
  }
}

