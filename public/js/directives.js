'use strict';

/* Directives */


angular.module('myApp.directives', [])

.directive("ajaxLoading", function() { 
	return {
		restrict: 'E',
		template: '<div id="loadingAjax" ng-show="showLoadingAjax">' +
		            '<img src="img/ajax-loader.gif" />' +
		         '</div>',
		replace: true
	};
});
