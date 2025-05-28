import api from './axios';

export const criarAgendamento = async (dados: any) => {
  const res = await api.post('/agendamentos', dados);
  return res.data;
};

export const listarMeusAgendamentos = async () => {
  const res = await api.get('/meus-agendamentos');
  return res.data;
};
export const listarHorariosDisponiveis = async (funcionarioId: number, data: string): Promise<string[]> => {
  const response = await api.get('/agendamento/horarios-disponiveis', {
    params: { funcionarioId, dataAgendamento: data }
  });
  return response.data;
};
