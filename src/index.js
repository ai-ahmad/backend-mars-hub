require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
// const socketHandler = require("./sockets/socket");

const PORT = process.env.PORT || 5000;
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Подключаем сокеты
// socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server: ${DOMAIN}`);
  console.log(`Swagger: ${DOMAIN}/swagger`);
});
