import Exec from "./Exec";

export const TYPE_WHERE = {
  AND: "AND",
  OR: "OR",
};

class Collection {
  constructor(collection, config = {}) {
    this.collection = collection;
    this.config = { ...config };
    this.config.arrayWheres = [];
    return this;
  }

  get() {
    const promise = new Exec(
      this.collection,
      this.config,
      this.arrayWheres
    ).get(this.arrayWheres);
    promise.onSnapshot = () => {
      //Aquí deberíamos ejecutar la promesa cada vez que surga algún cambio en nuestra bd.
    };
    return promise;
  }

  where(field, condition, value) {
    this.config.arrayWheres.push({
      field: field,
      condition: condition,
      value: value,
      type: TYPE_WHERE.AND,
    });
    return this;
  }

  orWhere(field, condition, value) {
    this.config.arrayWheres.push({
      field: field,
      condition: condition,
      value: value,
      type: TYPE_WHERE.OR,
    });
    return this;
  }

  findById(id) {
    return this.doc(id);
  }

  doc(id) {
    const methods = {
      set: (obj) => {
        const promise = new Exec(this.collection, this.config).update(obj, id);
        return promise;
      },
      delete: () => {
        const promise = new Exec(this.collection, this.config).delete(id);
        return promise;
      },
    };
    return methods;
  }

  set(id) {
    const promise = new Exec(this.collection, this.config).set();
  }

  limit() {}

  groupBy() {}

  find() {}

  add(obj) {
    const promise = new Exec(this.collection, this.config).add(obj);
    return promise;
  }

  update(id) {
    return this.doc(id);
  }

  delete(id) {
    this.doc(id);
  }
}

export default Collection;
