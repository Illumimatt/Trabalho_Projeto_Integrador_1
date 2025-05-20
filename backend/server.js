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

// Rotas de autenticação (mantidas iguais)
// ... [suas rotas de login, cadastro, etc.] ...

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
// Rota para verificar se um email já está cadastrado
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

// Rota para enviar feedback (avaliação)
app.post("/api/feedbacks/avaliacao", async (req, res) => {
  try {
    const { usuarioid, localid, texto, nota, anonimo } = req.body;

    // Validações flexíveis:
    if (!texto || texto.length < 5) {
      return res.status(400).json({ error: "O texto é obrigatório (mín. 5 caracteres)" });
    }

    // Se for anônimo, seta usuarioid como null
    const usuarioFinalId = anonimo ? null : usuarioid;

    // Inserção no Supabase (ambos localid e nota podem ser null)
    const { data, error } = await supabase
      .from("feedback")
      .insert([{
        usuarioid: anonimo ? null : usuarioid,
        localid: localid || null, // Pode ser null
        texto,
        nota: nota || null, // Pode ser null
        anonimo: anonimo || false,
        tipo: "Avaliação",
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

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
