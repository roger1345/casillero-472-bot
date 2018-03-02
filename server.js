//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
    fs      = require('fs'),
    path    = require('path'),
    http = require('http'),
    bodyParser = require('body-parser');


var mongoose = require('mongoose');
    
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD'],
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

var sendMessage= function(req,res,text){
    var data = {
        'chat_id' : req.body.message.chat.id,
        'text': text
    };

    var request = require('request');
    var options = {
      uri: 'https://api.telegram.org//bot525279818:AAFlIkZEzWHhuuBYJZ96_YR7y6imZYhEYzQ/sendMessage',
      method: 'POST',
      json: data
    };
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        res.status(200).end();
      }
    });
};


app.post('/', function(req,res){
  
  var text="";

console.log(req);
console.log("#################################################");
console.log(req.body);

if (typeof req.body !== 'undefined' && typeof req.body.message !== 'undefined' && typeof req.body.message.text !== 'undefined' && req.body.message.text ){

if(req.body.message.text.startsWith('/consultar')){

    let parametro=req.body.message.text;
    parametro=parametro.replace("/consultar ","");

    var request = require('request');
    var options = {
      uri: 'https://casillerovirtual4-72.com.co/Registration/Tracking/gettrackingresult?trackinno='+parametro,
      method: 'GET',
      headers: {
         'Content-Type': 'application/json'
      }
    };
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        let jsonTracking=JSON.parse(body);
        let message="Hola *"+bodyjson.message.from.first_name+"*, su numero de guia *"+parametro+"* tiene estado *"+jsonTracking.dessta+"* enviado por *"+jsonTracking.rem_nombre+"*. Tubo un peso de *"+jsonTracking.pesolb+"* lbs, se recibio el dia *"+jsonTracking.recibo+"* y se recibio el pago el dia *"+jsonTracking.pagado+"*.";
        sendMessage(req,res,message);
      }else{
        res.status(500).end();
      }
    });
}else{
res.status(200).end();
}

}else{
res.status(200).end();
}

});

// error handling 
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
