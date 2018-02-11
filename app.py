from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug import secure_filename
import os
import csv
import json
import datetime
import re
from graph_data import *

app = Flask(__name__)
app.secret_key = 'some_secret'

UPLOAD_FOLDER ='dummy_data'
HISTORICAL_DATA_FOLDER = 'temp_data'
ALLOWED_EXTENSIONS = set(['csv'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def gettimestamp(f):
    thestring = f.filename
    timeformat = re.compile("20\d\d\d\d")
    result = timeformat.search(thestring)
    if result:
        return (result.string[result.start():result.end()])

@app.route('/', methods = ['GET','POST'])
def upload_file():

    #if a post request has been made load, check whether csv and save in temp_data
    if request.method =='POST':
        allFiles = request.files.getlist('file')

        #1) filter by edges and nodes
        edgeFiles = [f for f in allFiles if "Matrix" in f.filename]
        nodeFiles = [f for f in allFiles if "Bank" in f.filename]
        
        #2) get dates
        edgeFileDates = [gettimestamp(f) for f in edgeFiles]
        nodeFileDates = [gettimestamp(f) for f in nodeFiles]       
    
        #3) read in
        edges=[]
        nodes=[]
        for idx, f in enumerate(edgeFiles):
           #check secure file and get full path
            filename = secure_filename(f.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)

            #run checks
            if filename=='':
                flash ('No selected file')
                return redirect(request.url)
            if not allowed_file(f.filename):
                flash('Not a csv file')
                return redirect(request.url)

            #if checks are ok, save file
            #f.save(os.path.join(UPLOAD_FOLDER, filename))

            #save content in edges and nodes 
            with open(filepath) as file:
                reader = csv.DictReader(file)
                for row in reader:
                    add_date(row,edgeFileDates[idx])
                    edges.append(row) 

            #remove the temporary file
            #os.remove(filepath)

        #ensure numeric edges only           
        check_edges(edges)
   
        for idx, f in enumerate(nodeFiles):
            #check secure file and get full path
            filename = secure_filename(f.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)

            #run checks
            if filename=='':
                flash ('No selected file')
                return redirect(request.url)
            if not allowed_file(f.filename):
                flash('Not a csv file')
                return redirect(request.url)

            with open(filepath) as file:
                reader = csv.DictReader(file)
                for row in reader:
                     add_date(row,nodeFileDates[idx])
                     nodes.append(row)

                #save categories in keys 
                #keys=[]
                #with open(filepath) as file:    
                #    reader = csv.DictReader(file)
                #    keys = reader.fieldnames

            #remove the temporary file
            #os.remove(filepath)
        
        #per current format
        sectorIdx=2
        nameIdx=1

        #put together array of dictionaries
        edges=transform_edges(edges)
        nodes=transform_nodes(nodes,sectorIdx,nameIdx)

        #adding trend information to edges
        trend_edges(edges)

        #get all dates
        times=[]
        unique=[]
        for node in nodes:
            if node['dateID'] not in unique:
                times.append({'date': node['date'], 'dateID': node['dateID']})
            unique.append(node['dateID'])
        
        #get all sectors
        sectors=[]
        unique=[]
        for node in nodes:
            if node['sector'] not in unique:
                sectors.append({'sector': node['sector']})
            unique.append(node['sector'])
        sectors.append({'sector': 'all'})

        #get all banks
        banks=[]
        unique=[]
        for node in nodes:
            if node['id'] not in unique:
                banks.append({'id': node['id']})
            unique.append(node['id'])

        #package output as json files
        edgesJSON = []
        nodesJSON = []
        datesJSON = []
        edgesJSON = json.dumps(edges)
        nodesJSON = json.dumps(nodes)
        datesJSON = json.dumps(times)
        sectorsJSON = json.dumps(sectors)
        banksJSON = json.dumps(banks)
        
        if edges == -1:
            flash('No valid edge data found, please select another file')
            return render_template('upload.html')
        if nodes == -1:
            flash('No valid node data found, please select another file')  

        #get historical network
        hist_network={}
        with open('temp_data/historical_network.json') as f:
            hist_network = json.load(f)
        hist_networkJSON = json.dumps(hist_network)
     
        return render_template('index.html', edges=edgesJSON, nodes=nodesJSON, 
        dates=datesJSON, hist_network=hist_networkJSON, sectors=sectorsJSON, banks=banksJSON)
     
    return render_template('upload.html')

@app.route('/save', methods = ['POST'])
def save():
    graph = request.get_json()
    with open('temp_data/historical_network.json','w') as f:
        json.dump(graph,f)
    return render_template('upload.html')

if __name__ == '__main__':
   app.run(debug = True)