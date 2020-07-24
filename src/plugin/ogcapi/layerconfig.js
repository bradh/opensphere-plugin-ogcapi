goog.provide('plugin.ogcapi.LayerConfig');

goog.require('goog.log');
goog.require('goog.log.Logger');
goog.require('ol.source.Vector');
goog.require('os.layer.config.AbstractLayerConfig');
goog.require('plugin.ogcapi.Layer');



/**
 * Config for a layer containing OGC API data.
 *
 * @extends {os.layer.config.AbstractLayerConfig}
 * @constructor
 * @template T
 */
plugin.ogcapi.LayerConfig = function() {
  plugin.ogcapi.LayerConfig.base(this, 'constructor');
  this.log = plugin.ogcapi.LayerConfig.LOGGER_;

  /**
   * @type {boolean}
   * @protected
   */
  this.animate = false;
};
goog.inherits(plugin.ogcapi.LayerConfig, os.layer.config.AbstractLayerConfig);


/**
 * Id for this layer config
 * @type {string}
 * @const
 */
plugin.ogcapi.LayerConfig.ID = 'ogcapi';


/**
 * Logger
 * @type {goog.log.Logger}
 * @private
 * @const
 */
plugin.ogcapi.LayerConfig.LOGGER_ = goog.log.getLogger('plugin.ogcapi.LayerConfig');


/**
 * @inheritDoc
 */
plugin.ogcapi.LayerConfig.prototype.createLayer = function(options) {
  this.initializeConfig(options);

  var source = this.getSource(options);
  var layer = this.getLayer(source, options);
  layer.setId(/** @type {string} */ (options['id']));

  if (options['explicitType'] != null) {
    layer.setExplicitType(/** @type {string} */ (options['explicitType']));
  }

  return layer;
};


/**
 * @param {ol.source.Vector} source The layer source.
 * @param {Object<string, *>} options
 * @return {plugin.ogcapi.Layer}
 * @protected
 */
plugin.ogcapi.LayerConfig.prototype.getLayer = function(source, options) {
  return new plugin.ogcapi.Layer({
    'source': source,
    'title': options['title']
  });
};


/**
 * @param {Object} options Layer configuration options.
 * @return {ol.source.Vector}
 * @protected
 *
 * @suppress {checkTypes}
 */
plugin.ogcapi.LayerConfig.prototype.getSource = function(options) {
  options = options || {};

  // var sourceId = /** @type {string|undefined} */ (options['sourceId']);
  // TODO: maybe something like this for the URL and style options?
  // options.features = plugin.ogcapi.getSourceFeatures(sourceId);

  return new ol.source.Vector(options);
};
