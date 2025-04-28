require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const path = require('path');
const crypto = require('crypto'); // Módulo nativo do Node.js

const app = express();
const PORT = 3000;

app.use(cors()); // Permite requisições do frontend
app.use(express.json()); // Permite o envio de JSON no corpo das requisições

// Servir arquivos estáticos do diretório frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota para servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Inicialização do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Função para gerar hash de senha usando crypto
function gerarHashSenha(senha) {
  // Criar um "salt" aleatório
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Criar hash combinando senha e salt
  const hash = crypto.createHmac('sha256', salt)
    .update(senha)
    .digest('hex');
    
  // Retornar salt e hash combinados (para podermos verificar depois)
  return `${salt}:${hash}`;
}

// Função para verificar senha (para quando você implementar login)
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

// Rota para buscar categorias
app.get("/api/categorias", async (req, res) => {
  try {
    const { data, error } = await supabase.from("categoria").select("*").order("nome");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar categorias", detalhes: error.message });
  }
});

// Rota para buscar locais
app.get("/api/locais", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("local")
      .select(`
          id,
          nome,
          categoria:categoria ( nome )
      `)
      .order("nome");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar locais", detalhes: error.message });
  }
});

// Rota para cadastrar um local
app.post("/api/locais", async (req, res) => {
  const { nome, categoriaId } = req.body;
  try {
    const { data, error } = await supabase.from("local").insert([{ nome, categoriaid: categoriaId }]).select();
    if (error) throw error;
    res.json({ mensagem: "Local cadastrado com sucesso!", data });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar local", detalhes: error.message });
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

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
