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

setOptions = () => { 
  const OPTIONS = {
        //detect container resizing and redraw
        autoResize: true,
        height: '100%',
        width: '100%',
        layout: { 
          hierarchical: false,
          randomSeed: undefined,
          improvedLayout: false
        },
        interaction: {
          dragNodes: false,
          selectConnectedEdges: true,
          multiselect: true
        },
        edges: {
          font: {face: 'Quicksand'},
          color: {color:'lightgrey'},
          arrows: {to: {enabled: true}},
          smooth: {type: 'curvedCW',
          roundness: 0.4},
          scaling: {min: _edgeRange[0], max: _edgeRange[1]}
        },
        nodes: {
          font: {color: 'white', face: 'Quicksand'},
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
        /*
        physics: {
         stabilization: true,
         forceAtlas2Based: {
              gravitationalConstant: -500,
              centralGravity: 0.01,
              springLength: 100,
              springConstant: 0,
              damping: 0.08
         },
          "minVelocity": 0.75,
          "maxVelocity": 100,
          "solver": "forceAtlas2Based",
          "timestep": 1
        }
        */
      }
      
    return OPTIONS
}

//node scale

//distributes nodes on a circle
circleCoord = (selNodes,_r,_x0,_y0) => {

  var totalPerPeriod = selNodes.length
  //choose how many circles to distribute on
  var circles = 1;
  var items = totalPerPeriod/circles;
  var coord=[]
  var x0 = _x0
  var y0 = _y0
  var r = _r + 10 * (selNodes.length-5)
  
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
corePeripheryCoord = (_centre) => {
  //TO CHANGE
  centre = _centre
  centralNodes = _nodes.filter((node) => node.sector == centre)
  centralNodes = circleCoord(centralNodes,20,0,0)

  //peripheral nodes
  peripheryNodes = _nodes.filter((node) => node.sector != centre)
  
  peripherySectors = sectors.filter((sector) => sector.sector != _centre)
  peripheryCentres = setPeripheryCentres(peripherySectors.length,600)
  peripherySectors.map((sec,idx) => {
    secNodes = peripheryNodes.filter((node) => node.sector == sec.sector)
    x0=peripheryCentres[idx].x
    y0=peripheryCentres[idx].y
    secNodes = circleCoord(secNodes,50,x0,y0)
    return secNodes
  })

  //peripheryNodes = circleCoord(peripheryNodes,500,0,0)
  return _nodes = centralNodes.concat(peripheryNodes)

}

//selects which sector is at the centre of the core-periphery visualisation
//selection is made based on max avg(selected categoryKey)
setCoreSector = (_categoryKey) => {
  //find sector averages
  sectorAvgs=[]
  sectors.slice(0,-1).map((sector) => {
    selNodes = _nodes.filter((node) => node.sector == sector.sector)
    sum=0
    selNodes.map((node) => {
      sum+=node[_categoryKey]
    })
    sectorAvgs.push(sum/selNodes.length)
    })
  //select maximum value and return corresponding sector
  idxMax = sectorAvgs.indexOf(Math.max(...sectorAvgs))
  coreSector = sectors[idxMax].sector
  return coreSector
}

setPeripheryCentres = (countCentres,outerCircleSize) => {
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

hideZeroValues = () => {
  //_edges.map((edge) => {if (edge.value==0) edge.hidden=true; else edge.hidden=false;})
  _nodes.map((node) => {if (node.value==0) node.hidden=true; else node.hidden=false;})
}

nodeScale = (nodes) => {
  return 20/nodes.length
}

nodeColorsBySector = () => {
    var colors = SECTOR_COLORS
    var len = sectors.length/COLORS.length
    if (len>1) {
      for (var i=0; i< len+1; i++) {
        colors = colors.concat(colors)
      }
    }
    var cols = {}
    sectors.map((sector, idx) => cols[sector.sector]= colors[idx]) 

    //var nodesArray = objectToArray(network.body.data.nodes._data);
    //var edgesArray = objectToArray(network.body.data.edges._data);
    //nodesArray = nodesArray.map((node) => { node.color = {background: cols[node.sector]}; return node})
    _nodes.map((node) => { node.color = {background: cols[node.sector]}; return node})
    network.setData({nodes: _nodes, edges: _edges})
}

nodeColorsUniform = () => {
    //var nodesArray = objectToArray(network.body.data.nodes._data);
    //var edgesArray = objectToArray(network.body.data.edges._data);
    //nodesArray = nodesArray.map((node) => { node.color = {background: 'darkgrey', highlight: 'black'}; return node});
    _nodes.map((node) => { node.color = {background: 'darkgrey', highlight: 'black'}; return node})
    network.setData({nodes: _nodes, edges: _edges});
}

nodeColorsCustom = () => {
  _nodes.map((node) => { node.color = {background: node.customColor, highlight: '#FF991F'}; return node})
  network.setData({nodes: _nodes, edges: _edges});
}

edgeColorsByTrend = () => {
    //var nodesArray = objectToArray(network.body.data.nodes._data);
    //var edgesArray = objectToArray(network.body.data.edges._data);
    //edgesArray=edgesArray.map((edge) => {edge.color = {color: COLORS[edge.trend], opacity: 0.2, highlight: COLORS[edge.trend]}; return edge});
    _edges.map((edge) => {edge.color = {color: COLORS[edge.trend], opacity: 0.2, highlight: COLORS[edge.trend]}; return edge})
    network.setData({nodes: _nodes, edges: _edges});
}

edgeColorsUniform = () => {
    //var nodesArray = objectToArray(network.body.data.nodes._data);
    //var edgesArray = objectToArray(network.body.data.edges._data);
    //edgesArray = edgesArray.map((edge) => { edge.color = {color: 'lightgrey', opacity: 0.2, highlight: '#FF991F'}; return edge})
    _edges.map((edge) => { edge.color = {color: 'lightgrey', opacity: 0.2, highlight: '#FF991F'}; return edge})
    network.setData({nodes: _nodes, edges: _edges})
}

edgeRank = () => {
  values = _edges.map((edge) => { return edge.value})
  values.sort()
  _edges.map((edge) => {
      edge['rank']=values.indexOf(edge.value)/values.length
  })
}

edgeSelectBySize = (cutOffPoint) => {
  _edges.map((edge) => {
    if (edge.rank<cutOffPoint) edge.hidden=true
    else if (edge.value == 0 ) edge.hidden=true 
    else edge.hidden=false
  })
}
