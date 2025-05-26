import api from './axios';

export const listarServicos = async () => {
  const res = await api.get('/servicos');
  return res.data;
};
export const login = async (email: string, senha: string) => {
  const res = await api.post('/auth/login', { email, senha });
  return res.data.token;
};
