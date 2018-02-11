
(function() {
//check whether valid data
if (sankey_values === -1) { 
    return;
}

//add all nodes from the source list
nodes=[]
for (i=0;i<sankey_values.length;i++) {
    row={};
    row.name = sankey_values[i].source.concat("s");
    nodes.push(row);
}

//add all nodes from the target list
for (i=0;i<sankey_values.length;i++) {
    row={};
    row.name = sankey_values[i].target.concat("t");
    nodes.push(row);
}

//filter for unique nodes
filteredNodes = [];
nodes.filter(function(item){
    var i = filteredNodes.findIndex(x => x.name == item.name);
    if(i <= -1)
        filteredNodes.push({name: item.name});
});

//replace node names with idx in values and create data array
d=[]
for (i=0;i<sankey_values.length;i++) {
    var source = filteredNodes.findIndex(x => x.name == sankey_values[i].source.concat("s") )
    var target = filteredNodes.findIndex(x => x.name == sankey_values[i].target.concat("t") )
    row={};
    row.source = source;
    row.target = target;
    row.value = sankey_values[i].value;
    if (typeof sankey_values[i].time !== undefined) {
        row.time = sankey_values[i].time;
    }
    d.push(row);
}

return;
}) ();