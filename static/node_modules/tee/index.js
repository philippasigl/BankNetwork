var through = require('through');
var slice = [].slice;

module.exports = mux;

function mux() {
  var streams = slice.call(arguments);
  var tr = through();
  var closed = 0;
  
  for (var i = 0; i < streams.length; i++) (function(stream) {
    tr.pipe(stream);
    stream.on('close', function() {
      if (++closed == streams.length) {
        tr.queue(null);
      }
    });
  })(streams[i]);

  return tr;
}
