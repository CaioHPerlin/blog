---
title: "Instalando e Configurando Gitea com Traefik via Docker (+ Certificado TLS/HTTPS)"
publishedAt: 2025-12-09
tags:
  - "docker"
  - "traefik"
  - "gitea"
  - "devops"
  - "https"
  - "self-hosted"
  - "proxy-reverso"
---

## Guia Pragmático: Gitea atrás do Traefik com HTTPS (Docker Compose)

Este é um guia objetivo para colocar o Gitea rodando atrás do Traefik, com TLS automático (Let's Encrypt), usando Docker Compose. O domínio de exemplo usado aqui é `caioperlin.dev`; substitua pelo seu domínio.

## **Índice**

- [Introdução ao Serviço](#introdução-ao-servico)
- [Visão Geral](#visão-geral)
- [Arquitetura e Componentes](#arquitetura-e-componentes)
- [Casos de Uso](#casos-de-uso)
- [Pré-requisitos](#pré-requisitos)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Configuração do Traefik](#configuração-do-traefik)
- [Docker Compose do Traefik](#docker-compose-do-traefik)
- [Docker Compose do Gitea](#docker-compose-do-gitea)
- [Criando o usuário `git` e permissões](#criando-o-usuario-git-e-permissoes)
- [Configuração do Firewall (UFW)](#configuração-do-firewall-ufw)
- [Criando o acme.json para Certificados HTTPS](#criando-o-acmejson-para-certificados-https)
- [Inicialização e Validação](#inicialização-e-validação)
- [Resolução de Problemas](#resolução-de-problemas)
- [Comandos Úteis](#comandos-úteis)

## **Introdução ao Serviço**

Este documento descreve um serviço composto por Traefik (proxy reverso + TLS) e Gitea (servidor Git autohospedado) empacotados via Docker Compose. O objetivo é oferecer um repositório Git privado/auto-hospedado com acesso HTTP(S) gerenciado automaticamente por certificados Let's Encrypt, além de uma opção de acesso via SSH.

Público-alvo: administradores de servidores, desenvolvedores que querem hospedar seus próprios repositórios e times pequenos que precisam de controle total sobre seus dados.

## **Arquitetura e Componentes**

Resumo da arquitetura (componentes principais):

- Traefik: proxy reverso responsável por expor serviços via HTTP/HTTPS, resolver certificados (ACME) e rotear para backends via labels do Docker.
- Gitea: aplicação web que fornece repositórios Git, UI de gerenciamento, autenticação e opcional serviço SSH para push/pull.
- Docker Engine / Docker Compose: orquestra os containers e monta volumes persistentes.
- Rede Docker `traefik`: rede overlay (local) que conecta Traefik com serviços que devem ser roteados.
- Volumes/Paths persistentes: diretórios no host mapeados para `/data` do Gitea e para `acme.json` do Traefik.

Fluxo de requisições (simplificado):

Client -> (80/443) -> Traefik -> Gitea (porta 3000 HTTP interna)

Pequeno diagrama ASCII:

```
Internet
   |
  80/443
   |
 [Traefik]
   | (docker network: traefik)
   |-> [Gitea:3000]
   |-> (opcional) [Gitea SSH:22 -> host 2222]
```

Importante:

- Traefik faz apenas TLS/terminação e roteamento — a aplicação (Gitea) continua responsável por autenticação, permissões e armazenamento.
- O arquivo `acme.json` armazena os certificados TLS e precisa de proteção (permissões restritas).

Casos de falha comuns na arquitetura:

- Falha DNS apontando para IP errado -> ACME falha.
- Firewall bloqueando 80/443 -> ACME falha.
- Container Gitea não conectado à rede `traefik` -> 504 Gateway.

## **Casos de Uso**

- Time pequeno/empresa que quer hospedar código sem depender de serviços externos (GitHub/GitLab).
- Pessoal que precisa de repositórios privados mas com controle total de backup e acesso.
- Integração com pipelines CI que fazem push para repositórios internos.
- Ambientes de teste onde repositórios são criados automaticamente (ex.: laboratórios de ensino).

Cada caso de uso exige políticas extras (backups regulares, autenticação forte, monitoramento e auditoria de logs).

## **Pré-requisitos**

- Sistema: servidor Linux (Ubuntu 22.04 recomendado, uma vez que os passos abaixo foram feitos numa VPS com essa versão).
- Um domínio apontando para o IP do servidor ('A' record).
- Portas: 80/tcp e 443/tcp abertas (8080 opcional para dashboard).
- Docker + Docker Compose instalados (instruções abaixo).

Instalação básica (Ubuntu/Debian):

```bash
# Atualiza pacotes
sudo apt update && sudo apt upgrade -y

# Instala pré-requisitos para adicionar repositórios HTTPS
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adiciona chave e repositório oficial do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Habilita e inicia o docker
sudo systemctl enable --now docker

# Confirme versão
docker --version
docker compose version
```

Observações:

- No Debian/Ubuntu modernos `docker compose` via plugin é suficiente. Você também pode usar o `docker-compose` v1 se preferir.
- Se estiver em outra distro, use o instalador oficial do Docker.

## **Estrutura de Diretórios**

Organize da seguinte forma:

```text
~/traefik/
  config/
    traefik.yml
    acme.json        # (crie manualmente, ver abaixo)
  compose.yml
~/gitea/
  compose.yml
  gitea/             # (diretório de dados persistente do Gitea)
```

## **Configuração do Traefik**

Crie `~/traefik/config/traefik.yml`:

```yaml
global:
  sendAnonymousUsage: false
log:
  level: DEBUG
api:
  dashboard: true
  insecure: true
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"
certificatesResolvers:
  http:
    acme:
      email: "seu@email.com"
      storage: "acme.json"
      httpChallenge:
        entrypoint: web
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
```

Comentários importantes neste arquivo:

- `insecure: true` habilita o dashboard sem autenticação; use apenas temporariamente para debug.
- `certificatesResolvers.http` usa o desafio HTTP para obter certificados; se quiser usar DNS, troque para `dnsChallenge`.
- `exposedByDefault: false` evita que todos containers sejam automaticamente expostos; preferível por segurança.

## **Docker Compose do Traefik**

Salve como `~/traefik/compose.yml`:

```yaml
services:
  traefik:
    image: traefik:latest
    container_name: traefik
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./config/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./config/acme.json:/etc/traefik/acme.json
    networks:
      - traefik
    restart: unless-stopped
networks:
  traefik:
    external: true
```

Notas e comentários no compose:

- O `docker.sock` é necessário para o provider Docker; monta em modo `ro` por segurança.
- `acme.json` precisa existir e ter permissão `600` (veja seção abaixo).
- A rede `traefik` é externa: crie-a com `docker network create traefik`.

## **Docker Compose do Gitea**

Salve como `~/gitea/compose.yml`:

```yaml
services:
  server:
    image: docker.gitea.com/gitea:latest
    container_name: gitea
    environment:
      - USER_UID=${USER_UID}
      - USER_GID=${USER_GID}
    restart: always
    networks:
      - gitea
      - traefik
    volumes:
      - ./gitea:/data
      - /home/git/.ssh/:/data/git/.ssh
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "2222:22" # Para SSH Git (opcional)
    labels:
      - "traefik.enable=true"
      - "traefik.http.services.gitea.loadbalancer.server.port=3000"
      - "traefik.http.services.gitea.loadbalancer.server.scheme=http"
      - "traefik.http.routers.gitea.rule=Host(`gitea.caioperlin.dev`)"
      - "traefik.http.routers.gitea.tls=true"
      - "traefik.http.routers.gitea.tls.certresolver=http"
      - "traefik.http.routers.gitea.entrypoints=websecure"
networks:
  gitea:
    external: false
  traefik:
    external: true
```

Comentários importantes:

1. Usuário do sistema para Git (recomendado):

```bash
# Cria user 'git' sem shell e com diretório home em /home/git
sudo useradd --system --create-home --shell /usr/sbin/nologin git

# Opcional: defina UID/GID explícitos para persistência entre máquinas
id -u git  # mostra UID (use este valor em USER_UID)
id -g git  # mostra GID (use este valor em USER_GID)

# No .env do diretório do compose do Gitea, defina:
# USER_UID=1001
# USER_GID=1001
```

2. Por que `USER_UID` / `USER_GID`?

- Garante que arquivos criados pelo container tenham proprietários consistentes no host.

3. Estrutura de dados do Gitea:

- `./gitea` (no host) será mapeado para `/data` no container; é aqui que o Gitea guarda repositórios, config e banco.

4. Labels do Traefik:

- `traefik.http.services.*.loadbalancer.server.port=3000` diz ao Traefik a porta interna do Gitea.
- A regra `Host(...)` define o hostname público usado para roteamento.

5. SSH para Git:

- Se quiser empurrar via SSH, ative a porta 22 do container (mapeando para 2222 como no exemplo) e configure chaves no admin do Gitea.

> **Observação:** Use o domínio que você configurou (ex: `gitea.seudominio.com`) nas labels do Gitea!

## **Configuração do Firewall (UFW)**

Garanta que apenas portas necessárias estejam liberadas:

```sh
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp    # Dashboard do Traefik (desative depois de conferir funcionamento)
sudo ufw enable
sudo ufw status
```

## **Criando o acme.json para Certificados HTTPS**

O arquivo acme.json é crucial para Traefik salvar os certificados do Let's Encrypt.

```sh
cd ~/traefik/config
touch acme.json
chmod 600 acme.json
```

Se estiver gerenciando com `sudo`/deploy automatizado, garanta que o arquivo seja acessível pelo usuário que executa o Docker (ou mantenha dono root com perm 600).

## **Inicialização e Validação**

1. **Crie a rede Docker externa traefik (apenas uma vez):**

   ```sh
   docker network create traefik
   ```

2. **Inicialize o Traefik:**

   ```sh
   cd ~/traefik
   docker compose up -d
   ```

3. **Inicialize o Gitea:**

   ```sh
   cd ~/gitea
   docker compose up -d
   ```

4. **Verifique se está rodando:**
   ```sh
   docker ps
   ```

Ambos containers devem aparecer como **Up**.

Checklist de verificação rápida:

- `docker logs traefik`; ver se houve obtenção de certificados sem erros.
- `curl -I http://localhost:8080`; dashboard acessível (se `insecure: true`).
- `curl -vk https://gitea.caioperlin.dev/`; ver redirecionamento e TLS.

Passo-a-passo detalhado com verificações (tutorial):

1. Verificar que o Docker está funcionando:

```sh
sudo systemctl status docker --no-pager
docker info | head -n 5
```

O `systemctl` deve mostrar `active (running)`; `docker info` deve retornar detalhes do daemon.

2. Conferir que a rede `traefik` existe:

```sh
docker network ls --filter name=traefik
```

Deve aparecer uma entrada `traefik` na lista.

3. Conferir `acme.json` e permissões antes de subir o Traefik:

```sh
ls -l ~/traefik/config/acme.json
# Esperado: -rw------- (600)
```

4. Subir Traefik e conferir logs de ACME:

```sh
cd ~/traefik
docker compose up -d
docker compose logs -f traefik
```

Procure mensagens tipo `Legally... obtained certificate` ou `acme: ...` indicando que o ACME obteve/renovou certificados. Se houver erros, verifique DNS e portas 80/443.

5. Subir Gitea e validar conectividade interna:

```sh
cd ~/gitea
docker compose up -d
docker ps --filter name=gitea
```

Teste de conectividade a partir do Traefik para o backend Gitea (executa curl dentro do container Traefik):

```sh
docker exec -it traefik curl -sS -o /dev/null -w "%{http_code}" http://gitea:3000/
```

Saída esperada: `200` (ou 302/301 se houver redirect para instalação). Qualquer 5xx pode indicar problema de aplicação.

6. Verificar HTTPS externo e detalhes do certificado:

```sh
curl -vk https://gitea.caioperlin.dev/ 2>&1 | sed -n '1,40p'
```

Procure `SSL connection using` e verifique o `subject` / `issuer` do certificado — deve apontar para Let's Encrypt.

7. Verificação SSH (opcional):

```sh
# Tente conectar via SSH (pode pedir confirmação de chave)
ssh -p 2222 git@gitea.caioperlin.dev
```

Se a conexão for recusada, verifique se a porta está exposta e se o Gitea está rodando com o serviço SSH ativado.

8. Validação final da aplicação:

- Acesse `https://gitea.caioperlin.dev` no navegador e confirme que a interface do Gitea carrega. Na primeira execução, o Gitea pode abrir uma página de instalação inicial — siga as instruções e guarde credenciais administrativas.

Se todos esses passos passarem, sua implantação básica está funcional.

## **Validação Básica**

- Acesse o dashboard do Traefik:  
  `http://<IP-do-servidor>:8080/`
- Tente acessar o Gitea via HTTPS:  
  `https://gitea.caioperlin.dev`
- Se tudo funcionou, a página deve carregar com cadeado de segurança!

Se você receber erros de `acme` ou `timeout`, confira os logs do Traefik e as regras do firewall/registro DNS.

## **Resolução de Problemas**

**Problema mais comum:** Gateway Timeout (Erro 504)

> Solução: Falta o arquivo `acme.json` ou ele não está com permissão 600. Crie e corriga como mostrado acima e reinicie Traefik.

**Outros comandos de diagnóstico:**

- Checar logs do Traefik:
  ```sh
  docker logs traefik | grep acme
  ```
- Testar conectividade backend:
  ```sh
  docker exec -it traefik curl -vk http://gitea:3000/
  ```
- Checar rede Docker:
  ```sh
  docker network inspect traefik
  ```

Problemas comuns e soluções rápidas:

- Certificado não gerado: verifique `acme.json` e se porta 80/443 apontam para o servidor.
- 504 Gateway Timeout: confirme se o container do Gitea está na rede `traefik` e responde em `:3000`.
- Permissão ao gravar em volumes: verifique UID/GID do usuário que criou os diretórios.

## **Comandos Úteis**

- Reiniciar containers:
  ```sh
  docker restart traefik
  docker restart gitea
  ```
- Ver estado do firewall:
  ```sh
  sudo ufw status
  ```
- Inspecionar dashboard Traefik:
  `http://<IP-do-servidor>:8080/`  
  _(Desative 'insecure' na config após validação!)_

Exemplo rápido de deploy (resumido):

```bash
# 1) Crie rede traefik (uma vez)
docker network create traefik

# 2) Prepare diretórios e permissões
sudo mkdir -p /srv/traefik/config /srv/gitea/gitea
sudo chown -R root:root /srv/traefik
sudo chown -R git:git /srv/gitea/gitea

# 3) Inicie Traefik
cd /srv/traefik && docker compose up -d

# 4) Inicie Gitea
cd /srv/gitea && docker compose up -d

# 5) Conferir logs
docker compose -f /srv/traefik/compose.yml logs -f traefik
```

## **Resumo Final**

Seguindo estes passos, você terá o Gitea rodando atrás do Traefik, com HTTPS automático e seguro, usando Docker Compose.  
**Lembre-se de ajustar o domínio e o email para seus dados!**

Depois de validar o funcionamento, considere:

- Ajustar `email` no `traefik.yml` para receber alertas do Let's Encrypt.
- Trocar `insecure: true` por `false` no `traefik.yml` após confirmar o dashboard.
- Fazer backup periódico de `/data` do Gitea (repositórios + banco).
