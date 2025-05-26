import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.scss';
import api from '../services/axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setRole } = useAuth(); // pegando funções do contexto
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // evita reload da página

    try {
      const response = await api.post('/auth/login', { email, senha });
      const token = response.data.token;

      localStorage.setItem('token', token);

      // Decodifica o token para extrair o perfil
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const perfil = decodedPayload.perfil.toLowerCase(); // exemplo: "ADMIN" → "admin"

      // Atualiza contexto global
      setIsLoggedIn(true);
      setRole(perfil);

      // Redireciona com base no papel
      if (perfil === 'admin') {
        navigate('/agenda');
      } else {
        navigate('/agendamentos');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Email ou senha inválidos.');
    }
  };

  return (
    <section className="login-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={5}>
            <Card className="login-card">
              <Card.Body>
                <h2 className="text-center mb-4">Login</h2>
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 neon-btn">
                    Entrar
                  </Button>

                  <Form.Text className="d-block text-center mt-3 auth-links">
                    <span onClick={() => navigate('/esqueci-senha')}>Esqueci minha senha</span> ·{' '}
                    <span onClick={() => navigate('/cadastro')}>Criar conta</span>
                  </Form.Text>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;
