import unittest
import os
import sys
#from io import BytesIO
#from flask import request, flash

sys.path.append('..')
from app import *

#test data
filename = 'test_matrix.csv'
filepath = os.path.join('test_data', filename)
res_cleaned_input = [{'GeberNr': '1', '_1': '0', '_2': '323'},{'GeberNr': '2', '_1': '200', '_2': '0'}]

class FakeFile():
    def __init__(self):
        self.filename = ''

f = FakeFile()
f.filename='matrix_201401.csv'

#test class
class Test_app_methods(unittest.TestCase):

    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.context = self.app.app_context()
        render_template = False
    
    def tearDown(self):
        pass

    def test_upload(self):
        response = self.client.get('/')
        assert response.status_code==200

    def test_cleaned_input(self):
        #with self.context:
        with open(filepath) as file:
            self.assertEqual(cleaned_input(file),res_cleaned_input)

    def test_allowed_file(self):
        self.assertEqual(allowed_file('test.txt'),False)
        self.assertEqual(allowed_file('test.csv'),True)
    
    def test_gettimestamp(self):
        with open(filepath) as file:
            self.assertEqual(gettimestamp(f),'201401')

if __name__ == '__main__':
    unittest.main()