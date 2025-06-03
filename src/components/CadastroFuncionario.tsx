import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import '../styles/CadastroFuncionario.scss';

interface FuncionarioRegisterPayload {
  nome: string;
  email: string;
  telefone: string;
  horarioInicio: string;
  horarioFinal: string;
  senha: string;
}

const CadastroFuncionario: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [horarioInicioHora, setHorarioInicioHora] = useState('08');
  const [horarioInicioMinuto, setHorarioInicioMinuto] = useState('00');
  const [horarioFinalHora, setHorarioFinalHora] = useState('18');
  const [horarioFinalMinuto, setHorarioFinalMinuto] = useState('00');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const horasParaSelect = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutosParaSelect = ['00', '15', '30', '45'];

  useEffect(() => {
    if (apiSuccess || apiError) {
      const timer = setTimeout(() => {
        setApiSuccess(null);
        setApiError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [apiSuccess, apiError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LOG 0: handleSubmit INICIADO');
    setApiError(null);
    setApiSuccess(null);

    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      console.log('LOG 1: FALHA VALIDAÇÃO - Campos obrigatórios não preenchidos.');
      console.log({ nome, email, telefone, senha, confirmarSenha });
      setApiError('Preencha todos os campos obrigatórios.');
      return;
    }
    console.log('LOG 2: VALIDAÇÃO - Campos obrigatórios OK.');

    if (senha !== confirmarSenha) {
      console.log('LOG 3: FALHA VALIDAÇÃO - Senhas não coincidem.');
      setApiError('As senhas não coincidem.');
      return;
    }
    console.log('LOG 4: VALIDAÇÃO - Senhas coincidem OK.');

    const horarioInicioCompleto = `${horarioInicioHora}:${horarioInicioMinuto}`;
    const horarioFinalCompleto = `${horarioFinalHora}:${horarioFinalMinuto}`;
    console.log('LOG 5: Horários montados:', { horarioInicioCompleto, horarioFinalCompleto });

    const inicioTotalMinutos = parseInt(horarioInicioHora) * 60 + parseInt(horarioInicioMinuto);
    const finalTotalMinutos = parseInt(horarioFinalHora) * 60 + parseInt(horarioFinalMinuto);

    if (finalTotalMinutos <= inicioTotalMinutos) {
      console.log('LOG 6: FALHA VALIDAÇÃO - Horário final não é posterior ao inicial.');
      setApiError('O horário final deve ser posterior ao horário de início.');
      return;
    }
    console.log('LOG 7: VALIDAÇÃO - Horários OK.');

    const payload: FuncionarioRegisterPayload = {
      nome,
      email,
      telefone,
      horarioInicio: horarioInicioCompleto,
      horarioFinal: horarioFinalCompleto,
      senha,
    };
    console.log('LOG 8: Payload para API construído:', payload);

    setIsLoading(true);
    console.log('LOG 9: isLoading definido como true.');

    try {
      const token = localStorage.getItem('token'); 

      if (!token) {
        console.log('LOG 11: FALHA AUTENTICAÇÃO - Token não encontrado.');
        setApiError('Erro de autenticação: Token de administrador não encontrado. Faça login como admin.');
        setIsLoading(false); // Resetar isLoading se sair aqui
        return;
      }
      console.log('LOG 12: AUTENTICAÇÃO - Token encontrado. Tentando chamada API...');

      const response = await api.post('/funcionario/register', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('LOG 13: Resposta da API:', response);

      if (response.status === 200 || response.status === 201) {
        setApiSuccess(`Funcionário ${response.data.nome} cadastrado com sucesso!`);
        setNome(''); setEmail(''); setTelefone('');
        setHorarioInicioHora('08'); setHorarioInicioMinuto('00');
        setHorarioFinalHora('18'); setHorarioFinalMinuto('00');
        setSenha(''); setConfirmarSenha('');
        setTimeout(() => { navigate('/admin/dashboard'); }, 2000);
      } else {
        console.log(`LOG 14: Resposta inesperada da API - Status: ${response.status}`);
        setApiError(`Resposta inesperada do servidor: ${response.status}`);
      }
    } catch (err: any) {
      console.error('LOG 15: ERRO na chamada API ou no tratamento da resposta:', err);
      if (err.response) {
        console.error('LOG 15.1: Detalhes do erro da API:', err.response.data);
        if (err.response.status === 403) {
          setApiError('Acesso negado. Verifique se você tem permissão de administrador e se o token é válido.');
        } else {
          setApiError(err.response.data?.message || err.response.data?.error || 'Erro ao cadastrar funcionário.');
        }
      } else if (err.request) {
        console.error('LOG 15.2: Erro de requisição (sem resposta da API):', err.request);
        setApiError('Não foi possível conectar ao servidor. Verifique sua conexão e o endereço da API.');
      } else {
        console.error('LOG 15.3: Erro ao configurar a requisição:', err.message);
        setApiError('Erro ao preparar a requisição: ' + err.message);
      }
    } finally {
      console.log('LOG 16: Bloco finally - isLoading definido como false.');
      setIsLoading(false);
    }
  };

  // ... resto do seu componente (JSX) ...
  return (
    <section className="cadastro-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <Card className="cadastro-card">
              <Card.Body>
                <h2 className="text-center mb-4">Cadastrar Funcionário</h2>

                {apiError && <Alert variant="danger" onClose={() => setApiError(null)} dismissible>{apiError}</Alert>}
                {apiSuccess && <Alert variant="success" onClose={() => setApiSuccess(null)} dismissible>{apiSuccess}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Nome Completo */}
                  <Form.Group className="mb-3">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control type="text" placeholder="Digite o nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Digite o email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </Form.Group>

                  {/* Telefone */}
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control type="text" placeholder="Digite o telefone (Ex: 85912345678)" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                  </Form.Group>

                  {/* Horário de Início */}
                  <Form.Group className="mb-3">
                    <Form.Label>Horário de Início</Form.Label>
                    <Row>
                      <Col>
                        <Form.Select value={horarioInicioHora} onChange={(e) => setHorarioInicioHora(e.target.value)} aria-label="Hora de início" required>
                          {horasParaSelect.map(hora => (<option key={`inicio-h-${hora}`} value={hora}>{hora}</option>))}
                        </Form.Select>
                      </Col>
                      <Col xs="auto" className="d-flex align-items-center px-2">:</Col>
                      <Col>
                        <Form.Select value={horarioInicioMinuto} onChange={(e) => setHorarioInicioMinuto(e.target.value)} aria-label="Minuto de início" required>
                          {minutosParaSelect.map(minuto => (<option key={`inicio-m-${minuto}`} value={minuto}>{minuto}</option>))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>

                  {/* Horário Final */}
                  <Form.Group className="mb-3">
                    <Form.Label>Horário Final</Form.Label>
                    <Row>
                      <Col>
                        <Form.Select value={horarioFinalHora} onChange={(e) => setHorarioFinalHora(e.target.value)} aria-label="Hora final" required>
                          {horasParaSelect.map(hora => (<option key={`final-h-${hora}`} value={hora}>{hora}</option>))}
                        </Form.Select>
                      </Col>
                      <Col xs="auto" className="d-flex align-items-center px-2">:</Col>
                      <Col>
                        <Form.Select value={horarioFinalMinuto} onChange={(e) => setHorarioFinalMinuto(e.target.value)} aria-label="Minuto final" required>
                          {minutosParaSelect.map(minuto => (<option key={`final-m-${minuto}`} value={minuto}>{minuto}</option>))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>

                  {/* Senha */}
                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control type="password" placeholder="Crie uma senha (mín. 6 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
                  </Form.Group>

                  {/* Confirmar Senha */}
                  <Form.Group className="mb-4">
                    <Form.Label>Digite a senha novamente</Form.Label>
                    <Form.Control type="password" placeholder="Confirme a senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required minLength={6}/>
                  </Form.Group>

                  <Button type="submit" className="w-100 neon-btn" disabled={isLoading}>
                    {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Cadastrar Funcionário'}
                  </Button>

                  <div className="text-center">
                    <Button type="button" className="voltar-btn" onClick={() => navigate('/admin/dashboard')} disabled={isLoading}>
                      Voltar
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CadastroFuncionario;