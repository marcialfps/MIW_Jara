// Initializer of the server

// Módulos (imports)
const Hapi = require('@hapi/hapi');
const routes = require("./routes.js");
const Inert = require('@hapi/inert');
const Cookie = require('@hapi/cookie');
const Vision = require('@hapi/vision');
const repositorio = require("./repositorio.js");

// Servidor
const server = Hapi.server({
    port: 80,
    host: 'localhost',
});

// declarar metodos comunes
// Esto es algo que nos da hapi. El servidor tiene unos methods que son accesibles desde toda la app.
server.method({
    name: 'getRepositorio',
    method: () => {
        return repositorio;
    },
    options: {}
});
// Quick method to obtain the secret for encrypting keys
server.method({
    name: 'getSecret',
    method: () => {
        return "secreto";
    },
    options: {}
});


const iniciarServer = async () => {
    try {
        // Registrar el Inert antes de usar directory en routes
        await server.register(Inert);
        //  Register template components
        await server.register(Vision);
        //  Register cookie component
        await server.register(Cookie);
        // Register to show human friendly errors
        await server.register(require('hapi-error'));

        //Configurar seguridad gracias al componente de Cookie.
        // Nombre personalizado de este sistema de autenticación
        await server.auth.strategy('auth-registrado', 'cookie', {
            cookie: {
                name: 'session-id',
                password: 'secretosecretosecretosecretosecretosecretosecreto', // we need a long password
                isSecure: false
            },
            redirectTo: '/login', // Redirect to login when auth fails
            // How to validate that the auth is OK using cookies:
            validateFunc: function (request, cookie){
                promise = new Promise((resolve, reject) => {
                    // Check that a cookie exists, contains a user and a secret key which is the same as
                    // one you use in your app. This "secreto" is not the one used when encrypting passwords,...
                    if ( cookie.usuario != null && cookie.usuario != "" &&
                        cookie.secreto == "secreto"){
                        resolve({valid: true,
                            credentials: cookie.usuario});
                    } else {
                        resolve({valid: false});
                    }
                });
                return promise;
            }
        });
        // Handlebars no acepta operaciones aritméricas en las plantillas, pero le podemos añadir functiones de ayuda
        // Ejemplo, sumar
        var handlebars = require('handlebars');
        handlebars.registerHelper("sumar", (a, b) => {
            return a + b;
        });
        handlebars.registerHelper("restar", (a, b) => {
            return a - b;
        });
        // Helper method to prevent showing the pagination page "0" when we are on page "1"
        handlebars.registerHelper('ifGreaterThan', function(item1, item2, options) {
            return (item1 > item2) ? options.fn(this) : options.inverse(this);
        });
        handlebars.registerHelper('ifEqualThan', function(item1, item2, options) {
            return (item1 === item2) ? options.fn(this) : options.inverse(this);
        });
        // Metodo de handlebars para saber desde una plantilla HTML si es estado de una tarea esta en estado "Asignada"
        handlebars.registerHelper('isAsignada', function(estado, options) {
            return ("asignado" == estado) ? options.fn(this) : options.inverse(this);
        });
        // Metodo de handlebars para saber desde una plantilla si es estado de una tarea esta en estado "En progreso"
        handlebars.registerHelper('isInProgress', function(estado, options) {
            return ("enprogreso" == estado) ? options.fn(this) : options.inverse(this);
        });
        // Metodo de handlebars para saber desde una plantilla si es estado de una tarea esta en estado "Finalizada"
        handlebars.registerHelper('isFinished', function(estado, options) {
            return ("finalizado" == estado) ? options.fn(this) : options.inverse(this);
        });
        // Metodo de handlebars para saber si un elemento está dentro de una lista
        handlebars.registerHelper('isInList', function(item, list, options) {
            return (list.includes(item)) ? options.fn(this) : options.inverse(this);
        });


        await server.register(routes);
        // Configure hapi views
        await server.views({
            engines: {
                // HTML template engine
                html: require('handlebars')
            },
            relativeTo: __dirname,
            path: './views',
            layoutPath: './views/layout', // Where to look for the layouts
            context : { // El objeto context guarda info accesible entre plantillas
                sitioWeb: "wallapep"
            }
        });

        await server.start();
        console.log('Servidor localhost:8080');
    } catch (error) {
        console.log('Error '+error);
    }
};

iniciarServer();
