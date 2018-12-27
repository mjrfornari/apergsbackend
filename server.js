
var mysql      = require('mysql');
//var connection = mysql.createConnection({
//  host     : 'localhost',
//  user     : 'root',
//  password : 'eloperdido',
//  database : 'apergsdb',
//});

//mysql://b2a54ba1936954:69dd8472@us-cdbr-iron-east-01.cleardb.net/heroku_bc855f521588179?reconnect=true

var connection = mysql.createPool({
     connectTimeout : 1000,
     host     : 'us-cdbr-iron-east-01.cleardb.net',
     user     : 'b2a54ba1936954',
     password : '69dd8472',
     database : 'heroku_bc855f521588179'
});



// var connection;

// function handleDisconnect() {
//   connection = mysql.createConnection(db_config); // Recreate the connection, since
//                                                   // the old one cannot be reused.

//   connection.connect(function(err) {              // The server is either down
//     if(err) {                                     // or restarting (takes a while sometimes).
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
//     }                                     // to avoid a hot loop, and to allow our node script to
//   });                                     // process asynchronous requests in the meantime.
//                                           // If you're also serving http, display a 503 error.
//   connection.on('error', function(err) {
//     console.log('db error', err);
//     if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//       handleDisconnect();                         // lost due to either server restart, or a
//     } else {                                      // connnection idle timeout (the wait_timeout
//       throw err;                                  // server variable configures this)
//     }
//   });
// }

// handleDisconnect();

let app = require('express')()
let http = require('http').Server(app)
let cors = require('cors')


let port = process.env.PORT || 3001


const { StringDecoder } = require('string_decoder');


app.use(cors())

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));


function dataISOtoDefault(data) {
    let day, month, year = ''
    year = data.substr(0,4)
    month = data.substr(5,2)
    day = data.substr(8,2)
    return (day+'/'+month+'/'+year)
}


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


http.listen(port, function(){
    console.log('listening on *:' + port)
})



//////////////////////////////////SQLS///////////////////////////////////////

//Associados

    //GET
    app.get('/api/getAssociados',  function (req, res, next) {
        let sql = 'SELECT ass.*, lot.descricao as nomelot, sit.descricao as nomesit from associados ass'+
                ' left join lotacoes lot on lot.pk_lot = ass.fk_lot '+
                ' left join situacoes sit on sit.pk_sit = ass.fk_sit '

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_ass = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
        

    })

    //NOVO
    app.post('/api/novoAssociado',  function (req, res, next) {
        let sql = 'insert into ASSOCIADOS ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editAssociado',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update ASSOCIADOS set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_ass=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteAssociado',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from ASSOCIADOS where pk_ass=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Países

    //GET
    app.get('/api/getPaises',  function (req, res, next) {
        let sql = 'SELECT * from paises ';

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_pai = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
        

    })

    //NOVO
    app.post('/api/novoPaises',  function (req, res, next) {
        let sql = 'insert into PAISES ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editPaises',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update PAISES set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_pai=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deletePaises',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from PAISES where pk_pai=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Lotações

    //GET
    app.get('/api/getLotacoes',  function (req, res, next) {
        let sql = 'SELECT * from LOTACOES ';

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_lot = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
        

    })

    //NOVO
    app.post('/api/novoLotacoes',  function (req, res, next) {
        let sql = 'insert into LOTACOES ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editLotacoes',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update LOTACOES set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_lot=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteLotacoes',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from LOTACOES where pk_lot=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Situações

    //GET
    app.get('/api/getSituacoes',  function (req, res, next) {
        let sql = 'SELECT * from situacoes ';

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_sit = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
        
    })

    //NOVO
    app.post('/api/novoSituacoes',  function (req, res, next) {
        let sql = 'insert into SITUACOES ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editSituacoes',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update SITUACOES set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_sit=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteSituacoes',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from SITUACOES where pk_sit=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Tipos de Dependentes

    //GET
    app.get('/api/getTiposDependentes',  function (req, res, next) {
        let sql = 'SELECT * from tipo_dependentes ';

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_tde = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
        
    })

    //NOVO
    app.post('/api/novoTiposDependentes',  function (req, res, next) {
        let sql = 'insert into TIPO_DEPENDENTES ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editTiposDependentes',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update TIPO_DEPENDENTES set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_tde=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteTiposDependentes',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from TIPO_DEPENDENTES where pk_tde=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Estados

    //GET
    app.get('/api/getEstados',  function (req, res, next) {
        let sql = 'SELECT est.*, pai.nome nomepai from estados est '+
            ' join paises pai on pai.pk_pai = est.fk_pai ';

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_est = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
        

    })

    //NOVO
    app.post('/api/novoEstados',  function (req, res, next) {
        let sql = 'insert into ESTADOS ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editEstados',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update ESTADOS set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_est=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteEstados',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from ESTADOS where pk_est=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Cidades

    //GET
    app.get('/api/getCidades',  function (req, res, next) {
        let sql = 'SELECT cid.*, est.sigla, est.nome nomeest, pai.nome nomepai, est.fk_pai, concat(cid.nome," - ",est.sigla) as descricao from cidades cid '+
        ' join estados est on est.pk_est = cid.fk_est '+
        ' join paises pai on pai.pk_pai = est.fk_pai '
        
        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_cid = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
    

    })

    //NOVO
    app.post('/api/novoCidades',  function (req, res, next) {
        let sql = 'insert into CIDADES ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editCidades',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update CIDADES set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_cid=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteCidades',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from CIDADES where pk_cid=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Categorias Associados

    //GET
    app.get('/api/getCategoriasAssociados',  function (req, res, next) {
        let sql = 'SELECT * from Categorias_Associados ';

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_cat = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
    

    })

    //NOVO
    app.post('/api/novoCategoriasAssociados',  function (req, res, next) {
        let sql = 'insert into CATEGORIAS_ASSOCIADOS ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editCategoriasAssociados',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update CATEGORIAS_ASSOCIADOS set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_cat=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteCategoriasAssociados',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from CATEGORIAS_ASSOCIADOS where pk_cat=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Celulares

    //GET
    app.get('/api/getCelulares',  function (req, res, next) {
        let sql = 'SELECT ace.* from associados_celulares ace ';
        
        if (Number(req.query.fk) > 0) {
            sql = sql + 'where fk_ass = '+(Number(req.query.fk)).toString()
        }

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_ace = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;

            res.json(results)
        });
        

    })

    //NOVO
    app.post('/api/novoCelular',  function (req, res, next) {
        let sql = 'insert into ASSOCIADOS_CELULARES ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editCelular',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update ASSOCIADOS_CELULARES set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_ace=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteCelular',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from ASSOCIADOS_CELULARES where pk_ace=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Parâmetros

    //GET
    app.get('/api/getParametros',  function (req, res, next) {
        let sql = 'SELECT * from parametros ';

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_par = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results)
        });
        

    })

    //NOVO
    app.post('/api/novoParametros',  function (req, res, next) {
        let sql = 'insert into PARAMETROS ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editParametros',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update PARAMETROS set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_par=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//

//Bancos

    //GET
    app.get('/api/getBancos',  function (req, res, next) {
        let sql = 'SELECT bco.* from bancos bco ';
        

        if (Number(req.query.pk) > 0) {
            sql = sql + 'where pk_bco = '+(Number(req.query.pk)).toString()
        }

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;

            res.json(results)
        });
        

    })

    //NOVO
    app.post('/api/novoBancos',  function (req, res, next) {
        let sql = 'insert into BANCOS ('
        let data = req.body
        let fields = Object.getOwnPropertyNames(data)
        let values = [Object.values(data)]
        sql = sql + fields.toString()+') values ?'
        connection.query(sql, [values], function (error, results, fields){
            if(error) {
                res.status(500).json(error)
                return console.log(error);
            }
            console.log('adicionou registros!');
            res.status(200).json({message: 'Success!', pk: results.insertId})
        });
        
    })

    //EDIT
    app.post('/api/editBancos',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'update Bancos set '
            let pk = Number(req.query.pk)
            let data = req.body
            let fields = Object.getOwnPropertyNames(data)
            let teste = fields.join('=?, ')+'=?'
            let values = Object.values(data)
            let fieldsnvalues = mysql.format(teste, values)
            sql = sql + fieldsnvalues + ' where pk_bco=?'
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('alterou registros!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

    //DELETE
    app.post('/api/deleteBancos',  function (req, res, next) {
        if (Number(req.query.pk) > 0) {
            let sql = 'delete from BANCOS where pk_bco=? '
            let pk = Number(req.query.pk)
            connection.query(sql, pk, function (error, results, fields){
                if(error) {
                    res.status(500).json(error)
                    return console.log(error);
                }
                // console.log(mysql.format(sql, pk))
                console.log('excluiu registro!');
                console.log(results)
                res.status(200).json({message: 'Success!', rows: results.affectedRows})
            });
        } else {
            res.status(500).json({ error: 'Código do registro não encontrado!'})
        }
    })

//