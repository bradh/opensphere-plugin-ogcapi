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
plugin.ogcapi.DataProvider = function() {
  plugin.ogcapi.DataProvider.base(this, 'constructor');
  this.providerType = plugin.ogcapi.ID;
};
goog.inherits(plugin.ogcapi.DataProvider, os.ui.server.AbstractLoadingServer);


/**
 * @inheritDoc
 */
plugin.ogcapi.DataProvider.prototype.load = function(opt_ping) {
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
plugin.ogcapi.DataProvider.prototype.onLoad = function(response) {
  try {
    var json = JSON.parse(response);
    if (json.hasOwnProperty('links')) {
      var links = json.links;
    }
  } catch (e) {
    // console.log('Malformed JSON');
    this.onError('Malformed JSON');
    return;
  }

  if (!goog.isArray(links)) {
    // console.log('Expected an array of links but got something else');
    this.onError('Expected an array of links but got something else');
    return;
  }

  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if ((link.rel === 'conformance') && (link.type === 'application/json')) {
      this.loadConformance(link.href);
    }
    if ((link.rel === 'data') && (link.type === 'application/json')) {
      this.loadCollection(link.href);
    }
  }
};

/**
 * @param {string} conformanceurl
 */
plugin.ogcapi.DataProvider.prototype.loadConformance = function(conformanceurl) {
  new os.net.Request(conformanceurl).getPromise().
      then(this.onConformanceLoad, this.onError, this).
      thenCatch(this.onError, this);
};

/**
 * @param {string} response
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onConformanceLoad = function(response) {
  try {
    var json = JSON.parse(response);
  } catch (e) {
    this.onError('Malformed ConformanceJSON');
    return;
  }

  var conformance = json['conformsTo'];
  if (!goog.isArray(conformance)) {
    this.onError('Expected an array of conformance statements but got something else');
    return;
  }
  var isWFS3 = conformance.includes('http://www.opengis.net/spec/wfs-1/3.0/req/core');
  var hasJSONsupport = conformance.includes('http://www.opengis.net/spec/wfs-1/3.0/req/geojson');
  if (!isWFS3 || !hasJSONsupport) {
    this.onError('Server does not claim to support WFS3 GeoJSON');
  }
};

/**
 * @param {string} collectionurl
 */
plugin.ogcapi.DataProvider.prototype.loadCollection = function(collectionurl) {
  // console.log('collection load: ' + collectionurl);
  new os.net.Request(collectionurl).getPromise().
      then(this.onCollectionLoad, this.onCollectionError, this).
      thenCatch(this.onCollectionError, this);
};


/**
 * @param {string} response
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onCollectionLoad = function(response) {
  // console.log('onCollectionLoad');
  try {
    var json = JSON.parse(response);
  } catch (e) {
    this.onCollectionError('Malformed CollectionsJSON');
    return;
  }

  var collections = json['collections'];

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
plugin.ogcapi.DataProvider.prototype.toChildNode = function(collection) {
  // TODO: sanity checks

  let collectionid = collection['id'];
  if (!collectionid) {
    collectionid = collection['name'];
  }
  if (!collectionid) {
    return null;
  }
  var id = this.getId() + os.ui.data.BaseProvider.ID_DELIMITER + collectionid;

  var url = null;
  var links = collection['links'];
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if ((link['type'] === 'application/geo+json') && (link.hasOwnProperty('href'))) {
      url = link['href'];
      break;
    }
  }
  if (!url) {
    return null;
  }

  // TODO: we should do proper paging, but more than 10000 is going to be terrible anyway.
  if (url.includes('?')) {
    url += '&limit=10000';
  } else {
    url += '?limit=10000';
  }

  var config = {
    'type': 'geojson',
    'id': id,
    'title': collection['title'],
    'description': collection['description'],
    'extent': collection['extent'],
    'extentProjection': os.proj.EPSG4326,
    'projection': os.proj.EPSG3857,
    'provider': this.getLabel(),
    'url': url,
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
  return node;
};

/**
 * @param {*} e
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onError = function(e) {
  var msg = goog.isArray(e) ? e.join(' ') : e.toString();
  this.setErrorMessage(msg);
};

/**
 * @param {*} e
 * @protected
 */
plugin.ogcapi.DataProvider.prototype.onCollectionError = function(e) {
  // console.log('onCollectionError');
  var msg = goog.isArray(e) ? e.join(' ') : e.toString();
  this.setErrorMessage(msg);
};
