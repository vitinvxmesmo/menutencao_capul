// ================= TEMPLATE DE EMAIL =================

function gerarEmailNovaOS(os) {

  return `
    <h2>Nova Ordem de Serviço</h2>

    <p><b>Número:</b> ${os.numero}</p>
    <p><b>Solicitante:</b> ${os.solicitante}</p>
    <p><b>Prioridade:</b> ${os.prioridade}</p>
    <p><b>Descrição:</b> ${os.descricao}</p>

    <br>

    <a href="https://seuportal/os/${os.numero}"> 
     Abrir Ordem de Serviço
    </a>
  `;
}

module.exports = { gerarEmailNovaOS };
