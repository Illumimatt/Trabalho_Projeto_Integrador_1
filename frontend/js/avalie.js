const selectCategoria = document.getElementById('categoria1');
const selectLocal     = document.getElementById('categoria2');
const form            = document.getElementById('avalie-form'); 

async function loadCategorias() {
  try {
    const res = await fetch('/api/categorias');
    const cats = await res.json();
    selectCategoria.innerHTML = '<option value="">Selecione (Opcional)</option>';
    cats.forEach(c => {
      selectCategoria.insertAdjacentHTML(
        'beforeend',
        `<option value="${c.id}">${c.nome}</option>`
      );
    });
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
  }
}

async function loadLocais(categoriaId) {
  selectLocal.innerHTML = '<option value="">Selecione (Opcional)</option>';
  if (!categoriaId) return;
  try {
    const res = await fetch(`/api/locais/categoria/${categoriaId}`);
    const locais = await res.json();
    locais.forEach(l => {
      selectLocal.insertAdjacentHTML(
        'beforeend',
        `<option value="${l.id}">${l.nome}</option>`
      );
    });
  } catch (err) {
    console.error('Erro ao carregar locais:', err);
  }
}

selectCategoria.addEventListener('change', e => {
  loadLocais(e.target.value);
});

loadCategorias();

form.addEventListener('submit', async e => {
  e.preventDefault();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  if (!usuario) return window.location.href = 'entrar.html';

  const payload = {
    usuarioId: usuario.id,
    localId: selectLocal.value || null,
    texto: document.getElementById('avaliacao').value.trim(),
    anonimo: document.getElementById('anonimo').checked
  };

  const resp = await fetch('/api/avaliacao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (resp.ok) {
    alert('Avaliação enviada com sucesso!');
    form.reset();
  } else {
    const err = await resp.json();
    alert(err.erro || 'Falha ao enviar avaliação.');
  }
});