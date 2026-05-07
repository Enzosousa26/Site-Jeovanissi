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
    { usuario: 'Visitante',        senha: '1234',   perfil: 'membro', nome: 'Visitante' },
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
    const perfilFormatado = perfilUsuario === 'admin' ? 'Admin' : 'Membro';
    tagPerfil.innerHTML = nomeUsuario ? `Perfil: ${perfilFormatado} | ${nomeUsuario}` : `Perfil: ${perfilFormatado}`;
}

// ============================================================
// MEMBROS DA BANDA
// ============================================================
const CHAVE_MEMBROS = 'membrosBanda';
let _indexMembroAtual = null;
let _modoModalMembro = null;
let _gerenciandoMembros = false;
const MEMBROS_PADRAO = [
    { nome: 'Aminadabe / Binho', cargo: 'Líder Geral' },
    { nome: 'Patrick', cargo: 'Líder Instrumental' },
    { nome: 'Moises', cargo: 'Líder Vocal' },
    { nome: 'Alesio', cargo: 'Vocalista' },
    { nome: 'Douglas', cargo: 'Baterista / Baixista' },
    { nome: 'Edilane', cargo: 'Vocalista' },
    { nome: 'Enzo', cargo: 'Baterista' },
    { nome: 'Joao', cargo: 'Instrumental' },
    { nome: 'Larrisa', cargo: 'Vocalista' },
    { nome: 'Miguel', cargo: 'Instrumental' },
    { nome: 'Nicole', cargo: 'Vocalista / Mídia' },
    { nome: 'Vanessa', cargo: 'Vocalista' },
    { nome: 'Vitoria', cargo: 'Vocalista' },
    { nome: 'Wagao', cargo: 'Baixista' },
    { nome: 'Eliane', cargo: 'Vocalista' },
    { nome: 'Erika', cargo: 'Vocalista' },
];

function carregarMembros() {
    const salvo = localStorage.getItem(CHAVE_MEMBROS);
    return salvo ? JSON.parse(salvo) : [...MEMBROS_PADRAO];
}

function salvarMembros(membros) {
    localStorage.setItem(CHAVE_MEMBROS, JSON.stringify(membros));
}

function dataRepertorioValida(data) {
    return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/.test(data);
}

function responsavelMidiaSomValido(nome) {
    const permitidos = ['Nicole', 'Aminadabe / Binho'];
    return !nome || permitidos.includes(nome);
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
}

function excluirMembro(index) {
    const membros = carregarMembros();
    const membro = membros[index];

    if (!confirm(`Excluir ${membro.nome} da lista de membros?`)) return;

    membros.splice(index, 1);
    salvarMembros(membros);
    renderizarMembros();
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
    // Procura o elemento que tem id 'perfil'. Esse é o modal.
    const modal = document.getElementById('perfil');
    if (!modal) return; // Se não achar, sai sem fazer nada.
 
    // Faz o modal aparecer na tela usando flex.
    modal.style.display = 'flex';
 
    // Depois de um pouquinho, adiciona a classe 'ativo'.
    // Isso faz a animação de aparecer funcionar.
    setTimeout(() => {
        modal.classList.add('ativo');
    }, 10);
}
 
function fecharPerfil() {
    // Procura de novo o modal para fechar.
    const modal = document.getElementById('perfil');
    if (!modal) return;
 
    // Remove a classe que mostra o modal.
    modal.classList.remove('ativo');
 
    // Depois de 300ms, esconde o modal totalmente.
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}
 
function exibirMembros() {
    // Procura o elemento que tem id 'perfil'. Esse é o modal.
    const modalMembros = document.getElementById('membros');
    if (!modalMembros) return; // Se não achar, sai sem fazer nada.

    _gerenciandoMembros = false;
    renderizarMembros();
    alternarBotaoAdicionarMembro();
 
    // Faz o modal aparecer na tela usando flex.
    modalMembros.style.display = 'flex';
 
    // Depois de um pouquinho, adiciona a classe 'ativo'.
    // Isso faz a animação de aparecer funcionar.
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
    // Procura de novo o modal para fechar.
    const modalFecharMembros = document.getElementById('membros');
    if (!modalFecharMembros) return;
 
    // Remove a classe que mostra o modal.
    modalFecharMembros.classList.remove('ativo');
    _gerenciandoMembros = false;
 
    // Depois de 300ms, esconde o modal totalmente.
    setTimeout(() => {
        modalFecharMembros.style.display = 'none';
    }, 300);
}
 
window.addEventListener('pointerdown', function(event) {
    // Fecha o modal quando o usuário clica fora da caixa de conteúdo.
    const modalFecharMembros = document.getElementById('membros');
    if (modalFecharMembros && event.target === modalFecharMembros) {
        fecharExibirMembros();
    }
});
 
window.addEventListener('load', () => {
    // Quando a página terminar de carregar, faz o menu ficar marcado.
    const topnavLinks = document.querySelectorAll('.topnav a');
 
    topnavLinks.forEach((link) => {
        // Compara o pathname resolvido do link com o pathname atual
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === window.location.pathname) {
            link.classList.add('active');
        }
 
        link.addEventListener('mousedown', () => {
            // Quando começa a apertar o link, limpa todos e marca este.
            topnavLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
 
        link.addEventListener('click', () => {
            // Quando clica no link, também garante que ele fique marcado.
            topnavLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
    });
 
    // Botão voltar ao topo
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            // Se o usuário rolar para baixo mais de 300 pixels, mostra o botão.
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
 
        backToTopBtn.addEventListener('click', () => {
            // Quando o botão for clicado, sobe devagar para o topo.
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
    // Alterna o campo de senha entre oculto e visível.
    const input = document.getElementById('senha-input');
    input.type = input.type === 'password' ? 'text' : 'password';
}
 
// ============================================================
// REPERTÓRIO — GERENCIAMENTO DE LISTAS POR DATA
// ============================================================
 
// Chave usada para salvar e ler o repertório no localStorage
const CHAVE_REPERTORIO = 'repertorio';
const CHAVE_ESCALAS = 'escalasLouvor';
 
// Variáveis de controle do modal de edição de música
let _dataAtual = null;   // Qual domingo está sendo editado
let _indexAtual = null;  // Qual música está sendo editada (null = nova música)
let _dataEscalaAtual = null;
 
// Retorna o repertório salvo no localStorage, ou um objeto vazio se não houver nada
function carregarRepertorio() {
    const salvo = localStorage.getItem(CHAVE_REPERTORIO);
    return salvo ? JSON.parse(salvo) : {};
}
 
// Salva o objeto de repertório no localStorage
function salvarRepertorio(repertorio) {
    localStorage.setItem(CHAVE_REPERTORIO, JSON.stringify(repertorio));
}

function carregarEscalas() {
    const salvo = localStorage.getItem(CHAVE_ESCALAS);
    return salvo ? JSON.parse(salvo) : {};
}

function salvarEscalas(escalas) {
    localStorage.setItem(CHAVE_ESCALAS, JSON.stringify(escalas));
}
 
// Renderiza todas as listas de domingo na div#repertorio-geral
function renderizarRepertorio() {
    const container = document.getElementById('repertorio-geral');
    if (!container) return; // Não está na página de repertório, ignora
 
    const repertorio = carregarRepertorio();
    const ehAdmin = localStorage.getItem('perfilUsuario') === 'admin';
 
    // Mostra o botão de nova data somente para admin
    const btnNovaData = document.getElementById('btn-nova-data');
    if (btnNovaData) {
        btnNovaData.style.display = ehAdmin ? 'inline-block' : 'none';
    }
 
    container.innerHTML = ''; // Limpa antes de redesenhar
 
    const datas = Object.keys(repertorio);
 
    if (datas.length === 0) {
        container.innerHTML = '<p style="color:#888;">Nenhuma lista cadastrada ainda.</p>';
        return;
    }
 
    // Cria um bloco para cada domingo
    datas.forEach(data => {
        const musicas = repertorio[data];
 
        const bloco = document.createElement('div');
        bloco.className = 'bloco-data';
 
        // Cabeçalho do bloco com o nome da data e botão de excluir (só admin)
        const cabecalho = document.createElement('div');
        cabecalho.className = 'cabecalho-data';
        cabecalho.innerHTML = `<h4>Domingo ${data}</h4>`;
 
        if (ehAdmin) {
            const btnExcluirData = document.createElement('button');
            btnExcluirData.className = 'btn-excluir-data somente-admin';
            btnExcluirData.textContent = '🗑 Excluir lista';
            btnExcluirData.onclick = () => excluirData(data);
            cabecalho.appendChild(btnExcluirData);
        }
 
        bloco.appendChild(cabecalho);
 
        // Lista de músicas
        const ul = document.createElement('ul');
        ul.className = 'lista-repertorio';
 
        musicas.forEach((musica, index) => {
            const li = document.createElement('li');
 
            // Se tiver link, transforma o nome em âncora
            if (musica.link) {
                li.innerHTML = `<a href="${musica.link}" target="_blank" rel="noopener">${musica.nome}</a>`;
            } else {
                li.textContent = musica.nome;
            }
 
            // Botões de editar e excluir (só admin)
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
 
        // Botão para adicionar música neste domingo (só admin)
        if (ehAdmin) {
            const btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-musica somente-admin';
            btnAdd.textContent = '+ Adicionar música';
            btnAdd.onclick = () => abrirModalEdicao(data, null);
            bloco.appendChild(btnAdd);
        }
 
        container.appendChild(bloco);
    });
}
 
// Abre o modal de edição de música
// Se index for null, é uma nova música; se for um número, é edição
function abrirModalEdicao(data, index) {
    // Guarda a data e a posição da música que será alterada.
    _dataAtual = data;
    _indexAtual = index;
 
    // Busca os elementos que compõem o modal de edição.
    const modal = document.getElementById('modal-edicao');
    const titulo = document.getElementById('modal-titulo');
    const inputNome = document.getElementById('input-nome-musica');
    const inputLink = document.getElementById('input-link-musica');
 
    if (!modal) return;
 
    if (index !== null) {
        // Edição: preenche os campos com os dados existentes
        const repertorio = carregarRepertorio();
        const musica = repertorio[data][index];
        titulo.textContent = 'Editar música';
        inputNome.value = musica.nome;
        inputLink.value = musica.link || '';
    } else {
        // Nova música: limpa os campos
        titulo.textContent = 'Adicionar música';
        inputNome.value = '';
        inputLink.value = '';
    }
 
    // Exibe o modal e dispara a animação de entrada.
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
}
 
// Fecha o modal de edição de música
function fecharModalEdicao() {
    // Fecha o modal depois da animação de saída.
    const modal = document.getElementById('modal-edicao');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
 
// Salva a música (nova ou editada) no localStorage e redesenha
function salvarMusica() {
    // Lê os valores digitados no formulário do modal.
    const nome = document.getElementById('input-nome-musica').value.trim();
    const link = document.getElementById('input-link-musica').value.trim();
    const criandoMusica = _indexAtual === null;
 
    if (!nome) {
        // Impede salvar uma música sem nome.
        alert('Digite o nome da música.');
        return;
    }
 
    const repertorio = carregarRepertorio();
 
    if (_indexAtual !== null) {
        // Edita a música existente
        repertorio[_dataAtual][_indexAtual] = { nome, link };
    } else {
        // Adiciona nova música à lista do domingo
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
 
// Remove uma música da lista e redesenha
function excluirMusica(data, index) {
    // Confirma antes de remover uma música específica.
    if (!confirm('Excluir esta música?')) return;
    const repertorio = carregarRepertorio();
    repertorio[data].splice(index, 1);
    salvarRepertorio(repertorio);
    renderizarRepertorio();
}
 
// Remove um domingo inteiro da lista e redesenha
function excluirData(data) {
    // Confirma antes de remover toda a lista de um domingo.
    if (!confirm(`Excluir a lista do domingo ${data}?`)) return;
    const repertorio = carregarRepertorio();
    delete repertorio[data];
    salvarRepertorio(repertorio);
    renderizarRepertorio();
}
 
// Abre o modal de nova data
function abrirModalNovaData() {
    // Abre o modal usado para criar uma nova data.
    const modal = document.getElementById('modal-nova-data');
    if (!modal) return;
    document.getElementById('input-nova-data').value = '';
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('ativo'), 10);
}
 
// Fecha o modal de nova data
function fecharModalNovaData() {
    // Fecha o modal de nova data depois da animação.
    const modal = document.getElementById('modal-nova-data');
    if (!modal) return;
    modal.classList.remove('ativo');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
 
// Cria uma nova lista de domingo vazia e redesenha
function salvarNovaData() {
    // Lê a data digitada pelo administrador.
    const data = document.getElementById('input-nova-data').value.trim();
 
    if (!data) {
        // Evita criar uma lista sem data.
        alert('Digite a data do domingo.');
        return;
    }

    if (!dataRepertorioValida(data)) {
        alert('Digite a data no padrão dd/mm. Ex: 05/02.');
        return;
    }
 
    const repertorio = carregarRepertorio();
 
    if (repertorio[data]) {
        // Evita cadastrar duas listas para a mesma data.
        alert('Já existe uma lista para essa data.');
        return;
    }
 
    repertorio[data] = []; // Lista vazia pronta para receber músicas
    salvarRepertorio(repertorio);
    fecharModalNovaData();
    renderizarRepertorio();
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

        card.innerHTML = `
            <div class="cabecalho-escala">
                <h3>Domingo ${data}</h3>
            </div>
            <dl>
                <div>
                    <dt>Vocal</dt>
                    <dd>${escala.vocal || 'Não definido'}</dd>
                </div>
                <div>
                    <dt>Instrumental</dt>
                    <dd>${escala.instrumental || 'Não definido'}</dd>
                </div>
                <div>
                    <dt>Mídia</dt>
                    <dd>${escala.midia || 'Não definido'}</dd>
                </div>
                <div>
                    <dt>Som</dt>
                    <dd>${escala.som || 'Não definido'}</dd>
                </div>
                <div>
                    <dt>Observações</dt>
                    <dd>${escala.observacoes || 'Sem observações'}</dd>
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
    const inputVocal = document.getElementById('input-vocal-escala');
    const inputInstrumental = document.getElementById('input-instrumental-escala');
    const inputMidia = document.getElementById('input-midia-escala');
    const inputSom = document.getElementById('input-som-escala');
    const inputObservacoes = document.getElementById('input-observacoes-escala');

    if (!modal) return;

    const escalas = carregarEscalas();
    _dataEscalaAtual = data;

    if (data && escalas[data]) {
        const escala = escalas[data];
        titulo.textContent = 'Editar escala';
        inputData.value = data;
        inputVocal.value = escala.vocal || '';
        inputInstrumental.value = escala.instrumental || '';
        inputMidia.value = escala.midia || '';
        inputSom.value = escala.som || '';
        inputObservacoes.value = escala.observacoes || '';
    } else {
        titulo.textContent = 'Adicionar escala';
        inputData.value = data || '';
        inputVocal.value = '';
        inputInstrumental.value = '';
        inputMidia.value = '';
        inputSom.value = '';
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
    const vocal = document.getElementById('input-vocal-escala').value.trim();
    const instrumental = document.getElementById('input-instrumental-escala').value.trim();
    const midia = document.getElementById('input-midia-escala').value.trim();
    const som = document.getElementById('input-som-escala').value.trim();
    const observacoes = document.getElementById('input-observacoes-escala').value.trim();

    if (!data) {
        alert('Digite a data da escala.');
        return;
    }

    if (!responsavelMidiaSomValido(midia) || !responsavelMidiaSomValido(som)) {
        alert('Mídia e som só podem ser preenchidos com Nicole ou Aminadabe / Binho.');
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
 
// Fecha modais de repertório ao clicar fora da caixa de conteúdo
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
 
// Renderiza o repertório assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    renderizarMembros();
    alternarBotaoAdicionarMembro();
    preencherAutocompleteMembros();
    renderizarRepertorio();
    renderizarEscalas();
    abrirEscalaPendente();
});
