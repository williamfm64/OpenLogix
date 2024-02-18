import { socketPromise } from '../settings/websocket.js';
import { useState, useEffect } from 'react';
import '../styles/login.css'

function Cadastro(){

    const [condicaoSenha, setCondicaoSenha] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [dadosJson, setDadosJson] = useState({});
    const [dadosRecebidos, setDadosRecebidos] = useState({});
    const [sucess, setSucess] = useState(false);

    socketPromise.then((socket) => {
        socket.addEventListener('message', function (event) {
            setDadosRecebidos(JSON.parse(event.data));
        });
    }).catch((error) => {
        console.error('Erro ao estabelecer a conexão:', error);
        // Lidar com o erro da conexão WebSocket
    });

    useEffect(() => {
        if("flag" in dadosRecebidos){
            if(dadosRecebidos.flag === "cadastroUsuario"){
                if(dadosRecebidos.msg !== "Usuário cadastrado com sucesso!"){
                    setSucess(false);
                    setCondicaoSenha(true);
                setMensagem(dadosRecebidos.msg);
                }else{
                    setSucess(true);
                }
                
            }
        }
    },[dadosRecebidos]);

    //Envia mensagem para o servidor ao atualizar a variável dadosJson
    useEffect(() => {
        if (dadosJson.flag) {
            const requisicao = JSON.stringify(dadosJson);
            console.log('Sending message...');
            socketPromise.then((socket) => {
                socket.send(requisicao);
            }).catch((error) => {
                console.error('Erro ao estabelecer a conexão:', error);
                // Lidar com o erro da conexão WebSocket
            });
        }
    }, [dadosJson]);

    //Função chamada para tratar o envio do formulário
    const handleSubmit = (e) => {
        e.preventDefault();
    
        const user = document.getElementById("user");
        const senha1 = document.getElementById("senha1");
        const senha2 = document.getElementById("senha2");

        //Verifica se os valores estão corretos
        if(senha1.value !== "" && senha2.value !== "" && user.value !==""){
            if(senha1.value === senha2.value){
                console.log("Senhas iguais");
                setCondicaoSenha(false);
                setDadosJson({
                    flag: "cadastroUsuario",
                    usuario: user.value,
                    senha: senha1.value
                });
            }else{
                setMensagem("As senhas digitadas são difetentes.");
                setCondicaoSenha(true);
            }
        }else{
            setMensagem("Preencha todos os campos acima.");
            setCondicaoSenha(true);
        }
      };
    
    return(
        <div className='container'>
            <div className='login'>
                <h1>Faça Cadastro no Sistema</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input'>
                        <label htmlFor='usuario'>Nome de usuário: </label>
                        <input className='textbox' id='user' type='text' placeholder='Usuário'></input>
                    </div>

                    <div className='input'>
                        <label htmlFor='senha1'>Digite sua senha: </label>
                        <input className='textbox' id='senha1' type='password' placeholder='Senha'></input>
                    </div>

                    <div className='input'>
                        <label htmlFor='senha2'>Confirme sua senha: </label>
                        <input className='textbox' id='senha2' type='password' placeholder='Senha'></input>
                        <button className='botao' type='submit'>Cadastrar</button>
                    </div>
                    {condicaoSenha && <div className='aviso'>{mensagem}</div>}
                    
                </form>
                {sucess &&
                <div>
                    <h4>Usuário cadastrado com sucesso!</h4>
                </div>
                }
            </div>
        </div>
        
    )
};

export default Cadastro