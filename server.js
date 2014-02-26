var OAuth=require('oauth').OAuth;
var fs = require('fs');

var api_keys = null;

//TODO: Move some of these into a Util class
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

function loadAPIKeysSync(){
  var file_in = fs.readFileSync('./API_KEYS.json');
  api_keys = JSON.parse(file_in);
  log("API_KEYS: " + JSON.stringify(api_keys));
}

function getQuery(since){
  var query = 'https://api.twitter.com/1.1/search/tweets.json?q=plus%20equals';
  if(since != null){
    query = query + '&since_id=' + since;
  }
  log("OUTGOING QUERY: " + query);
  return query;
}

function getSinceSync(){
  var file_in = fs.readFileSync('./SINCE');
  log('READ SINCE: ' + file_in.toString());
  return file_in.toString();
}

function setSince(val){
  fs.writeFile('./SINCE',val, function (e){
    if(e){ err(e); throw e; } 
    log('WRITE SINCE: ' + val);
  });
}

function callback(e, data, res){
  if(e){
    err(e);
  }
  else{
    var reply = JSON.parse(data);

    for(var i = 0; i < reply["statuses"].length; i ++){
      var screen_name = reply["statuses"][i]["user"]["screen_name"];
      var text = reply["statuses"][i]["text"];
      if(!text.match(/RT/)){
        //this saves eight characters
        text = text.replace("plus","+");
        text = text.replace("equals","=");

        //adds eight characters
        log(text + " #QED -@" + screen_name );
      }
    }
    //log the last used ID
    log("MAX_ID: " + reply["search_metadata"]["max_id"]);
  
    setSince(reply["search_metadata"]["max_id"]);
  }
}

function start(since) {

  log((new Date()).getTime() + "......BOT STARTED......" 
    
  loadAPIKeysSync();

  var oa= new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    api_keys["API_key"],
    api_keys["API_secret"],
    '1.0A',
    null,
    'HMAC-SHA1'
  );

  var q_since = getSinceSync() * 1;

  //start loop
  while(true){

    //GET response
    var response = oa.get(
      getQuery(q_since),
      api_keys["access_token"],  //access token
      api_keys["access_token_secret"], //acces token secret
      callback);

  }
  //end loop
  log("------ STOP BOT ------");
}

exports.start = start;
