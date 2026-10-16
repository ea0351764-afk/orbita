from flask import Flask
from pymongo import MongoClient 

app = Flask(__name__)

client= MongoClient("mongodb+srv://ea0351764_db_user:r8rJd6pkQtJ8NUqd@cluster0.hwibald.mongodb.net/")
db = client ["ea1"]
collection = db["usuarios"]