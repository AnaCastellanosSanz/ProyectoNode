//Si un usuario quiere registrarse desde Postman:

//Inicializamos:
const express = require('express');
const passport = require('passport');
const User = require('../models/Users');
const createError = require('../utils/errors/create-error');

const userRouter = express.Router();


//El método de registro será un post ya que tiene que pasar información el usurario en el body y vamos a crear un nuevo usuario.
userRouter.post('/register', (req, res, next) => {
    // Función done que le llega a la estrategia en passport.js
    const done = (err, user) => {
        if (err) {
            return next(err);
        }
        // Nos permite iniciar sesión con el usuario creado.
        req.logIn(
            user,
            (err) => {
                if (err) {
                    return next(err);
                }
                return res.status(201).json(user);
            }
        );
    };

    // Creamos el autenticador de usuarios y lo ejecutamos con la request actual.
    passport.authenticate('register', done)(req);
});

userRouter.post('/login', (req, res, next) => {
    // Función done que le llega a la estrategia en passport.js
    const done = (err, user) => {
        if (err) {
            return next(err);
        }
        // Nos permite iniciar sesión con el usuario creado.
        req.logIn(
            user,
            (err) => {
                if (err) {
                    return next(err);
                }
                //Se devuelve un 200 porque es un usuario que ya existe.
                return res.status(200).json(user);
            }
        );
    };

    // Creamos el autenticador de usuarios y lo ejecutamos con la request actual.
    passport.authenticate('login', done)(req);
});

userRouter.post('/logout', (req, res, next) => {
    if (req.user) {
        // El logOut deslogue al usurio y destruye el objeto request.user.
        req.logOut(() => {
            // Destroy nos permite destruir la sesión.
            // La Callback se ejecuta una vez haya sido destruida la sesión.
            req.session.destroy(() => {
                // ClaarCookie permite limpiar la cookie con el id indicado al llegar a cliente.
                res.clearCookie('connect.sid');
                return res.status(200).json("Gracias por su visita");
            });
        });
    } else {
        return res.status(304).json('No hay un usuario logueado en este momento');
    }
});


module.exports = userRouter;