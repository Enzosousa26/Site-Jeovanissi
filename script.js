// Ele faz ações acontecerem, como abrir modal e marcar o link ativo.
 
// ============================================================
// SISTEMA DE USUÁRIOS
// ============================================================
const usuarios = [
    { usuario: 'Aminadabe.santos', senha: '251010', perfil: 'admin', nome: 'Aminadabe' },
    { usuario: 'Enzo.santos',      senha: '2510',   perfil: 'membro', nome: 'Enzo'      },
];
 
// Funcionalidade do botão de login
const loginBtn = document.getElementById('login-btn');
 
function exibirTextoDeUsuarioAdm(tag, texto){
    let campo = document.querySelector(tag);
    campo.innerHTML = texto;
}
function exibirTextoDeUsuarioMembro(tag, texto){
    let campoUm = document.querySelector(tag);
    campoUm.innerHTML = texto;
}
 
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        // Lê os inputs no momento do clique
        let usuario = document.querySelector('input[type="text"]').value;
        let senha = document.querySelector('input[type="password"]').value;
 
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
            alert('ERRO! Usuario invalido, tente novamente!');
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
    exibirTextoDeUsuarioAdm('h4', 'Perfil: Admin');
}
function verificarPerfilMembro(){
    exibirTextoDeUsuarioMembro('h4', 'Perfil: Membro');
}
 
// Exibe o perfil correto no h4 automaticamente ao carregar a página
const tagPerfil = document.querySelector('h4');
if (tagPerfil && perfilUsuario) {
    tagPerfil.innerHTML = `Perfil: ${perfilUsuario === 'admin' ? 'Admin' : 'Membro'}`;
}
 
// ============================================================
// LOGOUT
// ============================================================
function logout() {
    localStorage.removeItem('perfilUsuario');
    localStorage.removeItem('nomeUsuario');
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
 
    // Faz o modal aparecer na tela usando flex.
    modalMembros.style.display = 'flex';
 
    // Depois de um pouquinho, adiciona a classe 'ativo'.
    // Isso faz a animação de aparecer funcionar.
    setTimeout(() => {
        modalMembros.classList.add('ativo');
    }, 10);
}
 
function fecharExibirMembros() {
    // Procura de novo o modal para fechar.
    const modalFecharMembros = document.getElementById('membros');
    if (!modalFecharMembros) return;
 
    // Remove a classe que mostra o modal.
    modalFecharMembros.classList.remove('ativo');
 
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
});