import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../styles/Agendamentos.scss';
import { ptBR } from 'date-fns/locale';

const Hero: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);

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
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="appointment-card">
             <Card.Body className="d-flex flex-column align-items-center text-center">
                <h3 className="micro-text text-center mb-4">Agende seu horário</h3>
                <DayPicker
  mode="single"
  selected={undefined}
  onSelect={setSelectedDay}
  locale={ptBR}
  showOutsideDays
  fixedWeeks
  className="mx-auto"
/>


{selectedDay ? (
    <div
    key={selectedDay.toDateString()} // força o React a recriar o bloco
    className="mt-4 text-center fade-in"
  >
    <p className="micro-text">Horários disponíveis</p>
    <div className="time-slots">
      {['10:00', '11:30', '14:00', '16:30', '18:00'].map((time, index) => (
        <button key={index} className="time-slot">{time}</button>
      ))}
    </div>
  </div>
) : (
  <p className="mt-4 text-center text-muted small">Selecione uma data para ver os horários disponíveis.</p>
)}

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;