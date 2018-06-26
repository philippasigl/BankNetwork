#!/usr/bin/python

import csv
import json
from flask import flash, redirect, request

#file config
figureSeparator = ";"
decimalSeparator = ","
sectorKey = 'Bankengruppe'
nameKey = 'Bankname'
colorKey = 'Color'
scalingForValues = 1

#takes a list of values as input, replaces the decimal Separator with a dot, returns an array
def fix_decimals(values):
    dotValues=[]
    for val in values:
        val = str(val)
        val = val.replace(decimalSeparator,".")
        dotValues.append(val)
    return dotValues

#takes a row and a date string of the format yyyymm and returns row with row.date and row.dateID
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
    return row

#takes an array of node dictionaries (e.g. [{'GeberNr': '19','Bankname': 'Bank1','PD': 1, 'RWA': 0.4, ...},{'GeberNr': '19','Bankname': 'Bank1','PD': 1, 'RWA': 0.4,...}])
#and keys (e.g. ['GeberNr','BankName'])
#and returns categories with numerical values (e.g. ['PD','RWA'])
def set_categories(nodes,keys):
    #find first column with numeric values
    row = nodes[0]
    valueList = list(row.values())[1:]
    #convert to decimals so check for float conversion can work
    valueList = fix_decimals(valueList)
    #finds indices of all numeric categories beyond the id column
    numericCategories = []
    for idx, val in enumerate(valueList):
        #offset +1 for key as the valueList doesn't contain first id column
        if keys[idx+1] is not 'date' and keys[idx+1] is not 'dateID':
            try: 
                result = float(val)
                numericCategories.append(idx+1)
            except ValueError:
                continue
    #adds corresponding keys to the categoryKey arrays
    categoryKeys = []
    for cat in numericCategories:
        categoryKeys.append(keys[cat])
    return categoryKeys

#takes a dict for a row, array of keys, array of categoryKeys, i.e. the numerical keys
#returns  
def set_row(inputRowRaw,keys,categoryKeys):
    #to list
    inputRow=list(inputRowRaw.values())

    #set id
    id=str(inputRow[0])

    #set sector
    #sectorKey = 'Bankengruppe'
    if sectorKey in keys:
        sector=str(inputRow[keys.index(sectorKey)])
    else:
        sector='none'

    #set name
    if nameKey in keys:
        name=str(inputRow[keys.index(nameKey)])
    else:
        name=id
    
    #create output
    outputRow={}
    outputRow['id']=id
    outputRow['name']=name
    outputRow['sector']=sector
    outputRow['date']=inputRowRaw['date']
    outputRow['dateID']=inputRowRaw['dateID']
    #add color if provided
    if colorKey in keys:
        outputRow['customColor']=inputRow[keys.index(colorKey)]

    #adding categories
    for key in categoryKeys:
        val = str(inputRowRaw[key])
        val = val.replace(decimalSeparator,".",1)
        try:
            outputRow[key]=float(val)/scalingForValues
        except ValueError or TypeError:
            outputRow[key]=0
    
    return outputRow

#checks whether all numerical values for a node are 0
#takes dict for node and array for categoryKeys and returns Boolean
def check_forZeros(row,categoryKeys):
    allZeros=True
    for key in categoryKeys:
        if (row[key]>0):
            allZeros=False
            return allZeros
    return allZeros

#takes array of nodes, and array of keys, transforms nodes according to set_row, skips all invalid ones and returns new node array
def transform_nodes(nodes,keys):
    categoryKeys = set_categories(nodes,keys)
    transformedNodes=[]    
    for idx, row in enumerate(nodes):
        outputRow = set_row(row,keys,categoryKeys)
        allZeros = check_forZeros(outputRow,categoryKeys)
        #don't add unspecified ids or nodes for which all numeric values = 0
        if outputRow['id'] is not '' and allZeros is False:
            transformedNodes.append(outputRow)
    return transformedNodes

def transform_edges(edges):

    transformedEdges=[]

    for row in edges:
        rowValues=list(row.values())
        rowValues=fix_decimals(rowValues)
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
            try:
                float(rowValues[idx])
            except ValueError:
                flash('Non numeric value found in '+ str(rowValues))
                return []
            if source != target and float(rowValues[idx]) != 0: 
                transformedEdges.append({'from': source, 'to': target, 'absValue': float(rowValues[idx])/scalingForValues, 'date': row['date'], 'dateID': row['dateID']})
            idx+=1

    return transformedEdges

#takes dict edge (e.g. {'from': '20', 'to': '18', 'absValue': 368000000.0, 'date': '2017/1', 'dateID': 24205})
# and times dict (e.g. {'date': '2017/1', 'dateID': 24205}) and adds trend and trend value
#returns new edges
def trend_edges(edges,times):
    #find first Period
    firstPeriod=times[0]['dateID']
    for row in times:
        if row['dateID']<firstPeriod:
            firstPeriod=row['dateID']
    
    for row1 in edges: 
        comparators = [row for row in edges if row1['from'] == row['from'] and row1['to'] == row['to']]
        sortedComps = sorted(comparators, key=lambda k: k['dateID']) 
        startingPoint = sortedComps.index(row1)
        #prior element first, then current element
        currentComps = sortedComps[startingPoint-1:startingPoint+1]
        #for first period, set unchanged values and no changes
        if row1['dateID']==firstPeriod:
            row1['trend']='unchanged'
            row1['trendValue']=0
        elif len(currentComps)==0:
            row1['trend']= 'increased'
            row1['trendValue']=0
        #if there was no connection before, the value was most likely 0. Hence this would represent an increase
        #[-1] is the last element
        elif len(currentComps)==1:
            row1['trend']= 'increased'
            row1['trendValue']=currentComps[0]['absValue']
        #unchanged
        elif currentComps[-2]['absValue']==currentComps[-1]['absValue']:
            row1['trend']='unchanged'
            row1['trendValue']=0
        #increase
        elif currentComps[-2]['absValue']<currentComps[-1]['absValue']:
            row1['trend']= 'increased'
            row1['trendValue']=int(currentComps[-1]['absValue']-currentComps[-2]['absValue'])
        #decline
        elif currentComps[-2]['absValue']>currentComps[-1]['absValue']:
            row1['trend']= 'decreased'
            row1['trendValue']=int(currentComps[-2]['absValue']-currentComps[-1]['absValue'])

    return edges