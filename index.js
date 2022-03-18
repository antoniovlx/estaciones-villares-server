const path = require("path");

if (process.env.NODE_ENV !== 'production') {
  const result = require("dotenv").config()

  if (result.error) {
    throw result.error
  }
}

const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
const mqtt = require('./mqtt/index')
const db = require('./db/index')


// Creamos el servidor de sockets y lo incorporamos al servidor de la aplicación
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

// Especificamos el puerto en una varibale port, incorporamos cors, express 
// y la ruta a los archivo estáticos (la carpeta public)
app.set("port", 3000);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

function originIsAllowed(origin) {
  // Para evitar cualquier conexión no permitida, validamos que 
  // provenga de el cliente adecuado, en este caso del mismo servidor. 
  if (origin === "http://localhost:8100") {
    return true;
  }
  return false;
}

// llegan datos de las estaciones
mqtt.client.on('message', function (topic, message) {
  console.log(message.toString());
  let data = JSON.parse(message.toString());
  db.save(data);
})


// Cuando llega un request por sockets validamos el origen
// En caso de origen permitido, recibimos el mensaje y lo mandamos
// de regreso al cliente
wsServer.on("request", (request) => {
  if (!originIsAllowed(request.origin)) {
    // Sólo se aceptan request de origenes permitidos
    request.reject();
    console.log((new Date()) + ' Conexión del origen ' + request.origin + ' rechazada.');
    return;
  }
  const connection = request.accept(null, request.origin);
  
  /*connection.on("message", (message) => {
      console.log("Mensaje recibido: " + message.utf8Data);
      connection.sendUTF("Recibido: " + message.utf8Data);
  });*/

  connection.on("close", (reasonCode, description) => {
    console.log("El cliente se desconecto");
  });
});

server.listen(app.get('port'), () => {
  console.log(`Server is running on ` + app.get('port'));
});

app.get('/api/data', (req, res) => {
  if(Object.entries(req.query).length === 0){
    db.getAll(data => {
      res.json(JSON.stringify(data));
    });
  }else{
    db.search((data) => {
      res.json(JSON.stringify(data));
    }, req.query);
  }
});

app.get('/api/stations', (req, res) => {
  db.getStations(data => {
    res.json(JSON.stringify(data));
  });
});

/*
app.post('/api/user', (req, res) => {
  const user = req.body.user;
  users.push(user);
  res.json("user addedd");
});
*/