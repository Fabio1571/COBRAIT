const locales = ["pt", "en"];

const paths = {
  pt: {
    home: "/pt/",
    services: "/pt/servicos/",
    productScope: "/pt/servicos/product-scope/",
    mvp: "/pt/servicos/mvp-e-produtos-digitais/",
    customSoftware: "/pt/servicos/software-a-medida/",
    uxui: "/pt/servicos/ux-ui-e-design-systems/",
    dedicatedTeams: "/pt/servicos/equipas-dedicadas/",
    process: "/pt/processo/",
    engineering: "/pt/engenharia/",
    about: "/pt/sobre/",
    booking: "/pt/agendar/",
    privacy: "/pt/privacidade/",
    cookies: "/pt/cookies/",
    terms: "/pt/termos/"
  },
  en: {
    home: "/en/",
    services: "/en/services/",
    productScope: "/en/services/product-scope/",
    mvp: "/en/services/mvp-and-product-development/",
    customSoftware: "/en/services/custom-software/",
    uxui: "/en/services/ux-ui-and-design-systems/",
    dedicatedTeams: "/en/services/dedicated-teams/",
    process: "/en/process/",
    engineering: "/en/engineering/",
    about: "/en/about/",
    booking: "/en/book-a-call/",
    privacy: "/en/privacy/",
    cookies: "/en/cookies/",
    terms: "/en/terms/"
  }
};

const shared = {
  pt: {
    localeName: "Português",
    skipLink: "Saltar para o conteúdo",
    nav: {
      services: "Serviços",
      process: "Processo",
      engineering: "Engenharia",
      about: "Sobre",
      booking: "Falar sobre um projeto",
      menu: "Abrir menu",
      close: "Fechar menu",
      language: "Idioma"
    },
    footer: {
      statement: "Software pensado com clareza e construído com responsabilidade.",
      contact: "Contacto",
      explore: "Explorar",
      legal: "Legal",
      privacy: "Privacidade",
      cookies: "Cookies",
      terms: "Termos",
      rights: "Todos os direitos reservados.",
      location: "Porto, Portugal"
    },
    common: {
      eyebrow: "COBRAIT · Software company",
      talk: "Falar sobre o projeto",
      learnMore: "Saber mais",
      viewServices: "Ver serviços",
      response: "O pedido fica guardado antes do agendamento",
      finalCtaTitle: "Tem um projeto, um produto por evoluir ou um processo que precisa de software?",
      finalCtaText: "Conte-nos o contexto. A nossa equipa comercial analisa o pedido e prepara uma primeira conversa orientada ao seu projeto.",
      backHome: "Voltar à página inicial"
    }
  },
  en: {
    localeName: "English",
    skipLink: "Skip to content",
    nav: {
      services: "Services",
      process: "Process",
      engineering: "Engineering",
      about: "About",
      booking: "Discuss a project",
      menu: "Open menu",
      close: "Close menu",
      language: "Language"
    },
    footer: {
      statement: "Software shaped with clarity and built with accountability.",
      contact: "Contact",
      explore: "Explore",
      legal: "Legal",
      privacy: "Privacy",
      cookies: "Cookies",
      terms: "Terms",
      rights: "All rights reserved.",
      location: "Porto, Portugal"
    },
    common: {
      eyebrow: "COBRAIT · Software company",
      talk: "Discuss your project",
      learnMore: "Learn more",
      viewServices: "View services",
      response: "Your context is saved before scheduling",
      finalCtaTitle: "Have a project to launch, a product to improve or a process that needs better software?",
      finalCtaText: "Tell us about the context. Our commercial team reviews the request and prepares an initial conversation around your project.",
      backHome: "Back to the homepage"
    }
  }
};

const services = {
  pt: [
    {
      id: "productScope",
      number: "01",
      title: "Product Scope",
      summary: "Transformamos uma ideia ou necessidade num plano de produto claro, estimável e tecnicamente viável.",
      short: "Clarificar antes de construir.",
      situation: "Quando a oportunidade é real, mas o âmbito, as prioridades ou a abordagem ainda não estão suficientemente definidos.",
      outcome: "Requisitos priorizados, fluxos essenciais, direção técnica, estimativa e plano de execução.",
      href: paths.pt.productScope
    },
    {
      id: "mvp",
      number: "02",
      title: "MVP e produtos digitais",
      summary: "Construímos a primeira versão útil do produto, preparada para chegar aos utilizadores e evoluir com evidência real.",
      short: "Lançar a versão certa, sem perder o futuro.",
      situation: "Quando existe uma proposta validada e é preciso chegar ao mercado com foco, qualidade e velocidade.",
      outcome: "Um produto utilizável em produção, instrumentado para aprender e preparado para evoluir.",
      href: paths.pt.mvp
    },
    {
      id: "customSoftware",
      number: "03",
      title: "Software à medida",
      summary: "Desenvolvemos plataformas, aplicações e soluções com inteligência artificial ajustadas aos processos e objetivos do negócio.",
      short: "Software alinhado com a operação real.",
      situation: "Quando as ferramentas disponíveis não acompanham o processo, as integrações ou a ambição do negócio.",
      outcome: "Uma solução segura, sustentável e integrada com os sistemas existentes, incluindo IA quando cria valor concreto.",
      href: paths.pt.customSoftware
    },
    {
      id: "uxui",
      number: "04",
      title: "UX/UI e Design Systems",
      summary: "Integramos experiência, interface e consistência visual no processo de desenvolvimento do produto.",
      short: "Produtos claros, consistentes e utilizáveis.",
      situation: "Quando a experiência acumulou fricção, o produto perdeu coerência ou a equipa precisa de padrões reutilizáveis.",
      outcome: "Fluxos mais claros, interface consistente e uma base que acelera a evolução do produto.",
      href: paths.pt.uxui
    },
    {
      id: "dedicatedTeams",
      number: "05",
      title: "Equipas dedicadas",
      summary: "Reforçamos equipas existentes com capacidade técnica, comunicação direta e responsabilidade sobre a entrega.",
      short: "Capacidade adicional sem perder contexto.",
      situation: "Quando existe direção de produto, mas falta capacidade para executar com o ritmo ou competências necessárias.",
      outcome: "Uma colaboração integrada, objetivos partilhados e entrega acompanhada de perto.",
      href: paths.pt.dedicatedTeams
    }
  ],
  en: [
    {
      id: "productScope",
      number: "01",
      title: "Product Scope",
      summary: "We turn an opportunity or business need into a clear, estimable and technically viable product plan.",
      short: "Build clarity before building software.",
      situation: "When the opportunity is real but scope, priorities or the right approach are not yet clear enough.",
      outcome: "Prioritised requirements, essential journeys, technical direction, estimates and an execution plan.",
      href: paths.en.productScope
    },
    {
      id: "mvp",
      number: "02",
      title: "MVP and product development",
      summary: "We build the first useful version of a product, ready for users and structured to evolve through real evidence.",
      short: "Launch the right first version without limiting what comes next.",
      situation: "When the proposition is validated and the team needs to reach the market with focus, quality and speed.",
      outcome: "A usable production product, instrumented for learning and ready to evolve.",
      href: paths.en.mvp
    },
    {
      id: "customSoftware",
      number: "03",
      title: "Custom software",
      summary: "We develop platforms, applications and AI-enabled solutions shaped around real business processes and goals.",
      short: "Software that fits the operation rather than fighting it.",
      situation: "When off-the-shelf tools cannot support the process, integrations or ambition of the business.",
      outcome: "A secure, sustainable solution integrated with existing systems, including AI where it creates concrete value.",
      href: paths.en.customSoftware
    },
    {
      id: "uxui",
      number: "04",
      title: "UX/UI and Design Systems",
      summary: "We bring experience, interface and visual consistency into the product development process.",
      short: "Clear, coherent and usable products.",
      situation: "When the experience has accumulated friction, the product lacks consistency or the team needs reusable patterns.",
      outcome: "Clearer journeys, a consistent interface and foundations that make product evolution faster.",
      href: paths.en.uxui
    },
    {
      id: "dedicatedTeams",
      number: "05",
      title: "Dedicated teams",
      summary: "We extend existing teams with technical capacity, direct communication and accountability for delivery.",
      short: "Additional capacity without losing context.",
      situation: "When product direction exists but delivery capacity or specific technical experience is missing.",
      outcome: "An integrated collaboration, shared goals and closely managed delivery.",
      href: paths.en.dedicatedTeams
    }
  ]
};

const processSteps = {
  pt: [
    { number: "01", title: "Descobrir", text: "Percebemos o negócio, os utilizadores, as restrições e a decisão que o software precisa de suportar." },
    { number: "02", title: "Definir", text: "Priorizamos o âmbito, reduzimos incerteza e alinhamos entregáveis, responsabilidades e critérios de sucesso." },
    { number: "03", title: "Desenhar", text: "Estruturamos fluxos, interface e arquitetura técnica antes de aumentar o custo das decisões." },
    { number: "04", title: "Construir", text: "Desenvolvemos em ciclos curtos, com demonstrações regulares, revisão de código e testes proporcionais ao risco." },
    { number: "05", title: "Lançar", text: "Preparamos dados, infraestrutura, observabilidade e suporte para uma entrada em produção controlada." },
    { number: "06", title: "Evoluir", text: "Usamos feedback e evidência para melhorar o produto sem comprometer a sua base técnica." }
  ],
  en: [
    { number: "01", title: "Discover", text: "We understand the business, users, constraints and the decision the software needs to support." },
    { number: "02", title: "Define", text: "We prioritise scope, reduce uncertainty and align deliverables, responsibilities and success criteria." },
    { number: "03", title: "Design", text: "We shape journeys, interface and technical architecture before decisions become expensive." },
    { number: "04", title: "Build", text: "We develop in short cycles with regular demos, code review and testing proportional to risk." },
    { number: "05", title: "Launch", text: "We prepare data, infrastructure, observability and support for a controlled production release." },
    { number: "06", title: "Evolve", text: "We use feedback and evidence to improve the product without compromising its technical foundations." }
  ]
};

function serviceById(locale, id) {
  return services[locale].find((service) => service.id === id);
}

module.exports = {
  locales,
  paths,
  shared,
  services,
  processSteps,
  serviceById
};
