/**
 * Los indicativos...
 * Media movil de 8 periodos...
 * Media movil de 20 periodos, es el promedio de las 20 velas anteriores...
 * Media movil de 200 periodos, el promedio de las 200 velas anteriores...
 * Tener en cuenta los osos y toros 180 y elefantes...
 */
import io from "socket.io-client";
let socket = null;

export const initSocket = (url) => {
  socket = io(url);
  return socket;
};

export const sendMessage = (msg) => {
  socket.emit("message", msg);
};

export const onConnect = (callback) => {
  socket.on("connect", () => {
    if (typeof callback == "function") {
      callback();
    }
  });
};

export const onDisconnect = () => {
  socket.on("disconnect", () => {
    alert("Te has desconectado, comprueba tu conexión a internet.");
    console.log("Desconectado.");
  });
};

export const onMessage = (callback) => {
  socket.on("message", (msg) => {
    typeof callback == "function" && callback(msg);
  });
};
