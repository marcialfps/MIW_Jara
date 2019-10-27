module.exports = {
    conexion : async () => {
        var mongo = require("mongodb");
        var db = "mongodb://admin:admin-diu-miw@miw-diu-shard-00-00-tb9ul.mongodb.net:27017,miw-diu-shard-00-01-tb9ul.mongodb.net:27017,miw-diu-shard-00-02-tb9ul.mongodb.net:27017/test?ssl=true&replicaSet=MIW-DIU-shard-0&authSource=admin&retryWrites=true&w=majority";
        promise = new Promise((resolve, reject) => {
            mongo.MongoClient.connect(db, (err, db) => {
                if (err) {
                    resolve(null)
                } else {
                    resolve(db);
                }
            });
        });
        return promise;
    },
    obtenerNumeroDocumentos : async (db, coleccion, filtro) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection(coleccion);
            collection.find(filtro).toArray ((err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // numero de documentos
                    resolve(result.length);
                }
                db.close();
            });
        });

        return promise;
    },
    obtenerTareas : async (db, criterio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('tareas');
            collection.find(criterio).toArray( (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // lista de tareas
                    resolve(result);
                }
                db.close();
            });
        });

        return promise;
    },
    obtenerTareasPg : async (db, pg, criterio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('tareas');
            collection.count( criterio, (err, count) => {
                collection.find(criterio).skip( (pg-1)*10 ).limit( 10 )
                    .toArray( (err, result) => {
                        if (err) {
                            resolve(null);
                        } else {
                            // Guardar el total de tareas
                            result.total = count;
                            resolve(result);
                        }
                        db.close();
                    });
            })
        });
        return promise;
    },
    marcarTareaFavorita : async (db, nombreUsuario, idTarea) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('operarios');
            collection.findOneAndUpdate({nombre: nombreUsuario}, {$push: {seguidas: idTarea}}, {}, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result.ok);
                }
                db.close();
            });
        });
        return promise;
    },
    desmarcarTareaFavorita : async (db, nombreUsuario, idTarea) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('operarios');
            collection.findOneAndUpdate({nombre: nombreUsuario}, {$pull: {seguidas: idTarea}}, {}, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result.ok);
                }
                db.close();
            });
        });
        return promise;
    },
    obtenerOperarios : async (db, criterio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('operarios');
            collection.find(criterio).toArray( (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // operarios que cumplen el filtro
                    resolve(result);
                }
                db.close();
            });
        });
        return promise;
    },
    // Devuelve la lista de ids de tareas seguidas del operario en sesion
    obtenerSeguidasByName : async (db, nombreUsuario) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('operarios');
            collection.find({nombre: nombreUsuario}, {seguidas: 1}).toArray( (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result[0].seguidas);
                }
                db.close();
            });
        });
        return promise;
    },
    insertarOperario : async (db, operario) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('operarios');
            collection.insertOne(operario, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // _id no es un string es un ObjectID
                    resolve(result.ops[0]._id.toString());
                }
                db.close();
            });
        });
        return promise;
    },
    insertarTarea : async (db, tarea) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('tareas');
            collection.insertOne(tarea, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // _id no es un string es un ObjectID
                    resolve(result.ops[0]._id.toString());
                }
                db.close();
            });
        });
        return promise;
    },
    modificarTarea : async (db, criterio, tarea) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('tareas');
            collection.update(criterio, {$set: tarea}, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // modificado
                    resolve(result);
                }
                db.close();
            });
        });

        return promise;
    },
    eliminarTareas : async (db, criterio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('tareas');
            collection.remove(criterio, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result);
                }
                db.close();
            });
        });
        return promise;
    },
}
