import React, { useState, useEffect} from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import DynamicChart from '../charts/dynamic';
import DynamicChartLines from '../charts/dynamiclines';
import DynamicChartPie from '../charts/dynamicpie';
import '../styles/home.css'
import { socket } from '../settings/websocket.js';
import { useAuth } from '../settings/auth.js';

function Home(){

    const [dados, setDados] = useState([]);
    const [variaveis, setVariaveis] = useState([]);
    const [valores, setValores] = useState([]);
    const [dadosRecebidos, setDadosRecebidos] = useState([]);
    const [variableHistory, setVariableHistory] = useState([]);
    const { user, setUser} = useAuth();
    const { screen = "" } = useParams();
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

    //Envia mensagem para o servidor para ler as configurações dos gráficos do Usuário
    useEffect(() => {
        if(user !== null && screen != ""){
            const dadosJson = {
                flag: "carregar",
                usuario: user.name,
                screen: screen
            };
            const mensagem = JSON.stringify(dadosJson);
            console.log('Sending message...');
            socket.send(mensagem);
        }
    }, [user, screen]);

    //Recebe e trata as mensagens do servidor
    socket.addEventListener('message', function (event) {
        setDadosRecebidos(JSON.parse(event.data));
    });

    //Envia mensagem para o servidor para ler as configurações dos gráficos do Usuário
    useEffect(() => {
        if(dadosRecebidos !== null){
            if('flag' in dadosRecebidos){
                if(dadosRecebidos.flag === "auth"){
                    if('user' in dadosRecebidos){
                        setUser({"name": dadosRecebidos.user});
                    }else{
                        navigate("/login");
                    }
                }
                else if(dadosRecebidos.flag === "dados"){
                    setValores(dadosRecebidos);
                }
            }else{
                setDados(dadosRecebidos);
                const variaveisArray = dadosRecebidos.map((item) => item.variaveis);
                setVariaveis(variaveisArray);
            }
        }
    }, [dadosRecebidos]);

    useEffect(() => {
        if("variaveis" in valores){
            const newValores = variableHistory;
            newValores.push(valores.variaveis);
            if(newValores.length > 10){
                newValores.shift();
            }
            setVariableHistory(newValores);
        }
    }, [valores]);

    useEffect(() => {
        // Função para enviar uma mensagem a cada meio segundo
        const sendPeriodicMessage = () => {
          // Verificar se a conexão WebSocket está aberta
          if (socket.readyState === WebSocket.OPEN && variaveis.length > 0) {
            // Enviar a mensagem desejada
            const dadosJson = {
                flag: "search",
                variaveis: variaveis
              };
            const mensagem = JSON.stringify(dadosJson);
            socket.send(mensagem);
          }
        };
    
        // Configurar um intervalo para enviar mensagens a cada meio segundo
        const intervalId = setInterval(sendPeriodicMessage, 1000);

        return () => {
            clearInterval(intervalId);
          };

      }, [dados]); // Certifique-se de executar isso apenas uma vez quando o componente for montado
    
    return(
        <div className='main'>
            <ul>
                {dados && (
                    <div className='grafico'>
                        {dados.map((data, index) => (
                            <li key={index} className='grafico'>
                                {data.tipoGrafico === "bar" &&
                                <DynamicChart
                                    nomeGrafico={data.nomeGrafico}
                                    variaveis={data.variaveis}
                                    valores={valores.variaveis ? valores.variaveis[index] : []}
                                    cores={[data.cor]}
                                    altura={data.altura}
                                    largura={data.largura}
                                    id={data._id}
                                    screen={screen}
                                />}
                                {(data.tipoGrafico === "line" || data.tipoGrafico === "area") &&
                                <DynamicChartLines
                                    nomeGrafico={data.nomeGrafico}
                                    variaveis={data.variaveis}
                                    valores={valores.variaveis ? valores.variaveis[index] : []}
                                    history={variableHistory.length > 0 ? variableHistory : []}
                                    cores={data.cor}
                                    graphindex={index}
                                    altura={data.altura}
                                    largura={data.largura}
                                    id={data._id}
                                    screen={screen}
                                    tipo={data.tipoGrafico}
                                />}
                                {data.tipoGrafico === "pie" &&
                                <DynamicChartPie
                                    nome={data.nomeGrafico}
                                    variaveis={data.variaveis}
                                    valores={valores.variaveis ? valores.variaveis[index] : []}
                                    cores={data.cor}
                                    largura={data.largura}
                                    id={data._id}
                                    screen={screen}
                                />}
                            </li>
                        ))}
                    </div>
                )}
            </ul>
            {screen != "" && 
                <Link to={`/create/${screen}`}>
                    <button id='newGraphButton'>Novo Grafico</button>
                </Link>
            }
            
        </div>
    )
};
export default Home