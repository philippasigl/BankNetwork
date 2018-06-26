"use strict";

var network
var container
var exportButton
var nodeSlider
var edgeSlider
var edgeSlider2
var selectedEdgeIDs
//boolean for the history switch
//var historyIsOn = false
var nodeCoords
var nodeColor
var edgeColorIsOn
var nodeName
var nodeSizeKey
var edgeSizeKey
var coreSector
//saving the non historical positions, so switch can be turned off
//var nohist_network
var date
var _sector
var _nodes
var _edges
var _options
var _nodeRange
var _edgeRange
var _edgeCutoff
var _innerCircleRadius
var _outerCirclesRadius
var _innerOuterRadius
//var date