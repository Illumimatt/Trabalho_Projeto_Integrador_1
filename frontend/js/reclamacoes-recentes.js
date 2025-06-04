document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('lista-reclamacoes');
  const template = document.getElementById('template-reclamacao');

  if (!template || !container) {
    console.error('Elemento de template ou contêiner não encontrado!');
    if (container) {
        container.textContent = 'Erro interno: Elemento principal não encontrado na página.';
    }
    return;
  }

  try {
    const resp = await fetch('/api/reclamacoes/pendentes');
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const reclamacoes = await resp.json();

    if (reclamacoes.length === 0) {
        container.textContent = 'Nenhuma reclamação encontrada.';
        return;
    }

    reclamacoes.forEach(r => {
      const clone = template.content.cloneNode(true);

      const usuarioEl = clone.querySelector('.card-usuario');
      if (r.usuarioNome) {
        usuarioEl.textContent = r.usuarioNome;
      } else {
        // Fallback caso o nome não venha por algum motivo
        usuarioEl.textContent = 'Usuário desconhecido';
      }

      clone.querySelector('.card-text').textContent = r.texto;

      container.appendChild(clone);
    });
  } catch (err) {
    console.error('Erro ao carregar reclamações recentes:', err);
    container.textContent = 'Não foi possível carregar as reclamações no momento.';
  }
});