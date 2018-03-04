//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    Telegraf = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

app.get('/pagecount', function (req, res) {
  res.send('pagecounting');
});

function getTrackingInfo(ctx){
  let message="";
  let parametro=ctx.update.message.text;
  parametro=parametro.replace("/consultar ","");

  var request = require('request');
  var options = {
    uri: 'https://casillerovirtual4-72.com.co/Registration/Tracking/gettrackingresult?trackinno='+parametro,
    method: 'GET',
    headers: {
       'Content-Type': 'application/json'
    }
  };
  console.log(options);
  return new Promise(function(resolve, reject){
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        let jsonTracking=JSON.parse(body);
        if(!isEmpty(jsonTracking)){
          message="Hola *"+ctx.update.message.from.first_name+"*, su numero de guia *"+parametro+"* tiene estado *"+jsonTracking.dessta+"* enviado por *"+jsonTracking.rem_nombre+"*. Tubo un peso de *"+jsonTracking.pesolb+"* lbs, se recibio el dia *"+jsonTracking.recibo+"* y se recibio el pago el dia *"+jsonTracking.pagado+"*.";
        }else{
          message="No se encontro informacion sobre la guia *"+parametro+"*, valide su guia.";
        }
        console.log(message);
        resolve(message);
      }else{
        console.log(error);
        reject(error);
      }
    });
  });
};

bot.command('consultar', (ctx) => {
  getTrackingInfo(ctx).then(function(result) {
    console.log("exito");  
    return ctx.reply(result);
    }, function(err) {
      console.log(err);
    });
});
bot.on('text', ({ replyWithHTML }) => replyWithHTML('<b>Hey there!</b>'))
app.use(bot.webhookCallback('/'))

var isEmpty = function(data) {
    if(typeof(data) === 'object'){
        if(JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]'){
            return true;
        }else if(!data){
            return true;
        }
        return false;
    }else if(typeof(data) === 'string'){
        if(!data.trim()){
            return true;
        }
        return false;
    }else if(typeof(data) === 'undefined'){
        return true;
    }else{
        return false;
    }
}

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
