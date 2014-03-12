var fs = require('fs');

//Print text to the server console
function log(text){
  var datetime = new Date();
  datetime = ("" + datetime).substr(4,20);
  console.log( datetime + "== " +  text);
}

//Print error message to the server console
function err(text){
  var datetime = new Date();
  datetime = ("" + datetime).substr(4,20);
  console.error( datetime + "## ERROR: " + text);
}

//Read API keys from API_KEYS.json file 
exports.loadAPIKeysSync = function (){
  var file_in = fs.readFileSync('./API_KEYS.json');
  var api_keys = JSON.parse(file_in);
  log("API_KEYS: " + JSON.stringify(api_keys));
  return api_keys;
}

//Returns the blacklisted tweets
exports.loadBlacklistSync = function(){
  var file_in = fs.readFileSync('./BLACKLIST');
  log('READ BLACKLIST: ' + file_in.toString());
  return file_in.toString().split('\n');
}

//Returns the highest queried tweet id
exports.getSinceSync = function (){
  var file_in = fs.readFileSync('./SINCE');
  log('READ SINCE: ' + file_in.toString());
  return file_in.toString();
}

//Sets the highest queried tweet id
exports.setSince = function (val){
  fs.writeFile('./SINCE',val, function (e){
    if(e){ err(e); throw e; }
    log('WRITE SINCE: ' + val);
  });
}

exports.log = log;
exports.err = err;


