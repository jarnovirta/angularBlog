'use strict';

angular.module('jvdotcomApp')
  .controller('StaticPagesCtrl', ['$rootScope', '$route', '$location', '$window', '$scope', 
    function ($rootScope, $route, $location, $window, $scope) {
  	$rootScope.blogPostDate = '';
    
    // Tell Prerender/PhantomJS that the page is ready (this is for SEO)
    $window.prerenderReady = true;
    var pageMeta;
    if ($location.path() === '/about') {
    	pageMeta = {
    		'title': 'About Me',
    		'pageSubtitle': 'And my projects',
    		'headerBackgroundImage': 'app/images/about-bg.jpg',
    		'description': 'Welcome to my blog! My name is Jarno Virta.'
	        	+ ' In this blog I post about my programming and Arduino / Raspberry Pi projects. The code for the projects' 
	        	+ ' presented here can be found on GitHub.',
            'currentUrl': 'www.codegizmos.com' + $location.path()
    	};
    };
    if ($location.path() === '/contact') {
    	pageMeta = {
    		'title': 'Contact Me',
    		'pageSubtitle': 'Send me an email',
    		'headerBackgroundImage': 'app/images/contact-bg.jpg',
    		'description': 'You can contact me by email at jarvirta1@gmail.com.',
            'currentUrl': 'www.codegizmos.com' + $location.path()
    	};

    };
    
    $scope.$emit('newPageLoaded', pageMeta);
  }]); 