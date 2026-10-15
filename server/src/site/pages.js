const { paths, processSteps, serviceById, services } = require("./content");

const home = {
  pt: {
    id: "home",
    kind: "home",
    seo: {
      title: "COBRAIT — Desenvolvimento de software e inteligência artificial",
      description: "Desenvolvemos software à medida, produtos digitais e soluções com inteligência artificial a partir do Porto, Portugal."
    },
    hero: {
      kicker: "Produto · Engenharia · IA",
      title: "Software e inteligência artificial para fazer o negócio avançar.",
      text: "Definimos, desenhamos e desenvolvemos produtos digitais, plataformas e soluções com inteligência artificial — com contacto direto com a equipa responsável pelo trabalho.",
      primary: "Falar sobre um projeto",
      primaryHref: paths.pt.booking,
      secondary: "Ver como podemos ajudar",
      secondaryHref: paths.pt.services,
      signals: ["MVP com âmbito definido: 2–6 semanas", "Software à medida", "IA aplicada a necessidades reais"]
    },
    needs: {
      kicker: "O ponto de partida",
      title: "Em que ponto está o seu projeto?",
      text: "A dimensão da empresa muda. O que importa é perceber a decisão, o risco e o resultado que o software precisa de suportar.",
      items: [
        { number: "01", title: "Lançar", text: "Tem uma oportunidade validada e precisa de transformar a ideia num produto utilizável.", link: paths.pt.productScope, label: "Explorar Product Scope e MVP" },
        { number: "02", title: "Evoluir", text: "O produto já existe, mas precisa de novas funcionalidades, melhor experiência ou uma base técnica mais sólida.", link: paths.pt.mvp, label: "Explorar desenvolvimento de produto" },
        { number: "03", title: "Transformar", text: "Existem processos, sistemas ou operações que precisam de ser integrados, automatizados ou reconstruídos.", link: paths.pt.customSoftware, label: "Explorar software à medida" }
      ]
    },
    services: {
      kicker: "Capacidades",
      title: "Da definição inicial à evolução contínua.",
      text: "Escolhemos o formato de colaboração a partir do problema, da maturidade do produto e da capacidade que já existe do lado do cliente."
    },
    process: {
      kicker: "Como trabalhamos",
      title: "Clareza antes de velocidade. Velocidade depois da clareza.",
      text: "Cada fase reduz uma incerteza específica. As decisões são visíveis, o progresso é demonstrável e o próximo passo está sempre claro."
    },
    evidence: {
      kicker: "Trabalho verificável",
      title: "O progresso não deve depender de promessas difíceis de avaliar.",
      text: "Organizamos o trabalho para que decisões, entregáveis e qualidade possam ser acompanhados ao longo do projeto.",
      items: [
        { title: "Decisões documentadas", text: "Âmbito, prioridades, riscos e critérios ficam claros para todas as pessoas envolvidas." },
        { title: "Fluxos antes do custo", text: "Validamos estrutura e experiência antes de transformar decisões incertas em desenvolvimento." },
        { title: "Qualidade durante a entrega", text: "Revisão de código, testes e demonstrações fazem parte dos ciclos de construção." },
        { title: "Continuidade preparada", text: "Deployment, observabilidade e evolução são considerados antes da entrada em produção." }
      ]
    },
    engineering: {
      kicker: "Engenharia responsável",
      title: "Boas decisões técnicas devem continuar a fazer sentido depois do lançamento.",
      text: "Arquitetura, qualidade, segurança, testes e observabilidade não são uma fase final. Fazem parte da forma como o produto é pensado desde o início.",
      points: ["Arquitetura adequada ao contexto", "Revisão e qualidade de código", "Segurança e proteção de dados", "Performance e observabilidade", "Integrações e deployment", "Evolução sustentável"]
    },
  },
  en: {
    id: "home",
    kind: "home",
    seo: {
      title: "COBRAIT — Software development and artificial intelligence",
      description: "We develop custom software, digital products and AI-enabled solutions from Porto, Portugal."
    },
    hero: {
      kicker: "Product · Engineering · AI",
      title: "Software and artificial intelligence that move business forward.",
      text: "We scope, design and develop digital products, platforms and AI-enabled solutions — with direct access to the people responsible for the work.",
      primary: "Discuss a project",
      primaryHref: paths.en.booking,
      secondary: "See how we can help",
      secondaryHref: paths.en.services,
      signals: ["Defined-scope MVP: 2–6 weeks", "Custom software", "AI applied to real needs"]
    },
    needs: {
      kicker: "Where to begin",
      title: "Where is your project today?",
      text: "Company size changes. What matters is understanding the decision, risk and outcome the software needs to support.",
      items: [
        { number: "01", title: "Launch", text: "You have a validated opportunity and need to turn it into a usable product.", link: paths.en.productScope, label: "Explore Product Scope and MVP" },
        { number: "02", title: "Evolve", text: "The product exists but needs new capabilities, a better experience or stronger technical foundations.", link: paths.en.mvp, label: "Explore product development" },
        { number: "03", title: "Transform", text: "Processes, systems or operations need to be integrated, automated or rebuilt.", link: paths.en.customSoftware, label: "Explore custom software" }
      ]
    },
    services: {
      kicker: "Capabilities",
      title: "From early definition to continuous evolution.",
      text: "We shape the engagement around the problem, product maturity and the capability already available within the client team."
    },
    process: {
      kicker: "How we work",
      title: "Clarity before speed. Speed after clarity.",
      text: "Each phase removes a specific uncertainty. Decisions remain visible, progress is demonstrable and the next step is always clear."
    },
    evidence: {
      kicker: "Verifiable work",
      title: "Progress should not depend on promises that are difficult to assess.",
      text: "We organise the work so that decisions, outputs and quality remain visible throughout the project.",
      items: [
        { title: "Documented decisions", text: "Scope, priorities, risks and criteria remain clear to everyone involved." },
        { title: "Journeys before cost", text: "We validate structure and experience before uncertain decisions turn into development." },
        { title: "Quality throughout delivery", text: "Code review, testing and demos are part of the build cycles." },
        { title: "Continuity by design", text: "Deployment, observability and evolution are considered before production release." }
      ]
    },
    engineering: {
      kicker: "Responsible engineering",
      title: "Good technical decisions should still make sense after launch.",
      text: "Architecture, quality, security, testing and observability are not a final phase. They shape how the product is considered from the start.",
      points: ["Architecture suited to context", "Code review and quality", "Security and data protection", "Performance and observability", "Integrations and deployment", "Sustainable evolution"]
    },
  }
};

const servicesIndex = {
  pt: {
    id: "services",
    kind: "services",
    seo: { title: "Serviços de desenvolvimento de software — COBRAIT", description: "Product Scope, MVP, software à medida, UX/UI, Design Systems e equipas dedicadas para produtos e operações exigentes." },
    hero: { kicker: "Serviços", title: "A capacidade certa para cada fase do produto.", text: "Do primeiro mapa de decisões a uma plataforma em produção, combinamos produto, design e engenharia num processo responsável e adaptado ao contexto." },
    intro: { title: "Começamos pelo problema, não pelo formato de contratação.", text: "Alguns projetos precisam de clareza. Outros precisam de velocidade, especialização ou capacidade adicional. A nossa primeira responsabilidade é perceber qual dessas necessidades é real." },
    linkLabel: "Saber mais",
    finder: {
      kicker: "Orientação rápida",
      title: "Qual é o próximo passo mais útil?",
      text: "Escolha a situação mais próxima da sua. A recomendação serve para orientar a conversa, não para fechar o âmbito antes de percebermos o contexto.",
      question: "Neste momento, preciso de…",
      options: [
        { id: "scope", label: "Clarificar uma ideia ou necessidade", result: "Product Scope", description: "Reduzir incerteza, alinhar prioridades e sair com um plano estimável.", href: paths.pt.productScope },
        { id: "launch", label: "Lançar um novo produto", result: "MVP e produtos digitais", description: "Construir uma primeira versão útil, pronta para utilizadores e preparada para evoluir.", href: paths.pt.mvp },
        { id: "transform", label: "Automatizar ou reconstruir uma operação", result: "Software à medida e IA", description: "Ligar sistemas, simplificar processos e aplicar inteligência artificial quando existe um benefício concreto.", href: paths.pt.customSoftware },
        { id: "experience", label: "Melhorar um produto existente", result: "UX/UI e evolução de produto", description: "Reduzir fricção, organizar a experiência e consolidar padrões reutilizáveis.", href: paths.pt.uxui },
        { id: "capacity", label: "Reforçar a capacidade da equipa", result: "Equipa dedicada", description: "Adicionar capacidade técnica com comunicação direta e responsabilidade sobre a entrega.", href: paths.pt.dedicatedTeams }
      ],
      resultLabel: "Recomendação inicial",
      action: "Explorar este serviço"
    },
    comparison: {
      kicker: "Comparação",
      title: "Formatos diferentes para necessidades diferentes.",
      columns: ["Serviço", "Ponto de partida", "Resultado principal", "Formato"],
      rows: [
        ["Product Scope", "Âmbito ainda aberto", "Plano e estimativa", "Trabalho autónomo"],
        ["MVP e produto", "Proposta validada", "Produto em produção", "Projeto ou evolução"],
        ["Software à medida e IA", "Processo ou sistema específico", "Solução integrada", "Projeto e continuidade"],
        ["UX/UI", "Produto com fricção", "Experiência e sistema coerentes", "Intervenção ou evolução"],
        ["Equipa dedicada", "Direção já existente", "Capacidade adicional", "Colaboração contínua"]
      ]
    }
  },
  en: {
    id: "services",
    kind: "services",
    seo: { title: "Software development services — COBRAIT", description: "Product Scope, MVP, custom software, UX/UI, Design Systems and dedicated teams for demanding products and operations." },
    hero: { kicker: "Services", title: "The right capability for each stage of the product.", text: "From the first decision map to a production platform, we bring product, design and engineering into a responsible process shaped around context." },
    intro: { title: "We start with the problem, not the engagement model.", text: "Some projects need clarity. Others need speed, specialist experience or additional capacity. Our first responsibility is to identify which need is real." },
    linkLabel: "Learn more",
    finder: {
      kicker: "Quick orientation",
      title: "What is the most useful next step?",
      text: "Choose the situation closest to yours. The recommendation guides the conversation; it does not lock the scope before we understand the context.",
      question: "Right now, I need to…",
      options: [
        { id: "scope", label: "Clarify an idea or business need", result: "Product Scope", description: "Reduce uncertainty, align priorities and leave with an estimable plan.", href: paths.en.productScope },
        { id: "launch", label: "Launch a new product", result: "MVP and product development", description: "Build a useful first version, ready for users and structured to evolve.", href: paths.en.mvp },
        { id: "transform", label: "Automate or rebuild an operation", result: "Custom software and AI", description: "Connect systems, simplify processes and apply artificial intelligence where it creates a concrete benefit.", href: paths.en.customSoftware },
        { id: "experience", label: "Improve an existing product", result: "UX/UI and product evolution", description: "Remove friction, organise the experience and consolidate reusable patterns.", href: paths.en.uxui },
        { id: "capacity", label: "Increase team capacity", result: "Dedicated team", description: "Add technical capacity with direct communication and accountability for delivery.", href: paths.en.dedicatedTeams }
      ],
      resultLabel: "Initial recommendation",
      action: "Explore this service"
    },
    comparison: {
      kicker: "Comparison",
      title: "Different formats for different needs.",
      columns: ["Service", "Starting point", "Primary outcome", "Format"],
      rows: [
        ["Product Scope", "Scope remains open", "Plan and estimate", "Standalone engagement"],
        ["MVP and product", "Validated proposition", "Product in production", "Project or evolution"],
        ["Custom software and AI", "Specific process or system", "Integrated solution", "Project and continuity"],
        ["UX/UI", "Product with friction", "Coherent experience and system", "Intervention or evolution"],
        ["Dedicated team", "Direction already exists", "Additional capacity", "Continuous collaboration"]
      ]
    }
  }
};

const serviceDetails = {
  productScope: {
    pt: {
      seo: { title: "Product Scope — COBRAIT", description: "Reduza incerteza antes de desenvolver: prioridades, fluxos, direção técnica, estimativa e plano de execução." },
      hero: { kicker: "Product Scope", title: "Clarificar antes de construir.", text: "Transformamos uma necessidade de negócio num âmbito priorizado, tecnicamente viável e preparado para uma decisão de investimento informada." },
      fitTitle: "Quando faz sentido",
      fits: ["Existe uma oportunidade, mas o âmbito continua demasiado aberto.", "É necessário alinhar negócio, utilizadores e equipa técnica.", "Uma estimativa responsável depende de decisões ainda por tomar.", "É preciso validar riscos antes de assumir um projeto maior."],
      deliverablesTitle: "O que fica no final",
      deliverables: ["Objetivos e critérios de sucesso", "Requisitos e prioridades", "Fluxos essenciais de utilização", "Direção de UX/UI", "Arquitetura técnica inicial", "Riscos e dependências", "Estimativa e plano de execução"],
      note: "O Product Scope pode ser contratado como trabalho autónomo. O cliente mantém uma base clara para decidir avançar connosco ou com outra equipa.",
      faq: [
        { q: "É necessário ter requisitos escritos?", a: "Não. O objetivo do processo é precisamente transformar conhecimento disperso e decisões em aberto num plano coerente." },
        { q: "Inclui desenvolvimento?", a: "Normalmente não. Pode incluir protótipos ou validações técnicas pequenas quando são necessários para reduzir um risco específico." },
        { q: "Quanto tempo demora?", a: "Depende da complexidade e disponibilidade das pessoas-chave. O calendário é definido depois de uma conversa inicial." }
      ]
    },
    en: {
      seo: { title: "Product Scope — COBRAIT", description: "Reduce uncertainty before development with priorities, journeys, technical direction, estimates and an execution plan." },
      hero: { kicker: "Product Scope", title: "Create clarity before building.", text: "We turn a business need into a prioritised, technically viable scope that supports an informed investment decision." },
      fitTitle: "When it is useful",
      fits: ["The opportunity is real but scope remains too open.", "Business, users and the technical team need alignment.", "A responsible estimate depends on decisions that are still unresolved.", "Key risks need to be tested before a larger commitment."],
      deliverablesTitle: "What you leave with",
      deliverables: ["Goals and success criteria", "Requirements and priorities", "Essential user journeys", "UX/UI direction", "Initial technical architecture", "Risks and dependencies", "Estimate and execution plan"],
      note: "Product Scope can be commissioned as a standalone engagement. The client retains a clear basis for moving forward with COBRAIT or another team.",
      faq: [
        { q: "Do we need written requirements?", a: "No. The process exists to turn distributed knowledge and unresolved decisions into a coherent plan." },
        { q: "Does it include development?", a: "Usually not. It can include small prototypes or technical validation when they are necessary to reduce a specific risk." },
        { q: "How long does it take?", a: "That depends on complexity and access to key people. We define the timeline after an initial conversation." }
      ]
    }
  },
  mvp: {
    pt: {
      seo: { title: "MVP e desenvolvimento de produto — COBRAIT", description: "Do âmbito ao lançamento: desenhamos e desenvolvemos MVPs úteis, sólidos e preparados para evoluir." },
      hero: { kicker: "MVP e produtos digitais", title: "Chegar ao mercado com a versão certa.", text: "Construímos produtos suficientemente focados para lançar depressa e suficientemente sólidos para não começar novamente quando a validação chegar." },
      fitTitle: "Quando faz sentido",
      fits: ["Existe uma proposta de valor validada e é preciso chegar aos utilizadores.", "O prazo é importante, mas a primeira versão não pode ser descartável.", "Produto, interface e tecnologia precisam de avançar em conjunto.", "A equipa quer aprender com utilização real e não apenas com opiniões."],
      deliverablesTitle: "O que entregamos",
      deliverables: ["Âmbito e prioridades do MVP", "Fluxos e interface", "Aplicação funcional", "Backend e integrações", "Testes essenciais", "Deployment e observabilidade", "Plano pós-lançamento"],
      note: "Um MVP pode ser lançado em 2–6 semanas quando o âmbito, as integrações e a velocidade de decisão o permitem. Confirmamos a viabilidade antes de assumir esse compromisso.",
      faq: [
        { q: "MVP significa baixa qualidade?", a: "Não. Significa limitar o âmbito à menor versão que cria valor e aprendizagem. Segurança, qualidade e manutenção continuam proporcionais ao risco real." },
        { q: "Podem continuar depois do lançamento?", a: "Sim. Podemos evoluir o produto em ciclos contínuos ou preparar uma passagem estruturada para uma equipa interna." },
        { q: "Trabalham com produtos já iniciados?", a: "Sim. Primeiro avaliamos a base existente, o risco técnico e o custo de continuar ou reorganizar." }
      ]
    },
    en: {
      seo: { title: "MVP and product development — COBRAIT", description: "From scope to launch: we design and develop useful, solid MVPs that are ready to evolve." },
      hero: { kicker: "MVP and product development", title: "Reach the market with the right first version.", text: "We build products focused enough to launch quickly and solid enough to avoid starting again once validation arrives." },
      fitTitle: "When it is useful",
      fits: ["The value proposition is validated and needs to reach users.", "Time matters, but the first version cannot be disposable.", "Product, interface and technology need to move together.", "The team wants to learn from real use rather than opinions alone."],
      deliverablesTitle: "What we deliver",
      deliverables: ["MVP scope and priorities", "Journeys and interface", "Functional application", "Backend and integrations", "Essential testing", "Deployment and observability", "Post-launch plan"],
      note: "An MVP can launch in 2–6 weeks when scope, integrations and decision speed allow it. We confirm feasibility before making that commitment.",
      faq: [
        { q: "Does MVP mean low quality?", a: "No. It means limiting scope to the smallest version that creates value and learning. Security, quality and maintenance remain proportional to real risk." },
        { q: "Can you stay involved after launch?", a: "Yes. We can evolve the product continuously or prepare a structured handover to an internal team." },
        { q: "Do you work with existing products?", a: "Yes. We first assess the current foundations, technical risk and the cost of continuing or reorganising." }
      ]
    }
  },
  customSoftware: {
    pt: {
      seo: { title: "Software à medida e inteligência artificial — COBRAIT", description: "Plataformas, aplicações, automação, inteligência artificial e integrações construídas em torno da operação real da empresa." },
      hero: { kicker: "Software à medida e IA", title: "Quando o processo é específico, o software também pode ser.", text: "Criamos plataformas, aplicações e soluções com inteligência artificial que simplificam operações, ligam sistemas e suportam decisões importantes." },
      fitTitle: "Quando faz sentido",
      fits: ["A operação depende de folhas de cálculo, tarefas manuais ou sistemas isolados.", "O software disponível exige demasiadas adaptações ao processo real.", "É necessário integrar dados e ferramentas existentes.", "Segurança, permissões ou regras de negócio exigem uma solução própria."],
      deliverablesTitle: "Capacidades frequentes",
      deliverables: ["Portais e plataformas web", "Ferramentas operacionais internas", "APIs e integrações", "Automação de processos", "Funcionalidades com inteligência artificial", "Gestão de dados e permissões", "Migrações, manutenção e evolução"],
      note: "Não começamos por assumir que tudo precisa de ser construído ou que todos os problemas precisam de IA. Avaliamos integrações, ferramentas existentes, qualidade dos dados e o custo total de cada alternativa.",
      faq: [
        { q: "Integram software que já usamos?", a: "Sim. A avaliação de APIs, dados, autenticação e limitações dos sistemas existentes faz parte da definição técnica." },
        { q: "Quem fica com o código?", a: "A propriedade e condições de entrega são definidas contratualmente de forma clara antes do início do projeto." },
        { q: "Fazem manutenção?", a: "Sim. Podemos assegurar evolução, correções e acompanhamento operacional com um modelo adequado à criticidade da solução." }
      ]
    },
    en: {
      seo: { title: "Custom software and artificial intelligence — COBRAIT", description: "Platforms, applications, automation, artificial intelligence and integrations built around the way your operation actually works." },
      hero: { kicker: "Custom software and AI", title: "When the process is specific, the software can be too.", text: "We create platforms, applications and AI-enabled solutions that simplify operations, connect systems and support important decisions." },
      fitTitle: "When it is useful",
      fits: ["Operations depend on spreadsheets, manual work or disconnected systems.", "Available software forces too many compromises on the real process.", "Existing data and tools need to be integrated.", "Security, permissions or business rules call for a purpose-built solution."],
      deliverablesTitle: "Common capabilities",
      deliverables: ["Web portals and platforms", "Internal operational tools", "APIs and integrations", "Process automation", "AI-enabled capabilities", "Data and permissions", "Migration, maintenance and evolution"],
      note: "We do not begin by assuming everything needs to be built or that every problem needs AI. We assess integrations, existing tools, data quality and the total cost of each alternative.",
      faq: [
        { q: "Can you integrate software we already use?", a: "Yes. Assessing APIs, data, authentication and the constraints of existing systems is part of technical definition." },
        { q: "Who owns the code?", a: "Ownership and delivery terms are defined clearly in the contract before the project begins." },
        { q: "Do you provide maintenance?", a: "Yes. We can cover evolution, fixes and operational support through a model suited to the criticality of the solution." }
      ]
    }
  },
  uxui: {
    pt: {
      seo: { title: "UX/UI e Design Systems — COBRAIT", description: "Melhoramos fluxos, interfaces e padrões de produto para criar experiências mais claras, consistentes e fáceis de evoluir." },
      hero: { kicker: "UX/UI e Design Systems", title: "Uma boa interface reduz esforço, dúvida e erro.", text: "Trabalhamos experiência e interface em contacto direto com a implementação, para que as decisões de design sejam úteis, viáveis e consistentes." },
      fitTitle: "Quando faz sentido",
      fits: ["Os utilizadores encontram fricção em tarefas importantes.", "O produto cresceu sem padrões visuais consistentes.", "Design e implementação perderam alinhamento.", "A equipa precisa de componentes reutilizáveis para evoluir mais depressa."],
      deliverablesTitle: "O que podemos trabalhar",
      deliverables: ["Pesquisa e análise de fluxos", "Arquitetura de informação", "Wireframes e protótipos", "Interface visual", "Componentes reutilizáveis", "Documentação de padrões", "Implementação frontend"],
      note: "Na COBRAIT, UX/UI é uma competência integrada no desenvolvimento. Para necessidades de investigação ou direção criativa muito especializadas, o âmbito e a equipa são ajustados com transparência.",
      faq: [
        { q: "Trabalham apenas o design?", a: "Podemos trabalhar uma fase de definição e interface, mas o nosso maior valor surge quando design e implementação são pensados em conjunto." },
        { q: "O Design System inclui código?", a: "Pode incluir. Definimos se a entrega é apenas de padrões de design ou também de componentes frontend documentados." },
        { q: "Fazem testes com utilizadores?", a: "Quando são necessários, planeamos o método, participantes e objetivos de validação no âmbito do projeto." }
      ]
    },
    en: {
      seo: { title: "UX/UI and Design Systems — COBRAIT", description: "We improve journeys, interfaces and product patterns to create clearer, more consistent experiences that are easier to evolve." },
      hero: { kicker: "UX/UI and Design Systems", title: "A good interface reduces effort, doubt and error.", text: "We work on experience and interface in direct contact with implementation, keeping design decisions useful, feasible and consistent." },
      fitTitle: "When it is useful",
      fits: ["Users encounter friction in important tasks.", "The product has grown without consistent visual patterns.", "Design and implementation have drifted apart.", "The team needs reusable components to evolve faster."],
      deliverablesTitle: "What we can address",
      deliverables: ["Journey research and analysis", "Information architecture", "Wireframes and prototypes", "Visual interface", "Reusable components", "Pattern documentation", "Frontend implementation"],
      note: "At COBRAIT, UX/UI is integrated with development. For highly specialised research or creative direction, we adjust scope and team composition transparently.",
      faq: [
        { q: "Can you work on design only?", a: "We can run a definition and interface phase, but our strongest contribution comes when design and implementation are considered together." },
        { q: "Does a Design System include code?", a: "It can. We define whether the delivery covers design patterns only or documented frontend components as well." },
        { q: "Do you run user testing?", a: "When needed, we define the method, participants and validation goals within the project scope." }
      ]
    }
  },
  dedicatedTeams: {
    pt: {
      seo: { title: "Equipas dedicadas — COBRAIT", description: "Capacidade de desenvolvimento integrada na equipa do cliente, com comunicação direta e responsabilidade sobre a entrega." },
      hero: { kicker: "Equipas dedicadas", title: "Mais capacidade, sem perder contexto nem responsabilidade.", text: "Integramos developers na direção de produto existente ou assumimos uma frente de trabalho claramente definida, com objetivos e acompanhamento partilhados." },
      fitTitle: "Quando faz sentido",
      fits: ["Existe um roadmap claro, mas falta capacidade de execução.", "Uma frente técnica precisa de responsabilidade dedicada.", "A contratação interna não acompanha o ritmo necessário.", "A equipa precisa de colaboração próxima, não apenas de tarefas isoladas."],
      deliverablesTitle: "Como colaboramos",
      deliverables: ["Objetivos e responsabilidades claros", "Integração nas rotinas relevantes", "Planeamento e demonstrações regulares", "Qualidade e revisão de código", "Documentação e partilha de contexto", "Métricas de progresso adequadas", "Transição estruturada quando necessária"],
      note: "A disponibilidade depende da capacidade real da equipa. Não prometemos perfis ou dimensão de equipa sem confirmar o contexto e o calendário.",
      faq: [
        { q: "É outsourcing de perfis individuais?", a: "Privilegiamos responsabilidade por resultados e frentes de trabalho. O modelo exato depende da maturidade e organização da equipa do cliente." },
        { q: "Podem trabalhar com a nossa stack?", a: "Sim, quando existe experiência adequada ou um caminho responsável para adquirir o contexto necessário." },
        { q: "Qual é a duração mínima?", a: "É definida consoante os objetivos, onboarding necessário e continuidade esperada. Não aplicamos uma duração única a todos os casos." }
      ]
    },
    en: {
      seo: { title: "Dedicated teams — COBRAIT", description: "Development capacity integrated with the client team, with direct communication and accountability for delivery." },
      hero: { kicker: "Dedicated teams", title: "More capacity without losing context or accountability.", text: "We integrate developers into an existing product direction or take ownership of a clearly defined workstream with shared goals and visibility." },
      fitTitle: "When it is useful",
      fits: ["The roadmap is clear but delivery capacity is missing.", "A technical workstream needs dedicated ownership.", "Internal hiring cannot keep pace with the need.", "The team needs close collaboration rather than isolated tasks."],
      deliverablesTitle: "How we collaborate",
      deliverables: ["Clear goals and responsibilities", "Integration with relevant routines", "Regular planning and demos", "Code quality and review", "Documentation and context sharing", "Appropriate progress measures", "Structured transition when needed"],
      note: "Availability depends on our team's real capacity. We do not promise profiles or team size before confirming context and timing.",
      faq: [
        { q: "Is this individual profile outsourcing?", a: "We prioritise ownership of outcomes and workstreams. The exact model depends on the maturity and organisation of the client team." },
        { q: "Can you work with our stack?", a: "Yes, when we have the right experience or a responsible route to acquiring the necessary context." },
        { q: "Is there a minimum duration?", a: "It depends on the goals, onboarding and expected continuity. We do not force one duration on every engagement." }
      ]
    }
  }
};

const standardPages = {
  process: {
    pt: { id: "process", kind: "process", seo: { title: "Processo de produto e desenvolvimento — COBRAIT", description: "Um processo claro para descobrir, definir, desenhar, construir, lançar e evoluir software." }, hero: { kicker: "Processo", title: "O progresso torna-se mais rápido quando as decisões deixam de estar escondidas.", text: "Organizamos o trabalho para reduzir incerteza cedo, mostrar progresso real e manter negócio, produto e tecnologia alinhados." }, principles: ["Decisões antes de entregáveis", "Demonstrações em vez de relatórios", "Qualidade proporcional ao risco", "Responsabilidade e comunicação direta"], collaboration: { title: "O que pedimos ao cliente", text: "Acesso às pessoas que conhecem o problema, disponibilidade para tomar decisões e feedback concreto sobre o que está a ser demonstrado." } },
    en: { id: "process", kind: "process", seo: { title: "Product and development process — COBRAIT", description: "A clear process to discover, define, design, build, launch and evolve software." }, hero: { kicker: "Process", title: "Progress gets faster when decisions stop being hidden.", text: "We organise the work to reduce uncertainty early, show real progress and keep business, product and technology aligned." }, principles: ["Decisions before deliverables", "Demos instead of reports", "Quality proportional to risk", "Accountability and direct communication"], collaboration: { title: "What we need from the client", text: "Access to the people who understand the problem, availability to make decisions and concrete feedback on what is being demonstrated." } }
  },
  engineering: {
    pt: { id: "engineering", kind: "engineering", seo: { title: "Engenharia de software — COBRAIT", description: "Arquitetura, segurança, qualidade, integrações, performance e operações para software sustentável." }, hero: { kicker: "Engenharia", title: "Tecnologia é uma sequência de decisões, não uma lista de logótipos.", text: "Escolhemos ferramentas e arquitetura em função do contexto, do risco, da equipa e do custo de manter o produto ao longo do tempo." }, capabilities: [{ title: "Arquitetura", text: "Estruturas proporcionais à complexidade atual, com espaço realista para evolução." }, { title: "Qualidade", text: "Revisão, testes e automação orientados às áreas onde uma falha tem maior impacto." }, { title: "Segurança", text: "Autenticação, permissões, dados e dependências considerados desde a definição." }, { title: "Integrações", text: "APIs e fluxos de dados desenhados para falhar de forma previsível e recuperável." }, { title: "Operações", text: "Deployment, logs, monitorização e recuperação preparados antes de serem urgentes." }, { title: "Performance", text: "Orçamentos claros e medição em condições próximas da utilização real." }], stackNote: "A stack é uma consequência das necessidades. Podemos trabalhar com tecnologias web modernas, Node.js, bases de dados relacionais, APIs e infraestrutura cloud, sem transformar a ferramenta na proposta de valor." },
    en: { id: "engineering", kind: "engineering", seo: { title: "Software engineering — COBRAIT", description: "Architecture, security, quality, integrations, performance and operations for sustainable software." }, hero: { kicker: "Engineering", title: "Technology is a sequence of decisions, not a wall of logos.", text: "We choose tools and architecture around context, risk, team capability and the long-term cost of maintaining the product." }, capabilities: [{ title: "Architecture", text: "Structures proportional to current complexity, with realistic space for evolution." }, { title: "Quality", text: "Review, testing and automation focused on the areas where failure has the greatest impact." }, { title: "Security", text: "Authentication, permissions, data and dependencies considered from the definition stage." }, { title: "Integrations", text: "APIs and data flows designed to fail predictably and recover safely." }, { title: "Operations", text: "Deployment, logs, monitoring and recovery prepared before they become urgent." }, { title: "Performance", text: "Clear budgets and measurement under conditions close to real use." }], stackNote: "The stack follows the need. We work with modern web technologies, Node.js, relational databases, APIs and cloud infrastructure without turning the tool into the value proposition." }
  },
  about: {
    pt: { id: "about", kind: "about", seo: { title: "Sobre a COBRAIT", description: "Uma empresa portuguesa de software e inteligência artificial focada em produto, engenharia e colaboração direta." }, hero: { kicker: "Sobre a COBRAIT", title: "Proximidade com responsabilidade.", text: "A partir do Porto, trabalhamos em modelo híbrido com startups e empresas estabelecidas que precisam de transformar necessidades relevantes em software utilizável e sustentável." }, story: { title: "Proximidade não significa improviso.", text: "Mantemos as pessoas que pensam o produto próximas das pessoas que o constroem. Um processo claro, documentação útil e responsabilidade visível reduzem ruído ao longo do projeto." }, team: { title: "Modelo híbrido, comunicação direta.", text: "Trabalhamos a partir do Porto e adaptamos a colaboração ao contexto do projeto, combinando proximidade quando é útil com execução remota estruturada." }, principles: [{ title: "Clareza", text: "Dizer o que sabemos, o que ainda não sabemos e o que é necessário decidir." }, { title: "Responsabilidade", text: "Assumir compromissos que podemos cumprir e tornar o progresso verificável." }, { title: "Pragmatismo", text: "Escolher a solução suficiente para o problema, sem complexidade performativa." }, { title: "Continuidade", text: "Construir de forma a permitir manutenção, aprendizagem e mudança." }] },
    en: { id: "about", kind: "about", seo: { title: "About COBRAIT", description: "A Portuguese software and artificial intelligence company focused on product, engineering and direct collaboration." }, hero: { kicker: "About COBRAIT", title: "Proximity with accountability.", text: "From Porto, we work through a hybrid model with startups and established companies that need to turn meaningful needs into usable, sustainable software." }, story: { title: "Proximity does not mean improvisation.", text: "We keep the people thinking about the product close to the people building it. A clear process, useful documentation and visible accountability reduce noise throughout the project." }, team: { title: "Hybrid model, direct communication.", text: "We work from Porto and adapt collaboration to each project, combining proximity where it is useful with structured remote delivery." }, principles: [{ title: "Clarity", text: "Say what we know, what remains uncertain and what needs to be decided." }, { title: "Accountability", text: "Make commitments we can keep and progress that can be verified." }, { title: "Pragmatism", text: "Choose what is sufficient for the problem without performative complexity." }, { title: "Continuity", text: "Build for maintenance, learning and change." }] }
  },
  booking: {
    pt: { id: "booking", kind: "booking", seo: { title: "Falar sobre um projeto — COBRAIT", description: "Conte-nos o contexto do projeto e marque uma primeira conversa com a COBRAIT." }, hero: { kicker: "Primeira conversa", title: "Comecemos pelo contexto, não por uma apresentação comercial.", text: "Responda a algumas perguntas curtas. Guardamos o pedido e, quando o calendário estiver configurado, poderá escolher imediatamente um horário disponível." }, form: { title: "Sobre o projeto", text: "Os campos ajudam-nos a preparar uma conversa útil. Não pedimos um briefing perfeito.", submit: "Continuar para o calendário", successTitle: "Recebemos o contexto do projeto.", successText: "O pedido ficou guardado. A integração de calendário será disponibilizada aqui assim que a conta COBRAIT estiver configurada.", calendarReadyText: "O pedido ficou guardado. Escolha agora uma data e hora disponível no seu fuso horário.", fallback: "Se preferir, escreva para geral@cobrait.pt.", fields: { name: "Nome", email: "Email profissional", company: "Empresa", service: "Tipo de necessidade", stage: "Fase atual", start: "Quando pretende começar?", approved: "Existe investimento aprovado?", message: "O que pretende construir, melhorar ou resolver?", consent: "Li a Política de Privacidade e autorizo o tratamento dos dados para resposta a este pedido.", choose: "Selecionar", options: { service: ["Product Scope", "MVP ou novo produto", "Evolução de produto", "Software à medida", "UX/UI ou Design System", "Reforço de equipa", "Ainda não sei"], stage: ["Ideia ou necessidade identificada", "Âmbito em definição", "Produto em desenvolvimento", "Produto em produção", "Sistema existente a substituir"], start: ["Assim que possível", "Nas próximas 4–8 semanas", "Nos próximos 3–6 meses", "Ainda sem data"], approved: ["Sim", "Em definição", "Preciso de orientação"] } }, errors: { required: "Preencha os campos obrigatórios.", submit: "Não foi possível enviar. Tente novamente ou contacte geral@cobrait.pt." } } },
    en: { id: "booking", kind: "booking", seo: { title: "Discuss a project — COBRAIT", description: "Tell us about your project and schedule an initial conversation with COBRAIT." }, hero: { kicker: "Initial conversation", title: "Let us start with context, not a sales presentation.", text: "Answer a few short questions. We save the request and, once the calendar is configured, you will be able to choose an available time immediately." }, form: { title: "About the project", text: "These fields help us prepare a useful conversation. We do not expect a perfect brief.", submit: "Continue to the calendar", successTitle: "We have received your project context.", successText: "The request has been saved. Calendar scheduling will appear here as soon as the COBRAIT account is configured.", calendarReadyText: "The request has been saved. Choose an available date and time in your own time zone.", fallback: "If you prefer, email geral@cobrait.pt.", fields: { name: "Name", email: "Work email", company: "Company", service: "Type of need", stage: "Current stage", start: "When would you like to start?", approved: "Is investment approved?", message: "What are you looking to build, improve or solve?", consent: "I have read the Privacy Policy and consent to my data being used to respond to this request.", choose: "Select", options: { service: ["Product Scope", "MVP or new product", "Product evolution", "Custom software", "UX/UI or Design System", "Team extension", "Not sure yet"], stage: ["Opportunity or need identified", "Scope being defined", "Product in development", "Product in production", "Existing system to replace"], start: ["As soon as possible", "Within 4–8 weeks", "Within 3–6 months", "No date yet"], approved: ["Yes", "Being defined", "I need guidance"] } }, errors: { required: "Please complete the required fields.", submit: "We could not send the request. Try again or contact geral@cobrait.pt." } } }
  }
};

const legal = {
  privacy: {
    pt: { id: "privacy", kind: "legal", seo: { title: "Política de Privacidade — COBRAIT", description: "Como a COBRAIT recolhe, utiliza e protege dados pessoais enviados através do website." }, hero: { kicker: "Legal", title: "Política de Privacidade", text: "Esta política explica como tratamos dados pessoais quando utiliza o website e os nossos canais de contacto.", updated: "Última atualização: 6 de agosto de 2026" }, sections: [{ title: "Responsável pelo tratamento", body: ["A Vírgula Prodigiosa, que opera comercialmente como COBRAIT, com sede na Rua Engenheiro Ferreira Dias, 161, 4100-247 Porto, Portugal, é responsável pelo tratamento dos dados pessoais recolhidos através deste website. Para questões de privacidade, contacte geral@cobrait.pt."] }, { title: "Dados recolhidos", body: ["Podemos recolher nome, email, telefone, empresa, contexto do projeto e informação enviada voluntariamente. Também podem ser tratados dados técnicos necessários à segurança e funcionamento do serviço."] }, { title: "Finalidades e base legal", body: ["Tratamos dados para responder a pedidos, preparar propostas, gerir agendamentos, cumprir obrigações legais e proteger o website. As bases aplicáveis podem incluir consentimento, diligências pré-contratuais, execução contratual e interesse legítimo."] }, { title: "Fornecedores e transferências", body: ["Os dados podem ser tratados por fornecedores necessários ao alojamento, email, CRM, agenda e operação técnica, sujeitos a obrigações de proteção de dados. Não vendemos dados pessoais nem partilhamos leads com entidades externas para fins próprios."] }, { title: "Conservação", body: ["Pedidos de contacto e agendamentos sem relação contratual são conservados, por regra, até 24 meses após a última interação. Dados associados a clientes, contratos ou obrigações legais podem ser conservados durante os prazos legalmente aplicáveis. O prazo deve ser revisto quando a política interna de retenção for formalizada."] }, { title: "Os seus direitos", body: ["Pode pedir acesso, retificação, apagamento, limitação, oposição ou portabilidade, quando aplicável, através de geral@cobrait.pt. Pode ainda apresentar reclamação à autoridade de controlo competente."] }, { title: "Segurança e alterações", body: ["Aplicamos medidas técnicas e organizativas adequadas ao risco. Esta política pode ser atualizada para refletir alterações legais, técnicas ou operacionais."] }] },
    en: { id: "privacy", kind: "legal", seo: { title: "Privacy Policy — COBRAIT", description: "How COBRAIT collects, uses and protects personal data submitted through the website." }, hero: { kicker: "Legal", title: "Privacy Policy", text: "This policy explains how we process personal data when you use the website and our contact channels.", updated: "Last updated: 6 August 2026" }, sections: [{ title: "Data controller", body: ["Vírgula Prodigiosa, trading as COBRAIT, with its registered office at Rua Engenheiro Ferreira Dias, 161, 4100-247 Porto, Portugal, is responsible for personal data collected through this website. For privacy enquiries, contact geral@cobrait.pt."] }, { title: "Data we collect", body: ["We may collect your name, email, telephone number, company, project context and information you provide voluntarily. Technical data required for security and service operation may also be processed."] }, { title: "Purposes and lawful basis", body: ["We process data to respond to enquiries, prepare proposals, manage bookings, meet legal obligations and protect the website. Applicable bases may include consent, pre-contractual steps, contract performance and legitimate interests."] }, { title: "Providers and transfers", body: ["Data may be processed by providers required for hosting, email, CRM, scheduling and technical operations, subject to data protection obligations. We do not sell personal data or share leads with external entities for their own purposes."] }, { title: "Retention", body: ["Contact requests and bookings that do not lead to a contractual relationship are generally retained for up to 24 months after the last interaction. Data connected with clients, contracts or legal obligations may be retained for the applicable statutory periods. This period should be reviewed when an internal retention policy is formalised."] }, { title: "Your rights", body: ["You may request access, correction, deletion, restriction, objection or portability where applicable by emailing geral@cobrait.pt. You may also complain to the competent supervisory authority."] }, { title: "Security and changes", body: ["We apply technical and organisational measures appropriate to the risk. This policy may be updated to reflect legal, technical or operational changes."] }] }
  },
  cookies: {
    pt: { id: "cookies", kind: "legal", seo: { title: "Política de Cookies — COBRAIT", description: "Informação sobre cookies essenciais, preferências e serviços externos utilizados no website COBRAIT." }, hero: { kicker: "Legal", title: "Política de Cookies", text: "Explicamos que armazenamento utilizamos, para que serve e como pode gerir as suas escolhas.", updated: "Última atualização: 5 de agosto de 2026" }, sections: [{ title: "O que são cookies", body: ["Cookies e tecnologias semelhantes são pequenos registos guardados no dispositivo para permitir funcionalidades, memorizar preferências ou medir utilização."] }, { title: "Armazenamento essencial", body: ["Podemos usar armazenamento estritamente necessário para segurança, sessão administrativa e preferência de idioma. Estas funções não são usadas para publicidade comportamental."] }, { title: "Serviços externos", body: ["O calendário externo apenas será carregado depois da interação do utilizador. A ativação de analytics ou outras ferramentas não essenciais dependerá da configuração e consentimento aplicáveis."] }, { title: "Gestão", body: ["Pode gerir ou eliminar cookies através do browser. Bloquear armazenamento essencial pode impedir algumas funcionalidades de operar corretamente."] }, { title: "Alterações e contacto", body: ["Atualizaremos esta página quando os fornecedores ou finalidades mudarem. Para dúvidas, contacte geral@cobrait.pt."] }] },
    en: { id: "cookies", kind: "legal", seo: { title: "Cookie Policy — COBRAIT", description: "Information about essential cookies, preferences and external services used on the COBRAIT website." }, hero: { kicker: "Legal", title: "Cookie Policy", text: "We explain what storage we use, why it is needed and how you can manage your choices.", updated: "Last updated: 5 August 2026" }, sections: [{ title: "What cookies are", body: ["Cookies and similar technologies are small records stored on a device to enable functionality, remember preferences or measure use."] }, { title: "Essential storage", body: ["We may use storage strictly required for security, administrative sessions and language preference. These functions are not used for behavioural advertising."] }, { title: "External services", body: ["The external calendar will only load after user interaction. Analytics or other non-essential tools will only be enabled according to the applicable configuration and consent."] }, { title: "Managing cookies", body: ["You can manage or delete cookies through your browser. Blocking essential storage may prevent some functions from operating correctly."] }, { title: "Changes and contact", body: ["We will update this page when providers or purposes change. For questions, contact geral@cobrait.pt."] }] }
  },
  terms: {
    pt: { id: "terms", kind: "legal", seo: { title: "Termos e Condições — COBRAIT", description: "Condições de utilização do website COBRAIT e dos respetivos formulários de contacto." }, hero: { kicker: "Legal", title: "Termos e Condições", text: "Estas condições regulam a utilização do website e o contacto comercial inicial realizado através dos formulários.", updated: "Última atualização: 5 de agosto de 2026" }, sections: [{ title: "Objeto", body: ["Estes termos regulam o acesso e utilização do website COBRAIT. A informação publicada não constitui, por si só, uma proposta contratual vinculativa."] }, { title: "Utilização responsável", body: ["O utilizador deve utilizar o website de forma lícita. É proibido tentar aceder a áreas restritas, introduzir código malicioso ou comprometer a segurança e disponibilidade do serviço."] }, { title: "Propriedade intelectual", body: ["Marca, design, código, texto e restantes conteúdos estão protegidos nos termos legais aplicáveis. A reprodução sem autorização é proibida, salvo quando permitida por lei."] }, { title: "Disponibilidade e responsabilidade", body: ["Procuramos manter o conteúdo correto e o serviço disponível, mas não garantimos ausência total de erros, interrupções ou indisponibilidade temporária."] }, { title: "Ligações externas", body: ["Podem existir ligações para serviços de terceiros. A COBRAIT não controla o conteúdo ou práticas desses serviços."] }, { title: "Lei aplicável e contacto", body: ["Estes termos são regidos pela legislação portuguesa, sem prejuízo de normas imperativas aplicáveis. Para questões, contacte geral@cobrait.pt."] }] },
    en: { id: "terms", kind: "legal", seo: { title: "Terms and Conditions — COBRAIT", description: "Terms governing use of the COBRAIT website and its contact forms." }, hero: { kicker: "Legal", title: "Terms and Conditions", text: "These terms govern use of the website and initial commercial contact through its forms.", updated: "Last updated: 5 August 2026" }, sections: [{ title: "Purpose", body: ["These terms govern access to and use of the COBRAIT website. Published information does not in itself constitute a binding contractual offer."] }, { title: "Responsible use", body: ["Users must use the website lawfully. Attempts to access restricted areas, introduce malicious code or compromise service security and availability are prohibited."] }, { title: "Intellectual property", body: ["The brand, design, code, text and other content are protected under applicable law. Reproduction without permission is prohibited unless allowed by law."] }, { title: "Availability and liability", body: ["We work to keep content accurate and the service available but cannot guarantee complete absence of errors, interruptions or temporary unavailability."] }, { title: "External links", body: ["The website may link to third-party services. COBRAIT does not control the content or practices of those services."] }, { title: "Governing law and contact", body: ["These terms are governed by Portuguese law, without prejudice to applicable mandatory rules. For questions, contact geral@cobrait.pt."] }] }
  }
};

legal.cookies.pt.hero.updated = "Última atualização: 6 de agosto de 2026";
legal.cookies.en.hero.updated = "Last updated: 6 August 2026";
legal.terms.pt.hero.updated = "Última atualização: 6 de agosto de 2026";
legal.terms.en.hero.updated = "Last updated: 6 August 2026";
standardPages.booking.pt.form.fields.options.service[3] = "Software à medida ou IA";
standardPages.booking.en.form.fields.options.service[3] = "Custom software or AI";
legal.privacy.pt.sections[0].body[0] = "A Vírgula Prodigiosa, NIF 518841057, que opera comercialmente como COBRAIT, com sede na Rua Engenheiro Ferreira Dias, 161, 4100-247 Porto, Portugal, é responsável pelo tratamento dos dados pessoais recolhidos através deste website. Para questões de privacidade, contacte geral@cobrait.pt.";
legal.privacy.en.sections[0].body[0] = "Vírgula Prodigiosa, Portuguese tax number 518841057, trading as COBRAIT, with its registered office at Rua Engenheiro Ferreira Dias, 161, 4100-247 Porto, Portugal, is responsible for personal data collected through this website. For privacy enquiries, contact geral@cobrait.pt.";
legal.privacy.pt.sections[3].body[0] = "Os dados podem ser tratados por fornecedores necessários ao alojamento, email, Zoho CRM, agenda e operação técnica, na qualidade de prestadores sujeitos a obrigações de proteção de dados. Não vendemos dados pessoais nem partilhamos leads com entidades externas para fins próprios.";
legal.privacy.en.sections[3].body[0] = "Data may be processed by providers required for hosting, email, Zoho CRM, scheduling and technical operations, acting as service providers subject to data protection obligations. We do not sell personal data or share leads with external entities for their own purposes.";
legal.terms.pt.sections[0].body[0] = "Estes termos regulam o acesso e utilização do website COBRAIT, operado pela Vírgula Prodigiosa, NIF 518841057, com sede na Rua Engenheiro Ferreira Dias, 161, 4100-247 Porto, Portugal. A informação publicada não constitui, por si só, uma proposta contratual vinculativa.";
legal.terms.en.sections[0].body[0] = "These terms govern access to and use of the COBRAIT website, operated by Vírgula Prodigiosa, Portuguese tax number 518841057, with its registered office at Rua Engenheiro Ferreira Dias, 161, 4100-247 Porto, Portugal. Published information does not in itself constitute a binding contractual offer.";

function buildServicePage(locale, id) {
  return {
    id,
    kind: "service",
    ...serviceDetails[id][locale],
    service: serviceById(locale, id)
  };
}

function getPage(locale, id) {
  if (id === "home") return { ...home[locale], capabilities: services[locale], workflow: processSteps[locale] };
  if (id === "services") return { ...servicesIndex[locale], services: services[locale] };
  if (id === "process") return { ...standardPages[id][locale], steps: processSteps[locale] };
  if (serviceDetails[id]) return buildServicePage(locale, id);
  if (standardPages[id]) return standardPages[id][locale];
  if (legal[id]) return legal[id][locale];
  return null;
}

module.exports = {
  getPage,
  home,
  legal,
  serviceDetails,
  servicesIndex,
  standardPages
};
