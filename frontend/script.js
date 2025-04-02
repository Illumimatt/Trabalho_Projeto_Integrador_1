// Função para carregar categorias via backend
async function carregarCategorias() {
  try {
      const response = await fetch("http://localhost:3000/api/categorias");
      const data = await response.json();
      
      const selectCategoria = document.getElementById("categoria");
      while (selectCategoria.options.length > 1) {
          selectCategoria.remove(1);
      }

      data.forEach(categoria => {
          const option = document.createElement("option");
          option.value = categoria.id;
          option.textContent = categoria.nome;
          selectCategoria.appendChild(option);
      });
  } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      alert("Erro ao buscar categorias.");
  }
}

// Função para carregar locais via backend
async function carregarLocais() {
  try {
      const response = await fetch("http://localhost:3000/api/locais");
      const data = await response.json();
      
      const listaLocais = document.getElementById("locais");
      listaLocais.innerHTML = "";

      data.forEach(local => {
          const linha = document.createElement("tr");
          linha.innerHTML = `
              <td>${local.id}</td>
              <td>${local.nome}</td>
              <td>${local.categoria.nome}</td>
          `;
          listaLocais.appendChild(linha);
      });
  } catch (error) {
      console.error("Erro ao carregar locais:", error);
      alert("Erro ao buscar locais.");
  }
}

// Função para cadastrar um local via backend
document.getElementById("formularioCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const categoriaId = parseInt(document.getElementById("categoria").value);

  try {
      const response = await fetch("http://localhost:3000/api/locais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, categoriaId })
      });

      const data = await response.json();
      alert(data.mensagem);
      document.getElementById("nome").value = "";
      document.getElementById("categoria").selectedIndex = 0;
      carregarLocais();
  } catch (error) {
      console.error("Erro ao cadastrar local:", error);
      alert("Erro ao cadastrar local.");
  }
});

// Inicializar a página
document.addEventListener("DOMContentLoaded", async () => {
  await carregarCategorias();
  await carregarLocais();
});
