goog.require('goog.Promise');
goog.require('os.data.ConfigDescriptor');
goog.require('os.mock');
goog.require('plugin.ogcapi.LandingPageParser');
goog.require('plugin.ogcapi.ID');

var jsonText = '{"links": [{"rel": "self", "type": "application/json", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/stable"}, {"rel": "self", "type": "text/html", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/stable/?f=html", "hreflang": "en-US"}, {"rel": "service", "type": "application/openapi+json;version=3.0", "title": "The OpenAPI definition as JSON", "href": "https://demo.pygeoapi.io/stable/api"}, {"rel": "self", "type": "text/html", "title": "The OpenAPI definition as HTML", "href": "https://demo.pygeoapi.io/stable/api?f=html", "hreflang": "en-US"}, {"rel": "conformance", "type": "application/json", "title": "conformance", "href": "https://demo.pygeoapi.io/stable/conformance"}, {"rel": "data", "type": "application/json", "title": "collections", "href": "https://demo.pygeoapi.io/stable/collections"}]}';

describe('plugin.ogcapi.LandingPageParser', function () {
  it('should construct properly', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    expect(p.errorMessage_).toBe("");
    expect(Object.keys(p.getLinks()).length).toBe(0);
  });

  it('should load valid JSON', function () {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(jsonText));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function () {
      p.load('/something');
    });

    waitsFor(function () {
      return p.onLoad.calls.length;
    });

    runs(function () {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).not.toHaveBeenCalled();
    });
  });

  it('should error on invalid JSON', function () {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('[wut'));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function () {
      p.load('/bad');
    });

    waitsFor(function () {
      return p.onLoad.calls.length;
    });

    runs(function () {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should error on request error', function () {
    var p = new plugin.ogcapi.DataProvider();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(
      goog.Promise.reject(['something awful happened']));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function () {
      p.load('/woe');
    });

    waitsFor(function () {
      return p.onError.calls.length;
    });

    runs(function () {
      expect(p.onLoad).not.toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should ignore JSON that is not an array', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('{}'));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function () {
      p.load('/bad');
    });

    waitsFor(function () {
      return p.onLoad.calls.length;
    });

    runs(function () {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should handle onError with array', function () {
    var p = new plugin.ogcapi.LandingPageParser();

    runs(function () {
      p.onError(['one', 'two']);
      expect(p.errorMessage_).toBe('one two');
    });
  });


  it('should handle links that are correct', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function () {
      p.handleLink_({ 'rel': 'conformance', 'type': 'application/json', 'href': 'https://demo.pygeoapi.io/stable/conformance' });
      expect(Object.keys(p.getLinks()).length).toBe(1);
    });
  });


  it('should handle links that are correct with optional title included', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function () {
      p.handleLink_({ 'rel': 'conformance', 'type': 'application/json', 'title': 'conformance', 'href': 'https://demo.pygeoapi.io/stable/conformance' })
      console.log('test: ' + JSON.stringify(p.getLinks()));
      expect(Object.keys(p.getLinks()).length).toBe(1);
      expect(p.getLinks()['conformance']).toBe('https://demo.pygeoapi.io/stable/conformance');
    });
  });


  it('should handle openapi links that are correct', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function () {
      p.handleLink_({ 'rel': 'service', 'type': 'application/openapi+json;version=3.0', 'href': 'https://demo.pygeoapi.io/stable/api' });
      expect(Object.keys(p.getLinks()).length).toBe(1);
      expect(p.getLinks()['service']).toBe('https://demo.pygeoapi.io/stable/api');
    });
  });

  it('should handle data (collection) links that are correct', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function () {
      p.handleLink_({ 'rel': 'data', 'type': 'application/json', 'href': 'https://demo.pygeoapi.io/stable/collections' });
      expect(Object.keys(p.getLinks()).length).toBe(1);
      expect(p.getLinks()['data']).toBe('https://demo.pygeoapi.io/stable/collections');
    });
  });


  it('should ignore links that are not needed', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function () {
      p.handleLink_({'rel':'self','type':'application/json','href':'https://demo.pygeoapi.io/stable'});
      expect(Object.keys(p.getLinks()).length).toBe(0);
    });
  });


  it('should handle not links that are incorrect', function () {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function () {
      p.handleLink_({ 'type': 'application/json', 'title': 'conformance', 'href': 'https://demo.pygeoapi.io/stable/conformance' });
      expect(Object.keys(p.getLinks()).length).toBe(0);
    });
  });
});
