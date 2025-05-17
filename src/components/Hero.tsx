import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../styles/Hero.scss';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <Container>
        <Row className="justify-content-center text-center mb-5">
          <Col xs={12} md={10} lg={8}>
            <h1
              style={{
                fontFamily: "'PlanetKosmos', 'Inter', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              Preto Fosco
            </h1>
            <p className="micro-text">Corte, Cor e Tranças</p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5} className="text-center">
            <Button
              variant="light"
              className="agendar-btn"
              onClick={() => navigate('/login')}
            >
              Agende seu horário
            </Button>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
