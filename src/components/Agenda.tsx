import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import SelecionarServicos from '../components/SelecionarServicos';
import SelecionarHorarioDisponivel from '../components/SelecionarHorarioDisponivel';
import api from '../services/axios';
import { useNavigate } from 'react-router-dom';

const FUNCIONARIO_FIXO_ID = 1; // ⚠️ Substitua se necessário

const Agendar: React.FC = () => {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const navigate = useNavigate();

  const handleAgendar = async () => {
    try {
      const agendamentoRes = await api.post('/agendamento', {
        funcionarioId: FUNCIONARIO_FIXO_ID,
        dataAgendamento: data,
        horario: hora
      });

      const agendamentoId = agendamentoRes.data.id;

      await api.post('/agendamento-servico', {
        agendamentoId,
        servicoIds: servicosSelecionados
      });

      alert('Agendamento realizado com sucesso!');
      navigate('/meus-agendamentos');
    } catch (err) {
      console.error('Erro ao agendar:', err);
      alert('Erro ao agendar. Tente novamente.');
    }
  };

  return (
    <Container>
      <h2 className="my-4 text-center">Agendar Horário</h2>
      <Form>
        <Form.Group className="my-3">
          <Form.Label>Data</Form.Label>
          <Form.Control type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </Form.Group>

        <SelecionarHorarioDisponivel
          funcionarioId={FUNCIONARIO_FIXO_ID}
          data={data}
          onSelecionar={setHora}
        />

        <SelecionarServicos onSelecionar={setServicosSelecionados} />

        <Button className="mt-4 w-100" onClick={handleAgendar} disabled={!data || !hora || servicosSelecionados.length === 0}>
          Confirmar Agendamento
        </Button>
      </Form>
    </Container>
  );
};

export default Agendar;
