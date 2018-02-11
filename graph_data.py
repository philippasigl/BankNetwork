import csv
import json
from flask import flash

def add_date(row,dateString):
    year=dateString[0:4]

    if dateString[4]== '0':
        month=dateString[5]
    else:
        month=dateString[4:6]
    
    formattedDate=year+'/'+month
    dateID=int(year)*12+int(month)

    row['date']=formattedDate
    row['dateID']=dateID

    return

def check_edges(edges):
    for row in edges:
        #check whether values numeric
        values=list(row.values())[1:-2]
        for val in values:
            try:
                float(val)
            except ValueError:
                flash('non numeric values found')
                return
    return

def check_nodes(nodes):
    #check for unique ids
    ids=[]
    for row in nodes:
        val=list(row.values())[0]
        ids.append(val)
    setIDs=set(ids)
    if len(list(setIDs))<len(ids):
        flash('no unique node ids')
    return

def transform_nodes(nodes,sectorIdx,nameIdx):
   
    transformedNodes=[]

    for row in nodes:
        rowValues=list(row.values())
        id=str(rowValues[0])
        if sectorIdx is not -1:
            sector=str(rowValues[sectorIdx])
        else:
            sector='none'
        if nameIdx is not -1:
            name=str(rowValues[nameIdx])
        else:
            name=id
        #don't add unspecified ids
        if id is not '':
            #assume cet, rwa and balance sheet figures listed after name and sector
            idx=max(nameIdx,sectorIdx)+1
            #if neither name nor sector are present, idx should be 1 as ids always have to be there
            if idx==-1:
                idx=1
            #define respective values
            cet=float(rowValues[idx])
            rwa=float(rowValues[idx+1])
            balanceSheet=float(rowValues[idx+2])
            pd=float(rowValues[idx+3])
            transformedNodes.append({'id': id, 'label': name, 'sector': sector, 'cet': cet, 'rwa': rwa, 'balanceSheet': balanceSheet, 'pd': pd, 'date': row['date'], 'dateID': row['dateID']}) 
    
    return transformedNodes

def transform_edges(edges):

    transformedEdges=[]

    for row in edges:
        rowValues=list(row.values())
        rowKeys=list(row.keys())
        #source is the 0 column
        source=rowValues[0]
        idx=1
        #skipping over the first and last column
        while idx < len(rowKeys)-3:
            #replacing keys for banks to match those in the columns
            if '_' in rowKeys[idx]:
                target = rowKeys[idx][1:]
            else:
                target = rowKeys[idx]
            #only add edges not connecting node to itself
            if source != target and float(rowValues[idx]) != 0: 
                transformedEdges.append({'from': source, 'to': target, 'value': float(rowValues[idx])/1000000000, 'date': row['date'], 'dateID': row['dateID']})
            idx+=1

    return transformedEdges

def trend_edges(edges):
    for row1 in edges: 
        comparators = [row for row in edges if row1['from'] == row['from'] and row1['to'] == row['to']]
        sortedComps = sorted(comparators, key=lambda k: k['dateID']) 
        #if there was no connection before, the value was most likely 0. Hence this would represent an increase
        if len(sortedComps)==1:
            row1['trend']= 'increased'
        #unchanged
        elif sortedComps[-1]['value']==sortedComps[-2]['value']:
            row1['trend']='unchanged'
        #increase
        elif sortedComps[-1]['value']>sortedComps[-2]['value']:
            row1['trend']= 'increased'
        #decline
        elif sortedComps[-1]['value']<sortedComps[-2]['value']:
            row1['trend']= 'decreased'
    return