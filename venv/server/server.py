import asyncio
import websockets
import json
import bcrypt
from bson import ObjectId
from ipconfig import configure_static_ip
from logixServer import readTag, readMultiple
from dbFunctions import dbInput, dbSearchMany, dbFindUser, dbSearchScreen, dbSearchManyScreens, dbSearch, dbUpdateOne, dbUpdateMany, dbDelete, dbDeleteMany

connected = set()

user_states = {}

async def server(websocket, path):
    print("Conexão WebSocket estabelecida")

    # Rotina do servidor WebSocket
    async for message in websocket:

        #Atribui os dados recebidos para a variável data
        data = json.loads(message)
        print("Dados recebidos:", data)
        print()

        #Identifica a flag
        flag = data.get("flag")

        #Carrega os gráficos armazenados para o usuário
        if flag == "carregar":
            print("Carregando dados")
            usuario = data.get("usuario")
            screen = data.get("screen")
            searchFilter = {"usuario": usuario, "screen": screen}
            response = dbSearchMany(searchFilter)
            for item in response:
                item['_id'] = str(item['_id'])
            print(response)
            await websocket.send(json.dumps(response))
            print("Enviando dados")
            print()
        
        #Cadastra um novo gráfico
        elif flag == "salvar":
            print("gravando dados..")
            dbInput(data, flag)
            response = {"flag": "msg", "message": "Gráfico Cadastrado!"}
            await websocket.send(json.dumps(response))

        #Coleta as variáveis e envia para o client        
        elif flag == "search":
            tags = []
            var = data.get("variaveis")
            for item in var:
                tags.append(readMultiple(item, user_states.get("ip_clp")))
            print("Enviando os segintes valores para o client:")
            print(tags)
            response = {"flag": "dados","variaveis": tags}
            await websocket.send(json.dumps(response))
            print("Dados Enviados!")
            print()

        #Cadastro de novo usuário
        elif flag == "cadastroUsuario":
            usuario = data.get("usuario")
            searchFilter = {"Usuario": usuario}
            user = dbFindUser(searchFilter)
            if user is None:
                print("usuario nao existe")
                print("realizando cadastro do usuario")
                password = data.get("senha").encode('utf-8')
                hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
                dados = {"Usuario": 
                data.get("usuario"), "Senha": hashed_password, "_ipCLP": "", "_ipDisp": ""}
                dbInput(dados, flag)
                print("Usuario cadastrado!")
                response = {"flag": "cadastroUsuario", "msg": "Usuário cadastrado com sucesso!"}
            else:
                print("Usuario já existe.")
                response = {"flag": "cadastroUsuario", "msg": "Usuário já existe!"}
            await websocket.send(json.dumps(response))
        
        #Login de usuário
        elif flag == "loginUsuario":
            usuario = data.get("usuario")
            searchFilter = {"Usuario": usuario}
            user = dbFindUser(searchFilter)
            if user is not None:
                print("usuario encontrado, verificando senha...")
                password_entry = data.get("senha").encode('utf-8')
                password_fromdb = user.get("Senha")
                if bcrypt.checkpw(password_entry, password_fromdb):
                    print("Senha correta. Login permitido.")
                    user_states["user"] = usuario
                    user_states["ip_clp"] = user.get("_ipCLP")
                    user_states["ip_disp"] = user.get("_ipDisp")
                    #configure_static_ip(user_states.get("ip_disp"))
                    response = {"flag": "loginTrue", "user": usuario}
                    await websocket.send(json.dumps(response))
                else:
                    print("Senha incorreta. Login negado.")
                    error = "Senha Incorreta."
                    response = {"flag": "loginFalse", "user": usuario, "error": error}
                    await websocket.send(json.dumps(response))
            else:
                print("Usuario não existe.")
                error = "Usuário não existe."
                response = {"flag": "loginFalse", "user": usuario, "error": error}
                await websocket.send(json.dumps(response))

        #Verifica autenticação
        elif flag == "auth":
            if user_states != {}:
                print("Enviando informações sobre o usuário logado...")
                username = user_states["user"]
                response = {"flag": "auth", "user": username}
                print(response)
                await websocket.send(json.dumps(response))
            else:
                print("Nenhum usuario logado...")
                response = {"flag": "auth"}
                await websocket.send(json.dumps(response))
        elif flag == "logout":
            user_states.clear()
            print(user_states)
        
        #Cadastro de nova tela
        elif flag == "newScreen":
            print("Cadastro de nova tela..")
            screenName = data.get("name")
            screenUser = data.get("user")
            searchFilter = {"name": screenName, "user": screenUser.get("name")}
            result = dbSearchScreen(searchFilter)
            if result is None:
                print("Nome válido")
                dbInput(searchFilter, flag)
                response = {"flag": "newScreen"}
                await websocket.send(json.dumps(response))
                
            else:
                print("Tela já existe")
                response = {"flag": "newScreen", "error": "Tela já existe."}
                await websocket.send(json.dumps(response))

        #Carrega as telas do usuário
        elif flag == "loadScreen":
            print("Carregando telas..")
            screenUser = data.get("user")
            searchFilter = {"user": screenUser.get("name")}
            result = dbSearchManyScreens(searchFilter)
            print(result)
            for item in result:
                item['_id'] = str(item['_id'])
            response = {}
            response["flag"] = "loadScreen"
            response["screens"] = result
            print(response)
            await websocket.send(json.dumps(response))

        #Carrega um gráfico específico
        elif flag == "loadById":
            print("Carregando gráfico especificado..")
            documento_id = ObjectId(data.get("id"))
            searchFilter = {"_id": documento_id}
            result = dbSearch(searchFilter)
            result["flag"] = "loadById"
            print(searchFilter)
            print(result)
            await websocket.send(json.dumps(result))

        #Altera as configurações de um gráfico
        elif flag == "update":
            print("Updating..")
            documento_id = {"_id": ObjectId(data.get("id"))}
            data_update = {
                "$set": {
                    "nomeGrafico": data.get("nomeGrafico"),
                    "tipoGrafico": data.get("tipoGrafico"),
                    "variaveis": data.get("variaveis"),
                    "cor": data.get("cor"),
                    "altura": data.get("altura"),
                    "largura": data.get("largura")
                }
            }
            result = dbUpdateOne(documento_id, data_update, "grafico")
            print("Gráfico Modificado!")
            print(result)
            response = {"flag": "updated"}
            await websocket.send(json.dumps(response))

        #Deleta um gráfico
        elif flag == "delete":
            print("Deletando..")
            documento_id = {"_id": ObjectId(data.get("id"))}
            result = dbDelete(documento_id, "grafico")
            print(result)
            response = {"flag": "deleted"}
            await websocket.send(json.dumps(response))

        #Altera configurações de IP do CLP
        elif flag == "ipChange":
            print("Alterando IP do CLP")
            documento_id = {"Usuario": data.get("user")}
            data_update = {
                "$set": {
                    "_ipCLP": data.get("_ip")
                }
            }
            result = dbUpdateOne(documento_id, data_update, "user")
            print("IP Modificado!")
            print(result)
            response = {"flag": "clpUpdated"}
            await websocket.send(json.dumps(response))

        #Altera configurações de IP do CLP
        elif flag == "ipDispChange":
            print("Alterando IP do Dispositivo")
            documento_id = {"Usuario": data.get("user")}
            data_update = {
                "$set": {
                    "_ipDisp": data.get("_ip")
                }
            }
            result = dbUpdateOne(documento_id, data_update, "user")
            print("IP Modificado!")
            print(result)
            response = {"flag": "dispUpdated"}
            await websocket.send(json.dumps(response))

        #Carrega configurações de IP do usuário
        elif flag == "loadUser":
            print("Carregando dados do usuário")
            result = dbFindUser({"Usuario": data.get("user")})
            response = {}
            response["flag"] = "loadUser"
            response["_ipCLP"] = result.get("_ipCLP")
            response["_ipDisp"] = result.get("_ipDisp")
            print(response)
            await websocket.send(json.dumps(response))
        
        #Altera uma tela
        elif flag == "updateScreens":
            print("Verificando se é possível alterar a tela..")
            searchFilter = {"name": data.get("name"), "user": data.get("user")}
            result = dbSearchScreen(searchFilter)
            if result is None:
                print("Alterando Tela!")
                #Pega o nome atual da tela selecionada
                searchFilter = {"_id": ObjectId(data.get("id"))}
                currentScreen = dbSearchScreen(searchFilter)
                #Altera o nome da tela selecionada
                documento_id = {"_id": ObjectId(data.get("id"))}
                data_update = {
                    "$set": {
                        "name": data.get("name")
                    }
                }
                result = dbUpdateOne(documento_id, data_update, "screen")
                print("Tela Modificada!")
                print(result)
                #Altera os graficos relacionados a essa tela
                print("Alterando graficos relacionados a tela")
                updateFilter = {"usuario": data.get("user"), "screen": currentScreen.get("name")}
                updateData = {
                    "$set": {
                        "screen": data.get("name")
                    }
                }
                print(updateFilter)
                result = dbUpdateMany(updateFilter, updateData, "grafico")
                print(result)
                response = {"flag": "screenUpdated"}
                await websocket.send(json.dumps(response))
            else:
                print("Tela já existe")
                response = {"flag": "screenError"}
                await websocket.send(json.dumps(response))
        #Deleta uma tela
        elif flag == "deleteScreens":
            #Deleta a tela
            print("Deletando uma tela!")
            documento_id = {"_id": ObjectId(data.get("id"))}
            result = dbDelete(documento_id, "screen")
            print(result)
            #Deleta os graficos relacionados a tela
            print("Deletando graficos da tela")
            deleteFilter = {"usuario": data.get("user"), "screen": data.get("name")}
            delResult = dbDeleteMany(deleteFilter, "grafico")
            print(delResult)
            #Envia mensagem de resposta
            response = {"flag": "screenDeleted"}
            await websocket.send(json.dumps(response))

        #Teste de variável
        elif flag == "testVar":
            print("Testando uma variável..")
            result = readTag(data.get("name"), user_states.get("ip_clp"))
            print(result.Status)
            response = {"flag": "testVar", "test": result.Status, "index": data.get("index")}
            await websocket.send(json.dumps(response))

        else:
            await websocket.send(f'Got a new MSG FOR YOU: {data}')
        # Unregister.
    

start_server = websockets.serve(server, "localhost", 5000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()