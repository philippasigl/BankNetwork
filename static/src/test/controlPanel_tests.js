var sinon = require('../../node_modules/sinon')
var sh = require('../../node_modules/sinon-helpers')
const utils = require("../../node_modules/jsdom/lib/jsdom/utils")
const canvasMock = require("../../node_modules/canvas-mock")
var test = require('../../node_modules/tape')
var vis = require('../../node_modules/vis/dist/vis')
var noUiSlider = require('../../node_modules/noUiSlider')
const INPUT = require('../../../test_data/test_data')
var cp = require('.././controlPanel')
//var jsdom = require('../../node_modules/jsdom').JSDOM
var $ = require('../../node_modules/jquery')

//const dom = new jsdom(`<!DOCTYPE html><div></div>`);

require('../../node_modules/jsdom-global')()
document.body.innerHTML = "<div id='nodeSlider' class='slider'></div>\
<select id='nodeCoord'></select>\
<div id='edgeSlider2' class='slider'></div>\
<div id='coreCategory'></div>\
<input id='innerOuterRadius'></input>\
<input id='innerCircleRadius'></input>\
<input id='outerCirclesRadius' disabled></input>"
global.exportButton = undefined
global.nodeSlider = undefined
global.edgeSlider = undefined
global.edgeSlider2 = undefined
global.nodeCoord = 'core-periphery'

test('sets up slider', (assert) => {
    nodeSlider = document.getElementById('nodeSlider')
    let res = cp.setSlider(nodeSlider,10,[1,4])
    assert.equal(res.version,'11.1.0')
    assert.end()
})

test('edge rank slider', (assert) => {
    edgeSlider2 = document.getElementById('edgeSlider2')
    let res = cp.setEdgeRankSlider(edgeSlider2,1)
    assert.equal(res.version,'11.1.0')
    assert.end()
})

test('disable core periphery options', (assert) => {
    document.getElementById("nodeCoord").value = "default"
    cp.disableCorePeripheryOptions()
    let value = document.getElementById("outerCirclesRadius").disabled
    assert.equal(value,true)
    assert.end()
})