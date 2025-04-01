import React, { useState } from 'react';
import { API1 } from '../Services/Api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', token: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, token } = form;

    if (!email || !password || !token) {
      setError("⚠️ Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await API1.post("/login", form);
      const authToken = res.data.token;
      localStorage.setItem("token", authToken); 
      setMessage(" Login exitoso");
      setTimeout(() => navigate("/home"), 1000); 
    } catch (err) {
      setError(err.response?.data?.message || "Error en login");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Inicio de sesión 🔐</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="token"
          placeholder="Código MFA"
          onChange={handleChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>Iniciar sesión</button>
        <button
            type="button"
            style={{ ...styles.button, backgroundColor: '#0d6efd', marginTop: '1rem' }}
            onClick={() => navigate("/register")}
            >
            Registrarse
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: 'auto',
    padding: '2rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#198754',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s ease',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
    fontWeight: 'bold'
  },
  success: {
    color: 'green',
    marginTop: '1rem',
    fontWeight: 'bold'
  }
};

export default Login;
