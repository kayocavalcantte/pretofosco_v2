import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/EsqueciSenha.scss';

const EsqueciSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email) {
      alert(`Link de recuperação enviado para: ${email}`);
    } else {
      alert('Por favor, informe seu email.');
    }
  };

  return (
    <section className="esqueci-senha-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={5}>
            <Card className="esqueci-senha-card">
              <Card.Body>
                <h2 className="text-center mb-4">Recuperar senha</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 neon-btn">
                    Confirmar
                  </Button>
                  <div className="text-center">
                      <Button
                        type="button"
                        className="voltar-btn"
                        onClick={() => navigate('/login')}
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

export default EsqueciSenha;
