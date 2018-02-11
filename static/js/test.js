var network
var container
var storage


init = () => {
    container = document.getElementById('network');
    draw();
}

draw = () => {
    var options = {layout:{randomSeed: 2}}
    var nodes = new vis.DataSet(options)
    var edges= new vis.DataSet(options)

    edges.add([{from: 1, to: 2, value: 10}])
    nodes.add([{id: 1, label: "tito", value: 20}, {id: 2, label: "nico", value: 10}])

    data = {nodes: nodes, edges: edges}
    network = new vis.Network(container,data,options);

    storage = network.getPositions()
    console.log(storage)
    console.log(network)
  
    var newNodes = new vis.DataSet(options)
    var newEdges= new vis.DataSet(options)

    newEdges.add([{from: 1, to: 2, value: 100}])
    newNodes.add([{id: 1, label: "tito", value: 100}, {id: 2, label: "nic", value: 3}, {id: 3, label: "this", value: 2}])

    newData = {nodes: newNodes, edges: newEdges}
    network.setData(newData)
    network.redraw()
    
    //network.redraw()
    console.log(network)
    //console.log(network.canvasToDOM({x: 40, y: 20}))
    //network.body.data.nodes.update({id: 1, x: 40, y: 20, fixed: {x: true, y: true}})
    //console.log(network.getPositions()["1"].x)
}

init();