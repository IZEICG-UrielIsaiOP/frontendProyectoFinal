import React, { useState } from 'react';
import { API1 } from '../Services/Api';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [qrUrl, setQrUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:;])[A-Za-z\d@$!%*?&.,:;]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, username, password, confirmPassword } = form;

    if (!email || !username || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo');
      return;
    }

    try {
      const res = await API1.post('/register', { email, username, password });
      setMessage(res.data.message);
      setQrUrl(res.data.mfaSetup);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Registro  🔐</h2>

      {!qrUrl ? (
        <>
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
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña segura"
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              onChange={handleChange}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>Registrarse</button>
          </form>

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <button onClick={() => navigate("/login")} style={styles.buttonOutline}>¿Ya tienes cuenta? Inicia sesión</button>
        </>
      ) : (
        <div style={styles.qrBox}>
          <h3>Escanea este código QR con tu app de autenticación:</h3>
          <QRCodeCanvas value={qrUrl} size={200} />
          <p style={styles.qrText}>{qrUrl}</p>
          <button onClick={() => navigate("/login")} style={styles.buttonOutline}>Ir al Login</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: 'auto',
    padding: '2rem',
    backgroundColor: '#f7f7f7',
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
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s ease',
  },
  buttonOutline: {
    marginTop: '1rem',
    padding: '0.8rem',
    backgroundColor: 'white',
    color: '#0d6efd',
    border: '2px solid #0d6efd',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
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
  },
  qrBox: {
    marginTop: '2rem',
    textAlign: 'center',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  qrText: {
    fontSize: '0.75rem',
    wordBreak: 'break-all',
    marginTop: '1rem',
    color: '#666'
  }
};

export default Register;
