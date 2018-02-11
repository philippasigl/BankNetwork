var network
var container
var exportArea
var exportButton
var selectedEdgesIDs
//boolean for the history switch
var historyIsOn = false
var nodeColorIsOn = true
var edgeColorIsOn = false
//saving the non historical positions, so switch can be turned off
var nohist_network
var fullNet
var translation
var date
var _sector
//var date

init = () => {
    container = document.getElementById('network');
    exportButton = document.getElementById('export_button');
    date = dates[dates.length-1].dateID
    construct_network();
    draw();
}

draw = () => { 
    if (typeof date !== 'undefined')  {
       document.getElementById("hist_network_select").checked = false;
       historyIsOn = false;
    }
    
    //subset nodes and edges by date; required to prevent duplicate id error
    var data = select_date();

    //options are defined in options.js 
    var options = setOptions();
    //draw current network
    network = new vis.Network(container, data, options);

    //set options
    if (historyIsOn) set_history();

    if (nodeColorIsOn) set_node_color();
    else unset_node_color();
    
    if (edgeColorIsOn) set_edge_color();
    else unset_edge_color();

    //set highlight options
    setHighlight();
    unsetHighlight();
}

construct_network = () => {
    //set edges labels and titles
    edges.map((edge) => {edge.title="from: "+ edge.from+" to "+ edge.to + ", value: " + edge.value ; edge.label=edge.value})

    //set node sizes
    nodes=nodes.map((node) => {node.value=node.balanceSheet/1000000000; node.title=node.value; return node})

    //set node positions as per options.js   
    circleCoord();
}

switch_date = () => {
    date = document.getElementById('date').value
    draw();
}

select_date = () => {
    var selectNodes = nodes.filter((node) => node.dateID == date)
    var selectEdges = edges.filter((edge) => edge.dateID == date)
    var data = {nodes: selectNodes, edges: selectEdges}

    return data
}

switch_history = () => {
    if (historyIsOn) {
        historyIsOn = false;
        unset_history();
    }
    else {
        historyIsOn = true;
        set_history();
    }
    network.redraw();
}

set_history = () => {
    nohist_network = network.getPositions();
    var keys = network.body.nodeIndices
    //to ensure nodes are not rearranged
    network.physics.stabilized = false
    
    //set nodes and edges to respective values
    keys.map((key,idx) => {
        network.body.nodes[key].x = hist_network[idx].x;
        network.body.nodes[key].y = hist_network[idx].y;
    })
}

unset_history = () => {
    var keys = network.body.nodeIndices
    //to ensure nodes are not rearranged
    network.physics.stabilized = false
    //set nodes and edges to respective values
    keys.map((key,idx) => {
        network.body.nodes[key].x = nohist_network[key].x;
        network.body.nodes[key].y = nohist_network[key].y;
    })    
}

switch_node_color  = () => {
if (nodeColorIsOn) {
    nodeColorIsOn = false;
    unset_node_color();
}
else {
    nodeColorIsOn = true;
    set_node_color();
}
network.redraw();
}

set_node_color = () => {
    nodeColorsBySector()
}

unset_node_color = () => {
    nodeColorsUniform()
}

switch_edge_color  = () => {
if (edgeColorIsOn) {
    edgeColorIsOn = false;
    unset_edge_color();
}
else {
    edgeColorIsOn = true;
    set_edge_color();
}
console.log("edge set")
network.redraw();
}

set_edge_color = () => {
    edgeColorsByTrend()
}

unset_edge_color = () => {
    edgeColorsUniform()
}

exportNetwork = () => {
    var nodes = objectToArray(network.getPositions())
    str = (JSON.stringify(nodes))
    saveNetwork(str)
}

objectToArray = (obj) => {
    var arr = []
    Object.keys(obj).map((key) => {
        obj[key].id = key
        arr.push(obj[key])
    }
    )
    return arr
}

saveNetwork = (exportValue) => { 
    fetch('http://127.0.0.1:5000/save', {
    method: 'POST',
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    },
    body: exportValue
    })
}

clearCanvas= () => {
    exportArea.value = "";
}

selectNodesBySector = () => {
    data = select_date()

    _sector = document.getElementById('sector').value
    if (_sector == 'all') {
        network.setData(data)
    }
    else {
        var filteredNodes = data.nodes.filter((node) => node.sector == _sector);
        var filteredNodesIDs=filteredNodes.map((node) => {return node.id} )
        var filteredEdges = data.edges.filter((edge) => filteredNodesIDs.indexOf(edge.to) != -1 && filteredNodesIDs.indexOf(edge.from) != -1)
    
        network.setData({nodes: filteredNodes, edges: filteredEdges})
    }
    if (historyIsOn) set_history();

    if (nodeColorIsOn) set_node_color();
    else unset_node_color();
    
    if (edgeColorIsOn) set_edge_color();
    else unset_edge_color();
    
} 



setHighlight = () => network.on("selectNode", function () {
    selectedEdgeIDs = network.getSelectedEdges()
    selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.opacity=0.8} )
    if (edgeColorIsOn == false) {
        selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.opacity=1, network.body.edges[id].options.color.highlight= '#FF991F'})
    }
});

unsetHighlight = () => network.on("deselectNode", function () {
    selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.opacity=0.3})
    selectedEdgeIDs=[]
    selectedEdgeIDs.map((id) => {network.body.edges[id].options.color.highlight=undefined})
});

init();

