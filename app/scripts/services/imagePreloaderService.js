'use strict';

angular.module('jvdotcomApp')
  .service('ImagePreloader', ['$q', function ($q) {
    this.preloadImages = function() {
    ['app/images/about-bg.jpg', 'app/images/contact-bg.jpg', 'app/images/home-bg.jpg', 'app/images/post-bg.jpg'].forEach(function(url) {
      var deffered = $q.defer(),
             image = new Image();
     image.src = url;

      if (image.complete) {
        deffered.resolve(image);

      } else {

        image.addEventListener('load', function() {
          deffered.resolve(image);
        });

        image.addEventListener('error', function() {
          deffered.reject();
        });
      }
      return deffered.promise;
    });
  }
}]);