import React, { useEffect, useState } from "react";
import { Body, ContentIndex, Header } from "./styles";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import { Alert, AlertTitle } from "@material-ui/lab";
import Deplyn from "../../../Consumer/DeplynConsumer";
import configJSON from "../../../config.json";

const SOCKET_MESSAGES = {
  FETCH: "FETCH",
  WELCOME: "WELCOME",
  SET_GROUP: "SET_GROUP",
  GET_LAST_USER: "GET_LAST_USER",
  NEW_LAST_USER: "NEW_LAST_USER",
  ADD_HISTORY: "ADD_HISTORY",
  ADD_USER: "ADD_USER",
};

export default () => {
  const socket = Deplyn.socket();

  const getInitObj = () => {
    return {
      temperatura: "0",
      documento: "",
      nombres: "",
      apellidos: "",
      eps: "",
      telefono: "",
      tipo: "",
      sintomas: "",
    };
  };
  const [data, setData] = useState(getInitObj());

  useEffect(() => {
    initApp();
  }, []);

  var getParams = function (url) {
    var params = {};
    var parser = document.createElement("a");
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  };

  const getDevice = () => {
    const params = getParams(window.location.href);
    const device = params.device;
    return device ? device : 1;
  };

  const onChange = (event) => {
    const control = event.target;
    const { name, value } = control;
    setData({ ...data, [name]: value });
  };

  const onMessage = (msg) => {
    console.log(msg);
    if (msg.type === SOCKET_MESSAGES.WELCOME) {
      socket.sendMessage({
        type: SOCKET_MESSAGES.SET_GROUP,
        dispositivo: getDevice(),
      });
    } else if (msg.type === SOCKET_MESSAGES.NEW_LAST_USER) {
      if (!msg.data) {
        return;
      }
      setData({
        ...data,
        ...msg.data,
      });
    }
  };

  const initApp = () => {
    Deplyn.initializeApp({
      apisURL: configJSON.apiurl,
      socketURL: configJSON.socketurl,
      prefix: "api",
    });

    socket.onMessage(onMessage);
  };

  const enviarFormulario = () => {
    const db = Deplyn.database();
    const {
      temperatura,
      documento,
      nombres,
      apellidos,
      eps,
      telefono,
      tipo,
      sintomas,
    } = data;

    const addUser = () => {
      db.collection("user")
        .add({
          temperatura,
          documento,
          nombres,
          apellidos,
          telefono,
          eps,
          tipo,
        })
        .then((response) => {
          if (response.code > 0) {
            db.collection("history")
              .update(data.id)
              .set({ sintomas: sintomas });
            setData(getInitObj());
          }
        });
    };
    db.collection("user")
      .where("documento", "=", documento)
      .get()
      .then((response) => {
        if (response.code <= 0) {
          addUser();
        } else {
          setData(getInitObj());
          db.collection("history").update(data.id).set({ sintomas: sintomas });
          setData(getInitObj());
        }
      })
      .catch(() => {
        addUser();
      });
  };

  const getClassTemperatura = () => {
    if (data.temperatura < 35) {
      return "success temp";
    }
    if (data.temperatura >= 37) {
      return "danger temp";
    }
    if (data.temperatura >= 35) {
      return "warning temp";
    }
    return "temp";
  };

  return (
    <ContentIndex>
      <div className="container custom">
        <Header>
          <img
            src={`${process.env.PUBLIC_URL}/img/covid-logo.svg`}
            className="logo animate__animated animate__bounce"
          />
          <h1 className="title">COVID-19 - Analizer</h1>
        </Header>
        <Body>
          <div className="row">
            <div className="col-12 pb-3">
              <Alert severity="info">
                <AlertTitle>Información</AlertTitle>
                Esta información solo será usada para efectos de cerco
                epidemiológico por <strong>Covid-19</strong>.
              </Alert>
            </div>
            <div className="col-md-4">
              <TextField
                label="Temperatura"
                id="temperatura"
                margin="normal"
                name="temperatura"
                value={data.temperatura}
                fullWidth={true}
                size="small"
                onChange={onChange}
                className={getClassTemperatura()}
                variant="outlined"
              />
            </div>
            <div className="col-md-8">
              <TextField
                label="Documento"
                id="documento"
                name="documento"
                margin="normal"
                fullWidth={true}
                onChange={onChange}
                size="small"
                value={data.documento}
                required
                variant="outlined"
              />
            </div>
            <div className="col-6">
              <TextField
                label="Nombres"
                id="nombres"
                name="nombres"
                margin="normal"
                fullWidth={true}
                value={data.nombres}
                size="small"
                onChange={onChange}
                required
                variant="outlined"
              />
            </div>
            <div className="col-6">
              <TextField
                label="Apellidos"
                id="apellidos"
                name="apellidos"
                value={data.apellidos}
                margin="normal"
                fullWidth={true}
                onChange={onChange}
                size="small"
                required
                variant="outlined"
              />
            </div>
            <div className="col-6">
              <TextField
                label="Teléfono"
                id="telefono"
                name="telefono"
                value={data.telefono}
                onChange={onChange}
                margin="normal"
                fullWidth={true}
                size="small"
                required
                variant="outlined"
              />
            </div>
            <div className="col-6">
              <TextField
                label="EPS"
                id="eps"
                name="eps"
                value={data.eps}
                margin="normal"
                fullWidth={true}
                onChange={onChange}
                size="small"
                required
                variant="outlined"
              />
            </div>
            <div className="col-6 pt-3">
              <FormControl
                variant="outlined"
                name="tipo"
                fullWidth={true}
                size="small"
                required
              >
                <InputLabel id="labelTipo">Tipo</InputLabel>
                <Select
                  labelId="labelTipo"
                  id="tipo"
                  name="tipo"
                  fullWidth={true}
                  size="small"
                  onChange={onChange}
                  value={data.tipo}
                  label="Tipo"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  <MenuItem value={"E"}>Empleado</MenuItem>
                  <MenuItem value={"V"}>Visitante</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-6 pt-3">
              <FormControl
                variant="outlined"
                fullWidth={true}
                name="sintomas"
                size="small"
                required
              >
                <InputLabel id="labelSintomas">Síntomas</InputLabel>
                <Select
                  labelId="labelSintomas"
                  id="sintomas"
                  name="sintomas"
                  fullWidth={true}
                  size="small"
                  value={data.sintomas}
                  onChange={onChange}
                  label="Síntomas"
                >
                  <MenuItem value="S">Con Síntomas</MenuItem>
                  <MenuItem value="N">Sín Síntomas</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-12 pt-3 text-right">
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={enviarFormulario}
              >
                Enviar
              </Button>
            </div>
          </div>
        </Body>
      </div>
    </ContentIndex>
  );
};
