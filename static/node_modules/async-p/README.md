# promise-async

The [async-module](https://github.com/caolan/async) is a very useful module for
doing a set of asynchronous operations in a specified order. The async-module
expects all functions to take a callback as the last parameter. This module
tries to provide the same API and functionality as the async-module using
promises instead of callbacks.

Currently only a small subset of the async-api is implemented. Please send
pull-requests for other methods.

## installation

    npm install async-p


## parallel, parallelLimit, and series

These functions take an array of jobs as the first parameter. A job is a
function that returns a promise.

    var async = require('async-p')

    function job() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 1000)
        })
    }


### parallel

Run all jobs in parallel. Returns a promise that resolves when the promises
returned by all jobs have resolved.

    async.parallel([job, job, job])
    .then( function() {
        console.log('All jobs resolved in parallel')
    })
    .catch( function(err) {
        // At least one job rejected and its reject was called with err
    })

parallel is the same as Promise.all()

### parallelLimit

Run jobs in parallel with a limit on how many jobs can run in parallel. Returns
a promise that resolves when the promises returned by all jobs have resolved.

    async.parallelLimit([job, job, job],2)
    .then( function() {
        console.log('All jobs resolved, max 2 running at a time')
    })
    .catch( function(err) {
        // At least one job rejected and its reject was called with err
    })

### series

Run jobs in series. Equal to parallelLimit(jobs, 1). Returns a promise that
resolves when the promises returned by all jobs have resolved.

    async.series([job, job, job])

## each, eachLimit, eachSeries

The each-functions take as arguments an array and a process-function that takes
one item from the array and returns a promise. Returns a promise that resolves
when the process-function has been run with all items from the array and all the
returned promises have been resolved. The process-function is guaranteed to be
applied to the items in the array in order.

    var async = require('async-p')

    function process(item) {
        return new Promise(function(resolve) {
            console.log(item)
            setTimeout(resolve, 1000)
        })
    }

### each

Process all items in the array in parallel. Returns a promise that resolves when
the promises returned by all process-invocations have resolved.

    async.each([1,2,3], process)
    .then( function() {
        console.log('Done')
    })
    .catch( function(err) {
        // At least one process() rejected and its reject was called with err
    })

### eachLimit

Process all items in the array in parallel with a limit on how many items can be
processed in parallel. Returns a promise that resolves when the promises
returned by all process-invocations have resolved.

    async.parallelLimit([1,2,3], process, 2)
    .then( function() {
        console.log('All items processed, max 2 running at a time')
    })
    .catch( function(err) {
        // At least one process-call rejected and its reject was called with err
    })

### eachSeries

Process all items in series. Equal to eachLimit(jobs, 1). Returns a promise that
resolves when the promises returned by all process-invocations have resolved.

    async.eachSeries([1,2,3], process)
