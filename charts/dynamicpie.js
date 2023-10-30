import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Link } from 'react-router-dom';

function DynamicChartPie({nome, variaveis, valores, cores, largura, id, screen}) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    // Configurar as opções do gráfico
    const options = {
        labels: variaveis,
        colors: cores
      };
    
    setChartOptions(options);
    
    setChartSeries(valores);
     
  }, [variaveis, valores]);
  

  return (
    <div>
      <div className='cabecalho'>
        <h2>{nome}</h2>
        <Link to={`/edit/${screen}/${id}`}>
          <button>Editar</button>
        </Link>
      </div>
      <ReactApexChart options={chartOptions} series={chartSeries} type={"pie"} width={largura}/>
    </div>
  );
}

export default DynamicChartPie;
