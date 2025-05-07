// js/auth.js caso de uso: <script src="/js/auth.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
      window.location.href = '/entrar.html'
    }
  })
  