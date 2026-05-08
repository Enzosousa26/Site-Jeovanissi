// Ele faz ações acontecerem, como abrir modal e marcar o link ativo.
 
// ============================================================
// SISTEMA DE USUÁRIOS
// ============================================================
// Lista simples de usuários permitidos para acessar o site.
const usuarios = [
    { usuario: 'Aminadabe.santos', senha: '251010', perfil: 'admin', nome: 'Aminadabe' },
    { usuario: 'Patrick.prudente',   senha: '251010',   perfil: 'admin', nome: 'Patrick'   },
    { usuario: 'Moises.souza',    senha: '251010',   perfil: 'admin', nome: 'Moises'    },
    { usuario: 'Enzo.santos',      senha: '2510',   perfil: 'membro', nome: 'Enzo'      },
    { usuario: 'Alesio.ribeiro',    senha: '2511',   perfil: 'membro', nome: 'Alesio'    },
    { usuario: 'Douglas.batista',   senha: '2512',   perfil: 'membro', nome: 'Douglas'   },
    { usuario: 'Davi.ricardo',   senha: '2513',   perfil: 'membro', nome: 'Davi'      },
    { usuario: 'Edilane.santos',   senha: '2514',   perfil: 'membro', nome: 'Edilane'   },
    { usuario: 'Joao.pinheiro',      senha: '2515',   perfil: 'membro', nome: 'Joao'      },
    { usuario: 'Larrisa.brenda',   senha: '2516',   perfil: 'membro', nome: 'Larrisa'   },
    { usuario: 'Miguel.pinheiro',    senha: '2517',   perfil: 'membro', nome: 'Miguel'    },
    { usuario: 'Nicole.cruz',    senha: '2518',   perfil: 'membro', nome: 'Nicole'    },
    { usuario: 'Vanessa.rodrigues',   senha: '2519',   perfil: 'membro', nome: 'Vanessa'   },
    { usuario: 'Vitoria.moreira',   senha: '2520',   perfil: 'membro', nome: 'Vitoria'   },
    { usuario: 'Wagao.barcelos',     senha: '2521',   perfil: 'membro', nome: 'Wagao'     },
    { usuario: 'Eliane.oliveira',    senha: '2522',   perfil: 'membro', nome: 'Eliane'    },
    { usuario: 'Erika.gonçalves',     senha: '2523',   perfil: 'membro', nome: 'Erika'     },
    { usuario: 'Visitante',        senha: '1234',   perfil: 'visitante', nome: 'Visitante' },
];
 
// Funcionalidade do botão de login
const loginBtn = document.getElementById('login-btn');
 
function exibirTextoDeUsuarioAdm(tag, texto){
    // Escreve um texto em uma tag quando o usuário é administrador.
    let campo = document.querySelector(tag);
    campo.innerHTML = texto;
}
function exibirTextoDeUsuarioMembro(tag, texto){
    // Escreve um texto em uma tag quando o usuário é membro comum.
    let campoUm = document.querySelector(tag);
    campoUm.innerHTML = texto;
}
 
if (loginBtn) {
    // Só ativa o login quando o botão existe na página atual.
    loginBtn.addEventListener('click', () => {
        // Lê os inputs no momento do clique
        let usuario = document.querySelector('input[type="text"]').value;
        let senha = document.getElementById('senha-input').value;
 
        // Procura o usuário na lista
        const encontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);
 
        if (encontrado) {
            // Salva o perfil e nome no localStorage para usar nas outras páginas
            localStorage.setItem('perfilUsuario', encontrado.perfil);
            localStorage.setItem('nomeUsuario', encontrado.nome);
 
            // Espera a animação terminar antes de redirecionar
            document.body.style.animation = 'fadeOutDown 0.5s ease forwards';
            setTimeout(() => {
                window.location.href = './movimentações/home.html';
            }, 500);
 
            window.location.href = './movimentações/home.html';
 
            if (encontrado.perfil === 'admin') {
                exibirTextoDeUsuarioAdm();
            } else {
                exibirTextoDeUsuarioMembro();
            }
        } else {
            // Avisa quando o usuário ou a senha não foram encontrados.
            alert('ERRO! Usuario invalido, tente novamente!');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            loginBtn.click();
        }
    });
}
 
// ============================================================
// LEITURA DO PERFIL NAS PÁGINAS INTERNAS
// (Esse bloco roda em home.html e nas outras páginas internas)
// ============================================================
const perfilUsuario = localStorage.getItem('perfilUsuario');
const nomeUsuario   = localStorage.getItem('nomeUsuario');
 
// Se não estiver logado e não for a página de login, redireciona
if (!perfilUsuario && !document.getElementById('login-btn')) {
    window.location.href = '../index.html';
}
 
// Exibe o nome no modal de perfil
const tagNome = document.querySelector('.nome-usuario');
if (tagNome && nomeUsuario) {
    tagNome.innerHTML = nomeUsuario;
}
 
// Esconde elementos exclusivos de admin para membros comuns
if (perfilUsuario !== 'admin') {
    document.querySelectorAll('.somente-admin').forEach(el => {
        el.style.display = 'none';
    });
}
 
// ============================================================
// FUNÇÕES DE VERIFICAÇÃO DE PERFIL (suas funções originais)
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
    const perfilFormatado = perfilUsuario === 'admin' ? 'Admin' : perfilUsuario === 'visitante' ? 'Visitante' : 'Membro';
    tagPerfil.innerHTML = nomeUsuario ? `Perfil: ${perfilFormatado} | ${nomeUsuario}` : `Perfil: ${perfilFormatado}`;
}

const INSTAGRAM_VISITANTE = 'https://instagram.com/jeovanissi'; // Atualize com o perfil real quando quiser.

function isVisitante() {
    return perfilUsuario === 'visitante';
}

function configurarAcessoPorPerfil() {
    if (perfilUsuario === 'admin') {
        return;
    }

    document.querySelectorAll('.somente-admin').forEach(el => {
        el.style.display = 'none';
    });

    if (isVisitante()) {
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
    const topnav = document.querySelector('.topnav');
    if (!topnav) return;

    // Limpa o menu atual
    topnav.innerHTML = '';

    // Adiciona novos links interessantes para visitantes
    const links = [
        { href: '#sobre-nos', text: 'Sobre Nós', onclick: 'mostrarSobreNos()' },
        { href: '#eventos', text: 'Eventos', onclick: 'mostrarEventos()' },
        { href: '#contato', text: 'Contato', onclick: 'mostrarContato()' },
        { href: INSTAGRAM_VISITANTE, text: 'Instagram', target: '_blank' }
    ];

    links.forEach(linkData => {
        const link = document.createElement('a');
        link.href = linkData.href;
        link.textContent = linkData.text;
        if (linkData.onclick) link.setAttribute('onclick', linkData.onclick);
        if (linkData.target) link.target = linkData.target;
        topnav.appendChild(link);
    });
}

function mostrarConteudoVisitante() {
    const main = document.querySelector('main');
    if (!main) return;

    const jaExiste = document.querySelector('.visitante-card');
    if (jaExiste) return;

    const section = document.createElement('section');
    section.className = 'visitante-card somente-visitante';
    section.innerHTML = `
        <div class="visitante-card-conteudo">
            <h3>Bem-vindo, visitante!</h3>
            <p>Estas são informações especiais pensadas para quem está conhecendo nosso ministério.</p>
            <ul>
                <li>Veja repertórios recentes e conheça nossas músicas.</li>
                <li>Confira as escalas e nosso próximo culto.</li>
                <li>Saiba como participar e acompanhar nosso trabalho.</li>
            </ul>
        </div>
    `;

    main.prepend(section);
}

function mostrarSobreNos() {
    const main = document.querySelector('main');
    if (!main) return;

    // Remove conteúdo anterior de visitante se existir
    document.querySelectorAll('.visitante-conteudo').forEach(el => el.remove());

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

function mostrarEventos() {
    const main = document.querySelector('main');
    if (!main) return;

    document.querySelectorAll('.visitante-conteudo').forEach(el => el.remove());

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
    const main = document.querySelector('main');
    if (!main) return;

    document.querySelectorAll('.visitante-conteudo').forEach(el => el.remove());

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
const CHAVE_MEMBROS = 'membrosBanda';
const CHAVE_REPERTORIO = 'repertorio';
const CHAVE_ESCALAS = 'escalasLouvor';
const API_ROOT = '/api';

let _indexMembroAtual = null;
let _modoModalMembro = null;
let _gerenciandoMembros = false;
let API_DISPONIVEL = false;
const CACHE_DADOS = {
    membros: null,
    repertorio: null,
    escalas: null,
};
const DADOS_PENDENTES = {
    membros: false,
    repertorio: false,
    escalas: false,
};

function carregarDadosLocais(chave, valorPadrao) {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : valorPadrao;
}

function salvarDadosLocais(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

async function buscarDadosRemotos(chave) {
    const response = await fetch(`${API_ROOT}/${chave}`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Falha ao buscar ${chave}: ${response.status}`);
    }

    return response.json();
}

async function enviarDadosRemotos(chave, dados) {
    const response = await fetch(`${API_ROOT}/${chave}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    if (!response.ok) {
        throw new Error(`Falha ao salvar ${chave}: ${response.status}`);
    }

    return response.json();
}

async function sincronizarDadosRemotos() {
    try {
        API_DISPONIVEL = true;

        if (DADOS_PENDENTES.membros && CACHE_DADOS.membros) {
            await enviarDadosRemotos('membros', CACHE_DADOS.membros);
            DADOS_PENDENTES.membros = false;
        }

        const membrosRemotos = await buscarDadosRemotos('membros');
        CACHE_DADOS.membros = ordenarMembros(membrosRemotos ?? [...MEMBROS_PADRAO]);

        if (DADOS_PENDENTES.repertorio && CACHE_DADOS.repertorio) {
            await enviarDadosRemotos('repertorio', CACHE_DADOS.repertorio);
            DADOS_PENDENTES.repertorio = false;
        }
        CACHE_DADOS.repertorio = await buscarDadosRemotos('repertorio');

        if (DADOS_PENDENTES.escalas && CACHE_DADOS.escalas) {
            await enviarDadosRemotos('escalas', CACHE_DADOS.escalas);
            DADOS_PENDENTES.escalas = false;
        }
        CACHE_DADOS.escalas = await buscarDadosRemotos('escalas');

        salvarDadosLocais(CHAVE_MEMBROS, CACHE_DADOS.membros);
        salvarDadosLocais(CHAVE_REPERTORIO, CACHE_DADOS.repertorio ?? {});
        salvarDadosLocais(CHAVE_ESCALAS, CACHE_DADOS.escalas ?? {});
    } catch (erro) {
        console.warn('Servidor de dados remotos indisponível, usando cache local:', erro);
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
    setInterval(async () => {
        await sincronizarDadosRemotos();
        renderizarMembros();
        renderizarRepertorio();
        renderizarEscalas();
    }, 10000);
}

const MEMBROS_PADRAO = [
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

function prioridadeLider(cargo) {
    const texto = cargo.toLowerCase();
    if (texto.includes('líder geral') || texto.includes('lider geral')) return 1;
    if (texto.includes('líder instrumental') || texto.includes('lider instrumental')) return 2;
    if (texto.includes('líder vocal') || texto.includes('lider vocal')) return 3;
    return 4;
}

function compararMembros(a, b) {
    const ordemA = prioridadeLider(a.cargo);
    const ordemB = prioridadeLider(b.cargo);

    if (ordemA !== ordemB) {
        return ordemA - ordemB;
    }

    return a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' });
}

function ordenarMembros(membros) {
    const membrosComCategoria = membros.map((membro) => {
        if (membro.categoria) return membro;

        const cargo = membro.cargo.toLowerCase();
        let categoria = 'vocal';

        if (
            cargo.includes('baterista') ||
            cargo.includes('baixista') ||
            cargo.includes('instrumental') ||
            cargo.includes('líder instrumental') ||
            cargo.includes('lider instrumental')
        ) {
            categoria = 'instrumental';
        } else if (
            cargo.includes('líder geral') ||
            cargo.includes('lider geral')
        ) {
            categoria = 'lider';
        }

        return { ...membro, categoria };
    });

    return membrosComCategoria.sort(compararMembros);
}

function carregarMembros() {
    if (CACHE_DADOS.membros) {
        return CACHE_DADOS.membros;
    }

    const membros = carregarDadosLocais(CHAVE_MEMBROS, [...MEMBROS_PADRAO]);

    const membrosComCategoria = membros.map((membro) => {
        if (membro.categoria) return membro;

        const cargo = membro.cargo.toLowerCase();
        let categoria = 'vocal';

        if (
            cargo.includes('baterista') ||
            cargo.includes('baixista') ||
            cargo.includes('instrumental') ||
            cargo.includes('líder instrumental') ||
            cargo.includes('lider instrumental')
        ) {
            categoria = 'instrumental';
        } else if (
            cargo.includes('líder geral') ||
            cargo.includes('lider geral')
        ) {
            categoria = 'lider';
        }

        return { ...membro, categoria };
    });

    const membrosOrdenados = membrosComCategoria.sort(compararMembros);
    CACHE_DADOS.membros = membrosOrdenados;
    return membrosOrdenados;
}

function salvarMembros(membros) {
    const membrosOrdenados = ordenarMembros(membros);
    CACHE_DADOS.membros = membrosOrdenados;
    salvarDadosLocais(CHAVE_MEMBROS, membrosOrdenados);

    if (API_DISPONIVEL) {
        enviarDadosRemotos('membros', membrosOrdenados).catch((erro) => {
            console.warn('Não foi possível sincronizar membros com o servidor remoto:', erro);
            DADOS_PENDENTES.membros = true;
        });
    } else {
        DADOS_PENDENTES.membros = true;
    }
}

function dataRepertorioValida(data) {
    return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/.test(data);
}

function responsavelMidiaValido(nome) {
    const permitidos = ['Nicole'];
    const nomes = normalizarResponsaveisEscala(nome);
    return nomes.every((responsavel) => permitidos.includes(responsavel));
}

function responsavelSomValido(nome) {
    const permitidos = ['Aminadabe / Binho'];
    const nomes = normalizarResponsaveisEscala(nome);
    return nomes.every((responsavel) => permitidos.includes(responsavel));
}

function escaparHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normalizarResponsaveisEscala(valor) {
    if (Array.isArray(valor)) {
        return valor.map((item) => String(item).trim()).filter(Boolean);
    }

    if (!valor) return [];

    return String(valor).split(',').map((item) => item.trim()).filter(Boolean);
}

function formatarResponsaveisEscala(valor, textoVazio = 'Não definido') {
    const responsaveis = normalizarResponsaveisEscala(valor);
    if (responsaveis.length === 0) return textoVazio;
    return responsaveis.map(escaparHtml).join(', ');
}

function obterSelecionadosEscala(id) {
    const select = document.getElementById(id);
    if (!select) return [];

    return Array.from(select.selectedOptions)
        .map((option) => option.value.trim())
        .filter(Boolean);
}

function selecionarResponsaveisEscala(id, valor) {
    const select = document.getElementById(id);
    if (!select) return;

    const responsaveis = normalizarResponsaveisEscala(valor);

    responsaveis.forEach((responsavel) => {
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

function preencherSelectMembrosEscala(id, categoria) {
    const select = document.getElementById(id);
    if (!select) return;

    const selecionados = obterSelecionadosEscala(id);
    select.innerHTML = '';

    carregarMembros()
        .filter((membro) => !categoria || membro.categoria === categoria)
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
    preencherSelectMembrosEscala('input-vocal-escala', 'vocal');
    preencherSelectMembrosEscala('input-instrumental-escala', 'instrumental');
    atualizarSeletorEscalaDesktop('input-midia-escala');
    atualizarSeletorEscalaDesktop('input-som-escala');
}

const idsSeletoresEscalaDesktop = [
    'input-vocal-escala',
    'input-instrumental-escala',
    'input-midia-escala',
    'input-som-escala',
];

let seletorEscalaDesktopAberto = null;

function resumoSelecaoEscala(select) {
    const selecionados = Array.from(select.selectedOptions).map((option) => option.value.trim()).filter(Boolean);

    if (selecionados.length === 0) return '0 Selecionados';
    if (selecionados.length === 1) return selecionados[0];
    return `${selecionados.length} Selecionados`;
}

function atualizarSeletorEscalaDesktop(id) {
    const select = document.getElementById(id);
    if (!select) return;

    const gatilho = select.parentElement?.querySelector(`[data-select-escala="${id}"]`);
    if (!gatilho) return;

    const texto = gatilho.querySelector('.seletor-escala-desktop-texto');
    if (texto) texto.textContent = resumoSelecaoEscala(select);
}

function fecharSeletorEscalaDesktop() {
    if (!seletorEscalaDesktopAberto) return;

    seletorEscalaDesktopAberto.remove();
    seletorEscalaDesktopAberto = null;
}

function abrirSeletorEscalaDesktop(id) {
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
    const mediaDesktop = window.matchMedia('(min-width: 769px)');
    const alternarClasseDesktop = () => {
        document.body.classList.toggle('escala-desktop-selects', mediaDesktop.matches);
        if (!mediaDesktop.matches) fecharSeletorEscalaDesktop();
    };

    idsSeletoresEscalaDesktop.forEach((id) => {
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
    const lista = document.getElementById('lista-membros');
    if (!lista) return;

    const membros = carregarMembros();
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';

    lista.innerHTML = '';

    membros.forEach((membro, index) => {
        const item = document.createElement('li');
        const dados = document.createElement('span');
        const nome = document.createElement('strong');
        const linkNome = document.createElement('a');
        const cargo = document.createElement('span');

        dados.className = 'dados-membro';
        linkNome.href = '#';
        linkNome.textContent = membro.nome;
        cargo.textContent = `(${membro.cargo})`;

        nome.appendChild(linkNome);
        dados.appendChild(nome);
        dados.appendChild(document.createTextNode(' '));
        dados.appendChild(cargo);
        item.appendChild(dados);

        if (ehAdmin && _gerenciandoMembros) {
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

function editarMembro(index) {
    const membros = carregarMembros();
    const membro = membros[index];
    const modal = document.getElementById('modal-editar-membro');
    const titulo = document.getElementById('titulo-modal-membro');
    const inputNome = document.getElementById('input-nome-membro');
    const inputCargo = document.getElementById('input-cargo-membro');
    const erro = document.getElementById('erro-membro');

    if (!modal || !inputNome || !inputCargo) return;

    _indexMembroAtual = index;
    _modoModalMembro = 'editar';
    if (titulo) titulo.textContent = 'Editar membro';
    inputNome.value = membro.nome;
    inputCargo.value = membro.cargo;

    if (erro) erro.textContent = '';

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
    inputNome.focus();
}

function abrirModalAdicionarMembro() {
    const modal = document.getElementById('modal-editar-membro');
    const titulo = document.getElementById('titulo-modal-membro');
    const inputNome = document.getElementById('input-nome-membro');
    const inputCargo = document.getElementById('input-cargo-membro');
    const erro = document.getElementById('erro-membro');

    if (!modal || !inputNome || !inputCargo) return;

    _indexMembroAtual = null;
    _modoModalMembro = 'adicionar';
    if (titulo) titulo.textContent = 'Adicionar membro';
    inputNome.value = '';
    inputCargo.value = '';
    if (erro) erro.textContent = '';

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
    inputNome.focus();
}

function fecharModalEditarMembro() {
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
    const inputNome = document.getElementById('input-nome-membro');
    const inputCargo = document.getElementById('input-cargo-membro');
    const erro = document.getElementById('erro-membro');

    if (!_modoModalMembro || !inputNome || !inputCargo) return;

    const novoNome = inputNome.value.trim();
    const novoCargo = inputCargo.value.trim();

    if (!novoNome || !novoCargo) {
        if (erro) erro.textContent = 'Preencha o nome e o cargo antes de salvar.';
        return;
    }

    const membros = carregarMembros();

    if (_modoModalMembro === 'editar') {
        membros[_indexMembroAtual] = {
            nome: novoNome,
            cargo: novoCargo,
        };
    } else {
        membros.push({
            nome: novoNome,
            cargo: novoCargo,
        });
    }

    salvarMembros(membros);
    fecharModalEditarMembro();
    renderizarMembros();
    preencherSeletoresEscala();
}

function excluirMembro(index) {
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

    // Volta para a tela inicial de login.
    window.location.href = '../index.html';
}
 
// ============================================================
// MODAL DE PERFIL (seu código original)
// ============================================================
function abrirPerfil() {
    const modal = document.getElementById('perfil');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('ativo');
    }, 10);
}
 
function fecharPerfil() {
    const modal = document.getElementById('perfil');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}
 
function exibirMembros() {
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
    const btnAdicionar = document.querySelector('.btn-add-membro');
    if (!btnAdicionar) return;

    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
    btnAdicionar.style.display = ehAdmin && _gerenciandoMembros ? 'inline-block' : 'none';
}
 
function fecharExibirMembros() {
    const modalFecharMembros = document.getElementById('membros');
    if (!modalFecharMembros) return;
    modalFecharMembros.classList.remove('ativo');
    _gerenciandoMembros = false;
    setTimeout(() => {
        modalFecharMembros.style.display = 'none';
    }, 300);
}
 
window.addEventListener('pointerdown', function(event) {
    const modalFecharMembros = document.getElementById('membros');
    if (modalFecharMembros && event.target === modalFecharMembros) {
        fecharExibirMembros();
    }
});
 
window.addEventListener('load', () => {
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
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
 
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const historicoVoltarBtns = document.querySelectorAll('.historico-voltar');
    const historicoAvancarBtns = document.querySelectorAll('.historico-avancar');

    historicoVoltarBtns.forEach((botao) => {
        botao.addEventListener('click', () => {
            window.history.back();
        });
    });

    historicoAvancarBtns.forEach((botao) => {
        botao.addEventListener('click', () => {
            window.history.forward();
        });
    });
});
 
function toggleSenha() {
    const input = document.getElementById('senha-input');
    input.type = input.type === 'password' ? 'text' : 'password';
}
 
// ============================================================
// REPERTÓRIO — GERENCIAMENTO DE LISTAS POR DATA
// ============================================================
 
let _dataAtual = null;
let _indexAtual = null;
let _dataEscalaAtual = null;

const NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
 
function carregarRepertorio() {
    if (CACHE_DADOS.repertorio) {
        return CACHE_DADOS.repertorio;
    }

    const repertorio = carregarDadosLocais(CHAVE_REPERTORIO, {});
    CACHE_DADOS.repertorio = repertorio;
    return repertorio;
}

function salvarRepertorio(repertorio) {
    CACHE_DADOS.repertorio = repertorio;
    salvarDadosLocais(CHAVE_REPERTORIO, repertorio);

    if (API_DISPONIVEL) {
        enviarDadosRemotos('repertorio', repertorio).catch((erro) => {
            console.warn('Não foi possível sincronizar repertório com o servidor remoto:', erro);
            DADOS_PENDENTES.repertorio = true;
        });
    } else {
        DADOS_PENDENTES.repertorio = true;
    }
}

function carregarEscalas() {
    if (CACHE_DADOS.escalas) {
        return CACHE_DADOS.escalas;
    }

    const escalas = carregarDadosLocais(CHAVE_ESCALAS, {});
    CACHE_DADOS.escalas = escalas;
    return escalas;
}

function salvarEscalas(escalas) {
    CACHE_DADOS.escalas = escalas;
    salvarDadosLocais(CHAVE_ESCALAS, escalas);

    if (API_DISPONIVEL) {
        enviarDadosRemotos('escalas', escalas).catch((erro) => {
            console.warn('Não foi possível sincronizar escalas com o servidor remoto:', erro);
            DADOS_PENDENTES.escalas = true;
        });
    } else {
        DADOS_PENDENTES.escalas = true;
    }
}

// Agrupa as datas do repertório por ano e mês
// Cada chave é dd/mm; o ano é inferido como o ano atual
function agruparRepertorioPorAnoMes(repertorio) {
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
    const container = document.getElementById('repertorio-geral');
    if (!container) return;
 
    const repertorio = carregarRepertorio();
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
 
    const btnNovaData = document.getElementById('btn-nova-data');
    if (btnNovaData) {
        btnNovaData.style.display = ehAdmin ? 'inline-block' : 'none';
    }
 
    container.innerHTML = '';
 
    const datas = Object.keys(repertorio);
 
    if (datas.length === 0) {
        container.innerHTML = '<p style="color:#888;">Nenhuma lista cadastrada ainda.</p>';
        return;
    }

    const grupos = agruparRepertorioPorAnoMes(repertorio);

    // Itera pelos anos em ordem crescente
    Object.keys(grupos).sort().forEach((ano) => {
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
            const blocoMes = document.createElement('div');
            blocoMes.className = 'bloco-mes';

            const tituloMes = document.createElement('h4');
            tituloMes.className = 'titulo-mes';
            tituloMes.textContent = `Mês de ${NOMES_MESES[Number(mes) - 1]}`;
            blocoMes.appendChild(tituloMes);

            // Itera pelas datas desse mês em ordem crescente de dia
            grupos[ano][mes].sort((a, b) => parseInt(a) - parseInt(b)).forEach((data) => {
                const musicas = repertorio[data];

                const bloco = document.createElement('div');
                bloco.className = 'bloco-data';

                const cabecalho = document.createElement('div');
                cabecalho.className = 'cabecalho-data';
                cabecalho.innerHTML = `<h5>Domingo ${data}</h5>`;

                if (ehAdmin) {
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
                    const li = document.createElement('li');

                    if (musica.link) {
                        li.innerHTML = `<a href="${musica.link}" target="_blank" rel="noopener">${musica.nome}</a>`;
                    } else {
                        li.textContent = musica.nome;
                    }

                    if (ehAdmin) {
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
    _dataAtual = data;
    _indexAtual = index;
 
    const modal = document.getElementById('modal-edicao');
    const titulo = document.getElementById('modal-titulo');
    const inputNome = document.getElementById('input-nome-musica');
    const inputLink = document.getElementById('input-link-musica');
 
    if (!modal) return;
 
    if (index !== null) {
        const repertorio = carregarRepertorio();
        const musica = repertorio[data][index];
        titulo.textContent = 'Editar música';
        inputNome.value = musica.nome;
        inputLink.value = musica.link || '';
    } else {
        titulo.textContent = 'Adicionar música';
        inputNome.value = '';
        inputLink.value = '';
    }
 
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
}
 
function fecharModalEdicao() {
    const modal = document.getElementById('modal-edicao');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
 
function salvarMusica() {
    const nome = document.getElementById('input-nome-musica').value.trim();
    const link = document.getElementById('input-link-musica').value.trim();
    const criandoMusica = _indexAtual === null;
 
    if (!nome) {
        alert('Digite o nome da música.');
        return;
    }
 
    const repertorio = carregarRepertorio();
 
    if (_indexAtual !== null) {
        repertorio[_dataAtual][_indexAtual] = { nome, link };
    } else {
        repertorio[_dataAtual].push({ nome, link });
    }
 
    salvarRepertorio(repertorio);
    fecharModalEdicao();
    renderizarRepertorio();

    if (criandoMusica && localStorage.getItem('perfilUsuario') === 'admin') {
        localStorage.setItem('dataEscalaPendente', _dataAtual);
        window.location.href = './escalas.html';
    }
}
 
function excluirMusica(data, index) {
    if (!confirm('Excluir esta música?')) return;
    const repertorio = carregarRepertorio();
    repertorio[data].splice(index, 1);
    salvarRepertorio(repertorio);
    renderizarRepertorio();
}
 
function excluirData(data) {
    if (!confirm(`Excluir a lista do domingo ${data}?`)) return;
    const repertorio = carregarRepertorio();
    delete repertorio[data];
    salvarRepertorio(repertorio);
    renderizarRepertorio();
}
 
function abrirModalNovaData() {
    const modal = document.getElementById('modal-nova-data');
    if (!modal) return;
    document.getElementById('input-nova-data').value = '';
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
}
 
function fecharModalNovaData() {
    const modal = document.getElementById('modal-nova-data');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
 
function salvarNovaData() {
    const data = document.getElementById('input-nova-data').value.trim();
 
    if (!data) {
        alert('Digite a data do domingo.');
        return;
    }

    if (!dataRepertorioValida(data)) {
        alert('Digite a data no padrão dd/mm. Ex: 05/02.');
        return;
    }
 
    const repertorio = carregarRepertorio();
 
    if (repertorio[data]) {
        alert('Já existe uma lista para essa data.');
        return;
    }
 
    repertorio[data] = [];
    salvarRepertorio(repertorio);
    fecharModalNovaData();
    renderizarRepertorio();
}

function formatarDataAutomaticamente(event) {
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
    const container = document.getElementById('escalas-geral');
    if (!container) return;

    const escalas = carregarEscalas();
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
    const btnNovaEscala = document.getElementById('btn-nova-escala');

    if (btnNovaEscala) {
        btnNovaEscala.style.display = ehAdmin ? 'inline-block' : 'none';
    }

    container.innerHTML = '';

    const datas = Object.keys(escalas);

    if (datas.length === 0) {
        container.innerHTML = '<p class="mensagem-vazia">Nenhuma escala cadastrada ainda.</p>';
        return;
    }

    datas.forEach((data) => {
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
    const modal = document.getElementById('modal-escala');
    const titulo = document.getElementById('modal-escala-titulo');
    const inputData = document.getElementById('input-data-escala');
    const inputObservacoes = document.getElementById('input-observacoes-escala');

    if (!modal) return;

    const escalas = carregarEscalas();
    _dataEscalaAtual = data;
    preencherSeletoresEscala();

    if (data && escalas[data]) {
        const escala = escalas[data];
        titulo.textContent = 'Editar escala';
        inputData.value = data;
        selecionarResponsaveisEscala('input-vocal-escala', escala.vocal);
        selecionarResponsaveisEscala('input-instrumental-escala', escala.instrumental);
        selecionarResponsaveisEscala('input-midia-escala', escala.midia);
        selecionarResponsaveisEscala('input-som-escala', escala.som);
        inputObservacoes.value = escala.observacoes || '';
    } else {
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
    const modal = document.getElementById('modal-escala');
    if (!modal) return;

    modal.classList.remove('ativo');
    _dataEscalaAtual = null;

    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function salvarEscala() {
    const data = document.getElementById('input-data-escala').value.trim();
    const vocal = obterSelecionadosEscala('input-vocal-escala');
    const instrumental = obterSelecionadosEscala('input-instrumental-escala');
    const midia = obterSelecionadosEscala('input-midia-escala');
    const som = obterSelecionadosEscala('input-som-escala');
    const observacoes = document.getElementById('input-observacoes-escala').value.trim();

    if (!data) {
        alert('Digite a data da escala.');
        return;
    }

    if (midia.length > 0 && !responsavelMidiaValido(midia)) {
        alert('Mídia só pode ser preenchida com Nicole.');
        return;
    }

    if (som.length > 0 && !responsavelSomValido(som)) {
        alert('Som só pode ser preenchido com Aminadabe / Binho.');
        return;
    }

    const escalas = carregarEscalas();

    if (_dataEscalaAtual && _dataEscalaAtual !== data) {
        delete escalas[_dataEscalaAtual];
    }

    escalas[data] = { vocal, instrumental, midia, som, observacoes };
    salvarEscalas(escalas);
    fecharModalEscala();
    renderizarEscalas();
}

function excluirEscala(data) {
    if (!confirm(`Excluir a escala do domingo ${data}?`)) return;

    const escalas = carregarEscalas();
    delete escalas[data];
    salvarEscalas(escalas);
    renderizarEscalas();
}

function abrirEscalaPendente() {
    const container = document.getElementById('escalas-geral');
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
    const dataPendente = localStorage.getItem('dataEscalaPendente');

    if (!container || !ehAdmin || !dataPendente) return;

    localStorage.removeItem('dataEscalaPendente');
    abrirModalEscala(dataPendente);
}
 
window.addEventListener('pointerdown', function(event) {
    const modalEdicao = document.getElementById('modal-edicao');
    if (modalEdicao && event.target === modalEdicao) fecharModalEdicao();
 
    const modalNovaData = document.getElementById('modal-nova-data');
    if (modalNovaData && event.target === modalNovaData) fecharModalNovaData();

    const modalEditarMembro = document.getElementById('modal-editar-membro');
    if (modalEditarMembro && event.target === modalEditarMembro) fecharModalEditarMembro();

    const modalEscala = document.getElementById('modal-escala');
    if (modalEscala && event.target === modalEscala) fecharModalEscala();
});
 
document.addEventListener('DOMContentLoaded', async () => {
    await sincronizarDadosRemotos();

    renderizarMembros();
    alternarBotaoAdicionarMembro();
    preencherAutocompleteMembros();
    inicializarSeletoresEscalaDesktop();
    preencherSeletoresEscala();
    renderizarRepertorio();
    renderizarEscalas();
    abrirEscalaPendente();
    configurarAcessoPorPerfil();
    iniciarAtualizacaoAutomatica();

    const inputNovaData = document.getElementById('input-nova-data');
    if (inputNovaData) {
        inputNovaData.addEventListener('input', formatarDataAutomaticamente);
    }
});

window.addEventListener('storage', (event) => {
    if (!event.key) return;

    if (event.key === CHAVE_MEMBROS) {
        CACHE_DADOS.membros = null;
        renderizarMembros();
        preencherAutocompleteMembros();
        preencherSeletoresEscala();
    }

    if (event.key === CHAVE_REPERTORIO) {
        CACHE_DADOS.repertorio = null;
        renderizarRepertorio();
    }

    if (event.key === CHAVE_ESCALAS) {
        CACHE_DADOS.escalas = null;
        renderizarEscalas();
    }
});
