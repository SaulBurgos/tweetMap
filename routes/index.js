
/*
 * GET home page.
 * this is an example based on : http://www.kdelemme.com/2014/04/24/use-socket-io-to-stream-tweets-between-nodejs-and-angularjs/
 */

module.exports = function(io) {
    
    var routes = {};
    var credentials = {
        consumer_key: '',
        consumer_secret: '', 
        access_token: '', 
        access_token_secret:  ''
    };


    var Twit = require('twit')
    var twetSrv = new Twit(credentials);
    var tweetsBuffer = [];
    var TWEETS_BUFFER_SIZE = 2;
    var openSockets = 0;    
    var socketClient = undefined;
    
    routes.index = function(req, res) {  
        
        res.render('index', { title: 'Express' });
        
        //to control the bandwith
        io.sockets.on('connection', function(socket) {     
            
            socketClient = socket;
            
            socket.on('setRoom', function(room) {
                
                if(socket.room) {
                    socket.leave(socket.room);                   
                }
                socket.room = room;
                               
                socket.join(room);
                console.log('joined to this room:' + room);     
            });

            //console.log('Client connected !');            
            /*if (openSockets <= 0) {
                openSockets = 0;
                console.log('First active client. Start streaming from Twitter');
                //avoid connect start stream in index
                if(typeof stream !=='undefined') {
                    stream.start();
                }
            }*/
            
            openSockets++;

           /* socket.on('disconnect', function() {

                //console.log('Client disconnected !');

                openSockets--;

                if (openSockets <= 0) {
                    openSockets = 0;
                    //console.log("No active client. Stop streaming from Twitter");
                    if(typeof stream !=='undefined') {
                        stream.stop();  
                        stream = undefined;
                    }                    
                }
            });*/
        });
        
    };

    routes.stopTwets = function(req,res) {
        if(typeof stream !=='undefined') {
            stream.stop();  
            stream = undefined;
            console.log('stream stop');
        }       
        res.json({message: 'Stop stream tweets of nicaragua'});           
    };

    routes.getTwets = function(req,res) {
        
        
        
        var stream = twetSrv.stream('statuses/filter', { 
            locations: [-88.87,10.35,-82.01,15.36] 
            /*locations: [-122.75,36.8,-121.75,37.8]*/
        });
        
        socketClient.on('disconnect', function() {

                //console.log('Client disconnected !');

                openSockets--;

                if (openSockets <= 0) {
                    openSockets = 0;
                    //console.log("No active client. Stop streaming from Twitter");
                    if(typeof stream !=='undefined') {
                        stream.stop();
                    }                    
                }
        });

        stream.on('connect', function(request) {
            console.log('Connected to Twitter API');
        });

        stream.on('disconnect', function(message) {
            console.log('Disconnected from Twitter API. Message: ' + message);
        });

        stream.on('reconnect', function (request, response, connectInterval) {
          console.log('Trying to reconnect to Twitter API in ' + connectInterval + ' ms');
        });


        stream.on('tweet', function(tweet) {
            
            /*if(typeof req.query.parameters !== 'undefined') {
                var arrayHashtags = tweet.text.match(/#\S+/g);
                
                //if this tweet does not has hashtag
                if(arrayHashtags === null) { 
                    console.log('tweet without hashtags');
                    return;
                }               
            }*/            
            
            console.log(tweet.text.match(/#\S+/g));
            
            var msg = {};
            
            if (tweet.coordinates === null) {                
                if (tweet.geo === null) {
                    return ;
                } else {
                    msg.lat = tweet.geo.coordinates[0];
                    msg.lng = tweet.geo.coordinates[1];  
                    msg.typeCoordinates = 'geo';
                }
            } else {
                msg.lat = tweet.coordinates.coordinates[1];
                msg.lng = tweet.coordinates.coordinates[0];
                msg.typeCoordinates = 'coordinates';
            }

            msg.text = tweet.text;
            msg.user = {
                name: tweet.user.name,
                image: tweet.user.profile_image_url,
                twitterUser: tweet.user.screen_name
            };
            
            tweetsBuffer.push(msg); 
            console.log('send data to roomId:' + req.query.roomId);
            io.sockets.in(req.query.roomId).emit('tweets', tweetsBuffer);
            tweetsBuffer = [];
          

        });

        res.json({ 
            message: 'loading tweets of nicaragua'
        }); 
    };  
    
    return routes;
};

