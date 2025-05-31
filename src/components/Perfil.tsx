import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import api from '../services/axios'; // Ajuste o caminho se necessário
import '../styles/Perfil.scss'; // Certifique-se que este caminho está correto

interface UserProfileData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipoPerfil: string; 
}

interface UserProfileUpdatePayload {
  nome: string;
  telefone: string;
  email: string;
  senha?: string; // Senha é opcional no envio se quisermos lógica para "não mudar se em branco"
                  // Mas o DTO Java atual espera uma String, então enviaremos "" se em branco no form.
}

const Perfil: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const [initialEmail, setInitialEmail] = useState(''); // Para verificar se o email foi alterado

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        // Assumindo que '/usuario/meu-perfil' retorna os dados do usuário logado
        const response = await api.get<UserProfileData>('/usuario/list-usuario'); 
        const user = response.data;
        if (user) {
          setNome(user.nome || '');
          setEmail(user.email || '');
          setInitialEmail(user.email || ''); // Guarda o email inicial
          setTelefone(user.telefone || '');
          console.log("Perfil do usuário logado carregado:", user);
        } else {
          throw new Error("Dados do usuário não retornados pela API 'meu-perfil'.");
        }
      } catch (err: any) {
        console.error("Erro ao buscar perfil do usuário:", err);
        setError(err.response?.data?.message || err.message || "Não foi possível carregar os dados do perfil. Verifique se está logado.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Verifica se o email foi alterado
    if (email !== initialEmail) {
        // Adicionar lógica de confirmação ou aviso sobre alteração de email, se necessário
        // Ex: if (!window.confirm("Você alterou seu email. Isso pode afetar seu login. Deseja continuar?")) {
        //   setIsSubmitting(false);
        //   return;
        // }
        console.warn("O email foi alterado. O backend irá atualizá-lo.");
    }

    const dadosParaAtualizar: UserProfileUpdatePayload = {
      nome: nome,
      telefone: telefone,
      email: email, // Email agora é enviado
      // Se novaSenha estiver vazia, uma string vazia "" será enviada.
      // O backend irá codificar essa string vazia.
      senha: novaSenha 
    };

    try {
      await api.put('/usuario/edit-cliente', dadosParaAtualizar);
      setSuccessMessage('Alterações salvas com sucesso!');
      setInitialEmail(email); // Atualiza o email inicial após o sucesso
      
      // Se uma nova senha foi definida, o usuário pode precisar logar novamente
      // dependendo da sua lógica de sessão.
      if (novaSenha.trim() !== '') {
        alert('Sua senha foi alterada. Por segurança, pode ser necessário fazer login novamente em breve.');
      }
      setNovaSenha(''); // Limpa o campo de nova senha após o envio

    } catch (err: any) {
      console.error("Erro ao salvar alterações do perfil:", err);
      setError(err.response?.data?.message || err.message || "Não foi possível salvar as alterações.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="light" />
        <p className="mt-2 micro-text text-white">Carregando perfil...</p>
      </Container>
    );
  }

  return (
    <section className="perfil-section">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="perfil-card">
              <Card.Body>
                <h2 className="text-center mb-4">Meu Perfil</h2>
                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formNome">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} // Email agora é editável
                      required
                      disabled={isSubmitting} 
                    />
                     <Form.Text className="text-muted">
                      Alterar o email pode afetar seu acesso.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formTelefone">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formNovaSenha">
                    <Form.Label>Nova Senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Preencha para alterar a senha" // Placeholder ajustado
                      disabled={isSubmitting}
                    />
                  </Form.Group>

                  <Button 
                    variant="success" 
                    type="submit" 
                    className="w-100 neon-btn" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Salvar alterações'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Perfil;