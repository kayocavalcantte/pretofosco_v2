import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import api from '../services/axios';

interface Props {
  funcionarioId: number;
  data: string; // formato 'yyyy-MM-dd'
  onSelecionar: (hora: string) => void;
}

const horariosPadrao = ['10:00', '11:30', '14:00', '16:30', '18:00'];

const SelecionarHorarioDisponivel: React.FC<Props> = ({ funcionarioId, data, onSelecionar }) => {
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  useEffect(() => {
    const fetchHorarios = async () => {
      if (!data) {
        setHorariosOcupados([]);
        return;
      }

      try {
        const res = await api.get('/agendamento/list/horario-data', {
          params: { horario: '', dataAgendamento: data },
        });

        const ocupados = res.data
          .filter((a: any) => a.funcionarioId === funcionarioId)
          .map((a: any) => a.horario);

        setHorariosOcupados(ocupados);
      } catch (err) {
        console.error('Erro ao buscar horários:', err);
      }
    };

    fetchHorarios();
  }, [data, funcionarioId]);

  const horariosDisponiveis = horariosPadrao.filter(h => !horariosOcupados.includes(h));

  const selecionar = (hora: string) => {
    setHorarioSelecionado(hora);
    onSelecionar(hora);
  };

  return (
    <div className="my-3">
      <label className="form-label d-block">Horários disponíveis</label>
      {horariosDisponiveis.length === 0 ? (
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
