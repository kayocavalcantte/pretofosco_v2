import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Button, ListGroup } from 'react-bootstrap'; // Adicionado ListGroup
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../styles/Agendamentos.scss';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '../services/axios';
import { FaWhatsapp } from 'react-icons/fa';
interface Funcionario {
  id: number;
  nome: string;
  ativo?: boolean;
  horarioInicio?: string; // Ex: "08:00:00" ou "08:00"
  horarioFinal?: string;  // Ex: "20:00:00" ou "20:00"
}

interface Servico {
  id: number;
  descricao: string;
}

interface AgendamentoVm {
  id: number;
  horario: string;
  dataAgendamento: string; // Esperado como "yyyy-MM-dd" do backend
}

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const Agendamentos: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [agendamentoRealizado, setAgendamentoRealizado] = useState(false);

  const [allFuncionarios, setAllFuncionarios] = useState<Funcionario[]>([]); // Todos funcionários da API
  const [activeFuncionarios, setActiveFuncionarios] = useState<Funcionario[]>([]); // Apenas ativos para seleção
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<number | null>(null); // Começa como null

  const [availableServices, setAvailableServices] = useState<Servico[]>([]);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false);

  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true); // Loading geral para funcionários e serviços
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Loading para o handleConfirm


  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingInitialData(true);
      try {
        // Fetch Funcionários
        const funcResponse = await api.get<Funcionario[]>('/funcionario/listar'); // Endpoint CORRIGIDO
        const fetchedFuncionarios = funcResponse.data || [];
        console.log("Funcionários recebidos da API:", fetchedFuncionarios);
        setAllFuncionarios(fetchedFuncionarios);

        const ativos = fetchedFuncionarios.filter(f => f.ativo);
        setActiveFuncionarios(ativos);
        console.log("Funcionários ativos para seleção:", ativos);

        if (ativos.length === 1) {
          setSelectedFuncionarioId(ativos[0].id); // Auto-seleciona se só tiver um ativo
          console.log("Funcionário único ativo auto-selecionado:", ativos[0]);
        } else {
          setSelectedFuncionarioId(null); // Requer seleção manual se múltiplos ou nenhum
        }

        // Fetch Serviços
        const servResponse = await api.get<Servico[]>('/servico/listar');
        setAvailableServices(servResponse.data || []);
        console.log("Serviços disponíveis carregados:", servResponse.data);

      } catch (error) {
        console.error('Erro ao buscar dados iniciais (funcionários/serviços):', error);
        setActiveFuncionarios([]);
        setAvailableServices([]);
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    // Resetar seleções se o funcionário mudar
    setSelectedDay(undefined);
    setSelectedTime(null);
    setSelectedServices([]);
    setAgendamentoRealizado(false);
    setAvailableTimeSlots([]);
  }, [selectedFuncionarioId]);


  useEffect(() => {
    if (selectedDay && selectedFuncionarioId && allFuncionarios.length > 0) {
      const funcionarioSelecionado = allFuncionarios.find(f => f.id === selectedFuncionarioId);
      console.log("Tentando gerar horários para o funcionário:", funcionarioSelecionado);

      if (!funcionarioSelecionado || !funcionarioSelecionado.horarioInicio || !funcionarioSelecionado.horarioFinal) {
        console.warn("Dados de horário (inicio/fim) do funcionário selecionado estão incompletos ou ausentes.", funcionarioSelecionado);
        setAvailableTimeSlots([]);
        return;
      }

      console.log(`Gerando horários com base em: Início=${funcionarioSelecionado.horarioInicio}, Fim=${funcionarioSelecionado.horarioFinal}`);

      const gerarHorarios = async () => {
        setIsLoadingTimeSlots(true);
        setAvailableTimeSlots([]); // Limpa slots antigos antes de buscar novos
        try {
          const response = await api.get<AgendamentoVm[]>(`/agendamento/list/funcionario/${selectedFuncionarioId}`);
          const todosAgendamentosFuncionario = response.data || [];
          const dataSelecionadaFormatada = format(selectedDay, 'yyyy-MM-dd');

          const horariosOcupados = todosAgendamentosFuncionario
            .filter(ag => ag.dataAgendamento === dataSelecionadaFormatada)
            .map(ag => ag.horario);
          console.log(`Horários ocupados para ${dataSelecionadaFormatada} do func ${selectedFuncionarioId}:`, horariosOcupados);

          const slots: string[] = [];
          const inicioTrabalhoMin = timeToMinutes(funcionarioSelecionado.horarioInicio!);
          const fimTrabalhoMin = timeToMinutes(funcionarioSelecionado.horarioFinal!);
          const intervaloMin = 60;

          for (let currentTimeMin = inicioTrabalhoMin; currentTimeMin < fimTrabalhoMin; currentTimeMin += intervaloMin) {
            const slot = minutesToTime(currentTimeMin);
            if (!horariosOcupados.includes(slot)) {
              slots.push(slot);
            }
          }
          setAvailableTimeSlots(slots);
          console.log("Horários disponíveis gerados:", slots);

        } catch (error) {
          console.error("Erro ao buscar agendamentos para gerar horários:", error);
          setAvailableTimeSlots([]);
        } finally {
          setIsLoadingTimeSlots(false);
        }
      };
      gerarHorarios();
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDay, selectedFuncionarioId, allFuncionarios]);


  const handleFuncionarioSelect = (funcionarioId: number) => {
    setSelectedFuncionarioId(funcionarioId);
    // Outras lógicas de reset já estão no useEffect que depende de selectedFuncionarioId
  };

  const handleDateSelect = (day: Date | undefined) => {
    setSelectedDay(day);
    setSelectedTime(null);
    setSelectedServices([]); // Mantém reset de serviços ao mudar data, mas não de funcionário
    setAgendamentoRealizado(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setAgendamentoRealizado(false);
  };

  const toggleService = (serviceDescription: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceDescription) ? prev.filter(s => s !== serviceDescription) : [...prev, serviceDescription]
    );
  };

  const buscarIdsDosServicos = useCallback(async (descricoes: string[]): Promise<number[]> => {
    if (descricoes.length === 0) return [];
    try {
      // Usa os availableServices já carregados para evitar chamada extra, se preferir.
      // Mas buscar da API garante dados mais recentes se eles puderem mudar frequentemente.
      const response = await api.get<Servico[]>('/servico/listar');
      const todosServicosDoBackend = response.data || [];
      return todosServicosDoBackend
        .filter(servico => descricoes.includes(servico.descricao.trim()))
        .map(servico => servico.id);
    } catch (error) { console.error('Erro ao buscar IDs dos serviços:', error); return []; }
  }, []);

  const handleConfirm = async () => {
    if (!selectedFuncionarioId || !selectedDay || !selectedTime || selectedServices.length === 0) {
      alert('Por favor, selecione o profissional, dia, horário e pelo menos um serviço.');
      return;
    }
    setIsSubmitting(true);
    try {
      const idsDosServicosParaSalvar = await buscarIdsDosServicos(selectedServices);
      const dto = {
        funcionarioId: selectedFuncionarioId,
        horario: selectedTime,
        dataAgendamento: format(selectedDay, 'dd/MM/yyyy'),
        servicoId: idsDosServicosParaSalvar
      };
      await api.post('/agendamento/register', dto);
      setAgendamentoRealizado(true);
    } catch (error: any) {
      console.error('Erro ao agendar:', error);
      let errorMessage = 'Erro ao realizar agendamento.';
       if (error.response && error.response.data) {
        if (typeof error.response.data.message === 'string') { errorMessage = error.response.data.message; }
        else if (typeof error.response.data === 'string') { errorMessage = error.response.data; }
        else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.map((err: any) => err.defaultMessage || err.msg || err).join(', ');
        }
      } else if (error.message) { errorMessage = error.message; }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFuncionarioId(activeFuncionarios.length === 1 ? activeFuncionarios[0].id : null); // Reset para auto-seleção ou manual
    setSelectedDay(undefined); setSelectedTime(null); setSelectedServices([]);
    setAgendamentoRealizado(false);
  };

  const getSelectedFuncionarioNome = () => {
    if (!selectedFuncionarioId) return 'Nenhum profissional selecionado';
    return allFuncionarios.find(f => f.id === selectedFuncionarioId)?.nome || `Profissional (ID ${selectedFuncionarioId})`;
  }

  if (isLoadingInitialData) {
    return ( <Container className="text-center py-5"><Spinner animation="border" variant="light" /><p className="mt-2 micro-text text-white">Carregando dados iniciais...</p></Container>);
  }

  return (
    <section className="hero-section">
      <Container>
        <Row className="justify-content-center text-center mb-4">
          <Col xs={12} md={10} lg={8}><h1 className="brand-title">Preto Fosco</h1><p className="micro-text">Corte, Cor e Tranças</p></Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="appointment-card">
              <Card.Body className="d-flex flex-column align-items-center text-center">
                {isSubmitting && (<div className="py-5"><Spinner animation="border" variant="light" /><p className="mt-2 micro-text text-white">Processando agendamento...</p></div>)}

                {!isSubmitting && !agendamentoRealizado && (
                  <>
                    <h3 className="micro-text mb-3">Agende seu horário</h3>

                    {/* SELEÇÃO DE FUNCIONÁRIO */}
                    {!selectedFuncionarioId && activeFuncionarios.length > 1 && (
                      <div className="mb-4 w-100">
                        <p className="micro-text">Escolha o profissional:</p>
                        <ListGroup>
                          {activeFuncionarios.map(func => (
                            <ListGroup.Item action key={func.id} onClick={() => handleFuncionarioSelect(func.id)} active={selectedFuncionarioId === func.id}>
                              {func.nome}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                    {activeFuncionarios.length === 0 && !isLoadingInitialData && (
                         <p className="micro-text text-warning my-3">Nenhum profissional disponível no momento.</p>
                    )}

                    {/* SELEÇÃO DE DATA (só aparece se um funcionário foi selecionado ou auto-selecionado) */}
                    {selectedFuncionarioId && (
                      <>
                        <p className="micro-text mb-3">Escolha uma data:</p>
                        <DayPicker mode="single" selected={selectedDay} onSelect={handleDateSelect} locale={ptBR} showOutsideDays fixedWeeks disabled={{ before: new Date() }} />
                      </>
                    )}

                    {/* SELEÇÃO DE HORÁRIO (só aparece se dia e funcionário estiverem selecionados) */}
                    {selectedFuncionarioId && selectedDay && (
                      <div className="mt-4 text-center fade-in w-100">
                        <p className="micro-text">Horários disponíveis para {format(selectedDay, 'dd/MM/yyyy', { locale: ptBR })}</p>
                        {isLoadingTimeSlots ? (
                          <div className="my-3"><Spinner animation="border" size="sm" variant="light"/><span className="micro-text text-white ms-2">Verificando horários...</span></div>
                        ) : availableTimeSlots.length > 0 ? (
                          <div className="time-slots">
                            {availableTimeSlots.map((time, index) => (
                              <button key={index} className={`time-slot ${selectedTime === time ? 'selected' : ''}`} onClick={() => handleTimeSelect(time)}>{time}</button>
                            ))}
                          </div>
                        ) : (
                          <p className="micro-text text-warning my-3">Nenhum horário disponível para esta data/profissional.</p>
                        )}
                        {selectedTime && (<p className="mt-3 micro-text text-white">Horário selecionado: <strong>{selectedTime}</strong></p>)}
                      </div>
                    )}

                    {/* SELEÇÃO DE SERVIÇOS E CONFIRMAÇÃO (só aparece se funcionário, dia e hora estiverem selecionados) */}
                    {selectedFuncionarioId && selectedDay && selectedTime && (
                      <div className="mt-4 fade-in w-100">
                        <p className="micro-text">Escolha os serviços desejados</p>
                        {isLoadingInitialData && availableServices.length === 0 ? (
                          <div className="my-3"><Spinner animation="border" size="sm" variant="light" /><span className="micro-text text-white ms-2">Carregando serviços...</span></div>
                        ) : availableServices.length > 0 ? (
                          <div className="service-options">
                            {availableServices.map(service => (
                              <button key={service.id} className={`service-btn ${selectedServices.includes(service.descricao) ? 'selected' : ''}`} onClick={() => toggleService(service.descricao)}>{service.descricao}</button>
                            ))}
                          </div>
                        ) : (<p className="micro-text text-warning my-3">Nenhum serviço cadastrado.</p>)}
                        <Button className="confirm-btn mt-4" onClick={handleConfirm} disabled={selectedServices.length === 0 || isLoadingInitialData || isLoadingTimeSlots}>Confirmar Agendamento</Button>
                      </div>
                    )}
                    {!selectedFuncionarioId && activeFuncionarios.length <= 1 && !isLoadingInitialData && (
                        <p className="mt-4 text-center text-muted small">Selecione um profissional para continuar.</p>
                    )}
                  </>
                )}

                {/* TELA DE SUCESSO */}
                {!isSubmitting && agendamentoRealizado && (
                  <div className="mt-4 text-center fade-in">
                    <p className="h5 success-message-neon">Agendamento realizado com sucesso!</p>
                    {selectedDay && selectedTime && (<p className='micro-text text-white mt-3'>Seu horário no dia <strong>{format(selectedDay, 'dd/MM/yyyy')}</strong> às <strong>{selectedTime}</strong>{selectedServices.length > 0 && ` para ${selectedServices.join(', ')}`} foi confirmado.</p>)}
                    <Button onClick={handleReset} className="mt-4 novo-agendamento-btn">Fazer Novo Agendamento</Button>
                    <a
                      href="https://wa.me/message/6F2P4DSKLGZVH1" // SEU LINK FIXO AQUI
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn mt-3"
                    >
                      <FaWhatsapp size={18} />
                      <span style={{ marginLeft: '8px' }}>Enviar Mensagem no WhatsApp</span>
                    </a>
                  </div>
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