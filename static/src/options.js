"use strict";

//black,green,red,grey
const COLORS = { 'unchanged' :'#222233', 'increased' : '#4DC19C', 'decreased' : '#F89570', 'no_info': '#778899'}
const BLURRED_LINK_OPACITY = 0.3
const FOCUSED_LINK_OPACITY = 0.6
//https://www.hexdictionary.com/common-colors
const SECTOR_COLORS = ['#000077', '#008877','#0055ee', '#00ddcc', '#00cc77']
const EXTENDED_COLORS = [
  '#19CDD7', //turc
  '#DDB27C',
  '#88572C',
  '#FF991F', //light orange
  '#F15C17', //dark orange
  '#223F9A', //blue
  '#DA70BF', //pink
  '#4DC19C', //green
  '#12939A', //turk
  '#B7885E', //light brown
  '#FFCB99', //orange/sand
  '#F89570', //light red
  '#E79FD5', //pink
  '#89DAC1' //light green
]

const setOptions = () => { 
  const OPTIONS = {
        //detect container resizing and redraw
        autoResize: true,
        height: '100%',
        width: '100%',
        layout: { 
          hierarchical: false,
          randomSeed: undefined,
          improvedLayout: true
        },
        interaction: {
          dragNodes: false,
          selectConnectedEdges: true,
          multiselect: true
        },
        edges: {
          font: {face: 'Roboto'},
          color: {color:'lightgrey'},
          arrows: {to: {enabled: true}},
          smooth: {type: 'curvedCW',
          roundness: 0.4},
          scaling: {min: _edgeRange[0], max: _edgeRange[1]}
        },
        nodes: {
          font: {color: 'white', face: 'Roboto'},
          borderWidth: 0,
          color: {border: 'white', background: '#89DAC1', highlight: {background: '#FF991F'}},
          shape: 'circle',
          scaling: {min: _nodeRange[0], max: _nodeRange[1], label: {min: _nodeRange[0], max: _nodeRange[1]}}
        },
        //currently unused. range slider for node and edge sizes implemented with nouislider
        configure: {
          enabled: false,
          filter: function (option, path) {
            return path.indexOf('nodes') !== -1 && path.indexOf('scaling') !== -1;
          }
        }
      } 
    return OPTIONS
}

const set_tooltips = () => {
  _edges.map((edge) => {edge.title= "From " + edge.from + " to "+ edge.to + " value " + edge.value})
  _nodes.map((node) => {node.title= node.label+ " value "+ node.value})
}

//------NETWORK PROPERTIES------//
const switch_nodeCoord = () => {
  nodeCoords = document.getElementById('nodeCoord').value 
  nodeCoords=='core-periphery' ? _innerCircleRadius = 100 : _innerCircleRadius = 400
  disableCorePeripheryOptions()
  draw()
}

const select_nodeCoord = () => {
  if (nodeCoords == 'default') {
      _nodes=circleCoord(_nodes,_innerCircleRadius,0,0)
  }
  else if (nodeCoords == 'core-periphery') {
     _nodes=corePeripheryCoord(coreSector)
  }
  else if (nodeCoords == 'grouped') {
      _nodes=corePeripheryCoord()
  }
  var data = {nodes: _nodes, edges: _edges}
  network.setData({nodes: _nodes, edges: _edges})
}

const switch_coreSector = () => {
  let categoryCore = document.getElementById('coreCategory').value
  coreSector = setCoreSector(categoryCore)
  draw()
}

const switch_date = () => {
  date = document.getElementById('date').value
  draw()
}

const select_date = () => {
  _nodes = nodes.filter((node) => node.dateID == date)
  _edges = edges.filter((edge) => edge.dateID == date)
  var data = {nodes: _nodes, edges: _edges}

  return data
}

const switch_nodesBySector = () => {
  _sector = document.getElementById('sector').value
  draw()
}

const select_nodesBySector = () => {
  if (_sector != 'all') {
      _nodes.map((node) => { 
          if (node['sector']!=_sector) {
              node.hidden=true
          }
          else {node.hidden=false}
      })
  }
  else _nodes.map((node) => { node.hidden=false })
  network.setData({nodes: _nodes, edges: _edges}) 
} 

const switch_innerCircleRadius = () => {
  let val = document.getElementById('innerCircleRadius').value
  let numericVal = parseInt(val)
  numericVal && numericVal > 0 ? _innerCircleRadius=numericVal : _innerCircleRadius
  draw()
}

const switch_outerCirclesRadius = () => {
 let val = document.getElementById('outerCirclesRadius').value
  let numericVal = parseInt(val)
  numericVal && numericVal > 0 ?  _outerCirclesRadius=numericVal :  _outerCirclesRadius
  draw()
}

const switch_innerOuterRadius = () => {
  let val = document.getElementById('innerOuterRadius').value
  let numericVal = parseInt(val)
  numericVal && numericVal > 0 ?  _innerOuterRadius=numericVal :  _innerOuterRadius
  draw()
}

const setHighlight = () => network.on("selectNode", function () {
  selectedEdgeIDs = network.getSelectedEdges()
  selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.opacity=0.8} )
  //selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.opacity=0.8} )
  if (edgeColorIsOn == false) {
      selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.opacity=1, network.body.edges[id].options.color.highlight= '#FF991F'})
  }
})

const unsetHighlight = () => network.on("deselectNode", function () {
  selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.opacity=0.3})
  selectedEdgeIDs=[]
  selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.highlight=undefined})
})

//distributes nodes on a circle
const circleCoord = (selNodes,r,x0,y0) => {

  var totalPerPeriod = selNodes.length
  //choose how many circles to distribute on
  var circles = 1;
  var items = totalPerPeriod/circles;
  var coord=[]
  
  //get the coordinates
  for (var j=1; j<= circles;j++){
      for(var i = 0; i < items; i++) {
          var x= x0 + r * Math.cos(2 * Math.PI * i / items)*j;
          var y = y0 + r * Math.sin(2 * Math.PI * i / items)*j;
          var key = selNodes[i+j-1].id
          //var key = banks[i+j-1].id
          coord[key]= {x: x, y: y}
      }
  }
  //add to nodes for first period and then keep allocation for the consecutive ones
  selNodes = selNodes.map((node) => {  
        node.x=coord[node.id].x; 
        node.y=coord[node.id].y; 
        node.fixed ={x: true, y: true};
       return node});
    return selNodes
}

//core periphery structure
const corePeripheryCoord = (_centre) => {
  let peripheryNodes=[]
  let centralNodes=[]
  //without core
  if (typeof _centre != 'undefined') {
  let centre = _centre
  centralNodes = _nodes.filter((node) => node.sector == centre)
  centralNodes = circleCoord(centralNodes,_innerCircleRadius,0,0)

  //peripheral nodes
  peripheryNodes = _nodes.filter((node) => node.sector != centre)
  }
  else {
    peripheryNodes = _nodes
  }

  let peripherySectors = sectors.filter((sector) => sector.sector != _centre)
  let peripheryCentres = setPeripheryCentres(peripherySectors.length,_innerOuterRadius)
  peripherySectors.map((sec,idx) => {
    let secNodes = peripheryNodes.filter((node) => node.sector == sec.sector)
    let x0=peripheryCentres[idx].x
    let y0=peripheryCentres[idx].y
    secNodes = circleCoord(secNodes,_outerCirclesRadius,x0,y0)
    return secNodes
  })

  //peripheryNodes = circleCoord(peripheryNodes,500,0,0)
  return _nodes = centralNodes.concat(peripheryNodes)

}

//selects which sector is at the centre of the core-periphery visualisation
//selection is made based on max avg(selected categoryKey)
const setCoreSector = (_categoryKey) => {
  //find sector averages
  let sectorAvgs=[]
  sectors.slice(0,-1).map((sector) => {
    let selNodes = _nodes.filter((node) => node.sector == sector.sector)
    let sum=0
    selNodes.map((node) => {
      sum+=node[_categoryKey]
    })
    sectorAvgs.push(sum/selNodes.length)
    })
  //select maximum value and return corresponding sector
  let idxMax = sectorAvgs.indexOf(Math.max(...sectorAvgs))
  let coreSector = sectors[idxMax].sector
  return coreSector
}

const setPeripheryCentres = (countCentres,outerCircleSize) => {
  let coord=[]
  let x0=0
  let y0=0
      for(var i = 0; i < countCentres; i++) {
          var x= x0 + outerCircleSize * Math.cos(2 * Math.PI * i / countCentres)
          var y = y0 + outerCircleSize * Math.sin(2 * Math.PI * i / countCentres)
          //var key = banks[i+j-1].id
          coord.push({x: x, y: y})
      }
    return coord
}

//------NODE PROPERTIES------//
const switch_nodeName = () => {
  nodeName = document.getElementById('nodeName').value
  draw()
}

const select_nodeName = () => {
  if (nodeName == 'actual') _nodes.map((node) => node.label=node.name)
  else if (nodeName == 'anonymised') _nodes.map((node,idx) => node.label="Item "+ idx.toString())
  else if (nodeName == 'none') _nodes.map((node) => node.label="        ")
}

const switch_nodeSizeKey = () => {
  nodeSizeKey = document.getElementById('nodeSize').value
  draw()
}

const select_nodeSizeKey = () => {
  let nodeSize  
  _nodes.map((node) => {
      nodeSizeKey == 'no value' ? nodeSize = 1 : nodeSize = parseInt(node[nodeSizeKey])
      node.value=nodeSize
      node.title=nodeSize
  })
  var data = {nodes: _nodes, edges: _edges}
  network.setData({nodes: _nodes, edges: _edges})
}

const set_nodeRange = () => nodeSlider.noUiSlider.on('change', (values) => {
      _nodeRange[0]=parseInt(values[0])
      _nodeRange[1]=parseInt(values[1])
      draw()
})

const switch_nodeColor = () => {
  nodeColor = document.getElementById('nodeColor').value
  draw()
}

const select_nodeColor = () => {
  if (nodeColor == 'default') nodeColorsBySector()
  else if (nodeColor == 'custom') nodeColorsCustom()
  else nodeColorsUniform()
  network.setData({nodes: _nodes, edges: _edges})
}

const hideZeroValues = () => {
  //_edges.map((edge) => {if (edge.value==0) edge.hidden=true; else edge.hidden=false;})
  _nodes.map((node) => {if (node.value==0) node.hidden=true; else node.hidden=false;})
}

const nodeScale = (nodes) => {
  return 20/nodes.length
}

const nodeColorsBySector = () => {
    var colors = SECTOR_COLORS
    var len = sectors.length/COLORS.length
    if (len>1) {
      for (var i=0; i< len+1; i++) {
        colors = colors.concat(colors)
      }
    }
    var cols = {}
    sectors.map((sector, idx) => cols[sector.sector]= colors[idx]) 

    _nodes.map((node) => { node.color = {background: cols[node.sector]}; return node})
    network.setData({nodes: _nodes, edges: _edges})
}

const nodeColorsUniform = () => {
    _nodes.map((node) => { node.color = {background: 'darkgrey', highlight: 'black'}; return node})
    network.setData({nodes: _nodes, edges: _edges});
}

const nodeColorsCustom = () => {
  _nodes.map((node) => { node.color = {background: node.customColor, highlight: '#FF991F'}; return node})
  network.setData({nodes: _nodes, edges: _edges});
}


//------EDGE PROPERTIES------//
const switch_edgeSizeKey = () => {
  edgeSizeKey = document.getElementById('edgeSize').value
  draw()
}

const select_edgeSizeKey = () => {
  let edgeSize  
  _edges.map((edge) => {
      edgeSizeKey == 'absolute' ? edgeSize = edge['absValue'] : edgeSize = edge['trendValue']
      edge.value=edgeSize
      edge.title=edgeSize
  })
  var data = {nodes: _nodes, edges: _edges}
  network.setData({nodes: _nodes, edges: _edges})
}

const set_edgeRange = () => edgeSlider.noUiSlider.on('change', (values) => {
  _edgeRange[0]=parseInt(values[0])
  _edgeRange[1]=parseInt(values[1])
  draw()
  return _edgeRange
})

const set_edgeCutoff = () => edgeSlider2.noUiSlider.on('change', (values) => {
  _edgeCutoff = parseFloat(values[0])
  draw()

  //for testing purposes
  return _edgeCutoff
})

const switch_edge_color  = () => {
  if (edgeColorIsOn) {
      edgeColorIsOn = false
      unset_edge_color()
  }
  else {
      edgeColorIsOn = true
      set_edge_color()
  }
  draw()
}

const set_edge_color = () => {
  edgeColorsByTrend()
}

const unset_edge_color = () => {
  edgeColorsUniform()
}

const edgeColorsByTrend = () => {
    _edges.map((edge) => {edge.color = {color: COLORS[edge.trend], opacity: 0.2, highlight: COLORS[edge.trend]}; return edge})
    network.setData({nodes: _nodes, edges: _edges});
}

const edgeColorsUniform = () => {
    _edges.map((edge) => { edge.color = {color: 'lightgrey', opacity: 0.2, highlight: '#FF991F'}; return edge})
    network.setData({nodes: _nodes, edges: _edges})
}

const edgeRank = () => {
  let values = _edges.map((edge) => { return edge.value})
  values.sort((a, b) => {return a-b})
  _edges.map((edge) => {
      edge['rank']=values.indexOf(edge.value)/values.length
  })
}

const edgeSelectBySize = (cutOffPoint) => {
  _edges.map((edge) => {
    if (edge.rank<cutOffPoint) edge.hidden=true
    else if (edge.value == 0 ) edge.hidden=true 
    else edge.hidden=false
  })
}

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
      }, "image/png")
  
  //for testing
  return canvas_filename
}

//exports for testing in node.js
if (typeof window === 'undefined') {
    exports.setOptions = setOptions
    exports.set_tooltips = set_tooltips
    exports.switch_nodeCoord = switch_nodeCoord
    exports.select_nodeCoord = select_nodeCoord
    exports.switch_coreSector = switch_coreSector
    exports.switch_date = switch_date
    exports.select_date = select_date
    exports.switch_nodesBySector = switch_nodesBySector
    exports.select_nodesBySector = select_nodesBySector
    exports.switch_innerCircleRadius = switch_innerCircleRadius
    exports.switch_outerCirclesRadius = switch_outerCirclesRadius
    exports.switch_innerOuterRadius = switch_innerOuterRadius
    exports.setHighlight = setHighlight
    exports.unsetHighlight = setHighlight
    exports.circleCoord = circleCoord
    exports.corePeripheryCoord = corePeripheryCoord
    exports.setCoreSector = setCoreSector
    exports.setPeripheryCentres = setPeripheryCentres
    exports.switch_nodeName = switch_nodeName
    exports.select_nodeName = select_nodeName
    exports.switch_nodeSizeKey = switch_nodeSizeKey
    exports.select_nodeSizeKey = select_nodeSizeKey
    exports.set_nodeRange = set_nodeRange
    exports.switch_nodeColor = switch_nodeColor
    exports.select_nodeColor = select_nodeColor
    exports.hideZeroValues = hideZeroValues
    exports.nodeScale = nodeScale
    exports.nodeColorsBySector = nodeColorsBySector
    exports.nodeColorsUniform = nodeColorsUniform
    exports.nodeColorsCustom = nodeColorsCustom
    exports.switch_edgeSizeKey = switch_edgeSizeKey
    exports.select_edgeSizeKey = select_edgeSizeKey
    exports.set_edgeRange = set_edgeRange
    exports.set_edgeCutoff = set_edgeCutoff
    exports.switch_edge_color = switch_edge_color
    exports.set_edge_color = set_edge_color
    exports.unset_edge_color = unset_edge_color
    exports.edgeColorsByTrend = edgeColorsByTrend
    exports.edgeColorsUniform = edgeColorsUniform
    exports.edgeRank = edgeRank
    exports.edgeSelectBySize = edgeSelectBySize
    exports.SECTOR_COLORS = SECTOR_COLORS
    exports.exportImage2 = exportImage2
}