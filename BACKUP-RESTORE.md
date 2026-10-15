# Backups e recuperação

## O que deve ser salvaguardado

Em produção, o backup só está completo quando inclui os quatro elementos seguintes:

1. base de dados MySQL (conteúdos, utilizadores, pedidos, agendamentos, versões e atividade);
2. pasta `assets/uploads/` (imagens adicionadas no painel);
3. código da aplicação, preferencialmente através do repositório Git;
4. variáveis de ambiente do cPanel, guardadas num gestor de palavras-passe e nunca no repositório.

## Frequência recomendada

- Base de dados: backup diário, retenção de 30 dias.
- Imagens: backup diário incremental, retenção de 30 dias.
- Snapshot completo da conta cPanel: semanal, retenção de 8 semanas.
- Cópia mensal: retenção de 12 meses, se o volume e obrigações legais o justificarem.

Os pedidos comerciais e agendamentos devem ser revistos e eliminados ao fim de 24 meses quando já não forem necessários, salvo obrigação legal ou relação comercial ativa.

## Teste de restauro

Trimestralmente, restaurar a cópia mais recente num subdomínio não público e confirmar:

- login no painel;
- conteúdos PT e EN;
- biblioteca de imagens;
- pedidos e agendamentos;
- histórico de versões;
- submissão de um formulário de teste.

## Antes de um deploy

1. Exportar a base de dados no phpMyAdmin.
2. Criar uma cópia de `assets/uploads/`.
3. Registar a versão/commit que está em produção.
4. Aplicar o deploy e reiniciar a aplicação Node.js.
5. Executar as verificações de `CPANEL-DEPLOY.md`.

## Recuperação

Em caso de falha, restaurar primeiro a versão de código conhecida, depois a base de dados e por fim `assets/uploads/`. Confirmar que as variáveis de ambiente continuam corretas, sobretudo `JWT_SECRET`, SMTP, Zoho, Cal.com e ligação MySQL.
