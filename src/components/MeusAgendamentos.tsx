import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/axios';
import '../styles/MeusAgendamentos.scss';
import ServicosDoAgendamento from '../components/ServicosDoAgendamento';


interface Servico {
  id: number;
  descricao: string;
}
interface AgendamentoStatusDto {
  id: number;
  statusAgendamento: 'ESPERA' | 'DESMARCADO' | 'ATENDIDO';
}

interface Agendamento {
  id: number;
  servicos: Servico[];
  dataAgendamento: string;
  horario: string;
  statusAgendamento: 'ESPERA' | 'DESMARCADO' | 'ATENDIDO';
}

const MeusAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const usuarioId = localStorage.getItem('userId');
        const response = await api.get(`/agendamento/list/usuario/${usuarioId}`);
        setAgendamentos(response.data);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      }
    };

    fetchAgendamentos();
  }, []);

  const cancelarAgendamento = async (id: number) => {
    if (confirm('Deseja cancelar este agendamento?')) {
      try {
        await api.put('/agendamento/edit/status', {
          id: id,
          statusAgendamento: 'DESMARCADO'
        });
  
        setAgendamentos(prev =>
          prev.map(ag =>
            ag.id === id ? { ...ag, statusAgendamento: 'DESMARCADO' } : ag
          )
        );
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        alert('Erro ao cancelar agendamento. Tente novamente.');
      }
    }
  };
  
  

  const editarAgendamento = (id: number) => {
    alert(`Função de edição para o agendamento #${id} ainda será implementada.`);
  };

  const traduzirStatus = (status: string) => {
    switch (status) {
      case 'ESPERA': return '🕒 Em espera';
      case 'DESMARCADO': return '❌ Cancelado';
      case 'ATENDIDO': return '✅ Concluído';
    default: return status;
  }
};


  return (
    <section className="meus-agendamentos-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <h2 className="text-center mb-4">Meus Agendamentos</h2>

            {agendamentos.length === 0 ? (
              <p className="text-center text-muted">Nenhum agendamento encontrado.</p>
            ) : (
              agendamentos.map((ag) => (
                <Card key={ag.id} className="agendamento-card mb-3">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                    <h5 className="mb-1">
                      <ServicosDoAgendamento agendamentoId={ag.id} />
                    </h5>

                      <p className="mb-0">{ag.dataAgendamento} às {ag.horario}</p>
                      <p className={`status-label ${ag.statusAgendamento.toLowerCase()}`}>
                        {traduzirStatus(ag.statusAgendamento)}
                      </p>
                    </div>
                    <div className="d-flex gap-3">
                      <span
                        className="icon-btn"
                        onClick={() => editarAgendamento(ag.id)}
                        aria-label="Editar agendamento"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') editarAgendamento(ag.id); }}
                      >
                        <FaEdit />
                      </span>

                      <span
                        className="icon-btn trash"
                        onClick={() => cancelarAgendamento(ag.id)}
                        aria-label="Cancelar agendamento"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') cancelarAgendamento(ag.id); }}
                      >
                        <FaTrash />
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default MeusAgendamentos;
