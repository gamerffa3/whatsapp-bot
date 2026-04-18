const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

async function startBot() {
  console.log("🚀 Bot starting...");

  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ["Railway Bot", "Chrome", "1.0.0"]
  });

  // save session
  sock.ev.on("creds.update", saveCreds);

  // connection handler
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Disconnected. Code:", code);

      if (code !== DisconnectReason.loggedOut) {
        console.log("🔁 Reconnecting...");
        startBot();
      } else {
        console.log("⚠️ Logged out. QR scan again needed.");
      }
    }
  });

  // messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    console.log("📩 Message:", text);

    let reply = "🤖 I am bot";

    if (text.toLowerCase() === "hi") {
      reply = "👋 Hello!";
    }

    if (text.toLowerCase() === "price") {
      reply = "💰 Price is ₹100";
    }

    await sock.sendMessage(from, { text: reply });
  });
}

startBot();
