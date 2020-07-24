goog.provide('plugin.ogcapi.Layer');

goog.require('goog.string');
goog.require('ol.events');
goog.require('ol.geom.GeometryType');
goog.require('ol.render.Event');
goog.require('ol.style.Icon');
goog.require('ol.style.Style');
goog.require('os.events.LayerEvent');
goog.require('os.events.PropertyChangeEvent');
goog.require('os.implements');
goog.require('os.layer');
goog.require('os.layer.ILayer');
goog.require('os.layer.Vector');
goog.require('os.registerClass');
goog.require('os.source');
goog.require('os.source.Request');
goog.require('os.source.Vector');
goog.require('os.style');
goog.require('os.ui.Icons');
goog.require('os.ui.renamelayer');



/**
 * Layer representing OGC API data.
 *
 * @extends {os.layer.Vector}
 * @param {olx.layer.VectorOptions} options
 * @constructor
 */
plugin.ogcapi.Layer = function(options) {
  options = options || {};

  // Openlayers 4.6.0 moved vector image rendering to ol.layer.Vector with renderMode: 'image'
  if (!options['renderMode']) {
    options['renderMode'] = 'image';
  }

  plugin.ogcapi.Layer.base(this, 'constructor', options);

  /**
   * The array of hex colors. Used for external interface.
   * @type {Array<string>}
   * @private
   */
  this.gradient_ = os.color.THERMAL_HEATMAP_GRADIENT_HEX;

  /**
   * The last modified image.
   * @type {?ol.ImageCanvas}
   * @private
   */
  this.lastImage_ = null;

  // this is an image overlay, but it needs to appear in the layers window
  this.setHidden(false);
  // this.setLayerUI('heatmaplayerui');
  // this.setSynchronizerType(plugin.heatmap.SynchronizerType.HEATMAP);
  this.setOSType(os.layer.LayerType.IMAGE);
  this.setExplicitType(os.layer.ExplicitLayerType.IMAGE);
  this.setDoubleClickHandler(null);

  if (options['title']) {
    this.setTitle('OGC API - ' + options['title']);
  }

  // this.setStyle(this.styleFunc.bind(this));

  ol.events.listen(this, ol.render.EventType.PRECOMPOSE, this.onPreCompose_, this);
};
goog.inherits(plugin.ogcapi.Layer, os.layer.Vector);
os.implements(plugin.ogcapi.Layer, os.layer.ILayer.ID);


/**
 * @inheritDoc
 */
plugin.ogcapi.Layer.prototype.disposeInternal = function() {
  plugin.ogcapi.Layer.base(this, 'disposeInternal');
};


/**
 * @param {!ol.render.Event} event The render event.
 * @private
 * @suppress {accessControls}
 */
plugin.ogcapi.Layer.prototype.onPreCompose_ = function(event) {
  if (event && event.context) {
    var mapContainer = os.MapContainer.getInstance();
    var map = mapContainer.getMap();
    var layer = /** @type {ol.layer.Layer} */ (event.target);
    var layerRenderer = /** @type {ol.renderer.canvas.ImageLayer} */ (map.getRenderer().getLayerRenderer(layer));
    var image = layerRenderer ? /** @type {ol.ImageCanvas} */ (layerRenderer.image_) : undefined;

    if (!image || image === this.lastImage_) {
      // image isn't ready or has already been colored - nothing to do.
      return;
    }

    // save the last image that was updated so we don't try to modify it further
    this.lastImage_ = image;

    var canvas = image.getImage();
    var context = canvas.getContext('2d');
    var frameState = event.frameState;
    var extent = frameState ? frameState.extent : undefined;
    var pixelRatio = frameState ? frameState.pixelRatio : undefined;
    var resolution = frameState ? frameState.viewState.resolution : undefined;

    if (context && canvas && extent && pixelRatio != null && resolution != null) {
      // Apply the gradient pixel by pixel. This is slow, so should be done as infrequently as possible.
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      var view8 = imageData.data;
      var alpha;
      for (var i = 0, ii = view8.length; i < ii; i += 4) {    
        view8[i] = 0xFF;
        view8[i + 1] = 0xFF;
        view8[i + 2] = 0x00;
        view8[i + 3] = 0x7F;
      }
      context.putImageData(imageData, 0, 0);

      // scale the extent so the heatmap isn't clipped
      // extent = extent.slice();
      // ol.extent.scaleFromCenter(extent, plugin.heatmap.EXTENT_SCALE_FACTOR);

      // copy the image
      var c = /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
      c.width = canvas.width;
      c.height = canvas.height;
      var ctx = c.getContext('2d');
      ctx.drawImage(canvas, 0, 0);

      // cache the image and its data URL for the synchronizer
      this.set('url', c.toDataURL());
    }
  }
};

/**
 * @param {ol.Feature} feature
 * @return {HTMLCanvasElement} Data URL for a circle.
 * @protected
 */
plugin.ogcapi.Layer.prototype.createImage = function(feature) {
  // start with a tiny blank canvas in case we fail to draw the image (for some reason)
  var context = ol.dom.createCanvasContext2D(1000, 1000);
  //var type = /** @type {string} */ (feature.get(plugin.ogcapi.LayerField.GEOMETRY_TYPE));
  //var geom = /** @type {ol.geom.Geometry} */ (feature.get(plugin.ogcapi.LayerField.HEATMAP_GEOMETRY));

  // switch (type) {
  //   case ol.geom.GeometryType.POINT:
  //     // context = this.drawPoint(geom);
  //     break;
  //   case ol.geom.GeometryType.MULTI_POINT:
  //     // context = this.drawMultiPoint(geom);
  //     break;
  //   case ol.geom.GeometryType.LINE_STRING:
  //     // context = this.drawLineString(geom);
  //     break;
  //   case ol.geom.GeometryType.POLYGON:
  //     // context = this.drawPolygon(geom);
  //     break;
  //   case ol.geom.GeometryType.MULTI_POLYGON:
  //     // context = this.drawMultiPolygon(geom);
  //     break;
  //   default:
  //     break;
  // }

  return context.canvas;
};


/**
 * Gets the last rendered image canvas.
 *
 * @return {?ol.ImageCanvas} The image canvas, or null.
 */
plugin.ogcapi.Layer.prototype.getLastImage = function() {
  return this.lastImage_;
};


/**
 * @inheritDoc
 */
plugin.ogcapi.Layer.prototype.getExtent = function() {
  var extent = null;

  var canvas = this.getLastImage();
  if (canvas) {
    // get it from the canvas
    extent = canvas.getExtent().slice();
  } else {
    // use the full map extent if the canvas isn't ready
    extent = os.MapContainer.getInstance().getViewExtent().slice();
  }

  // scale the extent so the image is positioned properly
  ol.extent.scaleFromCenter(extent, 1);

  return extent;
};

/**
 * Get the gradient. This value is kept on the source.
 *
 * @return {Array<string>}
 */
plugin.ogcapi.Layer.prototype.getGradient = function() {
  return this.gradient_;
};

/**
 * Trigger a render on the source. Necessary because the heatmap source deliberately avoids rerendering the heatmap as
 * much as possible.
 *
 * @param {string=} opt_eventType Optional type for the style event.
 */
plugin.ogcapi.Layer.prototype.updateSource = function(opt_eventType) {
  os.style.notifyStyleChange(this, undefined, opt_eventType);
};


/**
 * @inheritDoc
 * @see {os.ui.action.IActionTarget}
 */
plugin.ogcapi.Layer.prototype.supportsAction = function(type, opt_actionArgs) {
  var source = this.getSource();

  switch (type) {
    case os.action.EventType.REMOVE_LAYER:
    case os.action.EventType.IDENTIFY:
      return true;
    case os.action.EventType.RENAME:
      return !!opt_actionArgs && goog.isArrayLike(opt_actionArgs) && opt_actionArgs.length === 1;
    case os.action.EventType.REFRESH:
      return source instanceof os.source.Request;
    default:
      break;
  }

  return false;
};


/**
 * @inheritDoc
 */
plugin.ogcapi.Layer.prototype.callAction = function(type) {
  switch (type) {
    default:
      break;
  }
};


/**
 * @param {ol.geom.Geometry} geom
 * @return {Array<number>}
 */
plugin.ogcapi.Layer.getPixelExtent = function(geom) {
  var extent = geom.getExtent();
  var e1 = os.MapContainer.getInstance().getMap().get2DPixelFromCoordinate([extent[0], extent[3]]);
  var e2 = os.MapContainer.getInstance().getMap().get2DPixelFromCoordinate([extent[2], extent[1]]);
  return [e1, e2];
};

