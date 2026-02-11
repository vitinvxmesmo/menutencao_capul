const nodemailer = require("nodemailer");
const emailConfig = require("./emailConfig");

// Isso é a conexão com o servidor Zimbra
const transporter = nodemailer.createTransport({

  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,

  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass
  },

  tls: {
    rejectUnauthorized: false
  }
});

// ================= FUNÇÃO DE ENVIO =================
// Função genérica para reutilizar no sistema inteiro

async function enviarEmail({ para, assunto, html }) {

  try {

    const info = await transporter.sendMail({

      from: `"Portal de Suporte" <${emailConfig.auth.user}>`,

      to: para,

      subject: assunto,

      html: html
    });

    console.log("✅ Email enviado com sucesso:", info.messageId);

  } catch (erro) {

    console.error("❌ Erro ao enviar email:", erro);

  }
}

module.exports = { enviarEmail };
