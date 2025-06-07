import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Container, Row, Col, Card, Spinner, Alert, Button as BootstrapButton, Dropdown } from 'react-bootstrap';
import api from '../services/axios';
import '../styles/Agenda.scss';
import { Edit3, PlusCircle, MoreVertical, Calendar as CalendarIcon } from 'lucide-react';
import NovoAgendamentoModal from '../components/NovoAgendamento';

const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr || !timeStr.includes(':')) return -1;
  try {
    const referenceDate = new Date();
    const parsedTime = parse(timeStr, timeStr.length === 5 ? 'HH:mm' : 'HH:mm:ss', referenceDate);
    return parsedTime.getHours() * 60 + parsedTime.getMinutes();
  } catch (e) {
    return -1;
  }
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const Agenda: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [appointmentsForDay, setAppointmentsForDay] = useState<any[]>([]);
  const [timeGridSlots, setTimeGridSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showNovoModal, setShowNovoModal] = useState(false);

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
      setError('Horário inválido.');
      setTimeGridSlots([]);
      return false;
    }
    setError(null);
    for (let currentMin = inicioMin; currentMin < fimMin; currentMin += INTERVALO_MINUTOS) {
      slots.push(minutesToTime(currentMin));
    }
    setTimeGridSlots(slots);
    return true;
  }, []);

  const fetchAppointmentsForSelectedDate = useCallback(async (date: Date) => {
    if (!generateTimeGridSlots()) {
      setAppointmentsForDay([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/agendamento/list/funcionario/${ID_FUNCIONARIO_ATUAL}`);
      const allAppointmentsForEmployee = response.data || [];
      const dateStringToCompare = format(date, 'yyyy-MM-dd');
      const filteredAppointments = allAppointmentsForEmployee.filter(app =>
        app.dataAgendamento === dateStringToCompare && app.statusAgendamento !== 'DESMARCADO'
      );
      setAppointmentsForDay(filteredAppointments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar agendamentos.');
    } finally {
      setIsLoading(false);
    }
  }, [generateTimeGridSlots]);

  useEffect(() => {
    fetchAppointmentsForSelectedDate(selectedDate);
  }, [selectedDate, fetchAppointmentsForSelectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
      setShowCalendar(false);
    }
  };

  const handleChangeStatus = async (appointmentId: number, newStatus: string) => {
    setIsLoading(true);
    try {
      await api.put('/agendamento/edit/status', { id: appointmentId, statusAgendamento: newStatus });
      fetchAppointmentsForSelectedDate(selectedDate);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao alterar status.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAgendaGrid = () => {
    if (isLoading && timeGridSlots.length === 0) {
      return <div className="text-center py-4"><Spinner animation="border" variant="light" /></div>;
    }
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!selectedDate) return <Alert variant="info">Selecione uma data</Alert>;

    return (
      <div className="agenda-grid-funcionario">
        <div className="agenda-header-funcionario sticky-header-funcionario">Horário</div>
        <div className="agenda-header-funcionario sticky-header-funcionario">{NOME_FUNCIONARIO_ATUAL}</div>
        {timeGridSlots.map((timeSlot) => {
          const appointment = appointmentsForDay.find(app => app.horario === timeSlot);
          return (
            <React.Fragment key={timeSlot}>
              <div className="hora-label-funcionario">{timeSlot}</div>
              <div className={`celula-agenda-funcionario ${appointment ? 'ocupado' : 'livre'}`}>
                {appointment ? (
                  <Card className="appointment-details-card-agenda h-100">
                    <Card.Body>
                      <Card.Title className="cliente-nome-agenda">{appointment.nomeUsuario || 'Cliente'}</Card.Title>
                      <Card.Text className="servicos-agenda">
                        {appointment.servicos && appointment.servicos.length > 0
                          ? appointment.servicos.map((s: any) => s.descricao).join(' | ')
                          : <span className="text-muted-agenda">Sem serviços</span>}
                      </Card.Text>
                      <div className="status-e-acoes-agenda">
                        <span className={`status-badge status-${appointment.statusAgendamento.toLowerCase()}`}>{appointment.statusAgendamento}</span>
                        <Dropdown drop="start">
                          <Dropdown.Toggle variant="link" className="p-0">
                            <MoreVertical size={18} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu variant="dark">
                            <Dropdown.Item onClick={() => handleChangeStatus(appointment.id, 'ATENDIDO')}>Marcar Atendido</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleChangeStatus(appointment.id, 'ESPERA')}>Marcar Espera</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleChangeStatus(appointment.id, 'DESMARCADO')}>Desmarcar</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </Card.Body>
                  </Card>
                ) : <span className="slot-livre-text"></span>}
              </div>
            </React.Fragment>
          );
        })}
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
          <Col xs={12} md={5} lg={6} className="d-flex justify-content-md-center">
            <div className="seletor-data-agenda-dropdown" ref={calendarContainerRef}>
              <BootstrapButton
                onClick={() => setShowCalendar(prev => !prev)}
                className="botao-data-agenda"
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
          <Col xs={12} md={3} lg={3} className="text-md-end">
            <BootstrapButton onClick={() => setShowNovoModal(true)} className="action-btn add-new-btn">
              <PlusCircle size={18} className="me-2" /> Novo Agendamento
            </BootstrapButton>
          </Col>
        </Row>
        <p className="text-center micro-text mb-3">
          Exibindo agenda para: {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Nenhuma data selecionada'}
        </p>
        {renderAgendaGrid()}
        <NovoAgendamentoModal
          show={showNovoModal}
          onHide={() => setShowNovoModal(false)}
          selectedDate={selectedDate}
          funcionarioId={ID_FUNCIONARIO_ATUAL}
          onAgendamentoCriado={() => fetchAppointmentsForSelectedDate(selectedDate)}
        />
      </Container>
    </div>
  );
};

export default Agenda;
