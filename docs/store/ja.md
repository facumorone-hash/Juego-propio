# VOIDLING — Página de Steam en japonés (ja)

Traducción de `docs/STEAM_PAGE.md` (§2, §3 y §4) para **Steamworks → Store Page Admin → idioma: 日本語**.
Se traduce desde la versión inglesa, con matices de la española. Glosario idéntico al del juego (`js/lang/ja.js`).

**Notas antes de publicar**

- **Nombre:** en la tienda japonesa se usa **VOIDLING（ヴォイドリング）** en la primera mención y VOIDLING después. En el juego el logo sigue en latín.
- **[要確認]** = lo mismo que **[verificar]** en la página española (mando, Steam Deck, idiomas): bórralo o confírmalo antes de enviar.
- Los GIF no llevan texto, así que se reutilizan los de la página inglesa.

---

## 1. Descripción corta (máx. 300 caracteres)

**JA (121 caracteres):**
> あなたは、砂粒ほどの大きさのブラックホール。わずか数十秒のランで塵を、衛星を、惑星を、恒星を喰らい、48ノードの研究ツリーで特異点を強化して、自分が生み出された理由を解き明かそう。予想を裏切る物語を秘めた、宇宙インクリメンタル・ローグライト。

*(Recuento con `node -e "console.log([...'…'].length)"`; Steam cuenta caracteres, no bytes.)*

---

## 2. Descripción larga (BBCode de Steam)

```
[img]{STEAM_APP_IMAGE}/extras/voidling_grow.gif[/img]

[h2]ちっぽけな粒から始まり、やがて銀河を喰らい尽くす。[/h2]

あなたは[b]VOIDLING（ヴォイドリング）[/b]。砂粒ほどの質量しかない、人工の特異点だ。ひとつのランはほんの数十秒。塵を引き寄せ、小惑星を砕き、成長し……そして蒸発する。あなたを生み出したAI「LUMEN」は、あなたが吸収した物質を回収し、前より少しだけ強いあなたを再構築する。

ランを重ねるごとに、塵から衛星へ、衛星から惑星へ、惑星から恒星へ。やがて、あなたを満たせるほど大きなものは、銀河の中心にしか残らなくなる。

[img]{STEAM_APP_IMAGE}/extras/voidling_planet.gif[/img]

[h2]手ざわりのあるインクリメンタル[/h2]
[list]
[*][b]動いて、引き寄せて、喰らう。[/b]自分より小さなものは、渦を巻いて事象の地平線へ落ちていく。大きなものは潮汐力で削り続け、喰らえる大きさの破片になるまで打ち砕け。
[*][b]成長するほど、宇宙が変わる。[/b]塵、岩、小惑星、衛星、惑星、恒星、そして銀河。7つのスケールの天体と、どこまでも引いていくカメラ。
[*][b]1ランは15〜90秒。[/b]安定度は時間とともに失われ、大きくなるほど崩壊も速くなる。ロード画面なしで「あと1回だけ」。
[/list]

[h2]巨大な研究ツリー[/h2]
[list]
[*]飢餓・重力・安定・潮汐・宇宙・起源の6系統に、[b]48の強化と184のレベル[/b]。
[*][b]重力パルス[/b]、触れたものをすり潰す[b]周回衛星[/b]、[b]彗星[/b]、[b]クエーサー結晶[/b]、そして蒸発したときの[b]セカンドチャンス[/b]を解放しよう。
[*]ツリーの奥深くは、物語の進行に合わせて姿を現す。
[/list]

[img]{STEAM_APP_IMAGE}/extras/voidling_tree.gif[/img]

[h2]何かが、あなたを追っている[/h2]
小惑星帯を越えると、[b]守護者[/b]が現れる。意図をもって動く、反物質の群れだ。やがてパルサーも。かわすか、パルスで破壊するか……それとも、喰らう術を身につけるか。

[h2]「食べるゲーム」とは思えない物語[/h2]
宇宙は冷え続けている。イルゼ・ヴァルガ博士は出口を見つけたと信じ、そのためにあなたを生み出した。そして姿を消した。残されたのは、たったひとつの指示だけ。[i]「自分で食べられるようになるまで、食べさせてあげて」[/i]

LUMENの通信、イルゼの失われた音声記録、そして傍受された守護者の信号。それらは、あなたが成長するにつれて解き明かされていく。6つの章と、ひとつの結末。そして、ランのたびに戻ってくる問いがある――あなたが最初に喰らったものは、何だったのか？

[h2]特徴[/h2]
[list]
[*]ストーリークリアまで約1.5〜2時間、ツリー完全制覇まで約3時間。
[*]Steam実績28個。
[*]すべてプロシージャル生成のコズミック・ネオンアート。どんな解像度でもくっきり。
[*]ジェネレーティブなアンビエント音楽。コンボがそのままメロディになる。
[*]アクセシビリティ設定：チャンネル別の音量、画面の揺れのオン／オフ、点滅の抑制、色覚サポート、UIと文字の拡大。
[*]マウスまたはキーボードで操作。コントローラー・Steam Deck対応：[要確認]
[*]日本語、英語、スペイン語ほかに対応。[要確認]
[/list]
```

**Notas de estilo:** igual que la página original, sin citas de reseñas ni premios inventados. En la línea de accesibilidad se añadieron las opciones que ya existen en el juego (reducir destellos, modo daltónico, escala de interfaz y de texto); si alguna desaparece, quítala.

---

## 3. Etiquetas sugeridas (20)

Las etiquetas de Steam son **globales** (no van por idioma): se eligen en inglés en Steamworks y Steam las muestra traducidas. Se mantiene el orden de `STEAM_PAGE.md` §4, que ya encaja con el público japonés (en Steam Japón se buscan mucho **放置ゲーム**, **ローグライト** y **ストーリー性**). El nombre japonés es el que se ve en la tienda (aproximado: Steam puede variar alguna traducción).

| # | Etiqueta (Steamworks, EN) | Cómo se ve en japonés |
|---|---|---|
| 1 | Incremental | インクリメンタル |
| 2 | Roguelite | ローグライト |
| 3 | Idler | 放置ゲーム |
| 4 | Bullet Heaven | バレットヘブン |
| 5 | Space | 宇宙 |
| 6 | Story Rich | ストーリー性 |
| 7 | Clicker | クリッカー |
| 8 | Action Roguelike | アクションローグライク |
| 9 | Casual | カジュアル |
| 10 | Short | 短編 |
| 11 | Minimalist | ミニマリスト |
| 12 | Colorful | カラフル |
| 13 | Relaxing | リラックス |
| 14 | Singleplayer | シングルプレイヤー |
| 15 | Indie | インディー |
| 16 | 2D | 2D |
| 17 | Atmospheric | 雰囲気のある |
| 18 | Sci-fi | SF |
| 19 | Procedural Generation | プロシージャル生成 |
| 20 | Emotional | 感動的 |

Si en la v1.0 hay buen soporte de mando, cambia la 20 por **Controller**（コントローラー）, igual que en la página original.

---

## 4. Términos para notas de prensa y redes (JA)

| ES | JA |
|---|---|
| incremental roguelite cósmico | 宇宙インクリメンタル・ローグライト |
| agujero negro / singularidad | ブラックホール / 特異点 |
| árbol de investigación | 研究ツリー |
| Custodios | 守護者 |
| estación UMBRAL | スレッショルド基地 |
| Dra. Ilse Varga | イルゼ・ヴァルガ博士 |
| «Aliméntalo hasta que pueda alimentarse solo» | 「自分で食べられるようになるまで、食べさせてあげて」 |
