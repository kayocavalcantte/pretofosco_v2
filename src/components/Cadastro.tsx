import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Cadastro.scss';
import api from '../services/axios';

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      alert('Preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    const userData = {
      nome,
      email,
      telefone,
      senha,
    };

    try {
      console.log('Enviando dados de cadastro:', userData);
      const response = await api.post('/usuario/register', userData);
      console.log('Resposta do cadastro:', response.data);
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      let errorMessage = 'Não foi possível realizar o cadastro. Tente novamente.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="cadastro-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={5}>
            <Card className="cadastro-card">
              <Card.Body>
                <h2 className="text-center mb-4">Criar Conta</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Digite a senha novamente</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 neon-btn" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>

                  <div className="text-center mt-3">
                    <Button
                      type="button"
                      variant="link" // Ou seu estilo para "voltar-btn"
                      className="voltar-btn"
                      onClick={() => navigate('/login')}
                      disabled={isLoading}
                    >
                      Voltar
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cadastro;