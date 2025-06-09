"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
require("dotenv/config");
let PORT = 3002;
// creates express app, registers all controller routes and returns you express app instance
const app = (0, routing_controllers_1.createExpressServer)({
    //cors: true,
    routePrefix: "/bp",
    controllers: [
        __dirname + "/controllers/*{.js,.ts}",
    ], // we specify controllers we want to use
});
// run express application on port 3000
app.listen(PORT, () => {
    console.log(`Servidor Iniciado`);
    console.log(`Host: http://localhost:${PORT}`);
    console.log(`Fecha/Hora: ${new Date().toLocaleString()}`);
});
