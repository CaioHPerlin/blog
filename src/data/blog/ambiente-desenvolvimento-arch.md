---
title: "Configurando um Ambiente Arch Linux para Produtividade"
publishedAt: 2025-11-20
tags:
  - "setup"
  - "produtividade"
  - "linux"
  - "archlinux"
  - "hyprland"
  - "desenvolvimento"
  - "programação"
  - "configurando"
---

> Oficina apresentada na **SECOMP 2025 – IFMS Campus Nova Andradina** sob o título "Instalação e Configuração de um Ambiente de Desenvolvimento Moderno com Arch Linux e Hyprland"

- Introdução Teórica

  - [Por que Linux?](#por-que-linux)
  - [Por que Arch Linux?](#por-que-arch-linux)
  - [Arch Wiki](#arch-wiki)
  - [Pacman vs Apt](#pacman-vs-apt)
  - [Arch User Repository (AUR)](#arch-user-repository-aur)

- Instalação

  - [Instalação do Arch Linux com archinstall](#instalação-do-arch-linux-com-archinstall)
  - [Etapas do archinstall](#etapas-do-archinstall)

- Configuração
  - [Configurações Pós-Instalação](#configurações-pós-instalação)
  - [Instalando o Ambiente Visual: Hyprland](#instalando-o-ambiente-visual-hyprland)
  - [Editor de Código (VSCode)](#editor-de-código)
  - [Terminal: Zsh + Starship + Plugins](#terminal-zsh)
  - [Programas Essenciais](#programas-essenciais)
    - [Navegador](#navegador)
    - [Explorador de Arquivos + Visualizador de Imagens](#explorador-de-arquivos--visualizador-de-imagens)
    - [Launcher de Aplicativos](#launcher-de-aplicativos)
    - [Git](#git)
    - [Gerenciador de Versões (asdf)](#gerenciador-de-versões)
  - [Personalização do Ambiente](#personalização-do-ambiente)
    - [Clonando Configurações](#personalização-do-ambiente)
    - [Ajustes no hyprland.conf](#ajustes-importantes-no-hyprlandconf)
      - [Modo Escuro do Sistema](#modo-escuro-do-sistema)
      - [Gaps, Teclado, Atalhos e Animações](#gaps-teclado-atalhos-e-animações)
      - [Waybar](#waybar)

# Introdução Teórica

## **Por que Linux?**

Como muitos, também interagi com computadores primeiro a partir do sistema da Microsoft, mas a realidade é que o ambiente Windows não foi projetado tendo o desenvolvedor como público principal. Isso resulta em ferramentas integradas pela metade, ou ainda com mais abstrações bloqueando o caminho, frequentemente você dependerá de camadas adicionais e curativos: WSL, gerenciadores de pacotes externos, emuladores ou adaptações; vários componentes necessários para alcançar o mesmo fluxo natural que sistemas Unix-like oferecem nativamente.

Há muitos motivos que tornam um sistema Linux (ou GNU/Linux, se preferir) difícil de superar quando o assunto é ter um ambiente de desenvolvimento de software produtivo. Os três mais relevantes, na minha visão, são:

1. Linux é o sistema operacional esmagadoramente predominante em servidores e na infraestrutura de TI global. Sempre que você desenvolve software, há uma boa (ótima) chance de que ele será executado em um ambiente Linux quando for pra produção. Desenvolver diretamente em Linux não só reduz discrepância entre ambientes, mas permite que você utilize as mesmas ferramentas, bibliotecas e versões que encontrará em produção, no seu cotidiano. Isso é especialmente verdade para desenvolvedores web, backend e DevOps.

2. Utilizar e trabalhar em Linux incentiva o aprendizado de conceitos fundamentais de sistemas operacionais, redes e segurança. A maior parte das distribuições Linux não tentam abstrair informações do usuário, mas sim colocá-lo de fato no controle do sistema. Um usuário final médio talvez não precise (nem queira!) entender tudo o que está acontecendo em seu hardware, e é conveniente que não tenha total controle para que não quebre seu sistema e culpe a empresa/organização por trás dele. Contudo, como desenvolvedor de software, certamente deve se construir esse entendimento para que seja um profissional eficaz e autônomo; afinal, você é responsável por manter suas aplicações em funcionamento. O bônus que vamos explorar neste artigo é que, ao aprender a gerenciar seu próprio sistema Linux, você também poderá adaptá-lo exatamente às suas necessidades pessoais de produtividade.

3. Ferramentas nativas: muitas das ferramentas mais poderosas e populares para desenvolvimento de software foram originalmente criadas para sistemas Unix-like, incluindo Linux. Isso inclui compiladores, interpretadores, gerenciadores de pacotes, sistemas de controle de versão e muito mais. Utilizar essas ferramentas diariamente para manutenção de sua própria máquina torna você um profissional completo e habituado. Isso também implica em ter acesso a novas ferramentas e atualizações mais rapidamente, uma vez que a comunidade open source frequentemente lança novidades primeiro para Linux (ex recente: runtime Bun). Além disso, também estará livre de trabalhar com os wizards de instalação (também conhecidos como "Next, Next, Finish"), utilizando gerenciadores de pacotes que automatizam a instalação, atualização e remoção de software de forma eficiente e segura. Isso por si só é um grande ganho de produtividade.

## **Por que Arch Linux?**

Tudo bem, entendemos alguns dos motivos que fazem do Linux uma ótima escolha para desenvolvimento. Mas por que escolher o Arch Linux especificamente? É aqui que caímos bastante em território pessoal e opinativo, mas acredito que o Arch oferece um conjunto único de características que o tornam especialmente adequado para ser o sistema _daily-driver_ de desenvolvedores que buscam produtividade.

O **Arch Linux** é uma distribuição independente, minimalista e flexível, construída sobre o princípio de entregar apenas o essencial: um sistema base limpo, pacotes próximos do **upstream** (a versão original mantida pelos desenvolvedores do software) e ferramentas simples que não escondem seu funcionamento interno. Nada vem pré-configurado além do básico, e tudo o que compõe o ambiente é escolhido e entendido pelo próprio usuário.

Para desenvolvimento, esse modelo oferece um equilíbrio entre simplicidade e controle. O sistema não força estruturas rígidas nem impõe camadas de abstração que atrapalham a manutenção. Você monta um ambiente exatamente com as versões, serviços e bibliotecas que precisa e com documentação clara. Isso reduz atrito no dia a dia e evita a sensação de estar trabalhando contra o próprio computador.

O modelo **rolling release** complementa isso: você recebe atualizações contínuas, com versões recentes e compatíveis entre si, evitando o acúmulo de pacotes antigos que costuma gerar o **dependency hell**. Em vez de grandes atualizações que quebram tudo de uma vez, de forma incremental e síncrona. Para quem desenvolve e precisa de ferramentas atualizadas sem perder estabilidade, esse fluxo é extremamente vantajoso.

### **Arch Wiki**

A **Arch Wiki** é uma das documentações mais completas e respeitadas do mundo Linux. Ela não só cobre o ecossistema do Arch Linux, mas também explica conceitos gerais de sistemas Unix-like que se aplicam a praticamente qualquer distribuição. É um recurso que incentiva autonomia, entendimento profundo do sistema e uma abordagem mais consciente sobre como cada componente funciona. Também é constantemente atualizada pela comunidade, refletindo as melhores práticas e soluções para problemas comuns. É uma das poucas documentações que realmente capacitam o usuário em poucas páginas, geralmente com explicações claras, exemplos práticos e links para recursos adicionais.

### **Pacman vs Apt**

Pacman é o gerenciador de pacotes padrão do Arch Linux, enquanto o apt é o gerenciador utilizado em distribuições baseadas em Debian, como Ubuntu. Ambos são ferramentas poderosas para instalar, atualizar e gerenciar software, mas possuem filosofias e abordagens distintas.

O pacman é rápido, direto e previsível, refletindo o minimalismo do Arch e entregando uma experiência uniforme para a maior parte do ecossistema.

A diferença prática aparece no fluxo de instalação. Em distribuições baseadas em apt, alguns softwares exigem vários passos adicionais: adicionar repositórios externos a uma lista, importar chaves GPG, atualizar índices, instalar dependências auxiliares, etc. Um exemplo clássico é o Docker, cuja instalação oficial no Ubuntu [envolve vários comandos e configurações extras](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository).

No Arch, quase sempre o processo se resume a um único passo, pois os pacotes oficiais já incluem tudo o que o software precisa. No caso do Docker, por exemplo, basta:

```bash
sudo pacman -S docker
```

E, se você quiser usar o Docker sem sudo:

```bash
sudo systemctl enable --now docker.service
sudo usermod -aG docker $USER
```

Essa simplicidade, na minha opinião, torna o Arch mais prático para desenvolvimento.

### **Arch User Repository (AUR)**

O AUR é um repositório comunitário gigantesco que oferece milhares de pacotes extras. Ele não distribui binários: utiliza PKGBUILDs, que são arquivos textuais simples que contêm receitas descrevendo exatamente como o pacote deve ser construído localmente. Esse modelo mantém tudo transparente, auditável e fácil de adaptar, além de permitir que qualquer usuário compreenda e modifique o processo de instalação. A combinação Arch + AUR é um dos maiores diferenciais da distro, pois expande de forma impressionante a disponibilidade de software sem comprometer a coesão do sistema.

Contudo, é importante notar que o AUR deve ser usado com cautela, uma vez que os pacotes não são oficialmente mantidos pela equipe do Arch Linux. Sempre revise o conteúdo dos PKGBUILDs e confie apenas em fontes confiáveis para garantir a segurança do seu sistema. Afinal, é uma faca de dois gumes: sendo aberto à comunidade, também pode ser um vetor para software malicioso se não for utilizado com discernimento. Especialmente em pacotes menos populares, é prudente verificar a reputação do mantenedor e ESPECIALMENTE, o conteúdo do PKGBUILD antes de sair instalando qualquer coisa.

# Instalação

## **Instalação do Arch Linux com `archinstall`**

A instalação pode ser feita manualmente seguindo o [Installation_guide](https://wiki.archlinux.org/title/Installation_guide), mas para fins de oficina usaremos o instalador interativo **archinstall**, que acelera o processo e entrega uma base consistente.

Sempre recomendo instalar o Arch através do guia manual pelo menos uma vez, para entender os conceitos fundamentais do sistema e aprender sobre como as coisas são feitas. Contudo, o `archinstall` é uma ferramenta oficial e confiável que pode ser usada para instalações rápidas. Se você pretende usar Arch Linux como sistema principal e se sente inseguro de fazer a instalação manualmente, o `archinstall` é um ótimo caminho. Além disso, ele é altamente customizável, permitindo que você escolha exatamente quais componentes deseja instalar, desde o particionamento do disco até a seleção de pacotes e configurações de rede. Em suma, a única desvantagem é que ele pode não ensinar tanto sobre o funcionamento interno do sistema quanto a instalação manual.

### **1. Baixar a ISO**

Baixe a imagem oficial do Arch Linux no site e inicialize o sistema pela ISO.

### **2. Configurar a conexão de rede**

Não abordarei o que é necessário para conectar à uma rede WiFi, mas você pode usar o `iwctl` para isso, recomendo verificar o `Installation_guide` oficial do Arch Linux para detalhes.

No caso da VM e conexões cabeadas, a rede já estará ativa por padrão.

### **3. Ajustar a fonte do TTY (opcional)**

Se o texto estiver pequeno no ambiente de instalação:

```bash
ls /usr/share/kbd/consolefonts/
setfont ter-118b
```

### **4. Preparar o pacman**

Antes de iniciar o `archinstall`, abra o arquivo de configuração:

```bash
nano /etc/pacman.conf
```

Ative:

- **ParallelDownloads = 10** # aumenta o número de downloads simultâneos (padrão é 5)

E opcionalmente, por estética:

- **Color**
- **ILoveCandy**

Atualize o instalador:

```bash
pacman -Sy archinstall
```

Inicie o script:

```bash
archinstall
```

### **Etapas do `archinstall`**

Selecione as seguintes opções:

- **Language:** English
- **Locales:** `en_US`
- **Keyboard layout:** `us` # ou outro conforme seu teclado
- **Mirrors:** Brasil + ativar **multilib**
- **Disk:** selecione o disco desejado
- **Partitioning:** automático
- **Filesystem:** `ext4` ou `btrfs`
- **Swap:** habilitado
- **Bootloader:** `GRUB`
- **Hostname:** `archvm`
- **Authentication:** criar usuário + root
- **Profile:** `minimal`
- **Kernel:** `linux`
- **Network:** `NetworkManager`
- **Timezone:** `America/Campo_Grande`
- **NTP:** habilitado
- **Audio:** `Pipewire`

Confirme tudo e aguarde a instalação. Em seguida, reinicie.

> Dica: para grandes listas de opções, pesquise por substrings com o atalho `/`.

# Configuração

## **Configurações Pós-Instalação**

Após login:

```bash
sudo pacman -Syyuu
```

Instalando nosso primeiro pacote com pacman manualmente:

```bash
sudo pacman -S noto-fonts
```

## **Instalando o Ambiente Visual: Hyprland**

Pacotes essenciais:

```bash
sudo pacman -S hyprland kitty nano
```

Teste o Hyprland:

```bash
hyprland
```

Se carregar corretamente, pressione **Super + M** para sair e configure a resolução:

```bash
nano ~/.config/hypr/hyprland.conf
```

```ini
monitor=,1920x1080,0x0,1
```

Recarregue:

```bash
hyprland
```

**Super + Q** abre terminais (emulador de terminal `kitty`) no ambiente.

Opcionalmente, é interessante configurar um tema para o terminal kitty, nessa oficina vou tentar configurar um tema popular para melhorar a experiência visual. Digite:

```bash
kitten themes
```

E selecione o tema de sua escolha. Usaremos o tema **Catppuccin Mocha**.

## **Editor de Código**

Há diversas opções competentes de editor de código, esta oficina pressupõe o uso do **VSCode**, pela sua popularidade na comunidade. Para facilidade, recomendo usar a versão proprietária oficial, que pode ser instalada diretamente via pacman:

> Importante: veja os [detalhes sobre as 3 diferentes versões do VSCode distribuídas no Arch Linux](https://wiki.archlinux.org/title/Visual_Studio_Code)

```bash
sudo pacman -S visual-studio-code-bin
```

Vamos instalar o mesmo tema, **Catppuccin Mocha**, para manter a consistência visual.

## **Terminal: Zsh**

A shell padrão do Arch é o **bash**, mas podemos melhorar a experiência do dia-a-dia explorando outras opções. Recomendo o `zsh`, que é moderno e facilmente expandível com plugins.

Instale o pacote:

```bash
sudo pacman -S zsh
```

Altere a shell padrão para zsh:

```bash
chsh -s /usr/bin/zsh
```

Instale o prompt customizável starship:

```bash
sudo pacman -S starship
```

Para utilizar com `zsh`, adicione ao final do arquivo `~/.zshrc`:

```bash
eval "$(starship init zsh)"
```

Para ver as mudanças, podemos reiniciar o terminal ou rodar:

```bash
source ~/.zshrc
```

Verificamos que ainda faltam alguns ícones no nosso prompt e, portanto, no nosso sistema. Vamos instalar uma família de fontes que já possui esses ícones embutidos, uma **Nerd Font**. Minha preferência é pela **JetBrains Mono Nerd Font**:

```bash
sudo pacman -S ttf-jetbrains-mono-nerd
```

Podemos agora configurar o nosso terminal `kitty` para usar essa fonte como padrão. Execute em seu terminal:

```bash
kitten choose-font
```

E selecione a fonte **JetBrains Mono Nerd Font**.

> Agora também é uma boa hora pra alterar a fonte do seu VSCode.

Voltando ao terminal, não entrarei no tópico de personalização do starship, mas você pode explorar o [site oficial](https://starship.rs/) para entender as extensas possibilidades de customização.

Podemos agora instalar os principais plugins de zsh para melhorar a experiência:

```bash
pacman -S zsh-syntax-highlighting zsh-autosuggestions
```

E, para instalar, vamos editar nosso arquivo `~/.zshrc`:

```bash
source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
```

Isso marca o fim da nossa configuração inicial do terminal. Reinicie o terminal ou rode `source ~/.zshrc` para ver as mudanças.

## **Programas essenciais**

### Navegador

Recomendo instalar o firefox:

```bash
sudo pacman -S firefox
```

É útil escolher um padrão de abas na vertical, uma vez que facilita o gerenciamento com muitos projetos abertos simultaneamente, algo comum na rotina de desenvolvimento. Também recomendo utilizar o **Duck Duck Go**, um motor de busca focado em privacidade e que evita os resultados patrocinados do Google.

> Recomendo também adicionar um atalho em seu hyprland.conf para abrir o navegador, eu gosto de usar `Super + B`.

Vamos definir o firefox como navegador padrão do sistema:

```bash
sudo pacman -S xdg-utils
xdg-settings set default-web-browser firefox.desktop
```

### Explorador de Arquivos + Visualizador de Imagens

Utilizo o **Dolphin** como gerenciador de arquivos e o **Eye of GNOME (eog)** como visualizador de imagens:

```bash
sudo pacman -S dolphin eog
```

> Também recomendo utilizar um atalho pro gerenciador de arquivos. Normalmente, uso `Super + E`.

### Launcher de Aplicativos

Recomendo o **Wofi** como launcher de aplicativos:

```bash
sudo pacman -S wofi
```

### Git

Indispensável pra qualquer desenvolvedor, instale com:

```bash
sudo pacman -S git
```

É interessante também setar suas credenciais globais:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

### Gerenciador de Versões

É comum na rotina de desenvolvedor trabalhar com múltiplas versões de linguagens e ferramentas. Recomendo instalar o **asdf**, um gerenciador de versões universal que suporta diversas linguagens através de plugins.

> Também recomendo o NVM caso a intenção seja trabalhar exclusivamente com Node.js.

Contudo, para instalar o asdf, precisamos de um gerenciador de pacotes para a AUR, uma vez que o pacote não está disponível nos repositórios oficiais que podemos acessar com o `pacman`. Para instalar o `yay`:

```bash
# Instale as dependências
sudo pacman -S base-devel

# Clone o projeto
git clone https://aur.archlinux.org/yay.git
cd yay

# Construa e instale
makepkg -si
cd ..
rm -rf yay
```

Agora podemos instalar o asdf:

```bash
yay -S asdf-vm
```

Para ativá-lo, podemos incluir o seguinte no final do nosso `~/.zshrc`:

```bash
source /opt/asdf-vm/asdf.sh
```

Agora podemos começar a usar, como exemplo, para nodejs:

```bash
asdf install nodejs

asdf list
asdf plugin add nodejs
asdf list-all nodejs
asdf install nodejs latest
asdf global nodejs latest
```

O ideal com o asdf é configurar para cada projeto individualmente a versão desejada, criando um arquivo `.tool-versions` na raiz do projeto com o conteúdo:

```bash
mkdir projeto-exemplo
cd projeto-exemplo
asdf local nodejs 20.5.1
cat .tool-versions # deve mostrar a versão configurada
```

## **Personalização do Ambiente**

> Caso queira, você pode clonar esse repositório, que contém algumas configurações básicas para Hyprland, Waybar, Kitty, Zsh e outros programas:

```bash
git clone https://github.com/caiohperlin/arch
```

### **Ajustes Importantes no `hyprland.conf`**

#### **Modo Escuro do Sistema**

```bash
sudo pacman -S xdg-desktop-portal-gtk xdg-desktop-portal-hyprland qt6ct
```

```ini
exec = gsettings set org.gnome.desktop.interface gtk-theme "adw-gtk3-dark"
exec = gsettings set org.gnome.desktop.interface color-scheme "prefer-dark"
env = QT_QPA_PLATFORMTHEME,qt6ct
```

#### **Gaps, teclado, atalhos e animações**

Ajuste livremente no mesmo arquivo, conforme o estilo desejado. Veja o arquivo `hyprland.conf` clonado para exemplos.

#### Waybar

Waybar é uma barra de status altamente personalizável para ambientes Wayland, como o Hyprland. Ela pode exibir informações úteis, a mais útil delas sendo as diferentes workspaces do hyprland. Também pode ser usada pra uma infinidade de outras funções, como mostrar a hora, uso de CPU, memória, rede, bateria e muito mais.

> Verifique alguns exemplos de configuração [aqui](https://github.com/Alexays/Waybar/wiki/Examples)

```bash
sudo pacman -S waybar
```
