//Requiero la librería passport:
const passport = require('passport');

const User = require('../../models/Users');

//Se coge del objeto de passport-local la parte de strategy.
const LocalStrategy = require('passport-local').Strategy;

//Utilizamos esta librería para encriptar la contraseña.
const bcrypt = require('bcrypt');
const createError = require('../errors/create-error');

// Crea una nueva estrategia de autenticación de usuarios.
// 1. Como primer parámetro recibe el nombre estrategia.
// 2. Como segundo parámetro recibe la nueva estrategia la cual se importa desde el passport local.
// 2.1 Configuración de la estrategia.
// 2.2 Callback que se ejecuta cada vez que se registra un usuario --> aprovechamos para guardar usuario en la BD.
passport.use(
    'register',
    new LocalStrategy(
        {
            //usernameField: Campo del user schema que utilizaremos como nombre de usuario.
            usernameField: "email",
            //passwordField: Campo del user schema que utilizaremos como constraseña.
            passwordField: "password",
            //passReqToCallback: Indica con boolean (True o False) si se debe pasar la request a la callback.
            passReqToCallback: true
        },
        //done: Función de callback que ejecutaremos cuando hayamos terminado la lógica de registro
        async (req, email, password, done) => {
            try {

                // Comprobar que el usuario que se intenta registrar no existe (buscamos por email)
                const previousUser = await User.findOne({ email });

                //Si ya exisitiera lo mataríamos con un return done que permitiría recibir un mensaje de error.
                if (previousUser) {
                    return done(createError('Este usuario ya existe, inicia sesión'));
                }

                // Encriptar contraseña antes de guardarla
                // Hash: Encripta el dato que pasemos
                // 1. Dato a encriptar (string)
                // 2. saltRounds: Número de rondas que se aplican a la hora de encriptar. (10 por defecto).
                const encPassword = await bcrypt.hash(password, 10);

                // Creamos el nuevo usuario.
                const newUser = new User({
                    email,
                    password: encPassword
                });
                // Guardamos usuario en la base de datos.
                const savedUser = await newUser.save();

                // Como error pasamos el null, y savedUser como usuario guardado.
                return done(null, savedUser);
            } catch (err) {
                return done(err);
            }       
        }
    )
);

// Creamos una estrategia en caso de login:
passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                // Miramos si el usuario que nos pasan existe o no.
                const currentUser = await User.findOne({ email });

                // Si no existe el usuario devolveremos un mensaje de error.
                if (!currentUser) {
                    return done(createError('El email que ha introducido no está registrado'));
                }

                //Compruebo si la contraseña del usuario coincide con el usuario en la base de datos, la contraseña llegará encriptada, compare permite comparar la contraseña encriptada con la contraseña sin encriptar y devolverá true si son iguales o false si por el contrario, son distintas.
                const isValidPassword = await bcrypt.compare(
                    password,
                    currentUser.password
                );
                
                // Si devuelve false y por consiguiente la contraseña no es valida, devolverá un mensaje de error.
                if (!isValidPassword) {
                    return done(createError('La contraseña es incorrecta'));
                }

                //No queremos pasar a un usuario que hace login los datos de su contraseña.
                currentUser.password = null;
                return done(null, currentUser);
            // En caso de que haya cualquier error en cualquier paso anterior devuelva un done con ese error.
            } catch (err) {
                return done(err);
            }
        }
    )
);

// Serializar es registrar el usuario, coger el usuario que tenemos en el servidor y hacer la correspondencia respecto al Id que está almacenado en la base de datos.
passport.serializeUser((user, done) => {
    // Devolvemos id para poder hacer correspondencia con la base de datos.
    return done(null, user._id);
});

//Deserializar es que desde el Id que tengo en la base de datos veo que usuario del servidor correspondería a él.
passport.deserializeUser(async (userId, done) => {
    try {
        const existingUser = await User.findById(userId);
        //Convertimos el usuario que nos llega y lo convertimos en un usuario que buscamos.
        return done(null, existingUser);
    } catch (err) {
        return done(err);
    }
});
