var OAuth=require('oauth').OAuth;

function callback(e, data, res){
  if(e){
    console.error(e);
  }
  else{
   console.log(data);
  }
}

function start(since) {

  var oa= new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    'vkFQwpqv1nEtSyZw74lrNQ',  //API key
    'Rfr9VtT3mj9ncKY49bQpCbYQwPpqPI3Obsi9n2BnH8',  //API secret
    '1.0A',
    null,
    'HMAC-SHA1'
  );

  var query = 'https://api.twitter.com/1.1/search/tweets.json?q=plus%20equals';
  //test this
  if(since != null){
    query = query + '&since_id=' + since;
  }

  oa.get(
    query,
    '2352566012-FtZ1B6GTWN88iTHYFJhEqN8ATx9oYwXZrUKY5PS',  //access token
    'BfXdJKszr3nV3IvDm1GuArQb6GXooc7XtFmjQ2M3qlnH9', //acces token secret
    callback);

}

exports.start = start;
