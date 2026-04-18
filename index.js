const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  // Save login session
  sock.ev.on("creds.update", saveCreds);

  // Connection handler
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log("Connection closed. Reconnecting...", shouldReconnect);

      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
    }

    if (update.qr) {
      console.log("📱 Scan QR from WhatsApp");
    }
  });

  // Messages handler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    const from = msg.key.remoteJid;

    if (!text) return;

    console.log("User said:", text);

    let reply = "🤖 Default reply";

    if (text.toLowerCase() === "hi") {
      reply = "👋 Hello! Kaise ho?";
    } else if (text.toLowerCase() === "price") {
      reply = "💰 Price is ₹100";
    }

    await sock.sendMessage(from, { text: reply });
  });
}

startBot();
