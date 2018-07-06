var tee = require('../index');
var through = require('through');
var Stream = require('stream');
var expect = require('expect.js');

describe('tee', function() {
  it('should multiplex', function(done) {
    var called = 0;
    var dest1 = createWriteStream();
    var dest2 = createWriteStream();
    var m = tee(dest1, dest2);
    m.write('foo');

    function createWriteStream() {
      return through(function(data) {
        expect(data).to.be('foo');
        if (called++) done();
      })
    }
  });
  it('should pause', function(done) {
    var called = 0;
    var dest = through(function() {
      if (!called) expect(dest.paused).to.be.ok();
      if (called++) done();
    });

    var m = tee(dest);
    dest.pause();
    m.write('foo');
    dest.resume();
    m.write('bar');
  });
  it('should be a through stream', function(done) {
    var m = tee();
    expect(m.readable).to.be.ok();

    var dest = through(function(data) {
      expect(data).to.be('foo');
      done();
    });

    m.pipe(dest);
    m.write('foo');
  });
  it('should close', function(done) {
    var ended = 0;
    var dest1 = createWriteStream();
    var dest2 = createWriteStream();
    var m = tee(dest1, dest2);
    m.on('close', function() {
      expect(ended).to.be(2);
      done();
    });
    m.write('foo');
    m.end();
    
    function createWriteStream() {
      return through(function(data) {
        expect(data).to.be('foo');
      }, function() {
        ended++;
      });
    }
  });
});

