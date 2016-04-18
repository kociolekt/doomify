var minify = require('html-minifier').minify;
var Mustache = require('mustache');
var stream = require('stream');
var util = require('util');
var objectAssign = require('object-assign');

var MINIFIER_DEFAULTS = {
  // http://perfectionkills.com/experimenting-with-html-minifier/#options
  removeComments: true,
  collapseWhitespace: true,
  conservativeCollapse: true
};

var DEFAULTS = {
  templateOpts: {},
  minifierOpts: {},
  noMinify: false
};

function compile(str, minifierOpts) {
  var compiled = minifierOpts === false
    ? str.replace(/(\r\n|\n|\r)/gm,'') // Remove new lines
    : minify(str, minifierOpts);

  Mustache.parse(compiled);

  return compiled;
}

function wrap(source) {
  return 'var doomifyProcess = require(\'doomify/process\');\n' +
    'module.exports = doomifyProcess(\'' + source + '\');';
}

function transform(src, opts) {
  var compiled = compile(src, opts.noMinify ? false : opts.minifierOpts);
  var body = wrap(compiled);
  return body;
}

var templateExtension = /\.(dmt|tpl|html)$/;

function Doomify(opts) {
  stream.Transform.call(this);

  opts = objectAssign({}, opts, DEFAULTS);

  if (opts.minifierOpts !== false) {
    opts.minifierOpts = objectAssign({}, opts.minifierOpts, MINIFIER_DEFAULTS);
  }

  this._data = '';
  this._opts = opts;
}

util.inherits(Doomify, stream.Transform);

Doomify.prototype._transform = function (buf, enc, next) {
  this._data += buf;
  next();
};

Doomify.prototype._flush = function (next) {
  try {
    this.push(transform(this._data, this._opts));
  } catch(err) {
    this.emit('error', err);
    return;
  }
  next();
};

function doomify(file, opts) {
  if (!templateExtension.test(file)) {
    return new stream.PassThrough();
  }
  return new Doomify(opts);
}

module.exports = doomify;
module.exports.compile = compile;
module.exports.wrap = wrap;
module.exports.transform = transform;
