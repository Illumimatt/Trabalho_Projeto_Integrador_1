document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('lista-reclamacoes-resolvidas');
  const template = document.getElementById('template-reclamacao');

  if (!template || !container) {
    console.error('Elemento de template ou contêiner não encontrado!');
    if (container) {
        container.textContent = 'Erro interno: Elemento principal não encontrado na página.';
    }
    return;
  }

  try {
    const resp = await fetch('/api/reclamacoes/resolvidas');
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    
    const reclamacoesResolvidas = await resp.json();

    if (reclamacoesResolvidas.length === 0) {
        container.textContent = 'Nenhuma reclamação resolvida encontrada.';
        return;
    }

    reclamacoesResolvidas.forEach(r => {
      const clone = template.content.cloneNode(true);

      const usuarioEl = clone.querySelector('.card-usuario');
      if (r.usuarioNome) {
        usuarioEl.textContent = r.usuarioNome;
      } else {
        usuarioEl.textContent = 'Usuário desconhecido';
      }

      clone.querySelector('.card-text').textContent = r.texto;

      container.appendChild(clone);
    });
  } catch (err) {
    console.error('Erro ao carregar reclamações resolvidas:', err);
    container.textContent = 'Não foi possível carregar as reclamações resolvidas no momento.';
  }
});