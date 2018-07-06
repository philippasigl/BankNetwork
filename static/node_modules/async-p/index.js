'use strict'

function parallel(jobs) {
    return Promise.all(jobs.map(function(job) { return job() }))
}

function parallelLimit(jobs, max) {
    let n

    function runJob(i) {
        if( i < jobs.length ) {
            return jobs[i]().then( function() {
                return runJob(n++)
            } )
        }
        else {
            return Promise.resolve()
        }
    }

    let runners = []
    for(n=0; n<max; n++) {
        runners.push(runJob(n))
    }

    return Promise.all( runners )
}

function series(jobs) {
    return parallelLimit(jobs, 1)
}

function each(arr, job) {
    return Promise.all(arr.map(function(item) { return job(item) } ))
}

function eachLimit(arr, job, limit) {
    let jobs = arr.map(function(item) {
        return function() {
            return job(item)
        }
    })

    return parallelLimit(jobs, limit)
}

function eachSeries(arr, job) {
    return eachLimit(arr, job, 1)
}

module.exports = {
    parallel, parallelLimit, series,
    each, eachLimit, eachSeries
}
