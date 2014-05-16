'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

    .controller('MainCtrl', function($scope,googleMapsService,tweetsServices) {
        $scope.showLoadingAjax = false;
        $scope.mapOptions = {
            zoom: 8,		
            center: new google.maps.LatLng(13.00, -84.84),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            draggableCursor: 'auto',
            disableDoubleClickZoom: true,
            draggable :true,
            keyboardShortcuts: false,
            disableDefaultUI: false,
            scaleControl: true,
            panControl: true,
            zoomControl: true
        };
        $scope.streamOn = false;
        $scope.tweets = [];
        
        $scope.notificationProgress = {
            startLoadingIndicator: function() {
                $scope.$emit("startProgress");
            },
            stopLoadingIndicator: function() {
                $scope.$emit("stopProgress");               
            }
        };
        
        $scope.searchBox = {
            hashtags : ''
        }
        
        $scope.googleMaps = new googleMapsService(document.querySelector('#mainMap'));
        
        //create a event
		$scope.$on('startAjax', function() {
			$scope.showLoadingAjax = true;
		});

		//create a event
		$scope.$on('stopAjax', function() {
			$scope.showLoadingAjax = false;
		});

        $scope.$on('$viewContentLoaded', function() {
            $scope.googleMaps.loadMap( $scope.mapOptions);
            $scope.googleMaps.addFeatureToGoogleMaps();
            $scope.googleMaps.createPolygonCountries();
            tweetsServices.setLoadingIndicators($scope.notificationProgress);
        });
    })

    .controller('SearchView', function($scope,$timeout,tweetsServices,socket) {
        
        $scope.timerStream = undefined;        
        $scope.openTweetsBox = false;
        
        $scope.getTweets = function() {
            //var patternHashtag = /(^|\s)#([^ ]*)/g;
            var patternHashtag = /#\S+/g;
            var hashtagsUser = $scope.searchBox.hashtags.match(patternHashtag);
            
            //allow only one hashtag
            if(hashtagsUser !== null) {
                hashtagsUser = hashtagsUser[0];
            }
            
            $scope.googleMaps.removeMarker($scope.tweets);
            $scope.tweets = [];
            
            var promise = tweetsServices.startStream(hashtagsUser,socket.roomId);
            promise.success(function(response){
                $scope.streamOn = true;
                $scope.setListenerSocket();
                
                $scope.timerStream = $timeout(function () {
                     $scope.stopTweets();
                     $scope.timerStream = undefined;
                }, 300000);//five minutes
                
            });
        };
        
        $scope.stopTweets = function(){
            var promise = tweetsServices.stopStream();
            promise.success(function(response){
                console.log(response);
                $scope.streamOn = false;     
                socket.stopListeners('tweets');
            });
        };
        
        $scope.setListenerSocket = function(){
             socket.on('tweets', function (data) {               
                var newTweets;
                 //filter tweets by hashtags
                if( $scope.searchBox.hashtags != '') {
                    var tweetsFilters = $scope.filterByHashTags(data);                 
                    newTweets = $scope.googleMaps.createMarker(tweetsFilters);
                } else {
                    newTweets = $scope.googleMaps.createMarker(data);
                }   
                 
                 $scope.tweets =  _.union($scope.tweets,newTweets);  
                console.log($scope.tweets);
             });
        };
        
        $scope.filterByHashTags = function(tweets) {
            
            var newTweetsFiltered = [];
            var patternHashtag = /#\S+/g;
            var hashtagsUser = $scope.searchBox.hashtags.match(patternHashtag);
            
             //allow only one hashtag
            if(hashtagsUser !== null) {                
                hashtagsUser = hashtagsUser[0];                
                for (var i = 0; i < tweets.length; i++) {               
                    var hashTagsInText = tweets[i].text.match(patternHashtag);
                    
                     if(hashTagsInText !== null) {                  
                        
                        if(_.contains(hashTagsInText, hashtagsUser)) {
                            newTweetsFiltered.push(tweets[i]);
                        }     
                     }
                    
                }  
            }            
            return newTweetsFiltered;           
        };
        
        $scope.toogleTweetsBox = function() {
            angular.element('#tweetBox .panel').slideToggle( "slow");
        };
        
        //triggered $destroy event just before tearing down a scope and removing the scope from its parent.
		$scope.$on("$destroy", function() {			

			if(typeof $scope.timerStream !== 'undefined') {
				$timeout.cancel($scope.timerStream);
			}

    	});
        
        console.log('room created:' + socket.roomId);

    })

    .controller('MyCtrl2', function($scope) {

    });
