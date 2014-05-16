'use strict';

/* Filters */

angular.module('myApp.filters', [])

.filter('reverseTweetsFilter', function() {
  return function(items) {
      if (!angular.isArray(items)){
        return false; //this return the original value 
      } else {
    	return items.slice().reverse();      
      }    
  };
});
