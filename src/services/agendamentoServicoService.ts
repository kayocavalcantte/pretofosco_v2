import api from './axios';

export const listarServicosPorAgendamento = async (agendamentoId: number) => {
  const response = await api.get(`/agendamento-servico/por-agendamento/${agendamentoId}`);
  return response.data;
};
