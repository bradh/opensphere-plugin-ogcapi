goog.require('goog.Promise');
goog.require('os.data.ConfigDescriptor');
goog.require('os.mock');
goog.require('plugin.ogcapi.ID');
goog.require('plugin.ogcapi.LandingPageParser');

var jsonText = '{"links": [{"rel": "self", "type": "application/json", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/stable"}, {"rel": "self", "type": "text/html", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/stable/?f=html", "hreflang": "en-US"}, {"rel": "service", "type": "application/openapi+json;version=3.0", "title": "The OpenAPI definition as JSON", "href": "https://demo.pygeoapi.io/stable/api"}, {"rel": "self", "type": "text/html", "title": "The OpenAPI definition as HTML", "href": "https://demo.pygeoapi.io/stable/api?f=html", "hreflang": "en-US"}, {"rel": "conformance", "type": "application/json", "title": "conformance", "href": "https://demo.pygeoapi.io/stable/conformance"}, {"rel": "data", "type": "application/json", "title": "collections", "href": "https://demo.pygeoapi.io/stable/collections"}]}';
var jsonTextWithTitleAndDescription = '{"links": [{"rel": "self", "type": "application/json", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/stable"}, {"rel": "self", "type": "text/html", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/stable/?f=html", "hreflang": "en-US"}, {"rel": "service", "type": "application/openapi+json;version=3.0", "title": "The OpenAPI definition as JSON", "href": "https://demo.pygeoapi.io/stable/api"}, {"rel": "self", "type": "text/html", "title": "The OpenAPI definition as HTML", "href": "https://demo.pygeoapi.io/stable/api?f=html", "hreflang": "en-US"}, {"rel": "conformance", "type": "application/json", "title": "conformance", "href": "https://demo.pygeoapi.io/stable/conformance"}, {"rel": "data", "type": "application/json", "title": "collections", "href": "https://demo.pygeoapi.io/stable/collections"}], "title": "pygeoapi Demo instance - landing page title", "description": "pygeoapi provides an API to geospatial data"}';
var serviceText = '{"components": {"parameters": {"bbox": {"description": "The bbox parameter indicates the minimum bounding rectangle upon which to query the collection in WFS84 (minx, miny, maxx, maxy).", "explode": false, "in": "query", "name": "bbox", "required": false, "schema": {"items": {"type": "number"}, "maxItems": 6, "minItems": 4, "type": "array"}, "style": "form"}, "f": {"description": "The optional f parameter indicates the output format which the server shall provide as part of the response document.  The default format is GeoJSON.", "explode": false, "in": "query", "name": "f", "required": false, "schema": {"default": "json", "enum": ["json", "csv"], "type": "string"}, "style": "form"}, "id": {"description": "The id of a feature", "in": "path", "name": "id", "required": true, "schema": {"type": "string"}}, "limit": {"description": "The optional limit parameter limits the number of items that are presented in the response document. Only items are counted that are on the first level of the collection in the response document. Nested objects contained within the explicitly requested items shall not be counted. Minimum = 1. Maximum = 10000. Default = 10.", "explode": false, "in": "query", "name": "limit", "required": false, "schema": {"default": 10, "maximum": 10000, "minimum": 1, "type": "integer"}, "style": "form"}, "sortby": {"description": "The optional sortby parameter indicates the sort property and order on which the server shall present results in the response document using the convention `sortby=PROPERTY:X`, where `PROPERTY` is the sort property and `X` is the sort order (`A` is ascending, `D` is descending). Sorting by multiple properties is supported by providing a comma-separated list.", "explode": false, "in": "query", "name": "sortby", "required": false, "schema": {"type": "string"}, "style": "form"}, "startindex": {"description": "The optional startindex parameter indicates the index within the result set from which the server shall begin presenting results in the response document.  The first element has an index of 0 (default).", "explode": false, "in": "query", "name": "startindex", "required": false, "schema": {"default": 0, "minimum": 0, "type": "integer"}, "style": "form"}, "time": {"description": "The time parameter indicates an RFC3339 formatted datetime (single, interval, open).", "explode": false, "in": "query", "name": "time", "required": false, "schema": {"type": "string"}, "style": "form"}}}, "info": {"contact": {"email": "you@example.org", "name": "pygeoapi Development Team", "url": "https://pygeoapi.io"}, "description": "pygeoapi provides an API to geospatial data", "license": {"name": "CC-BY 4.0 license", "url": "https://creativecommons.org/licenses/by/4.0/"}, "termsOfService": "None", "title": "pygeoapi Demo instance - service title", "version": "3.0.2", "x-keywords": ["geospatial", "data", "api"]}}';
var serviceTextNoTitle = '{"components": {}, "info": {"x-keywords": []}}';

describe('plugin.ogcapi.LandingPageParser', function() {
  it('should construct properly', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    expect(p.errorMessage_).toBe('');
    expect(Object.keys(p.getLinks()).length).toBe(0);
  });

  it('should load valid JSON', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(jsonText));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();
    spyOn(p, 'loadService').andCallThrough();

    runs(function() {
      p.load('/something');
    });

    waitsFor(function() {
      return p.onLoad.calls.length;
    });

    runs(function() {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).not.toHaveBeenCalled();
      expect(p.loadService).toHaveBeenCalled();
    });
  });

  it('should load valid JSON with title', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(jsonTextWithTitleAndDescription));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();
    spyOn(p, 'loadService').andCallThrough();

    runs(function() {
      p.load('/something');
    });

    waitsFor(function() {
      return p.onLoad.calls.length;
    });

    runs(function() {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).not.toHaveBeenCalled();
      expect(p.loadService).not.toHaveBeenCalled();
      expect(p.title_).toMatch('pygeoapi Demo instance - landing page title');
    });
  });

  it('should error on invalid JSON', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('[wut'));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.load('/bad');
    });

    waitsFor(function() {
      return p.onLoad.calls.length;
    });

    runs(function() {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should error on request error', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(
        goog.Promise.reject(['something awful happened']));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.load('/woe');
    });

    waitsFor(function() {
      return p.onError.calls.length;
    });

    runs(function() {
      expect(p.onLoad).not.toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should ignore JSON that is not an array', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('{}'));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.load('/bad');
    });

    waitsFor(function() {
      return p.onLoad.calls.length;
    });

    runs(function() {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should handle onError with array', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    runs(function() {
      p.onError(['one', 'two']);
      expect(p.errorMessage_).toBe('one two');
    });
  });


  it('should handle links that are correct', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function() {
      p.handleLink_({'rel': 'conformance', 'type': 'application/json', 'href': 'https://demo.pygeoapi.io/stable/conformance'});
      expect(Object.keys(p.getLinks()).length).toBe(1);
    });
  });


  it('should handle links that are correct with optional title included', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function() {
      p.handleLink_({'rel': 'conformance', 'type': 'application/json', 'title': 'conformance', 'href': 'https://demo.pygeoapi.io/stable/conformance'});
      expect(Object.keys(p.getLinks()).length).toBe(1);
      expect(p.getLinks()['conformance']).toBe('https://demo.pygeoapi.io/stable/conformance');
    });
  });


  it('should handle openapi links that are correct', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function() {
      p.handleLink_({'rel': 'service', 'type': 'application/openapi+json;version=3.0', 'href': 'https://demo.pygeoapi.io/stable/api'});
      expect(Object.keys(p.getLinks()).length).toBe(1);
      expect(p.getLinks()['service']).toBe('https://demo.pygeoapi.io/stable/api');
    });
  });

  it('should handle data (collection) links that are correct', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function() {
      p.handleLink_({'rel': 'data', 'type': 'application/json', 'href': 'https://demo.pygeoapi.io/stable/collections'});
      expect(Object.keys(p.getLinks()).length).toBe(1);
      expect(p.getLinks()['data']).toBe('https://demo.pygeoapi.io/stable/collections');
    });
  });


  it('should ignore links that are not needed', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function() {
      p.handleLink_({'rel': 'self', 'type': 'application/json', 'href': 'https://demo.pygeoapi.io/stable'});
      expect(Object.keys(p.getLinks()).length).toBe(0);
    });
  });


  it('should handle not links that are incorrect', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    p.links_ = {};
    runs(function() {
      p.handleLink_({'type': 'application/json', 'title': 'conformance', 'href': 'https://demo.pygeoapi.io/stable/conformance'});
      expect(Object.keys(p.getLinks()).length).toBe(0);
    });
  });

  it('should not have a title by default', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    expect(p.hasTitle()).toBe(false);
    expect(p.getTitle()).toBe(null);
  });

  it('should have a title if set', function() {
    var p = new plugin.ogcapi.LandingPageParser();
    p.title_ = 'foo';
    expect(p.hasTitle()).toBe(true);
    expect(p.getTitle()).toBe('foo');
  });

  it('should load valid OpenAPI service JSON', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(serviceText));

    spyOn(p, 'onServiceLoad').andCallThrough();
    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadService('/x');
    });

    waitsFor(function() {
      return p.onServiceLoad.calls.length;
    });

    runs(function() {
      expect(p.onServiceLoad).toHaveBeenCalled();
      expect(p.onLoad).not.toHaveBeenCalled();
      expect(p.onError).not.toHaveBeenCalled();
      expect(p.title_).toMatch('pygeoapi Demo instance - service title');
    });
  });

  it('should load valid OpenAPI service JSON even without a title', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(serviceTextNoTitle));

    spyOn(p, 'onServiceLoad').andCallThrough();
    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadService('/y');
    });

    waitsFor(function() {
      return p.onServiceLoad.calls.length;
    });

    runs(function() {
      expect(p.onServiceLoad).toHaveBeenCalled();
      expect(p.onLoad).not.toHaveBeenCalled();
      expect(p.onError).not.toHaveBeenCalled();
    });
  });

  it('should error on invalid JSON for OpenAPI load', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('[wut'));

    spyOn(p, 'onServiceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadService('/bad');
    });

    waitsFor(function() {
      return p.onServiceLoad.calls.length;
    });

    runs(function() {
      expect(p.onServiceLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should error on OpenAPI service request error', function() {
    var p = new plugin.ogcapi.LandingPageParser();

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(
        goog.Promise.reject(['something awful happened']));

    spyOn(p, 'onServiceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadService('/woe');
    });

    waitsFor(function() {
      return p.onError.calls.length;
    });

    runs(function() {
      expect(p.onServiceLoad).not.toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });
});
