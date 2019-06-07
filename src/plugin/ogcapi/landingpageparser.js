goog.provide('plugin.ogcapi.LandingPageParser');
goog.require('os.net.Request');


/**
 * Parser for the OGC API Landing Page json
 *
 * @constructor
 */
plugin.ogcapi.LandingPageParser = function () {
  links_ = {};
};

plugin.ogcapi.LandingPageParser.prototype.errorMessage_ = "";

plugin.ogcapi.LandingPageParser.prototype.links_ = {};

/**
 * Get the parsed links
 * @returns {Object}
 */
plugin.ogcapi.LandingPageParser.prototype.getLinks = function () {
  return this.links_;
}

/**
 * Load the specified url
 *
 * @param {string} url
 */

plugin.ogcapi.LandingPageParser.prototype.load = function (url) {
  new os.net.Request(url).getPromise().
    then(this.onLoad, this.onError, this).
    thenCatch(this.onError, this);
}

/**
 * Process the response JSON
 *
 * @param {string} response
 * @protected
 */
plugin.ogcapi.LandingPageParser.prototype.onLoad = function (response) {
  try {
    var json = JSON.parse(response);
    if (json.hasOwnProperty('links')) {
      var links = json.links;
    }
  } catch (e) {
    this.onError('Malformed JSON');
    return;
  }

  if (!goog.isArray(links)) {
    this.onError('Expected an array of links but got something else');
    return;
  }

  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    this.handleLink_(link);
  }
};

/**
 * @param {Object} link
 */
plugin.ogcapi.LandingPageParser.prototype.handleLink_ = function (link) {
  if (!link.hasOwnProperty('rel') || !link.hasOwnProperty('href') || !link.hasOwnProperty('type')) {
    console.log('Got invalid link type:' + JSON.stringify(link));
    return;
  }
  var rel = link['rel'];
  var format = link['type'];
  if ((rel === 'conformance') && (format === 'application/json')) {
    this.links_['conformance'] = link['href'];
  } else if ((rel === 'service') && (format === 'application/openapi+json;version=3.0')) {
    this.links_['service'] = link['href'];
  } else if ((rel === 'data') && (format === 'application/json')) {
    this.links_['data'] = link['href'];
  }
};

/**
 * @param {*} e
 * @protected
 */
plugin.ogcapi.LandingPageParser.prototype.onError = function (e) {
  this.errorMessage_ = goog.isArray(e) ? e.join(' ') : e.toString();
  console.log('on error: ' + this.errorMessage_);
};
