import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/axios';
import '../styles/Agenda.scss';

interface FuncionarioInfo {
  id: number;
  usuarioId: number;
  nome: string;
  horarioInicio?: string;
  horarioFinal?: string;
  ativo?: boolean;
}

interface AppointmentInfo {
  id: number;
  funcionarioId: number;
  usuarioId: number;
  horario: string;
  dataAgendamento: string; // ESPERADO COMO "yyyy-MM-dd" DO BACKEND
  statusAgendamento: string;
  nomeUsuario: string;
  servicos?: { id: number; descricao: string }[];
}

const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr || !timeStr.includes(':')) { return 0; }
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) { return 0; }
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const AgendaFuncionario: React.FC = () => {
  const { userId: loggedInUserAccountId } = useAuth(); 

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointmentsForDay, setAppointmentsForDay] = useState<AppointmentInfo[]>([]);
  const [currentEmployeeDetails, setCurrentEmployeeDetails] = useState<FuncionarioInfo | null>(null);
  const [timeGridSlots, setTimeGridSlots] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true); // Um único estado de loading
  const [error, setError] = useState<string | null>(null);

  // 1. BUSCAR DETALHES DO FUNCIONÁRIO LOGADO
  useEffect(() => {
    // Só executa se loggedInUserAccountId tiver um valor.
    // Se for null inicialmente (AuthContext carregando), este efeito espera.
    if (loggedInUserAccountId) {
      const fetchCurrentEmployeeDetails = async () => {
        setIsLoading(true); // Inicia o loading geral
        setError(null);     // Limpa erros anteriores ao tentar buscar
        setCurrentEmployeeDetails(null); // Limpa detalhes antigos
        setTimeGridSlots([]);      // Limpa dados dependentes
        setAppointmentsForDay([]); // Limpa dados dependentes

        try {
          console.log(`[AgendaFuncionario DEBUG] Buscando detalhes do funcionário logado via /funcionario/list-usuario (Auth UserID: ${loggedInUserAccountId})...`);
          const response = await api.get<FuncionarioInfo | null>('/funcionario/list-usuario'); 
          const employeeData = response.data;
          console.log("[AgendaFuncionario DEBUG] Detalhes do funcionário logado recebidos:", employeeData);

          if (employeeData && employeeData.horarioInicio && employeeData.horarioFinal) {
            setCurrentEmployeeDetails(employeeData);
            // Não paramos o isLoading aqui, pois o próximo useEffect (de agendamentos) vai continuar.
          } else if (employeeData) {
            setError(`Horários de início/fim não definidos para ${employeeData.nome}.`);
            setIsLoading(false); // Paramos o loading se não podemos prosseguir
          } else {
            setError(`Funcionário não encontrado para o usuário logado.`);
            setIsLoading(false); // Paramos o loading
          }
        } catch (err: any) {
          console.error("[AgendaFuncionario DEBUG] Erro ao buscar detalhes do funcionário:", err);
          if(err.response?.status === 401 || err.response?.status === 403){
              setError("Você não tem permissão para ver estes dados ou sua sessão expirou.");
          } else {
              setError("Erro ao carregar dados do funcionário.");
          }
          setIsLoading(false); // Paramos o loading em caso de erro
        }
      };
      fetchCurrentEmployeeDetails();
    } else {
      // Se não há loggedInUserAccountId (ex: AuthContext ainda carregando ou usuário deslogado)
      // A proteção de rota em App.tsx deve idealmente lidar com o caso de deslogado.
      // Se chega aqui, pode ser que o AuthContext ainda não inicializou o userId.
      setError("Autenticação pendente ou usuário não logado.");
      setIsLoading(false); // Paramos o loading se não há ID para buscar
      setCurrentEmployeeDetails(null);
      setTimeGridSlots([]);
      setAppointmentsForDay([]);
    }
  }, [loggedInUserAccountId]);


  // 2. BUSCAR AGENDAMENTOS E GERAR GRADE VISUAL (QUANDO DATA OU DETALHES DO FUNCIONÁRIO MUDAM)
  useEffect(() => {
    if (!selectedDate || !currentEmployeeDetails || !currentEmployeeDetails.horarioInicio || !currentEmployeeDetails.horarioFinal) {
      // Se as condições não são atendidas, limpa os dados e para.
      // Se currentEmployeeDetails for null, o useEffect acima já deve ter setado um erro ou ainda estar em loading.
      setAppointmentsForDay([]);
      setTimeGridSlots([]);
      // Se o currentEmployeeDetails é null aqui, e o isLoading do effect anterior já terminou (ou seja, falhou), 
      // o estado de erro já deve estar setado. Não precisamos setar isLoading para false aqui necessariamente, 
      // a menos que tenhamos certeza que o effect anterior terminou.
      // O finally do fetchAppointmentsAndGenerateGrid vai cuidar do setIsLoading(false)
      return;
    }

    const fetchAppointmentsAndGenerateGrid = async () => {
      // Se o primeiro useEffect ainda está rodando para buscar currentEmployeeDetails, não precisamos setar isLoading=true de novo.
      // Mas se currentEmployeeDetails já está pronto, então esta é uma nova operação de loading.
      if (!isLoading) setIsLoading(true); 
      setError(null); // Limpa erros de buscas anteriores de agendamentos

      try {
        console.log(`[AgendaFuncionario DEBUG] Buscando agendamentos para funcionário (ID ${currentEmployeeDetails.id}) para a data: ${format(selectedDate, 'dd/MM/yyyy')}`);
        const response = await api.get<AppointmentInfo[]>('/agendamento/list/funcionario');
        const allAppointmentsForEmployee = response.data || [];
        console.log("[AgendaFuncionario DEBUG] Todos agendamentos do funcionário logado recebidos:", allAppointmentsForEmployee);

        const dateStringToCompare = format(selectedDate, 'yyyy-MM-dd'); 
        
        const filteredAppointments = allAppointmentsForEmployee.filter(
          (app) => app.dataAgendamento === dateStringToCompare && app.statusAgendamento !== 'DESMARCADO'
        );
        setAppointmentsForDay(filteredAppointments);
        console.log(`[AgendaFuncionario DEBUG] Agendamentos filtrados para ${dateStringToCompare}:`, filteredAppointments);

        const slots: string[] = [];
        const inicioMin = timeToMinutes(currentEmployeeDetails.horarioInicio);
        const fimMin = timeToMinutes(currentEmployeeDetails.horarioFinal);
        
        if (inicioMin >= fimMin && !(inicioMin === 0 && fimMin === 0 && currentEmployeeDetails.horarioInicio !== "00:00")) {
            const errorMsg = `Horário de início (${currentEmployeeDetails.horarioInicio}) é inconsistente com o horário final (${currentEmployeeDetails.horarioFinal}).`;
            // Não sobrescrever o erro principal se já houver um, mas podemos logar.
            console.warn("[AgendaFuncionario DEBUG]", errorMsg, currentEmployeeDetails);
            if (!error) setError(errorMsg); // Define o erro se não houver um mais prioritário
            setTimeGridSlots([]);
        } else {
            const intervaloMin = 60; 
            for (let currentMin = inicioMin; currentMin < fimMin; currentMin += intervaloMin) {
                slots.push(minutesToTime(currentMin));
            }
            setTimeGridSlots(slots);
            console.log("[AgendaFuncionario DEBUG] Slots da grade gerados (antes de marcar ocupados):", slots);
        }
      } catch (err: any) {
        console.error("[AgendaFuncionario DEBUG] Erro ao buscar agendamentos ou gerar grade:", err);
        if(err.response?.status === 401 || err.response?.status === 403){
            setError("Você não tem permissão para ver estes agendamentos ou sua sessão expirou.");
        } else {
            setError("Não foi possível carregar os agendamentos do dia.");
        }
        setAppointmentsForDay([]);
        setTimeGridSlots([]);
      } finally {
        setIsLoading(false); // Finaliza o loading após esta operação
      }
    };

    fetchAppointmentsAndGenerateGrid();
  }, [selectedDate, currentEmployeeDetails]); // Removido isLoading da dependência para evitar loops


  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // Os useEffects cuidarão de buscar os dados e limpar os antigos.
  };
  
  // ----- RENDERIZAÇÃO -----

  // Estado de Loading inicial ou se o usuário não estiver logado/autenticado.
  if (isLoading && (!currentEmployeeDetails || !selectedDate) ) { 
    // Se error já foi setado pelo primeiro useEffect (ex: usuário não logado), não mostra spinner.
    if (error) {
        return (<Container className="text-center py-5"><Alert variant="danger">{error}</Alert></Container>);
    }
    return (<Container className="text-center py-5"><Spinner animation="border" variant="light" /><p className="mt-2 micro-text text-white">Carregando dados da agenda...</p></Container>);
  }

  // Se houve um erro após a tentativa de carregar dados do funcionário.
  if (error && !currentEmployeeDetails) { // Erro prioritário se não temos detalhes do funcionário
    return (<Container className="text-center py-5"><Alert variant="danger">{error}</Alert></Container>);
  }

  // Se, após o loading, não temos detalhes do funcionário (ex: não é um funcionário válido).
  if (!isLoading && !currentEmployeeDetails) {
    return (<Container className="text-center py-5"><Alert variant="warning">{error || "Não foi possível carregar os detalhes do funcionário para exibir a agenda."}</Alert></Container>);
  }
  
  // Se temos detalhes do funcionário, mas estamos carregando os agendamentos/slots.
  if (isLoading && currentEmployeeDetails) {
     return (<Container className="text-center py-5"><Spinner animation="border" variant="light" /><p className="mt-2 micro-text text-white">Carregando horários e agendamentos...</p></Container>);
  }
  
  // Se houve um erro ao carregar agendamentos (mas já temos os detalhes do funcionário).
  if (error && currentEmployeeDetails) {
     return (<Container className="text-center py-5"><Alert variant="danger">{error}</Alert><Button onClick={() => { /* Lógica para tentar novamente */}}>Tentar Novamente</Button></Container>);
  }


  return (
    <div className="agenda-container-funcionario text-white">
      <Container fluid>
        <Row className="mb-4 align-items-center">
          <Col xs={12} md={6}>
            {/* Garante que currentEmployeeDetails existe antes de tentar acessar nome */}
            <h2 className="page-title mb-0">Agenda de {currentEmployeeDetails?.nome || 'Funcionário'}</h2>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
            <div className="seletor-data-agenda">
              <span className='me-2'>Data:</span>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                className="day-picker-inline"
                footer={selectedDate ? `Exibindo agenda para: ${format(selectedDate, 'PPP', { locale: ptBR })}` : 'Escolha uma data para ver a agenda.'}
              />
            </div>
          </Col>
        </Row>

        {!selectedDate ? (
            <Alert variant="info" className="text-center">Por favor, selecione uma data para visualizar a agenda.</Alert>
        // Verifica se currentEmployeeDetails e seus horários estão definidos antes de prosseguir
        ) : (!currentEmployeeDetails?.horarioInicio || !currentEmployeeDetails?.horarioFinal) ? (
            <Alert variant="info" className="text-center">
                Expediente do funcionário não configurado.
            </Alert>
        ) : timeGridSlots.length === 0 && !isLoading ? ( 
            <Alert variant="info" className="text-center">
                Não há horários para exibir para {currentEmployeeDetails.nome} (Expediente: {currentEmployeeDetails.horarioInicio} - {currentEmployeeDetails.horarioFinal}).
            </Alert>
        ) : (
          <div className="agenda-grid-funcionario">
            <div className="agenda-header-funcionario sticky-top">Horário</div>
            <div className="agenda-header-funcionario sticky-top">Agendamentos de {currentEmployeeDetails.nome}</div> 
            
            {timeGridSlots.map((timeSlot) => {
              const appointmentInSlot = appointmentsForDay.find(app => app.horario === timeSlot);
              return (
                <React.Fragment key={timeSlot}>
                  <div className="hora-label-funcionario">{timeSlot}</div>
                  <div className={`celula-agenda-funcionario ${appointmentInSlot ? 'ocupado' : 'livre'}`}>
                    {appointmentInSlot ? (
                      <Card bg="dark" text="white" className="appointment-details-card h-100">
                        <Card.Body>
                          <Card.Title style={{fontSize: '0.9rem', color: '#E0AFFF'}}>{appointmentInSlot.nomeUsuario}</Card.Title>
                          <Card.Text style={{fontSize: '0.8rem'}}>
                            {appointmentInSlot.servicos && appointmentInSlot.servicos.length > 0
                              ? appointmentInSlot.servicos.map(s => s.descricao).join(', ')
                              : 'Serviço(s) não especificado(s).'}
                          </Card.Text>
                           <small className="text-light-emphasis">Status: {appointmentInSlot.statusAgendamento}</small>
                        </Card.Body>
                      </Card>
                    ) : (
                       <span className="slot-livre-text"></span>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};

export default AgendaFuncionario;