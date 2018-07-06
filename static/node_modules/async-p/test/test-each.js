'use strict'

const test = require('tape')
const async = require('../')
const debug = require('debug')('test')
let result = []
let n = 0

function clear() {
  result.length = 0
  n = 0
}

function job(m) {
    return new Promise( function(resolve) {
        debug('start', m)
        result.push(m)
        setTimeout(function() {
          result.push(m)
          debug('done', m)
          resolve()
        }, m*100)
    } )
}


test( 'each', function(t) {
    t.plan(1)
    clear()
    async.each([1,2,3], job).then(function(res) {
        t.deepEqual(result, [1,2,3,1,2,3])
    })
})


test( 'eachLimit max > jobs.length', function(t) {
    t.plan(1)
    clear()
    async.eachLimit([1,2,3], job, 4).then(function(res) {
        t.deepEqual(result, [1,2,3,1,2,3])
    })
})


test( 'eachLimit max < jobs.length', function(t) {
    t.plan(1)
    clear()
    async.eachLimit([1,2,3], job, 2).then(function(res) {
        t.deepEqual(result, [1,2,1,3,2,3])
    })
})

test( 'eachLimit max = 1', function(t) {
    t.plan(1)
    clear()
    async.eachLimit([1,2,3], job, 1).then(function(res) {
        t.deepEqual(result, [1,1,2,2,3,3])
    })
})

test( 'eachSeries', function(t) {
    t.plan(1)
    clear()
    async.eachSeries([1,2,3], job).then(function(res) {
        t.deepEqual(result, [1,1,2,2,3,3])
    })
})
