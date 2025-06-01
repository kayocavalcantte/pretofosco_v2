import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Container, Row, Col, Card, Spinner, Alert, Button as BootstrapButton, Dropdown } from 'react-bootstrap';
import api from '../services/axios';
import '../styles/Agenda.scss';
import { Edit3, PlusCircle, MoreVertical } from 'lucide-react';

interface ServicoBasico {
  id: number;
  descricao: string;
}

interface AppointmentInfo {
  id: number;
  funcionarioId: number;
  usuarioId: number;
  horario: string;
  dataAgendamento: string;
  statusAgendamento: 'ESPERA' | 'ATENDIDO' | 'DESMARCADO';
  clienteNome?: string;
  servicos?: ServicoBasico[];
}

const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return -1;
  try {
    const parsedTime = parse(timeStr, 'HH:mm:ss', new Date());
    return parsedTime.getHours() * 60 + parsedTime.getMinutes();
  } catch (e) {
    try {
      const parsedTime = parse(timeStr, 'HH:mm', new Date());
      return parsedTime.getHours() * 60 + parsedTime.getMinutes();
    } catch (e2) {
      console.warn(`Formato de hora inválido: ${timeStr}`);
      return -1;
    }
  }
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const Agenda: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [appointmentsForDay, setAppointmentsForDay] = useState<AppointmentInfo[]>([]);
  const [timeGridSlots, setTimeGridSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ID_FUNCIONARIO_FIXO = 1;
  const HORARIO_INICIO_BARBEARIA = "08:00";
  const HORARIO_FIM_BARBEARIA = "19:00";
  const INTERVALO_MINUTOS = 60;

  const generateTimeGridSlots = useCallback(() => {
    const slots: string[] = [];
    const inicioMin = timeToMinutes(HORARIO_INICIO_BARBEARIA);
    const fimMin = timeToMinutes(HORARIO_FIM_BARBEARIA);

    if (inicioMin === -1 || fimMin === -1 || inicioMin >= fimMin) {
      setError(`Horário de funcionamento (${HORARIO_INICIO_BARBEARIA} - ${HORARIO_FIM_BARBEARIA}) configurado incorretamente.`);
      setTimeGridSlots([]);
      return false;
    }
    setError(null);
    for (let currentMin = inicioMin; currentMin < fimMin; currentMin += INTERVALO_MINUTOS) {
      slots.push(minutesToTime(currentMin));
    }
    setTimeGridSlots(slots);
    return true;
  }, [HORARIO_INICIO_BARBEARIA, HORARIO_FIM_BARBEARIA, INTERVALO_MINUTOS]);

  const fetchAppointmentsForDay = useCallback(async (date: Date) => {
    if (!generateTimeGridSlots()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAppointmentsForDay([]);
    try {
      const dataFormatadaParaAPI = format(date, 'yyyy-MM-dd');
      const response = await api.get<AppointmentInfo[]>(`/agendamento/list/funcionario/${ID_FUNCIONARIO_FIXO}?dataAgendamento=${dataFormatadaParaAPI}`);
      setAppointmentsForDay((response.data || []).filter(app => app.statusAgendamento !== 'DESMARCADO'));
    } catch (err: any) {
      console.error("Erro ao buscar agendamentos:", err);
      setError(err.response?.data?.message || "Não foi possível carregar os agendamentos do dia.");
    } finally {
      setIsLoading(false);
    }
  }, [ID_FUNCIONARIO_FIXO, generateTimeGridSlots]);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsForDay(selectedDate);
    } else {
      generateTimeGridSlots();
    }
  }, [selectedDate, fetchAppointmentsForDay, generateTimeGridSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
    }
  };

  const handleChangeStatus = async (appointmentId: number, newStatus: AppointmentInfo['statusAgendamento']) => {
    setIsLoading(true);
    try {
      await api.put('/agendamento/edit/status', { id: appointmentId, statusAgendamento: newStatus });
      if (selectedDate) fetchAppointmentsForDay(selectedDate);
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err);
      alert(err.response?.data?.message || "Falha ao atualizar status do agendamento.");
      setIsLoading(false);
    }
  };

  const handleEditAppointment = (appointmentId: number) => {
    alert(`Funcionalidade de editar agendamento ${appointmentId} ainda não implementada.`);
  };

  const handleAddNewAppointment = (timeSlot?: string) => {
    const dataFormatada = selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'data não selecionada';
    const horarioInfo = timeSlot ? ` para o horário ${timeSlot}` : '';
    alert(`Funcionalidade de adicionar novo agendamento (para ${dataFormatada}${horarioInfo}) ainda não implementada.`);
  };

  return (
    <div className="agenda-page-container text-white">
      <Container fluid>
        <Row className="mb-3 align-items-center sticky-top-config">
          <Col xs={12} md={4} lg={4}>
            <h2 className="page-title mb-2 mb-md-0">Agenda da Barbearia</h2>
          </Col>
          <Col xs={12} md={4} lg={4} className="d-flex justify-content-md-center my-2 my-md-0">
            <div className="seletor-data-agenda">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                className="day-picker-inline-agenda"
                showOutsideDays
                captionLayout="dropdown-buttons"
                fromYear={new Date().getFullYear() - 1}
                toYear={new Date().getFullYear() + 1}
                defaultMonth={selectedDate}
              />
            </div>
          </Col>
          <Col xs={12} md={4} lg={4} className="text-md-end mt-2 mt-md-0">
            <BootstrapButton onClick={() => handleAddNewAppointment()} className="action-btn add-new-btn">
              <PlusCircle size={18} className="me-2" /> Novo Agendamento
            </BootstrapButton>
          </Col>
        </Row>
        <p className="text-center micro-text mb-3">
          Exibindo agenda para: {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Nenhuma data selecionada'}
        </p>

        {isLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" variant="light" />
            <span className="ms-2 micro-text">Carregando...</span>
          </div>
        )}

        {!isLoading && error && (
          <Alert variant="danger" className="text-center mt-3">
            {error}{' '}
            <BootstrapButton
              variant="outline-danger"
              size="sm"
              onClick={() => {
                if (selectedDate) fetchAppointmentsForDay(selectedDate);
              }}
            >
              Tentar Novamente
            </BootstrapButton>
          </Alert>
        )}

        {!isLoading && !error && timeGridSlots.length === 0 && (
          <Alert variant="warning" className="text-center mt-3">
            Horário de funcionamento da barbearia (de {HORARIO_INICIO_BARBEARIA} às {HORARIO_FIM_BARBEARIA}) não pôde gerar a grade de horários. Verifique a configuração.
          </Alert>
        )}

        {!isLoading && !error && timeGridSlots.length > 0 && (
          <div className="agenda-grid-funcionario">
            <div className="agenda-header-funcionario sticky-header-funcionario">Horário</div>
            <div className="agenda-header-funcionario sticky-header-funcionario">Detalhes do Agendamento</div>

            {timeGridSlots.map((timeSlot) => {
              const appointmentInSlot = appointmentsForDay.find(
                (app) => app.horario === timeSlot && app.funcionarioId === ID_FUNCIONARIO_FIXO
              );
              return (
                <React.Fragment key={timeSlot}>
                  <div className="hora-label-funcionario">{timeSlot}</div>
                  <div className={`celula-agenda-funcionario ${appointmentInSlot ? 'ocupado' : 'livre'}`}>
                    {appointmentInSlot ? (
                      <Card className="appointment-details-card-agenda h-100">
                        <Card.Body>
                          <Card.Title className="cliente-nome-agenda">
                            {appointmentInSlot.clienteNome || "Cliente não informado"}
                          </Card.Title>
                          <Card.Text className="servicos-agenda">
                            {appointmentInSlot.servicos && appointmentInSlot.servicos.length > 0 ? (
                              appointmentInSlot.servicos.map((s) => s.descricao).join(' | ')
                            ) : (
                              <span className="text-muted-agenda">Serviço não especificado</span>
                            )}
                          </Card.Text>
                          <div className="status-e-acoes-agenda">
                            <span className={`status-badge status-${appointmentInSlot.statusAgendamento?.toLowerCase()}`}>
                              {appointmentInSlot.statusAgendamento}
                            </span>
                            <Dropdown drop="start" className="actions-dropdown-container">
                              <Dropdown.Toggle
                                variant="link"
                                id={`dropdown-actions-${appointmentInSlot.id}`}
                                className="actions-dropdown-toggle p-0"
                              >
                                <MoreVertical size={18} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu variant="dark">
                                <Dropdown.Item onClick={() => handleChangeStatus(appointmentInSlot.id, 'ATENDIDO')}>
                                  Marcar Atendido
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleChangeStatus(appointmentInSlot.id, 'ESPERA')}>
                                  Marcar em Espera
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleChangeStatus(appointmentInSlot.id, 'DESMARCADO')}>
                                  Desmarcar
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => handleEditAppointment(appointmentInSlot.id)}>
                                  Editar
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </Card.Body>
                      </Card>
                    ) : (
                      <BootstrapButton
                        variant="link"
                        className="add-appointment-in-slot-btn"
                        onClick={() => handleAddNewAppointment(timeSlot)}
                      >
                        <PlusCircle size={16} className="me-1" /> Agendar Aqui
                      </BootstrapButton>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {!isLoading && !error && timeGridSlots.length > 0 && appointmentsForDay.length === 0 && (
          <p className="text-center micro-text text-muted mt-4">Nenhum agendamento para este dia.</p>
        )}
      </Container>
    </div>
  );
};

export default Agenda;
