const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const checkOnly = process.argv.includes("--check");

const services = [
  ["01", "Product Scope", "Transformamos uma ideia num plano de produto claro, priorizado e estimado.", "/servicos/product-scope.html"],
  ["02", "MVP Builder", "Desenhamos e desenvolvemos a primeira versão pronta para validar no mercado.", "/servicos/mvp-builder.html"],
  ["03", "UX/UI Design", "Criamos fluxos simples e interfaces coerentes, pensadas para pessoas reais.", "/servicos/ux-ui.html"],
  ["04", "Custom Software", "Construímos software à medida para operações, integrações e produtos digitais.", "/servicos/custom-software.html"],
  ["05", "Dedicated Teams", "Reforçamos a tua equipa com talento técnico ajustado ao desafio.", "/servicos/dedicated-teams.html"]
];

function serviceList() {
  return `<div class="service-list">${services.map(([number, name, description, href]) => `
    <a class="service-row" href="${href}">
      <span class="service-index">${number}</span>
      <h3 class="service-name">${name}</h3>
      <p class="service-desc">${description}</p>
      <span class="service-arrow" aria-hidden="true">↗</span>
    </a>`).join("")}
  </div>`;
}

function header(active = "") {
  const nav = [
    ["services", "Serviços", "/servicos.html"],
    ["process", "Processo", "/process.html"],
    ["about", "Sobre nós", "/about-us.html"],
    ["tech", "Tecnologia", "/tech.html"]
  ];
  const links = nav.map(([key, label, href]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>
  <header class="site-header">
    <div class="nav-shell wrap">
      <a class="brand" href="/" aria-label="Cobrait — início"><img class="brand-logo" src="/assets/logo-mark-cropped-CVmwixhD.png" alt="Cobrait"></a>
      <nav class="desktop-nav" aria-label="Navegação principal">${links}</nav>
      <div class="header-actions">
        <a class="button button-primary header-cta" href="/book-a-call.html">Falar do projeto</a>
        <button class="mobile-toggle" type="button" aria-label="Abrir menu" aria-controls="mobile-navigation" aria-expanded="false" data-nav-toggle><span></span></button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobile-navigation" aria-label="Navegação móvel" data-mobile-nav hidden>
      ${links}
      <a class="button button-primary" href="/book-a-call.html">Falar do projeto</a>
    </nav>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <div>
          <a class="brand" href="/" aria-label="Cobrait — início"><img class="brand-logo brand-logo-footer" src="/assets/logo-mark-cropped-CVmwixhD.png" alt="Cobrait"></a>
          <p class="footer-statement">Software pensado para o teu negócio, construído com clareza e preparado para evoluir.</p>
        </div>
        <div>
          <p class="footer-heading">Explorar</p>
          <div class="footer-links">
            <a class="footer-link" href="/servicos.html">Serviços</a>
            <a class="footer-link" href="/process.html">Processo</a>
            <a class="footer-link" href="/about-us.html">Sobre nós</a>
            <a class="footer-link" href="/tech.html">Tecnologia</a>
          </div>
        </div>
        <div>
          <p class="footer-heading">Contacto</p>
          <div class="footer-links">
            <a class="footer-link" href="mailto:geral@cobrait.pt">geral@cobrait.pt</a>
            <a class="footer-link" href="https://instagram.com/cobra_it" target="_blank" rel="noreferrer">Instagram · @cobra_it</a>
            <span class="footer-link">Porto, Portugal</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-current-year></span> Cobrait Software Factory.</span>
        <span><a href="/privacidade.html">Privacidade</a> · <a href="/termos.html">Termos</a> · <a href="/cookies.html">Cookies</a></span>
      </div>
    </div>
  </footer>`;
}

function scripts(extra = []) {
  return [...extra,
    "/assets/js/site-ui.js",
    "/assets/js/cms-client.js",
    "/assets/js/cms-inline-editor.js"
  ].map((src) => `<script src="${src}" defer></script>`).join("\n  ");
}

function layout({ title, description, active, body, extraScripts = [], bodyClass = "" }) {
  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#050505">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="icon" href="/assets/images/favicon.ico">
  <link rel="stylesheet" href="/assets/css/site-redesign.css">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
  ${header(active)}
  <main id="conteudo">${body}</main>
  ${footer()}
  ${scripts(extraScripts)}
</body>
</html>\n`;
}

function ctaBand(title = "Tens uma ideia? Vamos torná-la clara.", text = "Conta-nos o contexto. Respondemos normalmente em 24–48 horas úteis com os próximos passos.") {
  return `<section class="cta-band blue-surface">
    <div class="wrap cta-band-inner">
      <div><h2>${title}</h2><p>${text}</p></div>
      <a class="button button-light button-arrow" href="/book-a-call.html">Falar do projeto</a>
    </div>
  </section>`;
}

function sectionHead(kicker, title, lead = "") {
  return `<div class="section-head"><p class="section-kicker">${kicker}</p><div><h2 class="section-title">${title}</h2>${lead ? `<p class="section-lead">${lead}</p>` : ""}</div></div>`;
}

function pageHero(label, title, intro, sideTitle, sideText) {
  return `<section class="page-hero"><div class="wrap page-hero-grid"><div><p class="page-label">${label}</p><h1 class="page-title">${title}</h1><p class="page-intro">${intro}</p></div><aside class="page-side"><strong>${sideTitle}</strong>${sideText}</aside></div></section>`;
}

function processList(items) {
  return `<div class="process-list">${items.map(([title, text]) => `<article class="process-step"><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>`;
}

const home = layout({
  title: "Cobrait — Software à medida, do scope ao lançamento",
  description: "A Cobrait transforma ideias em produtos digitais: Product Scope, MVP, UX/UI, software à medida e equipas dedicadas.",
  body: `
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <p class="eyebrow">Software Factory · Porto</p>
        <h1 class="hero-title"><span class="hero-title-line1">Da ideia</span> ao produto. <span class="accent hero-title-line2">Sem ruído.</span></h1>
        <p class="hero-sub">Transformamos desafios de negócio em software robusto, escalável e agradável de usar — do primeiro scope ao lançamento.</p>
        <div class="hero-actions"><a class="button button-primary button-arrow" href="/book-a-call.html">Falar do projeto</a><a class="button button-secondary" href="/servicos.html">Ver serviços</a></div>
      </div>
      <div class="hero-note"><strong>Clareza antes do código.</strong><p>Começamos pelo problema, pelas prioridades e pela forma mais simples de criar valor.</p></div>
    </div>
  </section>
  <div class="signal-bar"><div class="wrap signal-grid"><div class="signal-item"><strong>Scope</strong><span>10–15 dias</span></div><div class="signal-item"><strong>MVP</strong><span>2–6 semanas</span></div><div class="signal-item"><strong>Lean + Agile</strong><span>Iterações transparentes</span></div><div class="signal-item"><strong>NDA</strong><span>Disponível desde o início</span></div></div></div>
  <section class="section">
    <div class="wrap">${sectionHead("Para quem", "O ponto de partida muda. O foco no resultado não.", "Trabalhamos com equipas que precisam de reduzir incerteza, lançar mais depressa ou desbloquear capacidade técnica.")}
      <div class="audience-grid"><article class="audience-item"><span class="audience-number">01</span><h3>Fundadores</h3><p>Uma ideia que precisa de estrutura, validação e uma primeira versão credível.</p></article><article class="audience-item"><span class="audience-number">02</span><h3>PME e operações</h3><p>Processos manuais, sistemas desligados ou software que já não acompanha o negócio.</p></article><article class="audience-item"><span class="audience-number">03</span><h3>Equipas de produto</h3><p>Roadmaps ambiciosos que precisam de design, engenharia ou reforço dedicado.</p></article></div>
    </div>
  </section>
  <section class="section surface"><div class="wrap">${sectionHead("O que construímos", "Da decisão ao software em produção.", "Escolhe um ponto de entrada ou combina competências numa entrega end-to-end.")}${serviceList()}</div></section>
  <section class="section blue-surface"><div class="wrap">${sectionHead("Como trabalhamos", "Um processo curto, visível e sem surpresas.", "Cada fase termina com decisões e entregáveis concretos.")}${processList([["Descobrir", "Alinhamos o problema, utilizadores, objetivos e restrições."],["Definir", "Priorizamos o que cria valor e fechamos scope, roadmap e estimativa."],["Construir", "Desenhamos, desenvolvemos e validamos em ciclos curtos."],["Lançar", "Testamos, colocamos em produção e preparamos a próxima evolução."]])}</div></section>
  <section class="section"><div class="wrap"><div class="quote-panel"><p>Menos apresentações. Mais decisões, produto e progresso visível.</p><span>Cobrait · Produto, Design & Code</span></div></div></section>
  <section class="section surface"><div class="wrap">${sectionHead("Perguntas frequentes", "O essencial antes de começarmos.")}
    <div class="faq-list"><details><summary>Quanto tempo demora um primeiro projeto?</summary><p>Um Product Scope demora normalmente 10–15 dias. Um MVP focado pode ser desenvolvido em 2–6 semanas, dependendo do âmbito e integrações.</p></details><details><summary>Podemos começar apenas pela definição?</summary><p>Sim. O Product Scope é uma entrega autónoma: ficas com backlog, prioridades, roadmap, estimativa e decisões em aberto.</p></details><details><summary>Trabalham com equipas internas?</summary><p>Sim. Podemos assumir uma entrega completa ou integrar design, engenharia e QA na tua equipa.</p></details><details><summary>Como protegem a ideia?</summary><p>Podemos assinar um NDA antes da primeira conversa detalhada. A confidencialidade faz parte da forma como trabalhamos.</p></details></div>
  </div></section>
  ${ctaBand()}`,
  extraScripts: ["/assets/js/nebula-forms.js"]
});

const servicesPage = layout({
  title: "Serviços — Cobrait",
  description: "Product Scope, MVP Builder, UX/UI, software à medida e equipas dedicadas.",
  active: "services",
  body: `${pageHero("Serviços", "Produto, design <span class=\"accent\">& code.</span>", "Da primeira decisão ao software em produção: entramos onde a tua equipa mais precisa.", "Uma parceria flexível", "Um serviço focado ou uma equipa end-to-end, sempre com entregáveis claros.")}
  <section class="section surface"><div class="wrap">${serviceList()}</div></section>
  <section class="section"><div class="wrap">${sectionHead("Escolher o ponto de entrada", "Começa pelo maior risco do projeto.", "Se ainda não tens scope, começamos pela definição. Se já tens direção, aceleramos design e desenvolvimento.")}<div class="deliverables"><article class="deliverable"><span>01</span><h3>Incerteza de produto</h3><p>Product Scope para priorizar valor, risco, custo e sequência.</p></article><article class="deliverable"><span>02</span><h3>Necessidade de validar</h3><p>MVP Builder para colocar uma primeira versão real nas mãos dos utilizadores.</p></article><article class="deliverable"><span>03</span><h3>Experiência confusa</h3><p>UX/UI para simplificar fluxos e tornar a interface coerente.</p></article><article class="deliverable"><span>04</span><h3>Falta de capacidade</h3><p>Software à medida ou uma equipa dedicada para executar e evoluir.</p></article></div></div></section>
  ${ctaBand("Qual é o bloqueio mais caro do teu produto?", "Conta-nos onde estás. Ajudamos a escolher a intervenção mais simples e eficaz.")}`
});

const processPage = layout({
  title: "Processo — Cobrait",
  description: "O processo Cobrait: Discovery, roadmap, sprints, QA e lançamento.",
  active: "process",
  body: `${pageHero("Processo", "Do scope ao <span class=\"accent\">lançamento.</span>", "Reduzimos o desconhecido antes de aumentar o investimento. Depois entregamos em ciclos curtos, com decisões visíveis.", "Lean + Agile", "Só o processo necessário para manter velocidade, qualidade e alinhamento.")}
  <section class="section blue-surface"><div class="wrap">${processList([["Discovery", "Percebemos o contexto, os utilizadores, o objetivo de negócio e as restrições técnicas."],["Roadmap", "Transformamos informação em prioridades, backlog, riscos, equipa e estimativa."],["Sprints", "Desenhamos e desenvolvemos em incrementos demonstráveis, com feedback frequente."],["Launch", "Validamos qualidade, preparamos produção, lançamos e medimos o que vem a seguir."]])}</div></section>
  <section class="section"><div class="wrap">${sectionHead("Princípios", "Descobrir. Construir. Escalar.")}<div class="audience-grid"><article class="audience-item"><span class="audience-number">01</span><h3>Transparência</h3><p>Sabes o que está decidido, o que está em curso e o que pode mudar.</p></article><article class="audience-item"><span class="audience-number">02</span><h3>Foco</h3><p>Priorizamos o menor conjunto de funcionalidades capaz de provar valor.</p></article><article class="audience-item"><span class="audience-number">03</span><h3>Qualidade</h3><p>Arquitetura, testes e experiência são tratados como parte do produto.</p></article></div></div></section>
  ${ctaBand("Um processo simples começa com uma boa conversa.", "Traz o problema, mesmo que o scope ainda não esteja definido.")}`
});

const aboutPage = layout({
  title: "Sobre nós — Cobrait",
  description: "Conhece a abordagem da Cobrait: visão de produto, design e engenharia numa equipa focada.",
  active: "about",
  body: `${pageHero("Sobre nós", "Clareza, foco <span class=\"accent\">e execução.</span>", "Somos uma software factory no Porto. Juntamos pensamento de produto, design e engenharia para construir soluções úteis e sustentáveis.", "Product owner mindset", "Não entregamos apenas código. Questionamos prioridades e cuidamos do resultado.")}
  <section class="section surface"><div class="wrap"><div class="split"><div class="sticky-copy"><p class="section-kicker">A nossa abordagem</p><h2 class="section-title">End-to-end, sem perder proximidade.</h2><p class="section-lead">Uma equipa pequena, sénior e diretamente envolvida nas decisões que movem o produto.</p></div><div class="feature-list"><article class="feature-item"><h3>MVP-first</h3><p>Procuramos a versão mais focada que permita aprender com o mercado.</p></article><article class="feature-item"><h3>Engenharia com futuro</h3><p>Código legível, arquitetura escalável e qualidade adequada à fase do negócio.</p></article><article class="feature-item"><h3>Comunicação direta</h3><p>Contexto partilhado, demos frequentes e decisões documentadas.</p></article><article class="feature-item"><h3>Ritmo sustentável</h3><p>Velocidade sem acumular dívida que bloqueie o passo seguinte.</p></article></div></div></div></section>
  <section class="section"><div class="wrap">${sectionHead("O que entregamos", "Um produto que a tua equipa consegue compreender e continuar.")}<div class="deliverables"><article class="deliverable"><span>01</span><h3>Produto em produção</h3><p>Preparado para utilizadores reais e para recolher aprendizagem.</p></article><article class="deliverable"><span>02</span><h3>Arquitetura clara</h3><p>Decisões técnicas proporcionais ao risco e à escala esperada.</p></article><article class="deliverable"><span>03</span><h3>Experiência coerente</h3><p>Fluxos, interface e sistema visual alinhados com o contexto.</p></article><article class="deliverable"><span>04</span><h3>Continuidade</h3><p>Documentação, testes e handoff para reduzir dependências.</p></article></div></div></section>
  ${ctaBand("Precisas de uma equipa que pense contigo?", "Explica-nos o desafio. Respondemos com perguntas, não com uma solução pré-feita.")}`
});

const techPage = layout({
  title: "Tecnologia — Cobrait",
  description: "Tecnologia e engenharia Cobrait: React, Next.js, Node.js, TypeScript, Postgres, AWS e integrações.",
  active: "tech",
  body: `${pageHero("Tecnologia", "Tecnologia ao serviço da <span class=\"accent\">solução.</span>", "Escolhemos ferramentas maduras, adequadas ao produto e simples de operar — não uma stack por hábito.", "Construído para evoluir", "Performance, segurança, manutenibilidade e custo operacional entram na decisão desde o início.")}
  <section class="section surface"><div class="wrap">${sectionHead("Stack", "Ferramentas modernas, escolhas pragmáticas.")}<div class="stack-groups"><article class="stack-group"><h3>Front-end</h3><div class="tag-list"><span class="tag">React</span><span class="tag">Next.js</span><span class="tag">TypeScript</span><span class="tag">Design Systems</span></div></article><article class="stack-group"><h3>Back-end & dados</h3><div class="tag-list"><span class="tag">Node.js</span><span class="tag">APIs</span><span class="tag">PostgreSQL</span><span class="tag">Integrações</span></div></article><article class="stack-group"><h3>Infraestrutura</h3><div class="tag-list"><span class="tag">AWS</span><span class="tag">CI/CD</span><span class="tag">Observabilidade</span><span class="tag">Cloud</span></div></article></div></div></section>
  <section class="section"><div class="wrap">${sectionHead("Aplicações", "Onde a engenharia cria vantagem.")}<div class="deliverables"><article class="deliverable"><span>01</span><h3>Produtos full-stack</h3><p>Plataformas web completas, do interface à infraestrutura.</p></article><article class="deliverable"><span>02</span><h3>Integrações e automação</h3><p>Sistemas ligados e tarefas repetitivas transformadas em fluxos fiáveis.</p></article><article class="deliverable"><span>03</span><h3>Produtos de dados</h3><p>Informação organizada para decisão, operação e novos serviços.</p></article><article class="deliverable"><span>04</span><h3>Experiências mobile</h3><p>Aplicações responsivas e experiências adaptadas à utilização em movimento.</p></article></div></div></section>
  ${ctaBand("A tecnologia certa começa pelo problema certo.", "Partilha o contexto técnico e de negócio. Ajudamos a reduzir a complexidade.")}`
});

function servicePage({ fileTitle, label, title, intro, sideTitle, sideText, benefits, phases, deliverables, faq }) {
  return layout({
    title: `${fileTitle} — Cobrait`,
    description: intro.replace(/<[^>]+>/g, ""),
    active: "services",
    body: `${pageHero(label, title, intro, sideTitle, sideText)}
    <section class="section surface"><div class="wrap"><div class="split"><div class="sticky-copy"><p class="section-kicker">Porque faz sentido</p><h2 class="section-title">Menos risco. Mais clareza para avançar.</h2></div><div class="feature-list">${benefits.map(([h, p]) => `<article class="feature-item"><h3>${h}</h3><p>${p}</p></article>`).join("")}</div></div></div></section>
    <section class="section blue-surface"><div class="wrap">${sectionHead("Como acontece", "Um percurso visível, do contexto à entrega.")}${processList(phases)}</div></section>
    <section class="section"><div class="wrap">${sectionHead("O que fica contigo", "Entregáveis claros, úteis e preparados para a próxima decisão.")}<div class="deliverables">${deliverables.map((d, i) => `<article class="deliverable"><span>0${i + 1}</span><h3>${d[0]}</h3><p>${d[1]}</p></article>`).join("")}</div></div></section>
    <section class="section surface"><div class="wrap">${sectionHead("Perguntas frequentes", "Antes de começarmos.")}<div class="faq-list">${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>
    ${ctaBand("Vamos tirar o projeto do abstrato?", "Uma conversa curta é suficiente para percebermos o ponto de partida e o próximo passo.")}`
  });
}

const productScope = servicePage({
  fileTitle: "Product Scope", label: "Serviço · Product Scope", title: "Da ideia a um plano <span class=\"accent\">executável.</span>", intro: "Em cerca de 15 dias, transformamos contexto e hipóteses num backlog priorizado, roadmap e estimativa.", sideTitle: "15–20 dias", sideText: "Uma fase intensiva para alinhar stakeholders e reduzir decisões caras durante o desenvolvimento.",
  benefits: [["Reduz o risco", "Valida pressupostos e identifica dependências antes de investir na construção."],["Controla o custo", "Define prioridades e uma estimativa realista para a primeira versão."],["Alinha a equipa", "Cria uma referência partilhada para negócio, design e tecnologia."],["Testa a relação", "Permite trabalhar connosco numa entrega curta antes de um compromisso maior."]],
  phases: [["Discovery", "Dias 1–2: objetivos, utilizadores, contexto, restrições e critérios de sucesso."],["Scope", "Dias 3–10: fluxos, requisitos, prioridades e decisões técnicas essenciais."],["Roadmap", "Dias 11–15: backlog, fases, equipa, orçamento, riscos e próximos passos."]],
  deliverables: [["Backlog priorizado", "Funcionalidades organizadas por valor, risco e dependências."],["Roadmap", "Sequência prática da primeira versão e das evoluções seguintes."],["Estimativa", "Equipa, calendário e intervalo de investimento recomendado."],["Mapa de riscos", "Decisões em aberto e pontos que precisam de validação."]],
  faq: [["Preciso de ter requisitos escritos?", "Não. O serviço existe precisamente para transformar uma ideia ou problema ainda difuso num plano claro."],["O desenvolvimento tem de ser feito pela Cobrait?", "Não. Os entregáveis são teus e podem seguir para a tua equipa ou outro parceiro."],["Podemos envolver vários stakeholders?", "Sim. Planeamos entrevistas e momentos de alinhamento para reduzir conflitos tardios."]]
});

const mvp = servicePage({
  fileTitle: "MVP Builder", label: "Serviço · MVP Builder", title: "Lança. Aprende. <span class=\"accent\">Evolui.</span>", intro: "Desenhamos e construímos uma primeira versão focada, pronta para validar hipóteses com utilizadores reais.", sideTitle: "2–6 semanas", sideText: "O prazo depende do âmbito e das integrações, mas a prioridade é chegar ao mercado sem excesso de produto.",
  benefits: [["Menor risco", "Investe primeiro no que precisa realmente de ser provado."],["Velocidade", "Um scope focado e ciclos curtos mantêm o produto em movimento."],["Aprendizagem real", "Feedback de utilização substitui opiniões e suposições."],["Base para crescer", "A primeira versão é construída com qualidade proporcional à evolução esperada."]],
  phases: [["Scope", "Fechamos objetivo, utilizadores, hipótese principal e funcionalidades essenciais."],["Experiência", "Desenhamos os fluxos e ecrãs críticos antes de expandir a interface."],["Desenvolvimento", "Construímos em ciclos curtos, com demos e validação frequente."],["Teste & launch", "Validamos os percursos principais, colocamos em produção e preparamos medição."]],
  deliverables: [["Produto funcional", "Uma versão utilizável e acessível a clientes ou utilizadores piloto."],["UX/UI", "Fluxos e interface coerentes com o objetivo da validação."],["Código e infraestrutura", "Base técnica, deploy e configurações necessários à operação."],["Próximos passos", "Aprendizagens, melhorias e prioridades depois do lançamento."]],
  faq: [["MVP significa produto descartável?", "Não. Significa uma versão focada. Evitamos complexidade prematura sem comprometer a capacidade de evolução."],["Podem trabalhar a partir de um design existente?", "Sim. Avaliamos o material e integramo-lo no processo, ajustando o necessário para desenvolvimento."],["O que acontece depois do lançamento?", "Podemos apoiar métricas, melhoria contínua, novas funcionalidades e escala técnica."]]
});

const uxui = servicePage({
  fileTitle: "UX/UI Design", label: "Serviço · UX/UI", title: "Produtos simples de <span class=\"accent\">entender e usar.</span>", intro: "Identificamos fricção, organizamos fluxos e criamos interfaces profissionais, coerentes e agradáveis.", sideTitle: "UX + UI", sideText: "Estrutura e comportamento primeiro; expressão visual depois. Sempre ligados ao contexto do produto.",
  benefits: [["Mais conversão", "Percursos claros ajudam as pessoas a chegar ao resultado com menos hesitação."],["Mais retenção", "Uma experiência coerente torna o produto mais fácil de aprender e repetir."],["Menos suporte", "Boa hierarquia e feedback reduzem erros e perguntas evitáveis."],["Mais consistência", "Um sistema visual acelera novas páginas e funcionalidades."]],
  phases: [["Briefing", "Alinhamos objetivos, utilizadores, dados disponíveis e restrições técnicas."],["Fluxos", "Mapeamos tarefas, arquitetura de informação e wireframes dos pontos críticos."],["Interface", "Desenvolvemos a direção visual, componentes e estados necessários."],["Handoff & QA", "Preparamos especificações e acompanhamos a implementação para manter qualidade."]],
  deliverables: [["Mapas e fluxos", "Percursos principais e decisões de arquitetura de informação."],["Wireframes", "Estrutura dos ecrãs antes da camada visual detalhada."],["Interface", "Ecrãs, estados e comportamento visual prontos para desenvolvimento."],["Sistema de design", "Tokens e componentes reutilizáveis para consistência e velocidade."]],
  faq: [["Fazem apenas design, sem desenvolvimento?", "Sim. Podemos entregar o trabalho à tua equipa e acompanhar o handoff."],["Podem melhorar um produto existente?", "Sim. Começamos por uma análise dos fluxos e dos sinais de fricção já disponíveis."],["Incluem testes com utilizadores?", "Podemos incluir sessões de validação, de acordo com o risco e a fase do produto."]]
});

const customSoftware = servicePage({
  fileTitle: "Custom Software", label: "Serviço · Custom Software", title: "Software certo para um desafio <span class=\"accent\">específico.</span>", intro: "Criamos aplicações, integrações e ferramentas internas ajustadas à operação e à vantagem do teu negócio.", sideTitle: "Sem molde pré-definido", sideText: "A solução parte do processo real, das pessoas e dos sistemas com que precisa de comunicar.",
  benefits: [["Propriedade", "Controlas o produto, a evolução e o conhecimento crítico."],["Flexibilidade", "O software acompanha o processo em vez de obrigar o processo a caber numa ferramenta."],["Escalabilidade", "Arquitetura e operação são pensadas para a evolução necessária, sem exagero prematuro."],["Vantagem competitiva", "Automatiza o que é genérico e diferencia o que torna o negócio especial."]],
  phases: [["Product Scope", "Mapeamos o processo, sistemas, utilizadores, riscos e retorno esperado."],["Design", "Definimos fluxos e interfaces para utilização clara e eficiente."],["Desenvolvimento", "Construímos por incrementos, com integrações e demos frequentes."],["QA, UAT & launch", "Testamos, validamos com a equipa e acompanhamos a entrada em produção."]],
  deliverables: [["Aplicação à medida", "Web, mobile ou ferramenta interna alinhada com a operação."],["Integrações", "APIs e automatizações para ligar sistemas e reduzir trabalho manual."],["Qualidade técnica", "Testes, observabilidade e segurança adequados ao contexto."],["Suporte à evolução", "Documentação e acompanhamento depois do lançamento."]],
  faq: [["Trabalham com sistemas existentes?", "Sim. Analisamos integrações, dados e limitações para reduzir risco na transição."],["Como evitam um projeto sem fim?", "Fechamos objetivos, prioridades e entregas incrementais; cada fase deve produzir valor verificável."],["Fazem manutenção?", "Sim. Podemos assegurar suporte, melhoria contínua e evolução do produto."]]
});

const dedicatedTeams = servicePage({
  fileTitle: "Dedicated Teams", label: "Serviço · Dedicated Teams", title: "A capacidade certa, <span class=\"accent\">quando é necessária.</span>", intro: "Reforçamos equipas de produto com engenharia, design e QA ajustados ao desafio e ao ritmo existente.", sideTitle: "Integração direta", sideText: "Talento validado, onboarding claro e colaboração com os teus processos e liderança.",
  benefits: [["Talento validado", "Perfis escolhidos pela experiência relevante para o teu produto."],["Menor risco", "Ajusta a capacidade à fase sem uma contratação precipitada."],["Mais velocidade", "Desbloqueia roadmap e reduz gargalos técnicos ou de design."],["Foco interno", "A tua equipa mantém atenção nas decisões onde cria mais valor."]],
  phases: [["Brief", "Percebemos stack, responsabilidades, senioridade, cultura e objetivos."],["Shortlist", "Propomos uma composição pequena e adequada ao trabalho real."],["Onboarding", "Integramos ferramentas, contexto, cerimónias e padrões de qualidade."],["Gestão & escala", "Acompanhamos desempenho e ajustamos capacidade quando necessário."]],
  deliverables: [["Front-end", "React, Next.js, interfaces e sistemas de design."],["Full-stack", "Node.js, APIs, bases de dados e integrações."],["UX/UI", "Fluxos, pesquisa, interface e acompanhamento de implementação."],["QA & suporte", "Testes, validação, documentação e continuidade operacional."]],
  faq: [["Qual é a duração mínima?", "Depende da composição e do objetivo. Definimos um período suficiente para onboarding e impacto real."],["A equipa trabalha nos nossos processos?", "Sim. Adaptamo-nos às ferramentas e rotinas existentes, propondo melhorias quando útil."],["Podemos começar com uma pessoa?", "Sim. A composição deve seguir o gargalo real, não um pacote fixo."]]
});

const booking = layout({
  title: "Falar sobre o projeto — Cobrait",
  description: "Marca uma conversa com a Cobrait e recebe orientação sobre scope, equipa, calendário e próximos passos.",
  body: `${pageHero("Contacto", "Vamos definir o <span class=\"accent\">próximo passo.</span>", "Partilha o contexto, mesmo que a ideia ainda esteja a ganhar forma. Respondemos normalmente em 24–48 horas úteis.", "30 minutos", "Uma primeira conversa para perceber o desafio, alinhar expectativas e decidir se faz sentido avançar.")}
  <section class="section surface"><div class="wrap contact-grid"><div><p class="section-kicker">O que acontece depois</p><h2 class="section-title">Direto ao assunto.</h2><div class="contact-details"><div class="contact-detail"><span>01 · Análise</span>Revemos o pedido e o contexto partilhado.</div><div class="contact-detail"><span>02 · Discovery call</span>Falamos durante cerca de 30 minutos.</div><div class="contact-detail"><span>03 · Próximos passos</span>Propomos scope, estimativa ou a melhor forma de começar.</div><div class="contact-detail"><span>Morada</span>R. Eng. Ferreira Dias 161<br>4100-247 Porto, Portugal</div><div class="contact-detail"><span>Horário</span>Segunda a sexta · 09:00–18:00</div></div></div>
  <div class="form-panel"><form id="contactForm"><div class="form-grid"><div class="field"><label for="fullName">Nome</label><input id="fullName" type="text" autocomplete="name" required></div><div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" required></div><div class="field field-full"><label for="summary">Projeto ou desafio</label><textarea id="summary" placeholder="O que queres criar, melhorar ou desbloquear?" required></textarea></div><fieldset class="field field-full"><legend>Intervalo de investimento</legend><div class="choice-grid"><label class="choice"><input type="radio" name="budget" value="Até 10k">Até 10k</label><label class="choice"><input type="radio" name="budget" value="10k–25k">10k–25k</label><label class="choice"><input type="radio" name="budget" value="25k–50k">25k–50k</label><label class="choice"><input type="radio" name="budget" value="50k+">50k+</label></div></fieldset><div class="field field-full"><label for="source">Como soubeste de nós? <span aria-hidden="true">(opcional)</span></label><input id="source" type="text"></div><label class="checkbox-row field-full"><input type="checkbox"><span>Este projeto requer NDA.</span></label><p class="form-note field-full">Ao enviar, aceitas que a Cobrait use estes dados para responder ao teu pedido. Consulta a <a href="/privacidade.html"><u>Política de Privacidade</u></a>.</p><div class="field-full"><button class="button button-primary" type="submit">Enviar pedido</button><p class="form-status" data-form-status role="status" aria-live="polite"></p></div></div></form></div></div></section>`,
  extraScripts: ["/assets/js/formsubmit-booking.js"]
});

function legalPage({ title, intro, sections }) {
  const slug = title.toLowerCase().includes("privacidade") ? "privacidade" : title.toLowerCase().includes("cookies") ? "cookies" : "termos";
  return layout({
    title: `${title} — Cobrait`,
    description: `${title} do website Cobrait.`,
    body: `${pageHero("Legal", title, intro, "Última atualização", "26 de fevereiro de 2026")}
    <section class="section"><div class="wrap legal-layout"><nav class="legal-nav" aria-label="Nesta página">${sections.map((s, i) => `<a href="#${slug}-${i + 1}">${i + 1}. ${s[0]}</a>`).join("")}</nav><div class="legal-content">${sections.map((s, i) => `<section id="${slug}-${i + 1}"><h2>${i + 1}. ${s[0]}</h2>${s[1]}</section>`).join("")}</div></div></section>`
  });
}

const privacy = legalPage({ title: "Política de Privacidade", intro: "Explicamos que dados recolhemos, porque os usamos e como podes exercer os teus direitos.", sections: [
  ["Quem trata os dados", "<p>A Cobrait é responsável pelo tratamento dos dados pessoais recolhidos através deste website e dos seus formulários.</p>"],
  ["Dados recolhidos", "<p>Podemos recolher dados de contacto e comerciais, como nome, email, telefone, empresa e informação partilhada sobre o projeto. Recolhemos também dados técnicos básicos necessários ao funcionamento e segurança do website.</p>"],
  ["Finalidades e base legal", "<p>Usamos os dados para responder a pedidos, preparar propostas, prestar serviços, cumprir obrigações legais e proteger os nossos sistemas. O tratamento baseia-se no consentimento, em diligências pré-contratuais, na execução de contrato ou em interesses legítimos adequados.</p>"],
  ["Partilha e transferências", "<p>Partilhamos dados apenas com prestadores necessários à operação, sujeitos a deveres de confidencialidade e proteção. Quando exista transferência internacional, aplicamos as garantias legalmente exigidas.</p>"],
  ["Conservação", "<p>Conservamos os dados apenas durante o período necessário à finalidade que justificou a recolha e aos prazos legais aplicáveis.</p>"],
  ["Os teus direitos", "<p>Podes pedir acesso, retificação, apagamento, limitação, oposição ou portabilidade, nos termos da lei. Podes também retirar o consentimento e apresentar reclamação à autoridade de controlo.</p>"],
  ["Segurança e contacto", "<p>Aplicamos medidas técnicas e organizativas adequadas ao risco. Para questões ou pedidos relacionados com privacidade, escreve para <a href=\"mailto:geral@cobrait.pt\">geral@cobrait.pt</a>.</p>"]
]});

const terms = legalPage({ title: "Termos e Condições", intro: "As regras de utilização deste website e da informação nele disponibilizada.", sections: [
  ["Objeto", "<p>Estes termos regulam o acesso e a utilização do website da Cobrait. Ao utilizá-lo, aceitas as condições aqui descritas.</p>"],
  ["Utilização do website", "<p>Deves usar o website de forma lícita, sem comprometer a segurança, disponibilidade ou direitos de terceiros.</p>"],
  ["Propriedade intelectual", "<p>Os conteúdos, identidade, textos, imagens e elementos técnicos pertencem à Cobrait ou são usados com autorização. Não podem ser reproduzidos ou explorados sem autorização prévia.</p>"],
  ["Responsabilidade", "<p>Procuramos manter a informação correta e o website disponível, mas não garantimos ausência de erros ou interrupções. A informação pública não constitui uma proposta contratual vinculativa.</p>"],
  ["Ligações de terceiros", "<p>O website pode incluir ligações para serviços externos. A Cobrait não controla nem assume responsabilidade pelo respetivo conteúdo ou políticas.</p>"],
  ["Alterações e lei aplicável", "<p>Podemos atualizar estes termos quando necessário. Aplica-se a lei portuguesa e, sem prejuízo das regras imperativas, são competentes os tribunais portugueses.</p>"],
  ["Contacto", "<p>Para questões sobre estes termos, contacta <a href=\"mailto:geral@cobrait.pt\">geral@cobrait.pt</a>.</p>"]
]});

const cookies = legalPage({ title: "Política de Cookies", intro: "O que são cookies, como podem ser usados neste website e como podes gerir as tuas escolhas.", sections: [
  ["O que são cookies", "<p>Cookies são pequenos ficheiros guardados no dispositivo para permitir funcionalidades, recordar preferências ou compreender a utilização de um website.</p>"],
  ["Tipos de cookies", "<p>O website pode usar cookies estritamente necessários ao funcionamento, cookies funcionais para preferências e, mediante consentimento quando exigido, cookies analíticos.</p>"],
  ["Finalidades", "<p>Os cookies ajudam a manter sessões, reforçar segurança, recordar escolhas e perceber de forma agregada como o website é utilizado.</p>"],
  ["Como gerir", "<p>Podes gerir ou apagar cookies nas definições do navegador. Bloquear cookies essenciais pode impedir algumas funcionalidades.</p>"],
  ["Serviços de terceiros", "<p>Alguns conteúdos ou serviços externos podem definir os seus próprios cookies, sujeitos às respetivas políticas.</p>"],
  ["Atualizações", "<p>Esta política pode ser revista para refletir mudanças técnicas, legais ou operacionais.</p>"],
  ["Contacto", "<p>Para questões sobre cookies, escreve para <a href=\"mailto:geral@cobrait.pt\">geral@cobrait.pt</a>.</p>"]
]});

const files = new Map([
  ["index.html", home], ["servicos.html", servicesPage], ["process.html", processPage], ["about-us.html", aboutPage], ["tech.html", techPage], ["book-a-call.html", booking], ["privacidade.html", privacy], ["termos.html", terms], ["cookies.html", cookies],
  ["servicos/product-scope.html", productScope], ["servicos/mvp-builder.html", mvp], ["servicos/ux-ui.html", uxui], ["servicos/custom-software.html", customSoftware], ["servicos/dedicated-teams.html", dedicatedTeams]
]);

const stale = [];
for (const [relative, html] of files) {
  const target = path.join(root, relative);
  if (checkOnly) {
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== html) stale.push(relative);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html, "utf8");
  }
}

if (checkOnly && stale.length) {
  console.error("Generated public pages are stale:\n- " + stale.join("\n- "));
  process.exit(1);
}

console.log(`${checkOnly ? "Checked" : "Rendered"} ${files.size} public pages.`);
