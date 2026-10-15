# Editar conteúdo no cPanel

O website público é renderizado pelo Node.js/Express e já não depende de ficheiros HTML separados para desktop, mobile ou idioma.

## Método recomendado

1. Abrir `https://teu-dominio.pt/admin.html`.
2. Iniciar sessão com um utilizador Editor ou Administrador.
3. Abrir `Páginas` e escolher a página e o idioma.
4. Escolher a página PT ou EN pretendida.
5. Editar apenas os campos apresentados e guardar.
6. Usar `Ver no site` para confirmar o resultado.

Cada idioma tem conteúdo e URL próprios. Alterar a página portuguesa não altera automaticamente a versão inglesa.

## Page Builder

O editor de novas páginas utiliza secções controladas — cabeçalho, texto, destaques, FAQ, imagem e CTA — para manter consistência com o website principal. Permite:

- reordenar secções por arrastar ou com os botões Subir/Descer;
- duplicar e ocultar secções sem apagar conteúdo;
- escolher imagens carregadas na biblioteca;
- pré-visualizar desktop, tablet e mobile antes de publicar;
- recuperar uma cópia automática não publicada guardada no mesmo navegador.

Cada página criada deve indicar explicitamente `Português` ou `English`. Para páginas principais ou alterações estruturais, deve ser usado o sistema de templates no repositório, não HTML inserido manualmente.

## Definições, histórico e acessos

- `Definições` gere contactos, dados legais, menu, CTA, rodapé, imagem social e a futura URL Cal.com.
- `Atividade` mostra ações administrativas aos administradores.
- Cada página principal mantém histórico, autor e comparação antes de restaurar.
- `O meu perfil` permite a cada utilizador alterar a própria palavra-passe. Com SMTP ativo, o login também envia ligações de recuperação válidas durante 30 minutos.
- `Acessos` permite ao administrador criar editores e contas apenas de consulta.
- `Ferramentas` mostra o estado de SMTP, Zoho, Cal.com e armazenamento sem expor segredos.

## Depois de uma alteração técnica

Se forem enviados novos ficheiros ou alteradas dependências:

1. Executar `Run NPM Install`, quando necessário.
2. Reiniciar a aplicação Node.js.
3. Confirmar `/api/health`.
4. Verificar pelo menos `/pt/`, `/en/`, o formulário e o painel administrativo.
