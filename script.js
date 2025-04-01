// Inicialização do cliente Supabase
const SUPABASE_URL = 'https://phavlvcclbdkekeuxouh.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYXZsdmNjbGJka2VrZXV4b3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODg2MjksImV4cCI6MjA1NzM2NDYyOX0.CUYsVs9M71Sj4QkrR2Sg3bzfWz00u9eGO_B8ngdXr3k'; 

// Usando a importação correta
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para carregar categorias
async function carregarCategorias() {
  try {
    const { data, error } = await supabaseClient
      .from('categoria')
      .select('*')
      .order('nome');
    if (error) throw error;
    const selectCategoria = document.getElementById('categoria');
    // Limpar opções atuais (mantendo a primeira)
    while (selectCategoria.options.length > 1) {
      selectCategoria.remove(1);
    }
    // Adicionar novas opções
    data.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nome;
      selectCategoria.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    alert('Não foi possível carregar as categorias.');
  }
}

// Função para carregar locais
async function carregarLocais() {
  try {
    const { data, error } = await supabaseClient
      .from('local')
      .select(`
        id,
        nome,
        categoria:categoria (
          nome
        )
      `)
      .order('nome');
    if (error) throw error;
    const listaLocais = document.getElementById('locais');
    listaLocais.innerHTML = ''; // Limpar lista
    data.forEach(local => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${local.id}</td>
        <td>${local.nome}</td>
        <td>${local.categoria.nome}</td>
      `;
      listaLocais.appendChild(linha);
    });
  } catch (error) {
    console.error('Erro ao carregar locais:', error);
    alert('Não foi possível carregar os locais. Tente novamente.');
  }
}

// Função para cadastrar local
document.getElementById('formularioCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const categoriaId = parseInt(document.getElementById('categoria').value);
  try {
    const { data, error } = await supabaseClient
      .from('local')
      .insert([
        { nome: nome, categoriaid: categoriaId }
      ])
      .select();
    if (error) throw error;
    // Limpar formulário e recarregar dados
    document.getElementById('nome').value = '';
    document.getElementById('categoria').selectedIndex = 0;
    await carregarLocais();
    alert('Local cadastrado com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar local:', error);
    if (error.code === '23505') {
      alert('Este nome de local já existe. Escolha outro nome.');
    } else {
      alert(`Erro ao cadastrar: ${error.message}`);
    }
  }
});

// Inicializar a página
document.addEventListener('DOMContentLoaded', async () => {
  await carregarCategorias();
  await carregarLocais();
});