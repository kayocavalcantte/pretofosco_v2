import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../services/axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  show: boolean;
  onHide: () => void;
  selectedDate: Date;
  funcionarioId: number;
  onAgendamentoCriado: () => void;
}

interface Usuario {
  id: number;
  nome: string;
}

interface Servico {
  id: number;
  descricao: string;
}

const horariosDisponiveis = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00'
];

const NovoAgendamento: React.FC<Props> = ({ show, onHide, selectedDate, funcionarioId, onAgendamentoCriado }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [servicoIds, setServicoIds] = useState<number[]>([]);
  const [horario, setHorario] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (show) {
      api.get<Usuario[]>('/usuario/listar').then(res => setUsuarios(res.data));
      api.get<Servico[]>('/servico/listar').then(res => setServicos(res.data));
    }
  }, [show]);

  const handleClose = () => {
    setUsuarioId(null);
    setServicoIds([]);
    setHorario('');
    setErro(null);
    onHide();
  };

  const handleSubmit = async () => {
    if (!usuarioId || servicoIds.length === 0 || !horario) {
      setErro('Preencha todos os campos.');
      return;
    }

    const payload = {
      usuarioId,
      funcionarioId,
      dataAgendamento: format(selectedDate, 'dd/MM/yyyy'),
      horario,
      servicoIds: servicoIds
    };

    setLoading(true);
    setErro(null);

    try {
      await api.post('/agendamento/funcionario-register-cliente', payload);
      onAgendamentoCriado();
      handleClose();
    } catch (err) {
      setErro('Erro ao registrar agendamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleServicoToggle = (id: number) => {
    setServicoIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Novo Agendamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger">{erro}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Select onChange={e => setUsuarioId(Number(e.target.value))} value={usuarioId || ''}>
            <option value="">Selecione um cliente</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Data</Form.Label>
          <Form.Control type="text" disabled value={format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Horário</Form.Label>
          <Form.Select onChange={e => setHorario(e.target.value)} value={horario}>
            <option value="">Selecione um horário</option>
            {horariosDisponiveis.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Serviços</Form.Label>
          {servicos.map(servico => (
            <Form.Check
              key={servico.id}
              type="checkbox"
              label={servico.descricao}
              checked={servicoIds.includes(servico.id)}
              onChange={() => handleServicoToggle(servico.id)}
            />
          ))}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Salvar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NovoAgendamento;
