#!/usr/bin/python

from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug import secure_filename
import os
import glob
import csv
import json
import datetime
from operator import itemgetter
import re
import base64
from graph_data import *

#flask and file configuration
app = Flask(__name__)
app.secret_key = 'some_secret'
UPLOAD_FOLDER ='temp_data'
HISTORICAL_DATA_FOLDER = 'temp_data'
ALLOWED_EXTENSIONS = set(['csv'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#file title config (also allows for capitalised version)
edgeFileName = "matrix"
nodeFileName = "bank"

#in file reading config in graph_data

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def gettimestamp(f):
    thestring = f.filename
    timeformat = re.compile("20\d\d\d\d")
    result = timeformat.search(thestring)
    if result:
        return (result.string[result.start():result.end()])

def cleaned_input(file):
    error =''
    try:
        csv_input = csv.reader(file,delimiter='|')
        data=[]
        for idx,row in enumerate(csv_input):
                        for item in row:
                            item.replace('"','')
                        cleanedRow= row[0].split(figureSeparator)
                        if len(cleanedRow) == 1:
                            flash('Row values could not be separated')
                            return []
                        
                        if idx == 0:
                            keyArray = cleanedRow
                        else:
                            valueArray = cleanedRow
                            #check if values and keys agree
                            if len(valueArray) != len(keyArray):
                                error = 'Numbers of keys and values are not equal: In row ' + str(idx) + ' values ' + str(len(valueArray)) + ' keys ' + str(len(keyArray))
                            dictRow = {}
                            for idx1,value in enumerate(valueArray):
                                    dictRow[keyArray[idx1]] = value
                            #add_date(dictRow,edgeDates)
                            data.append(dictRow)

    except Exception:
        flash('Error in ' + file.name + ' '+ error)
        return []

    return data

@app.route('/', methods = ['GET','POST'])
def upload_file():

    #if a post request has been made load, check whether csv and save in temp_data
    if request.method =='POST':
        allFiles = request.files.getlist('file')
        
        #check valid files
        for f in allFiles:
            if f.filename=='':
                flash ('No selected file')
                return redirect(request.url)
            if not allowed_file(f.filename):
                flash(f.filename+ ' is not a csv file')
                return redirect(request.url)

        #1) filter by edges and nodes
        edgeFiles = [f for f in allFiles if edgeFileName in f.filename or edgeFileName.capitalize() in f.filename]
        nodeFiles = [f for f in allFiles if nodeFileName in f.filename or nodeFileName.capitalize() in f.filename]
        print("accepted files")
        for f in nodeFiles:
            print(f.filename)
        for f in edgeFiles:
            print(f.filename)

        if edgeFiles == [] or nodeFiles == []:
            flash('Failed to read in files')
            return redirect(request.url)

        #2) get dates
        edgeFileDates = [gettimestamp(f) for f in edgeFiles]
        nodeFileDates = [gettimestamp(f) for f in nodeFiles]       
    
        #3) read in
        edges=[]
        nodes=[]
        keys=[]
        for idx, f in enumerate(edgeFiles):
           #check secure file and get full path
            filename = secure_filename(f.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            f.save(os.path.join(UPLOAD_FOLDER, filename))
        
            #save content in edges and nodes 
            with open(filepath) as file:
                newEdges = cleaned_input(file)
                #check for empty data
                if newEdges == []: 
                    flash('Edge input for file ' + file.name + ' could not be read')
                    return redirect(request.url)
                for row in newEdges:
                    row = add_date(row,edgeFileDates[idx])
                edges = edges + newEdges
            os.remove(filepath)
   
        for idx, f in enumerate(nodeFiles):
            #check secure file and get full path
            filename = secure_filename(f.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            f.save(os.path.join(UPLOAD_FOLDER, filename))
            
            with open(filepath) as file:
                newNodes = cleaned_input(file)
                #check for empty data
                if newNodes == []: 
                    flash('Node input for file ' + file.name + ' could not be read')
                    return redirect(request.url)
                for row in newNodes:
                    row = add_date(row,nodeFileDates[idx])
                nodes = nodes + newNodes

            #save categories in keys 
            with open(filepath) as file:
                    reader = csv.DictReader(file,delimiter=figureSeparator)
                    #check whether the fieldnames have been separated successfully
                    
                    if len(reader.fieldnames)==1:
                        flash('Categories could not be separated. Using ' + figureSeparator + ' as separator?')
                        return redirect(request.url)
                    
                    #if first file read in keys, for following files check the keys are right 
                    if idx == 0:
                        keys = reader.fieldnames
                    else:
                        if keys != reader.fieldnames: 
                            keyStr = ''.join(keys)
                            compKeyStr = ''.join(reader.fieldnames)
                            flash('Column headers in Bank file '+ str(idx) +' differ from first file. The keys for the first file are:\n'\
                            + keyStr + '.\nThe keys for this file are:\n' + compKeyStr) 
        
            os.remove(filepath)

        #add date categories to keys
        keys.append('date')
        keys.append('dateID')
        #check whether there is a node color provided
        customNodeColor = False
        if colorKey in keys: 
            customNodeColor = True

        #get the categories for node values and add no value (for default setting)
        categoryKeys=set_categories(nodes,keys)
        categoryKeys.append('no value')

        #put together array of dictionaries
        edges=transform_edges(edges)
        nodes=transform_nodes(nodes,keys)

        if edges == []:
            flash('Failed to read edge data')
            return redirect(request.url)
        if nodes == []:
            flash('Failed to read node data')
            return redirect(request.url)

        #get all dates
        unsortedDates=[]
        unique=[]
        for node in nodes:
            if node['dateID'] not in unique:
                unsortedDates.append({'date': node['date'], 'dateID': node['dateID']})
            unique.append(node['dateID'])
        dates = sorted(unsortedDates, key=itemgetter('dateID')) 

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

        #adding trend information to edges
        edges = trend_edges(edges,dates)
        #package output as json files
        edgesJSON = []
        nodesJSON = []
        datesJSON = []
        keysJSON = []
        edgesJSON = json.dumps(edges)
        nodesJSON = json.dumps(nodes)
        datesJSON = json.dumps(dates)
        sectorsJSON = json.dumps(sectors)
        banksJSON = json.dumps(banks)
        categoryKeysJSON = json.dumps(categoryKeys)
        nodeColorJSON = json.dumps(customNodeColor)
        
        if edges == -1:
            flash('No valid edge data found, please select another file')
            return render_template('upload.html')
        if nodes == -1:
            flash('No valid node data found, please select another file')  

        return render_template('index.html', edges=edgesJSON, nodes=nodesJSON, 
        dates=datesJSON, sectors=sectorsJSON, banks=banksJSON,\
        categoryKeys=categoryKeysJSON, nodeColor=nodeColorJSON)
     
    return render_template('upload.html')

if __name__ == '__main__':
   app.run(debug = True)