# Aventura Literaria 80s (BookQuest 80s) — v2

## Novedades
- 📖 Botón **Marcar como leído**: +100 XP y cambia `estado` a `"leido"` con sonido arcade.
- 🧭 **Filtros** por `genero` y `estado`.
- 💾 **Exportar CSV / PDF** (solo datos de libros).
- 🔑 Login correo + Google, Firestore, IA (Gemini) y PWA.

## Firestore (colección `libros`)
Campos sugeridos:
- `titulo` (string)
- `autor` (string)
- `xp` (number)
- `genero` (string: "ficcion" | "clasico" | "ciencia")
- `estado` (string: "pendiente" | "leyendo" | "leido")
- `createdAt` (timestamp)

## Pasos
1. Configura Firebase en `js/firebaseConfig.js` (Auth: Email/Password + Google; Firestore en modo prueba).
2. (Opcional) Configura IA en `js/ia.js` con tu API Key de Gemini.
3. Ejecuta `server.bat` y prueba:
   - Agregar libro demo.
   - Filtros.
   - Marcar como leído.
   - Exportar CSV / PDF.
