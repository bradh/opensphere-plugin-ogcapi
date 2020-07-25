goog.provide('plugin.ogcapi.Layer');

goog.require('goog.string');
goog.require('ol.events');
goog.require('ol.extent');
goog.require('ol.geom.GeometryType');
goog.require('ol.render.Event');
goog.require('ol.style.Icon');
goog.require('ol.style.Style');
goog.require('os.events.LayerEvent');
goog.require('os.events.PropertyChangeEvent');
goog.require('os.implements');
goog.require('os.layer');
goog.require('os.layer.ILayer');
goog.require('os.layer.Image');
goog.require('os.registerClass');
goog.require('os.source');
goog.require('os.source.Request');
goog.require('os.style');
goog.require('os.ui.Icons');
goog.require('os.ui.renamelayer');



/**
 * Layer representing OGC API Map data.
 *
 * @extends {os.layer.Image}
 * @param {olx.layer.ImageOptions} options
 * @constructor
 */
plugin.ogcapi.Layer = function(options) {
  options = options || {};

  plugin.ogcapi.Layer.base(this, 'constructor', options);

  this.setHidden(false);
  this.setOSType(os.layer.LayerType.IMAGE);
  this.setExplicitType(os.layer.ExplicitLayerType.IMAGE);

  var url = options['url'];
  var extent = ol.proj.transformExtent(options['extent'], options['extentProjection'], os.map.PROJECTION);
  var source = new os.source.ImageStatic({
    crossOrigin: os.net.getCrossOrigin(url),
    url: url,
    imageExtent: extent,
    projection: os.map.PROJECTION
  }, 0);
  this.setSource(source);
  this.setExtent(extent);

  if (options['title']) {
    this.setTitle('OGC API Map - ' + options['title']);
  }
};
goog.inherits(plugin.ogcapi.Layer, os.layer.Image);
os.implements(plugin.ogcapi.Layer, os.layer.ILayer.ID);





