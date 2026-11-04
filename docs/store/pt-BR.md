# VOIDLING — Página de Steam en portugués de Brasil (pt-BR)

Traducción de `docs/STEAM_PAGE.md` (§2, §3 y §4). En Steamworks: **Store Page Admin → idioma "Portuguese - Brazil"**. Las marcas **[verificar]** son las mismas que en el documento original: confírmalas antes de publicar.

Glosario usado (igual que en el juego, `js/lang/pt-BR.js`): THRESHOLD/UMBRAL → **LIMIAR** · Custodians → **Custódios** · matter → **matéria** · run → **partida** · research tree → **árvore de pesquisa** · upgrade → **melhoria** · Steam → "**na** Steam" (femenino, como lo usa Valve en Brasil).

---

## 1. Descripción corta (máx. 300 caracteres)

**pt-BR (288 caracteres):**
> Você é um buraco negro do tamanho de um grão de areia. Devore poeira, luas, planetas e estrelas em partidas de segundos, aprimore sua singularidade numa árvore de pesquisa de 48 nós e descubra por que você foi criado. Um roguelite incremental cósmico com uma história que você não espera.

*(Recuento con `node -e "console.log('...'.length)"`.)*

---

## 2. Descripción larga (BBCode de Steam)

Los GIF son los mismos que en inglés (no llevan texto); si se hacen versiones localizadas, cambiar el nombre del archivo.

```
[img]{STEAM_APP_IMAGE}/extras/voidling_grow.gif[/img]

[h2]Você começa como uma partícula. E termina devorando a galáxia.[/h2]

Você é [b]Voidling[/b], uma singularidade artificial com a massa de um grão de areia. Cada partida dura segundos: você atrai poeira, despedaça asteroides, cresce... e evapora. LUMEN, a IA que criou você, recupera a matéria que você absorveu e reconstrói você um pouco mais forte.

Partida após partida, você passa da poeira às luas, das luas aos planetas, dos planetas às estrelas. Até que a única coisa grande o bastante para alimentar você seja o coração da galáxia.

[img]{STEAM_APP_IMAGE}/extras/voidling_planet.gif[/img]

[h2]Um incremental que você sente na mão[/h2]
[list]
[*][b]Mova, atraia, devore.[/b] Tudo o que é menor que você cai em espiral no seu horizonte de eventos. O que é maior precisa ser desgastado pela força de maré até se partir em pedaços do tamanho de uma mordida.
[*][b]O universo muda enquanto você cresce.[/b] Sete tipos de corpos (poeira, rochas, asteroides, luas, planetas, estrelas e galáxias) e uma câmera que não para de se afastar.
[*][b]Partidas de 15 a 90 segundos.[/b] Você perde estabilidade com o tempo, e quanto maior fica, mais rápido se desfaz. Só mais uma partida, sem telas de carregamento.
[/list]

[h2]Uma árvore de pesquisa enorme[/h2]
[list]
[*][b]47 melhorias e 184 níveis[/b] em 6 ramos: Fome, Gravidade, Estabilidade, Maré, Cosmos e Origem.
[*]Desbloqueie o [b]pulso gravitacional[/b], [b]luas orbitais[/b] que trituram tudo o que tocam, [b]cometas[/b], [b]cristais de quasar[/b] e uma segunda chance quando você evapora.
[*]Os ramos mais profundos se revelam conforme a história avança.
[/list]

[img]{STEAM_APP_IMAGE}/extras/voidling_tree.gif[/img]

[h2]Algo está caçando você[/h2]
A partir do cinturão de asteroides surgem os [b]Custódios[/b], um enxame de antimatéria que se move com intenção. Depois, os pulsares. Desvie deles, destrua-os com o seu pulso... ou aprenda a devorá-los.

[h2]Uma história que você não espera de um jogo sobre comer coisas[/h2]
O universo está esfriando. A Dra. Ilse Varga acreditou ter encontrado uma saída, e criou você para isso. Depois, desapareceu, deixando uma única instrução: [i]"Alimente-o até que ele possa se alimentar sozinho."[/i]

As transmissões de LUMEN, as gravações perdidas de Ilse e os sinais interceptados dos Custódios são desbloqueados conforme você cresce. Seis capítulos e um final. E uma pergunta que volta a cada partida: qual foi a primeira coisa que você devorou?

[h2]Recursos[/h2]
[list]
[*]História completa em ~1,5–2 horas; 100% da árvore em ~3 horas.
[*]28 conquistas da Steam.
[*]Arte 100% procedural em neon cósmico, nítida em qualquer resolução.
[*]Música ambiente generativa: seus combos soam como uma melodia.
[*]Opções de acessibilidade: volume por canal e opção de desativar o tremor de câmera.
[*]Mouse ou teclado. Controle e Steam Deck: [verificar].
[*]Totalmente em português do Brasil, além de inglês e espanhol.
[/list]
```

> Nota: la última línea de "Recursos" anuncia el pt-BR. Si en la v1.0 hay más idiomas (zh-CN, ru, de, ja…), cámbiala por la lista real; la tabla de idiomas de Steamworks también debe marcar **Portuguese - Brazil: interfaz + subtítulos**.

---

## 3. Etiquetas sugeridas (20)

Las etiquetas de Steam se eligen de una lista global y **Steam las traduce sola** para los usuarios brasileños: en Steamworks se seleccionan por su nombre en inglés. Se indica el nombre que verá el público de Brasil como referencia. El orden prioriza lo que buscan los jugadores brasileños de juegos baratos (incrementales, roguelites, "bullet heaven" estilo Vampire Survivors, muy populares en Brasil).

| # | Etiqueta en Steamworks (EN) | Cómo se ve en pt-BR (aprox.) | Motivo |
|---|---|---|---|
| 1 | Incremental | Incremental | Género central |
| 2 | Roguelite | Roguelite | Bucle de partidas cortas + progresión permanente |
| 3 | Bullet Heaven | Bullet Heaven | Conecta con Vampire Survivors / Brotato (enorme en Brasil) |
| 4 | Idler | Idle | Se busca junto a Incremental |
| 5 | Space | Espaço | El tema |
| 6 | Story Rich | Rico em história | La gran diferencia frente al nicho |
| 7 | Clicker | Clicker | Público "number go up" |
| 8 | Action Roguelike | Roguelike de ação | Variante de búsqueda frecuente |
| 9 | Casual | Casual | Partidas cortas, curva suave |
| 10 | Short | Curto | Compra por impulso a USD 4,99 |
| 11 | Singleplayer | Um jogador | Filtro estándar |
| 12 | Indie | Indie | Filtro estándar |
| 13 | Sci-fi | Ficção científica | IA, estación, singularidad |
| 14 | Atmospheric | Atmosférico | Tono de la historia |
| 15 | Emotional | Emocionante | El giro del capítulo 4 |
| 16 | Minimalist | Minimalista | Estética geométrica |
| 17 | Colorful | Colorido | Neón cósmico |
| 18 | Relaxing | Relaxante | Música generativa |
| 19 | 2D | 2D | Filtro estándar |
| 20 | Procedural Generation | Geração procedural | Arte y música procedurales |

Igual que en el documento original: si la v1.0 tiene buen soporte de mando, cambia la 20 por **Controller** ("Suporte a controle").
