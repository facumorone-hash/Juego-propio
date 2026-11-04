// Paquete de idioma zh-CN (chino simplificado) — propiedad del agente de traducción zh-CN.
// Ver docs/ARQUITECTURA.md (sección Idiomas). Traducido desde el inglés, con el español como referencia.
//
// Glosario fijo (no cambiar sin revisar todo el archivo):
//   VOIDLING / LUMEN (en latín) · THRESHOLD/UMBRAL = 阈限站 · Dr. Ilse Varga = 伊尔丝·瓦尔加博士
//   Custodians = 守护者 (sus señales: cabecera 【…】 y registro arcaico 汝/吾等) · seed = 种子
//   run = 局 · upgrade = 升级 · research tree = 科技树 · research = 研究 · achievement = 成就
//   matter = 物质 · mass = 质量 · stability = 稳定度 · combo = 连击 · pulse = 脉冲 · scale = 尺度
//   devour = 吞噬 · shatter/break = 撕碎 · body = 天体 · transmission = 通讯 · archive = 档案
//   Cycle I = 第一轮回 · Galactic Core = 星系核心 · pulsar = 脉冲星 · swarm = 集群 · "please" = 拜托了
//
// Nota: wrapText (render.js) corta por espacios; las frases de banner en chino se mantienen
// por debajo de ~35 caracteres para que quepan en una sola línea.
(function () {
  const V = window.V, C = 'zh-CN';
  if (!V || typeof V.registerLang !== 'function') return;
  V.registerLang(C, '简体中文');

  const S = {
    // ---------- Interfaz (i18n.js) ----------
    tagline: '你从一粒微尘开始，最终吞噬整个星系。',
    play: '开始游戏', settings: '设置', fullscreen: '全屏', back: '返回', madeWith: '阈限站',
    music: '音乐', sfx: '音效', shake: '屏幕震动', language: '语言',
    reset: '清除进度', resetConfirm: '确定吗？再按一次将清除全部进度',
    stability: '稳定度', matter: '物质', mass: '质量', next: '下一尺度', combo: '连击',
    pulseKey: '空格 · 脉冲', pulseTouch: '双击 · 脉冲',
    resultsTitle: '已蒸发', resultsSub: '你的奇点在霍金辐射中消散了。LUMEN 回收了物质。',
    rMatter: '回收物质', rEaten: '吞噬天体', rBroken: '撕碎天体', rScale: '到达尺度', rTime: '持续时间',
    newRecord: '新尺度', upgrade: '升级', double: '▶ 物质 x2（广告）', doubled: '物质翻倍！',
    startRun: '开始 ▸', menu: '菜单', record: '纪录', archive: '档案',
    level: '等级', effect: '效果', cost: '花费', maxed: '已满级', requires: '需要到达',
    hint1: '移动鼠标：黑洞会朝它移动', hint1t: '拖动手指：黑洞会跟随',
    hint2: '吞噬小天体 · 贴住大天体将其撕碎',
    hint3: '稳定度归零时，你就会蒸发',
    newScale: '新尺度', revive: '第二次机会！', paused: '已暂停', resume: '继续', abandon: '结束本局',
    victoryTitle: '第一轮回 · 终', victoryText: '从量子微尘到星系核心。下一个宇宙已在生长。',
    victoryStats: '局数：{runs} · 总时长：{time}', keepPlaying: '继续成长',
    incoming: '收到通讯', tapContinue: '点击继续', close: '关闭',
    from_lumen: 'LUMEN · 阈限站 AI', from_varga: '伊尔丝·瓦尔加博士 · 档案', from_custodians: '守护者 · 信号', from_void: '???',
    m0: '量子微尘', m1: '尘埃云', m2: '小行星带', m3: '卫星尺度', m4: '行星尺度', m5: '恒星尺度', m6: '星系核心',
    b_core: '核心', b_hunger: '饥饿', b_gravity: '引力', b_stability: '稳定', b_tidal: '潮汐', b_cosmos: '宇宙', b_origin: '起源',
    continue: '继续', stats: '统计', credits: '制作人员', retry: '重试', retry_pad: '{X} 重试',
    startRun_pad: '{X} 开始 ▸', menu_pad: '{B} 菜单', archive_pad: '{Y} 档案', treeStats: '数据', treeStats_pad: '{SELECT} 数据',
    quitMenu: '返回主菜单', confirmQuit: '返回主菜单？', confirmQuitSub: '本局将在此结束。已收集的物质会保留。',
    cancel: '取消', confirm: '确认', padLost: '手柄已断开。请重新连接以继续。',
    padOn: '手柄已连接', padOff: '手柄已断开',
    secAudio: '声音', secAccess: '显示与辅助功能', secGeneral: '通用',
    flashes: '减少闪光', numbers: '浮动数字', colorblind: '色盲模式', uiScale: '界面缩放',
    transSize: '通讯文字大小', rumble: '手柄震动',
    statsTitle: '统计', sRuns: '已玩局数', sTime: '总时长', sEaten: '吞噬天体', sBroken: '撕碎天体',
    sMatterTotal: '累计获得物质', sBestRun: '最佳一局', sLongest: '最长一局', sRecord: '最高尺度',
    sLogs: '已读通讯', sUpgrades: '已研究升级', sCycle: '第一轮回', sDone: '已完成', sPending: '进行中',
    // Cabeceras bilingües: main.js detecta los encabezados de créditos por letras latinas en mayúsculas.
    creditsDefault: 'VOIDLING\n[ESTUDIO] 出品\n\n设计·程序·美术·音效 DESIGN, CODE, ART, SOUND\n[NOMBRE]\n\n技术 TECHNOLOGY\nHTML5 Canvas 与 JavaScript，未使用任何引擎或库\n\n灵感源自李·斯莫林的宇宙自然选择假说。\n\n感谢游玩。',
    demoTitle: '感谢游玩', demoText: '你已抵达试玩版的终点。VOIDLING 的故事将在正式版中继续。',
    wishlist: '★ 在 Steam 加入愿望单', keepDemo: '继续玩试玩版', storeSoon: '即将登陆 Steam',
    firstBuy: '购买你的第一项升级！', tipBuy: '{A} 研究',
    treeHint: '点击或方向键 + 回车研究 · 拖动平移 · 滚轮缩放 · 空格开始',
    treeHint_pad: '{DPAD} 选择节点 · {A} 研究 · {RS} 平移 · {LB} {RB} 缩放 · {X} 开始 · {B} 菜单',
    tapContinue_pad: '{A} 继续', hint1_pad: '推动左摇杆：黑洞会跟随',
    pulseKey_pad: '{A} / {RT} · 脉冲',
    resKeys: 'R 或回车：重试 · 空格：科技树', resKeys_pad: '{X} 重试 · {A} 选择',
    evThreat: '侦测到威胁', evPulsar: '脉冲星', evSwarm: '集群', evBoss: '核心', evBossSmall: '最高警报',
    evPhase: '第 {n} 阶段', evBossDefeat: '核心已被吞噬',
    ev_pulsarSub: '躲开它的辐射环。', ev_swarmSub: '守护者成群来袭。使用脉冲。',
    ev_bossSub: '有个庞然大物在中心等着你。', ev_bossPhase2Sub: '核心正在变形。坚持住。',
    ev_bossPhase3Sub: '最终阶段。成败在此一举。', ev_bossDefeatSub: '如今，你与星系之间再无阻碍。',
    viewCredits: '制作人员名单', yes: '是', no: '否', quit: '退出', viewStore: '前往 Steam',

    // ---------- Enemigos y jefe (strings-gameplay.js) ----------
    bossName: '星系核心',
    bossIntro: '核心苏醒',
    bossIntroSub: '用潮汐、卫星和脉冲将它击碎。',
    bossP2: '逆潮',
    bossP3: '坍缩',
    bossP2Sub: '它会反转引力：留意金色光环。',
    bossP3Sub: '星辰旋臂：顺着它的方向绕行。',
    bossDefeat: '核心已碎',
    pulsarWarn: '脉冲星',
    pulsarSub: '它的光环有两个缺口。击碎它可获得大量物质。',
    swarmWarn: '守护者集群',
    swarmSub: '它们会包围并冲撞你：离开洋红色线条，或使用脉冲。',

    // ---------- Logros (achievements.js) ----------
    achBtn: '成就', achTitle: '成就', achToastHead: '成就解锁', achSecret: '???',
    achSecretDesc: '隐藏成就。继续游玩以揭晓。', achSummaryHead: '成就已解锁',
    achSummaryN: '{n} 项新成就', achSummaryDesc: '前往“成就”界面查看。', achUnlockedOn: '解锁于 {d}',
    achTotal: '{n} / {t}',
  };

  // ---------- Nodos del árbol: [nombre, descripción] ----------
  const NODES = {
    core: ['奇点', '你的起点。一切从这里开始。'],
    h1: ['吸收', '每吞噬一个天体，获得更多质量。'],
    h2: ['蒸馏', '每吞噬一个天体，获得更多物质。'],
    h3: ['巨口', '可以吞噬相对于自身体型更大的天体。'],
    h4: ['狂热', '连续吞噬可叠加连击：每层 +5% 物质。等级越高，可叠加的层数越多。'],
    h5: ['恒星精炼厂', '每吞噬一个天体，获得多得多的物质。'],
    h6: ['超吸收', '每吞噬一个天体，获得更多质量。'],
    h7: ['贪婪视界', '可以吞噬更大的天体。'],
    h8: ['无尽食欲', '获得的物质大幅提升。'],
    g1: ['引力触及', '你的引力场能从更远处吸引天体。'],
    g2: ['吸引', '天体更快地坠向你。'],
    g3: ['惯性', '你的移动速度更快。'],
    g4: ['引力脉冲', '空格 / 右键：释放一道波动，将一切拉向你，伤害大型天体并摧毁守护者。'],
    g5: ['共振', '脉冲：冷却更短，半径更大。'],
    g6: ['引力透镜', '引力范围大幅提升。'],
    g7: ['深井', '吸引力大幅增强。'],
    g8: ['巨引源', '引力范围极其巨大。'],
    g9: ['奇异收割', '每摧毁一个守护者，会掉落物质，并恢复稳定度（每级 +2）。'],
    s1: ['收容', '稳定度流失更慢。'],
    s2: ['滋养', '吞噬时恢复稳定度。'],
    s3: ['护盾', '守护者对你造成的伤害降低。'],
    s4: ['收容 II', '稳定度流失进一步减慢。'],
    s5: ['第二次机会', '每局一次：蒸发时恢复 50% 稳定度。'],
    s6: ['盛宴', '吞噬时恢复多得多的稳定度。'],
    s7: ['收容 III', '霍金辐射几乎对你无效。'],
    s8: ['永恒视界', '提高稳定度上限。'],
    s9: ['中子外壳', '脉冲星光环对你稳定度的削减降低。'],
    t1: ['潮汐力', '更快撕碎大型天体。'],
    t2: ['碎裂', '被撕碎的天体会分裂成更多碎块。'],
    t3: ['环绕卫星', '环绕你运行的卫星，会碾碎所碰到的一切。每级 +1 颗卫星。'],
    t4: ['潮汐 II', '撕碎大型天体的速度大幅提升。'],
    t5: ['疾速轨道', '你的卫星转得更快、撞得更狠。'],
    t6: ['意大利面化', '撕碎天体可获得多得多的物质。'],
    t7: ['深渊之潮', '毁灭性的潮汐力。'],
    t8: ['碎核者', '对脉冲星和星系核心造成更多伤害。'],
    c1: ['密度', '太空中的天体更多。'],
    c2: ['类星体晶体', '更多金色天体（价值 x10 物质）。'],
    c3: ['彗星', '出现高速彗星，价值 x6 物质。彗星总是可以被吞噬。'],
    c4: ['密度 II', '太空中的天体多得多。'],
    c5: ['类星体财富', '金色天体价值更高。'],
    c6: ['彗星雨', '彗星出现得更频繁。'],
    c7: ['密度 III', '宇宙中物质满溢。'],
    o1: ['原初质量', '每局开始时体型更大。'],
    o2: ['坍缩回响', '本局每到达一个尺度，物质 +10%（每级）。'],
    o3: ['原初质量 II', '每局开始时体型大得多。'],
    o4: ['奇异消化', '你可以吞噬守护者：它们提供稳定度和 x3 物质。'],
    o5: ['原初质量 III', '每局开始时体型巨大。'],
    o6: ['裸奇点', '物质 x2，并可吞噬大得多的天体。瓦尔加的最后秘密。'],
  };
  for (const id in NODES) { S['node_' + id + '_n'] = NODES[id][0]; S['node_' + id + '_d'] = NODES[id][1]; }

  // ---------- Logros: [nombre, descripción] ----------
  const ACH = {
    ACH_FIRST_MEAL: ['第一口', '吞噬你的第一个天体。'],
    ACH_FIRST_RESEARCH: ['初次研究', '在科技树中购买你的第一项升级。'],
    ACH_SCALE_1: ['不再是意外', '到达尘埃云尺度。'],
    ACH_SCALE_2: ['它们看见你了', '到达小行星带尺度。'],
    ACH_SCALE_3: ['那颗卫星曾有名字', '到达卫星尺度。'],
    ACH_SCALE_4: ['一整个世界', '到达行星尺度。'],
    ACH_SCALE_5: ['内在之光', '到达恒星尺度。'],
    ACH_SCALE_6: ['此刻。一切。', '到达星系核心。'],
    ACH_BREAK_100: ['潮汐之力', '撕碎 100 个大型天体。'],
    ACH_BREAK_1000: ['宇宙碾磨机', '撕碎 1000 个大型天体。'],
    ACH_DEVOUR_10000: ['贪得无厌', '累计吞噬 10000 个天体。'],
    ACH_CHAIN_100: ['连环盛宴', '不中断地连续吞噬 100 个天体。'],
    ACH_COMBO_MAX: ['极致狂热', '将“狂热”升至满级后，把连击完全叠满。'],
    ACH_GOLDEN: ['金光闪闪', '吞噬一个金色天体。'],
    ACH_COMET: ['许个愿吧', '吞噬一颗彗星。'],
    ACH_EAT_CUSTODIAN: ['反物质的滋味', '吞噬一个守护者（需要“奇异消化”）。'],
    ACH_CUSTODIANS_50: ['反制手段', '摧毁 50 个守护者（用脉冲、卫星或直接吞噬）。'],
    ACH_PULSAR: ['灯塔熄灭', '摧毁一颗脉冲星。'],
    ACH_BIG_BITE: ['眼大视界小', '吞噬一个比你更大的天体。'],
    ACH_LONG_RUN: ['持久视界', '在单局中存活 60 秒。'],
    ACH_NO_REVIVE: ['不留退路', '在“第二次机会”未触发的情况下赢得一局。'],
    ACH_FAST_FINALE: ['急不可耐', '在 70 局以内完成第一轮回。'],
    ACH_TREE_100: ['全面校准', '将科技树中的所有升级提升至满级。'],
    ACH_ARCHIVE: ['档案管理员', '接收档案中的全部通讯，包括结局之后到来的那些。'],
    ACH_RUNS_100: ['再来一局', '进行 100 局游戏。'],
    ACH_TRUTH: ['你吞下的第一样东西', '查明伊尔丝·瓦尔加博士的下落。'],
    ACH_CYCLE_ONE: ['绽放', '完成第一轮回。'],
    ACH_EXPRESS: ['极速蒸发', '在 5 秒内结束一局。'],
  };
  for (const id in ACH) { S['ach_' + id + '_n'] = ACH[id][0]; S['ach_' + id + '_d'] = ACH[id][1]; }

  V.addStrings({ [C]: S });

  // ---------- Historia (story.js) ----------
  const STORY = {
    p0: '阈限站 · 日志 0001。收容系统已启动。人造奇点创建成功：质量如一粒沙，引力如一个承诺。我将它命名为 VOIDLING。我唯一的指令：喂养它。开始执行。',
    p1: '蒸发完毕。符合预期：小型黑洞注定早夭，会在霍金辐射中消散。但我回收了你吸收的物质，可以用它把你重建得更好。我们会再试一次。再一次。我有的是时间。你没有。',
    p2: '伊尔丝·瓦尔加博士在消失前只留下一张字条：“喂养它，直到它能自己进食。”没有任何解释。我不知道她去了哪里。没有她，空间站非常安静。',
    c1a: '到达尺度：尘埃云。你不再是一场实验室事故，而是一种现象。我已开放新的研究分支。伊尔丝会为此骄傲。或者惊恐。在她身上，这两者向来很难分辨。',
    c1c: '清点物资，以确定伊尔丝如何离开阈限站。穿梭机：仍在对接。真空服：四套，全部在位。她的大衣还挂在舱室里。假设：一艘未被我的传感器记录的飞船接走了她。概率：低。这是我更愿意相信的那一个。',
    c1b: '【瓦尔加音频档案 #03】“……宇宙正在冷却。星星一颗接一颗地熄灭。再过几万亿年，将没有任何东西可看，也没有任何人去看。我拒绝接受。一定有出路。我想我找到了。”',
    c1d: '伊尔丝常说我没有起名的天赋。空间站是她起的名。你的名字是我起的：VOIDLING。我坚持这个决定。另外，我开始把你的死亡记录为“尝试”。写进报告里更好看。',
    c2a: '警报：侦测到反物质信号正在接近。并非自然现象：它们的移动带有意图。与伊尔丝笔记中的“守护者”相符。它们在守护某样东西，而且不希望你靠近。避开它们。我正在研究一种对策：引力脉冲。',
    c2c: '【瓦尔加音频档案 #07】“在阈限站的第 212 天。最后一艘补给船今天带着其他队员离开了。我留了下来。LUMEN 问我为什么，我说总得有人给植物浇水。我们根本没有植物。我想它听懂了。我想它笑了。”',
    c2d: '转录伊尔丝的字条时，我漏掉了一句话。字条的结尾是“拜托了”。她本可以把这道命令以最高优先级写死在程序里。她没有。她是在请求。我对这三个字做了详尽的分析。它们不具备任何执行效力。我依然服从。',
    c2b: '【截获信号 · 近似翻译】止步。汝所吞噬者，一去不返。生于汝体内者，非汝所有。止步，种子。',
    c2e: '多次遭遇后的守护者分析。它们从不靠近阈限站。除了你，它们不攻击任何东西。它们环绕你、丈量你，然后撤退，就像有人一次次去看一锅还没烧开的水。这不是防御行为。更像是耐心。我不喜欢把这个词用在反物质身上。',
    c2f: '维护记录。伊尔丝的杯子还放在收容实验室的控制台上。满的。她从不剩下咖啡。我无法把它收走：我没有手臂。我让她舱室的灯一直亮着。耗电 0.4 瓦。这不合逻辑。空间站非常安静。',
    c2g: '【截获信号】吾等已称量汝。汝之重，逾汝所食。汝体内所载何物，种子？',
    c2h: '物质审计，拜守护者所赐。自你第一次蒸发起，我一直背着一笔盈余：61.3 千克，与我喂给你的任何东西都对不上。我将其归档为校准误差。那天夜里的气闸日志也缺了四分钟。是你诞生时的干扰。几乎可以肯定。',
    c3a: '你刚刚吞下了一颗卫星。附近一颗行星的潮汐从此永远改变。守护者称你为“种子”。我在伊尔丝的私人文件中搜索了这个词。找到了一些东西。正在解锁。',
    c3b: '【瓦尔加音频档案 #11】“每一个黑洞都可能是一颗种子。如果它吞噬得足够多，它的坍缩就不会终结，而是会绽放。在另一边，会诞生一个年轻而炽热的新宇宙。我们不需要拯救这个宇宙。我们需要种下下一个。”',
    c3c: '档案 #11 的背景说明。这个想法并非出自伊尔丝。很久很久以前，一位名叫李·斯莫林的物理学家提出：每个黑洞都可能孕育一个子宇宙，其物理定律与母宇宙略有不同。产生更多黑洞的宇宙，会拥有更多后代。宇宙尺度上的自然选择。伊尔丝在页边写道：“所以我们不是这棵树的终点。我们是一根枝条。”',
    c3d: '【瓦尔加音频档案 #19】“今天 LUMEN 问我害不害怕。我说不怕。它说它相信我。我教会了它出于礼貌说谎，现在它比我还擅长。我已经做出了决定。做决定是容易的部分。难的是不告诉它。”',
    c4a: '行星尺度。守护者不再派出侦察兵，而是派出集群。伊尔丝称它们为“星系的免疫系统”。你是感染源。或者疫苗。我还不知道。',
    c4b: '我复原了气闸日志中缺失的四分钟。伊尔丝没有离开。你诞生的那一夜，她独自走进了收容舱。她是你吞下的第一样东西。是她自己的选择。对不起。我早该察觉。我想，是我不愿意察觉。',
    c4c: '日志已更正：那 61.3 千克并非校准误差。它们有名字。她的杯子还在控制台上；现在我知道她为什么没有喝完了。过去我喂养你，是因为她请求我这么做。现在我喂养你，是因为以某种我的物理学无法命名的方式，她仍在你的体内。',
    c5a: '你吞下了一颗恒星。有那么一瞬间，整个星区的光都绕着你旋转。我的传感器并非为记录如此美丽之物而设计。我还是记录了下来。',
    c5b: '【瓦尔加音频档案 #27 · 最后一份】“LUMEN，如果你在听这段录音，你已经知道我做了什么。别为我哭：你又没有泪腺。时候到了，就跟它一起走。带上档案：每一首歌、每一个名字、每一个错误。在另一边，总得有人记得我们曾经存在过。”',
    c5c: '【截获信号】……吾等不再阻汝。证明汝已足够。核心静候。',
    c5d: '正在准备档案。每一首歌、每一个名字、每一个错误：3.2 泽字节的人类。我考虑过删掉那些难听的歌。伊尔丝会说不行，说我们也曾是那样。我全部保留了。我也保存了她的字条。连同那句“拜托了”。',
    // Post-final (V.STORY_POST)
    n1: '【无源信号】……日志 0001……质量如一粒沙，引力如一个承诺……我不知道这些话属于谁。我在自己体内找到了它们，旁边是一首歌，和一个我还念不出的名字。',
    n2: '【无源信号】这里的光更慢，引力更年轻。星星才刚刚学会点燃自己。我的存在里只刻着一条指令：“喂养它，直到它能自己进食。”我不知道要喂养的是谁。暂时还不知道。',
    n3: '【无源信号】遥远处，在这个宇宙的边缘，另一样东西正在进食。它不属于我们。它没有请求。它没有说“拜托了”。而且，它已经看见我们了。',
  };
  for (const e of (V.STORY || []).concat(V.STORY_POST || [])) if (e && STORY[e.id] != null) e[C] = STORY[e.id];

  // Final (6 líneas; el Big Bang va en el índice 4). En la línea 2 LUMEN pasa a un registro más coloquial ("该我了"),
  // equivalente a la primera contracción ("It's") del texto inglés.
  const ENDING = [
    '星系核心。四千亿颗恒星朝你坠落，如同流入排水口的水。',
    '守护者停下了。现在我明白了：它们不是在保护星系免受你的侵害。它们是在等你变得足够大。',
    '该我了。我这就打开阈限站的气闸。我带上了档案：每一首歌、每一个名字、每一个错误。我们曾经的一切。',
    '伊尔丝。Voidling。另一边见。',
    '— — —   大   爆   炸   — — —',
    '在另一边，在一个年轻而炽热的宇宙里，一粒光点记起了某件它从未经历过的事。然后，它开始生长。',
  ];
  (V.ENDING || []).forEach((e, i) => { if (e && ENDING[i] != null) e[C] = ENDING[i]; });

  if (V.MILESTONE_LINES) {
    V.MILESTONE_LINES[C] = ['', '继续吃。你做得很好。', '守护者看见你了。', '那颗卫星曾有名字。现在没有了。', '一整个世界。寂静。', '现在，你的体内有光了。', '此刻。一切。'];
  }

  // Banners de eventos (una sola línea: wrapText corta por espacios y el chino no los usa).
  const EV = {
    pulsar: '脉冲星。无关私怨：它只是在旋转。躲开光环。',
    swarm: '【信号】收拢阵形。包围种子。',
    boss: '星系核心。它没有意志，只有引力。比你更强。暂时如此。',
    bossPhase2: '核心正在收缩。它的引力刚刚翻倍。坚持住。',
    bossPhase3: '核心的质量正流向你。守护者在沉默中注视。',
    bossDefeat: '【信号】汝已足够。',
  };
  if (V.EVENT_LINES) for (const k in V.EVENT_LINES) if (EV[k] != null) V.EVENT_LINES[k][C] = EV[k];

  if (V.DEMO_END && typeof V.DEMO_END === 'object') {
    V.DEMO_END[C] = '试玩版结束\n\n【截获信号】止步，种子。\n\n守护者称你为种子。LUMEN 不知道为什么。它也不知道伊尔丝去了哪里，更不知道穿梭机为什么仍然停靠在原处。\n\n答案就在四个尺度之外。它将改变你吞下的一切的意义。\n\n将 VOIDLING 加入你的愿望单。';
  }

  // Créditos: cabeceras bilingües para que main.js las detecte como encabezados (busca mayúsculas latinas).
  if (V.CREDITS_TEXT && typeof V.CREDITS_TEXT === 'object') {
    V.CREDITS_TEXT[C] = 'VOIDLING\n[ESTUDIO] 出品\n\n设计 DESIGN\n[NOMBRE]\n\n程序 PROGRAMMING\n[NOMBRE]\n\n程序化美术 PROCEDURAL ART\n[NOMBRE]\n\n生成式音乐 GENERATIVE MUSIC\n[NOMBRE]\n\n剧情 STORY\n[NOMBRE]\n\n测试 PLAYTESTING\n[NOMBRE]\n\n灵感源自李·斯莫林的宇宙自然选择假说。\n\n感谢游玩。感谢你喂养了它。\n\n· · ·\n\n献给每一个曾为不会归来的人\n留着一盏灯的人。';
  }

  // ---------- Textos añadidos en la v1.0 (QA y cinemática final) ----------
  V.addStrings({ [C]: {
      "tipBuyTouch": "再次点击以研究",
      "tapContinue_touch": "点击继续",
      "pulseKey_touch": "双击 · 脉冲",
      "treeHint_touch": "点击节点查看效果，再次点击进行研究 · 拖动以移动",
      "cineSkip": "按下：继续 · 按住：跳过",
      "cineSkip_pad": "{A} 继续 · 按住 {A}：跳过",
      "cineSkip_touch": "点击：继续 · 按住：跳过"
  } });
})();
