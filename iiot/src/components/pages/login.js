import { socket } from '../settings/websocket.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAuth } from '../settings/auth.js';
import '../styles/login.css'

function Login(){

    const { user, setUser} = useAuth();
    const [condicaoSenha, setCondicaoSenha] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [dadosJson, setDadosJson] = useState({});
    const [dadosRecebidos, setDadosRecebidos] = useState({});
    const navigate = useNavigate();

    //Envia mensagem para o servidor ao atualizar a variável dadosJson
    useEffect(() => {
        if(user !== null){
            navigate("/");
        }
    }, [user]);

    //Recebe e trata a mensagem do servidor
    socket.addEventListener('message', function (event) {
        setDadosRecebidos(JSON.parse(event.data));
    });

    //Trata a mensagem recebida do servidor
    useEffect(() => {
        if(dadosRecebidos.flag === "loginTrue"){
            console.log("Login OK.")
            setUser({"name": dadosRecebidos.user});
        }else{
            setMensagem(dadosRecebidos.error);
            setCondicaoSenha(true);
        }
    }, [dadosRecebidos]);

    //Envia mensagem para o servidor ao atualizar a variável dadosJson
    useEffect(() => {
        if (dadosJson.flag) {
            const requisicao = JSON.stringify(dadosJson);
            console.log('Sending message...');
            socket.send(requisicao);
        }
    }, [dadosJson]);

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const username = document.getElementById("username");
        const senha = document.getElementById("senha");

        //Verifica se os valores estão corretos
        if(senha.value !== "" && username.value !==""){
            setCondicaoSenha(false);
            setDadosJson({
                flag: "loginUsuario",
                usuario: username.value,
                senha: senha.value
            });
        }else{
            setMensagem("Preencha todos os campos acima.");
            setCondicaoSenha(true);
        }
      };

    return(
        <div className='container'>
            <div className='login'>
                <h1>Faça Login no Sistema</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input'>
                        <label htmlFor='username'>Nome de usuário: </label>
                        <input className='textbox' id='username' type='text' placeholder='Usuário'></input>
                    </div>

                    <div className='input'>
                        <label htmlFor='senha'>Confirme sua senha: </label>
                        <input className='textbox' id='senha' type='password' placeholder='Senha'></input>
                        <button className='botao' type='submit'>Login</button>
                    </div>
                    {condicaoSenha && <div className='aviso'>{mensagem}</div>}
                    
                </form>
            </div>
        </div>
        
    )
};

export default Login