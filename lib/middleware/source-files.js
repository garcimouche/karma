/**
 * Source Files middleware is responsible for serving all the source files under the test.
 */

var querystring = require('querystring');
var common = require('./common');


var findByPath = function(files, path) {
  for (var i = 0; i < files.length; i++) {
    if (files[i].path === path) {
      return files[i];
    }
  }

  return null;
};


var createSourceFilesMiddleware = function(filesPromise, serveFile,
    /* config.basePath */ basePath) {

  return function(request, response, next) {
    var requestedFilePath = querystring.unescape(request.url.replace(/\?.*/, ''))
        .replace(/^\/absolute/, '')
        .replace(/^\/base/, basePath);

    return filesPromise.then(function(files) {
      // TODO(vojta): change served to be a map rather then an array
      var file = findByPath(files.served, requestedFilePath);

      if (file) {
        return serveFile(file.contentPath, response, function(data) {
          if (/\?\d+/.test(request.url)) {
            // files with timestamps - cache one year, rely on timestamps
            common.setHeavyCacheHeaders(response);
          } else {
            // without timestamps - no cache (debug)
            common.setNoCacheHeaders(response);
          }
        });
      }

      return next();
    });
  };
};


// PUBLIC API
exports.create = createSourceFilesMiddleware;
