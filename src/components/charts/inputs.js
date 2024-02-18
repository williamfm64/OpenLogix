import React, { useState, useEffect } from "react";
import { socketPromise } from '../settings/websocket.js';
import { useAuth } from '../settings/auth.js';
import '../styles/create.css'

// Componente para o campo de entrada da variável
function VariableInput({ value, onChange, onRemove, index, color, onChangeColor, onTest, test}) {
  return (
    <div className="input">
        <label>Variável {index}</label><p/>
        <div className="button-container">
          <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
          />
          <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => onChangeColor(e.target.value)}
          />
          <button onClick={onRemove}>Remover</button>
          <button onClick={onTest}>Testar</button>
          {test === 2 && <p>OK!</p>}
          {test === 1 && <p>Erro!</p>}
      </div>
    </div>
  );
}

function VariableInputBar({ value, onChange, onRemove, index, onTest, test}) {
  return (
    <div className="input">
        <label>Variável {index}</label>
        <div className="button-container">
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
          <button onClick={onRemove}>Remover</button>
          <button onClick={onTest}>Testar</button>
          {test === 2 && <p>OK!</p>}
          {test === 1 && <p>False!</p>}
      </div>
    </div>
  );
}

// Componente pai que mantém o estado das variáveis
function VariableForm(screen) {
  const [variables, setVariables] = useState([""]);
  const [results, setResults] = useState([""]);
  const [color, setColor] = useState("#4466FF");
  const [nome, setNome] = useState("");
  const [variableColors, setVariableColors] = useState(["#4466FF"]);
  const [largura, setLargura] = useState(200);
  const [altura, setAltura] = useState(180);
  const [tipo, setTipo] = useState("bar");
  const [dadosJson, setDadosJson] = useState({});
  const [dadosRecebidos, setDadosRecebidos] = useState({});
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  //Recebe e trata as mensagens do servidor
  socketPromise.then((socket) => {
    socket.addEventListener('message', function (event) {
      setDadosRecebidos(JSON.parse(event.data));
    });
  }).catch((error) => {
    console.error('Erro ao estabelecer a conexão:', error);
    // Lidar com o erro da conexão WebSocket
  });

  useEffect(() =>{
    if(dadosRecebidos !== null && "flag" in dadosRecebidos){
      if(dadosRecebidos.flag === "msg"){
        setShow(true);
        setMessage(dadosRecebidos.message);
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

  // Adicionar uma variável vazia ao estado
  const addVariable = () => {
    setVariables([...variables, ""]);
    setVariableColors([...variableColors, "#4466FF"]);
  };

  // Remover uma variável com base no índice
  const removeVariable = (index) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
  };

  // Atualizar o valor de uma variável com base no índice
  const updateVariable = (index, value) => {
    const newVariables = [...variables];
    newVariables[index] = value;
    setVariables(newVariables);
  };

  //Atualiza o valor da cor das variaveis
  const updateVariableColor = (index, newColor) => {
    const updatedColors = [...variableColors];
    updatedColors[index] = newColor;
    setVariableColors(updatedColors);
  }

  //Atualiza o valor do tipo de grafico
  const handleTipoChange = (e) => {
    setTipo(e.target.value);
  };

  //Atualiza o valor da cor do grafico
  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  //Atualiza o valor da altura do grafico
  const handleAlturaChange = (e) => {
      setAltura(e.target.value);
  };

  //Atualiza o valor da largura do grafico
  const handleLarguraChange = (e) => {
      setLargura(e.target.value);
  };

  //Atualiza o valor do nome do grafico
  const handleNomeChange = (e) =>{
    setNome(e.target.value);
  }

  // Impede a atualização da página ao submeter o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  //Envio do formulário
  const enviarFormulario = () =>{
    setShow(false);
    //Grafico de barras
    if(tipo === "bar"){
      setDadosJson({
        flag: "salvar",
        nomeGrafico: nome,
        usuario: user.name,
        tipoGrafico: tipo,
        variaveis: variables,
        cor: color,
        altura: altura,
        largura: largura,
        screen: screen.screen
      })
    }else{
      //Grafico de Linhas
      setDadosJson({
        flag: "salvar",
        nomeGrafico: nome,
        usuario: user.name,
        tipoGrafico: tipo,
        variaveis: variables,
        cor: variableColors,
        altura: altura,
        largura: largura,
        screen: screen.screen
      })
    }
  };

  // Enviar mensagem para o servidor WebSocket
  useEffect(() => {
    if(Object.keys(dadosJson).length > 0){
      const mensagem = JSON.stringify(dadosJson);
      console.log('Sending message...');
      socketPromise.then((socket) => {
        socket.send(mensagem);
      }).catch((error) => {
        console.error('Erro ao estabelecer a conexão:', error);
        // Lidar com o erro da conexão WebSocket
      }); 
    }
  }, [dadosJson]);

  const testVariable = (index) =>{
    setDadosJson({
      flag: "testVar",
      name: variables[index],
      index: index
    });
  };

  return (
    <div className='container'>
        <div className='cadastro'>
            <h1>Criando Grafico</h1>

            <form onSubmit={handleSubmit} id="meuFormulario">
                <div className='input'>
                    <label htmlFor="name">Nome do Grafico: </label><p/>
                    <input type='text' onChange={handleNomeChange}></input>
                </div>

                <div className='input'>
                    <label htmlFor='tipo'>Selecione o tipo de gráfico:</label><p/>
                    <select id='tipo' name='tipo' value={tipo} onChange={handleTipoChange}>
                        <option value='line'>Gráfico de Linhas</option>
                        <option value='bar'>Gráfico de Barras</option>
                        <option value='pie'>Gráfico de Pizza</option>
                        <option value='area'>Gráfico de Área</option>
                    </select>
                </div>

                <div className="input">
                  {tipo !== "pie" &&
                    <div>
                      <label>Altura: </label>
                      <input type="number" className="alt" id="altura" value={altura} onChange={handleAlturaChange}></input> pixels<p/><br/>
                    </div>
                  }
                  
                  <label>Largura:</label>
                  <input type="number" className="larg" id="largura" value={largura} onChange={handleLarguraChange}></input> pixels
                </div>

                { tipo === "bar" && <div className="input">
                  <label>Cor do gráfico:</label>
                  <input className="remove" type="color" id="color" value={color} onChange={handleColorChange}></input>
                </div>}

                {tipo != "bar" && variables.map((variable, index) => (
                    <VariableInput
                        key={index}
                        value={variable}
                        index={index+1}
                        color={variableColors[index]}
                        test={results[index]}
                        onChange={(value) => updateVariable(index, value)}
                        onRemove={() => removeVariable(index)}
                        onChangeColor={(color) =>updateVariableColor(index, color)}
                        onTest={() => testVariable(index)}
                    />
                ))}

                {tipo === "bar" && variables.map((variable, index) => (
                    <VariableInputBar
                        key={index}
                        value={variable}
                        index={index+1}
                        color={variableColors[index]}
                        test={results[index]}
                        onChange={(value) => updateVariable(index, value)}
                        onRemove={() => removeVariable(index)}
                        onTest={() => testVariable(index)}
                    />
                ))}
                <div className="rodape">
                  <button type="button" onClick={addVariable}>Adicionar Variável</button>
                  <button onClick={enviarFormulario}>Cadastrar Gráfico</button>
                </div>
            </form>
            {show && <h4>{message}</h4>} 
        </div>
    </div>

  );
}

export default VariableForm;
