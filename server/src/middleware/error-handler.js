function notFound(request, response) {
  if (!request.path.startsWith("/api") && request.accepts("html")) {
    const locale = request.path.startsWith("/en/") || request.cookies.cobrait_locale === "en" ? "en" : "pt";
    response.status(404).render("pages/not-found.njk", {
      home: locale === "en" ? "/en/" : "/pt/",
      locale,
      year: new Date().getFullYear()
    });
    return;
  }
  response.status(404).json({
    message: "Endpoint nao encontrado."
  });
}

function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const status = error && error.status ? error.status : 500;

  if (status >= 500) {
    console.error(error);
  }

  const payload = {
    message: status >= 500 ? "Erro interno do servidor." : error.message
  };

  if (status < 500 && error && error.details) {
    payload.details = error.details;
  }

  response.status(status).json(payload);
}

module.exports = {
  errorHandler,
  notFound
};
