# VOIDLING — Plan de lanzamiento, dinero y fechas

Fecha: 3 de noviembre de 2026 · Objetivo: **USD 6.000 netos**

---

## 1. Dónde y cómo gana dinero

| Canal | Modelo | Rol | Ingreso esperado |
|---|---|---|---|
| **Steam** (principal) | Pago único USD 4,99 · sin anuncios | Fuente principal de dinero | La mayor parte del objetivo |
| **CrazyGames** (web) | Gratis con anuncios entre partidas + anuncio opcional "x2 materia" | Ingreso extra + miles de jugadores probando el juego | Variable; pagan mensualmente vía Tipalti a partir de 100 € acumulados |
| **itch.io / galaxy.click** (web) | Gratis / "paga lo que quieras" | Embudo hacia Steam: la comunidad de incrementales vive ahí | Bajo, pero trae deseados y opiniones |

**Por qué este modelo:** el público de incrementales en PC odia los anuncios en juegos pagos, pero acepta muy bien los anuncios en juegos web gratuitos. La misma base de código sirve para las dos cosas: la capa `js/platform.js` ya está programada.

### Cuánto hay que vender

Por cada copia a USD 4,99 te llegan aproximadamente **USD 2,40–2,80** después de:
- el 30 % de Steam,
- precios regionales más bajos (Latinoamérica, Turquía, Asia),
- IVA/impuestos incluidos en el precio en muchos países,
- reembolsos (~5–10 %),
- la retención de impuestos de EE. UU. sobre las ventas en ese país (Argentina no tiene tratado fiscal con EE. UU.; Steam retiene el 30 % de lo vendido allí, alrededor del 10 % del total). **Confírmalo con un contador.**

➡️ **USD 6.000 ≈ 2.200–2.500 copias**, más lo que aporte la web.

Regla práctica del mercado: entre el 10 y el 20 % de los "deseados" (wishlists) compran en la primera semana. Para llegar a ~2.400 copias en el primer año conviene lanzar con **7.000–10.000 deseados**.

### Escenarios honestos (primeros 12 meses en Steam)

| Escenario | Copias | Neto aprox. | Qué tiene que pasar |
|---|---|---|---|
| Pesimista | 300–800 | USD 700–2.000 | Se lanza sin marketing |
| Medio | 1.500–3.000 | USD 3.600–8.000 | Página temprana + Next Fest + clips constantes en redes |
| Optimista | 10.000+ | USD 25.000+ | Un clip viral o un streamer grande lo juega |

**Advertencia sincera:** la mayoría de los juegos de Steam no llega a los USD 6.000. Voidling tiene ventajas reales (género con demanda probada, precio de impulso, historia que lo diferencia, coste de producción casi cero), pero **el resultado depende sobre todo del marketing de los próximos 3 meses**, no solo de la calidad. No es un ingreso garantizado: no te endeudes contando con él.

---

## 2. Calendario

### Lo que ya está hecho (3 de noviembre, v1.0.0)
- ✅ **v1.0.0 completa:** jefe final, cinemática del Big Bang, 7 idiomas, 28 logros, mando y Steam Deck, accesibilidad, ejecutables de Windows (juego y demo), builds web/CrazyGames/itch, arte de tienda y modo tráiler, 25 pruebas automáticas.
- ✅ Juego completo jugable de principio a fin: 6 escalas, 48 nodos de mejora, jefe final, enemigos, habilidades, historia completa con final, música y sonido, ES/EN, guardado.
- ✅ Simulador de balance.
- ✅ Documento de diseño (`GDD.md`).

### Calendario recomendado (elegido: lanzamiento en marzo de 2027)

| Fechas | Qué | Quién |
|---|---|---|
| **3–9 nov** | Crear cuenta en **Steamworks**, pagar los USD 100 de Steam Direct, cargar datos fiscales (formulario W-8BEN) y bancarios, verificar identidad. **Es lo más urgente:** la verificación puede tardar 1–2 semanas y Steam exige **30 días** entre el pago y el lanzamiento. | **Tú** (nadie puede hacerlo por ti) |
| **3–9 nov** | Crear cuenta de desarrollador en **CrazyGames** y en **itch.io**. Abrir TikTok/YouTube del juego. | **Tú** |
| **3–7 nov** (acelerado) | v1.0: mando y Steam Deck, logros, púlsares, enjambres, jefe final, modo daltónico, ejecutable para Windows (Electron + Steamworks), música por escalas, arte de tienda y tráiler. 7 agentes en paralelo. **Meta: viernes 6 de noviembre.** | Claude Code (agentes en paralelo) |
| **10–17 nov** | Pruebas con **5–10 personas reales** (amigos, Discord, r/incremental_games). Anotar dónde se aburren. | Tú consigues a los testers; yo ajusto |
| **~18 nov** | Enviar la **página de Steam "Próximamente"**: cápsulas, 5+ capturas, tráiler de 30–60 s, descripción ES/EN. Revisión de Valve: ~3–5 días hábiles. | Preparamos juntos; tú lo subes |
| **~20 nov** | Versión web en **CrazyGames** (su revisión tarda 1–2 semanas), **itch.io** y **galaxy.click** con enlace a Steam. | Juntos |
| **Dic – ene** | Marketing: 3 clips por semana (el "crecer de mota a galaxia" en 15 s es ideal para Shorts y TikTok), publicaciones en Reddit, contactar creadores de contenido de incrementales. Actualizar la web según las opiniones. | Tú publicas; yo genero clips e ideas |
| **Feb 2027** | **Steam Next Fest** con demo (prólogo + capítulos 1–2). Es el mayor impulso gratuito de deseados del año. Revisar fechas e inscripción en Steamworks: la inscripción cierra semanas antes. | Juntos |
| **Inicio de mar 2027** | **Lanzamiento en Steam** a USD 4,99 con 15 % de descuento de lanzamiento. | — |
| **Fines de abr 2027** | **Primer pago de Steam** (Valve paga cada mes, unos 30 días después del cierre del mes de ventas). | — |

### Alternativa rápida (si necesitas el dinero antes)

| | Rápido | Recomendado |
|---|---|---|
| Lanzamiento en Steam | ~10–15 dic 2026 | Inicio de mar 2027 |
| Primer pago | Fines de ene 2027 | Fines de abr 2027 |
| Deseados al lanzar | Pocos (solo ~3 semanas de página) | Muchos (3 meses + Next Fest) |
| Ventas probables | Bastante menores | Mayores |
| Ingreso web (CrazyGames) | Desde dic | Desde dic |

Lanzar en diciembre también te hace competir con las rebajas de invierno de Steam. **Mi recomendación es marzo**: la diferencia de ventas suele ser mucho mayor que esos 3 meses de espera. La versión web en CrazyGames puede empezar a generar algo desde diciembre en ambos casos.

---

## 3. Página de Steam (lo que más vende)

- **Cápsula principal:** el agujero negro en primer plano devorando un gigante gaseoso, con "VOIDLING" en el degradado naranja-violeta del logo. Debe leerse bien en miniatura.
- **Frase corta:** *"Empiezas como una mota. Terminas devorando la galaxia."*
- **Etiquetas:** Incremental, Roguelite, Idler, Clicker, Bullet Heaven, Space, Story Rich, Short, Minimalist, Relaxing, Singleplayer, Steam Deck.
- **GIF/tráiler:** los primeros 3 segundos muestran el crecimiento (de polvo a planeta). Después, el árbol y una frase de la historia ("Fue lo primero que devoraste.").
- **Precio:** USD 4,99. El nicho de 5–10 USD rinde mejor que el de menos de 5 en bullet heaven, y 4,99 sigue siendo compra por impulso.

---

## 4. Presupuesto

| Concepto | Coste | ¿Obligatorio? |
|---|---|---|
| Steam Direct | USD 100 (se recupera cuando el juego factura USD 1.000) | Sí |
| Artista de cápsula de Steam | USD 150–400 | Recomendado |
| Música compuesta / licencia | USD 0–200 | Opcional (la generativa ya funciona) |
| CrazyGames, itch.io, redes | USD 0 | — |
| **Total mínimo** | **USD 100** | |

---

## 5. Qué necesito de ti ahora

1. **Crear la cuenta de Steamworks y pagar los USD 100 esta semana.** Es lo que más retrasa todo y solo puedes hacerlo tú (identidad, banco, impuestos).
2. **Jugar el juego 20–30 minutos** y decirme qué te aburre o qué no se entiende.
3. **Elegir el calendario:** rápido (diciembre) o recomendado (marzo).
4. Conseguir 5–10 personas que lo prueben.
