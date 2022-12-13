// Info de la base de datos de movies.

const mongoose = require('mongoose');

// new mongoose.Schema nos permite crear un nuevo esquema que va a seguir una colección.
const movieSchema = new mongoose.Schema(
    {
        
        //Datos de la colección.
        title: { type: String, required: true },
        director: { type: String, required: true },
        year: { type: Number, required: true },
        genre: {type: String, required: true },
        picture: String

    },
    {
         // Timestamps: Nos añade la fecha de creación y de edición de cada elemento al documento guardado en la base de datos.
        timestamps: true,
    }
);

//Creamos el modelo de película y lo exportamos. 
const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;