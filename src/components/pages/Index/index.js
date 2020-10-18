import React, { useEffect, useRef, useState } from "react";
import { Body, ContentIndex, Header, KeyBoard } from "./styles";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import { Alert, AlertTitle } from "@material-ui/lab";
import Deplyn from "../../../Consumer/DeplynConsumer";
import configJSON from "../../../config.json";
import Delegate from "./Delegate";
import moment from "moment";
import BackspaceIcon from "@material-ui/icons/Backspace";
import DoneOutlineOutlinedIcon from "@material-ui/icons/DoneOutlineOutlined";

const develop = false;
const DEVELOP_CAPTURE =
  "0080124664TabShiftaShiftmShifteShiftzShiftqShiftuShiftiShifttShiftaTabShiftjShiftuShiftaShiftnTabShiftcShiftaShiftrShiftlShiftoShiftsTabShiftmTab1981-10-15TabShifto+";

const SOCKET_MESSAGES = {
  FETCH: "FETCH",
  WELCOME: "WELCOME",
  SET_GROUP: "SET_GROUP",
  GET_LAST_USER: "GET_LAST_USER",
  NEW_LAST_USER: "NEW_LAST_USER",
  ADD_HISTORY: "ADD_HISTORY",
  ADD_USER: "ADD_USER",
  GET_TEMPERATURE: "GET_TEMPERATURE",
};

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

export default () => {
  const socket = Deplyn.socket();
  let delegate = null;
  let capture = useRef("");
  let interval = useRef(null);

  const getInitObj = () => {
    return {
      documento: "",
      nombres: "",
      apellidos: "",
      eps: "",
      telefono: "",
      tipo: "",
      sintomas: "",
      fecha_nacimiento: "",
      rh: "",
    };
  };
  const [data, setData] = useState(getInitObj());
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const [listHealthEntities, setListHealthEntities] = useState([]);
  const [loadingTemperature, setLoadingTemperature] = useState(false);

  const setCapture = (cap) => {
    capture = cap;
  };

  useEffect(() => {
    initApp();
    startCaptureEvent();
  }, []);

  const startCaptureEvent = () => {
    const invalidNames = ["telefono", "eps", "tipo", "sintomas"];
    document.querySelector("body").addEventListener("keydown", function (e) {
      const textInput = e.key || String.fromCharCode(e.keyCode);
      const control = e.target;
      const { name } = control;
      if (interval.current) {
        clearTimeout(interval.current);
      }
      if (invalidNames.includes(name) && interval.current == null) {
        return;
      }
      interval.current = setTimeout(() => {
        clearInterval(interval.current);
        interval.current = null;
      }, 200);
      e.preventDefault();
      setCapture(capture + textInput);
      if (e.keyCode === 13 || e.which === 13) {
        processCapture(capture);
        setCapture("");
      }
    });
  };

  const getObjCapture = (data = []) => {
    const obj = {};
    //Buscamos el indice inicial es decir el genéro.
    const initIndex = data.findIndex(
      (d) => `${d}`.toUpperCase() === "M" || `${d}`.toUpperCase() == "F"
    );
    obj.documento = delegate.getIndexData(0, data);
    if (initIndex >= 0) {
      //Solo un nombre y un apellido.
      if (initIndex == 3) {
        obj.nombres = delegate.getIndexData(2, data);
        obj.apellidos = delegate.getIndexData(1, data);
        // obj.fecha_nacimiento = delegate.getIndexData(4, data);
        // obj.rh = delegate.getIndexData(5, data);
      } else if (initIndex == 4) {
        obj.nombres = `${delegate.getIndexData(
          2,
          data
        )} ${delegate.getIndexData(3, data)}`;
        obj.apellidos = `${delegate.getIndexData(1, data)}`;
        // obj.fecha_nacimiento = delegate.getIndexData(5, data);
        // obj.rh = delegate.getIndexData(6, data);
      } else if (initIndex == 5) {
        obj.nombres = `${delegate.getIndexData(
          3,
          data
        )} ${delegate.getIndexData(4, data)}`;
        obj.apellidos = `${delegate.getIndexData(
          1,
          data
        )} ${delegate.getIndexData(2, data)}`;
        // obj.fecha_nacimiento = delegate.getIndexData(6, data);
        // obj.rh = delegate.getIndexData(7, data).replace("Enter", "");
      }
    }
    obj.eps = "";
    obj.telefono = "";
    obj.tipo = "";
    obj.sintomas = "";
    return obj;
  };

  const processCapture = (capture) => {
    const cap = develop
      ? DEVELOP_CAPTURE
      : capture.replace("[object Object]", "");
    const data = cap.replace(/\Shift/g, "").split("Tab");
    try {
      const msg = {
        type: SOCKET_MESSAGES.GET_TEMPERATURE,
        data: getObjCapture(data),
      };
      setLoadingTemperature(true);
      socket.sendMessage(msg);
      delegate.getUserByDocument(msg.data.documento).then((response) => {
        if (response.code > 0) {
          const d = response.data[0];
          // d.fecha_nacimiento = moment(d.fecha_nacimiento).format("YYYY-MM-DD");
          setData({ ...msg.data, ...d });
        } else {
          setData({ ...data, ...msg.data });
        }
      });
    } catch (error) {
      console.error("Error al parcear el objeto:", error);
    }
  };

  const onChange = (event) => {
    const control = event.target;
    const { name, value } = control;
    setData({ ...data, [name]: value });
  };

  const onMessage = (msg) => {
    if (msg.type === SOCKET_MESSAGES.WELCOME) {
      socket.sendMessage({
        type: SOCKET_MESSAGES.SET_GROUP,
        dispositivo: getDevice(),
      });
    } else if (msg.type === SOCKET_MESSAGES.GET_TEMPERATURE) {
      setLoadingTemperature(false);
      if (!msg.temperature) {
        return;
      }
      setTemperature(msg.temperature);
    }
  };

  const initApp = () => {
    Deplyn.initializeApp({
      apisURL: configJSON.apiurl,
      socketURL: configJSON.socketurl,
      prefix: "api",
    });

    delegate = new Delegate(Deplyn.database());
    delegate.getListHealthEntities().then((response) => {
      if (response.code > 0) {
        setListHealthEntities(response.data);
      }
    });
    socket.onMessage(onMessage);
  };

  const enviarFormulario = () => {
    setLoading(true);
    delegate = new Delegate(Deplyn.database());
    delegate.sendForm(
      data,
      temperature,
      getDevice(),
      () => {
        setData(getInitObj());
        setTemperature(0);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  };

  const getClassTemperatura = () => {
    if (temperature <= 37) {
      return "success temp";
    }
    if (temperature >= 38) {
      return "danger temp";
    }
    if (temperature > 37) {
      return "warning temp";
    }
    return "temp";
  };

  const keyboardAction = (num) => {
    if (num == "A") {
      setOpenDialog(false);
      return;
    }
    if (num == "C") {
      setData({ ...data, telefono: "" });
      return;
    }
    if (data.telefono.length > 18) {
      return;
    }
    setData({ ...data, telefono: data.telefono + num });
  };

  const render = () => {
    return (
      <ContentIndex>
        <Dialog onClose={() => setOpenDialog(false)} open={openDialog}>
          <KeyBoard>
            <div className="display">{data.telefono}</div>
            <div className="keys-buttons">
              <div className="keys-row">
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(7)}
                  >
                    7
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(8)}
                  >
                    8
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(9)}
                  >
                    9
                  </Button>
                </div>
              </div>
              <div className="keys-row">
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(4)}
                  >
                    4
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(5)}
                  >
                    5
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(6)}
                  >
                    6
                  </Button>
                </div>
              </div>
              <div className="keys-row">
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(1)}
                  >
                    1
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(2)}
                  >
                    2
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(3)}
                  >
                    3
                  </Button>
                </div>
              </div>
              <div className="keys-row">
                <div className="key-col">
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="default"
                    onClick={() => keyboardAction(0)}
                  >
                    0
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action default"
                    variant="contained"
                    color="secondary"
                    onClick={() => keyboardAction("C")}
                  >
                    <BackspaceIcon />
                  </Button>
                </div>
                <div className="key-col">
                  <Button
                    className="btn-action default"
                    variant="contained"
                    color="primary"
                    onClick={() => keyboardAction("A")}
                  >
                    <DoneOutlineOutlinedIcon />
                  </Button>
                </div>
              </div>
            </div>
          </KeyBoard>
        </Dialog>
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
              <div
                className={`col-md-4 temperature-content ${
                  loadingTemperature ? "active" : ""
                }`}
              >
                {loadingTemperature ? (
                  <div className="content-loader-temperature">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <span className="label">Leyendo...</span>
                  </div>
                ) : (
                  <TextField
                    label="Temperatura"
                    id="temperatura"
                    margin="normal"
                    name="temperatura"
                    value={temperature}
                    fullWidth={true}
                    size="small"
                    className={getClassTemperatura()}
                    variant="outlined"
                  />
                )}
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
                  disabled
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
                  disabled
                  onChange={onChange}
                  variant="outlined"
                />
              </div>
              <div className="col-6">
                <TextField
                  label="Apellidos"
                  id="apellidos"
                  name="apellidos"
                  disabled
                  value={data.apellidos}
                  margin="normal"
                  fullWidth={true}
                  onChange={onChange}
                  size="small"
                  variant="outlined"
                />
              </div>
              {/* <div className="col-6">
                <TextField
                  label="Fecha Nacimiento"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={data.fecha_nacimiento}
                  onChange={onChange}
                  margin="normal"
                  fullWidth={true}
                  size="small"
                  disabled
                  variant="outlined"
                />
              </div> */}
              {/* <div className="col-6">
                <TextField
                  label="RH"
                  id="rh"
                  name="rh"
                  value={data.rh}
                  onChange={onChange}
                  margin="normal"
                  fullWidth={true}
                  size="small"
                  disabled
                  variant="outlined"
                />
              </div> */}
              <div className="col-6">
                <div className="phone-group">
                  <TextField
                    label="Teléfono"
                    id="telefono"
                    name="telefono"
                    value={data.telefono}
                    onChange={onChange}
                    margin="normal"
                    fullWidth={true}
                    required
                    size="small"
                    disabled={true}
                    variant="outlined"
                  />
                  <Button
                    className="btn-action"
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenDialog(true)}
                  >
                    #
                  </Button>
                </div>
              </div>
              <div className="col-6 pt-3">
                <FormControl
                  variant="outlined"
                  fullWidth={true}
                  name="eps"
                  size="small"
                  required
                >
                  <InputLabel id="labelEps">Eps</InputLabel>
                  <Select
                    labelId="labelEps"
                    id="eps"
                    name="eps"
                    fullWidth={true}
                    size="small"
                    value={data.eps}
                    disabled={loading}
                    onChange={onChange}
                    label="Eps"
                  >
                    {listHealthEntities.map((entitie) => (
                      <MenuItem key={entitie.id} value={entitie.nit}>
                        {entitie.comercial_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="col-6 pt-3">
                <FormControl
                  variant="outlined"
                  name="tipo"
                  fullWidth={true}
                  size="small"
                  disabled={loading}
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
                  disabled={loading}
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
                {loading && (
                  <div className="content-loader-send">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only"> Enviando...</span>
                    </div>
                    <span className="label"> Enviando...</span>
                  </div>
                )}
                {!loading && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      color="default"
                      className="mr-3"
                      onClick={() => {
                        setTemperature(0);
                        setLoadingTemperature(false);
                        setData(getInitObj());
                      }}
                    >
                      Limpiar
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      onClick={enviarFormulario}
                    >
                      Enviar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Body>
        </div>
      </ContentIndex>
    );
  };
  return render();
};
