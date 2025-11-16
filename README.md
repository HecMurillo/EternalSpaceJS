# Eternal Space

Eternal Space — Juego web indie minimalista en JavaScript, HTML y CSS.

## 🎯 Propuesta del juego

Eternal Space es un juego arcade donde controlas una pequeña nave espacial que debe esquivar meteoros que caen desde lo alto del espacio infinito. El objetivo es sobrevivir el mayor tiempo posible y conseguir la mayor puntuación.

Proyecto individual para prácticas escolares y publicación en GitHub Pages.

## 💡 Descripción

- Nombre: Eternal Space
- Género: Arcade / Endless Runner (vertical)
- Plataforma: Navegadores modernos (desktop y móvil)
- Tecnologías: HTML5, CSS3, JavaScript (Canvas API), Web Audio API
- Licencia: MIT

## 🌐 Probar en linea
https://hecmurillo.github.io/EternalSpaceJS/

## 🌐 Video Explicativo
https://drive.google.com/file/d/134Z-DqpufF-Q1kR9bYkMjOj7_bZtxg0O/view?usp=sharing

## 🎮 Mecánicas principales

- Mover la nave lateralmente con A/D o flecha izquierda/derecha.
- Al empezar la partida se reproduce aleatoriamente una pista de fondo diferente a la música del menú.
- Meteoros aparecen y caen; algunos son más rápidos para variar la dificultad.
- La velocidad general y la frecuencia de meteoros aumenta gradualmente con el tiempo.
- Puntuación aumenta en 1 punto cada 500ms (equivalente a 2 puntos por segundo).
- Juego termina al chocar con un meteoro; pantalla de fin con opciones para volver a intentar o volver al menú.

## 🎮 Controles

- Mover izquierda: A o Flecha izquierda
- Mover derecha: D o Flecha derecha
- Móvil: arrastrar el dedo a los lados (drag) para mover la nave lateralmente

## 🔊 Audio

- Música de menú (loop): archivo fijo (ej. `assets/audio/infinite-silence.mp3`).
- Música de partida: selección aleatoria de la carpeta `assets/audio/game/` al iniciar cada partida; cada "volver a intentar" elige otra pista aleatoria.
- Efectos 8‑bit generados con Web Audio API para botones y eventos (sin depender de archivos).
- Preferencia de audio (activado/desactivado) persistente en `localStorage` y aplicada en menús, partidas y tras volver al menú.

## 📱 Responsividad y accesibilidad móvil

- Diseño responsivo: UI y canvas adaptables por media queries.
- `touch-action: none` en canvas y manejo de eventos pointer/touch para drag suave.
- Botones suficientemente grandes para interacción táctil.
- Autoplay: se intenta reproducir música al cargar; si el navegador bloquea autoplay aparece botón para activar sonido. Pulsar "Jugar" también intentará activar audio.

## 🔁 Comportamiento esperado al perder

- Aparece overlay "Game Over" con:
  - Botón `Volver a intentar` → reinicia la partida y reproduce nueva pista aleatoria.
  - Botón `Volver al menú` → regresa al menú y reactiva música del menú si la preferencia está en 'on'.
- Ambos botones usan efectos 8‑bit al click.

## 🧾 Créditos

- Desarrollador: HecMurillo
- Lenguajes: JavaScript, HTML, CSS
- Licencia: MIT (archivo LICENSE incluido)
