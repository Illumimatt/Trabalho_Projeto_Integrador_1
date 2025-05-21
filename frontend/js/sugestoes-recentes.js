document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('lista-sugestoes');
  const template = document.getElementById('template-sugestao');

  if (!template) {
    console.error('Template não encontrado!');
    container.textContent = 'Erro interno: Template não encontrado.';
    return;
  }

  try {
    const resp = await fetch('/api/sugestoes/recentes');
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const sugestoes = await resp.json();

    sugestoes.forEach(s => {
      const clone = template.content.cloneNode(true);

      const usuarioEl = clone.querySelector('.card-usuario');
      if (s.anonimo) {
        usuarioEl.textContent = 'Anônimo';
      } else if (s.usuarioNome) {
        usuarioEl.textContent = s.usuarioNome;
      } else {
        usuarioEl.textContent = 'Usuário desconhecido';
      }

      clone.querySelector('.card-text').textContent = s.texto;

      container.appendChild(clone);
    });
  } catch (err) {
    console.error('Erro ao carregar sugestões recentes:', err);
    container.textContent = 'Não foi possível carregar as sugestões no momento.';
  }
});
