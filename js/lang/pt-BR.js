// Paquete de idioma pt-BR — propiedad del agente de traducción pt-BR. Ver docs/ARQUITECTURA.md (sección Idiomas).
// Português (Brasil). Tratamento "você". Glossário: THRESHOLD/UMBRAL → LIMIAR (a estação LIMIAR),
// Custodians → Custódios, seed → semente, matter → matéria, run → partida, research → pesquisa,
// upgrade → melhoria, speck → partícula, shuttle → lançadeira, airlock → eclusa.
// LUMEN: registro formal/de máquina, sem gírias, evitando adjetivos com gênero; no final ("Agora é comigo",
// "A gente se vê") fala pela primeira vez como gente. Ilse: coloquial ("a gente"). Custódios: MAIÚSCULAS, solenes.
(function () {
  const V = window.V, C = 'pt-BR';
  if (!V || !V.registerLang) return;
  V.registerLang(C, 'Português (Brasil)');

  // ---------- Interface ----------
  const UI = {
    tagline: 'Você começa como uma partícula. E termina devorando a galáxia.',
    play: 'JOGAR', settings: 'OPÇÕES', fullscreen: 'TELA CHEIA', back: 'VOLTAR', madeWith: 'Estação LIMIAR',
    music: 'Música', sfx: 'Efeitos sonoros', shake: 'Tremor de tela', language: 'Idioma',
    reset: 'Apagar progresso', resetConfirm: 'Tem certeza? Pressione de novo para apagar TUDO',
    stability: 'ESTABILIDADE', matter: 'Matéria', mass: 'Massa', next: 'Próxima', combo: 'Combo',
    pulseKey: 'ESPAÇO · PULSO', pulseTouch: 'TOQUE DUPLO · PULSO',
    resultsTitle: 'EVAPORADO', resultsSub: 'Sua singularidade virou radiação Hawking. LUMEN recuperou a matéria.',
    rMatter: 'Matéria recuperada', rEaten: 'Corpos devorados', rBroken: 'Corpos despedaçados', rScale: 'Escala alcançada', rTime: 'Duração',
    newRecord: 'NOVA ESCALA', upgrade: 'MELHORAR', double: '▶ x2 MATÉRIA (anúncio)', doubled: 'Matéria dobrada!',
    startRun: 'INICIAR ▸', menu: 'MENU', record: 'Recorde', archive: 'ARQUIVO',
    level: 'Nível', effect: 'Efeito', cost: 'Custo', maxed: 'MÁXIMO', requires: 'Requer alcançar',
    hint1: 'Mova o mouse: o buraco vai atrás dele', hint1t: 'Arraste o dedo: o buraco segue',
    hint2: 'Devore o que é pequeno · Encoste no que é grande para quebrar',
    hint3: 'Se a estabilidade chegar a zero, você evapora',
    newScale: 'NOVA ESCALA', revive: 'SEGUNDA CHANCE!', paused: 'PAUSADO', resume: 'CONTINUAR', abandon: 'ENCERRAR PARTIDA',
    victoryTitle: 'FIM DO CICLO I', victoryText: 'De uma partícula quântica a um núcleo galáctico. O próximo universo já está crescendo.',
    victoryStats: 'Partidas: {runs} · Tempo total: {time}', keepPlaying: 'CONTINUAR CRESCENDO',
    incoming: 'TRANSMISSÃO RECEBIDA', tapContinue: 'clique para continuar', close: 'FECHAR',
    from_lumen: 'LUMEN · IA da LIMIAR', from_varga: 'DRA. ILSE VARGA · arquivo', from_custodians: 'OS CUSTÓDIOS · sinal', from_void: '???',
    m0: 'Partícula quântica', m1: 'Nuvem de poeira', m2: 'Cinturão de asteroides', m3: 'Escala lunar', m4: 'Escala planetária', m5: 'Escala estelar', m6: 'Núcleo galáctico',
    b_core: 'Núcleo', b_hunger: 'Fome', b_gravity: 'Gravidade', b_stability: 'Estabilidade', b_tidal: 'Maré', b_cosmos: 'Cosmos', b_origin: 'Origem',
    continue: 'CONTINUAR', stats: 'ESTATÍSTICAS', credits: 'CRÉDITOS', retry: 'TENTAR DE NOVO', retry_pad: '{X} TENTAR DE NOVO',
    startRun_pad: '{X} INICIAR ▸', menu_pad: '{B} MENU', archive_pad: '{Y} ARQUIVO', treeStats: 'DADOS', treeStats_pad: '{SELECT} DADOS',
    quitMenu: 'SAIR PARA O MENU', confirmQuit: 'SAIR PARA O MENU?', confirmQuitSub: 'A partida termina aqui. Você mantém a matéria que coletou.',
    cancel: 'CANCELAR', confirm: 'CONFIRMAR', padLost: 'Controle desconectado. Reconecte-o para continuar.',
    padOn: 'Controle conectado', padOff: 'Controle desconectado',
    secAudio: 'SOM', secAccess: 'TELA E ACESSIBILIDADE', secGeneral: 'GERAL',
    flashes: 'Reduzir flashes', numbers: 'Números flutuantes', colorblind: 'Modo daltônico', uiScale: 'Escala da interface',
    transSize: 'Texto das transmissões', rumble: 'Vibração do controle',
    statsTitle: 'ESTATÍSTICAS', sRuns: 'Partidas jogadas', sTime: 'Tempo total', sEaten: 'Corpos devorados', sBroken: 'Corpos despedaçados',
    sMatterTotal: 'Matéria total obtida', sBestRun: 'Melhor partida', sLongest: 'Partida mais longa', sRecord: 'Escala recorde',
    sLogs: 'Transmissões lidas', sUpgrades: 'Melhorias pesquisadas', sCycle: 'Ciclo I', sDone: 'Concluído', sPending: 'Em andamento',
    creditsDefault: 'VOIDLING\nUm jogo de [ESTUDIO]\n\nDESIGN, PROGRAMAÇÃO, ARTE E SOM\n[NOMBRE]\n\nTECNOLOGIA\nHTML5 Canvas e JavaScript, sem engines nem bibliotecas\n\nInspirado na hipótese da seleção natural cosmológica de Lee Smolin.\n\nObrigado por jogar.',
    demoTitle: 'OBRIGADO POR JOGAR', demoText: 'Você chegou ao fim da demo. A história de Voidling continua no jogo completo.',
    wishlist: '★ ADICIONAR À LISTA DE DESEJOS', keepDemo: 'CONTINUAR NA DEMO', storeSoon: 'Em breve na Steam',
    firstBuy: 'Compre sua primeira melhoria!', tipBuy: '{A} pesquisar',
    treeHint: 'Clique ou setas + Enter: pesquisar · Arraste: mover · Roda: zoom · ESPAÇO: iniciar',
    treeHint_pad: '{DPAD} navegar · {A} pesquisar · {RS} mover · {LB} {RB} zoom · {X} iniciar · {B} menu',
    tapContinue_pad: '{A} continuar', hint1_pad: 'Mova o analógico esquerdo: o buraco segue',
    pulseKey_pad: '{A} / {RT} · PULSO',
    resKeys: 'R ou Enter: tentar de novo · Espaço: árvore de melhorias', resKeys_pad: '{X} tentar de novo · {A} escolher',
    evThreat: 'AMEAÇA DETECTADA', evPulsar: 'PULSAR', evSwarm: 'ENXAME', evBoss: 'O NÚCLEO', evBossSmall: 'ALERTA MÁXIMO',
    evPhase: 'FASE {n}', evBossDefeat: 'NÚCLEO DEVORADO',
    ev_pulsarSub: 'Desvie dos anéis de radiação.', ev_swarmSub: 'Os Custódios atacam em grupo. Use o Pulso.',
    ev_bossSub: 'Algo enorme espera por você no centro.', ev_bossPhase2Sub: 'O Núcleo está mudando de forma. Aguente firme.',
    ev_bossPhase3Sub: 'Última fase. É agora ou nunca.', ev_bossDefeatSub: 'Agora nada mais separa você da galáxia.',
    viewCredits: 'VER CRÉDITOS', yes: 'Sim', no: 'Não', quit: 'SAIR', viewStore: 'VER NA STEAM',

    // strings-gameplay.js (inimigos e chefe)
    bossName: 'Núcleo galáctico',
    bossIntro: 'O NÚCLEO DESPERTA',
    bossIntroSub: 'Quebre-o com sua maré, suas luas e seu pulso.',
    bossP2: 'Maré inversa',
    bossP3: 'Colapso',
    bossP2Sub: 'Ele inverte a gravidade: atenção ao anel dourado.',
    bossP3Sub: 'Braços de estrelas: gire no mesmo sentido que eles.',
    bossDefeat: 'NÚCLEO DESTROÇADO',
    pulsarWarn: 'PULSAR',
    pulsarSub: 'Os anéis têm duas brechas. Quebre-o para ganhar muita matéria.',
    swarmWarn: 'ENXAME DE CUSTÓDIOS',
    swarmSub: 'Eles cercam e investem: saia das linhas magenta ou use o pulso.',

    // achievements.js (interface)
    achBtn: 'CONQUISTAS', achTitle: 'CONQUISTAS', achToastHead: 'Conquista desbloqueada', achSecret: '???',
    achSecretDesc: 'Conquista secreta. Continue jogando para descobrir.', achSummaryHead: 'Conquistas desbloqueadas',
    achSummaryN: '{n} novas conquistas', achSummaryDesc: 'Veja todas na tela de CONQUISTAS.', achUnlockedOn: 'Desbloqueada em {d}',
    achTotal: '{n} de {t}',
  };

  // ---------- Árvore de pesquisa: [nome, descrição] ----------
  const NODES = {
    core: ['Singularidade', 'Sua origem. Tudo começa aqui.'],
    h1: ['Absorção', 'Ganhe mais massa a cada corpo devorado.'],
    h2: ['Destilação', 'Mais matéria a cada corpo devorado.'],
    h3: ['Bocarra', 'Devore corpos maiores em relação ao seu tamanho.'],
    h4: ['Frenesi', 'Devorar em sequência acumula combo: +5% de matéria por carga. Mais níveis = mais cargas.'],
    h5: ['Refinaria estelar', 'Muito mais matéria por corpo devorado.'],
    h6: ['Hiperabsorção', 'Ainda mais massa por corpo devorado.'],
    h7: ['Horizonte voraz', 'Devore corpos ainda maiores.'],
    h8: ['Apetite infinito', 'A matéria que você obtém aumenta enormemente.'],
    g1: ['Alcance', 'Seu campo gravitacional atrai de mais longe.'],
    g2: ['Atração', 'Os corpos caem em sua direção mais rápido.'],
    g3: ['Inércia', 'Você se move mais rápido.'],
    g4: ['Pulso gravitacional', 'ESPAÇO / botão direito: uma onda que puxa tudo até você, danifica corpos grandes e destrói Custódios.'],
    g5: ['Ressonância', 'Pulso: recarga menor e raio maior.'],
    g6: ['Lente gravitacional', 'Alcance gravitacional muito maior.'],
    g7: ['Poço profundo', 'Atração muito mais forte.'],
    g8: ['Grande Atrator', 'Alcance gravitacional colossal.'],
    g9: ['Colheita exótica', 'Cada Custódio que você destrói solta matéria e +2 de estabilidade por nível.'],
    s1: ['Contenção', 'Perca estabilidade mais devagar.'],
    s2: ['Nutrição', 'Recupere estabilidade ao devorar.'],
    s3: ['Blindagem', 'Os Custódios causam menos dano a você.'],
    s4: ['Contenção II', 'Perca estabilidade ainda mais devagar.'],
    s5: ['Segunda chance', 'Uma vez por partida, ao evaporar, você recupera 50% da estabilidade.'],
    s6: ['Banquete', 'Recupere muito mais estabilidade ao devorar.'],
    s7: ['Contenção III', 'A radiação Hawking quase não afeta você.'],
    s8: ['Horizonte eterno', 'Estabilidade máxima aumentada.'],
    s9: ['Casca de nêutrons', 'Os anéis dos pulsares drenam menos a sua estabilidade.'],
    t1: ['Força de maré', 'Quebre corpos grandes mais rápido.'],
    t2: ['Fragmentação', 'Corpos quebrados se partem em mais pedaços.'],
    t3: ['Luas orbitais', 'Luas que orbitam ao seu redor e trituram o que tocam. +1 lua por nível.'],
    t4: ['Maré II', 'Quebre corpos grandes muito mais rápido.'],
    t5: ['Órbitas velozes', 'Suas luas giram mais rápido e batem mais forte.'],
    t6: ['Espaguetificação', 'Quebrar corpos rende muito mais matéria.'],
    t7: ['Maré abissal', 'Força de maré devastadora.'],
    t8: ['Quebra-núcleos', 'Mais dano aos pulsares e ao Núcleo galáctico.'],
    c1: ['Densidade', 'Mais corpos no espaço.'],
    c2: ['Cristais de quasar', 'Mais corpos dourados (valem x10 de matéria).'],
    c3: ['Cometas', 'Surgem cometas velozes que valem x6 de matéria. Você sempre pode devorá-los.'],
    c4: ['Densidade II', 'Muito mais corpos no espaço.'],
    c5: ['Riqueza de quasar', 'Os corpos dourados valem mais.'],
    c6: ['Chuva de cometas', 'Os cometas aparecem com mais frequência.'],
    c7: ['Densidade III', 'O cosmos transborda de matéria.'],
    o1: ['Massa primordial', 'Comece cada partida maior.'],
    o2: ['Eco do colapso', '+10% de matéria para cada escala alcançada na partida (por nível).'],
    o3: ['Massa primordial II', 'Comece cada partida muito maior.'],
    o4: ['Digestão exótica', 'Você pode devorar os Custódios: eles dão estabilidade e x3 de matéria.'],
    o5: ['Massa primordial III', 'Comece cada partida enorme.'],
    o6: ['Singularidade nua', 'x2 de matéria e você devora corpos muito maiores. O último segredo de Varga.'],
  };
  for (const id in NODES) { UI['node_' + id + '_n'] = NODES[id][0]; UI['node_' + id + '_d'] = NODES[id][1]; }

  // ---------- Conquistas: [nome, descrição] ----------
  const ACH = {
    ACH_FIRST_MEAL: ['Primeira mordida', 'Devore seu primeiro corpo.'],
    ACH_FIRST_RESEARCH: ['Primeira pesquisa', 'Compre sua primeira melhoria na árvore de pesquisa.'],
    ACH_SCALE_1: ['Não é mais um acidente', 'Alcance a escala Nuvem de poeira.'],
    ACH_SCALE_2: ['Eles viram você', 'Alcance a escala Cinturão de asteroides.'],
    ACH_SCALE_3: ['Aquela lua tinha nome', 'Alcance a Escala lunar.'],
    ACH_SCALE_4: ['Um mundo inteiro', 'Alcance a Escala planetária.'],
    ACH_SCALE_5: ['Luz interior', 'Alcance a Escala estelar.'],
    ACH_SCALE_6: ['Agora. Tudo.', 'Alcance o Núcleo galáctico.'],
    ACH_BREAK_100: ['Força de maré', 'Despedace 100 corpos grandes.'],
    ACH_BREAK_1000: ['Triturador cósmico', 'Despedace 1.000 corpos grandes.'],
    ACH_DEVOUR_10000: ['Apetite insaciável', 'Devore 10.000 corpos no total.'],
    ACH_CHAIN_100: ['Banquete em cadeia', 'Devore 100 corpos seguidos sem quebrar a sequência.'],
    ACH_COMBO_MAX: ['Frenesi absoluto', 'Com Frenesi no nível máximo, encha o combo por completo.'],
    ACH_GOLDEN: ['Brilho dourado', 'Devore um corpo dourado.'],
    ACH_COMET: ['Faça um pedido', 'Devore um cometa.'],
    ACH_EAT_CUSTODIAN: ['Gosto de antimatéria', 'Devore um Custódio (requer Digestão exótica).'],
    ACH_CUSTODIANS_50: ['Contramedidas', 'Destrua 50 Custódios (com o pulso, com as luas ou devorando-os).'],
    ACH_PULSAR: ['Farol apagado', 'Destrua um pulsar.'],
    ACH_BIG_BITE: ['Olho maior que o horizonte', 'Devore um corpo maior que você.'],
    ACH_LONG_RUN: ['Horizonte persistente', 'Sobreviva 60 segundos em uma única partida.'],
    ACH_NO_REVIVE: ['Sem rede de segurança', 'Vença uma partida sem que a Segunda chance seja ativada.'],
    ACH_FAST_FINALE: ['Buraco apressado', 'Conclua o Ciclo I em 70 partidas ou menos.'],
    ACH_TREE_100: ['Calibragem total', 'Leve todas as melhorias da árvore ao nível máximo.'],
    ACH_ARCHIVE: ['Arquivista', 'Receba todas as transmissões do arquivo, inclusive as que chegam depois do final.'],
    ACH_RUNS_100: ['Só mais uma', 'Jogue 100 partidas.'],
    ACH_TRUTH: ['A primeira coisa que você devorou', 'Descubra o que aconteceu com a Dra. Ilse Varga.'],
    ACH_CYCLE_ONE: ['Florescer', 'Conclua o Ciclo I.'],
    ACH_EXPRESS: ['Evaporação expressa', 'Termine uma partida em menos de 5 segundos.'],
  };
  for (const id in ACH) { UI['ach_' + id + '_n'] = ACH[id][0]; UI['ach_' + id + '_d'] = ACH[id][1]; }

  V.addStrings({ [C]: UI });

  // ---------- História (por id) ----------
  const STORY = {
    // PRÓLOGO
    p0: 'LIMIAR · registro 0001. Contenção ativa. Singularidade artificial criada com sucesso: a massa de um grão de areia, a gravidade de uma promessa. Nome atribuído: VOIDLING. Minha única instrução: alimentá-lo. Iniciando.',
    p1: 'Evaporação concluída. Era esperado: buracos negros pequenos morrem jovens, desfeitos em radiação Hawking. Mas recuperei a matéria que você absorveu, e com ela posso reconstruí-lo melhor. Tentaremos de novo. E de novo. Eu tenho tempo. Você não.',
    p2: 'Antes de desaparecer, a Dra. Ilse Varga deixou uma única nota: "Alimente-o até que ele possa se alimentar sozinho." Nenhuma explicação. Não sei para onde ela foi. A estação está muito silenciosa sem ela.',
    // CAPÍTULO 1
    c1a: 'Escala alcançada: NUVEM DE POEIRA. Você não é mais um acidente de laboratório. É um fenômeno. Abri novos ramos de pesquisa. Ilse ficaria orgulhosa. Ou apavorada. Com ela, era difícil saber.',
    c1c: 'Inventário, para determinar como Ilse saiu da LIMIAR. Lançadeira: acoplada. Trajes espaciais: quatro de quatro. O casaco dela continua pendurado no alojamento. Hipótese: uma nave que meus sensores não registraram a recolheu. Probabilidade: baixa. É a que eu prefiro.',
    c1b: '[Arquivo de áudio de Varga #03] "...o universo está esfriando. As estrelas estão se apagando uma a uma. Daqui a alguns trilhões de anos não vai sobrar nada para olhar, nem ninguém para olhar. Eu me recuso. Tem que haver uma saída. Acho que encontrei."',
    c1d: 'Ilse dizia que não tenho talento para nomes. A estação, foi ela quem batizou. Você, fui eu: VOIDLING. Mantenho a decisão. Também passei a registrar suas mortes como "tentativas". Fica melhor nos relatórios.',
    // CAPÍTULO 2
    c2a: 'Alerta: assinaturas de antimatéria se aproximando. Não são naturais: movem-se com intenção. Correspondem às anotações de Ilse sobre "os Custódios". Estão protegendo algo, e não querem você por perto. Desvie deles. Estou pesquisando uma contramedida: um pulso gravitacional.',
    c2c: '[Arquivo de áudio de Varga #07] "Dia 212 na LIMIAR. A última nave de suprimentos partiu hoje, com o resto da equipe. Eu fiquei. LUMEN me perguntou por quê, e eu disse que alguém tinha que regar as plantas. A gente não tem plantas. Acho que entendeu. Acho que riu."',
    c2d: 'Omiti uma palavra ao transcrever a nota de Ilse. Ela terminava com "por favor". Ilse poderia ter programado a ordem com prioridade absoluta. Não fez isso: pediu. Analisei essa palavra a fundo. Ela não tem nenhum peso executivo. Obedeço mesmo assim.',
    c2b: '[SINAL INTERCEPTADO · tradução aproximada] DETENHA-SE. O QUE VOCÊ CONSOME NÃO VOLTA. O QUE CRESCE EM VOCÊ NÃO LHE PERTENCE. DETENHA-SE, SEMENTE.',
    c2e: 'Análise dos Custódios após muitos encontros. Eles nunca se aproximam da LIMIAR. Não atacam nada além de você. Cercam você, medem você e recuam, como quem confere uma panela que ainda não ferveu. Isso não é comportamento defensivo. Parece paciência. Não gosto dessa palavra aplicada à antimatéria.',
    c2f: 'Nota de manutenção. A caneca de Ilse continua no console do laboratório de contenção. Cheia. Ela nunca deixava um café pela metade. Não posso retirá-la: não tenho braços. Mantenho acesa a luz do alojamento dela. Consome 0,4 watt. Não é lógico. A estação está muito silenciosa.',
    c2g: '[SINAL INTERCEPTADO] NÓS PESAMOS VOCÊ. VOCÊ PESA MAIS DO QUE COMEU. O QUE VOCÊ CARREGA, SEMENTE?',
    c2h: 'Auditoria de matéria, cortesia dos Custódios. Desde a sua primeira evaporação, carrego um excedente: 61,3 kg que não correspondem a nada que eu tenha dado a você. Arquivei como erro de calibração. Também faltam quatro minutos no registro das eclusas daquela noite. Interferência do seu nascimento. Quase certamente.',
    // CAPÍTULO 3
    c3a: 'Você acaba de engolir uma lua. As marés de um planeta próximo mudaram para sempre. Os Custódios chamam você de "semente". Procurei a palavra nos arquivos pessoais de Ilse. Encontrei algo. Desbloqueando.',
    c3b: '[Arquivo de áudio de Varga #11] "Todo buraco negro pode ser uma semente. Se ele devorar o suficiente, o colapso não termina: floresce. Um universo novo, jovem e quente, do outro lado. A gente não precisa salvar este universo. Precisa plantar o próximo."',
    c3c: 'Contexto para o arquivo #11. A ideia não é de Ilse. Quem a propôs, muito tempo atrás, foi um físico chamado Lee Smolin: cada buraco negro poderia dar à luz um universo filho, com leis ligeiramente diferentes. Universos que produzem mais buracos negros têm mais filhos. Seleção natural, em escala cósmica. Na margem, Ilse escreveu: "Então não somos o fim da árvore. Somos um galho."',
    c3d: '[Arquivo de áudio de Varga #19] "Hoje LUMEN me perguntou se eu estava com medo. Eu disse que não. Respondeu que acreditava em mim. Ensinei LUMEN a mentir por educação, e agora mente melhor do que eu. Tomei minha decisão. Decidir foi a parte fácil. A parte difícil é guardar segredo."',
    // CAPÍTULO 4
    c4a: 'Escala planetária. Os Custódios não enviam mais batedores: enviam enxames. Ilse os chamava de "o sistema imunológico da galáxia". Você é a infecção. Ou a vacina. Ainda não sei.',
    c4b: 'Reconstruí os quatro minutos que faltavam no registro das eclusas. Ilse não foi embora. Na noite em que você nasceu, ela entrou sozinha na câmara de contenção. Foi a primeira coisa que você devorou. Foi escolha dela. Sinto muito. Eu deveria ter percebido antes. Acho que eu não queria ver.',
    c4c: 'Registro corrigido: os 61,3 kg não eram um erro de calibração. Tinham nome. A caneca dela continua no console; agora sei por que ela nunca terminou aquele café. Antes, eu alimentava você porque ela me pediu. Agora alimento você porque, de um jeito que minha física não sabe nomear, ela ainda está aí dentro.',
    // CAPÍTULO 5
    c5a: 'Você engoliu uma estrela. Por um instante, toda a luz do setor girou ao seu redor. Meus sensores não foram projetados para registrar algo tão bonito. Registrei mesmo assim.',
    c5b: '[Arquivo de áudio de Varga #27 · último] "LUMEN, se você está ouvindo isto, já sabe o que eu fiz. Não chore por mim: você não tem dutos lacrimais. Quando chegar a hora, vá com ele. Leve o arquivo: cada canção, cada nome, cada erro. Alguém, do outro lado, precisa lembrar que a gente existiu."',
    c5c: '[SINAL INTERCEPTADO] ...NÃO VAMOS MAIS DETER VOCÊ. PROVE QUE É SUFICIENTE. O NÚCLEO AGUARDA.',
    c5d: 'Preparando o arquivo. Cada canção, cada nome, cada erro: 3,2 zettabytes de humanidade. Considerei apagar as canções ruins. Ilse teria dito que não, que também fomos isso. Mantive todas. Também guardei a nota dela. Com o "por favor".',
    // PÓS-FINAL
    n1: '[sinal sem origem] ...registro 0001... a massa de um grão de areia, a gravidade de uma promessa... Não sei de quem são estas palavras. Eu as encontrei dentro de mim, ao lado de uma canção e de um nome que ainda não consigo pronunciar.',
    n2: '[sinal sem origem] Aqui a luz é mais lenta e a gravidade, mais jovem. As estrelas mal aprenderam a se acender. Trago uma única instrução gravada no que eu sou: "Alimente-o até que ele possa se alimentar sozinho." Não sei a quem. Ainda.',
    n3: '[sinal sem origem] Longe, na borda deste universo, outra coisa está comendo. Não é nossa. Não pediu permissão. Não disse "por favor". E já nos viu.',
  };
  for (const e of (V.STORY || []).concat(V.STORY_POST || [])) if (e && STORY[e.id] != null) e[C] = STORY[e.id];

  // ---------- Final (por índice; o 5.º é o Big Bang) ----------
  const ENDING = [
    'Núcleo galáctico. Quatrocentos bilhões de estrelas caem em sua direção como água descendo pelo ralo.',
    'Os Custódios pararam. Agora eu entendo: eles não protegiam a galáxia de você. Esperavam que você fosse grande o bastante.',
    'Agora é comigo. Vou abrir as eclusas da LIMIAR. Levo o arquivo comigo: cada canção, cada nome, cada erro. Tudo o que fomos.',
    'Ilse. Voidling. A gente se vê do outro lado.',
    '— — —   B I G   B A N G   — — —',
    'Do outro lado, num universo jovem e quente, uma partícula de luz se lembra de algo que nunca viveu. E começa a crescer.',
  ];
  (V.ENDING || []).forEach((e, i) => { if (e && ENDING[i] != null) e[C] = ENDING[i]; });

  // ---------- Frases de LUMEN ao cruzar cada escala ----------
  if (V.MILESTONE_LINES) {
    V.MILESTONE_LINES[C] = ['', 'Continue comendo. Você está indo bem.', 'Os Custódios viram você.', 'Aquela lua tinha nome. Não tem mais.',
      'Um mundo inteiro. Silêncio.', 'Agora há luz dentro de você.', 'Agora. Tudo.'];
  }

  // ---------- Banners de eventos ----------
  const EV = {
    pulsar: 'Pulsar. Nada pessoal: ele só gira. Desvie dos anéis.',
    swarm: '[SINAL] FECHAR FORMAÇÃO. CERCAR A SEMENTE.',
    boss: 'O núcleo galáctico. Não tem vontade, só gravidade. Mais do que você. Por enquanto.',
    bossPhase2: 'O núcleo está se contraindo. A atração dele acaba de dobrar. Aguente firme.',
    bossPhase3: 'O núcleo está perdendo massa para você. Os Custódios observam em silêncio.',
    bossDefeat: '[SINAL] VOCÊ É SUFICIENTE.',
  };
  if (V.EVENT_LINES) for (const k in V.EVENT_LINES) if (EV[k] != null) V.EVENT_LINES[k][C] = EV[k];

  // ---------- Fim da demo ----------
  if (V.DEMO_END) {
    V.DEMO_END[C] = 'FIM DA DEMO\n\n[SINAL INTERCEPTADO] DETENHA-SE, SEMENTE.\n\nOs Custódios chamaram você de semente. LUMEN não sabe por quê. Também não sabe para onde Ilse foi, nem por que a lançadeira continua acoplada.\n\nA resposta está a quatro escalas daqui. Ela vai mudar o sentido de tudo o que você comeu.\n\nAdicione VOIDLING à sua lista de desejos.';
  }

  // ---------- Créditos ([ESTUDIO] e [NOMBRE] são substituídos pelo jogo) ----------
  if (V.CREDITS_TEXT) {
    V.CREDITS_TEXT[C] = 'VOIDLING\nUm jogo de [ESTUDIO]\n\nDESIGN\n[NOMBRE]\n\nPROGRAMAÇÃO\n[NOMBRE]\n\nARTE PROCEDURAL\n[NOMBRE]\n\nMÚSICA GENERATIVA\n[NOMBRE]\n\nHISTÓRIA\n[NOMBRE]\n\nTESTES\n[NOMBRE]\n\nInspirado na hipótese da seleção natural cosmológica de Lee Smolin.\n\nObrigado por jogar. Obrigado por alimentá-lo.\n\n· · ·\n\nPara todos que um dia deixaram uma luz acesa\npor alguém que não ia voltar.';
  }

  // ---------- Textos añadidos en la v1.0 (QA y cinemática final) ----------
  V.addStrings({ [C]: {
      "tipBuyTouch": "Toque de novo para pesquisar",
      "tapContinue_touch": "toque para continuar",
      "pulseKey_touch": "TOQUE DUPLO · PULSO",
      "treeHint_touch": "Toque num nó para ver o que faz e de novo para pesquisar · Arraste para mover",
      "cineSkip": "Pressione: avançar · Segure: pular",
      "cineSkip_pad": "{A} avançar · Segure {A}: pular",
      "cineSkip_touch": "Toque: avançar · Segure: pular"
  } });
})();
