import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import '../styles/Login.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Esta linha depende do AuthProvider acima na árvore de componentes
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && senha) {
      // Lógica de login simulada para definir o papel
      if (email === 'admin@pretofosco.com' && senha === 'admin123') {
        login('admin', '/agenda'); // Define papel como 'admin' e navega para /agenda
      } else {
        // Para qualquer outro email/senha, considera como usuário normal
        login('user', '/agendamentos'); // Define papel como 'user' e navega para /agendamentos
      }
    } else {
      alert('Preencha todos os campos.');
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