'use strict';

angular.module('jvdotcomApp').directive('pageHeaderElement', function(){
	return {
		restrict: 'E',
		templateUrl: '/app/scripts/directives/pageHeaderDirective/pageHeaderTemplate.html',
	};
});
