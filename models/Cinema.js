// Información de la base de datos de cinemas.

const mongoose = require('mongoose');

// new mongoose.Schema nos permite crear un nuevo esquema que va a seguir una colección.
const cinemaSchema = new mongoose.Schema(
  {
    //Datos de la colección.
    name: { type: String, required: true },
    location: { type: String, required: true },
    movies: [{ type: mongoose.Types.ObjectId, ref: 'Movie' }],
  },
  {
    // Timestamps: Nos añade la fecha de creación y de edición de cada elemento al documento guardado en la base de datos.
    timestamps: true,
  }
);

//Creamos el modelo de cine y lo exportamos.
const Cinema = mongoose.model('Cinema', cinemaSchema);
module.exports = Cinema;