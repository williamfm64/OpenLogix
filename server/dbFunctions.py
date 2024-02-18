from pymongo import MongoClient

connection_string = "mongodb://localhost:27017/"
client = MongoClient(connection_string)
db_connection = client["mydb"]

def dbInput(jsonFile, flag):
    if flag == "salvar":
        collection = db_connection.get_collection("myGraphics")
    elif flag == "cadastroUsuario":
        collection = db_connection.get_collection("myUsers")
    elif flag == "newScreen":
        collection = db_connection.get_collection("myScreens")
    collection.insert_one(jsonFile)

def dbSearch(searchFilter):
    collection = db_connection.get_collection("myGraphics")
    result = collection.find_one(searchFilter, { "_id": 0})
    return result

def dbSearchScreen(searchFilter):
    collection = db_connection.get_collection("myScreens")
    result = collection.find_one(searchFilter, { "_id": 0})
    return result

def dbFindUser(searchFilter):
    collection = db_connection.get_collection("myUsers")
    result = collection.find_one(searchFilter)
    return result

def dbSearchMany(searchFilter):
    collection = db_connection.get_collection("myGraphics")
    result = collection.find(searchFilter)

    response = []
    for elem in result: 
        response.append(elem)

    return response

def dbSearchManyScreens(searchFilter):
    collection = db_connection.get_collection("myScreens")
    result = collection.find(searchFilter)

    response = []
    for elem in result: 
        response.append(elem)

    return response

def dbUpdateOne(id, data, flag):
    if flag == "grafico":
        collection = db_connection.get_collection("myGraphics")
    elif flag == "user":
        collection = db_connection.get_collection("myUsers")
    elif flag == "screen":
        collection = db_connection.get_collection("myScreens")
    result = collection.update_one(id, data)

    return result

def dbUpdateMany(updateFilter, data, flag):
    if flag == "grafico":
        collection = db_connection.get_collection("myGraphics")
    result = collection.update_many(updateFilter, data)

    return result

def dbDelete(documento_id, flag):
    if flag == "grafico":
        collection = db_connection.get_collection("myGraphics")
    elif flag == "screen":
        collection = db_connection.get_collection("myScreens")
    result = collection.delete_one(documento_id)

    return result

def dbDeleteMany(deleteFilter, flag):
    if flag == "grafico":
        collection = db_connection.get_collection("myGraphics")
    result = collection.delete_one(deleteFilter)

    return result