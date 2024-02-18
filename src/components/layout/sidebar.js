import { useState, useEffect } from 'react';
import { useAuth } from '../settings/auth.js';
import { socketPromise } from '../settings/websocket.js';
import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css'
import { Link } from 'react-router-dom';

function Sidebar() {

  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const [hide, setHide] = useState(false);
  const [form, setForm] = useState(false);
  const [newScreenName, setNewScreenName] = useState("");
  const [dadosRecebidos, setDadosRecebidos] = useState({});
  const [aviso, setAviso] = useState(false);
  const [avisoMessage, setAvisoMessage] = useState("");
  const [screens, setScreens] = useState([]);

  //Recebe mensagens do Servidor
  socketPromise.then((socket) => {
    socket.addEventListener('message', function (event) {
      setDadosRecebidos(JSON.parse(event.data));
    });
  }).catch((error) => {
    console.error('Erro ao estabelecer a conexão:', error);
    // Lidar com o erro da conexão WebSocket
  });

  useEffect(() => {
    if(user === null){
        navigate("/");
    }
}, [user]);

  //Envia mensagem para fazer logout no servidor e recarrega a página
  const handleLogout = () => {
    const dadosJson = {
      flag: "logout"
    };
    const mensagem = JSON.stringify(dadosJson);
    console.log('Sending message...');
    socketPromise.then((socket) => {
      socket.send(mensagem);
    }).catch((error) => {
      console.error('Erro ao estabelecer a conexão:', error);
      // Lidar com o erro da conexão WebSocket
    });
  };

  //Trata a mensagem recebida
  useEffect(() => {
    if(dadosRecebidos !== null){
        if('flag' in dadosRecebidos){
            if(dadosRecebidos.flag === "newScreen"){
                if('error' in dadosRecebidos){
                    setAviso(true);
                    setAvisoMessage(dadosRecebidos.error);
                }else{
                    setAviso(true);
                    setAvisoMessage("Cadastro Realizado!");
                    const dadosJson = {
                      flag: "loadScreen",
                      user: user
                    }
                    const mensagem = JSON.stringify(dadosJson);
                    console.log('Sending message...');
                    socketPromise.then((socket) => {
                      socket.send(mensagem);
                    }).catch((error) => {
                      console.error('Erro ao estabelecer a conexão:', error);
                      // Lidar com o erro da conexão WebSocket
                    });
                }
            }else if(dadosRecebidos.flag === "loadScreen"){
              const screensArray = dadosRecebidos.screens.map((item) => item);
              setScreens(screensArray);
            }else if(dadosRecebidos.flag === "screenDeleted" || dadosRecebidos.flag === "screenUpdated"){
              const dadosJson = {
                flag: "loadScreen",
                user: user
              }
              const mensagem = JSON.stringify(dadosJson);
              console.log('Sending message...');
              socketPromise.then((socket) => {
                socket.send(mensagem);
              }).catch((error) => {
                console.error('Erro ao estabelecer a conexão:', error);
                // Lidar com o erro da conexão WebSocket
            });
            }
            else if(dadosRecebidos.flag === "loggedout"){
                logout();
            }
        }
    }
}, [dadosRecebidos]);

useEffect(() => {
  if(screens.length > 0){
    navigate(`/${screens[0].name}`)
  }
}, []);

  //Altera a visualização do formulário de nova tela
  const handleNovaTela = () => {
    if(form === false){
      setForm(true);
    }else{
      setForm(false);
      setAviso(false);
    }
  }

  //Altera o valor do nome da tela
  const handleNomeChange = (e) => {
    setNewScreenName(e.target.value);
  }

  //Envia mensagem para fazer o cadastro da tela
  const handleSalvarTela = () => {
    const dadosJson = {
      flag: "newScreen",
      name: newScreenName,
      user: user
    }
    const mensagem = JSON.stringify(dadosJson);
    console.log('Sending message...');
    socketPromise.then((socket) => {
      socket.send(mensagem);
    }).catch((error) => {
      console.error('Erro ao estabelecer a conexão:', error);
      // Lidar com o erro da conexão WebSocket
    });
  }

  //Altera a visualização dos botões da Sidebar, envia mensagem para carregar as telas
  useEffect(() => {
    if(user !== null){
      setHide(true)

      const dadosJson = {
        flag: "loadScreen",
        user: user
      }
      const mensagem = JSON.stringify(dadosJson);
      console.log('Sending message...');
      socketPromise.then((socket) => {
        socket.send(mensagem);
        navigate("/");
      }).catch((error) => {
        console.error('Erro ao estabelecer a conexão:', error);
        // Lidar com o erro da conexão WebSocket
    });
    }else{
      setHide(false)
    }
  }, [user]);

  // Impede a atualização da página ao submeter o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
  };

    return (
      <div className="sidebar">
        <ul>
          {screens.length > 0 && hide && (
            screens.map((data, index) => (
              <Link to={`/${data.name}`}>
                <li key={index}>{data.name}</li>
              </Link>
            )))}

          {hide && <li><button onClick={handleNovaTela}>Nova Tela</button></li>}
          {form && <li id='formInList'>
              <form onSubmit={handleSubmit}>
                <label>Nome da tela:</label>
                <input type='text' onChange={handleNomeChange}></input>
                <button id='btn' onClick={handleSalvarTela}>salvar</button> <button id='btn' onClick={handleNovaTela}>fechar</button>
              </form>
            </li>}
          {aviso && <li id='avisoInList'><div className='avisoMessage'>{avisoMessage}</div></li>}
          
          {hide && 
            <Link to={`/configs`}>
              <li>Configurações</li>
            </Link>
          }
          {hide && <li><button onClick={handleLogout}>Logout</button></li>}

          {!hide && 
            <Link to={`/login`}>
              <li>Login</li>
             </Link>
          }
          {!hide && 
            <Link to={`/cadastro`}>
              <li>Cadastro</li>
             </Link>
          }
        </ul>
      </div>
    );
  }
  
  export default Sidebar;