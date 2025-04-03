import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { API1 } from '../Services/Api';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let email = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      email = decoded.email;
    } catch (e) {
      console.error("Token inválido");
    }
  }

  const [serverInfo, setServerInfo] = useState({});

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await API1.get('/getInfo');
        setServerInfo(res.data);
      } catch (error) {
        console.error("Error al obtener info del servidor", error);
      }
    };
    fetchInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenido a la Plataforma de Seguridad</h1>
      <div style={styles.card}>
        <p><strong>Alumno:</strong> Uriel Isaí Ortiz Pérez</p>
        <p><strong>Grupo:</strong> IDGS11</p>
        <p><strong>Docente:</strong> Emmanuel Martínez Hernández</p>
        {serverInfo?.nodeVersion && (
          <>
            <p><strong>Versión de Node:</strong> {serverInfo.nodeVersion}</p>
            <p><strong>Mensaje del servidor:</strong> {serverInfo.mensaje}</p>
          </>
        )}
      </div>

      <p style={styles.description}>
        Esta aplicación permite registrar, autenticar y visualizar logs de seguridad de dos servidores. 
        Utiliza autenticación de dos factores (MFA), JWT, almacenamiento en Firebase y protección con rate limit.
      </p>

      <div style={styles.actions}>
        <button onClick={() => navigate("/logs")} style={styles.buttonPrimary}>Ver Logs 📊</button>
        <button onClick={handleLogout} style={styles.buttonSecondary}>Cerrar sesión 🔐</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: 'auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#333',
  },
  card: {
    backgroundColor: '#f0f8ff',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
    fontSize: '1.1rem',
  },
  description: {
    marginBottom: '2rem',
    fontSize: '1rem',
    color: '#555',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  buttonPrimary: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  buttonSecondary: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Home;
