import React, { useEffect, useState } from 'react';
import { listarServicosPorAgendamento } from '../services/agendamentoServicoService';

interface Servico {
  id: number;
  descricao: string;
}

interface Props {
  agendamentoId: number;
}

const ServicosDoAgendamento: React.FC<Props> = ({ agendamentoId }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const data = await listarServicosPorAgendamento(agendamentoId);
        setServicos(data);
      } catch (e) {
        console.error('Erro ao buscar serviços do agendamento', e);
      }
    };
    fetchServicos();
  }, [agendamentoId]);

  if (servicos.length === 0) return <>...</>; // ou "Carregando..."

  return (
    <>
      {servicos.map(s => s.descricao).join(', ')}
    </>
  );
};

export default ServicosDoAgendamento;
