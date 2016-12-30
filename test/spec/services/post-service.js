'use strict';

describe('Service: PostService', function () {

  // load the service's module
  beforeEach(module('jvdotcomApp'));

  // instantiate service
  var PostService;
  beforeEach(inject(function (_PostService_) {
    PostService = _PostService_;
  }));

  it('should do something', function () {
    expect(!!PostService).toBe(true);
  });
});
