import unittest
import os
import sys

sys.path.append('..')
from graph_data import *

#test data
values = ['2,3','1,1']
res_fix_decimals = ['2.3','1.1']

row1 = {'id': 'id'}
row2 = {'id': 'id'}
dateString1 = '201712'
dateString2 = '201701'
res_add_date1 = {'id': 'id', 'date': '2017/12', 'dateID': 24216}
res_add_date2 = {'id': 'id', 'date': '2017/1', 'dateID': 24205} 

nodes = [
    {'GeberNr': '19', 'Bankname': 'Bank 19', 'Bankengruppe': 'Andere', 'Kapital': '1381,1210723', 'RWA': '140000', 'Bilanzsumme': '43000000000', 'PD': '0,002089543', 'Color': 'blue', 'date': '2017/1', 'dateID': 24205}, 
    {'GeberNr': '20', 'Bankname': 'Bank 20', 'Bankengruppe': 'Andere', 'Kapital': '1000', 'RWA': '11000000', 'Bilanzsumme': '34000000000', 'PD': '0,000475302', 'Color': 'blue', 'date': '2017/1', 'dateID': 24205}, 
    {'GeberNr': '21', 'Bankname': 'Bank 21', 'Bankengruppe': 'Sparkassen', 'Kapital': '0', 'RWA': '0', 'Bilanzsumme': '0', 'PD': '0', 'Color': 'blue', 'date': '2017/1', 'dateID': 24205}
]
keys = ['GeberNr', 'Bankname', 'Bankengruppe', 'Kapital', 'RWA', 'Bilanzsumme', 'PD', 'Color', 'date', 'dateID']
res_set_categories = ['Kapital', 'RWA', 'Bilanzsumme','PD']

inputRowRaw = {'GeberNr': '20', 'Bankname': 'Bank 20', 'Bankengruppe': 'Andere', 'Kapital': '1000', 'RWA': '11000000', 'Bilanzsumme': '34000000000', 'PD': '0,000475302', 'Color': 'blue', 'date': '2017/1', 'dateID': 24205}
keys = ['GeberNr', 'Bankname', 'Bankengruppe', 'Kapital', 'RWA', 'Bilanzsumme', 'PD', 'Color', 'date', 'dateID']
categoryKeys = ['Kapital', 'RWA', 'Bilanzsumme', 'PD']
res_set_row = {'id': '20', 'name': 'Bank 20', 'sector': 'Andere', 'date': '2017/1', 'dateID': 24205, 'customColor': 'blue', 'Kapital': 1000, 'RWA': 11000000, 'Bilanzsumme': 34000000000, 'PD': 0.000475302}

zeroRow = {'id': '20', 'name': 'Bank 20', 'sector': 'Andere', 'date': '2017/1', 'dateID': 24205, 'customColor': 'blue', 'Kapital': 0, 'RWA': 0, 'Bilanzsumme': 0, 'PD': 0}

nodes2 =  [{'GeberNr': '20', 'Bankname': 'Bank 20', 'Bankengruppe': 'Andere', 'Kapital': '1381,1210723', 'RWA': '140000', 'Bilanzsumme': '43000000000', 'PD': '0,002089543', 'Color': 'blue', 'date': '2017/1', 'dateID': 24205}, 
{'GeberNr': '20', 'Bankname': 'Bank 20', 'Bankengruppe': 'Andere', 'Kapital': 0, 'RWA': 0, 'Bilanzsumme': 0, 'PD': 0, 'Color': 'blue', 'date': '2017/1', 'dateID': 24205}]
res_nodes2 = [{'id': '20', 'name': 'Bank 20', 'sector': 'Andere', 'date': '2017/1', 'dateID': 24205, 'customColor': 'blue', 'Kapital': 1381.1210723, 'RWA': 140000, 'Bilanzsumme': 43000000000, 'PD': 0.002089543}]

edges = [{'GeberNr': '1', '_1': '0', '_2': '6292,000000', '_3': '25000000', '_4': '85500000', '_5': '0', '_6': '4285800000', '_7': '23100000', '_8': '91800000', '_9': '155000000', '_10': '660600000', '_11': '122400000', '_12': '300600000', '_13': '590700000', '_14': '4500000', '_15': '603000000', '_16': '499400000', '_17': '121000000', '_18': '1227600000', '_19': '0', '_20': '950000000', 'date': '2016/9', 'dateID': 24201}]
res_edges = [{'from': '1', 'to': '2', 'absValue': 6292.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '3', 'absValue': 25000000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '4', 'absValue': 85500000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '6', 'absValue': 4285800000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '7', 'absValue': 23100000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '8', 'absValue': 91800000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '9', 'absValue': 155000000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '10', 'absValue': 660600000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '11', 'absValue': 122400000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '12', 'absValue': 300600000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '13', 'absValue': 590700000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '14', 'absValue': 4500000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '15', 'absValue': 603000000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '16', 'absValue': 499400000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '17', 'absValue': 121000000.0, 'date': '2016/9', 'dateID': 24201}, {'from': '1', 'to': '18', 'absValue': 1227600000.0, 'date': '2016/9', 'dateID': 24201}]

edges2 = [{'from': '1', 'to': '2', 'absValue': 6292.0, 'date': '2016/9', 'dateID': 24201},
{'from': '1', 'to': '2', 'absValue': 1000.0, 'date': '2017/1', 'dateID': 24205},
{'from': '1', 'to': '2', 'absValue': 7000.0, 'date': '2017/2', 'dateID': 24206}
]
res_trend_edges = [{'from': '1', 'to': '2', 'absValue': 6292.0, 'date': '2016/9', 'dateID': 24201, 'trend': 'unchanged', 'trendValue': 0},
{'from': '1', 'to': '2', 'absValue': 1000.0, 'date': '2017/1', 'dateID': 24205, 'trend': 'decreased', 'trendValue': 5292},
{'from': '1', 'to': '2', 'absValue': 7000.0, 'date': '2017/2', 'dateID': 24206, 'trend': 'increased', 'trendValue': 6000}
]
times = [{'date': '2016/9','dateID': 24201},{'date': '2017/1','dateID': 24205},{'date': '2017/2','dateID': 24206}]
#test class
class Test_graph_methods(unittest.TestCase):

    def test_fix_decimals(self):
        self.assertEqual(fix_decimals(values),res_fix_decimals)
    
    def test_add_date(self):
        self.assertEqual(add_date(row1,dateString1),res_add_date1)
        self.assertEqual(add_date(row2,dateString2),res_add_date2)

    def test_set_categories(self):
        self.assertEqual(set_categories(nodes,keys),res_set_categories)

    def test_set_row(self):
        self.assertEqual(set_row(inputRowRaw,keys,categoryKeys),res_set_row)
    
    def test_check_forZeros(self):
        self.assertEqual(check_forZeros(zeroRow,categoryKeys),True)

    def test_transform_nodes(self):
        self.assertEqual(transform_nodes(nodes2,keys),res_nodes2)

    def test_transform_edges(self):
        self.assertEqual(transform_edges(edges),res_edges)
    
    def test_trend_edges(self):
        self.maxDiff=None
        self.assertEqual(trend_edges(edges2,times),res_trend_edges)

if __name__ == '__main__':
    unittest.main()