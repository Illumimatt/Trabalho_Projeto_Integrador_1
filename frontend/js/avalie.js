document.addEventListener('DOMContentLoaded', async () => {
    const selectLocal = document.getElementById('select-local');
    const selectCategoria = document.getElementById('select-categoria');
    const botaoProsseguir = document.getElementById('prosseguir');

    // Função para carregar categorias (mantida igual)
    async function carregarCategorias() {
        try {
            const resposta = await fetch('/api/categorias');
            if (!resposta.ok) throw new Error('Erro ao carregar categorias');
            const categorias = await resposta.json();
            
            selectCategoria.innerHTML = '<option value="" selected disabled>Selecione uma categoria</option>';
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                selectCategoria.appendChild(option);
            });
        } catch (erro) {
            console.error('Erro ao carregar categorias:', erro);
            selectCategoria.innerHTML = '<option value="" selected disabled>Erro ao carregar categorias</option>';
        }
    }

    // Função modificada para carregar locais por categoria
    async function carregarLocaisPorCategoria(categoriaId) {
        try {
            selectLocal.disabled = true;
            selectLocal.innerHTML = '<option value="" selected disabled>Carregando locais...</option>';
            
            const resposta = await fetch(`/api/locais/${categoriaId}`);
            if (!resposta.ok) throw new Error('Erro ao carregar locais');
            
            const locais = await resposta.json();
            
            // Se não houver locais, cria uma opção vazia e libera o botão
            if (locais.length === 0) {
                selectLocal.innerHTML = '<option value="null" selected>Nenhum local disponível</option>';
                selectLocal.disabled = true; // Mantém desabilitado mas com valor válido
                verificarSelects();
                return;
            }
            
            // Se houver locais, preenche normalmente
            selectLocal.innerHTML = '<option value="" selected disabled>Selecione um local</option>';
            locais.forEach(local => {
                const option = document.createElement('option');
                option.value = local.id;
                option.textContent = local.nome;
                selectLocal.appendChild(option);
            });
            
            selectLocal.disabled = false;
        } catch (erro) {
            console.error('Erro ao carregar locais:', erro);
            selectLocal.innerHTML = '<option value="" selected disabled>Erro ao carregar locais</option>';
        }
    }

    // Função modificada para verificar selects
    function verificarSelects() {
        const categoriaValida = selectCategoria.value !== "";
        
        // Se não houver locais (value="null"), considera como válido
        const localValido = selectLocal.value === "null" || selectLocal.value !== "";
        
        if (categoriaValida && localValido) {
            botaoProsseguir.disabled = false;
            botaoProsseguir.classList.add('ativo');
        } else {
            botaoProsseguir.disabled = true;
            botaoProsseguir.classList.remove('ativo');
        }
    }

    // Função para redirecionar (mantida igual)
    function redirecionarParaAvaliacao() {
        if (!botaoProsseguir.disabled) {
            // Pode adicionar lógica para enviar o valor "null" se não houver locais
            const localId = selectLocal.value === "null" ? null : selectLocal.value;
            window.location.href = `avalie2.html?categoria=${selectCategoria.value}&local=${localId}`;
        }
    }

    // Event listeners
    selectCategoria.addEventListener('change', async (e) => {
        if (e.target.value) {
            await carregarLocaisPorCategoria(e.target.value);
        } else {
            selectLocal.innerHTML = '<option value="" selected disabled>Selecione uma categoria primeiro</option>';
            selectLocal.disabled = true;
        }
        verificarSelects();
    });

    selectLocal.addEventListener('change', verificarSelects);
    botaoProsseguir.addEventListener('click', redirecionarParaAvaliacao);

    // Inicialização
    await carregarCategorias();
    verificarSelects();
});