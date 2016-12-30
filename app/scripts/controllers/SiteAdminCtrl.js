'use strict';

angular.module('jvdotcomApp')
  .controller('SiteAdminCtrl', ['$scope', '$modal', '$rootScope', '$interval', '$timeout', 'User', 'Websocket', '$q',
    '$location', '$window', function ($scope, $modal, $rootScope, $interval, $timeout, User, Websocket, $q, $location, $window) {
  	
    // Tell Prerender/PhantomJS that the page is ready (this is for SEO)
    $window.prerenderReady = true;
    $rootScope.pageTitle = 'Admin page';
    
    $rootScope.currentUrl = 'www.codegizmos.com' + $location.path();
    $rootScope.headerBackgroundImage = 'app/images/home-bg.jpg';
        
    $rootScope.blogPostDate = '';

    $scope.$emit('newPageLoaded', {
        'title': 'Site Admin',
        'headerBackgroundImage': 'app/images/home-bg.jpg',
        });
    $rootScope.loggedInUser = User.getUser();
    $scope.loginModalUser = {};
    
    var intervalPromise;

    var loginModal = $modal({
	scope: $scope,
	template: 'app/views/templates/admin/loginModal.html',
	show: false
        });

    var generateIpListString = function(serverArray) {
            var ipList = [];
            serverArray.forEach(function(server) {
                ipList.push(server.host);
            });
            return ipList.join(' / ');
    }
    var requestSiteStatus = function () {
        var deferred = $q.defer();
       
        // Only cache Websocket request if no Websocket connection and siteStatus has not 
        // been set yet (first request).
        var firstWebsocketRequest = $scope.siteStatus ? false : true;
        console.log("Controller requesting cacheing: " + firstWebsocketRequest);
        Websocket.send('site_status_info', null, firstWebsocketRequest).then(function(info) {
            if (info) {
                $scope.siteStatus = info;
                if (deferred) {
                        deferred.resolve();
                }
                if (info && info.webServers) {
                    $scope.webServerIpList = generateIpListString(info.webServers);
                }
                if (info.userAuthServers) {
                    $scope.userAuthServerIpList = generateIpListString(info.userAuthServers);
                }
            
                // Set interval for siteStatusRequests.
                if (firstWebsocketRequest) {
                    console.log("Setting interval");
                    intervalPromise = $interval(requestSiteStatus, 5*1000);
                    $scope.$on('$destroy', function() {
                        console.log("destroying interval");
                        $interval.cancel(intervalPromise);
                    });

                }
            }
            // In the case of error and when no site status info has been provided, wait 3 seconds and resend 
            // a request.
            else if (!$scope.siteStatus) {
                console.log("siteAdminCtrl: Resending site_status_info request in 5 seconds.");
                $timeout(requestSiteStatus, 5000);
            }
            
        });
        return deferred.promise;    
    };

$scope.submitLogin = function() {
    loginModal.hide();
    User.login($scope.loginModalUser, function(user) {
        $rootScope.loggedInUser = user;
        $scope.loadSiteStatistics = requestSiteStatus();
    });
};

    if (!$rootScope.loggedInUser) {
        loginModal.$promise.then(loginModal.show);

    }
    else {
        $scope.loadSiteStatistics = requestSiteStatus();
    }

}]);