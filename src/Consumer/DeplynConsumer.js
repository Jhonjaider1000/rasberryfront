import Database from "./Database";
import { initSocket, sendMessage, onMessage } from "./Listeners";

class DeplynConsumer {
  constructor(url) {
    this.url = url;
  }

  initializeApp(config = null) {
    this.config = config;
    this.config.socket = initSocket(config.socketURL);    
    this.config.sendMessage = sendMessage;
    this.config.onMessage = onMessage;
  }

  database() {
    return new Database(this.config);
  }

  socket() {
    return {
      sendMessage: (msg) => {
        this.config.sendMessage(msg);
      },
      onMessage: (callback) => {
        this.config.onMessage(callback);
      }
    };
  }
}

export default new DeplynConsumer();
