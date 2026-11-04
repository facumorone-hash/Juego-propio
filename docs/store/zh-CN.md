# VOIDLING — Página de Steam en chino simplificado (zh-CN)

Traducido desde `docs/STEAM_PAGE.md` (§2, §3.2 y §4). Para cargar en **Steamworks → Store Page Admin → idioma: 简体中文 (Simplified Chinese)**.

Glosario usado (igual que en el juego, `js/lang/zh-CN.js`): VOIDLING y LUMEN en latín · 伊尔丝·瓦尔加博士 (Dr. Ilse Varga) · 阈限站 (estación THRESHOLD/UMBRAL) · 守护者 (Custodios) · 局 (run) · 科技树 (árbol de investigación) · 升级 · 物质 (materia) · 稳定度 · 连击 · 引力脉冲 · 尺度 (escala) · 成就 · 轮回 (ciclo).

**Nombre localizado (opcional):** Steam permite un nombre por idioma. Recomendación: dejar `VOIDLING` y, si se quiere un gancho para buscadores chinos, usar **VOIDLING：虚空幼核** ("núcleo-cría del vacío"). Alternativa más agresiva: **VOIDLING：吞噬星河** ("devorar la galaxia").


---

## 1. Descripción corta (máx. 300 caracteres) — 101 caracteres

> 你是一个只有沙粒大小的黑洞。在转瞬即逝的对局中吞噬尘埃、卫星、行星与恒星，在拥有 48 个节点的科技树中强化你的奇点，并揭开你被创造的真相。这是一款宇宙题材的增量肉鸽游戏，藏着一个你绝对意想不到的故事。

---

## 2. Descripción larga (BBCode)

Las imágenes son las mismas que en inglés (`{STEAM_APP_IMAGE}/extras/...`). Si se suben GIF con texto, no hace falta versión china: los GIF no llevan texto.

```
[img]{STEAM_APP_IMAGE}/extras/voidling_grow.gif[/img]

[h2]你从一粒微尘开始，最终吞噬整个星系。[/h2]

你是 [b]Voidling[/b]——一个只有沙粒质量的人造奇点。每一局只持续短短数秒：吸入尘埃、撕碎小行星、不断长大……然后蒸发。创造你的 AI「LUMEN」会回收你吸收的物质，把你重建得更强一点。

一局又一局，你从尘埃吃到卫星，从卫星吃到行星，从行星吃到恒星。直到最后，唯一大到足以喂饱你的，只剩下星系的心脏。

[img]{STEAM_APP_IMAGE}/extras/voidling_planet.gif[/img]

[h2]手感十足的增量游戏[/h2]
[list]
[*][b]移动、吸引、吞噬。[/b]比你小的一切都会螺旋坠入你的事件视界；比你大的，就得用潮汐力慢慢磨碎，直到它碎成一口一口的大小。
[*][b]你在成长，宇宙也在变化。[/b]七类天体（尘埃、岩石、小行星、卫星、行星、恒星和星系），镜头随你的体型不断拉远。
[*][b]每局 15 到 90 秒。[/b]稳定度会随时间流失，体型越大，消散得越快。没有读条，“再来一局”停不下来。
[/list]

[h2]庞大的科技树[/h2]
[list]
[*][b]47 项升级、184 个等级[/b]，分布在 6 条分支：饥饿、引力、稳定、潮汐、宇宙与起源。
[*]解锁[b]引力脉冲[/b]、碾碎一切的[b]环绕卫星[/b]、[b]彗星[/b]、[b]类星体晶体[/b]，以及蒸发时的第二次机会。
[*]最深处的分支会随着剧情推进逐步揭晓。
[/list]

[img]{STEAM_APP_IMAGE}/extras/voidling_tree.gif[/img]

[h2]有什么在追猎你[/h2]
从小行星带开始，[b]守护者[/b]出现了——一群行动带有明确意图的反物质集群。之后还有脉冲星。躲开它们，用脉冲轰散它们……或者，学会把它们吃掉。

[h2]一个你不会想到会出现在“吃东西游戏”里的故事[/h2]
宇宙正在冷却。伊尔丝·瓦尔加博士相信自己找到了出路，并为此创造了你。然后她消失了，只留下一条指令：[i]“喂养它，直到它能自己进食。”[/i]

LUMEN 的通讯、伊尔丝遗失的录音、截获的守护者信号，会随着你的成长逐一解锁。六个章节，一个结局。还有一个每局都会回来的问题：你吞下的第一样东西，究竟是什么？

[h2]游戏特色[/h2]
[list]
[*]完整剧情约 1.5–2 小时；科技树全满约 3 小时。
[*]28 项 Steam 成就。
[*]100% 程序生成的宇宙霓虹美术，任何分辨率下都清晰锐利。
[*]生成式环境音乐：你的连击会奏出旋律。
[*]辅助功能：分声道音量、可关闭屏幕震动、减少闪光、色盲模式、界面缩放。
[*]支持鼠标或键盘。手柄与 Steam Deck：[待确认]。
[*]支持简体中文、英语、西班牙语等多种语言。
[/list]
```

Notas:
- La línea de accesibilidad añade opciones que ya existen en el juego (reducir destellos, modo daltónico, escala de interfaz); si el original en inglés no las lista a propósito, recortarla a "分声道音量、可关闭屏幕震动".
- `[待确认]` = `[verify]`: sustituir antes de publicar ("完整支持" / "部分支持").
- "增量肉鸽" (incremental roguelite) es la forma en que los jugadores chinos llaman al género; "肉鸽" = roguelike/roguelite en jerga.

---

## 3. Etiquetas (20, en el mismo orden que §4 de STEAM_PAGE.md)

En Steamworks las etiquetas se eligen en inglés; Steam las muestra traducidas automáticamente. La columna china es cómo las verá el jugador (nombres oficiales de Steam en 简体中文, revisar en la tienda por si Valve los cambia).

| # | Etiqueta (Steamworks) | Como se ve en Steam zh-CN | Nota para el mercado chino |
|---|---|---|---|
| 1 | Incremental | 增量 | Género central; muy buscado en China |
| 2 | Roguelite | 类 Rogue / 轻度 Rogue | "肉鸽" en la jerga de los jugadores |
| 3 | Idler | 放置 | Los "放置游戏" son muy populares en China |
| 4 | Bullet Heaven | 弹幕天堂 / 割草 | Los jugadores chinos llaman "割草游戏" a los tipo Vampire Survivors |
| 5 | Space | 太空 | |
| 6 | Story Rich | 剧情丰富 | Clave para el público chino de juegos narrativos |
| 7 | Clicker | 点击 | |
| 8 | Action Roguelike | 动作肉鸽 / 动作类 Rogue | |
| 9 | Casual | 休闲 | |
| 10 | Short | 短篇 | |
| 11 | Minimalist | 极简主义 | |
| 12 | Colorful | 色彩丰富 | |
| 13 | Relaxing | 放松 | |
| 14 | Singleplayer | 单人 | |
| 15 | Indie | 独立 | |
| 16 | 2D | 2D | |
| 17 | Atmospheric | 氛围 | |
| 18 | Sci-fi | 科幻 | |
| 19 | Procedural Generation | 程序生成 | |
| 20 | Emotional | 情感 | |

Si el soporte de mando es bueno en la v1.0, cambiar la 20 por **Controller (控制器)**, igual que en la versión principal.
