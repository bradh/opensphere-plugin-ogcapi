goog.provide('plugin.ogcapi.TileSource');

goog.require('ol.source.XYZ');



/**                                                                                                                                                                                                                                                                                              
 * Layer source for tile data with URLs in a set XYZ format.                                                                                                                                                                                                                                     
 *
 * @param {olx.source.XYZOptions} options XYZ options.
 * @extends {ol.source.XYZ}
 * @constructor
 */
plugin.ogcapi.TileSource = function (options) {
    options.projection = options.projection !== undefined ? options.projection : 'EPSG:4326';

    /**
     * @type {number}
     * @protected
     */
    this.zoomOffset = options['zoomOffset'] || 0;

    plugin.ogcapi.TileSource.base(this, 'constructor', options);
};
goog.inherits(plugin.ogcapi.TileSource, ol.source.XYZ);


/**
 * @inheritDoc
 */
plugin.ogcapi.TileSource.prototype.setUrl = function (url) {
    var urls = this.urls = ol.TileUrlFunction.expandUrl(url);
    this.setTileUrlFunction(this.createFromTemplates(urls));
};


/**
 * @inheritDoc
 */
plugin.ogcapi.TileSource.prototype.setUrls = function (urls) {
    this.urls = urls;
    this.setTileUrlFunction(this.createFromTemplates(urls));
};


/**
 * @param {string} template Template
 * @return {ol.TileUrlFunctionType} Tile URL function
 * @protected
 */
plugin.ogcapi.TileSource.prototype.createFromTemplate = function (template) {
    // handle both  {x}/{y}/{z} and %x/%y/%z formats
    var zRegEx = /\{z\}|\%z/g;
    var xRegEx = /\{x\}|\%x/g;
    var yRegEx = /\{y\}|\%y/g;
    var dashYRegEx = /\{-y\}/g;
    var offset = this.zoomOffset;
    return (
        /**
         * @param {ol.TileCoord} tileCoord Tile Coordinate.
         * @param {number} pixelRatio Pixel ratio.
         * @param {ol.proj.Projection} projection Projection.
         * @return {string|undefined} Tile URL.
         */
        function (tileCoord, pixelRatio, projection) {
            if (tileCoord === null) {
                return undefined;
            } else {
                return template
                    .replace('{tileMatrix}', 'EPSG:4326:' + (tileCoord[0] + offset).toString())
                    .replace('{tileCol}', tileCoord[1].toString())
                    .replace('{tileRow}', (-tileCoord[2] - 1).toString())
                    .replace(dashYRegEx, function () {
                        var y = (1 << tileCoord[0]) - tileCoord[2] - 1;
                        return y.toString();
                    });
            }
        }
    );
};


/**
 * @param {Array.<string>} templates Templates.
 * @return {ol.TileUrlFunctionType} Tile URL function.
 * @protected
 */
plugin.ogcapi.TileSource.prototype.createFromTemplates = function (templates) {
    return ol.TileUrlFunction.createFromTileUrlFunctions(
        goog.array.map(templates, this.createFromTemplate, this));
};