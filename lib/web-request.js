var Q = require('q');
var request = require('request');
var fs = require('fs');

var log = require('./log');

function parseDataUrl(url) {
  var result = Q.defer();

  try {
    var header = url.split(',', 1);
    if (header.indexOf('base64') != -1) {
      // base64 decode
      result.resolve(new Buffer(url.slice(header.length + 1), 'base64'));
    } else {
      result.resolve(new Buffer(url.slice(header.length + 1)));
    }
  } catch (e) {
    result.reject(e);
  }

  return result.promise;
}

function makeHttpRequest(url, userAgent) {
  var result = Q.defer();
  var headers = userAgent ? { 'User-Agent': userAgent } : {};

  request({ url: url, headers: headers, encoding: null }, function(error, response, body) {
    if (error) {
      result.reject(new Error(error));
      return;
    }

    result.resolve(body);
  });

  return result.promise;
}

function loadFile(file) {
  var result = Q.defer();
  fs.readFile(file, function(err, contents) {
    if (err) {
      promise.reject(new Error(err));
      return;
    }

    result.resolve(contents);
  })

  return result.promise;  
}

function webRequest(url, userAgent) {
  if (url.slice(0, 5) == "data:") {
    log.debug('Loading data URL: ' + url.slice(0, 40) + '[truncated]...');
    return parseDataUrl(url);
  }

  if (url.slice(0, 5) == "http:" || url.slice(0, 6) == "https:") {
    log.debug('Loading web URL: ' + url);
    return makeHttpRequest(url, userAgent);
  }

  if (url.slice(0, 5) == "file:") {
    log.debug('Loading file URL: ' + url);
    return loadFile(url.slice(5));
  }

  // Assume file
  log.debug('Loading file: ' + url);
  return loadFile(url);
}

exports.webRequest = webRequest;
