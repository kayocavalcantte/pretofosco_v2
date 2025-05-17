import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import '../styles/Perfil.scss';

const Perfil: React.FC = () => {
  const [nome, setNome] = useState('João Silva');
  const [email] = useState('joao@email.com'); // fixo
  const [telefone, setTelefone] = useState('(88) 99999-9999');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Alterações salvas!');
    // aqui você pode integrar com uma API futura
  };

  return (
    <section className="perfil-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="perfil-card">
              <Card.Body>
                <h2 className="text-center mb-4">Meu Perfil</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} disabled />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Nova Senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Deixe em branco para manter a atual"
                    />
                  </Form.Group>

                  <Button variant="success" type="submit" className="w-100 neon-btn">
                    Salvar alterações
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Perfil;
