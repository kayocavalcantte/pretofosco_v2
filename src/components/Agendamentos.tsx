import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../styles/Agendamentos.scss';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '../services/axios';

interface Funcionario {
  id: number;
  nome: string;
}

const Agendamentos: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agendamentoRealizado, setAgendamentoRealizado] = useState(false);

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<number | null>(null); // Inicia como null
  const [isLoadingFuncionarios, setIsLoadingFuncionarios] = useState<boolean>(true);

  const timeSlots = ['10:00', '11:30', '14:00', '16:30', '18:00'];
  const services = ['Corte de cabelo', 'Pintura', 'Sobrancelha'];

  useEffect(() => {
    const fetchFuncionarios = async () => {
      setIsLoadingFuncionarios(true);
      try {
        const response = await api.get<Funcionario[]>('/funcionarios/listar/ativos'); // Ajuste seu endpoint
        const fetchedFuncionarios = response.data;
        setFuncionarios(fetchedFuncionarios);

        if (fetchedFuncionarios && fetchedFuncionarios.length === 1) {
          setSelectedFuncionarioId(fetchedFuncionarios[0].id);
          console.log('Funcionário único selecionado automaticamente:', fetchedFuncionarios[0]);
        } else if (fetchedFuncionarios && fetchedFuncionarios.length > 1) {
          // Se há múltiplos, seleciona o primeiro como padrão.
          // Idealmente, aqui você teria uma UI para o usuário escolher.
          setSelectedFuncionarioId(fetchedFuncionarios[0].id);
          console.warn('Múltiplos funcionários ativos encontrados. Selecionando o primeiro por padrão:', fetchedFuncionarios[0]);
        } else {
          // Nenhum funcionário ativo encontrado pela API.
          // Para "nunca" mostrar a mensagem de erro e permitir prosseguir, definimos um ID padrão.
          // Certifique-se que o funcionário com ID 1 realmente existe e é válido.
          setSelectedFuncionarioId(1); // ID do funcionário padrão
          console.warn('Nenhum funcionário ativo encontrado via API. Usando ID de funcionário padrão: 1');
        }
      } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        // Fallback para um ID padrão em caso de erro na API também, para "nunca" bloquear a UI.
        setSelectedFuncionarioId(1); // ID do funcionário padrão
        console.warn('Falha ao buscar funcionários via API. Usando ID de funcionário padrão: 1');
      } finally {
        setIsLoadingFuncionarios(false);
      }
    };

    fetchFuncionarios();
  }, []);

  // ... (handleDateSelect, handleTimeSelect, toggleService, buscarIdsDosServicos são os mesmos) ...
  const handleDateSelect = (day: Date | undefined) => {
    setSelectedDay(day); setSelectedTime(null); setSelectedServices([]);
    setStep(day ? 2 : 1); setAgendamentoRealizado(false);
  };
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time); setStep(3); setAgendamentoRealizado(false);
  };
  const toggleService = (service: string) => {
    setSelectedServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
  };
  const buscarIdsDosServicos = async (descricoes: string[]) => {
    const res = await api.get('/servico/listar');
    const todosServicos = res.data;
    return todosServicos.filter((s: any) => descricoes.includes(s.descricao)).map((s: any) => s.id);
  };


  const handleConfirm = async () => {
    if (!selectedFuncionarioId) { // Esta verificação é importante
      alert('Funcionário não pôde ser determinado. Não é possível agendar.');
      console.error('ID do funcionário não está definido para o agendamento.');
      return;
    }
    if (!selectedDay || !selectedTime || selectedServices.length === 0) {
      alert('Por favor, selecione o dia, horário e pelo menos um serviço.');
      return;
    }

    try {
      const dto = {
        funcionarioId: selectedFuncionarioId,
        horario: selectedTime,
        dataAgendamento: format(selectedDay, 'yyyy-MM-dd'),
      };
      // ... (resto da lógica de handleConfirm) ...
      const response = await api.post('/agendamento/register', dto);
      const agendamentoId = response.data.id;
      const servicoIds = await buscarIdsDosServicos(selectedServices);
      await api.post('/agendamento-servico', { agendamentoId, servicoIds });
      setAgendamentoRealizado(true);

    } catch (error) {
      console.error('Erro ao agendar:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.response?.data || 'Erro ao realizar agendamento. Verifique os dados ou se o horário já está ocupado.';
      alert(errorMessage);
    }
  };

  const handleReset = () => {
    // ... (lógica existente) ...
    setSelectedDay(undefined); setSelectedTime(null); setSelectedServices([]);
    setStep(1); setAgendamentoRealizado(false);
  };

  if (isLoadingFuncionarios) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Carregando...</p>
      </Container>
    );
  }

  // Com o fallback para selectedFuncionarioId = 1, a mensagem de "nenhum funcionário"
  // não deve mais bloquear a renderização principal da UI de agendamento.
  // A verificação !selectedFuncionarioId no handleConfirm é a guarda final.

  return (
    <section className="hero-section">
      {/* ... (Conteúdo da sua seção, Card, DayPicker, etc., como antes) ... */}
      {/* Você pode querer exibir o nome do funcionário se ele foi carregado */}
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
              <Card.Body className="d-flex flex-column align-items-center text-center">
                <h3 className="micro-text mb-4">Agende seu horário</h3>

                {selectedFuncionarioId && funcionarios.length > 0 && (
                  <p className="micro-text mb-3">
                    Para o profissional: <strong>
                      { (funcionarios.find(f => f.id === selectedFuncionarioId) || {nome: `ID ${selectedFuncionarioId} (nome não carregado)`} ).nome }
                    </strong>
                  </p>
                )}
                {!selectedFuncionarioId && !isLoadingFuncionarios && (
                    <p className="text-warning micro-text mb-3">Atenção: Funcionário padrão selecionado. Verifique se o funcionário correto está sendo considerado.</p>
                )}

                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  showOutsideDays
                  fixedWeeks
                  disabled={{ before: new Date() }}
                />
                {selectedDay && !agendamentoRealizado && (
                  <div className="mt-4 text-center fade-in w-100">
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
                  <div className="mt-4 fade-in w-100">
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
                    <button className="confirm-btn mt-3" onClick={handleConfirm} disabled={!selectedFuncionarioId}>
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