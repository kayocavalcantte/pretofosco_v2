import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Container, Row, Col, Card, Spinner, Alert, Button as BootstrapButton, Dropdown } from 'react-bootstrap';
import api from '../services/axios';
import '../styles/Agenda.scss';
import { Edit3, PlusCircle, MoreVertical, Calendar as CalendarIcon } from 'lucide-react';

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
  statusAgendamento: 'ESPERA' | 'ATENDIDO' | 'DESMARCADO' | string;
  nomeUsuario?: string;
  servicos?: ServicoBasico[];
}

const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr || !timeStr.includes(':')) { console.warn(`[AgendaUtils] timeToMinutes: formato inválido ${timeStr}`); return -1; }
  try {
    const referenceDate = new Date();
    const parsedTime = parse(timeStr, timeStr.length === 5 ? 'HH:mm' : 'HH:mm:ss', referenceDate);
    if (isNaN(parsedTime.getTime())) { throw new Error('Data inválida após parse'); }
    return parsedTime.getHours() * 60 + parsedTime.getMinutes();
  } catch (e) { console.warn(`[AgendaUtils] timeToMinutes: falha ${timeStr}`, e); return -1; }
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const AgendaVisaoFuncionario: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [appointmentsForDay, setAppointmentsForDay] = useState<AppointmentInfo[]>([]);
  const [timeGridSlots, setTimeGridSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const ID_FUNCIONARIO_ATUAL = 1;
  const NOME_FUNCIONARIO_ATUAL = "Preto Fosco";
  const HORARIO_INICIO_BARBEARIA = "08:00";
  const HORARIO_FIM_BARBEARIA = "20:00";
  const INTERVALO_MINUTOS = 60;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarContainerRef.current && !calendarContainerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const generateTimeGridSlots = useCallback(() => {
    const slots: string[] = [];
    const inicioMin = timeToMinutes(HORARIO_INICIO_BARBEARIA);
    const fimMin = timeToMinutes(HORARIO_FIM_BARBEARIA);
    if (inicioMin === -1 || fimMin === -1 || inicioMin >= fimMin) {
      const errorMsg = `Config. horário (${HORARIO_INICIO_BARBEARIA}-${HORARIO_FIM_BARBEARIA}) inválida.`;
      setError(errorMsg); setTimeGridSlots([]); return false;
    }
    setError(null);
    for (let currentMin = inicioMin; currentMin < fimMin; currentMin += INTERVALO_MINUTOS) {
      slots.push(minutesToTime(currentMin));
    }
    setTimeGridSlots(slots); return true;
  }, [HORARIO_INICIO_BARBEARIA, HORARIO_FIM_BARBEARIA, INTERVALO_MINUTOS]);

  const fetchAppointmentsForSelectedDate = useCallback(async (date: Date) => {
    if (!ID_FUNCIONARIO_ATUAL) {
        setError("ID do funcionário não definido.");
        setIsLoading(false);
        setAppointmentsForDay([]);
        return;
    }
    if (!generateTimeGridSlots()) {
        setIsLoading(false);
        setAppointmentsForDay([]);
        return;
    }
    setIsLoading(true); setError(null); setAppointmentsForDay([]);
    try {
      const response = await api.get<AppointmentInfo[]>(`/agendamento/list/funcionario/${ID_FUNCIONARIO_ATUAL}`);
      const allAppointmentsForEmployee = response.data || [];
      const dateStringToCompare = format(date, 'yyyy-MM-dd');

      const filteredAppointments = allAppointmentsForEmployee.filter(app =>
          app.dataAgendamento === dateStringToCompare && app.statusAgendamento !== 'DESMARCADO'
      );
      setAppointmentsForDay(filteredAppointments);
    } catch (err: any) {
      let detailedError = err.response?.data?.message || "Erro ao carregar agendamentos.";
      if (err.response?.status === 403) {
        detailedError += " Acesso negado. Verifique as permissões.";
      }
      setError(detailedError);
    } finally { setIsLoading(false); }
  }, [ID_FUNCIONARIO_ATUAL, generateTimeGridSlots]);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsForSelectedDate(selectedDate);
    } else {
      generateTimeGridSlots();
      setAppointmentsForDay([]);
    }
  }, [selectedDate, fetchAppointmentsForSelectedDate, generateTimeGridSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
      setShowCalendar(false);
    }
  };

  const handleChangeStatus = async (appointmentId: number, newStatus: AppointmentInfo['statusAgendamento']) => {
    setIsLoading(true);
    try {
      await api.put('/agendamento/edit/status', { id: appointmentId, statusAgendamento: newStatus });
      if (selectedDate) fetchAppointmentsForSelectedDate(selectedDate);
    } catch (err: any) {
      alert(err.response?.data?.message || "Falha ao atualizar status.");
    } finally { setIsLoading(false); }
  };

  const handleEditAppointment = (appointmentId: number) => {
    alert(`Editar agendamento ${appointmentId} (não implementado).`);
  };

  const handleAddNewAppointmentGeneral = () => {
     const dataFormatada = selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'data não selecionada';
     alert(`Adicionar novo agendamento para ${NOME_FUNCIONARIO_ATUAL} em ${dataFormatada} (não implementado).`);
  };

  const renderAgendaGrid = () => {
    if (isLoading && timeGridSlots.length === 0) {
      return (<div className="text-center py-4"><Spinner animation="border" size="sm" variant="light" /><span className="ms-2 micro-text">Carregando agenda...</span></div>);
    }
    if (error) { return (<Alert variant="danger" className="text-center mt-3">{error}</Alert>); }
    if (!selectedDate) { return (<Alert variant="info" className="text-center mt-3">Selecione uma data para ver a agenda.</Alert>)}
    if (timeGridSlots.length === 0 && !isLoading ) { return (<Alert variant="warning" className="text-center mt-3">Não foi possível gerar os horários. Verifique a configuração.</Alert>)}

    return (
      <div className="agenda-grid-funcionario">
        <div className="agenda-header-funcionario sticky-header-funcionario">Horário</div>
        <div className="agenda-header-funcionario sticky-header-funcionario">{NOME_FUNCIONARIO_ATUAL}</div>

        {timeGridSlots.map((timeSlot) => {
          const appointmentInSlot = appointmentsForDay.find(
            (app) => app.horario === timeSlot && app.funcionarioId === ID_FUNCIONARIO_ATUAL
          );

          const handleDropdownToggle = (isOpen: boolean, event: any, metadata: {source: string}) => {
            if (appointmentInSlot) {
              // Considerar apenas 'click' ou 'rootClose' para evitar fechar com Tab/Escape se não desejar
              // No entanto, para uma lógica mais simples de apenas rastrear aberto/fechado:
              if (isOpen) {
                setOpenDropdownId(appointmentInSlot.id);
              } else {
                // Apenas limpa se o dropdown que está fechando é o que estava aberto
                // Isso previne que fechar um dropdown afete o estado se outro já foi aberto rapidamente.
                if (openDropdownId === appointmentInSlot.id) {
                  setOpenDropdownId(null);
                }
              }
            }
          };

          return (
            <React.Fragment key={timeSlot}>
              <div className="hora-label-funcionario">{timeSlot}</div>
              <div
                className={
                  `celula-agenda-funcionario ${appointmentInSlot ? 'ocupado' : 'livre'} ` +
                  `${(appointmentInSlot && openDropdownId === appointmentInSlot.id) ? 'has-open-dropdown' : ''}`
                }
              >
                {appointmentInSlot ? (
                  <Card className="appointment-details-card-agenda h-100">
                    <Card.Body>
                      <Card.Title className="cliente-nome-agenda">{appointmentInSlot.nomeUsuario || "Cliente"}</Card.Title>
                      <Card.Text className="servicos-agenda">
                        {appointmentInSlot.servicos && appointmentInSlot.servicos.length > 0
                          ? appointmentInSlot.servicos.map((s) => s.descricao).join(' | ')
                          : <span className="text-muted-agenda">Serviço não detalhado</span>}
                      </Card.Text>
                      <div className="status-e-acoes-agenda">
                        <span className={`status-badge status-${appointmentInSlot.statusAgendamento?.toLowerCase()}`}>{appointmentInSlot.statusAgendamento}</span>
                        <Dropdown
                          drop="start"
                          className="actions-dropdown-container"
                          onToggle={handleDropdownToggle}
                        >
                          <Dropdown.Toggle
                            variant="link"
                            id={`dropdown-actions-${appointmentInSlot.id}`}
                            className="actions-dropdown-toggle p-0"
                          >
                            <MoreVertical size={18} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu variant="dark">
                            <Dropdown.Item onClick={() => handleChangeStatus(appointmentInSlot.id, 'ATENDIDO')}>Marcar Atendido</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleChangeStatus(appointmentInSlot.id, 'ESPERA')}>Marcar em Espera</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleChangeStatus(appointmentInSlot.id, 'DESMARCADO')}>Desmarcar</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => handleEditAppointment(appointmentInSlot.id)}>Editar Agendamento</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </Card.Body>
                  </Card>
                ) : ( <span className="slot-livre-text"></span> )}
              </div>
            </React.Fragment>
          );
        })}

        {!isLoading && !error && timeGridSlots.length > 0 && appointmentsForDay.length === 0 && (
            <div className="text-center micro-text text-muted mt-4 py-3 grid-column-span-2">
                Nenhum agendamento para {NOME_FUNCIONARIO_ATUAL} neste dia.
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="agenda-page-container text-white">
      <Container fluid>
        <Row className="mb-3 align-items-center sticky-top-config">
          <Col xs={12} md={4} lg={3}>
            <h2 className="page-title mb-2 mb-md-0">Agenda da Barbearia</h2>
          </Col>
          <Col xs={12} md={5} lg={6} className="d-flex justify-content-md-center my-2 my-md-0">
            <div className="seletor-data-agenda-dropdown" ref={calendarContainerRef}>
              <BootstrapButton
                onClick={() => setShowCalendar(prev => !prev)}
                className="botao-data-agenda"
                aria-expanded={showCalendar}
              >
                <CalendarIcon size={18} className="me-2" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Escolher data"}
              </BootstrapButton>

              {showCalendar && (
                <div className="calendario-dropdown-container">
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
                    defaultMonth={selectedDate || new Date()}
                  />
                </div>
              )}
            </div>
          </Col>
          <Col xs={12} md={3} lg={3} className="text-md-end mt-2 mt-md-0">
            <BootstrapButton onClick={handleAddNewAppointmentGeneral} className="action-btn add-new-btn">
              <PlusCircle size={18} className="me-2" /> Novo Agendamento
            </BootstrapButton>
          </Col>
        </Row>
        <p className="text-center micro-text mb-3">
          Exibindo agenda para: {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Nenhuma data selecionada'}
        </p>

        {renderAgendaGrid()}

      </Container>
    </div>
  );
};

export default AgendaVisaoFuncionario;