require('dotenv').config({ path: '../.env' });
const { enviarConvite } = require('./src/services/emailService');

async function testEmail() {
  try {
    console.log("Tentando enviar e-mail...");
    await enviarConvite({
      nome: 'Teste Local',
      email: process.env.EMAIL_USER, // manda para o próprio remetente para testar
      token: '1234567890abcdef'
    });
    console.log("E-mail enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
}

testEmail();
