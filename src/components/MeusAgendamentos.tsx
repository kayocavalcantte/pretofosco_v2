import React, { useState } from 'react';
import { Container, Row, Col, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/MeusAgendamentos.scss';

interface Agendamento {
  id: number;
  servico: string;
  data: string;
  hora: string;
  status: 'em espera' | 'cancelado' | 'concluido';
}

const MeusAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([
    { id: 1, servico: 'Corte de cabelo', data: '20/05/2025', hora: '10:00', status: 'em espera' },
    { id: 2, servico: 'Pintura', data: '23/05/2025', hora: '14:30', status: 'concluido' },
    { id: 3, servico: 'Sobrancelha', data: '25/05/2025', hora: '15:00', status: 'cancelado' },
  ]);

  const cancelarAgendamento = (id: number) => {
    if (confirm('Deseja cancelar este agendamento?')) {
      setAgendamentos(prev => prev.map(ag =>
        ag.id === id ? { ...ag, status: 'cancelado' } : ag
      ));
    }
  };

  const editarAgendamento = (id: number) => {
    alert(`Função de edição para o agendamento #${id} ainda será implementada.`);
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
                      <h5 className="mb-1">{ag.servico}</h5>
                      <p className="mb-0">{ag.data} às {ag.hora}</p>
                      <p className={`status-label ${ag.status.replace(' ', '-')}`}>
                        {ag.status === 'em espera' && '🕒 Em espera'}
                        {ag.status === 'concluido' && '✅ Concluído'}
                        {ag.status === 'cancelado' && '❌ Cancelado'}
                      </p>
                    </div>
                    <div className="d-flex gap-3">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-edit-${ag.id}`}>Editar</Tooltip>}
                      >
                        <span className="icon-btn" onClick={() => editarAgendamento(ag.id)}>
                          <FaEdit />
                        </span>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-cancel-${ag.id}`}>Cancelar</Tooltip>}
                      >
                        <span className="icon-btn trash" onClick={() => cancelarAgendamento(ag.id)}>
                          <FaTrash />
                        </span>
                      </OverlayTrigger>
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
