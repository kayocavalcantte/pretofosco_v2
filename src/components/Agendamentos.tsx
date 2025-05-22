import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../styles/Agendamentos.scss';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

const Agendamentos: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [whatsReady, setWhatsReady] = useState<boolean>(false);

  const timeSlots = ['10:00', '11:30', '14:00', '16:30', '18:00'];
  const services = ['Corte de cabelo', 'Pintura', 'Sobrancelha'];

  const phoneNumber = '5585988278193'; // <-- Coloque aqui o número do WhatsApp com DDI e DDD

  const handleDateSelect = (day: Date | undefined) => {
    setSelectedDay(day);
    setSelectedTime(null);
    setSelectedServices([]);
    setStep(day ? 2 : 1);
    setWhatsReady(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
    setWhatsReady(false);
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleConfirm = () => {
    alert('Agendamento confirmado!');
    setWhatsReady(true);
  };

  const handleReset = () => {
    setSelectedDay(undefined);
    setSelectedTime(null);
    setSelectedServices([]);
    setStep(1);
    setWhatsReady(false);
  };

  const buildWhatsAppMessage = () => {
    if (!selectedDay || !selectedTime || selectedServices.length === 0) return '';
    const dateFormatted = format(selectedDay, 'dd/MM/yyyy');
    const servicesText = selectedServices.join(', ');
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      `Oi! Marquei um serviço na barbearia:\n\n• Serviços: ${servicesText}\n• Data: ${dateFormatted}\n• Horário: ${selectedTime}`
    )}`;
  };

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
                  selected={selectedDay}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  showOutsideDays
                  fixedWeeks
                  className="mx-auto"
                />

                  {selectedDay && !whatsReady && (
                    <div className="mt-4 text-center fade-in">
                      <p className="micro-text">Horários disponíveis</p>
                      <div className="time-slots">
                        {timeSlots.map((time, index) => (
                          <button
                            key={index}
                            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>

                      {selectedTime && step >= 2 && (
                        <p className="mt-3 text-white">
                          Horário selecionado: <strong>{selectedTime}</strong>
                        </p>
                      )}
                    </div>
                  )}


                {step === 3 && selectedDay && selectedTime && !whatsReady && (
                  <div className="mt-4 text-center fade-in">
                    <p className="micro-text">Escolha os serviços desejados</p>
                    <div className="service-options">
                      {services.map(service => (
                        <button
                          key={service}
                          className={`service-btn ${selectedServices.includes(service) ? 'selected' : ''}`}
                          onClick={() => toggleService(service)}
                        >
                          {service}
                        </button>
                      ))}
                    </div>

                    {selectedServices.length > 0 && (
                      <button className="confirm-btn mt-3" onClick={handleConfirm}>
                        Confirmar Agendamento
                      </button>
                    )}
                  </div>
                )}

                {whatsReady && (
                  <div className="mt-4 text-center fade-in">
                    <a
                      href={buildWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn"
                    >
                      Enviar mensagem no WhatsApp
                    </a>
                    <button onClick={handleReset} className="mt-3 novo-agendamento-btn">
                      Novo agendamento
                    </button>
                  </div>
                )}

                {step === 1 && (
                  <p className="mt-4 text-center text-muted small">
                    Selecione uma data para ver os horários disponíveis.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Agendamentos;
