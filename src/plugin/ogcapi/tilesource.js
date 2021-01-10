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

    /**
     * @type {Array<Object>}
     * @protected
     */
    this.tileMatrixLimits = options['tileMatrixLimits'];

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
    var offset = this.zoomOffset;
    var tileMatrixLimits = this.tileMatrixLimits;
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
                var matrixIndex = tileCoord[0] + offset;
                var matrix = tileMatrixLimits[matrixIndex];
                var column = tileCoord[1];
                if ((column < matrix['minTileCol']) || (column > matrix['maxTileCol'])) {
                    return undefined;
                }
                var row = (-tileCoord[2] - 1);
                if ((row < matrix['minTileRow']) || (row > matrix['maxTileRow'])) {
                    return undefined;
                }
                return template
                    .replace('{tileMatrix}', matrix['tileMatrix'])
                    .replace('{tileCol}', column.toString())
                    .replace('{tileRow}', row.toString());
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