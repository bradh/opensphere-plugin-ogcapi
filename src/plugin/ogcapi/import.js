goog.provide('plugin.ogcapi.ogcapiImportCtrl');
goog.provide('plugin.ogcapi.ogcapiImportDirective');

goog.require('os.defines');
goog.require('os.ui.Module');
goog.require('os.ui.SingleUrlProviderImportCtrl');
goog.require('os.ui.window');
goog.require('plugin.ogcapi.DataProvider');


/**
 * The OGC API import directive
 * @return {angular.Directive}
 */
/* istanbul ignore next */
plugin.ogcapi.ogcapiImportDirective = function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: os.ROOT + 'views/forms/singleurl.html',
    controller: plugin.ogcapi.ogcapiImportCtrl,
    controllerAs: 'ctrl'
  };
};


/**
 * Add the directive to the module
 */
os.ui.Module.directive('ogcapi', [plugin.ogcapi.ogcapiImportDirective]);


/**
 * Controller for the OGC API server import dialog
 * @param {!angular.Scope} $scope
 * @param {!angular.JQLite} $element
 * @extends {os.ui.SingleUrlProviderImportCtrl}
 * @constructor
 * @ngInject
 */
/* istanbul ignore next */
plugin.ogcapi.ogcapiImportCtrl = function($scope, $element) {
  plugin.ogcapi.ogcapiImportCtrl.base(this, 'constructor', $scope, $element);

  var file = /** @type {os.file.File} */ ($scope['config']['file']);
  $scope['config']['url'] = file ? file.getUrl() : this.getUrl();
  $scope['urlExample'] = 'https://www.example.com/index.json';
  $scope['config']['type'] = plugin.ogcapi.ID;
  $scope['config']['label'] = this.getLabel() || 'ogcapi';
};
goog.inherits(plugin.ogcapi.ogcapiImportCtrl, os.ui.SingleUrlProviderImportCtrl);


/**
 * @inheritDoc
 */
/* istanbul ignore next */
plugin.ogcapi.ogcapiImportCtrl.prototype.getDataProvider = function() {
  var dp = new plugin.ogcapi.DataProvider();
  dp.configure(this.scope['config']);
  return dp;
};


/**
 * @inheritDoc
 */
/* istanbul ignore next */
plugin.ogcapi.ogcapiImportCtrl.prototype.getUrl = function() {
  if (this.dp) {
    var url = /** @type {plugin.ogcapi.DataProvider} */ (this.dp).getUrl();
    return url || '';
  }

  return '';
};


/**
 * @return {string}
 */
/* istanbul ignore next */
plugin.ogcapi.ogcapiImportCtrl.prototype.getLabel = function() {
  if (this.dp) {
    var label = /** @type {plugin.ogcapi.DataProvider} */ (this.dp).getLabel();
    return label || '';
  }

  return '';
};