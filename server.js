
var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'eloperdido',
//   database : 'apergsdb',
// });

//mysql://b2a54ba1936954:69dd8472@us-cdbr-iron-east-01.cleardb.net/heroku_bc855f521588179?reconnect=true

var db_config = mysql.createConnection({
  host     : 'us-cdbr-iron-east-01.cleardb.net',
  user     : 'b2a54ba1936954',
  password : '69dd8472',
  database : 'heroku_bc855f521588179'
});



var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

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



app.get('/api/getAssociados',  function (req, res, next) {
    let sql = 'SELECT ass.*, lot.descricao as nomelot, sit.descricao as nomesit from associados ass'+
            ' left join lotacoes lot on lot.pk_lot = ass.fk_lot '+
            ' left join situacoes sit on sit.pk_sit = ass.fk_sit '

    if (Number(req.query.pk) > 0) {
        sql = sql + 'where pk_ass = '+(Number(req.query.pk)).toString()
    }

    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        // connection.end();
        res.json(results)
    });
    

})


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


app.get('/api/getLotacoes',  function (req, res, next) {


    connection.query('SELECT * from lotacoes', function (error, results, fields) {
        if (error) throw error;
        res.json(results)
    });
 
})

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



app.get('/api/getCidades',  function (req, res, next) {
    let sql = 'SELECT cid.*, est.sigla, est.nome, pai.nome, concat(cid.nome," - ",est.sigla) as descricao from cidades cid '+
    ' join estados est on est.pk_est = cid.fk_est '+
    ' join paises pai on pai.pk_pai = est.fk_pai '

    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results)
    });
 

})


app.get('/api/getCategorias',  function (req, res, next) {


    connection.query('SELECT * from categorias_associados', function (error, results, fields) {
        if (error) throw error;
        res.json(results)
    });
 

})

app.get('/api/getBancos',  function (req, res, next) {


    connection.query('SELECT * from bancos', function (error, results, fields) {
        if (error) throw error;
        res.json(results)
    });
 

})

app.get('/api/getSituacoes',  function (req, res, next) {


    connection.query('SELECT * from situacoes', function (error, results, fields) {
        if (error) throw error;
        res.json(results)
    });
 

})




http.listen(port, function(){
    console.log('listening on *:' + port)
})
