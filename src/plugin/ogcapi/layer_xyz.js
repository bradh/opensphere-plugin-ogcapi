goog.provide('plugin.ogcapi.LayerXYZ');

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
goog.require('os.layer.Tile');
goog.require('os.registerClass');
goog.require('os.source');
goog.require('os.source.Request');
goog.require('os.style');
goog.require('os.ui.Icons');
goog.require('os.ui.renamelayer');
goog.require('plugin.ogcapi.TileSource');


/**
 * Layer representing OGC API Tiles data.
 *
 * @extends {os.layer.Tile}
 * @param {olx.layer.TileOptions} options
 * @constructor
 */
plugin.ogcapi.LayerXYZ = function (options) {
    options = options || {};

    plugin.ogcapi.LayerXYZ.base(this, 'constructor', options);

    this.setHidden(false);
    var extent = ol.proj.transformExtent(options['extent'], options['extentProjection'], os.map.PROJECTION);
    var source = new plugin.ogcapi.TileSource(options);
    this.setSource(source);
    this.setExtent(extent);

    if (options['title']) {
        this.setTitle('OGC API Tiles - ' + options['title']);
    }
    this.setZIndex(1);
};
goog.inherits(plugin.ogcapi.LayerXYZ, os.layer.Tile);





