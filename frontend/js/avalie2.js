document.addEventListener('DOMContentLoaded', async () => {
    const conteudoAvaliacao = document.getElementById('conteudo-avaliacao');
    conteudoAvaliacao.innerHTML = '<p>Carregando informações...</p>';

    try {
        // 1. Obter parâmetros da URL com verificação
        const urlParams = new URLSearchParams(window.location.search);
        const categoriaId = urlParams.get('categoria');
        const localId = urlParams.get('local');

        if (!categoriaId) {
            throw new Error('ID da categoria não foi fornecido na URL');
        }

        // 2. Carregar dados da categoria
        const categoria = await carregarDados(`/api/categorias/${categoriaId}`, 'categoria');
        const nomeCategoria = extrairNome(categoria, 'Categoria');

        // 3. Determinar o conteúdo com base no local
        if (!localId || localId === 'null') {
            // Caso sem local específico
            exibirConteudo(`
                <h1 class="titulo-avaliacao">${nomeCategoria}</h1>
                <p class="sem-local">(Avaliação geral da categoria)</p>
            `);
        } else {
            // Caso com local específico
            const local = await carregarDados(`/api/locais/${localId}`, 'local');
            const nomeLocal = extrairNome(local, 'Local');
            
            exibirConteudo(`
                <h1 class="titulo-avaliacao">${nomeLocal}</h1>
                <p class="info-categoria">Categoria: ${nomeCategoria}</p>
            `);
        }

    } catch (erro) {
        console.error('Erro no carregamento:', erro);
        exibirErro(erro.message);
    }
});

// Funções auxiliares:

async function carregarDados(url, tipo) {
    const resposta = await fetch(`http://localhost:3000${url}`);
    
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar ${tipo}: ${resposta.status} ${resposta.statusText}`);
    }

    const dados = await resposta.json();
    console.log(`Dados da ${tipo}:`, dados);
    
    return dados;
}

function extrairNome(dados, tipo) {
    // Verifica várias possíveis estruturas de dados
    if (typeof dados === 'object' && dados !== null) {
        if (dados.nome) return dados.nome;
        if (dados[0]?.nome) return dados[0].nome;
        if (dados.descricao) return dados.descricao; // Fallback
    }
    
    throw new Error(`Não foi possível encontrar o nome da ${tipo} nos dados retornados`);
}

function exibirConteudo(html) {
    const conteudoAvaliacao = document.getElementById('conteudo-avaliacao');
    conteudoAvaliacao.innerHTML = html;
}

function exibirErro(mensagem) {
    exibirConteudo(`
        <div class="erro-container">
            <h1>Erro ao carregar</h1>
            <p>${mensagem}</p>
            <button onclick="window.location.href='avalie.html'" class="botao-voltar">
                Voltar para seleção
            </button>
        </div>
    `);
}