//black,green,red,grey
const COLORS = { 'unchanged' :'#222233', 'increased' : '#4DC19C', 'decreased' : '#F89570', 'no_info': '#778899'}

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
];

//distributes nodes on a circle
circleCoord = () => {

  var totalPerPeriod = nodes.length/dates.length
  
  //choose how many circles to distribute on
  var circles = 1;
  var items = totalPerPeriod/circles;
  var coord=[]
  var x0 = 0
  var y0 = 0
  var r = 500
  
  //get the coordinates
  for (var j=1; j<= circles;j++){
      for(var i = 0; i < items; i++) {
          var x= x0 + r * Math.cos(2 * Math.PI * i / items)*j;
          var y = y0 + r * Math.sin(2 * Math.PI * i / items)*j;
          var key = banks[i+j-1].id
          coord[key]= {x: x, y: y}
      }
  }

  //add to nodes for first period and then keep allocation for the consecutive ones
  nodes = nodes.map((node) => {  
        node.x=coord[node.id].x; 
        node.y=coord[node.id].y; 
        node.fixed ={x: true, y: true};
       return node});

}

setOptions = () => { 
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
        //configure: {
        //  enabled: false,
          //defines what is being shown
          //filter:function (option, path) {
          //  if (path.indexOf('highlight') !== -1 || path.indexOf('hover') !== -1) {
          //    return false;
          //  }
          //  else if (option.indexOf('highlight') !== -1 || option.indexOf('hover') !== -1) {
          //    return false;
          //  }
          //  else if (path.indexOf('nodes') !== -1 && path.indexOf('color')!==-1) {
           //       return true;
          //  }
          //  else if (path.indexOf('nodes') !== -1 && path.indexOf('scaling')!==-1) {
          //        return true;
          //  }
          //  else return false;
          //}, 
          
          //where the configuration lives
          //container: document.getElementById('vis-config'),
        //  showButton: false},
        interaction: {
          dragNodes: false,
          selectConnectedEdges: true
        },
        edges: {
          color: {color:'lightgrey'},
          arrows: {to: {enabled: true}},
          smooth: {type: 'curvedCW',
          roundness: 0.4},
          scaling: {min: 0.01, max: 20}
        },
        nodes: {
          font: {color: 'white'},
          borderWidth: 0,
          color: {border: 'white', background: '#89DAC1', highlight: {background: '#FF991F'}},
          shape: 'circle',
          scaling: {min: 5, max: 50, label: {min: 5, max: 50}}
        },
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
      }
      
    return OPTIONS
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

    var nodesArray = objectToArray(network.body.data.nodes._data);
    var edgesArray = objectToArray(network.body.data.edges._data);
    nodesArray = nodesArray.map((node) => { node.color = {background: cols[node.sector]}; return node})
    network.setData({nodes: nodesArray, edges: edgesArray})
}

nodeColorsUniform = () => {
  var nodesArray = objectToArray(network.body.data.nodes._data);
  var edgesArray = objectToArray(network.body.data.edges._data);
  nodesArray = nodesArray.map((node) => { node.color = {background: 'darkgrey', highlight: 'black'}; return node});
  network.setData({nodes: nodesArray, edges: edgesArray});
}

edgeColorsByTrend = () => {
  var nodesArray = objectToArray(network.body.data.nodes._data);
  var edgesArray = objectToArray(network.body.data.edges._data);
  edgesArray=edgesArray.map((edge) => {edge.color = {color: COLORS[edge.trend], opacity: 0.2, highlight: COLORS[edge.trend]}; return edge});
  network.setData({nodes: nodesArray, edges: edgesArray});
}

edgeColorsUniform = () => {
  var nodesArray = objectToArray(network.body.data.nodes._data);
  var edgesArray = objectToArray(network.body.data.edges._data);
  edgesArray = edgesArray.map((edge) => { edge.color = {color: 'lightgrey', opacity: 0.2, highlight: '#FF991F'}; return edge})
  network.setData({nodes: nodesArray, edges: edgesArray})
}
 
  const BLURRED_LINK_OPACITY = 0.3
  const FOCUSED_LINK_OPACITY = 0.6