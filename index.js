//Lo primero que tenemos que hacer es requerir dotenv, esta función preparará nuestro entorno de manera que todas las variables del archivo .env estén accesibles para nuestra aplicación.
require('dotenv').config();

//Inicializamos:
const express = require('express');
const moviesRouter = require('./routes/movie.routes.js');
const cinemaRouter = require('./routes/cinema.routes.js');
const connect = require('./utils/db/connect.js');
const cors = require('cors');
const createError = require('./utils/errors/create-error.js');
const passport = require('passport');
const userRouter = require('./routes/user.routes.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require("path");
const cloudinary = require("cloudinary");



const DB_URL = process.env.DB_URL;


// Me conecta a la base de datos.
connect();



//Creamos el puerto.
const PORT = process.env.PORT || 3000;
//Creamos el servidor.
const server = express();



//CLOUDINARY - Se pone antes de que se suban los archivos.
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_SECRET, 
  });



// Evita errores de CORS.
server.use(cors());
// Nos permite parsear los body de las peticiones POST y PUT que vienen como JSON.
server.use(express.json());
// Nos permite parsear los body de las peticiones POST y PUT que vienen como string o array.
server.use(express.urlencoded({ extended: false }));

// Express.static nos crea la ruta en la que vamos a servir destro de nuestro servidor archivos estáticos.
//Path es la ruta desde nuestros servidores a la carpeta actual.
server.use(express.static(path.join(__dirname, 'public')));



//-- PASSPORT --

//La parte de la autentificación se realizará antes de inicializarse las rutas, para que a las rutas no les llegue un usuario que no ha sido autenticado.
//Ejecuta el archivo de passport.
require('./utils/authentication/passport.js');
// Una vez passport.use ha preparado todas las estrategias, inicialice passport.
server.use(passport.initialize());



// Creamos gestión de sesiones.
// Recibe configuración de la sesión.
server.use(session({
    //Código secreto que va a aplicar nuestro servidor para encriptar y desencriptar sesiones para poder trabajar con ellas. (Este código no debe conocerlo nadie para no permitir el poder hackear nuestro servidor)
    secret: process.env.SESSION_SECRET_KEY,
    //Nos indica si queremos que se vuelva a guardar la sesión sin que haya modificación.
    resave: false,
    //Lo ponemos a false porque queremos que se gestione a través de passport y no por express-session.
    saveUninitialized: false,
    cookie: {
        maxAge: 120000 // Milisegundos hasta que la cookie caduca, normalmente se pone 3600000 que es lo correspondiente a una hora.
    },
    //El store es un almacén donde se guardan las sesiones activas de los usuarios, de esta manera cuando vaya a mongo en la parte de sesiones podré ver toda la información y que por mucho que el servidor se haya reiniciado seguimos sabiendo que haya una sesión de usuario.
    store: MongoStore.create({
        mongoUrl: DB_URL
    })

}));

// Inicializa passport.
server.use(passport.initialize());
// Utilizamos la sesión con passport.
server.use(passport.session());


//Mensaje para que se muestre cuando alguien entre a mi ruta vacía. 
server.get('/', (req, res) => {
    res.json("Bienvenido a mi API de películas")
});


//-- RUTAS --
server.use('/user', userRouter);
server.use('/movies', moviesRouter);
server.use('/cinemas', cinemaRouter);

// Cualquier ruta que no haya sido identificada en los anteriores server use entrará por aquí e indicará el siguiente error:
server.use('*', (req, res, next) => {
    next(createError('Esta ruta no existe', 404));
});



// -- MANEJO DE ERRORES --
// Además de los típicos req, res y next se añade un parámetro error
// - Error: error emitido desde el paso previo del servidor
server.use((err, req, res, next) => {
    return res.status(err.status || 500).json(err.message || 'Unexpected error');
});

server.listen(PORT, () => {
    console.log (`El servidor está escuchando en http://localhost:${PORT}`);
});

module.exports = server; 