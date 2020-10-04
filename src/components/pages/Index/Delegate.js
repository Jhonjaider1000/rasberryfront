import Swal from "sweetalert2";

class Delegate {
  constructor(db) {
    this.db = db;
  }

  getListHealthEntities = () => {
    return this.db.collection("health_entities").get();
  };

  addUser = (data) => {
    const {
      temperatura,
      documento,
      nombres,
      apellidos,
      eps,
      telefono,
      rh,
      fecha_nacimiento,
      tipo,
    } = data;
    return this.db.collection("user").add({
      temperatura,
      documento,
      nombres,
      apellidos,
      eps,
      rh,
      fecha_nacimiento,
      telefono,
      tipo,
    });
  };

  getUserByDocument = (documento) => {
    return this.db.collection("user").where("documento", "=", documento).get();
  };

  getIndexData = (index, data = []) => {
    if (data.length > index) {
      return data[index];
    }
    return "Indefinido";
  };

  validForm = (data) => {
    const { documento, telefono, eps, tipo, sintomas } = data;
    if (typeof telefono !== "string" || telefono.trim() == "") {
      return { res: false, message: "Por favor ingrese su teléfono." };
    }
    if (typeof eps !== "string" || eps.trim() == "") {
      return { res: false, message: "Por favor seleccione su eps." };
    }
    if (typeof tipo !== "string" || tipo.trim() == "") {
      return {
        res: false,
        message: "Por favor seleccione el tipo de usuario.",
      };
    }
    if (typeof sintomas !== "string" || sintomas.trim() == "") {
      return {
        res: false,
        message: "Por favor seleccione su estado/síntomas.",
      };
    }
    if (typeof documento !== "string" || documento.trim() == "") {
      return {
        res: false,
        message:
          "No hemos detectado la lectura de su documento , por favor realice la lectura nuevamente.",
      };
    }
    return { res: true };
  };

  sendForm = (data, temperature, device, callback) => {
    const res = this.validForm(data);
    if (!res.res) {
      Swal.fire("Complete el formulario", res.message, "error");
      return;
    }
    const { documento, sintomas } = data;

    //Buscamos el usuario primero...
    this.getUserByDocument(documento).then(async (response) => {
      console.log(response);
      let user = null;
      if (response.code > 0) {
        user = await this.updateUser(response.data[0].id, data);
        if (user.code > 0) {
          user = response.data[0];
        }
      } else {
        user = await this.addUser(data);
        if (user.code > 0) {
          user = await this.getUserByDocument(documento);
          if (user.code > 0) {
            user = user.data[0];
          } else {
            user = null;
          }
        }
      }
      if (user) {
        const resHistory = await this.addHistory(
          user,
          sintomas,
          device,
          temperature
        );
        if (resHistory.code > 0) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Se ha registrado el historial correctamente.",
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Lo sentimos, no se pudo registrar el historial.",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else {
        Swal.fire(
          "Error",
          "Lo sentimos, no pudimos enviar la información.",
          "error"
        );
      }

      typeof callback === "function" && callback(user);
    });
  };

  updateUser = (id, data) => {
    const {
      temperatura,
      documento,
      nombres,
      apellidos,
      eps,
      telefono,
      rh,
      fecha_nacimiento,
      tipo,
    } = data;
    return this.db.collection("user").update(id).set({
      temperatura,
      documento,
      nombres,
      apellidos,
      eps,
      telefono,
      rh,
      fecha_nacimiento,
      tipo,
    });
  };

  addHistory = (user, sintomas, device, temperature) => {
    console.log(user, sintomas, device, temperature);
    return this.db.collection("history").add({
      id_user: user.id,
      documento: user.documento,
      temperatura: temperature,
      sintomas: sintomas,
      device: device,
    });
  };
}

export default Delegate;
