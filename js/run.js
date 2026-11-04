// Simulación de una run. Sin DOM: se puede ejecutar en Node para balancear.
(function () {
  const V = globalThis.V;
  const TAU = V.TAU;
  const MAX_OBJS = 340;
  const MAX_SHOTS = 120;
  const MAX_TEXTS = 18, MERGE_T = 0.45, MERGE_PX = 72; // números flotantes (ver addText)
  const FOLLOW = { follow: true }, BIG = { big: true };
  const MAX_STEP = 0.05; // paso máximo de simulación: los dt mayores se subdividen
  const CU = V.CUSTODIANS, P = V.PULSAR, SW = V.SWARM, B = V.BOSS;

  // Diferencia angular en (-π, π]
  function angDiff(a, b) {
    let d = (a - b) % TAU;
    if (d > Math.PI) d -= TAU; else if (d <= -Math.PI) d += TAU;
    return d;
  }
  const between = (r) => V.rand(r[0], r[1]);
  // Color de la paleta accesible (si existe; en Node no hay paleta).
  const PCOL = (k, f) => (V.pal ? V.pal()[k] || f : f);

  class Run {
    constructor(stats, opts) {
      opts = opts || {};
      this.st = stats;
      this.vw = opts.vw || 1600;
      this.vh = opts.vh || 900;
      this.headless = !!opts.headless;
      this.demo = !!opts.demo;
      this.r = stats.startR;
      this.mass = this.r * this.r;
      this.x = 0; this.y = 0; this.tx = 0; this.ty = 0; this.vx = 0; this.vy = 0;
      this.kbx = 0; this.kby = 0; // empuje externo (repulsión del Núcleo)
      this.stabMax = stats.stabMax;
      this.stab = this.stabMax;
      this.t = 0;
      this.matter = 0; this.eaten = 0; this.broken = 0; this.biggest = 0; this.kills = 0;
      this.maxR = this.r;
      this.milestone = V.milestoneAt(this.r);
      this.startMilestone = this.milestone;
      this.chain = 0; this.chainT = 0; this.combo = 0;
      this.pulseT = 1.5;
      this.reviveUsed = false;
      this.over = false; this.victory = false;
      this.objs = []; this.parts = []; this.texts = []; this.events = []; this.rings = [];
      this.prings = []; // anillos de púlsar (lógica de juego: existen también en modo headless)
      this.shots = [];  // estrellas disparadas por el Núcleo
      this.waves = [];  // ondas solo visuales (aparición, repulsión, cambio de fase)
      this.swarms = [];
      this.orbA = 0;
      this.antiT = 5; this.cometT = 3;
      this.pulsarT = between(P.first); this.swarmT = between(SW.first);
      this.boss = null; this.bossSpawned = false; this.bossHitT = 0; this.bossT = 0;
      this.botFeed = false;
      this.zoom = V.zoomFor(this.r, Math.min(this.vw, this.vh));
      const n = this.targetCount();
      for (let i = 0; i < n; i++) this.spawnObj(true);
    }

    viewRad() { return Math.hypot(this.vw, this.vh) / 2 / this.zoom; }
    targetCount() { return Math.min(MAX_OBJS - 40, Math.round(105 * this.st.density)); }
    emit(e) { if (!this.headless) this.events.push(e); }
    custodiansActive() { return this.milestone <= CU.lastM && (this.r >= CU.fromR || this.milestone >= CU.fromM); }

    makeObj(x, y, s, extra) {
      const type = V.typeFor(s);
      const tumbling = type === 'dust' || type === 'rock' || type === 'asteroid';
      const o = {
        kind: 'obj', x, y, vx: 0, vy: 0, s, hp: s * s, maxHp: s * s, type,
        variant: (Math.random() * 6) | 0, rot: tumbling ? Math.random() * TAU : 0,
        vr: tumbling ? V.rand(-0.8, 0.8) : type === 'nebula' ? V.rand(0.05, 0.15) : 0,
        gold: false, hitT: 0, dead: false, life: 0,
      };
      if (extra) Object.assign(o, extra);
      this.objs.push(o);
      return o;
    }

    spawnObj(inside) {
      const vr = this.viewRad();
      const a = Math.random() * TAU;
      const d = inside ? V.rand(this.r * 4, vr * 1.1) : V.rand(vr * 1.05, vr * 1.35);
      const u = Math.random();
      let f;
      if (u < 0.62) f = V.rand(0.12, 0.62);
      else if (u < 0.9) f = V.rand(0.7, 1.6);
      else if (u < 0.985) f = V.rand(1.6, 3.2);
      else f = V.rand(3.2, 5);
      const s = this.r * f;
      const o = this.makeObj(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, s);
      o.vx = V.rand(-1, 1) * this.r * 0.4;
      o.vy = V.rand(-1, 1) * this.r * 0.4;
      o.gold = Math.random() < this.st.goldChance;
      return o;
    }

    spawnAnti() {
      if (this.objs.length >= MAX_OBJS) return;
      const vr = this.viewRad(), a = Math.random() * TAU, d = vr * V.rand(1.0, 1.2);
      this.makeObj(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, this.r * V.rand(0.28, 0.4), {
        kind: 'anti', type: 'anti', life: 15, vr: 3,
      });
    }

    // Enjambre: 5–8 Custodios pequeños que forman un anillo a tu alrededor y luego embisten uno tras otro.
    spawnSwarm() {
      const n = SW.n[0] + ((Math.random() * (SW.n[1] - SW.n[0] + 1)) | 0);
      const vr = this.viewRad(), a0 = Math.random() * TAU;
      const g = { phase: 0, t: 0, ang: a0, n, dir: Math.random() < 0.5 ? 1 : -1 };
      // Orden de embestida intercalado, para que la ráfaga venga de lados distintos.
      const order = [];
      for (let i = 0; i < n; i++) order.push(i);
      for (let i = n - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
      for (let i = 0; i < n && this.objs.length < MAX_OBJS; i++) {
        const a = a0 + V.rand(-0.4, 0.4), d = vr * V.rand(1.0, 1.15);
        this.makeObj(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, this.r * V.rand(SW.size[0], SW.size[1]), {
          kind: 'anti', type: 'anti', life: 30, vr: 4, swarm: g, idx: i, rank: order[i], st: 0, ax: 0, ay: 0, dashLeft: 0,
        });
      }
      this.swarms.push(g);
      this.emit({ t: 'swarm', n });
    }

    // Púlsar: aparece dentro de la pantalla, casi quieto, y avisa antes de su primer anillo.
    spawnPulsar() {
      if (this.objs.length >= MAX_OBJS) return;
      const md = Math.min(this.vw, this.vh), a = Math.random() * TAU;
      const d = (md * V.rand(0.36, 0.46)) / this.zoom;
      const s = this.r * between(P.size);
      const hp = s * s * P.hpK;
      this.makeObj(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, s, {
        kind: 'pulsar', type: 'pulsar', heavy: true, hp, maxHp: hp,
        vx: V.rand(-1, 1) * this.r * 0.05, vy: V.rand(-1, 1) * this.r * 0.05,
        rot: Math.random() * TAU, vr: V.rand(1.0, 1.5) * (Math.random() < 0.5 ? 1 : -1),
        ringT: P.firstRing, age: 0,
      });
      if (!this.headless) this.waves.push({ x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d, R0: s, R1: s * 4, t: 0, dur: 0.8, col: '191,244,255' });
      this.emit({ t: 'pulsar' });
    }

    // El Núcleo galáctico aparece al cruzar la última escala.
    spawnBoss() {
      this.bossSpawned = true;
      const r0 = this.r, s = r0 * B.size;
      // Aparece sobre el eje largo de la pantalla para que se vea entero.
      const horiz = this.vw >= this.vh;
      const side = Math.random() < 0.5 ? 0 : Math.PI;
      const a = (horiz ? side : side + Math.PI / 2) + V.rand(-0.35, 0.35);
      const d = s + r0 * 5.5;
      const hp = B.hp * r0 * r0;
      this.boss = this.makeObj(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, s, {
        kind: 'boss', type: 'boss', heavy: true, hp, maxHp: hp, r0, t0: this.t,
        rot: 0, vr: 0.12, age: 0, phase: 1, atkT: 1, repT: B.rep.every2, spT: 0, spA: Math.random() * TAU,
        spDir: Math.random() < 0.5 ? 1 : -1, grace: 0, warn: 0,
      });
      // Fuera los Custodios y púlsares que queden: el escenario es del Núcleo.
      for (const o of this.objs) if (o.kind === 'pulsar') { o.dead = true; this.sparks(o.x, o.y, PCOL('pulsar', '#bff4ff'), 14, o.s); }
      this.prings.length = 0;
      if (!this.headless) this.waves.push({ x: this.boss.x, y: this.boss.y, R0: s * 0.2, R1: s * 2.2, t: 0, dur: 1.6, col: '255,230,160' });
      this.emit({ t: 'boss' });
    }

    spawnComet() {
      const vr = this.viewRad(), a = Math.random() * TAU, d = vr * 1.1;
      const x = this.x + Math.cos(a) * d, y = this.y + Math.sin(a) * d;
      const tx = this.x + V.rand(-0.4, 0.4) * vr, ty = this.y + V.rand(-0.4, 0.4) * vr;
      const dd = Math.hypot(tx - x, ty - y) || 1;
      const sp = 820 / this.zoom;
      this.makeObj(x, y, this.r * 0.42, {
        kind: 'comet', type: 'comet', life: 5, vx: ((tx - x) / dd) * sp, vy: ((ty - y) / dd) * sp, rot: 0, vr: 0,
      });
    }

    orbPositions() {
      const n = this.st.orbitals, out = [];
      for (let i = 0; i < n; i++) {
        const a = this.orbA + (i * TAU) / n;
        out.push({ x: this.x + Math.cos(a) * this.r * 2.1, y: this.y + Math.sin(a) * this.r * 2.1, s: this.r * 0.24 });
      }
      return out;
    }
    swarmOrbitR() { return (Math.min(this.vw, this.vh) * SW.orbitR) / this.zoom; }
    heavyR(o) { return o.kind === 'boss' ? o.s * 0.55 : o.s * 0.6; }

    // ¿Le conviene al bot romper este púlsar? Solo si lo destroza rápido y va sobrado de estabilidad.
    botWantsPulsar(o) {
      const dps = this.st.tidal * 2.6 * this.r * this.r * this.st.bossDmg;
      return this.stab / this.stabMax > 0.5 && o.hp / dps < 3.5;
    }

    // IA sencilla: usada en el menú (demo) y en la simulación de balance.
    bot() {
      const st = this.st, r = this.r;
      const eatMax = r * st.eatRatio;
      const stabF = this.stab / this.stabMax;
      const b = this.boss && !this.boss.dead ? this.boss : null;
      // Histéresis: si la estabilidad cae, deja el jefe un momento para comer.
      if (b) { if (stabF < 0.3) this.botFeed = true; else if (stabF > 0.55) this.botFeed = false; }

      let best = null, bs = Infinity;
      for (const o of this.objs) {
        if (o.dead || o.kind === 'anti' || o.kind === 'boss') continue;
        const d = Math.hypot(o.x - this.x, o.y - this.y);
        let score;
        if (o.kind === 'pulsar') {
          if (b || !this.botWantsPulsar(o)) continue;
          score = d * 0.9;
        } else if (o.kind === 'comet' || o.s <= eatMax) score = d / (o.s / r + 0.3) / (o.gold ? 3 : 1);
        else score = d * 1.3 + r * 3;
        if (score < bs) { bs = score; best = o; }
      }
      let tx, ty;
      if (b && (!this.botFeed || !best)) {
        // Rodea al Núcleo en el sentido de su espiral para pasar entre los brazos de estrellas.
        const dx = this.x - b.x, dy = this.y - b.y, d = Math.hypot(dx, dy) || 1;
        const tang = b.phase === 3 ? b.spDir : 0.35;
        tx = b.x + (dx / d) * b.s * 0.3 + (-dy / d) * tang * b.s * 0.6;
        ty = b.y + (dy / d) * b.s * 0.3 + (dx / d) * tang * b.s * 0.6;
      } else if (best) { tx = best.x; ty = best.y; }
      else { tx = this.x + 50; ty = this.y; }

      // Esquivar: Custodios, embestidas del enjambre, anillos de púlsar y estrellas del Núcleo.
      let ax = 0, ay = 0;
      for (const o of this.objs) {
        if (o.dead) continue;
        const dx = this.x - o.x, dy = this.y - o.y, d = Math.hypot(dx, dy) || 1;
        if (o.kind === 'anti') {
          if (o.fade || st.antiEat) continue;
          if (o.swarm && (o.st === 1 || o.st === 2)) {
            // Fuera de la línea de embestida (perpendicular a ella).
            const along = dx * o.ax + dy * o.ay;
            if (along < -r) continue;
            const cross = dx * o.ay - dy * o.ax; // distancia con signo a la línea
            const lim = r * 2.4 + o.s;
            if (Math.abs(cross) < lim) {
              const side = cross >= 0 ? 1 : -1, k = 1 - Math.abs(cross) / lim;
              ax += o.ay * side * r * 14 * (0.4 + k); ay += -o.ax * side * r * 14 * (0.4 + k);
            }
          } else if (!o.swarm || o.st === 3) {
            if (d < r * 8) { ax += (dx / d) * r * 10; ay += (dy / d) * r * 10; }
          }
        } else if (o.kind === 'pulsar' && !b && !this.botWantsPulsar(o)) {
          const zone = o.s * P.range + r * 2;
          if (d < zone) { const k = 1 - d / zone; ax += (dx / d) * r * 14 * (0.3 + k); ay += (dy / d) * r * 14 * (0.3 + k); }
        }
      }
      for (const g of this.prings) {
        const dx = this.x - g.x, dy = this.y - g.y, d = Math.hypot(dx, dy) || 1;
        if (g.hit || d < g.R - r || d > g.max + r) continue;
        ax += (dx / d) * r * 16; ay += (dy / d) * r * 16; // huir hacia fuera, más rápido que el anillo
      }
      let nearShots = 0;
      for (const s of this.shots) {
        const dx = this.x - s.x, dy = this.y - s.y, d2 = dx * dx + dy * dy, lim = r * 5;
        if (d2 > lim * lim) continue;
        if (d2 < r * r * 9) nearShots++;
        const sp = Math.hypot(s.vx, s.vy) || 1, ux = s.vx / sp, uy = s.vy / sp;
        if (dx * ux + dy * uy < -r) continue; // ya pasó
        const cross = dx * uy - dy * ux, w = r * 1.6 + s.s;
        if (Math.abs(cross) < w) {
          const side = cross >= 0 ? 1 : -1, k = 1 - Math.abs(cross) / w;
          ax += uy * side * r * 9 * k; ay += -ux * side * r * 9 * k;
        }
      }
      this.tx = tx + ax; this.ty = ty + ay;

      if (st.pulse && this.pulseT <= 0) {
        if (!b) this.pulse();
        else {
          const R = r * st.pullRange * 1.7 * st.pulseRad;
          if (Math.hypot(b.x - this.x, b.y - this.y) - b.s * 0.5 < R || nearShots >= 3) this.pulse();
        }
      }
    }

    pulse() {
      if (!this.st.pulse || this.pulseT > 0 || this.over) return false;
      const st = this.st;
      this.pulseT = st.pulseCd;
      const R = this.r * st.pullRange * 1.7 * st.pulseRad;
      const eatMax = this.r * st.eatRatio;
      const n = this.objs.length;
      for (let i = 0; i < n; i++) {
        const o = this.objs[i];
        if (o.dead) continue;
        const dx = this.x - o.x, dy = this.y - o.y, d = Math.hypot(dx, dy) || 1;
        if (o.heavy) {
          // Púlsares y Núcleo: no se mueven, pero el pulso los daña.
          const de = Math.max(0, d - o.s * 0.5);
          if (de < R) this.damageHeavy(o, st.tidal * this.r * this.r * B.pulseDmg * (0.4 + 0.6 * (1 - de / R)));
          continue;
        }
        if (d > R) continue;
        if (o.kind === 'anti') { if (!o.fade) this.killAnti(o); continue; }
        const k = 1 - d / R;
        o.vx += (dx / d) * this.r * 16 * k;
        o.vy += (dy / d) * this.r * 16 * k;
        if (o.kind === 'obj' && o.s > eatMax) {
          o.hp -= o.maxHp * (0.25 + 0.35 * k);
          o.hitT = 0.15;
          if (o.hp <= 0) this.breakObj(o);
        }
      }
      // El pulso también disuelve las estrellas del Núcleo cercanas.
      for (let i = this.shots.length - 1; i >= 0; i--) {
        const s = this.shots[i];
        if (Math.hypot(s.x - this.x, s.y - this.y) < R) { this.sparks(s.x, s.y, '#ffe6a0', 4, s.s); this.shots.splice(i, 1); }
      }
      if (!this.headless) this.rings.push({ x: this.x, y: this.y, R, t: 0 });
      this.emit({ t: 'pulse' });
      return true;
    }

    // Destruir un Custodio (pulso o lunas orbitales).
    killAnti(o) {
      o.dead = true;
      this.kills++;
      const st = this.st;
      if (st.antiLoot) {
        const val = V.value(o.s) * 2 * st.antiLoot * st.matterMul;
        this.matter += val;
        this.stab = Math.min(this.stabMax, this.stab + 2 * st.antiLoot);
        if (!this.headless) this.addText(o.x, o.y, val, '#ffb27a', o.s);
      }
      this.sparks(o.x, o.y, PCOL('enemy', '#ff4fd8'), 10, o.s);
      this.emit({ t: 'kill', kind: o.swarm ? 'swarm' : 'anti' });
    }

    // Daño a cuerpos pesados (púlsar o Núcleo) desde marea, lunas o pulso.
    damageHeavy(o, amt) {
      if (o.dead) return;
      if (o.kind === 'boss') {
        // Crecer durante la pelea ayuda, pero con tope: el Núcleo no se derrite solo por engordar.
        const cap = (o.r0 * B.dmgCapR) / this.r;
        if (cap < 1) amt *= cap * cap;
      }
      o.hp -= amt * this.st.bossDmg;
      o.hitT = 0.1;
      if (o.kind === 'boss') {
        if (this.bossHitT <= 0) { this.bossHitT = 0.25; this.emit({ t: 'bossHit', hp: Math.max(0, o.hp / o.maxHp) }); }
        const f = o.hp / o.maxHp;
        if (o.phase === 1 && f <= 0.66) this.bossPhase(o, 2);
        if (o.phase === 2 && f <= 0.33) this.bossPhase(o, 3);
        if (o.hp <= 0) this.defeatBoss(o);
      } else if (o.hp <= 0) this.breakPulsar(o);
    }

    breakPulsar(o) {
      if (o.dead) return;
      o.dead = true;
      this.broken++; this.kills++;
      const st = this.st;
      const val = V.value(o.s) * P.loot * st.matterMul * (1 + st.echo * this.milestone);
      this.matter += val;
      for (let k = 0; k < P.frags && this.objs.length < MAX_OBJS; k++) {
        const a = (k / P.frags) * TAU + Math.random() * 0.5;
        const f = this.makeObj(o.x + Math.cos(a) * o.s * 0.4, o.y + Math.sin(a) * o.s * 0.4, this.r * V.rand(0.3, 0.55));
        const sp = this.r * V.rand(2, 4);
        f.vx = Math.cos(a) * sp; f.vy = Math.sin(a) * sp;
        f.gold = k < 2;
      }
      if (!this.headless) {
        this.sparks(o.x, o.y, PCOL('pulsar', '#bff4ff'), 40, o.s * 1.5);
        this.waves.push({ x: o.x, y: o.y, R0: o.s, R1: o.s * 6, t: 0, dur: 0.7, col: '191,244,255' });
        this.addText(o.x, o.y, val, PCOL('pulsar', '#bff4ff'), o.s * 2, BIG);
      }
      this.emit({ t: 'kill', kind: 'pulsar' });
    }

    bossPhase(b, ph) {
      b.phase = ph;
      b.grace = B.grace;
      b.atkT = 0.6; b.spT = 0;
      b.repT = ph === 2 ? B.rep.every2 : B.rep.every3;
      b.warn = 0;
      for (const s of this.shots) this.sparks(s.x, s.y, '#ffe6a0', 3, s.s);
      this.shots.length = 0;
      this.repulse(b, 0.7);
      if (!this.headless) this.waves.push({ x: b.x, y: b.y, R0: b.s * 0.5, R1: b.s * 3.5, t: 0, dur: 1.1, col: '200,150,255' });
      this.emit({ t: 'bossPhase', phase: ph });
    }

    defeatBoss(b) {
      if (b.dead) return;
      b.dead = true;
      const st = this.st;
      const val = V.value(b.s) * B.loot * st.matterMul * (1 + st.echo * this.milestone);
      this.matter += val;
      this.shots.length = 0;
      if (!this.headless) {
        this.sparks(b.x, b.y, '#ffe6a0', 90, b.s);
        this.sparks(b.x, b.y, '#c58bff', 60, b.s * 0.8);
        this.waves.push({ x: b.x, y: b.y, R0: b.s * 0.3, R1: b.s * 6, t: 0, dur: 1.6, col: '255,240,200' });
        this.addText(b.x, b.y, val, '#ffe6a0', b.s, BIG);
      }
      this.emit({ t: 'bossDefeat' });
      this.victory = true;
      this.over = true;
      this.events.push({ t: 'victory' });
    }

    // "Atracción inversa": el Núcleo invierte su gravedad y expulsa todo lo cercano.
    repulse(b, mul) {
      const k0 = b.k || b.r0, rr = b.s + B.rep.R * k0;
      const dx = this.x - b.x, dy = this.y - b.y, d = Math.hypot(dx, dy) || 1;
      if (d < rr) {
        const k = 0.5 + 0.5 * (1 - d / rr);
        this.kbx += (dx / d) * B.rep.v * k0 * k * mul;
        this.kby += (dy / d) * B.rep.v * k0 * k * mul;
      }
      for (const o of this.objs) {
        if (o.dead || o.heavy || o.kind === 'anti') continue;
        const ox = o.x - b.x, oy = o.y - b.y, od = Math.hypot(ox, oy) || 1;
        if (od < rr) { o.vx += (ox / od) * B.rep.v * k0 * 0.6; o.vy += (oy / od) * B.rep.v * k0 * 0.6; }
      }
      if (!this.headless) this.waves.push({ x: b.x, y: b.y, R0: b.s * 0.6, R1: rr, t: 0, dur: 0.75, col: '255,214,140' });
      this.emit({ t: 'bossWave' });
    }

    bossShoot(b, a, dmg) {
      if (this.shots.length >= MAX_SHOTS) return;
      const k0 = b.k || b.r0, sp = B.shotSp * k0;
      this.shots.push({
        x: b.x + Math.cos(a) * b.s * 0.5, y: b.y + Math.sin(a) * b.s * 0.5,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: B.shotS * k0, life: B.shotLife, dmg,
      });
    }

    // Anillo de estrellas con huecos (siempre hay por dónde pasar).
    bossRing(b, cfg) {
      const off = Math.random() * TAU;
      const skip = {};
      for (let g = 0; g < cfg.gaps; g++) {
        const start = ((Math.random() * cfg.n) / cfg.gaps + (g * cfg.n) / cfg.gaps) | 0;
        for (let k = 0; k < cfg.gapLen; k++) skip[(start + k) % cfg.n] = true;
      }
      for (let i = 0; i < cfg.n; i++) if (!skip[i]) this.bossShoot(b, off + (i * TAU) / cfg.n, cfg.dmg);
    }

    updateBoss(dt) {
      const b = this.boss;
      if (!b || b.dead) return;
      this.bossT += dt;
      b.age += dt;
      // Escala de sus ataques: sigue tu tamaño si creces durante la pelea, y el Núcleo crece contigo.
      const r0 = Math.max(b.r0, this.r);
      b.k = r0;
      const minS = this.r * B.minSize;
      if (b.s < minS) b.s += (minS - b.s) * Math.min(1, dt * 0.8);
      const dx = this.x - b.x, dy = this.y - b.y, d = Math.hypot(dx, dy) || 1;
      // Si te alejas, el Núcleo te sigue despacio: no se puede huir del final.
      if (d > b.s + this.r * 6) {
        const sp = (b.phase === 3 ? B.chase3 : B.chase) * r0;
        b.x += (dx / d) * sp * dt; b.y += (dy / d) * sp * dt;
      }
      if (b.age < B.intro) return;
      if (b.grace > 0) { b.grace -= dt; return; }

      b.atkT -= dt;
      if (b.phase === 1) {
        if (b.atkT <= 0) { b.atkT = B.ring1.every; this.bossRing(b, B.ring1); }
      } else if (b.phase === 2) {
        if (b.atkT <= 0) { b.atkT = B.ring2.every; this.bossRing(b, B.ring2); }
      } else {
        // Fase 3: brazos de estrellas en espiral; se esquivan girando en su mismo sentido.
        b.spA += b.spDir * B.spiral.spin * dt;
        b.spT -= dt;
        if (b.spT <= 0) {
          b.spT = B.spiral.every;
          for (let k = 0; k < B.spiral.arms; k++) this.bossShoot(b, b.spA + (k * TAU) / B.spiral.arms, B.spiral.dmg);
        }
      }
      if (b.phase >= 2) {
        b.repT -= dt;
        b.warn = b.repT < B.rep.warn ? 1 - b.repT / B.rep.warn : 0; // aviso visual (0..1)
        if (b.repT <= 0) { b.repT = b.phase === 2 ? B.rep.every2 : B.rep.every3; b.warn = 0; this.repulse(b, 1); }
      }
    }

    // Al llegar a la escala estelar, los Custodios se retiran (ver historia, capítulo 5).
    dismissCustodians() {
      for (const o of this.objs) if (o.kind === 'anti' && !o.dead) { o.fade = true; o.life = Math.min(o.life, 1.2); }
      this.swarms.length = 0;
    }

    eat(o) {
      const st = this.st;
      o.dead = true;
      let gain = o.s * o.s * st.massGain * V.growthFactor(this.r);
      let val = V.value(o.s) * st.matterMul * (1 + st.echo * this.milestone);
      if (o.gold) val *= st.goldMul;
      if (o.kind === 'comet') { val *= 6; gain *= 2; }
      if (o.kind === 'anti') { val *= 3; gain *= 0.5; this.stab = Math.min(this.stabMax, this.stab + 6); }
      this.chain = this.chainT > 0 ? this.chain + 1 : 1;
      this.chainT = 0.9;
      if (st.combo > 0) {
        this.combo = Math.min(st.combo, this.chain);
        val *= 1 + 0.05 * this.combo;
      }
      this.mass += gain;
      this.matter += val;
      this.eaten++;
      this.biggest = Math.max(this.biggest, o.s);
      // Nutrición proporcional al tamaño relativo: las migajas no sostienen la run.
      const rel = Math.min(1, o.s / (this.r * 0.45));
      const sf = V.clamp(this.stab / this.stabMax, 0, 1);
      this.stab = Math.min(this.stabMax, this.stab + st.feed * rel * rel * (1 - V.STAB.feedTop * sf * sf));
      if (!this.headless) {
        this.emit({ t: 'eat', rel: o.s / this.r, chain: this.chain, gold: o.gold || o.kind === 'comet', kind: o.kind });
        // Un solo contador sobre el agujero que crece con cada bocado del combo (los dorados, aparte y en oro)
        this.addText(o.x, o.y, val, o.gold || o.kind === 'comet' ? PCOL('gold', '#ffd75e') : '#cfe8ff', o.s, FOLLOW);
        this.burstIn(o);
      }
      this.updateR();
    }

    updateR() {
      const nr = Math.sqrt(this.mass);
      this.r = nr;
      if (nr > this.maxR) this.maxR = nr;
      const m = V.milestoneAt(nr);
      if (m > this.milestone) {
        const prev = this.milestone;
        this.milestone = m;
        this.emit({ t: 'milestone', m });
        if (prev <= CU.lastM && m > CU.lastM) this.dismissCustodians();
        // La última escala ya no gana la run: despierta al Núcleo galáctico.
        if (m >= V.FINAL_MILESTONE && !this.bossSpawned && !this.victory && !this.demo) this.spawnBoss();
      }
    }

    breakObj(o) {
      if (o.dead) return;
      o.dead = true;
      this.broken++;
      const st = this.st;
      const n = 3 + st.frags + ((Math.random() * 2) | 0);
      for (let k = 0; k < n && this.objs.length < MAX_OBJS; k++) {
        const fs = o.s * V.rand(0.32, 0.55);
        const a = Math.random() * TAU;
        const f = this.makeObj(o.x + Math.cos(a) * o.s * 0.45, o.y + Math.sin(a) * o.s * 0.45, fs);
        const sp = this.r * V.rand(1.5, 3.5);
        f.vx = o.vx * 0.5 + Math.cos(a) * sp;
        f.vy = o.vy * 0.5 + Math.sin(a) * sp;
        f.variant = o.variant;
        f.gold = o.gold && Math.random() < 0.6;
      }
      const val = V.value(o.s) * 0.2 * st.breakBonus * st.matterMul;
      this.matter += val;
      if (!this.headless) {
        this.emit({ t: 'break', rel: o.s / this.r });
        this.sparks(o.x, o.y, V.TYPE_COLORS[o.type] || '#fff', 18, o.s);
        this.addText(o.x, o.y, val, '#ffb27a', o.s * 1.4);
      }
    }

    hit(o) {
      o.dead = true;
      if (this.st.antiEat) { this.eat(o); return; }
      this.stab -= (o.swarm ? SW.dmg : CU.dmg) * this.st.armor;
      this.emit({ t: 'hit', src: o.swarm ? 'swarm' : 'anti' });
      this.sparks(o.x, o.y, PCOL('enemy', '#ff4fd8'), 22, o.s * 1.5);
    }

    // Números flotantes agrupados: un valor cercano en tiempo (< MERGE_T s desde el último aporte) y en
    // espacio (< MERGE_PX px en pantalla), del mismo color, se SUMA al número existente, que crece y "late".
    // Los de devorar (opt.follow) forman un único contador que acompaña al agujero durante el combo.
    // Como mucho MAX_TEXTS a la vez: si no cabe uno nuevo, se descarta el de menor valor.
    addText(x, y, val, col, s, opt) {
      if (this.headless || !(val > 0)) return null;
      const follow = !!(opt && opt.follow), big = !!(opt && opt.big);
      const R = MERGE_PX / (this.zoom || 1);
      for (let i = this.texts.length - 1; i >= 0; i--) {
        const t = this.texts[i];
        if (t.col !== col || t.follow !== follow || t.fresh > MERGE_T) continue;
        if (!follow) { const dx = t.x - x, dy = t.y - y; if (dx * dx + dy * dy > R * R) continue; }
        t.val += val; t.n++;
        // el ancla se desplaza hacia el aporte nuevo en proporción a su peso
        const w = val / t.val; t.x += (x - t.x) * w; t.y += (y - t.y) * w;
        t.txt = '+' + V.fmt(t.val);
        t.fresh = 0; t.pop = 1; t.life = t.max; t.big = t.big || big;
        return t;
      }
      if (val < 1) return null; // las migajas solo suman a un número que ya existe
      if (this.texts.length >= MAX_TEXTS) {
        let k = 0;
        for (let i = 1; i < this.texts.length; i++) if (this.texts[i].val < this.texts[k].val) k = i;
        if (this.texts[k].val > val) return null; // el nuevo es el menos importante: no se muestra
        this.texts.splice(k, 1);
      }
      const max = big ? 1.8 : 1.1;
      const t = { x, y, val, txt: '+' + V.fmt(val), col, s, life: max, max, fresh: 0, pop: 1, n: 1, follow, big, rise: 0, ly: null };
      this.texts.push(t);
      return t;
    }

    burstIn(o) {
      const col = o.gold ? '#ffd75e' : V.TYPE_COLORS[o.type] || '#fff';
      const n = 5 + Math.min(8, (o.s / this.r) * 10) | 0;
      for (let i = 0; i < n; i++) {
        if (this.parts.length > 700) break;
        const a = Math.random() * TAU;
        this.parts.push({
          x: o.x + Math.cos(a) * o.s * 0.5, y: o.y + Math.sin(a) * o.s * 0.5,
          vx: Math.cos(a + 1.5) * this.r * 3, vy: Math.sin(a + 1.5) * this.r * 3,
          life: 1.2, max: 1.2, col, size: Math.max(o.s * 0.12, this.r * 0.05), mode: 1,
        });
      }
    }

    sparks(x, y, col, n, size) {
      if (this.headless) return;
      for (let i = 0; i < n; i++) {
        if (this.parts.length > 700) break;
        const a = Math.random() * TAU, sp = this.r * V.rand(2, 9);
        const life = V.rand(0.35, 0.8);
        this.parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, col,
          size: Math.max(size * 0.08, this.r * 0.04) * V.rand(0.6, 1.4), mode: 0,
        });
      }
    }

    // Comportamiento de cada Custodio del enjambre (estados: 0 formación/órbita, 1 apunta, 2 embiste, 3 suelto).
    updateSwarmMember(o, dt) {
      const g = o.swarm;
      if (o.st === 0) {
        if (g.phase === 2 && g.t >= o.dashAt - SW.aim) {
          // Fija la línea de embestida: se dibuja como aviso y ya no corrige.
          const dx = this.x - o.x, dy = this.y - o.y, d = Math.hypot(dx, dy) || 1;
          o.ax = dx / d; o.ay = dy / d; o.st = 1;
          return;
        }
        // Se mueve en coordenadas polares alrededor del agujero: nunca lo atraviesa al formar el anillo.
        const R = this.swarmOrbitR();
        let ma = Math.atan2(o.y - this.y, o.x - this.x), md = Math.hypot(o.x - this.x, o.y - this.y);
        const ta = g.ang + (o.idx * TAU) / g.n;
        const angSp = g.phase === 0 ? 2.4 : 5;
        const da = V.clamp(angDiff(ta, ma), -angSp * dt, angSp * dt);
        ma += da + g.dir * SW.orbitW * dt;
        const radSp = 900 / this.zoom;
        md += V.clamp(R - md, -radSp * dt, radSp * dt);
        const nx = this.x + Math.cos(ma) * md, ny = this.y + Math.sin(ma) * md;
        o.vx = (nx - o.x) / dt; o.vy = (ny - o.y) / dt;
        o.x = nx; o.y = ny;
      } else if (o.st === 1) {
        o.vx = 0; o.vy = 0;
        if (g.t >= o.dashAt) {
          o.st = 2;
          const sp = SW.dashSp / this.zoom;
          o.vx = o.ax * sp; o.vy = o.ay * sp;
          o.dashLeft = this.swarmOrbitR() * 2.6;
        }
      } else if (o.st === 2) {
        const step = Math.hypot(o.vx, o.vy) * dt;
        o.x += o.vx * dt; o.y += o.vy * dt;
        o.dashLeft -= step;
        if (o.dashLeft <= 0) { o.st = 3; o.life = 2.5; o.vx *= 0.25; o.vy *= 0.25; }
      }
    }

    // dt robusto: ignora dt no válidos (0, negativos, NaN tras volver de segundo plano) y subdivide los grandes
    // para que nada atraviese al agujero ni a los anillos en un fotograma lento.
    update(dt) {
      if (!(dt > 0) || this.over) return;
      if (dt > MAX_STEP) {
        const n = Math.min(8, Math.ceil(dt / MAX_STEP)), h = Math.min(dt, MAX_STEP * 8) / n;
        for (let i = 0; i < n && !this.over; i++) this.step(h);
        return;
      }
      this.step(dt);
    }

    step(dt) {
      if (this.over) return;
      const st = this.st;
      this.t += dt;

      // Cámara y movimiento (tipo joystick: el objetivo es relativo a la posición)
      const minDim = Math.min(this.vw, this.vh);
      const zt = V.zoomFor(this.r, minDim);
      this.zoom += (zt - this.zoom) * Math.min(1, dt * 2.5);
      const maxSp = (560 * st.speed) / this.zoom;
      const dx0 = this.tx - this.x, dy0 = this.ty - this.y;
      const dist = Math.hypot(dx0, dy0);
      const want = Math.min(maxSp, dist * 5);
      const dvx = dist > 1e-4 ? (dx0 / dist) * want : 0;
      const dvy = dist > 1e-4 ? (dy0 / dist) * want : 0;
      const kk = 1 - Math.exp(-dt * 9);
      this.vx += (dvx - this.vx) * kk;
      this.vy += (dvy - this.vy) * kk;
      this.x += (this.vx + this.kbx) * dt;
      this.y += (this.vy + this.kby) * dt;
      const kbd = Math.exp(-dt * 3.5);
      this.kbx *= kbd; this.kby *= kbd;

      // Estabilidad
      // Cuanto más grande, más inestable: el tamaño máximo de cada run depende de las mejoras.
      // Durante el jefe, el tamaño deja de acelerar el drenaje (sí lo sigue haciendo el tiempo).
      if (!this.demo) {
        const b = this.boss, dR = b ? Math.min(this.r, b.r0) : this.r;
        const sf = V.clamp(this.stab / this.stabMax, 0, 1);
        this.stab -= st.drain * (1 + this.t / 45) * Math.pow(dR / 8, V.DRAIN_BETA) * B.drainMul(b) * (1 - V.STAB.drainLow * (1 - sf)) * dt;
      }
      else this.stab = this.stabMax;
      if (this.chainT > 0) { this.chainT -= dt; if (this.chainT <= 0) { this.chain = 0; this.combo = 0; } }
      if (this.pulseT > 0) this.pulseT -= dt;
      if (this.bossHitT > 0) this.bossHitT -= dt;
      this.orbA += dt * 2.4 * st.orbSpeed;

      // Peligros y eventos
      if (!this.demo) {
        if (this.custodiansActive()) {
          this.antiT -= dt;
          if (this.antiT <= 0) {
            // Con enjambres activos, los Custodios sueltos llegan algo menos a menudo.
            const sw = this.milestone >= SW.fromM ? 1.35 : 1;
            this.antiT = Math.max(1.4, 5.5 - this.t / 20) * V.rand(0.7, 1.3) * sw;
            this.spawnAnti();
          }
          if (this.milestone >= SW.fromM) {
            this.swarmT -= dt;
            if (this.swarmT <= 0) { this.swarmT = between(SW.every); this.spawnSwarm(); }
          }
        }
        if (this.milestone >= P.fromM && !this.bossSpawned) {
          this.pulsarT -= dt;
          if (this.pulsarT <= 0) {
            this.pulsarT = between(P.every);
            let alive = 0;
            for (const o of this.objs) if (o.kind === 'pulsar' && !o.dead) alive++;
            if (alive < P.maxAlive) this.spawnPulsar();
          }
        }
      }
      if (st.comets) {
        this.cometT -= dt;
        if (this.cometT <= 0) { this.cometT = (7 / st.cometRate) * V.rand(0.6, 1.4); this.spawnComet(); }
      }

      // Enjambres: reloj de grupo (formación → órbita → ráfaga)
      for (let i = this.swarms.length - 1; i >= 0; i--) {
        const g = this.swarms[i];
        g.t += dt;
        g.ang += g.dir * SW.orbitW * dt;
        if (g.phase === 0 && g.t >= SW.gather) g.phase = 1;
        else if (g.phase === 1 && g.t >= SW.gather + SW.orbitT) {
          g.phase = 2;
          for (const o of this.objs) if (o.swarm === g) o.dashAt = g.t + SW.aim + o.rank * SW.stagger;
        }
        if (g.t > 30) this.swarms.splice(i, 1);
      }
      this.updateBoss(dt);

      const r = this.r, pullR = r * st.pullRange, pull2 = pullR * pullR;
      const eatMax = r * st.eatRatio;
      const vr = this.viewRad(), despawn2 = (vr * 1.8) * (vr * 1.8), view2 = vr * vr * 1.2;
      const orbs = st.orbitals ? this.orbPositions() : null;
      let live = 0;
      const n = this.objs.length;
      for (let i = 0; i < n; i++) {
        const o = this.objs[i];
        if (o.dead) continue;
        o.rot += o.vr * dt;
        if (o.hitT > 0) o.hitT -= dt;
        let dx = this.x - o.x, dy = this.y - o.y;
        let d = Math.sqrt(dx * dx + dy * dy) || 1e-3;

        if (o.kind === 'anti') {
          o.life -= dt;
          if (o.fade) {
            // Se retiran: se alejan y se desvanecen, ya no hacen daño.
            o.x -= (dx / d) * (300 / this.zoom) * dt; o.y -= (dy / d) * (300 / this.zoom) * dt;
            if (o.life <= 0) o.dead = true;
            continue;
          }
          if (o.swarm && o.st !== 3) this.updateSwarmMember(o, dt);
          else {
            const sp = 250 / this.zoom;
            const k2 = 1 - Math.exp(-dt * 1.6);
            o.vx += ((dx / d) * sp - o.vx) * k2;
            o.vy += ((dy / d) * sp - o.vy) * k2;
            o.x += o.vx * dt; o.y += o.vy * dt;
          }
          dx = this.x - o.x; dy = this.y - o.y; d = Math.sqrt(dx * dx + dy * dy) || 1e-3;
          if (d < r + o.s * 0.6) { this.hit(o); continue; }
          if (orbs) for (const p of orbs) {
            const ox = p.x - o.x, oy = p.y - o.y, rr = p.s + o.s;
            if (ox * ox + oy * oy < rr * rr) { this.killAnti(o); break; }
          }
          if (o.dead) continue;
          if (o.life <= 0 || d * d > despawn2) o.dead = true;
          continue;
        }

        if (o.heavy) {
          // Púlsar / Núcleo: no los atrae tu gravedad; te frenan en el contacto y la marea los desgasta.
          if (o.kind === 'pulsar') {
            o.age += dt;
            o.ringT -= dt;
            if (o.ringT <= 0) {
              o.ringT = P.period * V.rand(0.92, 1.08);
              const max = o.s * P.range;
              this.prings.push({ x: o.x, y: o.y, R: o.s * 0.6, max, sp: max / P.ringTime, gap: o.rot, w: o.s * 0.14, hit: false });
              this.emit({ t: 'pulsarRing' });
            }
            o.x += o.vx * dt; o.y += o.vy * dt;
          }
          dx = this.x - o.x; dy = this.y - o.y; d = Math.sqrt(dx * dx + dy * dy) || 1e-3;
          const contact = r * 0.92 + this.heavyR(o);
          if (d < contact) {
            const push = contact - d, nx = dx / d, ny = dy / d;
            this.x += nx * push; this.y += ny * push;
            const vn = this.vx * nx + this.vy * ny;
            if (vn < 0) { this.vx -= vn * nx; this.vy -= vn * ny; }
            if (!this.headless && Math.random() < dt * 30) this.sparks(this.x - nx * r, this.y - ny * r, V.TYPE_COLORS[o.type], 2, r * 0.6);
            this.damageHeavy(o, st.tidal * 2.6 * r * r * dt);
          }
          if (orbs && !o.dead) for (const p of orbs) {
            const ox = p.x - o.x, oy = p.y - o.y, rr = p.s + this.heavyR(o);
            if (ox * ox + oy * oy < rr * rr) {
              this.damageHeavy(o, st.tidal * 1.4 * r * r * st.orbSpeed * dt);
              if (!this.headless && Math.random() < dt * 15) this.sparks(p.x, p.y, '#ffd2a8', 2, p.s);
            }
          }
          if (o.dead) continue;
          if (o.kind === 'pulsar' && d * d > despawn2) o.dead = true;
          continue;
        }

        if (o.kind === 'comet') {
          o.life -= dt;
          if (o.life <= 0) { o.dead = true; continue; }
        }

        if (d * d < pull2) {
          const fall = Math.sqrt(1 - d / pullR);
          const big = o.kind === 'comet' ? 3 : 1 + Math.pow(o.s / r, 1.5);
          const acc = (st.pullStr * 11 * r * fall) / big;
          o.vx += (dx / d) * acc * dt + (-dy / d) * acc * 0.25 * dt;
          o.vy += (dy / d) * acc * dt + (dx / d) * acc * 0.25 * dt;
          if (o.kind !== 'comet') { const damp = Math.exp(-dt * 1.3); o.vx *= damp; o.vy *= damp; }
        }
        o.x += o.vx * dt; o.y += o.vy * dt;
        dx = this.x - o.x; dy = this.y - o.y;
        d = Math.sqrt(dx * dx + dy * dy) || 1e-3;

        const edible = o.kind === 'comet' || o.s <= eatMax;
        if (edible) {
          if (d < r + o.s * 0.15) { this.eat(o); continue; }
        } else {
          const contact = r * 0.92 + o.s * 0.6;
          if (d < contact) {
            const push = contact - d;
            o.x -= (dx / d) * push; o.y -= (dy / d) * push;
            o.vx *= 0.6; o.vy *= 0.6;
            o.hp -= st.tidal * 2.6 * r * r * dt;
            o.hitT = 0.08;
            if (!this.headless && Math.random() < dt * 25) {
              this.sparks(o.x + (dx / d) * o.s * 0.6, o.y + (dy / d) * o.s * 0.6, V.TYPE_COLORS[o.type], 2, o.s * 0.5);
            }
            if (o.hp <= 0) { this.breakObj(o); continue; }
          }
          if (orbs) for (const p of orbs) {
            const ox = p.x - o.x, oy = p.y - o.y, rr = p.s + o.s * 0.9;
            if (ox * ox + oy * oy < rr * rr) {
              o.hp -= st.tidal * 1.4 * r * r * st.orbSpeed * dt;
              o.hitT = 0.08;
              if (!this.headless && Math.random() < dt * 15) this.sparks(p.x, p.y, '#ffd2a8', 2, p.s);
              if (o.hp <= 0) { this.breakObj(o); break; }
            }
          }
          if (o.dead) continue;
        }

        const d2 = d * d;
        if (d2 > despawn2 || (o.s < r * 0.06 && d2 > view2)) { o.dead = true; continue; }
        if (o.kind === 'obj') live++;
      }
      if (this.objs.length > 0) this.objs = this.objs.filter((o) => !o.dead);
      if (this.boss && this.boss.dead && !this.victory) this.boss = null;

      // Anillos de púlsar: golpean una sola vez, salvo si pasas por uno de sus dos huecos.
      for (let i = this.prings.length - 1; i >= 0; i--) {
        const g = this.prings[i];
        g.R += g.sp * dt;
        if (g.R >= g.max) { this.prings.splice(i, 1); continue; }
        if (g.hit) continue;
        const dx = this.x - g.x, dy = this.y - g.y, d = Math.hypot(dx, dy);
        if (Math.abs(d - g.R) < r * 0.85 + g.w) {
          const a = Math.atan2(dy, dx), hw = P.gapW / 2;
          const inGap = Math.abs(angDiff(a, g.gap)) < hw || Math.abs(angDiff(a, g.gap + Math.PI)) < hw;
          if (!inGap) {
            g.hit = true;
            this.stab -= P.dmg * st.armor * st.ringArmor;
            this.emit({ t: 'ring' });
            this.sparks(this.x, this.y, PCOL('pulsar', '#bff4ff'), 16, r);
          }
        }
      }

      // Estrellas del Núcleo
      for (let i = this.shots.length - 1; i >= 0; i--) {
        const s = this.shots[i];
        s.life -= dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        const dx = this.x - s.x, dy = this.y - s.y, rr = r * 0.9 + s.s;
        if (dx * dx + dy * dy < rr * rr) {
          this.stab -= s.dmg * st.armor;
          this.emit({ t: 'hit', src: 'star' });
          this.sparks(s.x, s.y, '#ffe6a0', 12, s.s * 2);
          this.shots.splice(i, 1);
          continue;
        }
        if (s.life <= 0) this.shots.splice(i, 1);
      }

      // Reponer cuerpos
      const target = this.targetCount();
      let spawnN = Math.min(8, target - live, MAX_OBJS - this.objs.length);
      while (spawnN-- > 0) this.spawnObj(false);

      // Partículas, textos y ondas visuales
      if (!this.headless) {
        for (let i = this.parts.length - 1; i >= 0; i--) {
          const p = this.parts[i];
          p.life -= dt;
          if (p.mode === 1) {
            const ddx = this.x - p.x, ddy = this.y - p.y, dd = Math.hypot(ddx, ddy) || 1;
            const acc = r * 40;
            p.vx += ((ddx / dd) * acc + (-ddy / dd) * acc * 0.6) * dt;
            p.vy += ((ddy / dd) * acc + (ddx / dd) * acc * 0.6) * dt;
            p.vx *= Math.exp(-dt * 2.5); p.vy *= Math.exp(-dt * 2.5);
            if (dd < r * 0.85) p.life = 0;
          } else {
            p.vx *= Math.exp(-dt * 3); p.vy *= Math.exp(-dt * 3);
          }
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.life <= 0) this.parts.splice(i, 1);
        }
        for (let i = this.texts.length - 1; i >= 0; i--) {
          const t = this.texts[i];
          t.life -= dt; t.fresh += dt; t.pop = Math.max(0, t.pop - dt * 6);
          if (t.life <= 0) this.texts.splice(i, 1);
        }
        // Chispas violetas de estabilidad baja (antes las generaba el render, ligadas a los FPS)
        if (this.stab < this.stabMax * 0.25 && Math.random() < dt * 24) this.sparks(this.x, this.y, '#c58bff', 1, this.r * 0.5);
        for (let i = this.rings.length - 1; i >= 0; i--) {
          this.rings[i].t += dt;
          if (this.rings[i].t > 0.6) this.rings.splice(i, 1);
        }
        for (let i = this.waves.length - 1; i >= 0; i--) {
          this.waves[i].t += dt;
          if (this.waves[i].t > this.waves[i].dur) this.waves.splice(i, 1);
        }
      }

      // Fin de la run
      if (this.stab <= 0 && !this.victory) {
        if (this.st.revive && !this.reviveUsed) {
          this.reviveUsed = true;
          this.stab = this.stabMax * 0.5;
          this.emit({ t: 'revive' });
        } else {
          this.stab = 0;
          this.over = true;
          this.events.push({ t: 'end' });
        }
      }
    }
  }

  V.Run = Run;
})();
