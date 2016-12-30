'use strict';

/**
 * @ngdoc overview
 * @name jvdotcomApp
 * @description
 * # jvdotcomApp
 *
 * Main module of the application.
 */
angular
  .module('jvdotcomApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'mgcrea.ngStrap',
    'infinite-scroll',
    'textAngular',
    'angular-jwt',
    'cgBusy',
    'td.easySocialShare' // https://github.com/tinacious/angular-easy-social-share
  ])
  .config(['$routeProvider', '$logProvider', '$locationProvider', function ($routeProvider, $logProvider, $locationProvider) {
    $logProvider.debugEnabled(true);
    $routeProvider
      .when('/home', {
        templateUrl: '/app/views/templates/post/blogPostsPanelTemplate.html',
        controller: 'PostListPanelCtrl'       
      })
      .when('/post/:id', {
        templateUrl: '/app/views/templates/post/postTemplate.html',
        controller: 'BlogPostCtrl'
        })
      .when('/about', {
        templateUrl: '/app/views/templates/staticPages/aboutPageTemplate.html',
        controller: 'StaticPagesCtrl'
      })
      .when('/contact', {
        templateUrl: '/app/views/templates/staticPages/contactPageTemplate.html',
        controller: 'StaticPagesCtrl'
      })
      .when('/admin', {
        templateUrl: '/app/views/templates/admin/adminPageTemplate.html',
        controller: 'SiteAdminCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      });

      $locationProvider.html5Mode(true);
  }]);
  