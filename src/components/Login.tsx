import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import '../styles/Login.scss';
import api from '../services/axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });

      const { token, userId: apiUserId, role: apiRoleString } = response.data;

      if (!token || apiUserId === undefined || apiUserId === null || !apiRoleString) {
        throw new Error('Resposta de login inválida do servidor (token, userId ou role ausentes).');
      }

      const userRoleForContext = apiRoleString.toUpperCase() as UserRole;

      login(token, userRoleForContext, apiUserId);

      if (userRoleForContext === 'ADMIN' || userRoleForContext === 'FUNCIONARIO') {
        navigate('/agenda');
      } else if (userRoleForContext === 'CLIENTE') {
        navigate('/agendamentos');
      } else {
        console.warn(`Perfil não reconhecido para redirecionamento: ${userRoleForContext}`);
        navigate('/');
      }

    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      let errorMessage = 'Email ou senha inválidos.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 neon-btn" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>

                  <Form.Text className="d-block text-center mt-3 auth-links">
                    <span onClick={() => navigate('/esqueci-senha')} style={{ cursor: 'pointer' }}>
                      Esqueci minha senha
                    </span>{' '}
                    ·{' '}
                    <span onClick={() => navigate('/cadastro')} style={{ cursor: 'pointer' }}>
                      Criar conta
                    </span>
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