goog.require('os.file.File');
goog.require('os.file.mime.mock');
goog.require('plugin.ogcapi.ID');
goog.require('plugin.ogcapi.mime');

describe('plugin.ogcapi.mime', function() {
  it('should register itself with mime detection', function() {
    var chain = os.file.mime.getTypeChain(plugin.ogcapi.ID).join(', ');
    expect(chain).toBe('application/octet-stream, text/plain, application/json, ' + plugin.ogcapi.ID);
  });

  it('should not detect files that are not OGC API files', function() {
    os.file.mime.mock.testFiles([
      '/base/test/resources/bin/rand.bin',
      '/base/test/resources/json/partial_array.json',
      '/base/test/resources/json/partial_object.json',
      '/base/test/resources/ogc/wms-130.xml',
      '/base/test/resources/ogc/wms-111.xml',
      '/base/test/resources/ogc/wfs-200.xml',
      '/base/test/resources/ogc/wfs-110.xml',
      '/base/test/resources/ogc/exception-report.xml'],
    os.file.mime.mock.testNo(plugin.ogcapi.ID));
  });

  it('should detect files that are OGC API files', function() {
    os.file.mime.mock.testFiles([
      '/base/test/resources/ogcapi/pygeoapi.json'],
    os.file.mime.mock.testYes(plugin.ogcapi.ID));
  });
});
