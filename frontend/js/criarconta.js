// script.js - JavaScript do cliente para cadastro de usuários

document.addEventListener('DOMContentLoaded', function() {
  const formularioCadastro = document.getElementById('formularioCadastro');
  
  // Criar elemento para mostrar mensagens
  const mensagemElement = document.createElement('div');
  mensagemElement.className = 'mensagem';
  formularioCadastro.parentNode.insertBefore(mensagemElement, formularioCadastro.nextSibling);

  // Função para mostrar mensagem (erro, sucesso ou info)
  function mostrarMensagem(texto, tipo) {
    mensagemElement.textContent = texto;
    mensagemElement.className = `mensagem ${tipo}`;
    mensagemElement.style.display = 'block';
    
    // Fazer scroll até a mensagem
    mensagemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Esconder a mensagem depois de 5 segundos se for sucesso
    if (tipo === 'sucesso') {
      setTimeout(() => {
        mensagemElement.style.display = 'none';
      }, 5000);
    }
  }

  // Validar email em tempo real (blur event)
  const emailInput = document.getElementById('email');
  emailInput.addEventListener('blur', async function() {
    const email = emailInput.value.trim();
    if (email && emailValido(email)) {
      try {
        const response = await fetch('/api/usuarios/verificar-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        
        if (!response.ok) {
          console.error('Erro ao verificar email. Status:', response.status);
          return;
        }
        
        const data = await response.json();
        
        if (data.emailExiste) {
          emailInput.setCustomValidity('Este email já está em uso');
          emailInput.classList.add('erro');
          mostrarMensagem('Este email já está cadastrado. Por favor, use outro email.', 'erro');
        } else {
          emailInput.setCustomValidity('');
          emailInput.classList.remove('erro');
          if (mensagemElement.textContent.includes('email já está cadastrado')) {
            mensagemElement.style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Erro ao verificar email:', error);
      }
    }
  });

  // Função para validar formato de email
  function emailValido(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Lidar com o envio do formulário
  formularioCadastro.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const email = emailInput.value.trim();
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmarSenha').value;

    // Validações básicas
    if (!nome || !email || !senha || !confirmar) {
      mostrarMensagem('Por favor, preencha todos os campos', 'erro');
      return;
    }
    
    if (!emailValido(email)) {
      mostrarMensagem('Por favor, insira um email válido', 'erro');
      return;
    }
    
    if (senha.length < 6) {
      mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'erro');
      return;
    }

    if (senha !== confirmar) {
      mostrarMensagem('As senhas não coincidem', 'erro');
      return;
    }
    
    try {
      // Mostrar indicador de carregamento
      mostrarMensagem('Processando...', 'info');
      
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      
      // Verificar o tipo de conteúdo da resposta
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Resposta não-JSON recebida:', textResponse);
        mostrarMensagem('O servidor retornou uma resposta inválida', 'erro');
        return;
      }
      
      const data = await response.json();
      if (!response.ok) {
        mostrarMensagem(data.erro || 'Erro ao cadastrar usuário', 'erro');
        return;
      }
      
      // Cadastro bem-sucedido
      mostrarMensagem('Usuário cadastrado com sucesso!', 'sucesso');
      formularioCadastro.reset();
      console.log('Agendando redirecionamento para entrar.html');
      setTimeout(() => {
        console.log('Redirecionando agora...');
        window.location.href = 'entrar.html';
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      mostrarMensagem('Erro ao conectar com o servidor: ' + error.message, 'erro');
    }
  });
});