const { enviarEmail } = require("./emailService");
const { gerarEmailNovaOS } = require("./osEmailTemplate");

// ================= CRIAÇÃO DA OS =================

async function criarOS(req, res) {

  const novaOS = {
    numero: 1024,
    solicitante: "João",
    prioridade: "Alta",
    descricao: "Computador não liga"
  };

  // ================= ENVIO DE EMAIL =================

  await enviarEmail({

    para: ["fernando.ti@capul.com.br"],

    assunto: `Nova OS criada – #${novaOS.numero}`,

    html: gerarEmailNovaOS(novaOS)
  });

  res.send("OS criada com sucesso");
}

module.exports = { criarOS };
