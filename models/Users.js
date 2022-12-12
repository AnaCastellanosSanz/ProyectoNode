
const mongoose = require('mongoose');

// new mongoose.Schema nos permite crear un nuevo esquema que va a seguir una colección.
const userSchema = new mongoose.Schema({
      //Pasamos los datos que queremos que tenga:
    email: {
        type: String,
        required: true,
        unique: true,
        // Match: matchea los valores contra una regex y si no cumple con la expresión regular recibirá el mensaje de error.
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'El email no tiene un formato válido']
    },
    password: { type: String, required: true },
}, {
     // Timestamps: Nos añade la fecha de creación y de edición de cada elemento al documento guardado en la base de datos.
    timestamps: true
});

//Creamos el modelo de usuario y lo exportamos.
const User = mongoose.model('User', userSchema);
module.exports = User;
