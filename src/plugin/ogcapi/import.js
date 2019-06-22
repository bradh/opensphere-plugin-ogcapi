goog.provide('plugin.ogcapi.ogcapiImportCtrl');
goog.provide('plugin.ogcapi.ogcapiImportDirective');

goog.require('goog.async.ConditionalDelay');
goog.require('os.defines');
goog.require('os.ui.Module');
goog.require('os.ui.SingleUrlProviderImportCtrl');
goog.require('os.ui.window');
goog.require('plugin.ogcapi.DataProvider');
goog.require('plugin.ogcapi.LandingPageParser');


/* istanbul ignore next */
/**
 * The OGC API import directive
 * @return {angular.Directive}
 */
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


/* istanbul ignore next */
/**
 * Controller for the OGC API server import dialog
 * @param {!angular.Scope} $scope
 * @param {!angular.JQLite} $element
 * @extends {os.ui.SingleUrlProviderImportCtrl}
 * @constructor
 * @ngInject
 */
plugin.ogcapi.ogcapiImportCtrl = function($scope, $element) {
  plugin.ogcapi.ogcapiImportCtrl.base(this, 'constructor', $scope, $element);

  var file = /** @type {os.file.File} */ ($scope['config']['file']);
  $scope['config']['url'] = file ? file.getUrl() : this.getUrl();
  var url = $scope['config']['url'];
  var landingPageParser = new plugin.ogcapi.LandingPageParser();
  landingPageParser.load(url);
  var titleDelay = new goog.async.ConditionalDelay(landingPageParser.hasTitle, landingPageParser);
  /**
   * Internal callback handler
   */
  titleDelay.onSuccess = function() {
    var title = landingPageParser.getTitle();
    $scope.$apply(function() {
      $scope['config']['label'] = title;
    });
  };
  titleDelay.start(100, 5000);
  $scope['urlExample'] = 'https://www.example.com/index.json';
  $scope['config']['type'] = plugin.ogcapi.ID;
  $scope['config']['label'] = this.getLabel() || 'ogcapi';
};
goog.inherits(plugin.ogcapi.ogcapiImportCtrl, os.ui.SingleUrlProviderImportCtrl);


/* istanbul ignore next */
/**
 * @inheritDoc
 */
plugin.ogcapi.ogcapiImportCtrl.prototype.getDataProvider = function() {
  var dp = new plugin.ogcapi.DataProvider();
  dp.configure(this.scope['config']);
  return dp;
};


/* istanbul ignore next */
/**
 * @inheritDoc
 */
plugin.ogcapi.ogcapiImportCtrl.prototype.getUrl = function() {
  if (this.dp) {
    var url = /** @type {plugin.ogcapi.DataProvider} */ (this.dp).getUrl();
    return url || '';
  }
  return '';
};


/* istanbul ignore next */
/**
 * @return {string}
 */
plugin.ogcapi.ogcapiImportCtrl.prototype.getLabel = function() {
  if (this.dp) {
    var label = /** @type {plugin.ogcapi.DataProvider} */ (this.dp).getLabel();
    return label || '';
  }
  return '';
};
