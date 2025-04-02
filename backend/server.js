require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const path = require('path');

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

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
