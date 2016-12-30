'use strict';

describe('Directive: blogPostsPanel', function () {

  // load the directive's module
  beforeEach(module('jvdotcomApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<blog-posts-panel></blog-posts-panel>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the blogPostsPanel directive');
  }));
});
