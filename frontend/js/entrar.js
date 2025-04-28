document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form')
  const erroEl = document.getElementById('login-erro')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value
    erroEl.textContent = ''

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      const data = await resp.json()

      if (resp.ok && data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        window.location.href = '/'
      } else {
        erroEl.textContent = data.erro || data.mensagem || 'Falha no login'
      }
    } catch {
      erroEl.textContent = 'Erro de conexão com o servidor.'
    }
  })
})
