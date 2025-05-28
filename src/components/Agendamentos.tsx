import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../styles/Agendamentos.scss';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '../services/axios'; // ⬅ importa a API com token

const Agendamentos: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agendamentoRealizado, setAgendamentoRealizado] = useState(false);

  const timeSlots = ['10:00', '11:30', '14:00', '16:30', '18:00'];
  const services = ['Corte de cabelo', 'Pintura', 'Sobrancelha'];
  const funcionarioId = 1;

  const handleDateSelect = (day: Date | undefined) => {
    setSelectedDay(day);
    setSelectedTime(null);
    setSelectedServices([]);
    setStep(day ? 2 : 1);
    setAgendamentoRealizado(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
    setAgendamentoRealizado(false);
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleConfirm = async () => {
    if (!selectedDay || !selectedTime) return;

    try {
      const dto = {
        funcionarioId,
        horario: selectedTime,
        dataAgendamento: format(selectedDay, 'yyyy-MM-dd'),
      };

      await api.post('/agendamento/register', dto);
      setAgendamentoRealizado(true);
    } catch (error) {
      console.error('Erro ao agendar:', error);
      alert('Erro ao realizar agendamento. Verifique se o horário já está ocupado.');
    }
  };

  const handleReset = () => {
    setSelectedDay(undefined);
    setSelectedTime(null);
    setSelectedServices([]);
    setStep(1);
    setAgendamentoRealizado(false);
  };

  return (
    <section className="hero-section">
      <Container>
        <Row className="justify-content-center text-center mb-5">
          <Col xs={12} md={10} lg={8}>
            <h1 className="brand-title">Preto Fosco</h1>
            <p className="micro-text">Corte, Cor e Tranças</p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="appointment-card">
              <Card.Body className="text-center">
                <h3 className="micro-text mb-4">Agende seu horário</h3>

                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  showOutsideDays
                  fixedWeeks
                  className="mx-auto"
                />

                {selectedDay && !agendamentoRealizado && (
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

                {step === 3 && selectedDay && selectedTime && !agendamentoRealizado && (
                  <div className="mt-4 fade-in">
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

                    <button className="confirm-btn mt-3" onClick={handleConfirm}>
                      Confirmar Agendamento
                    </button>
                  </div>
                )}

                {agendamentoRealizado && (
                  <div className="mt-4 text-center fade-in">
                    <p className="text-success">✅ Agendamento realizado com sucesso!</p>
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
