var OAuth=require('oauth').OAuth;
var fs = require('fs');

var api_keys = null;
var oa = null;

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
  if((since != null) && (since > 0)){
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

function postTweet(text, since){
  log("POST TWEET");

  oa.post(
    "https://api.twitter.com/1.1/statuses/update.json",
    api_keys["access_token"],
    api_keys["access_token_secret"],
    {"status" : text},
    "application/json",
    function(e, data){
      if(e){
        err("POST TWEET ERR: " +e);
      }
      else{
        //log the response
        log("SERVER RESPONSE: " + data);

        //log the last used ID
        log("LOG SINCE ID: " + since);
        setSince(since);
      
        //restart from beginning after 2 hours
        // 1 hr = 36000000 ms
        setTimeout(getTweets, 7200000);
      }
    }
  );
}

function processResponse(e, data, res){
  if(e){
    err(e);
  }
  else{
    
    log("PROCESS RESPONSE");
    
    var reply = JSON.parse(data);
    
    log("PROCESS: " + data);

    for(var i = 0; i < reply["statuses"].length; i ++){
      var screen_name = reply["statuses"][i]["user"]["screen_name"];
      var text = reply["statuses"][i]["text"];

      if(!text.match(/RT/)){
        //this saves eight characters
        text = text.replace(/plus/ig,"+");
        text = text.replace(/equals/ig,"=");

        //but still need to get sn in there
        
        if(text.length + screen_name.length + 8 <= 140){
          text = text + " #QED -@" + screen_name;
          log(text);
          postTweet(text, reply["statuses"][i]["id"]);
          return;
        }
        else if (text.length + screen_name.lenght + 7 <= 140){
          text = text + " #QED @" + screen_name;
          log(text);
          postTweet(text, reply["statuses"][i]["id"]);
          return;
        }
        else if (text.length + screen_name.length + 2 <= 140){
          text = text + " @" + screen_name;
          log(text);
          postTweet(text, reply["statuses"][i]["id"]);
          return;
        }
      }
    }
  }
}

function getTweets(since) {
    //GET response
    var response = oa.get(
      getQuery(since),
      api_keys["access_token"],  //access token
      api_keys["access_token_secret"], //acces token secret
      processResponse);
}

function start(since) {

  log((new Date()).getTime() + "......BOT STARTED......" );
    
  loadAPIKeysSync();

  oa= new OAuth(
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
  getTweets(q_since);
 
  //end loop
  log("------ STOP BOT ------");
}

exports.start = start;
