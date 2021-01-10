goog.provide('plugin.ogcapi.DataProvider');

goog.require('os.data.ConfigDescriptor');
goog.require('os.data.IDataProvider');
goog.require('os.net.Request');
goog.require('os.ui.data.DescriptorNode');
goog.require('os.ui.server.AbstractLoadingServer');

/**
 * The OGC API data provider
 *
 * @implements {os.data.IDataProvider}
 * @extends {os.ui.server.AbstractLoadingServer}
 * @constructor
 */
plugin.ogcapi.DataProvider = function () {
    plugin.ogcapi.DataProvider.base(this, 'constructor');
    this.providerType = plugin.ogcapi.ID;
};
goog.inherits(plugin.ogcapi.DataProvider, os.ui.server.AbstractLoadingServer);

/**
 * @inheritDoc
 */
plugin.ogcapi.DataProvider.prototype.load = function (opt_ping) {
    plugin.ogcapi.DataProvider.base(this, 'load', opt_ping);
    this.setChildren(null);
    new os.net.Request(this.getUrl()).getPromise().
        then(this.onLoad, this.onError, this).
        thenCatch(this.onError, this);
};

/**
 * @param {string} response
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onLoad = function (response) {
    try {
        var json = JSON.parse(response);
        if (json.hasOwnProperty('links')) {
            var links = json['links'];
        }
    } catch (e) {
        // console.log('Malformed JSON');
        this.onError('Malformed JSON');
        return;
    }

    if (!goog.isArray(links)) {
        this.onError('Expected an array of links but got something else');
        return;
    }

    var gotDataLink = false;
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if ((link.rel === 'conformance') && (link.type === 'application/json')) {
            this.loadConformance(link.href);
        }
        if ((link.rel === 'data') && (link.type === 'application/json')) {
            this.loadCollection(link.href);
            gotDataLink = true;
        }
        if ((link.rel === 'tiles') && (link.type === 'application/json')) {
            this.loadTilesets(link.href + "?f=json")
        }
    }
    if (!gotDataLink) {
        // Maybe we are at some sub-level, hope for collections
        if (json.hasOwnProperty('collections')) {
            var collections = json['collections'];
            this.processCollections_(collections);
        }
    }
};

/**
 * @param {string} conformanceurl
 */
plugin.ogcapi.DataProvider.prototype.loadConformance = function (conformanceurl) {
    new os.net.Request(conformanceurl).getPromise().
        then(this.onConformanceLoad, this.onConformanceError, this).
        thenCatch(this.onConformanceError, this);
};

/**
 * @param {string} response
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onConformanceLoad = function (response) {
    try {
        var json = JSON.parse(response);
    } catch (e) {
        this.onError('Malformed Conformance JSON');
        return;
    }

    var conformance = json['conformsTo'];
    if (!goog.isArray(conformance)) {
        this.onError('Expected an array of conformance statements but got something else');
        return;
    }
    var hasFeaturesSupport = conformance.includes('http://www.opengis.net/spec/wfs-1/3.0/req/core') || conformance.includes('http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core');
    var hasJSONsupport = conformance.includes('http://www.opengis.net/spec/wfs-1/3.0/req/geojson') || conformance.includes('http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/geojson');
    var hasMapsSupport = conformance.includes('http://www.opengis.net/spec/ogcapi-maps-1/1.0/req/core') && conformance.includes('http://www.opengis.net/spec/ogcapi-maps-1/1.0/req/styles');
    var hasTilesSupport = conformance.includes('http://www.opengis.net/spec/ogcapi-tiles-1/1.0/conf/tileset') && conformance.includes('http://www.opengis.net/spec/ogcapi-common-2/1.0/conf/collections');
    if ((!hasFeaturesSupport || !hasJSONsupport) && (!hasMapsSupport) && (!hasTilesSupport)) {
        this.onError('Server does not claim to support OGC API Tiles / Maps / Features or WFS3');
    }
};

/**
 * @param {string} collectionurl
 */
plugin.ogcapi.DataProvider.prototype.loadCollection = function (collectionurl) {
    var request = new os.net.Request(new URL(collectionurl, this.getUrl()).toString());
    request.getPromise().
        then(this.onCollectionLoad, this.onCollectionError, this).
        thenCatch(this.onCollectionError, this);
};

/**
 * @param {string} tilesetUrl
 */
plugin.ogcapi.DataProvider.prototype.loadTilesets = function (tilesetUrl) {
    var request = new os.net.Request(new URL(tilesetUrl, this.getUrl()).toString());
    request.getPromise().
        then(this.onTilesetLoad, this.onTilesetError, this).
        thenCatch(this.onTilesetError, this);
};


/**
 * @param {string} response
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onCollectionLoad = function (response) {
  // console.log('onCollectionLoad');
  try {
    var json = JSON.parse(response);
  } catch (e) {
    this.onCollectionError('Malformed CollectionsJSON');
    return;
  }

  var collections = json['collections'];
  this.processCollections_(collections);
};

/**
 * @param {Array<Object>} collections 
 * @private
 */
plugin.ogcapi.DataProvider.prototype.processCollections_ = function(collections) {
  if (!collections) {
    return;
  }
  var children = /** @type {Array<!os.structs.ITreeNode>} */
    (collections.map(this.toChildNode, this).filter(os.fn.filterFalsey));
  this.setChildren(children);
  this.finish();
};

/**
 * @param {Object<string, *>} collection The collection JSON
 * @return {?os.ui.data.DescriptorNode} The child node for the provider
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.toChildNode = function (collection) {
    // TODO: sanity checks

    let collectionid = collection['id'];
    if (!collectionid) {
        collectionid = collection['name'];
    }
    if (!collectionid) {
        return null;
    }
    var id = this.getId() + os.ui.data.BaseProvider.ID_DELIMITER + collectionid;
    var descriptor = /** @type {os.data.ConfigDescriptor} */ (os.dataManager.getDescriptor(id));
    if (!descriptor) {
        descriptor = new os.data.ConfigDescriptor();
    }

    var url = null;
    var coordinateReferenceSystems = collection['crs'];
    // TODO: we need to parse out default styles too.
    var styles = collection['styles'];
    var styleid = null;
    if (styles && styles.length > 0 && styles[0].id) {
        styleid = styles[0].id;
    }
    var links = collection['links'];
    var extent = /** @type {Array<number>} */ (collection['extent']['spatial']['bbox']);
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if ((link['rel'] === 'maps') || (link['rel'] === 'map')) {
            var hrefBase = new URL(link['href'], this.getUrl());
            // var collectionStyles = collection['styles'];
            // console.log(collectionStyles);
            var crs = coordinateReferenceSystems[0];
            if (coordinateReferenceSystems.includes('http://www.opengis.net/def/crs/OGC/1.3/CRS84')) {
                crs = 'http://www.opengis.net/def/crs/OGC/1.3/CRS84';
            }
            if (extent.length == 1) {
                // Why?
                extent = extent[0];
            }
            url = hrefBase.origin + hrefBase.pathname + '/default?crs=' + crs + '&bbox=' + extent[0] + ',' + extent[1] + ',' + extent[2] + ',' + extent[3] + '&width=4000&height=3000&f=png';
            var config = {
                'type': 'ogcapi',
                'id': id,
                'title': collection['title'],
                'description': collection['description'],
                'extent': extent,
                'extentProjection': os.proj.EPSG4326,
                'projection': os.proj.EPSG3857,
                'provider': this.getLabel(),
                'url': url,
                'delayUpdateActive': true
            };
            descriptor.setBaseConfig(config);
        }
        if ((link['type'] === 'application/json') && (link.hasOwnProperty('href') && (link['rel'] === 'tiles'))) {
            var request = new os.net.Request(new URL(link['href'], this.getUrl()).toString());
            request.getPromise().
                then(this.onTileCollectionLoad.bind(this, id, collection['title'], extent, styleid), this.onError, this).
                thenCatch(this.onError, this);
        } else if ((link['type'] === 'application/geo+json') && (link.hasOwnProperty('href'))) {
            var href = link['href'];
            // TODO: we should do proper paging, but more than 10000 is going to be terrible anyway.
            if (href.includes('?')) {
                href += '&limit=10000';
            } else {
                href += '?limit=10000';
            }
            url = new URL(href, this.getUrl());
            var config = {
                'type': 'geojson',
                'id': id,
                'title': collection['title'],
                'description': collection['description'],
                'extent': extent,
                'extentProjection': os.proj.EPSG4326,
                'projection': os.proj.EPSG3857,
                'provider': this.getLabel(),
                'url': url,
                'delayUpdateActive': true
            };
            descriptor.setBaseConfig(config);
        }
    }
    if (!url) {
        return null;
    }

    os.dataManager.addDescriptor(descriptor);

    // mark the descriptor as ready if the user had it enabled previously
    descriptor.updateActiveFromTemp();

    var node = new os.ui.data.DescriptorNode();
    node.setDescriptor(descriptor);
    return node;
};

/**
 * @param {string} response
 * @param {Array<number>} extent
 * @param {string|null} styleid
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onTileCollectionLoad = function (id, title, extent, styleid, response) {
    try {
        var json = JSON.parse(response);
    } catch (e) {
        this.onError('Malformed Tile Collection JSON');
        return;
    }
    var tileMatrixSetLinks = json['tileMatrixSetLinks'];
    // TODO: handle multiple
    var tileMatrixSetId = null;
    var tileMatrixSetLimits = null;
    if (tileMatrixSetLinks && tileMatrixSetLinks[0] && tileMatrixSetLinks[0]['tileMatrixSet']) {
        tileMatrixSetId = tileMatrixSetLinks[0]['tileMatrixSet'];
        if (tileMatrixSetLinks[0]['tileMatrixSetLimits']) {
            tileMatrixSetLimits = tileMatrixSetLinks[0]['tileMatrixSetLimits'];
        }
    }
    var links = json["links"];
    if (!links) {
        return;
    }
    for (var j = 0; j < links.length; ++j) {
        var link = links[j];
        if ((link['rel'] === 'item') && (link['type'] === 'image/png') && link['href']) {
            if (link['templated']) {
                var projection = null;
                // TODO: this is probably geoserver specific
                if (tileMatrixSetId === 'EPSG:4326') {
                    projection = os.proj.EPSG4326;
                } else if (tileMatrixSetId === 'EPSG:900913') {
                    projection = os.proj.EPSG3857;
                }
                var href = link['href'];
                if (styleid && href.includes('{styleId}')) {
                    href = href.replace('{styleId}', styleid);
                }
                if (tileMatrixSetId && href.includes('{tileMatrixSetId}')) {
                    href = href.replace('{tileMatrixSetId}', tileMatrixSetId);
                }
                var config = {
                    'type': plugin.ogcapi.XYZLayerConfig.ID,
                    'id': id,
                    'title': title,
                    'extent': extent,
                    'extentProjection': os.proj.EPSG4326,
                    'projection': projection,
                    'url': href,
                    'provider': this.getLabel(),
                    'tileMatrixLimits': tileMatrixSetLimits,
                    'delayUpdateActive': true
                };
                var descriptor = /** @type {os.data.ConfigDescriptor} */ (os.dataManager.getDescriptor(id));
                if (!descriptor) {
                    descriptor = new os.data.ConfigDescriptor();
                }
                descriptor.setBaseConfig(config);
                os.dataManager.addDescriptor(descriptor);

                // mark the descriptor as ready if the user had it enabled previously
                descriptor.updateActiveFromTemp();

                var node = new os.ui.data.DescriptorNode();
                node.setDescriptor(descriptor);
                this.addChild(node);
            }
        }
    }
};

/**
 * @param {string} response
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onTilesetLoad = function (response) {
    try {
        var json = JSON.parse(response);
    } catch (e) {
        this.onError('Malformed Tileset JSON');
        return;
    }
    var tilesets = json["tileMatrixSetLinks"];
    var links = json["links"];
    if (!tilesets || !links) {
        return;
    }
    // var children = /** @type {Array<!os.structs.ITreeNode>} */ [];
    var tileMatrixSetId = null;
    for (var i = 0; i < tilesets.length; ++i) {
        var tileset = tilesets[i];
        var tms = tileset['tileMatrixSet'];
        var uri = tileset['tileMatrixSetURI'];
        if (uri === 'http://schemas.opengis.net/tms/1.0/json/examples/WebMercatorQuad.json') {
            tileMatrixSetId = tms;
            break;
        }
    }
    if (!tileMatrixSetId) {
        return;
    }
    for (var j = 0; j < links.length; ++j) {
        var link = links[j];
        if ((link['rel'] === 'describedby') && (link['type'] === 'application/json') && link['href']) {
            if (link['templated']) {
                var templateHref = link['href'];
                var href = templateHref.replace('{tileMatrixSetId}', tileMatrixSetId);
                var request = new os.net.Request(new URL(href, this.getUrl()).toString());
                request.getPromise().
                    then(this.onTileJSONLoad, this.onError, this).
                    thenCatch(this.onError, this);
            }
        }
    }
}

/**
 * @param {string} response
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onTileJSONLoad = function (response) {
    try {
        var json = JSON.parse(response);
    } catch (e) {
        this.onError('Malformed TileJSON');
        return;
    }
    console.log(json);
}

/**
 * @param {*} e
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onError = function (e) {
    var msg = goog.isArray(e) ? e.join(' ') : e.toString();
    this.setErrorMessage(msg);
};

/**
 * @param {*} e
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onConformanceError = function (e) {
    var msg = goog.isArray(e) ? e.join(' ') : e.toString();
    this.setErrorMessage("OGC API - problem with Conformance statement: " + msg);
};

/**
 * @param {*} e
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onCollectionError = function (e) {
    // console.log('onCollectionError');
    var msg = goog.isArray(e) ? e.join(' ') : e.toString();
    this.setErrorMessage(msg);
};

/**
 * @param {*} e
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onTilesetError = function (e) {
    var msg = goog.isArray(e) ? e.join(' ') : e.toString();
    this.setErrorMessage(msg);
};