import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Link } from 'react-router-dom';

function DynamicChart({ nomeGrafico, variaveis, valores, cores, altura, largura, id, screen}) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    // Configurar as opções do gráfico
    const options = {
      chart: {
        type: "bar",
        toolbar: {
          show: false
        } 
      },
      xaxis: {
        categories: variaveis, // Variáveis para o eixo X
      },
      colors: cores
    };

    setChartOptions(options);

    // Configurar as séries do gráfico
    const series = [
      {
        name: nomeGrafico,
        data: valores, // Valores do gráfico
      },
    ];

    setChartSeries(series);
  }, [nomeGrafico, variaveis, valores]);

  return (
    <div>
      <div className='cabecalho'>
        <h2>{nomeGrafico}</h2>
        <Link to={`/edit/${screen}/${id}`}>
          <button>Editar</button>
        </Link>
      </div>
      <ReactApexChart options={chartOptions} series={chartSeries} type={"bar"} height={altura} width={largura} />
    </div>
  );
}

export default DynamicChart;
