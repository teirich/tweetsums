var fs = require('fs');

function log(text){
  var datetime = new Date();
  datetime = ("" + datetime).substr(4,20);
  console.log( datetime + "== " +  text);
}

function err(text){
  var datetime = new Date();
  datetime = ("" + datetime).substr(4,20);
  console.error( datetime + "## ERROR: " + text);
}
exports.loadAPIKeysSync = function (){
  var file_in = fs.readFileSync('./API_KEYS.json');
  var api_keys = JSON.parse(file_in);
  log("API_KEYS: " + JSON.stringify(api_keys));
  return api_keys;
}

exports.getSinceSync = function (){
  var file_in = fs.readFileSync('./SINCE');
  log('READ SINCE: ' + file_in.toString());
  return file_in.toString();
}

exports.setSince = function (val){
  fs.writeFile('./SINCE',val, function (e){
    if(e){ err(e); throw e; }
    log('WRITE SINCE: ' + val);
  });
}

exports.log = log;
exports.err = err;


