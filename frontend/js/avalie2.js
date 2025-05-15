document.addEventListener('DOMContentLoaded', async () => {
    const conteudoAvaliacao = document.getElementById('conteudo-avaliacao');
    conteudoAvaliacao.innerHTML = '<p>Carregando informações...</p>';

    try {
        // 1. Obter parâmetros da URL com verificação
        const urlParams = new URLSearchParams(window.location.search);
        const categoriaId = urlParams.get('categoria');
        const localId = urlParams.get('local');

        console.log('Parâmetros recebidos:', { categoriaId, localId }); // Debug

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
            `);
        } else {
            // CASO COM LOCAL ESPECÍFICO - CORREÇÃO PRINCIPAL
            const local = await carregarDados(`/api/locais/id/${localId}`, 'local');
                        
            const nomeLocal = extrairNome(local, 'Local');
            
            // Verificar se o local pertence à categoria selecionada
            if (local.categoriaid != categoriaId) {
                console.warn('O local não pertence à categoria selecionada!', {
                    localCategoriaId: local.categoriaid,
                    categoriaSelecionada: categoriaId
                });
            }
            
            exibirConteudo(`
                <h1 class="titulo-avaliacao">${nomeLocal}</h1>
            `);
        }

    } catch (erro) {
        console.error('Erro no carregamento:', erro);
        exibirErro(erro.message);
    }
});

// Funções auxiliares (mantidas iguais, mas com melhorias):

async function carregarDados(url, tipo) {
    const resposta = await fetch(`http://localhost:3000${url}`);
    
    if (!resposta.ok) {
        const erroData = await resposta.json().catch(() => ({}));
        throw new Error(erroData.error || `Erro ao carregar ${tipo}: ${resposta.status}`);
    }

    const dados = await resposta.json();
    console.log(`Dados da ${tipo}:`, dados);
    
    if (!dados) {
        throw new Error(`${tipo} não encontrado(a)`);
    }
    
    return dados;
}

function extrairNome(dados, tipo) {
    if (!dados) {
        throw new Error(`Dados da ${tipo} inválidos`);
    }
    
    // Verifica várias estruturas possíveis
    if (typeof dados === 'object') {
        if (dados.nome) return dados.nome;
        if (dados[0]?.nome) return dados[0].nome;
        if (dados.descricao) return dados.descricao;
    }
    
    throw new Error(`Estrutura de dados da ${tipo} não reconhecida`);
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