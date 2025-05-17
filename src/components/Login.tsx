import React, { useState } from 'react';
import '../styles/Login.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, senha });
    // Aqui você pode redirecionar para a Home ou Agenda
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        <div className="login-links">
          <a href="#">Esqueci minha senha</a>
          <a href="#">Criar conta</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
