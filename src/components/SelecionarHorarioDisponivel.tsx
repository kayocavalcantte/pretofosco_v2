import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import api from '../services/axios';

interface Props {
  funcionarioId: number;
  data: string; // formato 'yyyy-MM-dd'
  onSelecionar: (hora: string) => void;
}

const SelecionarHorarioDisponivel: React.FC<Props> = ({ funcionarioId, data, onSelecionar }) => {
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const fetchHorarios = async () => {
      if (!data) {
        setHorariosDisponiveis([]);
        return;
      }

      setCarregando(true);
      try {
        const res = await api.get('/agendamento/horarios-disponiveis', {
          params: { funcionarioId, dataAgendamento: data }
        });

        setHorariosDisponiveis(res.data);
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        setHorariosDisponiveis([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchHorarios();
  }, [data, funcionarioId]);

  const selecionar = (hora: string) => {
    setHorarioSelecionado(hora);
    onSelecionar(hora);
  };

  return (
    <div className="my-3">
      <label className="form-label d-block">Horários disponíveis</label>

      {carregando ? (
        <Spinner animation="border" />
      ) : horariosDisponiveis.length === 0 ? (
        <p className="text-muted">Nenhum horário disponível neste dia.</p>
      ) : (
        <div className="d-flex flex-wrap gap-2">
          {horariosDisponiveis.map((h) => (
            <Button
              key={h}
              variant={horarioSelecionado === h ? 'success' : 'outline-secondary'}
              onClick={() => selecionar(h)}
            >
              {h}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelecionarHorarioDisponivel;
