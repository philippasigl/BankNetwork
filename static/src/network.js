"use strict";

const init = () => {
    container = document.getElementById('network')
    exportButton = document.getElementById('export_button')
    nodeSlider = document.getElementById('nodeSlider')
    edgeSlider = document.getElementById('edgeSlider')
    edgeSlider2 = document.getElementById('edgeSlider2')
    nodeCoords = 'default'
    nodeColor = 'default'
    nodeName = 'actual'
    nodeSizeKey = 'no value'
    edgeSizeKey = 'absolute'
    edgeColorIsOn = false
    coreSector = sectors[0].sector
    date = dates[dates.length-1].dateID
    _sector = 'all'
    _nodeRange = [1,30]
    _edgeRange = [0.01,20]
    let edgeRange = [0.005,30]
    let nodeRange = [1,50]
    _edgeCutoff = 0.1
    _innerCircleRadius = 400
    _outerCirclesRadius = 100
    _innerOuterRadius = 600
    setSlider(nodeSlider,_nodeRange,nodeRange)
    setSlider(edgeSlider,_edgeRange,edgeRange)
    setEdgeRankSlider(edgeSlider2,_edgeCutoff)
    //construct_network()
    draw()
}

const draw = () => { 
    //if (typeof date !== 'undefined')  {
    //   document.getElementById("hist_network_select").checked = false;
    //   historyIsOn = false;
    //}
   
    //subset nodes and edges by date; required to prevent duplicate id error
    var data = select_date()
    
    //set minimum scale for nodes
    _nodeRange[0] = nodeScale(_nodes)
    //options are defined in options.js 
    _options = setOptions()

    //draw current network
    network = new vis.Network(container, data, _options)

    //set network structure
    select_nodeCoord()
    //if (historyIsOn) set_history()
    //set colors
    select_nodeColor()
    if (edgeColorIsOn) set_edge_color()
    else unset_edge_color()
    //set node labels
    select_nodeName()
    //set category for node and edge sizes
    select_nodeSizeKey()
    select_edgeSizeKey()
    //set tooltips
    set_tooltips()
    //calculate the relative size for the edges
    edgeRank()
    edgeSelectBySize(_edgeCutoff)
    //hide edges with 0 values
    hideZeroValues()
    //display nodes for selected sector only
    select_nodesBySector()
    //set highlighting options (which depend on the chosen color options)
    setHighlight()
    unsetHighlight()
}

/*
const exportImage2 = () => {
    let dateLabel = (Math.floor(date/12)).toString() + (date % 12).toString()
    let canvas = document.getElementsByTagName('canvas')
    let nodeProps = 'n_' + nodeName + '_' + nodeSizeKey + '_' + nodeColor
    let edgeProps = 'e_' + '_'+ edgeSizeKey + '_'+ edgeColorIsOn
    let netProps = 'net_' + nodeCoords + '_' + _sector
    let canvas_filename = dateLabel + ' ' + netProps + ' ' + nodeProps + ' ' + edgeProps
        canvas[0].toBlobHD(function(blob) {
            saveAs(
                  blob
                , (canvas_filename) + ".png"
            );
        }, "image/png");
}
*/


//exports for testing in node
if (typeof window === 'undefined') {
var vis = require('../node_modules/vis/dist/vis')
exports.init = init
exports.draw = draw
}