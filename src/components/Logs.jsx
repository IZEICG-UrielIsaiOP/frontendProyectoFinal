import React, { useEffect, useState } from 'react';
import { API1, API2 } from '../Services/Api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, LineElement, PointElement);

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

  const generarLineaTiempos = (logs1, logs2) => {
    const data1 = logs1.map((log, index) => ({ x: index + 1, y: parseInt(log.responseTime?.replace('ms', '')) || 0 }));
    const data2 = logs2.map((log, index) => ({ x: index + 1, y: parseInt(log.responseTime?.replace('ms', '')) || 0 }));

    return {
      labels: data1.map(p => `Petición ${p.x}`),
      datasets: [
        {
          label: 'Servidor 2',
          data: data1.map(p => p.y),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.3)',
          tension: 0.3
        },
        {
          label: 'Servidor 1',
          data: data2.map(p => p.y),
          borderColor: '#198754',
          backgroundColor: 'rgba(25,135,84,0.3)',
          tension: 0.3
        }
      ]
    };
  };

  const generarDataBar = (titulo, data1, data2) => {
    const todasLasClaves = [...new Set([...Object.keys(data1), ...Object.keys(data2)])];
    return {
      labels: todasLasClaves,
      datasets: [
        {
          label: 'Servidor 2',
          data: todasLasClaves.map(k => data1[k] || 0),
          backgroundColor: '#0d6efd',
        },
        {
          label: 'Servidor 1',
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
            {renderCard('📊 Logs Servidor 2 - Niveles', <Bar data={generarDataBar('Niveles', niveles1, {})} />)}
            {renderCard('🔁 Métodos HTTP', <Bar data={generarDataBar('Métodos', metodos1, {})} />)}
            {renderCard('📦 Status Codes', <Bar data={generarDataBar('Status', status1, {})} />)}
            {renderCard('🧠 Distribución de Niveles', <Pie data={generarDataPie(niveles1)} />)}
            {renderCard('⏱️ Tiempo de Respuesta por Petición', <Line data={generarLineaTiempos(logs1, [])} />)}
          </>
        );
      case 'servidor2':
        return (
          <>
            {renderCard('📊 Logs Servidor 1 - Niveles', <Bar data={generarDataBar('Niveles', {}, niveles2)} />)}
            {renderCard('🔁 Métodos HTTP', <Bar data={generarDataBar('Métodos', {}, metodos2)} />)}
            {renderCard('📦 Status Codes', <Bar data={generarDataBar('Status', {}, status2)} />)}
            {renderCard('🧠 Distribución de Niveles', <Pie data={generarDataPie(niveles2)} />)}
            {renderCard('⏱️ Tiempo de Respuesta por Petición', <Line data={generarLineaTiempos([], logs2)} />)}
          </>
        );
      default:
        return (
          <>
            {renderCard('📊 Comparativa de Logs por Nivel', <Bar data={generarDataBar('Niveles', niveles1, niveles2)} />)}
            {renderCard('🔁 Métodos HTTP', <Bar data={generarDataBar('Métodos', metodos1, metodos2)} />)}
            {renderCard('📦 Status Codes', <Bar data={generarDataBar('Status', status1, status2)} />)}
            {renderCard('🧠 Distribución de Niveles (Servidor 2)', <Pie data={generarDataPie(niveles1)} />)}
            {renderCard('🧠 Distribución de Niveles (Servidor 1)', <Pie data={generarDataPie(niveles2)} />)}
            {renderCard('⏱️ Tiempo de Respuesta por Petición', <Line data={generarLineaTiempos(logs1, logs2)} />)}
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
          <option value="servidor1">Servidor 2</option>
          <option value="servidor2">Servidor 1</option>
        </select>
      </label>
      {renderGraficas()}
    </div>
  );
};

export default Logs;
