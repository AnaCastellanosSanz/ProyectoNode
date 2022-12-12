
const mongoose = require('mongoose');

// Almacenamos en una constante la url obtenida desde Mongo Atlas. (Sustituimos contraseña por la del usuario).
const DB_URL = process.env.DB_URL;


// La función connect permite conectar nuestro servidor a MongoDB.
const connect = () => {
    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
};

module.exports = connect;