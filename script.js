// Ele faz ações acontecerem, como abrir modal e marcar o link ativo.
// Aqui tem login, permissões, membros, repertório, escalas e a conexão com o Supabase.
 
// ============================================================
// SISTEMA DE USUÁRIOS
// ============================================================
// Pego o botão de login. Se ele existir, eu estou na tela de entrada.
const loginBtn = document.getElementById('login-btn');
const loginForm = document.getElementById('login-form');
// Botão para visitantes entrarem sem precisar de usuário e senha.
const visitanteBtn = document.getElementById('visitante-btn');
const loginStatus = document.getElementById('login-status');
const loginLoadingModal = document.getElementById('login-loading-modal');
const loginLoadingTitle = document.getElementById('login-loading-title');
const loginLoadingDetail = document.getElementById('login-loading-detail');
const CHAVE_POPUP_VISITANTE_VISTO = 'popupVisitanteVisto';
const TEMPO_MINIMO_LOADING_LOGIN = 700;
let tempoFecharModalLogin = null;
 
function exibirTextoDeUsuarioAdm(tag, texto){
    // Escreve um texto em uma tag quando o usuário é administrador.
    let campo = document.querySelector(tag);
    if (campo) campo.textContent = texto;
}
function exibirTextoDeUsuarioMembro(tag, texto){
    // Escreve um texto em uma tag quando o usuário é membro comum.
    let campoUm = document.querySelector(tag);
    if (campoUm) campoUm.textContent = texto;
}

function alternarModalLoginCarregando(ativo, titulo = 'Validando seu acesso', detalhe = 'Estamos conferindo suas credenciais com seguranca.') {
    if (!loginLoadingModal) return;

    clearTimeout(tempoFecharModalLogin);

    if (loginLoadingTitle && titulo) loginLoadingTitle.textContent = titulo;
    if (loginLoadingDetail && detalhe) loginLoadingDetail.textContent = detalhe;

    if (ativo) {
        loginLoadingModal.hidden = false;
        document.body.classList.add('login-modal-aberto');
        requestAnimationFrame(() => loginLoadingModal.classList.add('ativo'));
        return;
    }

    loginLoadingModal.classList.remove('ativo');
    document.body.classList.remove('login-modal-aberto');
    tempoFecharModalLogin = setTimeout(() => {
        if (!loginLoadingModal.classList.contains('ativo')) {
            loginLoadingModal.hidden = true;
        }
    }, 240);
}

function definirEstadoLoginCarregando(ativo, mensagem = '', detalhe = '') {
    // Mostra retorno visual enquanto a API confirma o acesso.
    if (!loginBtn) return;

    if (!loginBtn.dataset.textoOriginal) {
        loginBtn.dataset.textoOriginal = loginBtn.textContent;
    }

    loginBtn.disabled = ativo;
    loginBtn.setAttribute('aria-busy', ativo ? 'true' : 'false');
    loginBtn.textContent = loginBtn.dataset.textoOriginal;

    if (visitanteBtn) visitanteBtn.disabled = ativo;
    if (loginStatus) loginStatus.textContent = '';

    alternarModalLoginCarregando(
        ativo,
        mensagem || 'Validando seu acesso',
        detalhe || 'Estamos conferindo suas credenciais com seguranca.'
    );
}

function exibirAvisoLogin(titulo, mensagem, tipo = 'erro') {
    alternarModalLoginCarregando(false);

    let modal = document.getElementById('login-aviso-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'login-aviso-modal';
        modal.className = 'login-aviso-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'login-aviso-titulo');
        modal.innerHTML = `
            <div class="login-aviso-card">
                <button type="button" class="login-aviso-fechar" aria-label="Fechar aviso" onclick="fecharAvisoLogin()">×</button>
                <div class="login-aviso-icone" aria-hidden="true">!</div>
                <h2 id="login-aviso-titulo"></h2>
                <p id="login-aviso-mensagem"></p>
                <button type="button" class="login-aviso-acao" onclick="fecharAvisoLogin()">Entendi</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.dataset.tipo = tipo;
    modal.querySelector('#login-aviso-titulo').textContent = titulo;
    modal.querySelector('#login-aviso-mensagem').textContent = mensagem;
    modal.style.display = 'grid';
    document.body.classList.add('login-modal-aberto');
    setTimeout(() => modal.classList.add('ativo'), 10);
}

function fecharAvisoLogin() {
    const modal = document.getElementById('login-aviso-modal');
    if (!modal) return;

    modal.classList.remove('ativo');
    document.body.classList.remove('login-modal-aberto');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 240);
}

function redirecionarDepoisDoLoading(destino, inicioLoading) {
    const tempoPassado = Date.now() - inicioLoading;
    const espera = Math.max(0, TEMPO_MINIMO_LOADING_LOGIN - tempoPassado);

    setTimeout(() => {
        window.location.href = destino;
    }, espera);
}
 
if (loginForm && loginBtn) {
    // O envio do formulario tambem cobre a tecla Enter de forma semantica.
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (loginBtn.disabled) return;
        const inicioLoading = Date.now();

        // Lê os inputs no momento do clique
        let usuario = document.getElementById('usuario-input').value.trim();
        let senha = document.getElementById('senha-input').value;

        if (!usuario || !senha) {
            exibirAvisoLogin('Dados incompletos', 'Informe seu usuario e sua senha para entrar.');
            return;
        }
 
        // Desativo para a pessoa não clicar várias vezes enquanto o login carrega.
        definirEstadoLoginCarregando(true, 'Validando seu acesso', 'Estamos conferindo suas credenciais com seguranca.');

        try {
            // Valida o usuário no Supabase, sem expor a lista de senhas no JavaScript.
            const encontrado = await autenticarUsuario(usuario, senha);
 
            if (encontrado) {
                // Salva o perfil e nome no localStorage para usar nas outras páginas.
                localStorage.setItem('perfilUsuario', encontrado.perfil);
                localStorage.setItem('nomeUsuario', encontrado.nome);
                definirEstadoLoginCarregando(true, 'Acesso liberado', 'Preparando a area do ministerio para voce.');
    
                redirecionarDepoisDoLoading('./movimenta%C3%A7%C3%B5es/home.html', inicioLoading);
            } else {
                // Avisa quando o usuário ou a senha não foram encontrados.
                definirEstadoLoginCarregando(false);
                exibirAvisoLogin('Acesso não encontrado', 'Confira seu usuario e sua senha e tente novamente.');
            }
        } catch (erro) {
            // Se cair aqui, normalmente é internet, Supabase fora ou alguma configuração errada.
            console.warn('Erro ao fazer login:', erro);
            definirEstadoLoginCarregando(false);
            exibirAvisoLogin('Nao conseguimos entrar agora', 'Verifique sua conexao e tente novamente em alguns instantes.');
        }
    });
}

if (visitanteBtn) {
    visitanteBtn.addEventListener('click', () => {
        const inicioLoading = Date.now();
        // Visitante entra sem credenciais de edição.
        definirEstadoLoginCarregando(true, 'Entrando como visitante', 'Preparando uma visualizacao simples do ministerio.');
        localStorage.setItem('perfilUsuario', 'visitante');
        localStorage.setItem('nomeUsuario', 'Visitante');
        sessionStorage.removeItem(CHAVE_POPUP_VISITANTE_VISTO);

        visitanteBtn.disabled = true;
        if (loginBtn) loginBtn.disabled = true;

        redirecionarDepoisDoLoading('./movimenta%C3%A7%C3%B5es/home.html', inicioLoading);
    });
}
 
// ============================================================
// LEITURA DO PERFIL NAS PÁGINAS INTERNAS
// (Esse bloco roda em home.html e nas outras páginas internas)
// ============================================================
// Aqui eu pego o perfil salvo para saber o que cada pessoa pode ver.
const perfilUsuario = localStorage.getItem('perfilUsuario');
const nomeUsuario   = localStorage.getItem('nomeUsuario');
 
// Se não estiver logado e não for a página de login, redireciona
if (!perfilUsuario && !document.getElementById('login-btn')) {
    window.location.href = '../index.html';
}
 
// Exibe o nome no modal de perfil
const tagNome = document.querySelector('.nome-usuario');
if (tagNome && nomeUsuario) {
    tagNome.textContent = nomeUsuario;
}
 
// Esconde elementos exclusivos de admin para membros comuns
if (perfilUsuario !== 'admin') {
    document.querySelectorAll('.somente-admin').forEach(el => {
        el.style.display = 'none';
    });
}
 
// ============================================================
// FUNÇÕES DE VERIFICAÇÃO DE PERFIL (funções que eu já tinha deixado antes)
// ============================================================
function verificarPerfilAdm(){
    // Mostra manualmente o texto de perfil admin.
    exibirTextoDeUsuarioAdm('h4', 'Perfil: Admin');
}
function verificarPerfilMembro(){
    // Mostra manualmente o texto de perfil membro.
    exibirTextoDeUsuarioMembro('h4', 'Perfil: Membro');
}
 
// Exibe o perfil correto no h4 automaticamente ao carregar a página
const tagPerfil = document.querySelector('.mudar-perfil') || document.querySelector('h4');
if (tagPerfil && perfilUsuario) {
    // Deixo o texto do perfil mais bonito antes de jogar no HTML.
    const perfilFormatado = perfilUsuario === 'admin' ? 'Admin' : perfilUsuario === 'visitante' ? 'Visitante' : 'Membro';
    tagPerfil.textContent = nomeUsuario ? `Perfil: ${perfilFormatado} | ${nomeUsuario}` : `Perfil: ${perfilFormatado}`;
}

// Link do Instagram usado quando o perfil for visitante.
const INSTAGRAM_VISITANTE = 'https://www.instagram.com/banda_jeovanissi?igsh=MWVicnp2eGIwOGZ6eA=='; // Atualize com o perfil real quando quiser.

function isVisitante() {
    // Fiz essa função só para não repetir essa comparação toda hora.
    return perfilUsuario === 'visitante';
}

function configurarAcessoPorPerfil() {
    // Admin pode ver tudo, então não preciso mexer na tela dele aqui.
    if (perfilUsuario === 'admin') {
        return;
    }

    // Quem não é admin não pode ver os botões e áreas administrativas.
    document.querySelectorAll('.somente-admin').forEach(el => {
        el.style.display = 'none';
    });

    if (isVisitante()) {
        // Visitante recebe uma tela mais simples, com links de apresentação.
        document.querySelectorAll('.somente-visitante').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelectorAll('.somente-nao-visitante').forEach(el => {
            el.style.display = 'none';
        });
        adicionarMenuVisitante();
        mostrarConteudoVisitante();
    } else {
        document.querySelectorAll('.somente-visitante').forEach(el => {
            el.style.display = 'none';
        });
    }
}

function adicionarMenuVisitante() {
    // Aqui eu troco o menu normal por um menu mais útil para visitante.
    const topnav = document.querySelector('.topnav');
    if (!topnav) return;

    // Limpa o menu atual
    topnav.innerHTML = '';

    // Adiciona novos links interessantes para visitantes
    const links = [
        { href: '#sobre-nos', text: 'Sobre Nós', acao: mostrarSobreNos },
        { href: '#repertorios', text: 'Repertórios', acao: mostrarRepertoriosVisitante },
        { href: '#participar', text: 'Participar', acao: mostrarParticipacaoVisitante },
        { href: '#eventos', text: 'Eventos', acao: mostrarEventos },
        { href: '#contato', text: 'Contato', acao: mostrarContato },
        //{ href: INSTAGRAM_VISITANTE, text: 'Instagram', target: '_blank' }
    ];

    links.forEach(linkData => {
        // Crio os links pelo JavaScript para deixar tudo no mesmo lugar.
        const link = document.createElement('a');
        link.href = linkData.href;
        link.textContent = linkData.text;
        if (linkData.acao) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                linkData.acao();
            });
        }
        if (linkData.target) link.target = linkData.target;
        topnav.appendChild(link);
    });
}

function mostrarConteudoVisitante() {
    // Esse card aparece só para quem está conhecendo o ministério.
    const main = document.querySelector('main');
    if (!main) return;

    const jaExiste = document.querySelector('.visitante-card');
    if (jaExiste) {
        abrirPopupVisitante();
        return;
    }

    const section = document.createElement('section');
    section.className = 'visitante-card somente-visitante';
    section.innerHTML = obterMensagemVisitanteHtml();

    main.prepend(section);
    abrirPopupVisitante();
}

function obterMensagemVisitanteHtml() {
    return `
        <div class="visitante-card-conteudo">
            <h3>Bem-vindo, visitante!</h3>
            <p>Estas são informações especiais pensadas para quem está conhecendo nosso ministério.</p>
            <ul>
                <li>Veja repertórios recentes e conheça nossas músicas.</li>
                <li>Saiba como participar e acompanhar nosso trabalho.</li>
            </ul>
        </div>
    `;
}

function ordenarDatasRepertorioVisitante(datas) {
    return datas.sort((a, b) => {
        const [diaA, mesA] = String(a).split('/').map(Number);
        const [diaB, mesB] = String(b).split('/').map(Number);
        const ano = new Date().getFullYear();
        const dataA = new Date(ano, (mesA || 1) - 1, diaA || 1).getTime();
        const dataB = new Date(ano, (mesB || 1) - 1, diaB || 1).getTime();
        return dataB - dataA;
    });
}

function obterRepertoriosRecentesVisitante(limite = 4) {
    const repertorio = carregarRepertorio();

    return ordenarDatasRepertorioVisitante(Object.keys(repertorio))
        .slice(0, limite)
        .map((data) => ({
            data,
            musicas: Array.isArray(repertorio[data]) ? repertorio[data] : [],
        }));
}

function montarListaRepertoriosVisitante() {
    const repertorios = obterRepertoriosRecentesVisitante();

    if (repertorios.length === 0) {
        return '<p class="visitante-vazio">Os repertórios serão exibidos aqui assim que forem cadastrados pelo ministério.</p>';
    }

    return repertorios.map(({ data, musicas }) => {
        const itens = musicas.length > 0
            ? musicas.slice(0, 5).map((musica) => {
                const nome = escaparHtml(musica.nome || 'Música sem nome');
                const link = normalizarLinkSeguro(musica.link);
                if (!link) return `<li>${nome}</li>`;
                return `<li><a href="${escaparHtml(link)}" target="_blank" rel="noopener">${nome}</a></li>`;
            }).join('')
            : '<li>Lista em preparação.</li>';

        return `
            <article class="visitante-repertorio-card">
                <span>Repertório recente</span>
                <h4>Domingo ${escaparHtml(data)}</h4>
                <ul>${itens}</ul>
            </article>
        `;
    }).join('');
}

function montarPainelRepertoriosVisitante() {
    return `
        <article class="visitante-painel visitante-painel-repertorios" id="repertorios">
            <div class="visitante-painel-topo">
                <span>Repertórios</span>
                <h4>Músicas recentes</h4>
                <p>Veja os 4 repertórios mais recentes cadastrados pelo ministério.</p>
            </div>
            <div class="visitante-repertorios-lista">
                ${montarListaRepertoriosVisitante()}
            </div>
        </article>
    `;
}

function montarPainelParticipacaoVisitante() {
    return `
        <article class="visitante-painel" id="participar">
            <div class="visitante-painel-topo">
                <span>Participação</span>
                <h4>Como acompanhar nosso trabalho</h4>
            </div>
            <ul class="visitante-passos">
                <li>Acompanhe os repertórios para conhecer as músicas que fazem parte da nossa rotina.</li>
                <li>Siga nosso Instagram para ver avisos, bastidores e momentos de louvor.</li>
                <li>Fale conosco se deseja conhecer melhor o ministério ou participar futuramente.</li>
            </ul>
            <a class="visitante-link-acao" href="${INSTAGRAM_VISITANTE}" target="_blank" rel="noopener">Abrir Instagram</a>
        </article>
    `;
}

function removerConteudosVisitanteAbertos() {
    document.querySelectorAll('.visitante-conteudo, .visitante-implantacoes').forEach(el => el.remove());
}

function obterImplantacaoVisitanteAtiva() {
    return document.querySelector('.visitante-implantacoes')?.dataset.tipo || '';
}

function renderizarImplantacoesVisitante(tipo = obterImplantacaoVisitanteAtiva()) {
    if (!isVisitante()) return;
    if (!tipo) return;

    const main = document.querySelector('main');
    if (!main) return;

    document.querySelectorAll('.visitante-implantacoes').forEach(el => el.remove());

    const somenteRepertorios = tipo === 'repertorios';
    const somenteParticipacao = tipo === 'participar';
    const titulo = somenteRepertorios ? 'Repertórios recentes' : 'Como participar e acompanhar';
    const texto = somenteRepertorios
        ? 'Conheça as músicas que fazem parte da nossa rotina de louvor.'
        : 'Veja os melhores caminhos para acompanhar o Jeová Nissi e falar com o ministério.';
    const paineis = [
        somenteRepertorios ? montarPainelRepertoriosVisitante() : '',
        somenteParticipacao ? montarPainelParticipacaoVisitante() : '',
    ].join('');

    const section = document.createElement('section');
    section.className = 'visitante-implantacoes somente-visitante';
    section.dataset.tipo = tipo;
    section.innerHTML = `
        <div class="visitante-implantacoes-cabecalho">
            <span>Para visitantes</span>
            <h3>${titulo}</h3>
            <p>${texto}</p>
        </div>
        <div class="visitante-implantacoes-grid visitante-implantacoes-grid-unico">
            ${paineis}
        </div>
    `;

    main.appendChild(section);

    section.style.display = 'block';
}

function abrirPopupVisitante() {
    if (!isVisitante() || sessionStorage.getItem(CHAVE_POPUP_VISITANTE_VISTO) === 'true') return;

    let popup = document.getElementById('popup-visitante');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popup-visitante';
        popup.className = 'popup-visitante';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-modal', 'true');
        popup.setAttribute('aria-label', 'Boas-vindas para visitante');
        popup.innerHTML = `
            <div class="popup-visitante-conteudo">
                <button type="button" class="popup-visitante-fechar" aria-label="Fechar aviso" onclick="fecharPopupVisitante()">×</button>
                <div class="popup-visitante-marca">
                    <img src="../assets/logo-jeova-nissi-profissional.svg" alt="">
                </div>
                <span class="popup-visitante-etiqueta">Acesso de visitante</span>
                <div class="popup-visitante-mensagem">
                    ${obterMensagemVisitanteHtml()}
                </div>
                <button type="button" class="popup-visitante-acao" onclick="fecharPopupVisitante()">Continuar</button>
            </div>
        `;
        document.body.appendChild(popup);
    }

    popup.style.display = 'flex';
    document.body.classList.add('popup-visitante-aberto');
    setTimeout(() => popup.classList.add('ativo'), 10);
}

function fecharPopupVisitante() {
    const popup = document.getElementById('popup-visitante');
    if (!popup) return;

    sessionStorage.setItem(CHAVE_POPUP_VISITANTE_VISTO, 'true');
    popup.classList.remove('ativo');
    document.body.classList.remove('popup-visitante-aberto');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 260);
}

function mostrarSobreNos() {
    // Mostra o texto de "Sobre Nós" e rola a tela até ele.
    const main = document.querySelector('main');
    if (!main) return;

    // Remove conteúdo anterior de visitante se existir
    removerConteudosVisitanteAbertos();

    const section = document.createElement('section');
    section.className = 'visitante-conteudo';
    section.innerHTML = `
        <h2>Sobre Nós - Jeová Nissi</h2>
        <p>Jeová Nissi significa "Deus é a nossa bandeira". Somos um ministério de louvor dedicado a glorificar a Deus através da música e adoração.</p>
        <p>No nosso Instagram (@jeovanissi), você pode acompanhar nossas histórias, ensaios e momentos especiais de adoração.</p>
        <ul>
            <li><strong>Missão:</strong> Levar pessoas a uma experiência profunda com Deus através do louvor.</li>
            <li><strong>Valores:</strong> Unidade, excelência e coração disponível para servir.</li>
        </ul>
    `;

    main.appendChild(section);
    section.scrollIntoView({ behavior: 'smooth' });
}

function mostrarRepertoriosVisitante() {
    removerConteudosVisitanteAbertos();
    renderizarImplantacoesVisitante('repertorios');
    document.getElementById('repertorios')?.scrollIntoView({ behavior: 'smooth' });
}

function mostrarParticipacaoVisitante() {
    removerConteudosVisitanteAbertos();
    renderizarImplantacoesVisitante('participar');
    document.getElementById('participar')?.scrollIntoView({ behavior: 'smooth' });
}

function mostrarEventos() {
    // Mostra uma parte simples com os eventos principais.
    const main = document.querySelector('main');
    if (!main) return;

    removerConteudosVisitanteAbertos();

    const section = document.createElement('section');
    section.className = 'visitante-conteudo';
    section.innerHTML = `
        <h2>Próximos Eventos</h2>
        <p>Fique por dentro dos nossos cultos e eventos especiais. Siga nosso Instagram para atualizações em tempo real!</p>
        <div class="eventos-lista">
            <article>
                <h3>Culto de Domingo</h3>
                <p>Todo domingo às 18h na nossa igreja. Venha adorar conosco!</p>
                <p><em>Confira fotos e stories no Instagram.</em></p>
            </article>
            <article>
                <h3>Ensaio Semanal</h3>
                <p>Quintas-feiras às 20h00. Momento de preparação e comunhão.</p>
                <p><em>Acompanhe os bastidores nos nossos posts.</em></p>
            </article>
            <article>
                <h3>Eventos Especiais</h3>
                <p>Conferências, retiros e celebrações. Sempre anunciamos primeiro no Instagram!</p>
            </article>
        </div>
    `;

    main.appendChild(section);
    section.scrollIntoView({ behavior: 'smooth' });
}

function mostrarContato() {
    // Mostra os contatos para o visitante conseguir falar com a gente.
    const main = document.querySelector('main');
    if (!main) return;

    removerConteudosVisitanteAbertos();

    const section = document.createElement('section');
    section.className = 'visitante-conteudo';
    section.innerHTML = `
        <h2>Entre em Contato</h2>
        <p>Gostaria de fazer parte do nosso ministério? Entre em contato conosco!</p>
        <div class="contato-info">
            <p><strong>Instagram:</strong> <a href="${INSTAGRAM_VISITANTE}" target="_blank">@jeovanissi</a></p>
            <p><strong>Email:</strong> contato@jeovanissi.com</p>
            <p><strong>Local:</strong> Rua Itupu, 22 - São Paulo, SP</p>
        </div>
        <p>Siga nosso Instagram para mensagens diretas e fique por dentro de tudo!</p>
    `;

    main.appendChild(section);
    section.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// MEMBROS DA BANDA
// ============================================================
// Chaves usadas para salvar cópias locais no navegador.
const CHAVE_MEMBROS = 'membrosBanda';
const CHAVE_REPERTORIO = 'repertorio';
const CHAVE_ESCALAS = 'escalasLouvor';

// Variáveis de controle dos modais e do modo de edição.
let _indexMembroAtual = null;
let _modoModalMembro = null;
let _gerenciandoMembros = false;
// Começa como false e vira true quando o Supabase responde.
let API_DISPONIVEL = false;
// Esses avisos evitam ficar abrindo alert repetido para o admin.
let _avisoSupabaseExibido = false;
let _avisoSalvamentoExibido = false;
let _intervaloAtualizacao = null;
let _sincronizacaoAutomaticaEmAndamento = false;
const INTERVALO_ATUALIZACAO_AUTOMATICA = 60000;
// Cache em memória para não precisar ler tudo de novo a cada função.
const CACHE_DADOS = {
    membros: null,
    repertorio: null,
    escalas: null,
};
// Guardo a data da última versão para evitar salvar por cima de alteração de outro admin.
const VERSAO_DADOS = {
    membros: null,
    repertorio: null,
    escalas: null,
};
// Se algum salvamento falhar, marco aqui para tentar de novo depois.
const DADOS_PENDENTES = {
    membros: false,
    repertorio: false,
    escalas: false,
};

function carregarDadosLocais(chave, valorPadrao) {
    // Busca no localStorage e usa um valor padrão se não tiver nada salvo.
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : valorPadrao;
}

function salvarDadosLocais(chave, dados) {
    // Salva uma cópia no navegador para o site não ficar vazio se a internet falhar.
    localStorage.setItem(chave, JSON.stringify(dados));
}

// ============================================================
// INTEGRAÇÃO REMOTA VIA API DO SITE
// ============================================================
// O navegador chama só as rotas /api. A chave e a sessão ficam no servidor.

async function fetchComTimeout(url, options = {}, tempoLimite = 8000) {
    // Coloquei timeout para a tela não ficar esperando para sempre se a internet travar.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), tempoLimite);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }
}

async function montarErroApi(response, acao, recurso) {
    // Tento pegar o texto do erro da API para facilitar quando der problema.
    let detalhe = '';

    try {
        detalhe = await response.text();
    } catch (erro) {
        detalhe = '';
    }

    return new Error(`Falha ao ${acao} ${recurso}: ${response.status}${detalhe ? ` - ${detalhe}` : ''}`);
}

function avisarSupabaseIndisponivel(erro) {
    // Só aparece quando uma falha real chegar até a interface; no modo local eu nem chamo a API.
    if (_avisoSupabaseExibido || perfilUsuario !== 'admin') return;

    _avisoSupabaseExibido = true;
    console.warn('Supabase indisponível, usando cache local:', erro);
    alert('O Supabase ainda não está configurado ou está indisponível. As alterações feitas agora ficam só neste navegador até as tabelas serem criadas no Supabase.');
}

function avisarFalhaSalvamentoRemoto(erro) {
    // Esse alerta aparece quando a leitura funciona, mas salvar no Supabase falhou.
    if (_avisoSalvamentoExibido || perfilUsuario !== 'admin') return;

    _avisoSalvamentoExibido = true;
    console.warn('Não foi possível salvar no Supabase:', erro);
    alert('Não foi possível salvar no Supabase. Entre novamente como admin e tente de novo. Se outro admin alterou os dados ao mesmo tempo, recarregue a página antes de salvar.');
}

async function autenticarUsuario(usuario, senha) {
    // Login passa pela API do site, que cria um cookie HttpOnly seguro.
    let response;

    try {
        response = await fetchComTimeout('/api/auth', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha }),
        }, 15000);
    } catch (erro) {
        throw erro;
    }

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw await montarErroApi(response, 'entrar', 'auth');
    }

    const resultado = await response.json();
    if (!resultado || !resultado.perfil || !resultado.nome) return null;

    return resultado;
}

async function validarSessaoInterna() {
    // Visitante não tem sessão de edição no servidor.
    if (!perfilUsuario || perfilUsuario === 'visitante') return true;
    const response = await fetchComTimeout('/api/auth', {
        credentials: 'include',
        cache: 'no-store',
    });

    if (!response.ok) {
        localStorage.removeItem('perfilUsuario');
        localStorage.removeItem('nomeUsuario');
        window.location.href = '../index.html';
        return false;
    }

    const sessao = await response.json();
    if (!sessao?.autenticado || !sessao.perfil || !sessao.nome) {
        localStorage.removeItem('perfilUsuario');
        localStorage.removeItem('nomeUsuario');
        window.location.href = '../index.html';
        return false;
    }

    if (sessao.perfil !== perfilUsuario || sessao.nome !== nomeUsuario) {
        localStorage.setItem('perfilUsuario', sessao.perfil);
        localStorage.setItem('nomeUsuario', sessao.nome);
        window.location.reload();
        return false;
    }

    return true;
}

async function buscarDadosRemotos(tabela) {
    // Busca o JSON pela API do site, sem expor a chave do Supabase.
    const response = await fetchComTimeout(`/api/${tabela}`, {
        credentials: 'include',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw await montarErroApi(response, 'buscar', tabela);
    }

    const resultado = await response.json();
    if (!resultado || resultado.dados === null || resultado.dados === undefined) return null;
    VERSAO_DADOS[tabela] = resultado.atualizado_em ?? null;
    return resultado.dados;
}

async function enviarDadosRemotos(tabela, dados) {
    // O servidor valida o cookie HttpOnly antes de permitir escrita.
    const response = await fetchComTimeout(`/api/${tabela}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dados,
            atualizado_em: VERSAO_DADOS[tabela],
        }),
    });

    if (!response.ok) {
        throw await montarErroApi(response, 'salvar', tabela);
    }

    const resultado = await response.json();
    if (resultado?.atualizado_em) {
        VERSAO_DADOS[tabela] = resultado.atualizado_em;
    }

    return dados;
}

async function sincronizarDadosRemotos() {
    // Essa função tenta deixar localStorage, cache e Supabase falando a mesma coisa.
    try {
        API_DISPONIVEL = true;

        if (DADOS_PENDENTES.membros && CACHE_DADOS.membros) {
            // Se tinha membro pendente, tento mandar antes de buscar de novo.
            await enviarDadosRemotos('membros', CACHE_DADOS.membros);
            DADOS_PENDENTES.membros = false;
        }

        if (DADOS_PENDENTES.repertorio && CACHE_DADOS.repertorio) {
            // Mesma ideia dos membros, mas para o repertório.
            await enviarDadosRemotos('repertorio', CACHE_DADOS.repertorio);
            DADOS_PENDENTES.repertorio = false;
        }

        if (DADOS_PENDENTES.escalas && CACHE_DADOS.escalas) {
            // Mesma ideia, mas para as escalas.
            await enviarDadosRemotos('escalas', CACHE_DADOS.escalas);
            DADOS_PENDENTES.escalas = false;
        }

        const [membrosRemotos, repertorioRemoto, escalasRemotas] = await Promise.all([
            buscarDadosRemotos('membros'),
            buscarDadosRemotos('repertorio'),
            buscarDadosRemotos('escalas'),
        ]);

        if (membrosRemotos === null) {
            // Se a tabela estiver vazia, começo com os dados locais/padrão.
            CACHE_DADOS.membros = ordenarMembros(carregarDadosLocais(CHAVE_MEMBROS, [...MEMBROS_PADRAO]));
            await enviarDadosRemotos('membros', CACHE_DADOS.membros);
        } else {
            CACHE_DADOS.membros = ordenarMembros(Array.isArray(membrosRemotos) ? membrosRemotos : [...MEMBROS_PADRAO]);
        }

        if (repertorioRemoto === null) {
            CACHE_DADOS.repertorio = carregarDadosLocais(CHAVE_REPERTORIO, {});
            await enviarDadosRemotos('repertorio', CACHE_DADOS.repertorio);
        } else {
            CACHE_DADOS.repertorio = repertorioRemoto ?? {};
        }

        if (escalasRemotas === null) {
            CACHE_DADOS.escalas = carregarDadosLocais(CHAVE_ESCALAS, {});
            await enviarDadosRemotos('escalas', CACHE_DADOS.escalas);
        } else {
            CACHE_DADOS.escalas = escalasRemotas ?? {};
        }

        salvarDadosLocais(CHAVE_MEMBROS, CACHE_DADOS.membros);
        salvarDadosLocais(CHAVE_REPERTORIO, CACHE_DADOS.repertorio ?? {});
        salvarDadosLocais(CHAVE_ESCALAS, CACHE_DADOS.escalas ?? {});
    } catch (erro) {
        // Se o Supabase não responder, o site continua usando os dados do navegador.
        avisarSupabaseIndisponivel(erro);
        API_DISPONIVEL = false;

        if (CACHE_DADOS.membros === null) {
            CACHE_DADOS.membros = ordenarMembros(carregarDadosLocais(CHAVE_MEMBROS, [...MEMBROS_PADRAO]));
        }
        if (CACHE_DADOS.repertorio === null) {
            CACHE_DADOS.repertorio = carregarDadosLocais(CHAVE_REPERTORIO, {});
        }
        if (CACHE_DADOS.escalas === null) {
            CACHE_DADOS.escalas = carregarDadosLocais(CHAVE_ESCALAS, {});
        }
    }
}

function iniciarAtualizacaoAutomatica() {
    if (document.hidden) return;

    // Evita criar mais de um intervalo ao mesmo tempo.
    if (_intervaloAtualizacao) return;

    // Atualiza em uma cadência mais leve para não deixar a navegação pesada.
    _intervaloAtualizacao = setInterval(async () => {
        if (_sincronizacaoAutomaticaEmAndamento) return;

        _sincronizacaoAutomaticaEmAndamento = true;
        try {
            await sincronizarDadosRemotos();
            renderizarMembros();
            renderizarRepertorio();
            renderizarEscalas();
        } catch (erro) {
            console.warn('Falha na atualização automática:', erro);
        } finally {
            _sincronizacaoAutomaticaEmAndamento = false;
        }
    }, INTERVALO_ATUALIZACAO_AUTOMATICA);
}

function pararAtualizacaoAutomatica() {
    if (!_intervaloAtualizacao) return;

    clearInterval(_intervaloAtualizacao);
    _intervaloAtualizacao = null;
}

function configurarAtualizacaoPorVisibilidade() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pararAtualizacaoAutomatica();
            return;
        }

        sincronizarDadosRemotos().then(() => {
            renderizarMembros();
            renderizarRepertorio();
            renderizarEscalas();
        }).catch((erro) => {
            console.warn('Falha ao atualizar ao voltar para a aba:', erro);
        }).finally(() => {
            iniciarAtualizacaoAutomatica();
        });
    });
}

const MEMBROS_PADRAO = [
    // Lista inicial caso ainda não tenha nada salvo no navegador ou no Supabase.
    { nome: 'Aminadabe / Binho', cargo: 'Líder Geral', categoria: 'lider' },
    { nome: 'Patrick', cargo: 'Líder Instrumental', categoria: 'instrumental' },
    { nome: 'Moises', cargo: 'Líder Vocal', categoria: 'vocal' },
    { nome: 'Aelsio', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Douglas', cargo: 'Baterista / Baixista', categoria: 'instrumental' },
    { nome: 'Edilane', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Enzo', cargo: 'Baterista', categoria: 'instrumental' },
    { nome: 'Joao', cargo: 'Instrumental', categoria: 'instrumental' },
    { nome: 'Larrisa', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Miguel', cargo: 'Instrumental', categoria: 'instrumental' },
    { nome: 'Nicole', cargo: 'Vocalista / Mídia', categoria: 'vocal' },
    { nome: 'Vanessa', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Vitoria', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Wagao', cargo: 'Baixista', categoria: 'instrumental' },
    { nome: 'Eliane', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Erika', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Davi', cargo: 'Vocalista', categoria: 'vocal' },
];

// Para trocar depois, edite cada membro e preencha os campos "foto" e "sobre".
// Exemplo no JSON do membro: { nome: 'Enzo', cargo: 'Baterista', foto: '../assets/fotos/enzo.jpg', sobre: 'Texto sobre o Enzo.' }
const FOTO_MEMBRO_PADRAO = '../assets/membro-teste.svg';
const TEXTO_MEMBRO_PADRAO = 'Texto teste sobre este membro do Ministério de Louvor Jeová Nissi. Substitua este conteúdo pelo resumo, testemunho, função ou apresentação que você quiser mostrar aqui.';

function prioridadeLider(cargo) {
    // Uso isso para deixar os líderes aparecendo primeiro na lista.
    const texto = cargo.toLowerCase();
    if (texto.includes('líder geral') || texto.includes('lider geral')) return 1;
    if (texto.includes('líder instrumental') || texto.includes('lider instrumental')) return 2;
    if (texto.includes('líder vocal') || texto.includes('lider vocal')) return 3;
    return 4;
}

function compararMembros(a, b) {
    // Primeiro ordena por cargo de liderança, depois por nome.
    const ordemA = prioridadeLider(a.cargo);
    const ordemB = prioridadeLider(b.cargo);

    if (ordemA !== ordemB) {
        return ordemA - ordemB;
    }

    return a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' });
}

function normalizarTextoBusca(valor) {
    // Remove acentos para comparar cargos digitados de formas diferentes.
    return String(valor || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function nomeEhAminadabeBinho(nome) {
    const texto = normalizarTextoBusca(nome);
    return texto.includes('aminadabe') || texto.includes('binho');
}

function descobrirCategoriaMembro(membro) {
    // Categoria principal usada na ordenação e compatibilidade com dados antigos.
    const cargo = normalizarTextoBusca(membro?.cargo);

    if (
        cargo.includes('baterista') ||
        cargo.includes('baixista') ||
        cargo.includes('baixo') ||
        cargo.includes('tecladista') ||
        cargo.includes('teclado') ||
        cargo.includes('guitarrista') ||
        cargo.includes('guitarra') ||
        cargo.includes('violonista') ||
        cargo.includes('violao') ||
        cargo.includes('instrumental') ||
        cargo.includes('lider instrumental')
    ) {
        return 'instrumental';
    }

    if (cargo.includes('midia') || cargo.includes('media')) {
        return 'midia';
    }

    if (cargo.includes('som') || cargo.includes('audio') || cargo.includes('sonoplasta')) {
        return 'som';
    }

    if (cargo.includes('lider geral')) {
        return 'lider';
    }

    return 'vocal';
}

function membroPodeAtuarNaArea(membro, area) {
    // Um membro pode aparecer em mais de uma área quando o cargo indicar isso.
    const cargo = normalizarTextoBusca(membro?.cargo);
    const categoria = normalizarTextoBusca(membro?.categoria);

    if (area === 'instrumental') {
        return (
            categoria === 'instrumental' ||
            nomeEhAminadabeBinho(membro?.nome) ||
            cargo.includes('instrumental') ||
            cargo.includes('lider instrumental') ||
            cargo.includes('baterista') ||
            cargo.includes('baixista') ||
            cargo.includes('baixo') ||
            cargo.includes('tecladista') ||
            cargo.includes('teclado') ||
            cargo.includes('guitarrista') ||
            cargo.includes('guitarra') ||
            cargo.includes('violonista') ||
            cargo.includes('violao')
        );
    }

    if (area === 'vocal') {
        return (
            categoria === 'vocal' ||
            cargo.includes('vocal') ||
            cargo.includes('vocalista') ||
            cargo.includes('lider vocal')
        );
    }

    if (area === 'midia') {
        return (
            categoria === 'midia' ||
            cargo.includes('midia') ||
            cargo.includes('media')
        );
    }

    if (area === 'som') {
        return (
            categoria === 'som' ||
            nomeEhAminadabeBinho(membro?.nome) ||
            cargo.includes('som') ||
            cargo.includes('audio') ||
            cargo.includes('sonoplasta')
        );
    }

    return true;
}

function ordenarMembros(membros) {
    // Garante que todo membro tenha categoria antes de ordenar.
    const membrosComCategoria = membros.map((membro) => {
        // Recalculo pelo cargo para corrigir membros antigos salvos com categoria errada.
        return { ...membro, categoria: descobrirCategoriaMembro(membro) };
    });

    return membrosComCategoria.sort(compararMembros);
}

function carregarMembros() {
    // Se já carreguei antes, uso o cache para ser mais rápido.
    if (CACHE_DADOS.membros) {
        return CACHE_DADOS.membros;
    }

    // Se não tem cache, pego do navegador ou da lista padrão.
    const membros = carregarDadosLocais(CHAVE_MEMBROS, [...MEMBROS_PADRAO]);

    const membrosComCategoria = membros.map((membro) => {
        // Recalculo pelo cargo para a criação de escalas refletir o cargo atual.
        return { ...membro, categoria: descobrirCategoriaMembro(membro) };
    });

    const membrosOrdenados = membrosComCategoria.sort(compararMembros);
    // Depois de arrumar, guardo no cache.
    CACHE_DADOS.membros = membrosOrdenados;
    return membrosOrdenados;
}

function salvarMembros(membros) {
    // Toda vez que salvo, já deixo ordenado para a tela ficar organizada.
    const membrosOrdenados = ordenarMembros(membros);
    CACHE_DADOS.membros = membrosOrdenados;
    salvarDadosLocais(CHAVE_MEMBROS, membrosOrdenados);

    if (API_DISPONIVEL) {
        // Salvo no Supabase em segundo plano.
        enviarDadosRemotos('membros', membrosOrdenados).catch((erro) => {
            console.warn('Não foi possível sincronizar membros com o Supabase:', erro);
            avisarFalhaSalvamentoRemoto(erro);
            DADOS_PENDENTES.membros = true;
        });
    } else {
        // Se estiver offline, marco como pendente para tentar depois.
        DADOS_PENDENTES.membros = true;
    }
}

function dataRepertorioValida(data) {
    // Aceito somente data no formato dd/mm.
    return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/.test(data);
}

function responsaveisPertencemArea(nome, area) {
    const nomes = normalizarResponsaveisEscala(nome);
    const membros = carregarMembros();

    return nomes.every((responsavel) => {
        const membro = membros.find((item) => item.nome === responsavel);
        return membro ? membroPodeAtuarNaArea(membro, area) : false;
    });
}

function responsavelMidiaValido(nome) {
    // Mídia aceita quem tiver cargo/categoria de mídia.
    return responsaveisPertencemArea(nome, 'midia');
}

function responsavelSomValido(nome) {
    // Som aceita Aminadabe / Binho e membros cadastrados com cargo de som.
    return responsaveisPertencemArea(nome, 'som');
}

function escaparHtml(valor) {
    // Proteção simples para texto digitado não virar HTML na tela.
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normalizarLinkSeguro(link) {
    // Confere se o link é http/https antes de abrir para o usuário.
    const valor = String(link || '').trim();
    if (!valor) return '';

    try {
        const url = new URL(valor, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) return '';
        return url.href;
    } catch (erro) {
        return '';
    }
}

function normalizarResponsaveisEscala(valor) {
    // Deixo os responsáveis sempre em formato de lista.
    if (Array.isArray(valor)) {
        return valor.map((item) => String(item).trim()).filter(Boolean);
    }

    if (!valor) return [];

    return String(valor).split(',').map((item) => item.trim()).filter(Boolean);
}

function formatarResponsaveisEscala(valor, textoVazio = 'Não definido') {
    // Transforma a lista de responsáveis em texto para aparecer no card.
    const responsaveis = normalizarResponsaveisEscala(valor);
    if (responsaveis.length === 0) return textoVazio;
    return responsaveis.map(escaparHtml).join(', ');
}

function obterSelecionadosEscala(id) {
    // Pega todos os nomes selecionados em um campo de escala.
    const select = document.getElementById(id);
    if (!select) return [];

    return Array.from(select.selectedOptions)
        .map((option) => option.value.trim())
        .filter(Boolean);
}

function selecionarResponsaveisEscala(id, valor) {
    // Marca no select os responsáveis que já estavam salvos.
    const select = document.getElementById(id);
    if (!select) return;

    const responsaveis = normalizarResponsaveisEscala(valor);

    responsaveis.forEach((responsavel) => {
        // Se algum nome antigo não existir nas opções, eu adiciono para não perder dado.
        const existe = Array.from(select.options).some((option) => option.value === responsavel);
        if (!existe) {
            const option = document.createElement('option');
            option.value = responsavel;
            option.textContent = responsavel;
            select.appendChild(option);
        }
    });

    Array.from(select.options).forEach((option) => {
        option.selected = responsaveis.includes(option.value);
    });

    atualizarSeletorEscalaDesktop(id);
}

function preencherSelectMembrosEscala(id, area) {
    // Monta os selects da escala usando a lista de membros.
    const select = document.getElementById(id);
    if (!select) return;

    const selecionados = obterSelecionadosEscala(id);
    select.innerHTML = '';

    carregarMembros()
        .filter((membro) => !area || membroPodeAtuarNaArea(membro, area))
        .forEach((membro) => {
            const option = document.createElement('option');
            option.value = membro.nome;
            option.textContent = membro.nome;
            option.selected = selecionados.includes(membro.nome);
            select.appendChild(option);
        });

    atualizarSeletorEscalaDesktop(id);
}

function preencherSeletoresEscala() {
    // Atualiza todos os campos de responsáveis da escala.
    preencherSelectMembrosEscala('input-vocal-escala', 'vocal');
    preencherSelectMembrosEscala('input-instrumental-escala', 'instrumental');
    preencherSelectMembrosEscala('input-midia-escala', 'midia');
    preencherSelectMembrosEscala('input-som-escala', 'som');
}

const idsSeletoresEscalaDesktop = [
    // Esses campos ganham uma interface melhor no desktop.
    'input-vocal-escala',
    'input-instrumental-escala',
    'input-midia-escala',
    'input-som-escala',
];

let seletorEscalaDesktopAberto = null;

function resumoSelecaoEscala(select) {
    // Texto curto que aparece no botão do seletor.
    const selecionados = Array.from(select.selectedOptions).map((option) => option.value.trim()).filter(Boolean);

    if (selecionados.length === 0) return '0 Selecionados';
    if (selecionados.length === 1) return selecionados[0];
    return `${selecionados.length} Selecionados`;
}

function atualizarSeletorEscalaDesktop(id) {
    // Atualiza o texto do botão customizado depois que muda a seleção.
    const select = document.getElementById(id);
    if (!select) return;

    const gatilho = select.parentElement?.querySelector(`[data-select-escala="${id}"]`);
    if (!gatilho) return;

    const texto = gatilho.querySelector('.seletor-escala-desktop-texto');
    if (texto) texto.textContent = resumoSelecaoEscala(select);
}

function fecharSeletorEscalaDesktop() {
    // Fecha a janelinha de seleção do desktop.
    if (!seletorEscalaDesktopAberto) return;

    seletorEscalaDesktopAberto.remove();
    seletorEscalaDesktopAberto = null;
}

function abrirSeletorEscalaDesktop(id) {
    // Abre um painel maior para marcar várias pessoas no desktop.
    const select = document.getElementById(id);
    if (!select) return;

    fecharSeletorEscalaDesktop();

    const folha = document.createElement('div');
    folha.className = 'seletor-escala-desktop';
    folha.setAttribute('role', 'dialog');
    folha.setAttribute('aria-modal', 'true');

    const painel = document.createElement('div');
    painel.className = 'seletor-escala-desktop-painel';

    const topo = document.createElement('div');
    topo.className = 'seletor-escala-desktop-topo';

    const fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.className = 'seletor-escala-desktop-fechar';
    fechar.setAttribute('aria-label', 'Fechar seleção');
    fechar.textContent = '×';
    fechar.addEventListener('click', fecharSeletorEscalaDesktop);

    topo.appendChild(fechar);

    const lista = document.createElement('div');
    lista.className = 'seletor-escala-desktop-lista';

    Array.from(select.options).forEach((option) => {
        // Cada opção vira um botão, porque fica mais fácil clicar.
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'seletor-escala-desktop-opcao';
        item.setAttribute('aria-pressed', String(option.selected));

        const marcador = document.createElement('span');
        marcador.className = 'seletor-escala-desktop-check';

        const nome = document.createElement('span');
        nome.textContent = option.textContent;

        item.appendChild(marcador);
        item.appendChild(nome);

        item.addEventListener('click', () => {
            // Clique alterna selecionado/não selecionado.
            option.selected = !option.selected;
            item.classList.toggle('selecionado', option.selected);
            item.setAttribute('aria-pressed', String(option.selected));
            atualizarSeletorEscalaDesktop(id);
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        if (option.selected) item.classList.add('selecionado');
        lista.appendChild(item);
    });

    painel.appendChild(topo);
    painel.appendChild(lista);
    folha.appendChild(painel);

    folha.addEventListener('pointerdown', (event) => {
        if (event.target === folha) fecharSeletorEscalaDesktop();
    });

    document.body.appendChild(folha);
    seletorEscalaDesktopAberto = folha;
}

function inicializarSeletoresEscalaDesktop() {
    // Só uso esse visual diferente quando a tela é maior.
    const mediaDesktop = window.matchMedia('(min-width: 769px)');
    const alternarClasseDesktop = () => {
        document.body.classList.toggle('escala-desktop-selects', mediaDesktop.matches);
        if (!mediaDesktop.matches) fecharSeletorEscalaDesktop();
    };

    idsSeletoresEscalaDesktop.forEach((id) => {
        // Cria um botão fake ao lado de cada select original.
        const select = document.getElementById(id);
        if (!select || select.dataset.desktopEscala === 'true') return;

        const gatilho = document.createElement('button');
        gatilho.type = 'button';
        gatilho.className = 'seletor-escala-desktop-gatilho';
        gatilho.dataset.selectEscala = id;
        gatilho.setAttribute('aria-haspopup', 'dialog');

        const texto = document.createElement('span');
        texto.className = 'seletor-escala-desktop-texto';

        const mais = document.createElement('span');
        mais.className = 'seletor-escala-desktop-mais';
        mais.setAttribute('aria-hidden', 'true');
        mais.textContent = '...';

        gatilho.appendChild(texto);
        gatilho.appendChild(mais);
        gatilho.addEventListener('click', (event) => {
            event.preventDefault();
            abrirSeletorEscalaDesktop(id);
        });

        select.insertAdjacentElement('afterend', gatilho);
        select.addEventListener('change', () => atualizarSeletorEscalaDesktop(id));
        select.dataset.desktopEscala = 'true';
        atualizarSeletorEscalaDesktop(id);
    });

    alternarClasseDesktop();

    if (typeof mediaDesktop.addEventListener === 'function') {
        mediaDesktop.addEventListener('change', alternarClasseDesktop);
    } else {
        mediaDesktop.addListener(alternarClasseDesktop);
    }
}

function preencherAutocompleteMembros() {
    // Preenche sugestões de nomes nos campos que usam datalist.
    const datalist = document.getElementById('lista-nomes-membros');
    if (!datalist) return;

    datalist.innerHTML = '';

    carregarMembros().forEach((membro) => {
        const option = document.createElement('option');
        option.value = membro.nome;
        datalist.appendChild(option);
    });
}

function renderizarMembros() {
    // Desenha a lista de membros dentro do modal.
    const lista = document.getElementById('lista-membros');
    if (!lista) return;

    const membros = carregarMembros();
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';

    lista.innerHTML = '';

    membros.forEach((membro, index) => {
        // Crio cada item da lista manualmente para evitar HTML quebrado.
        const item = document.createElement('li');
        const dados = document.createElement('span');
        const nome = document.createElement('strong');
        const linkNome = document.createElement('a');
        const cargo = document.createElement('span');

        dados.className = 'dados-membro';
        linkNome.href = '#';
        linkNome.textContent = membro.nome;
        cargo.textContent = `(${membro.cargo})`;
        linkNome.addEventListener('click', (event) => {
            event.preventDefault();
            if (!_gerenciandoMembros) abrirSaibaMaisMembro(index);
        });

        nome.appendChild(linkNome);
        dados.appendChild(nome);
        dados.appendChild(document.createTextNode(' '));
        dados.appendChild(cargo);
        item.appendChild(dados);

        if (!_gerenciandoMembros) {
            const btnSaibaMais = document.createElement('button');
            btnSaibaMais.type = 'button';
            btnSaibaMais.className = 'btn-saiba-membro';
            btnSaibaMais.textContent = `Saiba mais sobre ${membro.nome}`;
            btnSaibaMais.addEventListener('click', () => abrirSaibaMaisMembro(index));
            item.appendChild(btnSaibaMais);
        }

        if (ehAdmin && _gerenciandoMembros) {
            // Em modo gerenciamento, admin ganha botões de editar e excluir.
            const acoes = document.createElement('span');
            acoes.className = 'acoes-membro';

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => editarMembro(index);

            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.onclick = () => excluirMembro(index);

            acoes.appendChild(btnEditar);
            acoes.appendChild(btnExcluir);
            item.appendChild(acoes);
        }

        lista.appendChild(item);
    });
}

function obterDetalhesMembro(membro) {
    return {
        foto: String(membro?.foto || '').trim() || FOTO_MEMBRO_PADRAO,
        sobre: String(membro?.sobre || '').trim() || TEXTO_MEMBRO_PADRAO,
    };
}

function abrirSaibaMaisMembro(index) {
    // Abre uma apresentação simples do membro. Foto e texto vêm dos dados do próprio membro.
    const membros = carregarMembros();
    const membro = membros[index];
    const modal = document.getElementById('modal-saiba-membro');
    const foto = document.getElementById('foto-saiba-membro');
    const cargo = document.getElementById('cargo-saiba-membro');
    const titulo = document.getElementById('titulo-saiba-membro');
    const descricao = document.getElementById('descricao-saiba-membro');

    if (!membro || !modal || !foto || !titulo || !descricao) return;

    const detalhes = obterDetalhesMembro(membro);
    foto.onerror = () => {
        foto.onerror = null;
        foto.src = FOTO_MEMBRO_PADRAO;
    };
    foto.src = detalhes.foto;
    foto.alt = `Foto de ${membro.nome}`;
    if (cargo) cargo.textContent = membro.cargo || 'Ministério de Louvor';
    titulo.textContent = `Saiba mais sobre ${membro.nome}`;
    descricao.textContent = detalhes.sobre;

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
}

function fecharSaibaMaisMembro() {
    const modal = document.getElementById('modal-saiba-membro');
    if (!modal) return;

    modal.classList.remove('ativo');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function editarMembro(index) {
    // Abre o modal já preenchido com os dados do membro escolhido.
    const membros = carregarMembros();
    const membro = membros[index];
    const modal = document.getElementById('modal-editar-membro');
    const titulo = document.getElementById('titulo-modal-membro');
    const inputNome = document.getElementById('input-nome-membro');
    const inputCargo = document.getElementById('input-cargo-membro');
    const inputFoto = document.getElementById('input-foto-membro');
    const inputSobre = document.getElementById('input-sobre-membro');
    const erro = document.getElementById('erro-membro');

    if (!modal || !inputNome || !inputCargo) return;

    _indexMembroAtual = index;
    _modoModalMembro = 'editar';
    if (titulo) titulo.textContent = 'Editar membro';
    inputNome.value = membro.nome;
    inputCargo.value = membro.cargo;
    if (inputFoto) inputFoto.value = membro.foto || '';
    if (inputSobre) inputSobre.value = membro.sobre || '';

    if (erro) erro.textContent = '';

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
    inputNome.focus();
}

function abrirModalAdicionarMembro() {
    // Abre o mesmo modal, mas vazio, para cadastrar alguém novo.
    const modal = document.getElementById('modal-editar-membro');
    const titulo = document.getElementById('titulo-modal-membro');
    const inputNome = document.getElementById('input-nome-membro');
    const inputCargo = document.getElementById('input-cargo-membro');
    const inputFoto = document.getElementById('input-foto-membro');
    const inputSobre = document.getElementById('input-sobre-membro');
    const erro = document.getElementById('erro-membro');

    if (!modal || !inputNome || !inputCargo) return;

    _indexMembroAtual = null;
    _modoModalMembro = 'adicionar';
    if (titulo) titulo.textContent = 'Adicionar membro';
    inputNome.value = '';
    inputCargo.value = '';
    if (inputFoto) inputFoto.value = '';
    if (inputSobre) inputSobre.value = '';
    if (erro) erro.textContent = '';

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
    inputNome.focus();
}

function fecharModalEditarMembro() {
    // Fecha o modal de membro e limpa o controle de edição.
    const modal = document.getElementById('modal-editar-membro');
    const erro = document.getElementById('erro-membro');

    if (!modal) return;

    modal.classList.remove('ativo');
    if (erro) erro.textContent = '';
    _indexMembroAtual = null;
    _modoModalMembro = null;

    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function salvarEdicaoMembro() {
    // Salva tanto edição quanto novo membro, dependendo do modo atual.
    const inputNome = document.getElementById('input-nome-membro');
    const inputCargo = document.getElementById('input-cargo-membro');
    const inputFoto = document.getElementById('input-foto-membro');
    const inputSobre = document.getElementById('input-sobre-membro');
    const erro = document.getElementById('erro-membro');

    if (!_modoModalMembro || !inputNome || !inputCargo) return;

    const novoNome = inputNome.value.trim();
    const novoCargo = inputCargo.value.trim();
    const novaFoto = inputFoto ? inputFoto.value.trim() : '';
    const novoSobre = inputSobre ? inputSobre.value.trim() : '';

    if (!novoNome || !novoCargo) {
        // Não deixo salvar membro sem nome ou cargo.
        if (erro) erro.textContent = 'Preencha o nome e o cargo antes de salvar.';
        return;
    }

    const membros = carregarMembros();

    if (_modoModalMembro === 'editar') {
        // Aqui substituo o membro que já existia.
        const membroAnterior = membros[_indexMembroAtual] || {};
        membros[_indexMembroAtual] = {
            ...membroAnterior,
            nome: novoNome,
            cargo: novoCargo,
            foto: novaFoto,
            sobre: novoSobre,
        };
    } else {
        // Aqui adiciono no final e depois a função de salvar ordena tudo.
        membros.push({
            nome: novoNome,
            cargo: novoCargo,
            foto: novaFoto,
            sobre: novoSobre,
        });
    }

    salvarMembros(membros);
    fecharModalEditarMembro();
    renderizarMembros();
    preencherSeletoresEscala();
}

function excluirMembro(index) {
    // Pergunto antes porque excluir remove da lista de membros.
    const membros = carregarMembros();
    const membro = membros[index];

    if (!confirm(`Excluir ${membro.nome} da lista de membros?`)) return;

    membros.splice(index, 1);
    salvarMembros(membros);
    renderizarMembros();
    preencherSeletoresEscala();
}
 
// ============================================================
// LOGOUT
// ============================================================
function logout() {
    // Limpa os dados salvos da sessão do usuário.
    localStorage.removeItem('perfilUsuario');
    localStorage.removeItem('nomeUsuario');
    fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'include',
    }).catch((erro) => {
        console.warn('Não foi possível encerrar a sessão no servidor:', erro);
    }).finally(() => {
        // Volta para a tela inicial de login.
        window.location.href = '../index.html';
    });
}
 
// ============================================================
// MODAL DE PERFIL (parte do modal que eu já tinha feito antes)
// ============================================================
function abrirPerfil() {
    // Abre o modal de perfil com animação.
    const modal = document.getElementById('perfil');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('ativo');
    }, 10);
}
 
function fecharPerfil() {
    // Fecha o modal de perfil esperando a animação terminar.
    const modal = document.getElementById('perfil');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}
 
function exibirMembros() {
    // Abre o modal só para visualizar os membros.
    const modalMembros = document.getElementById('membros');
    if (!modalMembros) return;

    _gerenciandoMembros = false;
    renderizarMembros();
    alternarBotaoAdicionarMembro();
    modalMembros.style.display = 'flex';
    setTimeout(() => {
        modalMembros.classList.add('ativo');
    }, 10);
}

function gerenciarMembros() {
    // Abre o modal em modo admin, mostrando botões de ação.
    const modalMembros = document.getElementById('membros');
    if (!modalMembros) return;

    _gerenciandoMembros = true;
    renderizarMembros();
    alternarBotaoAdicionarMembro();

    modalMembros.style.display = 'flex';
    setTimeout(() => {
        modalMembros.classList.add('ativo');
    }, 10);
}

function alternarBotaoAdicionarMembro() {
    // O botão de adicionar só aparece para admin e no modo gerenciamento.
    const btnAdicionar = document.querySelector('.btn-add-membro');
    if (!btnAdicionar) return;

    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
    btnAdicionar.style.display = ehAdmin && _gerenciandoMembros ? 'inline-block' : 'none';
}
 
function fecharExibirMembros() {
    // Fecha o modal de membros e sai do modo gerenciamento.
    const modalFecharMembros = document.getElementById('membros');
    if (!modalFecharMembros) return;
    modalFecharMembros.classList.remove('ativo');
    _gerenciandoMembros = false;
    setTimeout(() => {
        modalFecharMembros.style.display = 'none';
    }, 300);
}
 
window.addEventListener('pointerdown', function(event) {
    // Se clicar no fundo do modal de membros, eu fecho ele.
    const modalFecharMembros = document.getElementById('membros');
    if (modalFecharMembros && event.target === modalFecharMembros) {
        fecharExibirMembros();
    }
});
 
window.addEventListener('load', () => {
    // Quando a página carrega, marco o link atual do menu.
    const topnavLinks = document.querySelectorAll('.topnav a');
 
    topnavLinks.forEach((link) => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === window.location.pathname) {
            link.classList.add('active');
        }
 
        link.addEventListener('mousedown', () => {
            topnavLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
 
        link.addEventListener('click', () => {
            topnavLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
    });
 
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        // Mostra o botão de voltar ao topo só depois de rolar a página.
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
 
        backToTopBtn.addEventListener('click', () => {
            // Volta para o topo de forma suave.
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const historicoVoltarBtns = document.querySelectorAll('.historico-voltar');
    const historicoAvancarBtns = document.querySelectorAll('.historico-avancar');

    historicoVoltarBtns.forEach((botao) => {
        // Botões que voltam uma página no histórico do navegador.
        botao.addEventListener('click', () => {
            window.history.back();
        });
    });

    historicoAvancarBtns.forEach((botao) => {
        // Botões que avançam uma página no histórico do navegador.
        botao.addEventListener('click', () => {
            window.history.forward();
        });
    });
});
 
function toggleSenha() {
    // Alterna o campo de senha entre escondido e visível.
    const input = document.getElementById('senha-input');
    input.type = input.type === 'password' ? 'text' : 'password';
}
 
// ============================================================
// REPERTÓRIO — GERENCIAMENTO DE LISTAS POR DATA
// ============================================================
 
let _dataAtual = null;
let _indexAtual = null;
let _dataEscalaAtual = null;

// Nomes dos meses usados nos títulos do repertório.
const NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
 
function carregarRepertorio() {
    // Carrega o repertório do cache ou do localStorage.
    if (CACHE_DADOS.repertorio) {
        return CACHE_DADOS.repertorio;
    }

    const repertorio = carregarDadosLocais(CHAVE_REPERTORIO, {});
    CACHE_DADOS.repertorio = repertorio;
    return repertorio;
}

function salvarRepertorio(repertorio) {
    // Salva localmente primeiro para a tela responder rápido.
    CACHE_DADOS.repertorio = repertorio;
    salvarDadosLocais(CHAVE_REPERTORIO, repertorio);

    if (API_DISPONIVEL) {
        // Depois tenta mandar para o Supabase.
        enviarDadosRemotos('repertorio', repertorio).catch((erro) => {
            console.warn('Não foi possível sincronizar repertório com o Supabase:', erro);
            avisarFalhaSalvamentoRemoto(erro);
            DADOS_PENDENTES.repertorio = true;
        });
    } else {
        DADOS_PENDENTES.repertorio = true;
    }
}

function carregarEscalas() {
    // Carrega escalas do cache ou do localStorage.
    if (CACHE_DADOS.escalas) {
        return CACHE_DADOS.escalas;
    }

    const escalas = carregarDadosLocais(CHAVE_ESCALAS, {});
    CACHE_DADOS.escalas = escalas;
    return escalas;
}

function salvarEscalas(escalas) {
    // Salva escalas localmente e depois tenta sincronizar.
    CACHE_DADOS.escalas = escalas;
    salvarDadosLocais(CHAVE_ESCALAS, escalas);

    if (API_DISPONIVEL) {
        enviarDadosRemotos('escalas', escalas).catch((erro) => {
            console.warn('Não foi possível sincronizar escalas com o Supabase:', erro);
            avisarFalhaSalvamentoRemoto(erro);
            DADOS_PENDENTES.escalas = true;
        });
    } else {
        DADOS_PENDENTES.escalas = true;
    }
}

// Agrupa as datas do repertório por ano e mês
// Cada chave é dd/mm; o ano é inferido como o ano atual
function agruparRepertorioPorAnoMes(repertorio) {
    // Como salvo só dd/mm, uso o ano atual para agrupar na tela.
    const anoAtual = new Date().getFullYear();
    const grupos = {};

    Object.keys(repertorio).forEach((data) => {
        const partes = data.split('/');
        if (partes.length !== 2) return;

        const mes = parseInt(partes[1], 10);
        const ano = anoAtual;
        const chaveAno = String(ano);
        const chaveMes = String(mes);

        if (!grupos[chaveAno]) grupos[chaveAno] = {};
        if (!grupos[chaveAno][chaveMes]) grupos[chaveAno][chaveMes] = [];
        grupos[chaveAno][chaveMes].push(data);
    });

    return grupos;
}
 
// Renderiza o repertório agrupado por ano e mês
function renderizarRepertorio() {
    // Monta toda a tela do repertório com os dados salvos.
    const container = document.getElementById('repertorio-geral');
    if (!container) return;
 
    const repertorio = carregarRepertorio();
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
 
    const btnNovaData = document.getElementById('btn-nova-data');
    if (btnNovaData) {
        // Só admin pode criar nova data.
        btnNovaData.style.display = ehAdmin ? 'inline-block' : 'none';
    }
 
    container.innerHTML = '';
 
    const datas = isVisitante()
        ? ordenarDatasRepertorioVisitante(Object.keys(repertorio)).slice(0, 4)
        : Object.keys(repertorio);
    const repertorioVisivel = datas.reduce((dados, data) => {
        dados[data] = repertorio[data];
        return dados;
    }, {});
 
    if (datas.length === 0) {
        // Mensagem simples quando ainda não tem lista cadastrada.
        container.innerHTML = '<p style="color:#888;">Nenhuma lista cadastrada ainda.</p>';
        return;
    }

    const grupos = agruparRepertorioPorAnoMes(repertorioVisivel);

    // Itera pelos anos em ordem crescente
    Object.keys(grupos).sort().forEach((ano) => {
        // Crio um bloco para cada ano.
        const blocoAno = document.createElement('div');
        blocoAno.className = 'bloco-ano';

        const tituloAno = document.createElement('h3');
        tituloAno.className = 'titulo-ano';
        tituloAno.textContent = `Repertório ${ano}`;
        blocoAno.appendChild(tituloAno);

        const mesesContainer = document.createElement('div');
        mesesContainer.className = 'meses-container';

        // Itera pelos meses em ordem crescente
        Object.keys(grupos[ano]).sort((a, b) => Number(a) - Number(b)).forEach((mes) => {
            // Dentro do ano, separo por mês.
            const blocoMes = document.createElement('div');
            blocoMes.className = 'bloco-mes';

            const tituloMes = document.createElement('h4');
            tituloMes.className = 'titulo-mes';
            tituloMes.textContent = `Mês de ${NOMES_MESES[Number(mes) - 1]}`;
            blocoMes.appendChild(tituloMes);

            // Itera pelas datas desse mês em ordem crescente de dia
            grupos[ano][mes].sort((a, b) => parseInt(a) - parseInt(b)).forEach((data) => {
                // Dentro do mês, mostro cada domingo.
                const musicas = repertorioVisivel[data];

                const bloco = document.createElement('div');
                bloco.className = 'bloco-data';

                const cabecalho = document.createElement('div');
                cabecalho.className = 'cabecalho-data';
                const tituloData = document.createElement('h5');
                tituloData.textContent = `Domingo ${data}`;
                cabecalho.appendChild(tituloData);

                if (ehAdmin) {
                    // Admin pode apagar a lista inteira daquela data.
                    const btnExcluirData = document.createElement('button');
                    btnExcluirData.className = 'btn-excluir-data somente-admin';
                    btnExcluirData.textContent = '🗑 Excluir lista';
                    btnExcluirData.onclick = () => excluirData(data);
                    cabecalho.appendChild(btnExcluirData);
                }

                bloco.appendChild(cabecalho);

                const ul = document.createElement('ul');
                ul.className = 'lista-repertorio';

                musicas.forEach((musica, index) => {
                    // Crio cada música da lista e, se tiver link válido, faço virar link.
                    const li = document.createElement('li');
                    const linkSeguro = normalizarLinkSeguro(musica.link);

                    if (linkSeguro) {
                        const linkMusica = document.createElement('a');
                        linkMusica.href = linkSeguro;
                        linkMusica.target = '_blank';
                        linkMusica.rel = 'noopener';
                        linkMusica.textContent = musica.nome;
                        li.appendChild(linkMusica);
                    } else {
                        li.textContent = musica.nome;
                    }

                    if (ehAdmin) {
                        // Admin pode editar ou excluir música por música.
                        const acoes = document.createElement('span');
                        acoes.className = 'acoes-musica somente-admin';

                        const btnEditar = document.createElement('button');
                        btnEditar.textContent = '✏️';
                        btnEditar.title = 'Editar música';
                        btnEditar.onclick = () => abrirModalEdicao(data, index);

                        const btnExcluir = document.createElement('button');
                        btnExcluir.textContent = '🗑';
                        btnExcluir.title = 'Excluir música';
                        btnExcluir.onclick = () => excluirMusica(data, index);

                        acoes.appendChild(btnEditar);
                        acoes.appendChild(btnExcluir);
                        li.appendChild(acoes);
                    }

                    ul.appendChild(li);
                });

                bloco.appendChild(ul);

                if (ehAdmin) {
                    // Botão para adicionar música dentro dessa data.
                    const btnAdd = document.createElement('button');
                    btnAdd.className = 'btn-add-musica somente-admin';
                    btnAdd.textContent = '+ Adicionar música';
                    btnAdd.onclick = () => abrirModalEdicao(data, null);
                    bloco.appendChild(btnAdd);
                }

                blocoMes.appendChild(bloco);
            });

            mesesContainer.appendChild(blocoMes);
        });

        blocoAno.appendChild(mesesContainer);

        container.appendChild(blocoAno);
    });
}
 
function abrirModalEdicao(data, index) {
    // Abre o modal para editar uma música ou adicionar uma nova naquela data.
    _dataAtual = data;
    _indexAtual = index;
 
    const modal = document.getElementById('modal-edicao');
    const titulo = document.getElementById('modal-titulo');
    const inputNome = document.getElementById('input-nome-musica');
    const inputLink = document.getElementById('input-link-musica');
 
    if (!modal) return;
 
    if (index !== null) {
        // Se veio index, é edição de música existente.
        const repertorio = carregarRepertorio();
        const musica = repertorio[data][index];
        titulo.textContent = 'Editar música';
        inputNome.value = musica.nome;
        inputLink.value = musica.link || '';
    } else {
        // Se não veio index, é cadastro de música nova.
        titulo.textContent = 'Adicionar música';
        inputNome.value = '';
        inputLink.value = '';
    }
 
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
}
 
function fecharModalEdicao() {
    // Fecha o modal de música com a animação.
    const modal = document.getElementById('modal-edicao');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
 
function salvarMusica() {
    // Pega os campos do modal e salva a música na data atual.
    const nome = document.getElementById('input-nome-musica').value.trim();
    const link = document.getElementById('input-link-musica').value.trim();
    const criandoMusica = _indexAtual === null;
 
    if (!nome) {
        // Nome é obrigatório porque sem ele a lista fica sem sentido.
        alert('Digite o nome da música.');
        return;
    }
 
    const repertorio = carregarRepertorio();
 
    if (_indexAtual !== null) {
        // Atualiza a música que já existia.
        repertorio[_dataAtual][_indexAtual] = { nome, link };
    } else {
        // Adiciona a música no final da lista da data.
        repertorio[_dataAtual].push({ nome, link });
    }
 
    salvarRepertorio(repertorio);
    fecharModalEdicao();
    renderizarRepertorio();

    if (criandoMusica && localStorage.getItem('perfilUsuario') === 'admin') {
        // Quando cria música, já levo o admin para criar/ajustar a escala daquela data.
        localStorage.setItem('dataEscalaPendente', _dataAtual);
        window.location.href = './escalas.html';
    }
}
 
function excluirMusica(data, index) {
    // Remove só uma música de uma data específica.
    if (!confirm('Excluir esta música?')) return;
    const repertorio = carregarRepertorio();
    repertorio[data].splice(index, 1);
    salvarRepertorio(repertorio);
    renderizarRepertorio();
}
 
function excluirData(data) {
    // Remove a lista completa daquele domingo.
    if (!confirm(`Excluir a lista do domingo ${data}?`)) return;
    const repertorio = carregarRepertorio();
    delete repertorio[data];
    salvarRepertorio(repertorio);
    renderizarRepertorio();
}
 
function abrirModalNovaData() {
    // Abre o modal para cadastrar um novo domingo no repertório.
    const modal = document.getElementById('modal-nova-data');
    if (!modal) return;
    document.getElementById('input-nova-data').value = '';
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
}
 
function fecharModalNovaData() {
    // Fecha o modal de nova data.
    const modal = document.getElementById('modal-nova-data');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
 
function salvarNovaData() {
    // Cria uma nova data vazia para depois adicionar as músicas.
    const data = document.getElementById('input-nova-data').value.trim();
 
    if (!data) {
        alert('Digite a data do domingo.');
        return;
    }

    if (!dataRepertorioValida(data)) {
        // Padronizo a data para evitar bagunça na ordenação.
        alert('Digite a data no padrão dd/mm. Ex: 05/02.');
        return;
    }
 
    const repertorio = carregarRepertorio();
 
    if (repertorio[data]) {
        // Não deixo duas listas com a mesma data.
        alert('Já existe uma lista para essa data.');
        return;
    }
 
    repertorio[data] = [];
    salvarRepertorio(repertorio);
    fecharModalNovaData();
    renderizarRepertorio();
}

function formatarDataAutomaticamente(event) {
    // Enquanto digita, eu já coloco a barra da data no lugar certo.
    const input = event.target;
    let digits = input.value.replace(/\D/g, '');

    if (digits.length > 4) {
        digits = digits.slice(0, 4);
    }

    if (digits.length <= 2) {
        input.value = digits + (digits.length === 2 ? '/' : '');
    } else {
        input.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
}

// ============================================================
// ESCALAS — GERENCIAMENTO POR DATA
// ============================================================
function renderizarEscalas() {
    // Monta os cards de escala na página de escalas.
    const container = document.getElementById('escalas-geral');
    if (!container) return;

    const escalas = carregarEscalas();
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
    const btnNovaEscala = document.getElementById('btn-nova-escala');

    if (btnNovaEscala) {
        // Só admin pode adicionar escala nova.
        btnNovaEscala.style.display = ehAdmin ? 'inline-block' : 'none';
    }

    container.innerHTML = '';

    const datas = Object.keys(escalas);

    if (datas.length === 0) {
        // Mensagem quando ainda não tem nenhuma escala.
        container.innerHTML = '<p class="mensagem-vazia">Nenhuma escala cadastrada ainda.</p>';
        return;
    }

    datas.forEach((data) => {
        // Crio um card para cada domingo cadastrado.
        const escala = escalas[data];
        const card = document.createElement('article');
        card.className = 'card-escala';
        const observacoes = escala.observacoes ? escaparHtml(escala.observacoes) : 'Sem observações';

        card.innerHTML = `
            <div class="cabecalho-escala">
                <h3>Domingo ${escaparHtml(data)}</h3>
            </div>
            <dl>
                <div>
                    <dt>Vocal</dt>
                    <dd>${formatarResponsaveisEscala(escala.vocal)}</dd>
                </div>
                <div>
                    <dt>Instrumental</dt>
                    <dd>${formatarResponsaveisEscala(escala.instrumental)}</dd>
                </div>
                <div>
                    <dt>Mídia</dt>
                    <dd>${formatarResponsaveisEscala(escala.midia)}</dd>
                </div>
                <div>
                    <dt>Som</dt>
                    <dd>${formatarResponsaveisEscala(escala.som)}</dd>
                </div>
                <div>
                    <dt>Observações</dt>
                    <dd>${observacoes}</dd>
                </div>
            </dl>
        `;

        if (ehAdmin) {
            // Admin pode editar ou excluir cada escala.
            const acoes = document.createElement('div');
            acoes.className = 'acoes-escala';

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => abrirModalEscala(data);

            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.onclick = () => excluirEscala(data);

            acoes.appendChild(btnEditar);
            acoes.appendChild(btnExcluir);
            card.appendChild(acoes);
        }

        container.appendChild(card);
    });
}

function abrirModalEscala(data = null) {
    // Abre o modal de escala, podendo ser edição ou cadastro novo.
    const modal = document.getElementById('modal-escala');
    const titulo = document.getElementById('modal-escala-titulo');
    const inputData = document.getElementById('input-data-escala');
    const inputObservacoes = document.getElementById('input-observacoes-escala');

    if (!modal) return;

    const escalas = carregarEscalas();
    _dataEscalaAtual = data;
    preencherSeletoresEscala();

    if (data && escalas[data]) {
        // Se já existe escala para a data, preencho o modal com os dados salvos.
        const escala = escalas[data];
        titulo.textContent = 'Editar escala';
        inputData.value = data;
        selecionarResponsaveisEscala('input-vocal-escala', escala.vocal);
        selecionarResponsaveisEscala('input-instrumental-escala', escala.instrumental);
        selecionarResponsaveisEscala('input-midia-escala', escala.midia);
        selecionarResponsaveisEscala('input-som-escala', escala.som);
        inputObservacoes.value = escala.observacoes || '';
    } else {
        // Se não existe, deixo tudo limpo para cadastrar.
        titulo.textContent = 'Adicionar escala';
        inputData.value = data || '';
        selecionarResponsaveisEscala('input-vocal-escala', []);
        selecionarResponsaveisEscala('input-instrumental-escala', []);
        selecionarResponsaveisEscala('input-midia-escala', []);
        selecionarResponsaveisEscala('input-som-escala', []);
        inputObservacoes.value = '';
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
    inputData.focus();
}

function fecharModalEscala() {
    // Fecha o modal de escala e limpa a data em edição.
    const modal = document.getElementById('modal-escala');
    if (!modal) return;

    modal.classList.remove('ativo');
    _dataEscalaAtual = null;

    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function salvarEscala() {
    // Pega todos os campos do modal e salva a escala.
    const data = document.getElementById('input-data-escala').value.trim();
    const vocal = obterSelecionadosEscala('input-vocal-escala');
    const instrumental = obterSelecionadosEscala('input-instrumental-escala');
    const midia = obterSelecionadosEscala('input-midia-escala');
    const som = obterSelecionadosEscala('input-som-escala');
    const observacoes = document.getElementById('input-observacoes-escala').value.trim();

    if (!data) {
        // Não salvo escala sem data.
        alert('Digite a data da escala.');
        return;
    }

    if (midia.length > 0 && !responsavelMidiaValido(midia)) {
        // Validação para manter mídia com quem tem esse cargo cadastrado.
        alert('Mídia só pode ser preenchida com membros cadastrados com cargo de mídia.');
        return;
    }

    if (som.length > 0 && !responsavelSomValido(som)) {
        // Validação para manter som com Aminadabe / Binho ou quem tiver cargo de som.
        alert('Som só pode ser preenchido com Aminadabe / Binho ou membros cadastrados com cargo de som.');
        return;
    }

    const escalas = carregarEscalas();

    if (_dataEscalaAtual && _dataEscalaAtual !== data) {
        // Se editou a data, removo a chave antiga para não duplicar.
        delete escalas[_dataEscalaAtual];
    }

    escalas[data] = { vocal, instrumental, midia, som, observacoes };
    salvarEscalas(escalas);
    fecharModalEscala();
    renderizarEscalas();
}

function excluirEscala(data) {
    // Exclui a escala inteira de uma data.
    if (!confirm(`Excluir a escala do domingo ${data}?`)) return;

    const escalas = carregarEscalas();
    delete escalas[data];
    salvarEscalas(escalas);
    renderizarEscalas();
}

function abrirEscalaPendente() {
    // Quando vem do repertório depois de criar música, já abre a escala da mesma data.
    const container = document.getElementById('escalas-geral');
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
    const dataPendente = localStorage.getItem('dataEscalaPendente');

    if (!container || !ehAdmin || !dataPendente) return;

    localStorage.removeItem('dataEscalaPendente');
    abrirModalEscala(dataPendente);
}
 
window.addEventListener('pointerdown', function(event) {
    // Fecha modais quando clico no fundo escuro deles.
    const modalEdicao = document.getElementById('modal-edicao');
    if (modalEdicao && event.target === modalEdicao) fecharModalEdicao();
 
    const modalNovaData = document.getElementById('modal-nova-data');
    if (modalNovaData && event.target === modalNovaData) fecharModalNovaData();

    const modalEditarMembro = document.getElementById('modal-editar-membro');
    if (modalEditarMembro && event.target === modalEditarMembro) fecharModalEditarMembro();

    const modalSaibaMembro = document.getElementById('modal-saiba-membro');
    if (modalSaibaMembro && event.target === modalSaibaMembro) fecharSaibaMaisMembro();

    const modalEscala = document.getElementById('modal-escala');
    if (modalEscala && event.target === modalEscala) fecharModalEscala();

    const popupVisitante = document.getElementById('popup-visitante');
    if (popupVisitante && event.target === popupVisitante) fecharPopupVisitante();

    const avisoLogin = document.getElementById('login-aviso-modal');
    if (avisoLogin && event.target === avisoLogin) fecharAvisoLogin();
});

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        fecharPopupVisitante();
        fecharAvisoLogin();
    }
});
 
function inicializarInterface() {
    // Função principal para desenhar tudo que existir na página atual.
    renderizarMembros();
    alternarBotaoAdicionarMembro();
    preencherAutocompleteMembros();
    inicializarSeletoresEscalaDesktop();
    preencherSeletoresEscala();
    renderizarRepertorio();
    renderizarEscalas();
    abrirEscalaPendente();
    configurarAcessoPorPerfil();

    const inputNovaData = document.getElementById('input-nova-data');
    if (inputNovaData) {
        // Ativa a máscara automática dd/mm no campo de nova data.
        inputNovaData.addEventListener('input', formatarDataAutomaticamente);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (loginBtn) return;

    const sessaoValida = await validarSessaoInterna().catch((erro) => {
        console.warn('Não foi possível validar a sessão:', erro);
        return false;
    });
    if (!sessaoValida) return;

    // Primeiro eu carrego o que já tem localmente para a tela aparecer rápido.
    inicializarInterface();
    configurarAtualizacaoPorVisibilidade();

    sincronizarDadosRemotos().then(() => {
        // Depois que o Supabase responde, redesenho com os dados mais novos.
        renderizarMembros();
        preencherAutocompleteMembros();
        preencherSeletoresEscala();
        renderizarRepertorio();
        renderizarEscalas();
        renderizarImplantacoesVisitante();
    }).finally(() => {
        // No final, deixo a atualização automática ligada.
        iniciarAtualizacaoAutomatica();
    });
});

window.addEventListener('storage', (event) => {
    // Se outra aba mudar o localStorage, essa aba atualiza a tela também.
    if (!event.key) return;

    if (event.key === CHAVE_MEMBROS) {
        // Recarrega membros quando outra aba alterar.
        CACHE_DADOS.membros = null;
        renderizarMembros();
        preencherAutocompleteMembros();
        preencherSeletoresEscala();
    }

    if (event.key === CHAVE_REPERTORIO) {
        // Recarrega repertório quando outra aba alterar.
        CACHE_DADOS.repertorio = null;
        renderizarRepertorio();
        renderizarImplantacoesVisitante();
    }

    if (event.key === CHAVE_ESCALAS) {
        // Recarrega escalas quando outra aba alterar.
        CACHE_DADOS.escalas = null;
        renderizarEscalas();
    }
});
