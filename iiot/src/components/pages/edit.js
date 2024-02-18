import React, { useState, useEffect} from 'react';
import {  useParams, useNavigate } from "react-router-dom";
import { socket } from '../settings/websocket.js';
import { useAuth } from '../settings/auth.js';
import '../styles/create.css'

//Input para graficos de barra
function VariableInputBar({ value, onChange, onRemove, index, onTest, test}) {
    return (
      <div className="input">
          <label>Variável {index}</label><p/>
          <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
          />
          <button className="remove" onClick={onRemove}>Remover</button>
          <button className="remove" onClick={onTest}>Testar</button>
          {test === 2 && 
            <h5>OK!</h5>
          }
          {test === 1 && 
            <h5>False!</h5>
          }
      </div>
    );
  }

// Componente para o campo de entrada da variável
function VariableInput({ value, onChange, onRemove, index, color, onChangeColor, onTest, test}) {
    return (
      <div className="input">
          <label>Variável {index}</label><p/>
          <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
          />
          <input
              className="remove"
              type="color"
              value={color}
              onChange={(e) => onChangeColor(e.target.value)}
          />
          <button className="remove" onClick={onRemove}>Remover</button>
          <button className="remove" onClick={onTest}>Testar</button>
          {test === 2 && 
            <h5>OK!</h5>
          }
          {test === 1 && 
            <h5>False!</h5>
          }
      </div>
    );
  }

function Edit(){

    const { screen = "", id = "" } = useParams();
    const [dadosRecebidos, setDadosRecebidos] = useState({});
    const [dadosJson, setDadosJson] = useState({});
    const [deleteGrafico, setDeleteGrafico] = useState(false);
    const [results, setResults] = useState([""]);
    const [show, setShow] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [nomeGrafico, setNomeGrafico] = useState("");
    const [tipoGrafico, setTipoGrafico] = useState("");
    const [alturaGrafico, setAlturaGrafico] = useState("180");
    const [larguraGrafico, setLarguraGrafico] = useState("200");
    const [coresGrafico, setCoresGrafico] = useState([]);
    const [variaveisGrafico, setVariaveisGrafico] = useState([]);

    //Envia uma mensagem para o servidor requisitando os dados do gráfico
    useEffect(() => {
        if(id !== ""){
            const dadosJson = {
                flag: "loadById",
                id: id
            };
            const mensagem = JSON.stringify(dadosJson);
            console.log('Sending message...');
            socket.send(mensagem);
        }
    }, [id]);

    //Recebe e trata as mensagens do servidor
    socket.addEventListener('message', function (event) {
        setDadosRecebidos(JSON.parse(event.data));
    });

    //Rotina para tratar as mensagens recebidas do servidor
    useEffect(() => {
        if(dadosRecebidos !== null && "flag" in dadosRecebidos){
            if(dadosRecebidos.flag === "loadById"){
                setNomeGrafico(dadosRecebidos.nomeGrafico);
                setTipoGrafico(dadosRecebidos.tipoGrafico);
                setAlturaGrafico(dadosRecebidos.altura);
                setLarguraGrafico(dadosRecebidos.largura);
                setCoresGrafico(dadosRecebidos.cor);
                setVariaveisGrafico(dadosRecebidos.variaveis);
            }else if(dadosRecebidos.flag === "deleted"){
                navigate(`/${screen}`);
            }else if(dadosRecebidos.flag === "updated"){
                setShow(true);
            }else if(dadosRecebidos.flag === "testVar"){
              if(dadosRecebidos.test === "Success"){
                const newResult = [...results];
                newResult[dadosRecebidos.index] = 2;
                setResults(newResult);
              }else{
                const newResult = [...results];
                newResult[dadosRecebidos.index] = 1;
                setResults(newResult);
              }
            }
        }
    }, [dadosRecebidos]);

    //Navega para tela de login se nenhum usuário está logado
    useEffect(() => {
        if(user === null){
            navigate("/login");
        }
    }, [user]);

  // Impede a atualização da página ao submeter o formulário
  const handleSubmit = (e) => {
    setShow(false);
    e.preventDefault();
  };

  //Atualiza o valor do nome do grafico
  const handleNomeChange = (e) =>{
    setShow(false);
    setNomeGrafico(e.target.value);
  }

    //Atualiza o valor do tipo de grafico
    const handleTipoChange = (e) => {
        setShow(false);
        setCoresGrafico([]);
        setTipoGrafico(e.target.value);
    };

    //Atualiza o valor da altura do grafico
    const handleAlturaChange = (e) => {
        setShow(false);
        setAlturaGrafico(e.target.value);
    };

    //Atualiza o valor da largura do grafico
    const handleLarguraChange = (e) => {
        setShow(false);
        setLarguraGrafico(e.target.value);
    };

  //Atualiza o valor da cor do grafico
  const handleColorChange = (e) => {
    setShow(false);
    setCoresGrafico(e.target.value);
  };

  // Remover uma variável com base no índice
  const removeVariable = (index) => {
    const newVariables = [...variaveisGrafico];
    newVariables.splice(index, 1);
    setVariaveisGrafico(newVariables);
  };

  // Atualizar o valor de uma variável com base no índice
  const updateVariable = (index, value) => {
    const newVariables = [...variaveisGrafico];
    newVariables[index] = value;
    setVariaveisGrafico(newVariables);
  };

  // Adicionar uma variável vazia ao estado
  const addVariable = () => {
    setShow(false);
    setVariaveisGrafico([...variaveisGrafico, ""]);
    if(tipoGrafico === "line"){
        setCoresGrafico([...coresGrafico, "#4466FF"]);
    }
  };

  //Atualiza o valor da cor das variaveis
  const updateVariableColor = (index, newColor) => {
    const updatedColors = [...coresGrafico];
    updatedColors[index] = newColor;
    setCoresGrafico(updatedColors);
  }

  //Envio do formulário
  const enviarFormulario = () =>{
    setShow(false);
    //Grafico de barras
      setDadosJson({
        flag: "update",
        id: id,
        nomeGrafico: nomeGrafico,
        tipoGrafico: tipoGrafico,
        variaveis: variaveisGrafico,
        cor: coresGrafico,
        altura: alturaGrafico,
        largura: larguraGrafico,
      })
  };

  // Enviar mensagem para o servidor WebSocket
  useEffect(() => {
    if(Object.keys(dadosJson).length > 0){
      const mensagem = JSON.stringify(dadosJson);
      console.log('Sending message...');
      socket.send(mensagem);
    }
  }, [dadosJson]);

  //Altera estado da variável deletar
  const handleDeletar = () => {
    setShow(false);
    if(deleteGrafico === false){
        setDeleteGrafico(true);
    }else{
        setDeleteGrafico(false);
    }
  };

  //Envia mensagem para deletar
  const handleDeletarMessage = () => {
    setDadosJson({
        flag: "delete",
        id: id
      })
  }

  const testVariable = (index) =>{
    setDadosJson({
      flag: "testVar",
      name: variaveisGrafico[index],
      index: index
    });
  };

    return(
        <div className='container'>
        <div className='cadastro'>
            <h1>Editando Grafico</h1>

            <form onSubmit={handleSubmit} id="meuFormulario">
                <div className='input'>
                    <label htmlFor="name">Nome do Grafico: </label><p/>
                    <input type='text' value={nomeGrafico} onChange={handleNomeChange}></input>
                </div>

                <div className='input'>
                    <label htmlFor='tipo'>Selecione o tipo de gráfico:</label><p/>
                    <select id='tipo' name='tipo' value={tipoGrafico} onChange={handleTipoChange}>
                        <option value='line'>Gráfico de Linhas</option>
                        <option value='bar'>Gráfico de Barras</option>
                        <option value='pie'>Gráfico de Pizza</option>
                        <option value='area'>Gráfico de Área</option>
                    </select>
                </div>

                
                <div className="input">
                {tipoGrafico !== "pie" && 
                  <div>   
                    <label>Altura: </label>
                    <input type="number" className="alt" id="altura" value={alturaGrafico} onChange={handleAlturaChange}></input><p/><br/>
                  </div>
                } 
                  <div>
                      <label>Largura:</label>
                      <input type="number" className="larg" id="largura" value={larguraGrafico} onChange={handleLarguraChange}></input>
                  </div>
                </div>

                {tipoGrafico === "bar" && <div className="input">
                  <label>Cor do gráfico:</label>
                  <input className="remove" type="color" id="color" value={coresGrafico} onChange={handleColorChange}></input>
                </div>}

                {tipoGrafico === "bar" && variaveisGrafico.map((variable, index) => (
                    <VariableInputBar
                        key={index}
                        value={variable}
                        index={index+1}
                        test={results[index]}
                        onChange={(value) => updateVariable(index, value)}
                        onRemove={() => removeVariable(index)}
                        onTest={() => testVariable(index)}
                    />
                ))}

                {tipoGrafico !== "bar" && variaveisGrafico.map((variable, index) => (
                    <VariableInput
                        key={index}
                        value={variable}
                        index={index+1}
                        color={coresGrafico[index]}
                        test={results[index]}
                        onChange={(value) => updateVariable(index, value)}
                        onRemove={() => removeVariable(index)}
                        onChangeColor={(color) =>updateVariableColor(index, color)}
                        onTest={() => testVariable(index)}
                    />
                ))}
                <div className='rodape'>
                  <button className="adicionar" type="button" onClick={addVariable}>
                      Adicionar Variável
                  </button>

                  <button className='remove' onClick={enviarFormulario}>
                      Salvar Gráfico
                  </button>

                  <button className='remove' onClick={handleDeletar}>
                      Deletar Gráfico
                  </button>

                  {deleteGrafico && 
                      <div className='deletar'>
                          <button onClick={handleDeletarMessage}>
                              Deletar
                          </button>
                          <button onClick={handleDeletar}>
                              Cancelar
                          </button>
                      </div>
                  }
                </div>
            </form> 
            {show && <h4>Gráfico alterado com sucesso!</h4>} 
        </div>
    </div>
    )
}

export default Edit;