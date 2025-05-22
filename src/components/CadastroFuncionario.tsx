import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/CadastroFuncionario.scss'; // Ajuste se for usar o mesmo SCSS de Cadastro

const CadastroFuncionario: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // Estados para horário de início (separados para hora e minuto)
  const [horarioInicioHora, setHorarioInicioHora] = useState('08');
  const [horarioInicioMinuto, setHorarioInicioMinuto] = useState('00');

  // Estados para horário final (separados para hora e minuto)
  const [horarioFinalHora, setHorarioFinalHora] = useState('17');
  const [horarioFinalMinuto, setHorarioFinalMinuto] = useState('00');

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const horasParaSelect = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutosParaSelect = ['00', '15', '30', '45']; // Ou Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')) para todos os minutos

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const horarioInicioCompleto = `${horarioInicioHora}:${horarioInicioMinuto}`;
    const horarioFinalCompleto = `${horarioFinalHora}:${horarioFinalMinuto}`;

    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    // Você pode adicionar validações específicas para os horários aqui se desejar
    // Por exemplo, verificar se o horário final é depois do horário inicial.

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    alert(`Cadastro de funcionário realizado com sucesso!\n
      Nome: ${nome}\n
      Email: ${email}\n
      Telefone: ${telefone}\n
      Horário de Início: ${horarioInicioCompleto}\n
      Horário Final: ${horarioFinalCompleto}`);

    navigate('/admin/dashboard'); // Ajuste a rota de navegação conforme necessário
  };

  return (
    <section className="cadastro-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}> {/* Ajustei lg e xl para um card um pouco mais largo se necessário */}
            <Card className="cadastro-card">
              <Card.Body>
                <h2 className="text-center mb-4">Cadastrar Funcionário</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Digite o nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Digite o email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Digite o telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Horário de Início com Dropdowns */}
                  <Form.Group className="mb-3">
                    <Form.Label>Horário de Início</Form.Label>
                    <Row>
                      <Col>
                        <Form.Select
                          value={horarioInicioHora}
                          onChange={(e) => setHorarioInicioHora(e.target.value)}
                          aria-label="Hora de início"
                          required
                        >
                          {horasParaSelect.map(hora => (
                            <option key={`inicio-h-${hora}`} value={hora}>{hora}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs="auto" className="d-flex align-items-center px-2">:</Col>
                      <Col>
                        <Form.Select
                          value={horarioInicioMinuto}
                          onChange={(e) => setHorarioInicioMinuto(e.target.value)}
                          aria-label="Minuto de início"
                          required
                        >
                          {minutosParaSelect.map(minuto => (
                            <option key={`inicio-m-${minuto}`} value={minuto}>{minuto}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>

                  {/* Horário Final com Dropdowns */}
                  <Form.Group className="mb-3">
                    <Form.Label>Horário Final</Form.Label>
                    <Row>
                      <Col>
                        <Form.Select
                          value={horarioFinalHora}
                          onChange={(e) => setHorarioFinalHora(e.target.value)}
                          aria-label="Hora final"
                          required
                        >
                          {horasParaSelect.map(hora => (
                            <option key={`final-h-${hora}`} value={hora}>{hora}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs="auto" className="d-flex align-items-center px-2">:</Col>
                      <Col>
                        <Form.Select
                          value={horarioFinalMinuto}
                          onChange={(e) => setHorarioFinalMinuto(e.target.value)}
                          aria-label="Minuto final"
                          required
                        >
                          {minutosParaSelect.map(minuto => (
                            <option key={`final-m-${minuto}`} value={minuto}>{minuto}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Crie uma senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Digite a senha novamente</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirme a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 neon-btn">
                    Cadastrar Funcionário
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      className="voltar-btn"
                      onClick={() => navigate('/admin/dashboard')} // Ajuste a rota conforme necessário
                    >
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