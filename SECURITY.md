**Gerenciamento de Secrets**

- **Não** commit: nunca adicione arquivos de configuração com credenciais reais ao repositório.
- **Arquivo de exemplo**: use `/.env.example` como template contendo placeholders.
- **Gere segredos fortes**: use `openssl rand -hex 48` ou `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- **Gerar `.env` localmente**: execute `node scripts/generate-env.js` para criar um `.env` local com um `JWT_SECRET` forte.
- **Produção**: use um gerenciador de secrets (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, etc.) — não dependa de arquivos `.env` em produção.
- **Rotação**: estabeleça políticas para rotacionar `JWT_SECRET` e credenciais de DB.
- **Permissões**: limite acesso a secrets apenas ao mínimo necessário.

Se quiser, eu posso também adicionar instruções específicas para o provedor de cloud que você usa.
