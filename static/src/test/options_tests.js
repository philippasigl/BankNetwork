var sinon = require('../../node_modules/sinon')
const utils = require("../../node_modules/jsdom/lib/jsdom/utils")
const canvasMock = require("../../node_modules/canvas-mock")
var test = require('../../node_modules/tape')
var vis = require('../../node_modules/vis/dist/vis')
const INPUT = require('../../../test_data/test_data')
var options = require('.././options')

//setting the dom
function Canvas () {
    canvasMock(this);
    this.toDataURL = function() { return ""; }
}
utils.Canvas = Canvas;

require('../../node_modules/jsdom-global')()
document.body.innerHTML = "<div id='network'></div> \
<div id='nodeCoord' value='default'></div>\
<div id='coreCategory' value='default'></div>\
<div id='date' value=' + value='default' + '></div>\
<div id='innerCircleRadius' value='default'></div>\
<div id='outerCirclesRadius' value='default'></div>\
<div id='innerOuterRadius' value='default'></div>\
<div id='nodeName' value='default'></div>\
<div id='nodeSize' value='default'></div>\
<div id='edgeSize' value='default'></div>\
<div id='nodeColor' value='default'></div>\
<div id='sector' value='default'></div>"

//mock values for dom
document.getElementById('date').value = 24201
document.getElementById('sector').value = "Kreditbanken"
document.getElementById('innerCircleRadius').value = 10
document.getElementById('outerCirclesRadius').value = 20
document.getElementById('innerOuterRadius').value = 50
document.getElementById('nodeName').value = 'anonymised'
document.getElementById('nodeSize').value = 'no value'
document.getElementById('nodeColor').value = 'custom'
document.getElementById('edgeSize').value = 'absValue'

//network
function createSampleNetwork() {

    NumInitialNodes = INPUT.nodes.length
    NumInitialEdges = INPUT.edges.length

    //data input
    var nodes = new vis.DataSet(INPUT.nodes)
    var edges = new vis.DataSet(INPUT.edges)  
  
    // create a network
    var container = document.getElementById('network')
    var data = {
        nodes: nodes,
        edges: edges
    }
  
    //initial options
    var _options = options.setOptions()
  
   var network = new vis.Network(container, data, _options)

   //replace setData with stub as otherwise vis doesn't run with mock Canvas
   var stubSetData = sinon.stub(network,'setData') 
    return network
}

//global variables
global._edgeRange =[0,200]
global._nodeRange =[0,50]
global.network = createSampleNetwork()
global.nodeCoords = 'default'
global._innerCircleRadius = 1
global._outerCirclesRadius = 1
global._innerOuterRadius = 1
global.disableCorePeripheryOptions = () => {}
global.draw = () => {}
global._edges = INPUT.edges
global._nodes = INPUT.nodes
global.nodes = INPUT.nodes
global.edges = INPUT.edges
global.sectors = INPUT.sectors
global.date = 24205
global._sector = "Kreditbanken"
global.edgeColorIsOn=false
global._categoryKey = "RWA"
global.nodeName = 'actual'
global.nodeSize = 'rwa'
global.nodeColor = 'default'
global.edgeSizeKey = 'absValue'
global.nodeSizeKey = 'rwa'
global.edgeColorIsOn = true
global.SECTOR_COLORS = options.SECTOR_COLORS

test('1 set tooltips',(assert) => {
    options.set_tooltips()
    assert.equal(_edges[0].title,'From 1 to 2 value undefined')
    assert.end()
 }) 

 test('2 switch coords',(assert) => {
    options.switch_nodeCoord()
    assert.equal(_innerCircleRadius,400)
    assert.end()
 }) 

test('3 select coord', (assert) => {
    nodeCoords = 'default'
    options.select_nodeCoord()
    assert.notEqual(_nodes[0].x,undefined)
    assert.end()
})

//TODO
test('4 switch core sector', (assert) => {
    //options.switch_coreSector()  
    assert.end()
})

test('5 switch date', (assert) => {
   assert.equal(date,24205)
    options.switch_date()
    assert.equal(date,24201)
    assert.end()
})

test('6 none for 24201 and all for 24205', (assert) => {
    date = 24201
    let res = options.select_date()
    assert.equal(res.nodes.length,0)
    assert.equal(res.edges.length,0)
    date = 24205
    let res1 = options.select_date()
    assert.notEqual(res1.nodes.length,0)
    assert.notEqual(res1.edges.length,0)
    assert.end()
})

test('7 switch from all to Kreditbanken',(assert) => {
    options.switch_nodesBySector()
    assert.equal(_sector,"Kreditbanken")
    assert.end()
})

test('8 select Kreditbanken',(assert) => {
    options.select_nodesBySector()
    //Sparkasse is supposed to be hidden
    assert.equal(_nodes[0].hidden,true)
    assert.end()
})

test('9 circle switches',(assert) => {
    options.switch_innerCircleRadius()
    assert.equal(_innerCircleRadius,10)
    options.switch_outerCirclesRadius()
    assert.equal(_outerCirclesRadius,20)
    options.switch_innerOuterRadius()
    assert.equal(_innerOuterRadius,50)
    assert.end()
})

test('10 change opacity for selected edges',(assert) => {
    options.setHighlight()
    options.unsetHighlight()
    assert.equal(edgeColorIsOn,true)
    assert.end()
})

test('11 circle coords',(assert) => {
    let selNodes = _nodes
    options.circleCoord(selNodes,10,1,1)
    assert.equal(selNodes[0].x,11)
    assert.end()
})

test('12 core periphery',(assert) => {
    options.corePeripheryCoord
    assert.equal(_nodes[0].x,11)
    assert.end()
})

test('13 largest rwa for Kreditbanken', (assert) => {
    let res = options.setCoreSector(_categoryKey)
    assert.equal(res,"Kreditbanken")
    assert.end()
})

test('14 periphery centres starting at 10,0', (assert) => {
    let res = options.setPeripheryCentres(3,10)
    assert.equal(res[0].x,10)
    assert.equal(res[0].y,0)
    assert.end()
})

test('15 name to anonymised', (assert) => {
    options.switch_nodeName()
    options.select_nodeName()
    assert.equal(_nodes[0].label,"Item 0")
    assert.end()
})

test('16 change color to custom', (assert) => {
   options.switch_nodeColor()
    options.select_nodeColor()
    assert.equal(nodeColor,"custom")
    assert.end()
})

test('17 hide node with 0 values', (assert) => {
    _nodes[0].value = 0
    _nodes[1].value = 1
    options.hideZeroValues()
    assert.equal(_nodes[0].hidden,true)
    assert.end()
})

test('18 nodescale is 5', (assert) => {
    let scale = options.nodeScale(_nodes)
    assert.equal(scale,5)
    assert.end()
})

test('19 color nodes by sector', (assert) => {
    options.nodeColorsBySector()
    assert.equal(_nodes[0].customColor,"blue")
    assert.end()
})

test('20 node colors to uniform', (assert) => {
    options.nodeColorsUniform()
    assert.equal(_nodes[0].color.background,"darkgrey")
    assert.end()
})

test('node colors to custom', (assert) => {
    options.nodeColorsCustom()
    assert.equal(_nodes[0].color.background,"blue")
    assert.end()
})

test('edge key as abs', (assert) => {
    options.switch_edgeSizeKey()
    options.select_edgeSizeKey()
    assert.equal(edgeSizeKey,'absValue')
    assert.end()
})

test('edgeSlider 1 and 2', (assert) => {
    global.edgeSlider = {
        noUiSlider: {on: function(a,b) {return a}}
    }
    global.edgeSlider2 = {
        noUiSlider: {on: function(a,b) {return a}}
    }
    let a = options.set_edgeRange()
    let b = options.set_edgeCutoff()
    assert.equal(a,'change')
    assert.equal(b,'change')
    assert.end()
})

test('switch edge color from true to false', (assert) => {
    options.switch_edge_color()
    assert.equal(edgeColorIsOn,false)
    assert.end()
})

test('set and unset edge color', (assert) => {
    options.set_edge_color()
    assert.equal(_edges[0].color.color,'#222233')

    options.unset_edge_color()
    assert.equal(_edges[0].color.color,'lightgrey')
    assert.end()
})

test('edge rank', (assert) => {
      options.edgeRank()
      assert.equal(_edges[2].rank,0)
      assert.end()
  })

test('first edge to be hidden', (assert) => {
      options.edgeSelectBySize(3)
      assert.equal(_edges[0].hidden,true)
      assert.end()
})


test.onFinish(function() { 
    process.exit(0)
});