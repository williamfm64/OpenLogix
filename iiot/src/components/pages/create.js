import React, { useState, useEffect} from 'react';
import { socket } from '../settings/websocket.js';
import { useAuth } from '../settings/auth.js';
import { useNavigate, useParams } from "react-router-dom";
import VariableForm from '../charts/inputs.js';
import '../styles/create.css'

function Create() {

  const [dadosRecebidos, setDadosRecebidos] = useState([]);
  const { user, setUser} = useAuth();
  const { screen = ""} = useParams();
  const navigate = useNavigate();

  //Mensagem enviada para o servidor ao estabelecer a conexão para verificar se algum usuário está logado
  socket.addEventListener('open', function (event) { 
    const dadosJson = {
        flag: "auth"
    };
    const mensagem = JSON.stringify(dadosJson);
    console.log('Sending message...');
    socket.send(mensagem);
  });

  //Recebe as mensagens do servidor
  socket.addEventListener('message', function (event) {
    setDadosRecebidos(JSON.parse(event.data));
  });
  
  //Trata a mensagem recebida
  useEffect(() => {
    if(dadosRecebidos !== null){
        if('flag' in dadosRecebidos && dadosRecebidos.flag === "auth"){
            if('user' in dadosRecebidos){
                setUser({"name": dadosRecebidos.user});
            }else{
                navigate("/login");
            }
        }
    }
}, [dadosRecebidos]);

  return (
    <VariableForm screen={screen}/>
  );
}

export default Create;
