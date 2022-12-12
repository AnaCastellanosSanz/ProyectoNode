const createError = require("../errors/create-error")

const isAuthPassport = (req, res, next) => {
    // req.isAuthenticated devuelve un true si está autenticado y un false si no lo está, si está autenticado le devolveremos un next y si no lo está le devolveremos un mensaje de error.
    if (req.isAuthenticated()) {
        return next();
    } else {
        // Se pone 401 porque es cuando un usuario no está autorizado.
        return next(createError('No tienes permisos', 401));
    }
};

//Exportamos
module.exports = isAuthPassport;

