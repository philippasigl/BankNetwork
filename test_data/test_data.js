const edges = [{"from": "1", "to": "2", "absValue": 572000000.0, "date": "2017/1", "dateID": 24205, "trend": "unchanged", "trendValue": 0}, {"from": "1", "to": "3", "absValue": 25000000.0, "date": "2017/1", "dateID": 24205, "trend": "unchanged", "trendValue": 0}, {"from": "1", "to": "4", "absValue": 95000000.0, "date": "2017/1", "dateID": 24205, "trend": "unchanged", "trendValue": 0}, {"from": "1", "to": "6", "absValue": 4762000000.0, "date": "2017/1", "dateID": 24205, "trend": "unchanged", "trendValue": 0}]

const nodes = [{"id": "1", "name": "Bank 1", "sector": "Sparkasse", "date": "2017/1", "dateID": 24205, "customColor": "blue", "Kapital": 59350.019816, "RWA": 150000000000.0, "Bilanzsumme": 625000000000.0, "PD": 0.002406009}, {"id": "2", "name": "Bank 2", "sector": "Kreditbanken", "date": "2017/1", "dateID": 24205, "customColor": "blue", "Kapital": 31163.445585, "RWA": 234000000000.0, "Bilanzsumme": 780000000000.0, "PD": 0.000475302}, {"id": "3", "name": "Bank 3", "sector": "Kreditbanken", "date": "2017/1", "dateID": 24205, "customColor": "blue", "Kapital": 5552.6152217, "RWA": 72000000000.0, "Bilanzsumme": 180000000000.0, "PD": 0.000165054},
{"id": "10", "name": "NullNummer", "sector": "Kreditbanken", "date": "2017/1", "dateID": 24205, "customColor": "blue", "Kapital": 0, "RWA": 0, "Bilanzsumme": 0, "PD": 0}]

const sectors = [{"sector": "Kreditbanken"}, {"sector": "Sparkassen"}]
const banks = [{"id": "1"}, {"id": "2"}, {"id": "3"}, {"id": "4"}, {"id": "5"}, {"id": "6"}, {"id": "7"}, {"id": "8"}, {"id": "9"}, {"id": "10"}, {"id": "11"}, {"id": "12"}, {"id": "13"}, {"id": "14"}, {"id": "15"}, {"id": "16"}, {"id": "17"}, {"id": "18"}, {"id": "19"}, {"id": "20"}] 

const categoryKeys = ["Kapital", "RWA", "Bilanzsumme", "PD", "no value"] 

const dates = [{"date": "2017/1", "dateID": 24205}, {"date": "2016/6", "dateID": 24201}]
const nodeColor = true

exports.edges = edges
exports.nodes = nodes
exports.sectors = sectors
exports.banks = banks
exports.categoryKeys = categoryKeys
exports.nodeColor = nodeColor
exports.dates = dates