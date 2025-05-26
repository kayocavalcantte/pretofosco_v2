import api from './axios';

export const login = async (email: string, senha: string) => {
  const res = await api.post('/auth/login', { email, senha });
  return res.data.token;
};

export const cadastrarUsuario = async (dados: any) => {
  const res = await api.post('/auth/cadastro', dados);
  return res.data;
};

export const getPerfil = async () => {
  const res = await api.get('/perfil');
  return res.data;
};
