goog.require('goog.Promise');
goog.require('os.data.ConfigDescriptor');
goog.require('os.mock');
goog.require('plugin.ogcapi.DataProvider');
goog.require('plugin.ogcapi.ID');

var jsonText = '{"links": [{"rel": "self", "type": "application/json", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/stable"}, {"rel": "self", "type": "text/html", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/stable/?f=html", "hreflang": "en-US"}, {"rel": "service", "type": "application/openapi+json;version=3.0", "title": "The OpenAPI definition as JSON", "href": "https://demo.pygeoapi.io/stable/api"}, {"rel": "self", "type": "text/html", "title": "The OpenAPI definition as HTML", "href": "https://demo.pygeoapi.io/stable/api?f=html", "hreflang": "en-US"}, {"rel": "conformance", "type": "application/json", "title": "conformance", "href": "https://demo.pygeoapi.io/stable/conformance"}, {"rel": "data", "type": "application/json", "title": "collections", "href": "https://demo.pygeoapi.io/stable/collections"}]}';
var conformanceText = '{"conformsTo": ["http://www.opengis.net/spec/wfs-1/3.0/req/core", "http://www.opengis.net/spec/wfs-1/3.0/req/oas30", "http://www.opengis.net/spec/wfs-1/3.0/req/html", "http://www.opengis.net/spec/wfs-1/3.0/req/geojson"]}';
var collectionText = '{"collections": [{"links": [{"type": "text/csv", "rel": "canonical", "title": "data", "href": "https://github.com/mapserver/mapserver/blob/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "text/csv", "rel": "alternate", "title": "data", "href": "https://raw.githubusercontent.com/mapserver/mapserver/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON", "href": "https://demo.pygeoapi.io/master/collections/obs/items"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/obs?f=json"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "name": "obs", "title": "Observations", "description": "Observations", "extent": [-180, -90, 180, 90]}, {"links": [{"type": "text/html", "rel": "canonical", "title": "information", "href": "http://www.naturalearthdata.com/", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=json"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/lakes"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "name": "lakes", "title": "Large Lakes", "description": "lakes of the world, public domain", "extent": [-180, -90, 180, 90]}]}';
var collectionTextWithId = '{"collections": [{"links": [{"type": "text/csv", "rel": "canonical", "title": "data", "href": "https://github.com/mapserver/mapserver/blob/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "text/csv", "rel": "alternate", "title": "data", "href": "https://raw.githubusercontent.com/mapserver/mapserver/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON", "href": "https://demo.pygeoapi.io/master/collections/obs/items"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/obs?f=json"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "id": "obs", "title": "Observations", "description": "Observations", "extent": [-180, -90, 180, 90]}, {"links": [{"type": "text/html", "rel": "canonical", "title": "information", "href": "http://www.naturalearthdata.com/", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=json"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/lakes"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "id": "lakes", "title": "Large Lakes", "description": "lakes of the world, public domain", "extent": [-180, -90, 180, 90]}]}';
var collectionTextMissingId = '{"collections": [{"links": [{"type": "text/csv", "rel": "canonical", "title": "data", "href": "https://github.com/mapserver/mapserver/blob/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "text/csv", "rel": "alternate", "title": "data", "href": "https://raw.githubusercontent.com/mapserver/mapserver/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON", "href": "https://demo.pygeoapi.io/master/collections/obs/items"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/obs?f=json"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "title": "Observations", "description": "Observations", "extent": [-180, -90, 180, 90]}, {"links": [{"type": "text/html", "rel": "canonical", "title": "information", "href": "http://www.naturalearthdata.com/", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=json"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/lakes"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "id": "lakes", "title": "Large Lakes", "description": "lakes of the world, public domain", "extent": [-180, -90, 180, 90]}]}';
var collectionTextMissingURL = '{"collections": [{"links": [{"type": "text/csv", "rel": "canonical", "title": "data", "href": "https://github.com/mapserver/mapserver/blob/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "text/csv", "rel": "alternate", "title": "data", "href": "https://raw.githubusercontent.com/mapserver/mapserver/branch-7-0/msautotest/wxs/data/obs.csv", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/obs?f=json"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/obs?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "id": "obs", "title": "Observations", "description": "Observations", "extent": [-180, -90, 180, 90]}, {"links": [{"type": "text/html", "rel": "canonical", "title": "information", "href": "http://www.naturalearthdata.com/", "hreflang": "en-US"}, {"type": "application/geo+json", "rel": "item", "title": "Features as GeoJSON", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=json"}, {"type": "text/html", "rel": "item", "title": "Features as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes/items?f=html"}, {"type": "application/json", "rel": "self", "title": "This document as JSON", "href": "https://demo.pygeoapi.io/master/collections/lakes"}, {"type": "text/html", "rel": "alternate", "title": "This document as HTML", "href": "https://demo.pygeoapi.io/master/collections/lakes?f=html"}], "crs": ["http://www.opengis.net/def/crs/OGC/1.3/CRS84"], "id": "lakes", "title": "Large Lakes", "description": "lakes of the world, public domain", "extent": [-180, -90, 180, 90]}]}';

describe('plugin.ogcapi.DataProvider', function() {
  it('should configure properly', function() {
    var p = new plugin.ogcapi.DataProvider();
    var conf = {
      type: plugin.ogcapi.ID,
      label: 'Test Server',
      url: 'http://localhost/doesnotexist.json'
    };

    p.configure(conf);

    expect(p.getLabel()).toBe(conf.label);
    expect(p.getUrl()).toBe(conf.url);
  });

  it('should load valid JSON', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(jsonText));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();
    spyOn(p, 'loadCollection');
    spyOn(p, 'loadConformance');

    runs(function() {
      p.load();
    });

    waitsFor(function() {
      return p.onLoad.calls.length;
    });

    runs(function() {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).not.toHaveBeenCalled();
      expect(p.loadCollection).toHaveBeenCalledWith('https://demo.pygeoapi.io/stable/collections');
    });
  });

  it('should error on invalid JSON', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('[wut'));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();
    spyOn(p, 'loadCollection');
    spyOn(p, 'loadConformance');

    runs(function() {
      p.load();
    });

    waitsFor(function() {
      return p.onLoad.calls.length;
    });

    runs(function() {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
      expect(p.loadCollection).not.toHaveBeenCalled();
      expect(p.loadConformance).not.toHaveBeenCalled();
    });
  });

  it('should error on request error', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(
        goog.Promise.reject(['something awful happened']));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();
    spyOn(p, 'loadCollection').andCallThrough();

    runs(function() {
      p.load();
    });

    waitsFor(function() {
      return p.onError.calls.length;
    });

    runs(function() {
      expect(p.onLoad).not.toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
      expect(p.loadCollection).not.toHaveBeenCalled();
    });
  });

  it('should ignore JSON that is not an array', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');
    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('{}'));

    spyOn(p, 'onLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();
    spyOn(p, 'loadCollection').andCallThrough();

    runs(function() {
      p.load();
    });

    waitsFor(function() {
      return p.onLoad.calls.length;
    });

    runs(function() {
      expect(p.onLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
      expect(p.loadCollection).not.toHaveBeenCalled();
    });
  });


  it('should parse OGC API Conformance JSON', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(conformanceText));
    spyOn(p, 'onConformanceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadConformance('x');
    });

    waitsFor(function() {
      return p.onConformanceLoad.calls.length;
    });

    runs(function() {
      expect(p.onConformanceLoad).toHaveBeenCalled();
      expect(p.onError).not.toHaveBeenCalled();
    });
  });

  it('should not parse OGC API Conformance JSON that is broken', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('[yt}'));
    spyOn(p, 'onConformanceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadConformance('x');
    });

    waitsFor(function() {
      return p.onConformanceLoad.calls.length;
    });

    runs(function() {
      expect(p.onConformanceLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });


  it('should error on OGC API Conformance JSON that is not an array', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('{"conformsTo": "blah"}'));
    spyOn(p, 'onConformanceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadConformance('x');
    });

    waitsFor(function() {
      return p.onConformanceLoad.calls.length;
    });

    runs(function() {
      expect(p.onConformanceLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should error on OGC API Conformance JSON that missing statements', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('{"conformsTo": []}'));
    spyOn(p, 'onConformanceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadConformance('x');
    });

    waitsFor(function() {
      return p.onConformanceLoad.calls.length;
    });

    runs(function() {
      expect(p.onConformanceLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should error on OGC API Conformance JSON that missing GeoJSON', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('{"conformsTo": ["http://www.opengis.net/spec/wfs-1/3.0/req/core", "http://www.opengis.net/spec/wfs-1/3.0/req/oas30"]}'));
    spyOn(p, 'onConformanceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadConformance('x');
    });

    waitsFor(function() {
      return p.onConformanceLoad.calls.length;
    });

    runs(function() {
      expect(p.onConformanceLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });


  it('should error on OGC API Conformance JSON that missing WFS3 core', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('{"conformsTo": ["http://www.opengis.net/spec/wfs-1/3.0/req/oas30", "http://www.opengis.net/spec/wfs-1/3.0/req/html", "http://www.opengis.net/spec/wfs-1/3.0/req/geojson"]}'));
    spyOn(p, 'onConformanceLoad').andCallThrough();
    spyOn(p, 'onError').andCallThrough();

    runs(function() {
      p.loadConformance('x');
    });

    waitsFor(function() {
      return p.onConformanceLoad.calls.length;
    });

    runs(function() {
      expect(p.onConformanceLoad).toHaveBeenCalled();
      expect(p.onError).toHaveBeenCalled();
    });
  });

  it('should parse OGC API Collection JSON', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(collectionText));
    spyOn(p, 'onCollectionLoad').andCallThrough();
    spyOn(p, 'onCollectionError').andCallThrough();

    runs(function() {
      p.loadCollection('x');
    });

    waitsFor(function() {
      return p.onCollectionLoad.calls.length;
    });

    runs(function() {
      expect(p.onCollectionLoad).toHaveBeenCalled();
      expect(p.onCollectionError).not.toHaveBeenCalled();
      expect(p.getChildren().length).toBe(2);
    });
  });

  it('should parse OGC API Collection JSON with new style IDs instead of names', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(collectionTextWithId));
    spyOn(p, 'onCollectionLoad').andCallThrough();
    spyOn(p, 'onCollectionError').andCallThrough();

    runs(function() {
      p.loadCollection('x');
    });

    waitsFor(function() {
      return p.onCollectionLoad.calls.length;
    });

    runs(function() {
      expect(p.onCollectionLoad).toHaveBeenCalled();
      expect(p.onCollectionError).not.toHaveBeenCalled();
      expect(p.getChildren().length).toBe(2);
    });
  });

  it('should skip OGC API Collection nodes with no IDs', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(collectionTextMissingId));
    spyOn(p, 'onCollectionLoad').andCallThrough();
    spyOn(p, 'onCollectionError').andCallThrough();

    runs(function() {
      p.loadCollection('x');
    });

    waitsFor(function() {
      return p.onCollectionLoad.calls.length;
    });

    runs(function() {
      expect(p.onCollectionLoad).toHaveBeenCalled();
      expect(p.onCollectionError).not.toHaveBeenCalled();
      expect(p.getChildren().length).toBe(1);
    });
  });

  it('should skip OGC API Collection nodes with no URLs', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(collectionTextMissingURL));
    spyOn(p, 'onCollectionLoad').andCallThrough();
    spyOn(p, 'onCollectionError').andCallThrough();

    runs(function() {
      p.loadCollection('x');
    });

    waitsFor(function() {
      return p.onCollectionLoad.calls.length;
    });

    runs(function() {
      expect(p.onCollectionLoad).toHaveBeenCalled();
      expect(p.onCollectionError).not.toHaveBeenCalled();
      expect(p.getChildren().length).toBe(1);
    });
  });

  it('should parse OGC API Collection JSON with extended URL', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(collectionText));
    spyOn(p, 'onCollectionLoad').andCallThrough();
    spyOn(p, 'onCollectionError').andCallThrough();

    runs(function() {
      p.loadCollection('x?f=json');
    });

    waitsFor(function() {
      return p.onCollectionLoad.calls.length;
    });

    runs(function() {
      expect(p.onCollectionLoad).toHaveBeenCalled();
      expect(p.onCollectionError).not.toHaveBeenCalled();
    });
  });

  it('should parse OGC API Collection JSON with existing ID', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    var descriptor = /** @type {os.data.ConfigDescriptor} */ new os.data.ConfigDescriptor();
    var config = {
      'type': 'geojson',
      'id': p.getId() + os.ui.data.BaseProvider.ID_DELIMITER + 'obs',
      'title': 'Observations',
      'description': '',
      'extent': [-180, -90, 180, 90],
      'extentProjection': os.proj.EPSG4326,
      'projection': os.proj.EPSG3857,
      'provider': 'ogcapi',
      'url': 'https://demo.pygeoapi.io/stable/collections/obs/items',
      'delayUpdateActive': true
    };
    descriptor.setBaseConfig(config);
    os.dataManager.addDescriptor(descriptor);

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve(collectionText));
    spyOn(p, 'onCollectionLoad').andCallThrough();
    spyOn(p, 'onCollectionError').andCallThrough();

    runs(function() {
      p.loadCollection('x?f=json');
    });

    waitsFor(function() {
      return p.onCollectionLoad.calls.length;
    });

    runs(function() {
      expect(p.onCollectionLoad).toHaveBeenCalled();
      expect(p.onCollectionError).not.toHaveBeenCalled();
    });
  });


  it('should not parse invalid JSON', function() {
    var p = new plugin.ogcapi.DataProvider();
    p.setUrl('/something');

    spyOn(os.net.Request.prototype, 'getPromise').andReturn(goog.Promise.resolve('[*76'));
    spyOn(p, 'onCollectionLoad').andCallThrough();
    spyOn(p, 'onCollectionError').andCallThrough();

    runs(function() {
      p.loadCollection('x');
    });

    waitsFor(function() {
      return p.onCollectionLoad.calls.length;
    });

    runs(function() {
      expect(p.onCollectionLoad).toHaveBeenCalled();
      expect(p.onCollectionError).toHaveBeenCalled();
    });
  });

  it('should handle onCollectionError with array', function() {
    var p = new plugin.ogcapi.DataProvider();

    runs(function() {
      p.onCollectionError(['one', 'two']);
      expect(p.getErrorMessage()).toBe('one two');
    });
  });
});
