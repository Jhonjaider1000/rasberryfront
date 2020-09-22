import { get as getProp } from "object-path";

class Exec {
  constructor(collection, config) {
    this.collection = collection;
    this.config = config;
  }

  getURL(uri) {
    return `${this.config.apisURL}/${this.config.prefix}/${uri}`;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "Array-Wheres": JSON.stringify(getProp(this.config, "arrayWheres", [])),
    };
  }

  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(response.statusText);
    throw error;
  }

  parseJSON(response) {
    return response.json();
  }

  request({ url, data = null, method = "GET" }) {
    return new Promise((resolve, reject) => {
      const headers = this.getHeaders();
      const fetchConfig = {
        headers,
        method: method,
        body: data ? JSON.stringify(data) : null,
      };

      fetch(url, fetchConfig)
        .then(this.checkStatus)
        .then((response) => {
          resolve(this.parseJSON(response));
        })
        .catch(reject);
    });
  }

  get() {
    const url = this.getURL(this.collection);
    return this.request({ url: url });
  }

  update(obj, id) {
    const url = this.getURL(this.collection);
    return this.request({ url: `${url}/${id}`, method: "PUT", data: obj });
  }

  delete(id) {
    const url = this.getURL(this.collection);
    return this.request({ url: `${url}/${id}`, method: "DELETE" });
  }

  add(obj) {
    const url = this.getURL(this.collection);
    return this.request({ url: `${url}`, method: "POST", data: obj });
  }
}

export default Exec;
