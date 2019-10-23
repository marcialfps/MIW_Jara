module.exports = { // Permite hacer futuros imports
    // Hapi needs a name for the module
    name: 'MyRouter',
    // file upload helper
    utilSubirFichero : async (binario, nombre, extension) => {
        return new Promise((resolve, reject) => {
            nombre = nombre + "." + extension;
            // We are using node's fs module (filesystem)
            require('fs').writeFile('./public/uploads/'+nombre, binario, err => {
                if (err) {
                    resolve(false)
                }
                resolve(true)
            })
        })
    },

    // Register function is run the moment hapi inserts the module
    register: async (server, options) => {
        // When registering the routes. create a pointer to the DB
        repositorio = server.methods.getRepositorio();
        server.route([
            {
                method: 'GET',
                path: '/anuncio/{id}/eliminar',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // El anuncio a eliminar debe tener el ID indicado y ser del usuario que está en sesión
                    var criterio = {
                        "_id" : require("mongodb").ObjectID(req.params.id),
                        "usuario": req.auth.credentials
                    };
                    await repositorio.conexion()
                        .then((db) => repositorio.eliminarAnuncios(db, criterio))
                        .then((resultado) => {
                            respuesta = false
                            // Check that we deleted something
                            if (resultado.result.n == 0) {
                                respuesta =  false
                            } else {
                                respuesta = true;
                            }
                        })
                    if (respuesta) {
                        return h.redirect('/misanuncios?mensaje=Anuncio eliminado&tipoMensaje=success')
                    } else {
                        return h.redirect('/misanuncios?mensaje=Anuncio no eliminado&tipoMensaje=danger')
                    }
                }
            },
            {
                method: 'POST',
                path: '/anuncio/{id}/modificar',
                options : {
                    auth: 'auth-registrado',
                    payload: {
                        output: 'stream'
                    }
                },
                handler: async (req, h) => {
                    // criterio de anucio a modificar: que tenga elID que buscamos y que sea del usuario logueado!
                    var criterio = {
                        "_id" : require("mongodb").ObjectID(req.params.id),
                        "usuario": req.auth.credentials
                    };
                    // nuevos valores para los atributos
                    anuncio = {
                        usuario: req.auth.credentials ,
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        categoria: req.payload.categoria,
                        precio: Number.parseFloat(req.payload.precio),
                    }
                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.modificarAnuncio(db,criterio,anuncio))
                        .then((id) => {
                            respuesta = false;
                            if (id == null) {
                                respuesta =  false
                            } else {
                                respuesta = true;
                            }
                        })

                    // ¿nos han enviado foto nueva? Sobreescribir la vieja
                    if ( req.payload.foto.filename != "") {
                        binario = req.payload.foto._data;
                        extension = req.payload.foto.hapi.filename.split('.')[1];
                        await module.exports.utilSubirFichero(
                            binario, req.params.id, extension);
                    }

                    if (respuesta){
                        return h.redirect('/misanuncios?mensaje=Anuncio modificado&tipoMensaje=success')
                    }
                    else {
                        return h.redirect('/publicar?mensaje=No se pudo modificar el anuncio&tipoMensaje=danger')
                    }
                }
            },
            {
                method: 'GET',
                path: '/anuncio/{id}/modificar',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Transform the add ID string to a mongo ObjectID
                    var criterio = {
                        "_id" : require("mongodb").ObjectID(req.params.id),
                        "usuario": req.auth.credentials
                    };
                    // Get the ad with the desired ID
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerAnuncios(db, criterio))
                        .then((anuncios) => {
                            // ¿Solo una coincidencia por _id?
                            anuncio = anuncios[0];
                        })
                    return h.view('modificar',
                        {
                            anuncio: anuncio,
                            usuarioAutenticado: req.auth.credentials
                        },
                        { layout: 'base'} );
                }
            },
            {
                method: 'GET',
                path: '/misanuncios',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Pagination parameter with name "pg"
                    var pg = parseInt(req.query.pg); // Es String !!!
                    if ( req.query.pg == null){ // Puede no venir el param
                        pg = 1;
                    }

                    // The search criteria in mongodb relies on the credentials travelling with the cookie
                    // When we crate an add, we make the creator the user stored in the cookie
                    var criterio = { "usuario" : req.auth.credentials };
                    // cookieAuth
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerAnunciosPg(db, pg, criterio))
                        .then((anuncios) => {
                            anunciosEjemplo = anuncios;

                            pgUltima = anunciosEjemplo.total/2;
                            // La página 2.5 no existe
                            // Si excede sumar 1 y quitar los decimales
                            if (pgUltima % 2 > 0 ){
                                pgUltima = Math.trunc(pgUltima);
                                pgUltima = pgUltima+1;
                            }
                        })

                    var paginas = [];
                    for( i = 1; i <= pgUltima; i++){
                        if ( i == pg ){
                            paginas.push({valor: i , clase : "uk-active" });
                        } else {
                            paginas.push({valor: i});
                        }
                    }
                    return h.view('misanuncios',
                        {
                            anuncios: anunciosEjemplo,
                            paginas: paginas,
                            valor: pg,
                            usuarioAutenticado: req.auth.credentials
                        },
                        { layout: 'base'} );
                }
            },
            {
                method: 'GET',
                path: '/desconectarse',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    req.cookieAuth.set({ usuario: "", secreto: "" });
                    return h.view('login',
                        { },
                        { layout: 'base'});
                }
            },
            {
                method: 'POST',
                path: '/login',
                handler: async (req, h) => {
                    password = require('crypto').createHmac('sha256', server.methods.getSecret())
                        .update(req.payload.password).digest('hex');
                    // We build a user with the data provided in the post request
                    usuarioABuscar = {
                        usuario: req.payload.usuario,
                        password: password,
                    }
                    // await no continuar hasta acabar esto
                    // Buscar en usuarios con el usuario a buscar como criterio
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerUsuarios(db, usuarioABuscar))
                        .then((usuarios) => {
                            respuesta = false;
                            if (usuarios == null || usuarios.length == 0 ) {
                                respuesta =  false
                            } else {
                                // On correct authentication
                                req.cookieAuth.set({
                                    usuario: usuarios[0].usuario,
                                    secreto : "secreto"
                                });

                                respuesta = true
                            }
                        })

                    if (respuesta){
                        return h.redirect('/misanuncios?mensaje=Autenticado correctamente&tipoMensaje=success')
                    }
                    else {
                        return h.redirect('/login?mensaje=No se pudo iniciar sesion&tipoMensaje=danger')
                    }
                }
            },
            {
                method: 'GET',
                path: '/login',
                handler: async (req, h) => {
                    return h.view('login',
                        { },
                        { layout: 'base'});
                }
            },
            {
                method: 'POST',
                path: '/registro',
                handler: async (req, h) => {
                    // We should use a better secret key
                    password = require('crypto').createHmac('sha256', server.methods.getSecret())
                        .update(req.payload.password).digest('hex');

                    usuario = {
                        usuario: req.payload.usuario,
                        password: password,
                    }
                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarUsuario(db, usuario))
                        .then((id) => {
                            respuesta = false;
                            if (id == null) {
                                respuesta =  false
                            } else {
                                respuesta = true;

                            }
                        })

                    if (respuesta){
                        return h.redirect('/login?mensaje=Usuario registrado&tipoMensaje=success')
                    }
                    else {
                        return h.redirect('/registro?mensaje=No se pudo crear el usuario&tipoMensaje=danger')
                    }
                }
            },
            {
                method: 'GET',
                path: '/registro',
                handler: async (req, h) => {
                    return h.view('registro',
                        { },
                        { layout: 'base'});
                }
            },
            {
                method: 'POST',
                path: '/publicar',
                // Options of the handlers, we specify
                options : {
                    auth: 'auth-registrado',
                    payload: {
                        output: 'stream'
                    }
                },
                handler: async (req, h) => {
                    // Parse form data
                    anuncio = {
                        usuario: req.auth.credentials ,
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        categoria: req.payload.categoria,
                        precio: Number.parseFloat(req.payload.precio),
                    }
                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarAnuncio(db, anuncio))
                        .then((id) => {
                            respuesta = false;
                            if (id == null) {
                                respuesta =  false
                            } else {
                                respuesta = true
                                idAnuncio = id;
                            }
                        })
                    // Once inserted the ad...
                    binario = req.payload.foto._data; // photo binary
                    extension = req.payload.foto.hapi.filename.split('.')[1]; // photo extension
                    // Upload the photo with the same name as the ad identifier.
                    // module exports.funtion to call functions in the module itself
                    if (req.payload.foto){
                        await module.exports.utilSubirFichero(
                            binario, idAnuncio, extension);
                    }

                    if (respuesta){
                        return h.redirect('/misanuncios?mensaje=Anuncio publicado&tipoMensaje=success')
                    }
                    else {
                        return h.redirect('/publicar?mensaje=No se pudo publicar el anuncio&tipoMensaje=danger')
                    }
                }
            },
            {
                method: 'GET',
                path: '/publicar',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    return h.view('publicar',
                        {
                            usuario: req.auth.credentials,
                            usuarioAutenticado: req.auth.credentials
                        },
                        { layout: 'base'});
                }
            },
            {
                // Prueba para ver la base
                method: 'GET',
                path: '/base',
                handler: {
                    view: 'layout/base'
                }
            },
            {
                method: 'GET',
                path: '/anuncios',
                handler: async (req, h) => {
                    // Hardcoded array of advertisements
                    var criterio = {};
                    if (req.query.criterio != null ){
                        criterio = { "titulo" : {$regex : ".*"+req.query.criterio.trim()+".*"}};
                    }

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerAnuncios(db, criterio))
                        .then((anuncios) => {
                            anunciosEjemplo = anuncios;
                        })
                    // Recorte de longitud de titulos y descripciones
                    anunciosEjemplo.forEach( (e) => {
                        if (e.titulo.length > 25){
                            e.titulo = e.titulo.substring(0, 25) + "...";
                        }
                        if (e.descripcion.length > 80) {
                            e.descripcion = e.descripcion.substring(0, 80) + "...";;
                        }
                    });

                    return h.view(
                        'anuncios', // html principal
                        { // data for the template
                            usuario: req.auth.credentials,
                            usuarioAutenticado: req.auth.credentials,
                            anuncios: anunciosEjemplo
                        },
                        { // which layout
                            layout: 'base'
                        } );
                }
            },
            {
                // Controlador especial gracias a @hapi/inert. Redirige peticiones GET/... a
                // los ficheros de public
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: './public'
                    }
                }
            },
            {
                // Specify controller for specific URL path /anuncio/id
                method: 'GET',
                path: '/anuncio/{id}',
                handler: async (req, h) => {
                    return 'Anuncio id: ' + req.params.id;
                }
            },
            {
                method: 'GET',
                path: '/',
                handler: async (req, h) => {
                    // Query the request for parameters
                    return h.view('index',
                        {
                            usuario: req.auth.credentials,
                            usuarioAutenticado: req.auth.credentials,
                        },
                        { layout: 'base'});
                }
            }
        ])
    }
}
