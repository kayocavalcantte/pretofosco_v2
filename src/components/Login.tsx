import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.scss';
import api from '../services/axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setRole } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha }, {
                        headers: { 'Content-Type': 'application/json' }
                      });
;
      const token = response.data.token;

      if (!token) throw new Error('Token não recebido');

      // Salva token no localStorage
      localStorage.setItem('token', token);

      // Decodifica payload do token JWT
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      // Ajuste o nome do campo conforme seu token JWT, aqui assumi 'perfil'
      const perfilRaw = decodedPayload.perfil || decodedPayload.role || decodedPayload.roles;

      if (!perfilRaw) throw new Error('Perfil não encontrado no token');

      // Se for array, pega o primeiro, senão pega direto
      const perfil = Array.isArray(perfilRaw) ? perfilRaw[0].toLowerCase() : perfilRaw.toLowerCase();

      // Salva perfil no localStorage
      localStorage.setItem('userRole', perfil);

      // Atualiza contexto global
      setIsLoggedIn(true);
      setRole(perfil);

      // Redireciona conforme perfil
      if (perfil === 'admin') {
        navigate('/agenda');
      } else {
        navigate('/agendamentos');
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      alert(error.response?.data?.message || 'Email ou senha inválidos.');
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
