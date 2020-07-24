goog.provide('plugin.ogcapi.Plugin');

goog.require('os.data.ConfigDescriptor');
goog.require('os.data.ProviderEntry');
goog.require('os.plugin.AbstractPlugin');
goog.require('os.plugin.PluginManager');
goog.require('os.ui.ProviderImportUI');
goog.require('plugin.ogcapi.DataProvider');
goog.require('plugin.ogcapi.LayerConfig');
goog.require('plugin.ogcapi.ID');
goog.require('plugin.ogcapi.mime');
goog.require('plugin.ogcapi.ogcapiImportDirective');

/**
 * Provides plugin tie-in.
 *
 * @extends {os.plugin.AbstractPlugin}
 * @constructor
 */
plugin.ogcapi.Plugin = function() {
  plugin.ogcapi.Plugin.base(this, 'constructor');
  this.id = plugin.ogcapi.ID;
  this.errorMessage = null;
};
goog.inherits(plugin.ogcapi.Plugin, os.plugin.AbstractPlugin);

/**
 * @inheritDoc
 */
plugin.ogcapi.Plugin.prototype.init = function() {
  os.layer.config.LayerConfigManager.getInstance().registerLayerConfig(plugin.ogcapi.LayerConfig.ID, plugin.ogcapi.LayerConfig);
  var dm = os.data.DataManager.getInstance();
  dm.registerProviderType(new os.data.ProviderEntry(
      plugin.ogcapi.ID,
      plugin.ogcapi.DataProvider,
      'OGC API',
      'OGC API layers'
  ));
  dm.registerDescriptorType(plugin.ogcapi.ID, os.data.ConfigDescriptor);

  var im = os.ui.im.ImportManager.getInstance();
  im.registerImportUI(plugin.ogcapi.ID, new os.ui.ProviderImportUI('<ogcapi></ogcapi>'));
  im.registerImportUI(os.file.mime.json.TYPE, new os.ui.ProviderImportUI('<ogcapi></ogcapi>'));
};

// add the plugin to the application
os.plugin.PluginManager.getInstance().addPlugin(new plugin.ogcapi.Plugin());
