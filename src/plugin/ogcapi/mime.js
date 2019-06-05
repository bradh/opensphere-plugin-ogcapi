goog.provide('plugin.ogcapi.mime');

goog.require('goog.Promise');
goog.require('os.file.mime');
goog.require('os.file.mime.json');
goog.require('plugin.ogcapi.ID');


/**
 * @param {ArrayBuffer} buffer
 * @param {os.file.File} file
 * @param {*=} opt_context
 * @return {!goog.Promise<*|undefined>}
 */
plugin.ogcapi.mime.detect = function(buffer, file, opt_context) {
  var retVal;

  if (opt_context && opt_context['links'] && Array.isArray(opt_context['links'])) {
    var links = opt_context['links'];
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link['rel'] === 'conformance') {
        console.log('conformance: ',  link);
        retVal = plugin.ogcapi.ID;
        break;
      }
    }
  }

  return goog.Promise.resolve(retVal);
};

os.file.mime.register(plugin.ogcapi.ID, plugin.ogcapi.mime.detect, 0, os.file.mime.json.TYPE);
