// ================= CONFIGURAÇÃO DE EMAIL =================
module.exports = {

  // Servidor, verifica se ta certo, peguei no google.
  host: "mail.capul.com.br",

  // Coloquei 587 pq geralmente é um padrão TLS, mas se não for, é só alterar.
  port: 587,

  // Segurança:

  secure: false,

  // Credenciais da conta de envio
  auth: {
    user: "fernando.ti@capul.com.br",
    pass: "........." // Só colocar sua senha aqui, Ferdinando.
  }

};
