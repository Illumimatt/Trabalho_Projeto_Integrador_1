document.addEventListener('DOMContentLoaded', async () => {
  const podiumCards = {
    rank1: document.querySelector('.podium-card.rank-1'),
    rank2: document.querySelector('.podium-card.rank-2'),
    rank3: document.querySelector('.podium-card.rank-3'),
  };
  const tableBody = document.querySelector('.ranking-list table tbody');

  // --- NOVA FUNÇÃO DE FORMATAÇÃO ---
  function formatarNome(texto) {
    if (!texto || typeof texto !== 'string') {
      return '';
    }
    const textoComEspacos = texto.replaceAll('_', ' ');
    return textoComEspacos.charAt(0).toUpperCase() + textoComEspacos.slice(1);
  }

  // Função para preencher um card do pódio
  function preencherPodiumCard(cardElement, data) {
    if (!cardElement || !data) return;
    // Usa a função de formatação
    cardElement.querySelector('.podium-name').textContent = formatarNome(data.local_nome); 
    cardElement.querySelector('.podium-score').textContent = `(${data.total_avaliacoes} avaliações)`;
    
    const ratingElement = cardElement.querySelector('.podium-rating');
    if (data.nota_media !== null && data.nota_media !== undefined) {
        ratingElement.innerHTML = `Nota: ${data.nota_media.toFixed(1)} ★`;
    } else {
        ratingElement.innerHTML = `Nota: N/A`;
    }
  }

// Função para criar uma linha da tabela
function criarLinhaTabela(item, index) {
  const rank = index + 4;
  
  // --- CORREÇÃO AQUI: Use os caminhos absolutos corretos ---
  const trophyIcon = '../css/components/img/normal-trophy.svg';
  const starIcon = '../css/components/img/purple-star.svg';

  const notaFormatada = (item.nota_media !== null && item.nota_media !== undefined)
    ? item.nota_media.toFixed(1)
    : 'N/A';

  const newRow = `
    <tr>
      <td data-label="Colocação"><img src="${trophyIcon}" alt="Troféu"> ${rank}</td>
      <td data-label="Nome">${formatarNome(item.local_nome)}</td>
      <td data-label="Nota"><img src="${starIcon}" alt="Estrela"> ${notaFormatada}</td>
      <td data-label="Avaliações">${item.total_avaliacoes}</td>
    </tr>
  `;
  return newRow;
}

  try {
    const resp = await fetch('/api/ranking/melhores-avaliados');
    if (!resp.ok) {
      throw new Error(`Erro na API: Status ${resp.status}`);
    }
    const rankingData = await resp.json();

    if (!rankingData || rankingData.length === 0) {
      document.querySelector('.ranking-container').innerHTML += '<p>Nenhuma avaliação encontrada para exibir o ranking.</p>';
      return;
    }

    const podiumData = rankingData.slice(0, 3);
    const tableData = rankingData.slice(3);

    preencherPodiumCard(podiumCards.rank1, podiumData[0]);
    preencherPodiumCard(podiumCards.rank2, podiumData[1]);
    preencherPodiumCard(podiumCards.rank3, podiumData[2]);
    
    if (tableBody) {
      let tableHTML = '';
      tableData.forEach((item, index) => {
        tableHTML += criarLinhaTabela(item, index);
      });
      tableBody.innerHTML = tableHTML;
    }

  } catch (err) {
    console.error('Falha ao carregar o ranking:', err);
    document.querySelector('.ranking-container').innerHTML += '<p>Não foi possível carregar o ranking no momento. Tente novamente mais tarde.</p>';
  }
});