import Collection from "./Collection";

class Database {
  constructor(config) {
    this.config = config;
  }
  collection(collection) {
    if (typeof collection !== "string") {
      throw new Error("collection param must be string type.");
    }
    return new Collection(collection, this.config);
  }
}
export default Database;
