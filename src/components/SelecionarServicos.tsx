import React, { useEffect, useState } from 'react';
import { listarServicos } from '../services/servicoService';
import { Form } from 'react-bootstrap';

interface Servico {
  id: number;
  descricao: string;
}

interface SelecionarServicosProps {
  onSelecionar: (ids: number[]) => void;
}

const SelecionarServicos: React.FC<SelecionarServicosProps> = ({ onSelecionar }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listarServicos();
        setServicos(data);
      } catch (e) {
        console.error('Erro ao carregar serviços:', e);
      }
    };
    fetch();
  }, []);

  const toggleServico = (id: number) => {
    const atualizados = selecionados.includes(id)
      ? selecionados.filter(s => s !== id)
      : [...selecionados, id];

    setSelecionados(atualizados);
    onSelecionar(atualizados);
  };

  return (
    <Form.Group>
      <Form.Label>Escolha os serviços</Form.Label>
      {servicos.map(servico => (
        <Form.Check
          key={servico.id}
          type="checkbox"
          label={servico.descricao}
          checked={selecionados.includes(servico.id)}
          onChange={() => toggleServico(servico.id)}
        />
      ))}
    </Form.Group>
  );
};

export default SelecionarServicos;
