const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

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

  // connection handler (IMPORTANT FIXED)
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp Connected Successfully!");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Disconnected. Code:", statusCode);

      // prevent infinite loop crash
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("🔁 Reconnecting in 3 seconds...");
        setTimeout(() => {
          startBot();
        }, 3000);
      } else {
        console.log("⚠️ Logged out. Please rescan QR.");
      }
    }
  });

  // message handler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message) return;

      const from = msg.key.remoteJid;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text;

      if (!text) return;

      console.log("📩 Message:", text);

      let reply = "🤖 I am bot";

      const msgText = text.toLowerCase();

      if (msgText === "hi") {
        reply = "👋 Hello! Kaise ho?";
      } else if (msgText === "price") {
        reply = "💰 Price is ₹100";
      } else if (msgText === "menu") {
        reply = "📌 Menu:\n1. hi\n2. price";
      }

      await sock.sendMessage(from, { text: reply });

    } catch (err) {
      console.log("Message error:", err);
    }
  });
}

// crash protection
process.on("uncaughtException", (err) => {
  console.log("Crash fixed:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("Promise error:", err);
});

startBot();
