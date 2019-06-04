goog.require('os.mock');
goog.require('plugin.ogcapi.Plugin');

describe('plugin.ogcapi.Plugin', function() {
  it('should have the proper ID', function() {
    expect(new plugin.ogcapi.Plugin().id).toBe('ogcapi');
  });

  it('should not throw an error', function() {
    var fn = function() {
      var p = new plugin.ogcapi.Plugin();
      p.init();
    };

    expect(fn).not.toThrow();
  });
});
