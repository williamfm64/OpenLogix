import "../styles/configs.css"
import { socket } from '../settings/websocket.js';
import { useAuth } from '../settings/auth.js';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function Configs(){

    const { user } = useAuth();
    const navigate  = useNavigate();
    const [dadosRecebidos, setDadosRecebidos] = useState({});
    const [dadosJson, setDadosJson] = useState({});

    const [message, setMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false); 
    const [showDelete, setShowDelete] = useState([]);
    const [screenMessage, setScreenMessage] = useState("");
    const [showScreenMessage, setShowScreenMessage] = useState(false); 

    const [ipConfig, setIpConfig] = useState("192.168.0.15");
    const [ipDisp, setIpDisp] = useState("192.168.0.10");
    const [screens, setScreens] = useState({});

    //Recebe e trata as mensagens do servidor
    socket.addEventListener('message', function (event) {
        setDadosRecebidos(JSON.parse(event.data));
    });

    //Envia mensagens para o servidor
    useEffect(() =>{
        if(Object.keys(dadosJson).length > 0){
            const mensagem = JSON.stringify(dadosJson);
            console.log('Sending message...');
            socket.send(mensagem);
        }
    },[dadosJson]);

    //Trata os dados recebidos do servidor
    useEffect(() => {
        if(dadosRecebidos !== null){
            if("flag" in dadosRecebidos){
                if(dadosRecebidos.flag === "loadScreen"){
                    const screensArray = dadosRecebidos.screens.map((item) => item);
                    setScreens(screensArray);
                    setDadosJson({
                        flag: "loadUser",
                        user: user.name
                    });
                }else if(dadosRecebidos.flag === "clpUpdated"){
                    setShowMessage(true);
                    setMessage("IP do CLP alterado com sucesso!");
                }else if(dadosRecebidos.flag === "dispUpdated"){
                    setShowMessage(true);
                    setMessage("IP do Dispositivo alterado com sucesso!");
                }else if(dadosRecebidos.flag === "loadUser"){
                    setIpConfig(dadosRecebidos._ipCLP);
                    setIpDisp(dadosRecebidos._ipDisp);
                }else if(dadosRecebidos.flag === "screenUpdated"){
                    setShowScreenMessage(true);
                    setScreenMessage("Tela Alterada!");
                }else if(dadosRecebidos.flag === "screenDeleted"){
                    setShowScreenMessage(true);
                    setScreenMessage("Tela Removida.");
                    setDadosJson({
                        flag: "loadScreen",
                        user: user
                    });
                }else if(dadosRecebidos.flag === "screenError"){
                    setShowScreenMessage(true);
                    setScreenMessage("Tela já existe.");
                }
            }
        }
    },[dadosRecebidos]);

    //Configura Mensagem para carregar informações sobre as telas
    useEffect(()=>{
        if(user === null){
            navigate("/login");
        }else{ 
            setDadosJson({
                flag: "loadScreen",
                user: user
            });
        }
    },[]);

    //Trata alteração de endereço do CLP
    const handleIPChange = (e) => {
        setIpConfig(e.target.value);
    };

    //Grava alteração de endereço do CLP
    const handleSalvar = () => {
        setDadosJson(
            {"flag": "ipChange", "_ip": ipConfig, "user": user.name}
        )
    };

    //Trata alteração de endereço do CLP
    const handleIpDisp = (e) => {
        setIpDisp(e.target.value);
    };

    //Grava alteração de endereço do CLP
    const handleSalvarDisp = () => {
        setDadosJson(
            {"flag": "ipDispChange", "_ip": ipDisp, "user": user.name}
        )
    };

    const handleNome = (e, index) => {
        const newScreens = [...screens];
        newScreens[index].name = e;
        setScreens(newScreens);
    };

    const handleAlterar = (index) => {
        setDadosJson({
            flag: "updateScreens",
            name: screens[index].name,
            id: screens[index]._id,
            user: user.name
        })
    };

    const handleDelete = (index) => {
        const newDelete = [...showDelete];
        if(newDelete[index] === true){
            newDelete[index] = false;
        }else{
            newDelete[index] = true;
        }
        setShowDelete(newDelete);
    };

    const handleDeletar = (index) => {
        setDadosJson({
            flag: "deleteScreens",
            id: screens[index]._id,
            user: user.name,
            name: screens[index].name
        })
    };

    return(
        <div className="container">
            <div className="content">
                <h2>Configurações</h2>
                <div className="text_input">
                    <label>IP do CLP:</label><p/>
                    <input type="text" value={ipConfig} onChange={handleIPChange}></input>
                    <button id="salvar_btn" onClick={handleSalvar}>Salvar</button>
                </div>
                <div className="text_input">
                    <label>IP do Dispositivo:</label><p/>
                    <input type="text" value={ipDisp} onChange={handleIpDisp}></input>
                    <button id="salvar_btn" onClick={handleSalvarDisp}>Salvar</button>
                </div>
                {showMessage &&
                <div>
                    <h4>{message}</h4>
                </div>
                }
            </div>

            {screens.length > 0 &&
            <div className="content">
                <h2>Telas do usuário</h2>
                <ul>
                    {screens.map((data, index) => (
                        <li className="text_input">
                            <input value={data.name} onChange={(e) => handleNome(e.target.value, index)} ></input>
                            <button id="salvar_btn" onClick={() => handleAlterar(index)}>Alterar</button>
                            <button id="salvar_btn" onClick={() => handleDelete(index)}>Remover</button>
                            {showDelete[index] && <button id="salvar_btn" onClick={() => handleDeletar(index)}>Delete</button>}
                        </li>
                    ))}
                </ul>
                {showScreenMessage &&
                <div>
                    <h4>{screenMessage}</h4>
                </div>
                }
            </div>
            }
            
        </div>
    );
}

export default Configs;