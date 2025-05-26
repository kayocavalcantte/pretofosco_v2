import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { listarMeusAgendamentos } from '../services/agendamentoService';
import '../styles/MeusAgendamentos.scss';

interface Servico {
  id: number;
  descricao: string;
}

interface Agendamento {
  id: number;
  dataAgendamento: string;
  horario: string;
  statusAgendamento: 'ESPERA' | 'CANCELADO' | 'ATENDIDO';
  servicos: Servico[];
}

const MeusAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listarMeusAgendamentos();
        setAgendamentos(data);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      }
    };

    fetchData();
  }, []);

  const cancelarAgendamento = (id: number) => {
    if (confirm('Deseja cancelar este agendamento?')) {
      // Aqui em breve você chamará o endpoint de cancelamento real
      setAgendamentos(prev =>
        prev.map(ag =>
          ag.id === id ? { ...ag, statusAgendamento: 'CANCELADO' } : ag
        )
      );
    }
  };

  const editarAgendamento = (id: number) => {
    alert(`Função de edição para o agendamento #${id} ainda será implementada.`);
  };

  const traduzirStatus = (status: string) => {
    switch (status) {
      case 'ESPERA': return '🕒 Em espera';
      case 'CANCELADO': return '❌ Cancelado';
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
                        {ag.servicos.map(s => s.descricao).join(', ')}
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
