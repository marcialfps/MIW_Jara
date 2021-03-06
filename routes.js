module.exports = { // Permite hacer futuros imports
    // Hapi needs a name for the module
    name: 'MyRouter',
    getUrlParameter: (name, location) => {
    // Trim argument
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location);
    // Test by regex if the url is in the URL
    // If it is, return its value
    return results === null ? null :
        decodeURIComponent(results[1].replace(/\+/g, ' '));
    },

    // Register function is run the moment hapi inserts the module
    register: async (server, options) => {
        // When registering the routes. create a pointer to the DB
        repositorio = server.methods.getRepositorio();
        server.route([
            {   // Como el mapeo de favorita, pero devolviendo una vista en vez del resultado
                method: 'GET',
                path: '/favorita-update/{idTarea}',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Para poder marcar como favorita una tarea el usuario que lo haga debe ser su creador
                    // o alguien a quien se le ha asignado
                    // Recuperar la tarea y comprobarlo
                    // El criterio es que el usuario actual esté dentro de los encargados de la tarea
                    let criterio = { "_id": require("mongodb").ObjectID(req.params.idTarea)};

                    let ret = false;
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareas(db, criterio))
                        .then((tareas) => {
                            if (tareas == null || tareas.length === 0)
                                ret = false;
                            else
                                tarea = tareas[0];
                        });
                    // Si el usuario está autorizado o es el creador
                    if (tarea.asignados.includes(req.auth.credentials) || tarea.creador === req.auth.credentials){
                        // Actualizamos la tarea
                        await repositorio.conexion()
                            .then((db) => repositorio.marcarTareaFavorita(db, req.auth.credentials, req.params.idTarea))
                            .then((tareaMarcada) => {
                                if (tareaMarcada === 0)
                                    ret = false
                                else
                                    ret = true  // Tarea marcada favorita
                            })
                    }
                    if (ret === true){
                        return h.redirect('/tarea/' + tarea._id + '?pg=' + req.params.idTarea +
                            '&mensaje=Incidencia puesta a seguimiento&tipoMensaje=primary&icon=plus')
                    }
                    else {
                        return h.redirect('/tarea/' + tarea._id + '?pg=' + req.params.idTarea +
                            '&mensaje=Ha habido un error procesando su petición&tipoMensaje=danger&icon=info')
                    }
                }
            },
            {
                method: 'GET',
                path: '/no-favorita-update/{idTarea}',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Para poder desmarcar como favorita una tarea el usuario que lo haga debe ser su creador
                    // o alguien a quien se le ha asignado
                    // Recuperar la tarea y comprobarlo
                    // El criterio es que el usuario actual esté dentro de los encargados de la tarea
                    let criterio = { "_id": require("mongodb").ObjectID(req.params.idTarea)};
                    let ret = false;
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareas(db, criterio))
                        .then((tareas) => {
                            if (tareas == null || tareas.length === 0)
                                ret = false;
                            else
                                tarea = tareas[0];
                        })
                    // Si el usuario está autorizado o es el creador
                    if (tarea.asignados.includes(req.auth.credentials) || tarea.creador.localeCompare(req.auth.credentials) === 0){
                        // Actualizamos la tarea
                        await repositorio.conexion()
                            .then((db) => repositorio.desmarcarTareaFavorita(db, req.auth.credentials, req.params.idTarea))
                            .then((tareaMarcada) => {
                                if (tareaMarcada === 0)
                                    ret = false;
                                else
                                    ret = true // Tarea marcada favorita
                            })
                    }
                    if (ret === true){
                        return h.redirect('/tarea/' + tarea._id + '?pg=' + req.params.idTarea +
                            '&mensaje=Incidencia eliminada de seguimiento&tipoMensaje=primary&icon=close')
                    }
                    else {
                        return h.redirect('/tarea/' + tarea._id + '?pg=' + req.params.idTarea +
                            '&mensaje=Ha habido un error procesando su petición&tipoMensaje=danger&icon=info')
                    }
                }
            },
            {
                method: 'GET',
                path: '/favorita/{idTarea}',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Para poder marcar como favorita una tarea el usuario que lo haga debe ser su creador
                    // o alguien a quien se le ha asignado
                    // Recuperar la tarea y comprobarlo
                    // El criterio es que el usuario actual esté dentro de los encargados de la tarea
                    let criterio = { "_id": require("mongodb").ObjectID(req.params.idTarea)};

                    let ret = false;
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareas(db, criterio))
                        .then((tareas) => {
                            if (tareas == null || tareas.length === 0)
                                ret = false;
                            else
                                tarea = tareas[0];
                        })
                    // Si el usuario está autorizado o es el creador
                    if (tarea.asignados.includes(req.auth.credentials) || tarea.creador === req.auth.credentials){
                        // Actualizamos la tarea
                        await repositorio.conexion()
                            .then((db) => repositorio.marcarTareaFavorita(db, req.auth.credentials, req.params.idTarea))
                            .then((tareaMarcada) => {
                                if (tareaMarcada === 0)
                                    ret = false
                                else
                                    ret = true  // Tarea marcada favorita
                            })
                    }
                    // If not authorized, do nothing
                    return ret;
                }
            },
            {
                method: 'GET',
                path: '/no-favorita/{idTarea}',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Para poder desmarcar como favorita una tarea el usuario que lo haga debe ser su creador
                    // o alguien a quien se le ha asignado
                    // Recuperar la tarea y comprobarlo
                    // El criterio es que el usuario actual esté dentro de los encargados de la tarea
                    let criterio = { "_id": require("mongodb").ObjectID(req.params.idTarea)};
                    let ret = false;
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareas(db, criterio))
                        .then((tareas) => {
                            if (tareas == null || tareas.length === 0)
                                ret = false
                            else
                                tarea = tareas[0];
                        })
                    // Si el usuario está autorizado o es el creador
                    if (tarea.asignados.includes(req.auth.credentials) || tarea.creador.localeCompare(req.auth.credentials) === 0){
                        // Actualizamos la tarea
                        await repositorio.conexion()
                            .then((db) => repositorio.desmarcarTareaFavorita(db, req.auth.credentials, req.params.idTarea))
                            .then((tareaMarcada) => {
                                if (tareaMarcada === 0)
                                    ret = false;
                                else
                                    ret = true // Tarea marcada favorita
                            })
                    }
                    // If not authorized, do nothing
                    return ret
                }
            },
            {
                method: 'GET',
                path: '/eliminar/{id}',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {

                    let pg = parseInt(module.exports.getUrlParameter("pg", req.info.referrer));
                    if (pg == null || Number.isNaN(pg))
                        pg = 1;

                    // El anuncio a eliminar debe tener el ID indicado y ser del usuario que está en sesión
                    var criterio = {
                        "_id" : require("mongodb").ObjectID(req.params.id),
                        "creador": req.auth.credentials
                    };
                    let respuesta = false;
                    await repositorio.conexion()
                        .then((db) => repositorio.eliminarTareas(db, criterio))
                        .then((resultado) => {
                            // Check that we deleted something
                            if (resultado.result.n === 0) {
                                respuesta =  false
                            } else {
                                respuesta = true;
                            }
                        })
                    if (respuesta) {
                        return h.redirect('/creadas?pg=' + pg + '&mensaje=Tarea eliminada&tipoMensaje=success&icon=check')
                    } else {
                        return h.redirect('/creadas?pg=' + pg + '&mensaje=Tarea no eliminada&tipoMensaje=danger&icon=close')
                    }
                }
            },
            {
                method: 'POST',
                path: '/tarea/{id}/modificar',
                options : {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // criterio de anucio a modificar: que tenga elID que buscamos y que sea del usuario logueado!
                    var criterio = {
                        "_id" : require("mongodb").ObjectID(req.params.id),
                        "creador": req.auth.credentials
                    };
                    // nuevos valores para los atributos
                    tarea = {
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        asignados: req.payload.operariosasignados
                    }
                    // Ajustar los datos de la petición a un objeto date
                    let limite = new Date();
                    limite.setDate(req.payload.dia);
                    limite.setMonth(req.payload.mes-1);
                    limite.setFullYear(req.payload.año);
                    limite.setHours(0);
                    limite.setMinutes(0);
                    limite.setSeconds(0);
                    tarea.limite = limite;
                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.modificarTarea(db,criterio,tarea))
                        .then((result) => {
                            respuesta = false;
                            if (result == null || result.n === 0) {
                                respuesta =  false
                            } else {
                                respuesta = true;
                            }
                        })

                    if (respuesta){
                        return h.redirect('/creadas?mensaje=Tarea modificada&tipoMensaje=success&icon=check')
                    }
                    else {
                        return h.redirect('/creadas?mensaje=No se pudo modificar la tarea&tipoMensaje=danger&icon=close')
                    }
                }
            },
            {
                method: 'POST',
                path: '/tarea/{id}/comentar',
                options : {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    comentario = {
                        autor: req.auth.credentials,
                        tarea: require("mongodb").ObjectID(req.params.id),
                        texto: req.payload.texto,
                        fecha: new Date()
                    }
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarComentario(db,comentario))
                        .then((id) => {
                            respuesta = false;
                            if (id == null) {
                                respuesta =  false
                            } else {
                                respuesta = true;
                            }
                        })

                    if (respuesta){
                        return h.redirect('/tarea/'+req.params.id+
                            '?mensaje=Comentario publicado&tipoMensaje=success&icon=check')
                    }
                    else {
                        return h.redirect('/tarea/'+req.params.id+
                            '?mensaje=No se pudo modificar la tarea&tipoMensaje=danger&icon=close')
                    }
                }
            },
            {
                method: 'GET',
                path: '/tarea/{id}/empezar',
                options : {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    criterio =
                        {
                            $or:
                                [
                                    {
                                        _id: require("mongodb").ObjectID(req.params.id),
                                        creador: req.auth.credentials
                                    },
                                    {
                                        _id: require("mongodb").ObjectID(req.params.id),
                                        asignados: req.auth.credentials
                                    }
                                ]
                        };

                    tarea = {
                        estado: "enprogreso"
                    };
                    await repositorio.conexion()
                        .then((db) => repositorio.modificarTarea(db,criterio,tarea))
                        .then((id) => {
                            respuesta = false;
                            if (id == null) {
                                respuesta =  false
                            } else {
                                respuesta = true;
                            }
                        });

                    if (respuesta){
                        return h.redirect('/tarea/'+req.params.id+
                            '?mensaje=Estado actualizado&tipoMensaje=success&icon=check')
                    }
                    else {
                        return h.redirect('/tarea/'+req.params.id+
                            '?mensaje=No se pudo actualizar el estado&tipoMensaje=danger')
                    }
                }
            },
            {
                method: 'GET',
                path: '/tarea/{id}/finalizar',
                options : {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    criterio =
                        {
                            $or:
                                [
                                    {
                                        _id: require("mongodb").ObjectID(req.params.id),
                                        creador: req.auth.credentials
                                    },
                                    {
                                        _id: require("mongodb").ObjectID(req.params.id),
                                        asignados: req.auth.credentials
                                    }
                                ]
                        };

                    tarea = {
                        estado: "finalizado"
                    }
                    await repositorio.conexion()
                        .then((db) => repositorio.modificarTarea(db,criterio,tarea))
                        .then((result) => {
                            respuesta = false;
                            if (result == null || result.n === 0) {
                                respuesta =  false
                            } else {
                                respuesta = true;
                            }
                        })

                    if (respuesta){
                        return h.redirect('/tarea/'+req.params.id+
                            '?mensaje=Estado actualizado&tipoMensaje=success&icon=check')
                    }
                    else {
                        return h.redirect('/tarea/'+req.params.id+
                            '?mensaje=No se pudo actualizar el estado&tipoMensaje=danger')
                    }
                }
            },
            {
                method: 'GET',
                path: '/tarea/{id}/modificar',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    var operariosRecibidos = []

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerOperarios(db, {}))
                        .then((operarios) => {
                            operariosRecibidos = operarios;
                        })

                    // Transform the add ID string to a mongo ObjectID
                    var criterio = {
                        "_id" : require("mongodb").ObjectID(req.params.id),
                        "creador": req.auth.credentials
                    };
                    var tarea;
                    // Get the ad with the desired ID
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareas(db, criterio))
                        .then((tareas) => {
                            // ¿Solo una coincidencia por _id?
                            tarea = tareas[0];
                        });

                    return h.view('modificar',
                        {
                            tarea: tarea,
                            fechaLimite: (tarea.limite.getDate())+"/"+
                                (tarea.limite.getMonth()+1)+"/"+(tarea.limite.getFullYear()),
                            operarios: operariosRecibidos,
                            usuarioAutenticado: req.auth.credentials
                        },
                        { layout: 'base'} );
                }
            },
            {
                method: 'GET',
                path: '/creadas',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {

                    // Pagination parameter with name "pg"
                    let pg = parseInt(req.query.pg);
                    let pgUltima = 1;


                    // Obtener el numero de tareas existentes
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerNumeroDocumentos(db, "tareas", {}))
                        .then((nTareas) => {
                            if (nTareas == null)
                                return h.redirect('/?mensaje=No se pudo acceder a la lista de tareas&tipoMensaje=danger&icon=close')

                            pgUltima = nTareas/11;


                            if ( req.query.pg == null || pg > pgUltima || pg < 1){ // Puede no venir el param o ser demasiado
                                pg = 1;
                            }
                        });
                    // The search criteria in mongodb relies on the credentials travelling with the cookie
                    // When we crate an ad, we make the creator the user stored in the cookie
                    var criterio = { "creador" : req.auth.credentials };
                    // cookieAuth
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareasPg(db, pg, criterio))
                        .then((tareas) => {
                            tareasCreadas = tareas;
                        });

                    tareasCreadas.forEach(function (tarea) {
                        tarea.limite_string = (tarea.limite.getDate())+"/"+
                        (tarea.limite.getMonth()+1)+"/"+tarea.limite.getFullYear()
                    })

                    return h.view('creadas',
                        {
                            tareas: tareasCreadas,
                            nTareas: tareasCreadas.length,
                            valor: pg,
                            pgUltima:Math.trunc(pgUltima)+1,
                            usuarioAutenticado: req.auth.credentials,
                            // Highlight nav
                            currentLocation: "creadas"
                        },
                        { layout: 'base'} );
                }
            },
            {
                method: 'GET',
                path: '/asignadas',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Pagination parameter with name "pg"
                    let pg = parseInt(req.query.pg);
                    let pgUltima = 1;

                    // El criterio es que el usuario actual esté dentro de los encargados de la tarea
                    let criterio = { asignados: req.auth.credentials  };

                    // Obtener el numero de tareas existentes
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerNumeroDocumentos(db, "tareas", criterio))
                        .then((nTareas) => {
                            if (nTareas == null)
                                return h.redirect('/?mensaje=No se pudo acceder a la lista de tareas asignadas&tipoMensaje=danger&icon=close')

                            pgUltima = nTareas/11;

                            if ( req.query.pg == null || pg > pgUltima || pg < 1){ // Puede no venir el param o ser demasiado
                                pg = 1;
                            }
                        });

                    // The search criteria in mongodb relies on the credentials travelling with the cookie
                    // When we crate an ad, we make the creator the user stored in the cookie

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareasPg(db, pg, criterio))
                        .then((tareas) => {
                            if (tareas == null){
                                return h.redirect('/?mensaje=No se pudo acceder a la lista de tareas&tipoMensaje=danger&icon=close')
                            }
                            // Guardar el ID de la tarea como string para el ID de los botones de favoritas
                            for (i = 0; i < tareas.length; i++){
                                tareas[i].id = tareas[i]._id.toString()
                            }
                            misTareas = tareas;
                        })
                    // Vamos a rescatar todas las tareas favoritas del operario en sesion para poder
                    // mostrar en la vista si las esta siguiendo ya o no y poner botones en consecuencia
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerSeguidasByName(db, req.auth.credentials))
                        .then((tareasSeguidas) => {
                            if (tareasSeguidas == null){
                                return h.redirect('/?mensaje=No se pudo acceder a la lista de tareas&tipoMensaje=danger&icon=close')
                            }
                            misTareasSeguidas = tareasSeguidas;
                        });

                    misTareas.forEach(function (tarea) {
                        tarea.limite_string = (tarea.limite.getDate())+"/"+
                            (tarea.limite.getMonth()+1)+"/"+tarea.limite.getFullYear()
                    });

                    return h.view('asignadas',
                        {
                            tareas: misTareas,
                            nTareas: misTareas.length,
                            tareasSeguidas: misTareasSeguidas,
                            valor: pg,
                            pgUltima:Math.trunc(pgUltima)+1,
                            usuarioAutenticado: req.auth.credentials,
                            // Highlight nav
                            currentLocation: "asignadas"
                        },
                        { layout: 'base'} );
                }
            },
            {
                method: 'GET',
                path: '/seguidas',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Pagination parameter with name "pg"
                    let pg = parseInt(req.query.pg);
                    let pgUltima = 1;

                    // Obtener el array de tareas seguidas por el usuario
                    var idsTareasSeguidas = []
                    // Obtener los IDs de las tareas seguidas existentes del usuario
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerSeguidasByName(db, req.auth.credentials))
                        .then((seguidas) => {
                            if (seguidas == null)
                                return h.redirect('/?mensaje=No se pudo acceder a la lista de tareas seguidas&tipoMensaje=danger&icon=close');

                            idsTareasSeguidas = seguidas;
                            let nTareas = seguidas.length;
                            pgUltima = nTareas/11;

                            if ( req.query.pg == null || pg > pgUltima || pg < 1){ // Puede no venir el param o ser demasiado
                                pg = 1;
                            }
                        });

                    // Transformamos el array que tiene strings a ObjectIDs...
                    idsTareasSeguidas = idsTareasSeguidas.map(require("mongodb").ObjectID);
                    // Nuestro criterio son tareas cuyo ObjectID se halle dentro del array de seguidas que hemos recuperado
                    let criterio = { _id: {$in: idsTareasSeguidas} };

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareasPg(db, pg, criterio))
                        .then((tareas) => {
                            if (tareas == null){
                                return h.redirect('/?mensaje=No se pudo acceder a la lista de seguidas&tipoMensaje=danger&icon=close')
                            }
                            // Guardar el ID de la tarea como string para el ID de los botones de favoritas
                            for (i = 0; i < tareas.length; i++){
                                tareas[i].id = tareas[i]._id.toString()
                            }
                            tareasSeguidas = tareas;
                        });

                    tareasSeguidas.forEach(function (tarea) {
                        tarea.limite_string = (tarea.limite.getDate())+"/"+
                            (tarea.limite.getMonth()+1)+"/"+tarea.limite.getFullYear()
                    })

                    return h.view('seguidas',
                        {
                            tareas: tareasSeguidas,
                            nTareas: tareasSeguidas.length,
                            valor: pg,
                            pgUltima:Math.trunc(pgUltima)+1,
                            usuarioAutenticado: req.auth.credentials,
                            // Highlight nav
                            currentLocation: "seguidas"
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
                    return h.redirect('/login?mensaje=Sesion cerrada&icon=sign-out')
                }
            },
            {
                method: 'POST',
                path: '/login',
                handler: async (req, h) => {
                    password = require('crypto').createHmac('sha256', server.methods.getSecret())
                        .update(req.payload.password).digest('hex');
                    // We build a user with the data provided in the post request
                    operarioABuscar = {
                        nombre: req.payload.username,
                        password: password
                    }
                    // await no continuar hasta acabar esto
                    // Buscar en usuarios con el usuario a buscar como criterio
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerOperarios(db, operarioABuscar))
                        .then((operarios) => {
                            respuesta = false;
                            if (operarios == null || operarios.length === 0 ) {
                                respuesta =  false
                            } else {
                                // On correct authentication
                                req.cookieAuth.set({
                                    usuario: operarios[0].nombre,
                                    secreto : server.methods.getSecret()
                                });
                                respuesta = true
                            }
                        })

                    if (respuesta){
                        return h.redirect('/?mensaje=Bienvenido, ' + operarioABuscar.nombre + '&tipoMensaje=success&icon=sign-in')
                    }
                    else {
                        return h.redirect('/login?mensaje=No se pudo iniciar sesion&tipoMensaje=danger&icon=close')
                    }
                }
            },
            {
                method: 'GET',
                path: '/login',
                handler: async (req, h) => {
                    if (req.state["session-id"] && req.state["session-id"].usuario !== ""){
                        return h.redirect('/')
                    }
                    else{
                        return h.view('login',
                            { },
                            { layout: 'base'});
                    }
                }
            },
            {
                method: 'POST',
                path: '/registro',
                handler: async (req, h) => {
                    // We should use a better secret key
                    password = require('crypto').createHmac('sha256', server.methods.getSecret())
                        .update(req.payload.password).digest('hex');

                    operario = {
                        nombre: req.payload.username,
                        password: password,
                        tipo: req.payload.type,
                        seguidas: []
                    }

                    // Comprobar usuario no existe ya
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerOperarios(db, {nombre: operario.nombre}))
                        .then((operarios) => {
                            existe = false;
                            if (operarios != null && operarios.length === 0 ) {
                                existe =  false
                            } else {
                                // El usuario a crear existe ya
                                existe = true
                            }
                        })

                    // Si ya existe, parar el registro
                    if (existe){
                        return h.redirect('/registro?mensaje=Nombre de usuario ya existente&tipoMensaje=warning&icon=info')
                    }

                    await repositorio.conexion()
                        .then((db) => repositorio.insertarOperario(db, operario))
                        .then((id) => {
                            respuesta = false;
                            // Error al insertar
                            if (id == null) {
                                respuesta =  false
                            } else {
                                // Exito al insertar
                                respuesta = true;
                            }
                        })
                    if (respuesta){
                        return h.redirect('/login?mensaje=Operario registrado&tipoMensaje=success&icon=check')
                    }
                    else {
                        return h.redirect('/registro?mensaje=No se pudo crear el operario&tipoMensaje=danger&icon=close')
                    }
                }
            },
            {
                method: 'GET',
                path: '/registro',
                handler: async (req, h) => {
                    if (req.state["session-id"] && req.state["session-id"].usuario !== ""){
                        return h.redirect('/')
                    }
                    else{
                        return h.view('registro',
                            { },
                            { layout: 'base'});
                    }
                }
            },
            {
                method: 'POST',
                path: '/crear',
                // Options of the handlers, we specify
                options : {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // Parse form data
                    tarea = {
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        estado: "asignado",
                        creacion: new Date(),
                        creador: req.auth.credentials,
                        asignados: req.payload.operariosasignados.split(',')
                    }
                    // Ajustar la fehca límite de la tarea para que sea un Date
                    let limite = new Date(req.payload.año, req.payload.mes-1, req.payload.dia, 0, 0, 0);
                    tarea.limite = limite;
                    // Comprobar no deja a un operario sin nombre cuando no asignamos a nadie
                    if (tarea.asignados.length === 1 && tarea.asignados[0] === "")
                        tarea.asignados = []
                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarTarea(db, tarea))
                        .then((id) => {
                            respuesta = false;
                            if (id == null) {
                                respuesta =  false
                            } else {
                                respuesta = true
                                idTarea = id;
                            }
                        })

                    if (respuesta){
                        return h.redirect('/creadas?mensaje=Tarea creada&tipoMensaje=success&icon=check')
                    }
                    else {
                        return h.redirect('/creadas?mensaje=No se pudo crear la tarea&tipoMensaje=danger&icon=close')
                    }
                }
            },
            {
                method: 'GET',
                path: '/crear',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    var operariosRecibidos = []

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerOperarios(db, {}))
                        .then((operarios) => {
                            operariosRecibidos = operarios;
                        })

                    return h.view('crear',
                        {
                            usuarioAutenticado: req.auth.credentials,
                            operarios: operariosRecibidos
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
                path: '/tareas',
                handler: async (req, h) => {
                    // Hardcoded array of advertisements
                    let criterio = {};
                    if (req.query.criterio != null ){
                        let userInput = req.query.criterio.trim();
                        criterio = {};
                        if (req.query.estado !== "todo")
                            criterio.estado = req.query.estado;

                        if (userInput !== "")
                            criterio.titulo = {$regex : ".*"+userInput+".*"};
                    }

                    let tareasEncontradas = [];

                    // Pagination parameter with name "pg"
                    let pg = parseInt(req.query.pg);
                    if (pg == null)
                        pg = 1;
                    let pgUltima = 1;


                    // Obtener el numero de tareas existentes
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerNumeroDocumentos(db, "tareas", criterio))
                        .then((nTareas) => {
                            if (nTareas == null)
                                return h.redirect('/?mensaje=No se pudo acceder a la lista de tareas&tipoMensaje=danger&icon=close')

                            pgUltima = nTareas/11;

                            if ( req.query.pg == null || pg > pgUltima || pg < 1){ // Puede no venir el param o ser demasiado
                                pg = 1;
                            }
                        });

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareasPg(db, pg, criterio))
                        .then((tareas) => {
                            tareasEncontradas = tareas;
                        });

                    tareasEncontradas.forEach(function (tarea) {
                        tarea.limite_string = (tarea.limite.getDate())+"/"+
                            (tarea.limite.getMonth()+1)+"/"+tarea.limite.getFullYear()
                    });

                    let user = null;
                    if (req.state["session-id"] && req.state["session-id"].usuario !== "")
                        user = req.state["session-id"].usuario;

                    return h.view('tareas',
                        {
                            usuarioAutenticado: user,
                            tareas: tareasEncontradas,
                            nTareas: tareasEncontradas.length,
                            busqueda: req.query.criterio.trim(),
                            valor: pg,
                            pgUltima: Math.trunc(pgUltima)+1
                        },
                        { // which layout
                            layout: 'base'
                        } );
                }
            },
            {
                method: 'GET',
                path: '/perfil',
                options : {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    let criterio = { "nombre": req.auth.credentials}
                    let ret = false;
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerOperarios(db, criterio))
                        .then((operarios) => {
                            if (operarios == null || operarios.length === 0)
                                ret = false
                            else
                                operario = operarios[0];
                        })
                    return h.view('perfil',
                        {
                            usuarioAutenticado: req.auth.credentials,
                            operario: operario
                        },
                        {
                            layout: 'base'
                        });
                }
            },
            {
                method: 'GET',
                path: '/tarea/{id}',
                handler: async (req, h) => {
                    // Obtener comentarios
                    let criterioComentario = {"tarea": require("mongodb").ObjectID(req.params.id)};
                    let comentariosTarea = []
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerComentarios(db, criterioComentario))
                        .then((comentarios) => {
                            comentariosTarea = comentarios;
                        });

                    // Obtener tarea
                    let criterioTarea = { "_id": require("mongodb").ObjectID(req.params.id)}
                    let ret = false;
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerTareas(db, criterioTarea))
                        .then((tareas) => {
                            if (tareas == null || tareas.length === 0)
                                ret = false
                            else
                                tarea = tareas[0];
                        });

                    let parametrosVista = {};
                    let username = null;
                    if (req.state["session-id"] && req.state["session-id"].usuario !== ""){
                        username = req.state["session-id"].usuario;
                        parametrosVista.usuarioAutenticado = username;
                        if (username === tarea.creador)
                            parametrosVista.esCreador = true;
                        if (tarea.asignados.includes(username))
                            parametrosVista.esAsignado = true;
                    }
                    parametrosVista.tarea = tarea;

                    // Hemos recuperado la hora de los comentarios como objeto Date, vamos a enseñarla
                    // al usuario de forma más amigable:
                    comentariosTarea.forEach(function (comentario) {
                        comentario.fecha_string = comentario.fecha.getDate()+"/"+
                            (comentario.fecha.getMonth()+1)+"/"+comentario.fecha.getFullYear()+
                            " - "+comentario.fecha.getHours()+":";

                        if (comentario.fecha.getMinutes() < 10)
                            comentario.fecha_string+= "0";
                        comentario.fecha_string+=comentario.fecha.getMinutes();
                    });

                    parametrosVista.comentarios = comentariosTarea;
                    parametrosVista.nComentarios = comentariosTarea.length;
                    parametrosVista.fechaLimite = (tarea.limite.getDate())+"/"+
                        (tarea.limite.getMonth()+1)+"/"+(tarea.limite.getFullYear());
                    parametrosVista.fechaCreacion = (tarea.creacion.getDate())+"/"+
                        (tarea.creacion.getMonth()+1)+"/"+(tarea.creacion.getFullYear());


                    let operario = null;
                    if (username != null){
                        let criterioOperario = { nombre: username}
                        let ret = false;
                        await repositorio.conexion()
                            .then((db) => repositorio.obtenerOperarios(db, criterioOperario))
                            .then((operarios) => {
                                if (operarios == null || operarios.length === 0)
                                    ret = false;
                                else
                                    operario = operarios[0];
                            });
                    }

                    if (operario != null && operario.seguidas.includes(tarea._id.toString())){
                        parametrosVista.seguida = true;
                    }

                    return h.view('tarea',
                        parametrosVista,
                        {
                            layout: 'base'
                        });
                }
            },
            {
                method: 'GET',
                path: '/',

                handler: async (req, h) => {
                    // Query the request for parameters
                    let user = null;
                    if (req.state["session-id"] && req.state["session-id"].usuario !== "")
                        user = req.state["session-id"].usuario;
                    return h.view('index',
                        {
                            usuarioAutenticado: user
                        },
                        { layout: 'base'});
                }
            },
            {
                // Controlador especial gracias a @hapi/inert. Redirige peticiones GET/... a
                // los ficheros de public
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: './public',
                        listing: false
                    },
                }
            }
        ])
    }
};
