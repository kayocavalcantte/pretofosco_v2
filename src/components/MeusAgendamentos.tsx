import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap'; // Adicionado Spinner, Alert, Button
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import api from '../services/axios'; // Ajuste o caminho se necessário
import '../styles/MeusAgendamentos.scss'; // Certifique-se que este caminho está correto

// Interface para os serviços aninhados no agendamento
interface Servico {
  id: number; // ou string, dependendo do seu ServicoVmGeral
  descricao: string;
  // Outros campos do ServicoVmGeral se houver (ex: preco)
}

// Interface para cada objeto de agendamento na lista
interface Agendamento {
  id: number;
  funcionarioId: number; // Adicionando para possível uso futuro ou display
  usuarioId: number;
  horario: string;
  dataAgendamento: string; // Backend provavelmente envia como dd/MM/yyyy ou yyyy-MM-dd
  statusAgendamento: 'ESPERA' | 'DESMARCADO' | 'ATENDIDO' | string; // string para outros status
  crc: string;
  nomeUsuario?: string;   // Nome do cliente (do toVm)
  emailUsuario?: string;  // Email do cliente
  telefoneUsuario?: string; // Telefone do cliente
  // Adicionando nome do funcionário se o backend puder fornecer (opcional)
  // nomeFuncionario?: string; 
  servicos: Servico[]; // Lista de serviços já incluída pelo backend
}


const MeusAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Para a função de edição

  const fetchAgendamentos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Chama o endpoint que usa o SecurityContextHolder para pegar o usuário logado
      const response = await api.get<Agendamento[]>('/agendamento/list-usuario');
      // Ordenar agendamentos: mais recentes primeiro (ou outra lógica que preferir)
      const agendamentosOrdenados = response.data.sort((a, b) => {
        // Converte data dd/MM/yyyy para yyyy-MM-dd para comparação correta
        const dataA = a.dataAgendamento.split('/').reverse().join('-');
        const dataB = b.dataAgendamento.split('/').reverse().join('-');
        if (dataA > dataB) return -1;
        if (dataA < dataB) return 1;
        // Se as datas forem iguais, ordena pelo horário
        if (a.horario > b.horario) return -1;
        if (a.horario < b.horario) return 1;
        return 0;
      });
      setAgendamentos(agendamentosOrdenados);
    } catch (err: any) {
      console.error('Erro ao buscar agendamentos:', err);
      setError(err.response?.data?.message || err.message || 'Não foi possível carregar seus agendamentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  const cancelarAgendamento = async (id: number) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        // DTO para o backend de atualização de status
        const statusDto = {
          id: id,
          statusAgendamento: 'DESMARCADO'
        };
        await api.put('/agendamento/edit/status', statusDto);
  
        // Atualiza o estado local para refletir a mudança imediatamente
        setAgendamentos(prevAgendamentos =>
          prevAgendamentos.map(ag =>
            ag.id === id ? { ...ag, statusAgendamento: 'DESMARCADO' } : ag
          )
        );
        alert('Agendamento cancelado com sucesso!');
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        alert('Erro ao cancelar agendamento. Tente novamente mais tarde.');
      }
    }
  };
  
  const editarAgendamento = (id: number) => {
    // Navegar para uma página de edição, passando o ID do agendamento
    // Você precisará criar essa rota e o componente de edição.
    // Exemplo: navigate(`/agendamentos/editar/${id}`);
    alert(`Função de edição para o agendamento #${id} ainda será implementada.\nVocê seria redirecionado para uma página de edição.`);
  };

  const traduzirStatus = (status: string) => {
    switch (status) {
      case 'ESPERA': return '🕒 Em espera';
      case 'DESMARCADO': return '❌ Cancelado';
      case 'ATENDIDO': return '✅ Concluído';
      default: return status;
    }
  };

  // Função para formatar a data para exibição, se necessário
  const formatarDataExibicao = (dataStr: string) => {
    // Se a data já vier como dd/MM/yyyy do backend, não precisa de muita formatação.
    // Se vier como yyyy-MM-dd, você pode querer formatá-la.
    // Exemplo simples assumindo que já está ok ou você quer exibir como está:
    if (dataStr.includes('-')) { // Checa se é yyyy-MM-dd
        const parts = dataStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // Converte para dd/MM/yyyy
    }
    return dataStr; // Retorna como está se já for dd/MM/yyyy ou outro formato
  };


  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="light" />
        <p className="mt-2 micro-text text-white">Carregando seus agendamentos...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={fetchAgendamentos}>Tentar Novamente</Button>
      </Container>
    );
  }

  return (
    <section className="meus-agendamentos-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <h2 className="text-center mb-4 text-white page-title">Meus Agendamentos</h2>

            {agendamentos.length === 0 ? (
              <Card className="agendamento-card-empty text-center">
                <Card.Body>
                  <p className="text-muted">Você ainda não possui agendamentos.</p>
                  <Button variant="success" className="neon-btn mt-3" onClick={() => navigate('/agendamentos')}>
                    Fazer um novo agendamento
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              agendamentos.map((ag) => (
                <Card key={ag.id} className={`agendamento-card mb-3 status-${ag.statusAgendamento.toLowerCase()}`}>
                  <Card.Header className="d-flex justify-content-between align-items-center card-header-custom">
                    <span>Data: {formatarDataExibicao(ag.dataAgendamento)} às {ag.horario}</span>
                    <span className={`status-label status-label-header ${ag.statusAgendamento.toLowerCase()}`}>
                      {traduzirStatus(ag.statusAgendamento)}
                    </span>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                        <h5 className="card-title-custom mb-2">Serviços:</h5>
                        {ag.servicos && ag.servicos.length > 0 ? (
                            <ul className="list-unstyled mb-0 services-list">
                            {ag.servicos.map(servico => (
                                <li key={servico.id}>- {servico.descricao}</li>
                            ))}
                            </ul>
                        ) : (
                            <p className="mb-0 text-muted small">Nenhum serviço especificado.</p>
                        )}
                        </div>
                        {/* Mostra botões apenas se o agendamento estiver em ESPERA */}
                        {ag.statusAgendamento === 'ESPERA' && (
                        <div className="d-flex gap-3 agendamento-actions">
                            <span
                            className="icon-btn edit"
                            onClick={() => editarAgendamento(ag.id)}
                            title="Editar agendamento"
                            role="button" tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') editarAgendamento(ag.id); }}
                            >
                            <FaEdit />
                            </span>

                            <span
                            className="icon-btn trash"
                            onClick={() => cancelarAgendamento(ag.id)}
                            title="Cancelar agendamento"
                            role="button" tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') cancelarAgendamento(ag.id); }}
                            >
                            <FaTrash />
                            </span>
                        </div>
                        )}
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