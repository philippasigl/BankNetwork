var sinon = require('../../node_modules/sinon')
var sh = require('../../node_modules/sinon-helpers')
const utils = require("../../node_modules/jsdom/lib/jsdom/utils")
const canvasMock = require("../../node_modules/canvas-mock")
var test = require('../../node_modules/tape')
var vis = require('../../node_modules/vis/dist/vis')
const INPUT = require('../../../test_data/test_data')
var network = require('.././network')

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

//global variables and methods from options mocks
global.container = document.getElementById('network')
global.network = undefined
global.exportButton = undefined
global.nodeSlider = undefined
global.edgeSlider = undefined
global.edgeSlider2 = undefined
global.nodeCoords = undefined
global.nodeColor = undefined
global.nodeName = undefined
global.nodeSizeKey = undefined
global.edgeSizeKey = undefined
global.edgeColorIsOn = undefined
global.coreSector = undefined
global.date = undefined
global._sector = undefined
global._nodeRange = [0,1]
global._edgeRange = undefined
global._edgeCutoff = undefined
global._innerCircleRadius = undefined
global._outerCirclesRadius = undefined
global._innerOuterRadius = undefined
global.coreSector = undefined   
global._options = undefined
global.sectors = INPUT.sectors
global.dates = INPUT.dates
global._nodes = INPUT.nodes
global._edges = INPUT.edges
global.setOptions = () => {}
global.setSlider = (a,b,c) => {}
global.setEdgeRankSlider = (a,b) => {}
global.select_nodeCoord = () => {}
global.select_nodeColor = () => {}
global.set_edge_color = () => {}
global.unset_edge_color = () => {}
global.select_nodeName = () => {}
global.select_nodeSizeKey = () => {}
global.select_edgeSizeKey = () => {}
global.set_tooltips = () => {}
global.edgeRank = () => {}
global.edgeSelectBySize = () => {}
global.hideZeroValues = () => {}
global.select_nodesBySector = () => {}
global.setHighlight = () => {}
global.unsetHighlight = () => {}
global.select_date = () => {}
global.nodeScale = (a) => {return 1}
//vis network

//var colSpy = sinon.stub(network, 'draw').returns({update: sinon.spy()});
//var FooStub = sinon.spy(function() {
//    return sinon.createStubInstance(vis.Network);
//  });
//var foo = new FooStub()
//var colSpy = sinon.stub(net, 'vis').returns({update: sinon.spy()});
//init check values

test('init initialises all values correctly', (assert) => {
  //  var stub = sinon.stub(vis.Network)
 //   var st = sinon.stub(network,"draw")
    network.init()
    assert.equal(container,document.getElementById('network'))
    assert.equal(exportButton,document.getElementById('export_button'))
    assert.equal(nodeSlider,document.getElementById('nodeSlider'))
    assert.equal(edgeSlider,document.getElementById('edgeSlider'))
    assert.equal(edgeSlider2,document.getElementById('edgeSlider2'))
    assert.equal(nodeCoords,'default')
    assert.equal(nodeColor,'default')
    assert.equal(nodeName,'actual')
    assert.equal(nodeSizeKey,'no value')
    assert.equal(edgeSizeKey,'absolute')
    assert.equal(edgeColorIsOn,false)
    assert.equal(coreSector,sectors[0].sector)
    assert.equal(date,dates[dates.length-1].dateID)
    assert.equal(_sector,'all')
    assert.deepEqual(_nodeRange,[1,30])
    assert.deepEqual(_edgeRange,[0.01,20])
    assert.equal(_edgeCutoff,0.1)
    assert.equal(_innerCircleRadius,400)
    assert.equal(_outerCirclesRadius,100)
    assert.equal(_innerOuterRadius,600)
    assert.end()
});
//draw check function calls
test('check network gets drawn', (assert) => {
    network.draw()
    assert.notEqual(network,undefined)
    assert.end()
});