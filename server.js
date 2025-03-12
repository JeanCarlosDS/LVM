// server.js

const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'seu_usuario',         // substitua pelo seu usuário do MySQL
  password: 'sua_senha',       // substitua pela sua senha do MySQL
  database: 'seu_banco_de_dados' // substitua pelo nome do seu banco de dados
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com o banco de dados estabelecida.');
});

// Chave secreta para assinatura do JWT (idealmente armazenada em variável de ambiente)
const JWT_SECRET = 'sua_chave_secreta_aqui';

// Endpoint POST /auth/login para autenticação do usuário
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validação simples dos dados de entrada
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  // Consulta para verificar se o usuário existe
  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    // Se nenhum usuário for encontrado, retorna erro de credenciais inválidas
    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const user = results[0];

    // Comparar a senha enviada com a senha armazenada (hash)
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Se as credenciais forem válidas, gera um token JWT com validade de 1 hora
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token });
  });
});

// Inicializa o servidor na porta definida ou na porta 3000 por padrão
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});