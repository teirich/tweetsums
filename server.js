var OAuth=require('oauth').OAuth;
var f_util = require('./f_util');

var api_keys = null;
var blacklist = null;
var oa = null;

//localize these imported functions
var loadAPIKeysSync = f_util.loadAPIKeysSync;
var getSinceSync = f_util.getSinceSync;
var setSince = f_util.setSince;
var log = f_util.log;
var err = f_util.err;
var loadBlacklistSync = f_util.loadBlacklistSync;

//ensure that the chosen tweet is not in the blacklist
function isBlacklisted(tweet){
  for(var i = 0; i < blacklist.length ; i ++){
    if(blacklist[i] === tweet){
      return true;
    }
  }
  return false;
}

function getQuery(since){
  var query = 'https://api.twitter.com/1.1/search/tweets.json?q=plus%20equals';
  if((since != null) && (since > 0)){
    query = query + '&since_id=' + since;
  }
  log("OUTGOING QUERY: " + query);
  return query;
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

      if(!text.match(/RT/) && !isBlacklisted(text)){
        //this saves eight characters
        text = text.replace(/plus/ig,"+");
        text = text.replace(/equals/ig,"=");

        //but still need to get screen name in there
        
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
    
  api_keys = loadAPIKeysSync();
  blacklist = loadBlacklistSync();
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

  getTweets(q_since);
 
  log("------ STOP BOT ------");
}

exports.start = start;
