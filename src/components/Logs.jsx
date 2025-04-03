import React, { useEffect, useState } from 'react';
import { API1, API2 } from '../Services/Api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const Logs = () => {
  const [logs1, setLogs1] = useState([]);
  const [logs2, setLogs2] = useState([]);
  const [servidorSeleccionado, setServidorSeleccionado] = useState('todos');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res1 = await API1.get('/logs');
        const res2 = await API2.get('/logs2');
        setLogs1(res1.data.logs);
        setLogs2(res2.data.logs);
      } catch (error) {
        console.error('Error al obtener logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const contarPor = (logs, campo) => {
    return logs.reduce((acc, log) => {
      const valor = log[campo] || 'desconocido';
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {});
  };

  const promedioRespuesta = (logs) => {
    const tiempos = logs.map(log => parseInt(log.responseTime?.replace('ms', '')) || 0);
    const total = tiempos.reduce((acc, val) => acc + val, 0);
    return tiempos.length > 0 ? Math.round(total / tiempos.length) : 0;
  };

  const maxPeticiones10Min = (logs) => {
    const timestamps = logs.map(log => new Date(log.timestamp).getTime()).sort();
    let max = 0;
    for (let i = 0; i < timestamps.length; i++) {
      let count = 1;
      for (let j = i + 1; j < timestamps.length && timestamps[j] - timestamps[i] <= 10 * 60 * 1000; j++) {
        count++;
      }
      if (count > max) max = count;
    }
    return max;
  };

  const generarDataBar = (titulo, data1, data2) => {
    const todasLasClaves = [...new Set([...Object.keys(data1), ...Object.keys(data2)])];
    return {
      labels: todasLasClaves,
      datasets: [
        {
          label: 'Servidor 1',
          data: todasLasClaves.map(k => data1[k] || 0),
          backgroundColor: '#0d6efd',
        },
        {
          label: 'Servidor 2',
          data: todasLasClaves.map(k => data2[k] || 0),
          backgroundColor: '#198754',
        }
      ]
    };
  };

  const generarDataPie = (data) => {
    const claves = Object.keys(data);
    const valores = Object.values(data);
    return {
      labels: claves,
      datasets: [
        {
          data: valores,
          backgroundColor: [
            '#0d6efd','#dc3545','#ffc107','#198754','#6f42c1','#fd7e14'
          ]
        }
      ]
    };
  };

  const niveles1 = contarPor(logs1, 'logLevel');
  const niveles2 = contarPor(logs2, 'logLevel');
  const metodos1 = contarPor(logs1, 'method');
  const metodos2 = contarPor(logs2, 'method');
  const status1 = contarPor(logs1, 'statusCode');
  const status2 = contarPor(logs2, 'statusCode');

  const renderCard = (titulo, contenido) => (
    <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '2rem', maxWidth: '900px', marginInline: 'auto' }}>
      <h3>{titulo}</h3>
      <div style={{ maxHeight: '400px' }}>
        {contenido}
      </div>
    </div>
  );

  const renderGraficas = () => {
    switch (servidorSeleccionado) {
      case 'servidor1':
        return (
          <>
            {renderCard('📊 Logs Servidor 1 - Niveles', <Bar data={generarDataBar('Niveles', niveles1, {})} />)}
            {renderCard('🔁 Métodos HTTP', <Bar data={generarDataBar('Métodos', metodos1, {})} />)}
            {renderCard('📦 Status Codes', <Bar data={generarDataBar('Status', status1, {})} />)}
            {renderCard('🧠 Distribución de Niveles', <Pie data={generarDataPie(niveles1)} />)}
            {renderCard('⏱️ Tiempo Promedio de Respuesta', <p>{promedioRespuesta(logs1)} ms</p>)}
          </>
        );
      case 'servidor2':
        return (
          <>
            {renderCard('📊 Logs Servidor 2 - Niveles', <Bar data={generarDataBar('Niveles', {}, niveles2)} />)}
            {renderCard('🔁 Métodos HTTP', <Bar data={generarDataBar('Métodos', {}, metodos2)} />)}
            {renderCard('📦 Status Codes', <Bar data={generarDataBar('Status', {}, status2)} />)}
            {renderCard('🧠 Distribución de Niveles', <Pie data={generarDataPie(niveles2)} />)}
            {renderCard('⏱️ Tiempo Promedio de Respuesta', <p>{promedioRespuesta(logs2)} ms</p>)}
          </>
        );
      default:
        return (
          <>
            {renderCard('📊 Comparativa de Logs por Nivel', <Bar data={generarDataBar('Niveles', niveles1, niveles2)} />)}
            {renderCard('🔁 Métodos HTTP', <Bar data={generarDataBar('Métodos', metodos1, metodos2)} />)}
            {renderCard('📦 Status Codes', <Bar data={generarDataBar('Status', status1, status2)} />)}
            {renderCard('🧠 Distribución de Niveles (Servidor 1)', <Pie data={generarDataPie(niveles1)} />)}
            {renderCard('🧠 Distribución de Niveles (Servidor 2)', <Pie data={generarDataPie(niveles2)} />)}
            {renderCard('🚀 Máx. peticiones en 10 min (S1 y S2)',
              <>
                <p>Servidor 1: {maxPeticiones10Min(logs1)} peticiones</p>
                <p>Servidor 2: {maxPeticiones10Min(logs2)} peticiones</p>
              </>
            )}
            {renderCard('⏱️ Tiempo Promedio de Respuesta',
              <>
                <p>Servidor 1: {promedioRespuesta(logs1)} ms</p>
                <p>Servidor 2: {promedioRespuesta(logs2)} ms</p>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
      <h2>📈 Visualización de Logs</h2>
      <label style={{ marginBottom: '1rem', display: 'block' }}>
        Selecciona servidor:
        <select value={servidorSeleccionado} onChange={(e) => setServidorSeleccionado(e.target.value)} style={{ marginLeft: '1rem' }}>
          <option value="todos">Todos</option>
          <option value="servidor1">Servidor 1</option>
          <option value="servidor2">Servidor 2</option>
        </select>
      </label>
      {renderGraficas()}
    </div>
  );
};

export default Logs;
