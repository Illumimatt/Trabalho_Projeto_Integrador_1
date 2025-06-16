async function carregarMelhoresAvaliados() {
  try {
    const resposta = await fetch('/api/melhores-avaliados');
    const dados = await resposta.json();

    if (!Array.isArray(dados)) throw new Error("Formato de resposta inválido");

    // Exemplo: preenchendo os 3 primeiros lugares
    const podium = dados.slice(0, 3);
    const tabela = dados.slice(3, 10);

    podium.forEach((item, index) => {
      const localDiv = document.getElementById(`top-${index + 1}`);
      if (localDiv) {
        localDiv.querySelector('.nome-local').textContent = item.nome;
        localDiv.querySelector('.nota').textContent = item.nota_media.toFixed(1);
        localDiv.querySelector('.avaliacoes').textContent = `(${item.qtd_avaliacoes})`;
        // Você pode montar as estrelas com base em item.nota_media também
      }
    });

    // Exemplo: preenchendo a tabela de posições
    const corpoTabela = document.querySelector('#tabela-avaliados tbody');
    corpoTabela.innerHTML = '';
    tabela.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>🏆${index + 4}</td>
        <td>${item.nome}</td>
        <td>⭐ ${item.nota_media.toFixed(1)}</td>
        <td>${item.qtd_avaliacoes}</td>
      `;
      corpoTabela.appendChild(tr);
    });

  } catch (erro) {
    console.error('Erro ao carregar melhores avaliados:', erro);
  }
}

document.addEventListener('DOMContentLoaded', carregarMelhoresAvaliados);
