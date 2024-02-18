import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Link } from 'react-router-dom';

function DynamicChartLines({ nomeGrafico, variaveis, valores, history, graphindex, cores, altura, largura, id, screen, tipo}) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    // Configurar as opções do gráfico
    const options = {
      chart: {
        type: tipo,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      stroke: {
        curve: tipo === 'line' ? 'straight' : 'smooth'
      }, 
      dataLabels:{
        enabled: false
      },
      colors: cores
    };

    setChartOptions(options);

    const graphData = [];

    history.map((valor) => {
      graphData.push(valor[graphindex]);
    });

    const series = [];

    variaveis.map((valor, index) => {
      const thisSeriesData = [];
        graphData.map((valor) => {
        thisSeriesData.push(valor[index]);
      });
      const dict = { "name": valor, "data": thisSeriesData};
      series.push(dict);
    });

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
      <ReactApexChart options={chartOptions} series={chartSeries} type={tipo} height={altura} width={largura} />
    </div>
  );
}

export default DynamicChartLines;
