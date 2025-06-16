require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Configurações básicas
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Inicialização do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// NAO MEXER NA LOGICA DE LOGIN.
// NAO MEXER NA LOGICA DE LOGIN.
// Função para gerar hash de senha usando crypto
function gerarHashSenha(senha) {
  // Criar um "salt" aleatório
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Criar hash combinando senha e salt
  const hash = crypto.createHmac('sha256', salt)
    .update(senha)
    .digest('hex');
  return `${salt}:${hash}`;
}
function verificarSenha(senhaArmazenada, senhaInformada) {
  const [salt, hashOriginal] = senhaArmazenada.split(':');
  const hashVerificar = crypto.createHmac('sha256', salt)
    .update(senhaInformada)
    .digest('hex');
  return hashOriginal === hashVerificar;
}

app.post("/api/login", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  try {
    const { data: usuarios, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({ erro: "Erro ao buscar usuário", detalhes: error.message });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(400).json({ erro: "Email ou senha inválidos" });
    }

    const usuario = usuarios[0];

    const senhaCorreta = verificarSenha(usuario.senha, senha);

    if (!senhaCorreta) {
      return res.status(400).json({ erro: "Email ou senha inválidos" });
    }

    // Não retornar a senha para o frontend
    delete usuario.senha;

    console.log("Usuário logado:", usuario.id);

    return res.status(200).json({
      mensagem: "Login realizado com sucesso",
      usuario: usuario
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ erro: "Erro interno no servidor", detalhes: error.message });
  }
});

app.post("/api/usuarios/verificar-email", async (req, res) => {
  const { email } = req.body;
  try {
    const { data, error } = await supabase
      .from("usuario")
      .select("email")
      .eq("email", email);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      res.json({ emailExiste: true });
    } else {
      res.json({ emailExiste: false });
    }
  } catch (error) {
    res.status(500).json({ erro: "Erro ao verificar email", detalhes: error.message });
  }
});

// Rota para cadastrar um usuário
app.post("/api/usuarios", async (req, res) => {
  // Garantir content-type correto na resposta
  res.setHeader('Content-Type', 'application/json');
  
  const { nome, email, senha } = req.body;
  
  try {
    // Verificar se todos os campos foram preenchidos
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }
    
    // Verificar se o email já existe
    const { data: usuarioExistente, error: erroConsulta } = await supabase
      .from("usuario")
      .select("email")
      .eq("email", email);
    
    if (erroConsulta) {
      console.error("Erro ao consultar email:", erroConsulta);
      return res.status(500).json({ erro: "Erro ao verificar email", detalhes: erroConsulta.message });
    }
    
    if (usuarioExistente && usuarioExistente.length > 0) {
      return res.status(400).json({ erro: "Este email já está cadastrado" });
    }
    
    // Gerar hash da senha
    const senhaHash = gerarHashSenha(senha);
    
    // Inserir o novo usuário
    const { data, error } = await supabase
      .from("usuario")
      .insert([{ nome, email, senha: senhaHash }])
      .select();
    
    if (error) {
      console.error("Erro ao inserir usuário:", error);
      return res.status(500).json({ erro: "Erro ao cadastrar usuário", detalhes: error.message });
    }
    
    // Retornar sucesso sem expor a senha
    const usuarioCriado = { ...data[0] };
    delete usuarioCriado.senha;
    
    console.log("Usuário cadastrado com sucesso:", usuarioCriado.id);
    
    return res.status(201).json({ 
      mensagem: "Usuário cadastrado com sucesso!", 
      usuario: usuarioCriado 
    });
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return res.status(500).json({ erro: "Erro ao cadastrar usuário", detalhes: error.message });
  }
});
//NAO MEXER NA LOGICA DE LOGIN.
//NAO MEXER NA LOGICA DE LOGIN.

// ROTAS CRÍTICAS PARA O FUNCIONAMENTO:

// 1. Rota para locais por categoria (MODIFICADA)
app.get("/api/locais/categoria/:categoriaId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("local")
      .select("id, nome, categoriaid")
      .eq("categoriaid", req.params.categoriaId)
      .order("nome");

    if (error) throw error;

    // Garante que sempre retorne um array, mesmo vazio
    res.json(data || []);

  } catch (error) {
    console.error("Erro ao buscar locais por categoria:", error);
    res.status(500).json({
      error: "Erro ao buscar locais",
      details: error.message
    });
  }
});

// 2. Rota para categoria específica (MODIFICADA)
app.get("/api/categorias/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categoria")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json(data);

  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Rota para local específico (MODIFICADA)
// Rota para local específico - versão corrigida
app.get("/api/locais/id/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("local")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Local não encontrado" });
    }

    res.json(data);

  } catch (error) {
    console.error("Erro ao buscar local:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Rotas para listagem geral (MODIFICADAS)
app.get("/api/categorias", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categoria")
      .select("*")
      .order("nome");

    if (error) throw error;
    res.json(data || []);

  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
});

app.get("/api/locais", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("local")
      .select("id, nome, categoria:categoriaid(nome)")
      .order("nome");

    if (error) throw error;
    res.json(data || []);

  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    res.status(500).json({ error: "Erro ao buscar locais" });
  }
});
// Rota exclusiva para criação de SUGESTÃO NAO APAGAR.
app.post('/api/sugestoes', async (req, res) => {
  const { usuarioId, localId, texto, anonimo } = req.body;

  // Validações básicas
  if (!usuarioId || !texto) {
    return res.status(400).json({ erro: 'Usuário e texto da sugestão são obrigatórios.' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        usuarioid: usuarioId,
        tipo: 'Sugestão',       // categoria fixa para esta rota
        localid: localId || null,
        texto,
        anonimo: Boolean(anonimo)
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ sucesso: true, sugestao: data });
  } catch (err) {
    console.error('Erro ao criar sugestão:', err);
    res.status(500).json({ erro: 'Não foi possível salvar sua sugestão.' });
  }
});

//ROTA PARA EXIBIR SUGESTOES, NAO APAGAR!!!!!
// Rota para buscar apenas os feedbacks do tipo “Sugestão”
app.get('/api/sugestoes/recentes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        texto,
        anonimo,
        datacriacao,
        usuario:usuarioid (
          nome
        )
      `)
      .eq('tipo', 'Sugestão')
      .order('datacriacao', { ascending: false });

    if (error) throw error;

    const sugestoes = data.map(item => ({
      id: item.id,
      texto: item.texto,
      anonimo: item.anonimo,
      usuarioNome: item.anonimo ? null : item.usuario.nome,
      criadoEm: item.datacriacao
    }));

    res.json(sugestoes);
  } catch (err) {
    console.error('Erro ao buscar sugestões recentes:', err);
    res.status(500).json({ erro: 'Não foi possível carregar as sugestões.' });
  }
});

//ROTA PARA ENVIAR RECLAMACAO, NAO APAGAR

app.post('/api/reclamacoes', async (req, res) => {
  const { usuarioId, localId, texto, anonimo } = req.body;

  // Validações básicas
  if (!usuarioId || !texto) {
    return res.status(400).json({ erro: 'Usuário e texto da reclamação são obrigatórios.' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        usuarioid: usuarioId,
        tipo: 'Reclamação',      // categoria fixa para esta rota
        localid: localId || null,
        texto,
        anonimo: Boolean(anonimo)
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ sucesso: true, reclamacao: data });
  } catch (err) {
    console.error('Erro ao criar reclamação:', err);
    res.status(500).json({ erro: 'Não foi possível salvar sua reclamação.' });
  }
});

//rota para exibir reclamacoes

app.get('/api/reclamacoes/pendentes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        texto,
        anonimo,
        datacriacao,
        usuario:usuarioid (
          nome
        )
      `)
      // Filtra por tipo 'Reclamação' E por status 'Resolvido'
      .eq('tipo', 'Reclamação')
      .eq('status', 'Pendente') // Novo filtro adicionado
      .order('datacriacao', { ascending: false });

    if (error) throw error;

    const reclamacoesPendentes = data.map(item => ({
      id: item.id,
      texto: item.texto,
      anonimo: item.anonimo,
      usuarioNome: item.anonimo ? 'Anônimo' : item.usuario.nome,
      criadoEm: item.datacriacao
    }));

    res.json(reclamacoesPendentes);
  } catch (err) {
    console.error('Erro ao buscar reclamações resolvidas:', err);
    res.status(500).json({ erro: 'Não foi possível carregar as reclamações resolvidas.' });
  }
});

//Rota para pegar reclamacoes resolvidas apenas

app.get('/api/reclamacoes/resolvidas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        texto,
        anonimo,
        datacriacao,
        usuario:usuarioid (
          nome
        )
      `)
      // Filtra por tipo 'Reclamação' E por status 'Resolvido'
      .eq('tipo', 'Reclamação')
      .eq('status', 'Resolvido') // Novo filtro adicionado
      .order('datacriacao', { ascending: false });

    if (error) throw error;

    const reclamacoesResolvidas = data.map(item => ({
      id: item.id,
      texto: item.texto,
      anonimo: item.anonimo,
      usuarioNome: item.anonimo ? 'Anônimo' : item.usuario.nome,
      criadoEm: item.datacriacao
    }));

    res.json(reclamacoesResolvidas);
  } catch (err) {
    console.error('Erro ao buscar reclamações resolvidas:', err);
    res.status(500).json({ erro: 'Não foi possível carregar as reclamações resolvidas.' });
  }
});

/*
// Rota para enviar feedback (avaliação)
app.post("/api/feedbacks/avaliacao", async (req, res) => {
  try {
    const { usuarioid, localid, texto, nota, anonimo } = req.body;


    // Inserção no Supabase (ambos localid e nota podem ser null)
    const { data, error } = await supabase
      .from("feedback")
      .insert([{
        usuarioid: usuarioid,
        localid: localid || null, // Pode ser null
        texto,
        nota: nota || null, // Pode ser null
        anonimo: anonimo || false,
        tipo: "Comentário",
        status: null,
        servicosid: null
      }]);

    if (error) throw error;

    res.status(201).json({
      success: true,
      feedback: data[0]
    });

  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    res.status(500).json({
      error: "Erro ao enviar avaliação",
      details: error.message
    });
  }
});
*/

app.post('/api/avaliacao', async (req, res) => {
  const { usuarioId, localId, texto, anonimo } = req.body;

  // Validações básicas
  if (!usuarioId || !texto) {
    return res.status(400).json({ erro: 'Usuário e texto da avaliação são obrigatórios.' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        usuarioid: usuarioId,
        tipo: 'Avaliação',      // categoria fixa para esta rota
        localid: localId || null,
        texto,
        anonimo: Boolean(anonimo)
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ sucesso: true, avaliacao: data });
  } catch (err) {
    console.error('Erro ao criar avaliação:', err);
    res.status(500).json({ erro: 'Não foi possível salvar sua avaliação.' });
  }
});


app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));