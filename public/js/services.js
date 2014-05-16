'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])

.service('tweetsServices', function ($http) {
    var that = this;
    
    this.config = {
		errorHandler : function(err) {
			console.log(err);
		},
		startLoadingIndicator : undefined,
		stopLoadingIndicator : undefined
	}
    
    this.setLoadingIndicators = function(notificators) {
		this.config.startLoadingIndicator = notificators.startLoadingIndicator;
		this.config.stopLoadingIndicator = notificators.stopLoadingIndicator;
	};
    
    this.setAdditionalOptions = function(promise) {
		promise.error(this.config.errorHandler);

		if ( typeof this.config.startLoadingIndicator !== 'undefined') {
			this.config.startLoadingIndicator();
		};

		if (typeof this.config.stopLoadingIndicator !== 'undefined') {
			promise.finally(function() {
				that.config.stopLoadingIndicator();
			}); 
		};
		return promise;
	}
    
    this.startStream = function(hashtags,roomId) {
        var dataParams = {
			roomId: roomId,
			parameters: hashtags
		};
		var promise = $http.get('/gettwets',  { params: dataParams , timeout: 10000});
		return this.setAdditionalOptions(promise);
    };
    
    this.stopStream = function(data) {
        var dataParams = {
			action: 'stopStream',
			parameters: data
		};
		var promise = $http.get('/stoptwets',  { params: dataParams , timeout: 10000});
		return this.setAdditionalOptions(promise);
    };
    
})

.service('socket', function ($rootScope) {
    var socket = io.connect();
    var room = _.uniqueId('room') + new Date().getUTCMilliseconds();
    
    socket.on('connect', function() {
       // Connected, let's sign-up for to receive messages for this room
       socket.emit('setRoom', room);
    });
    
    return {
        stopListeners: function (eventName, callback) {
                socket.removeAllListeners(eventName, function () {  
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
        },
        on: function (eventName, callback) {
                socket.on(eventName, function () {  
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
        },
        emit: function (eventName, data, callback) {
                  socket.emit(eventName, data, function () {
                      var args = arguments;
                      $rootScope.$apply(function () {
                          if (callback) {
                            callback.apply(socket, args);
                          }
                      });
                  })
        },
        roomId:room 
    };
})
  
.value('version', '0.1');
