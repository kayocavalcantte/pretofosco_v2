import React, { useState } from 'react';
import { format } from "date-fns";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../styles/Agenda.scss'; // ajuste conforme necessário

const horarios = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);
const barbeiros = ['Preto Fosco'];

export default function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  return (
    <div className="agenda-container">
      <div className="agenda-header">

        <div className="seletor-data">
          <button
            className="botao-data"
            onClick={() => setMostrarCalendario(!mostrarCalendario)}
          >
            {dataSelecionada ? format(dataSelecionada, 'dd/MM/yyyy') : "Escolher data"}
          </button>

          {mostrarCalendario && (
            <div className="calendario-container">
              <DayPicker
                mode="single"
                selected={dataSelecionada}
                onSelect={(date) => {
                  setDataSelecionada(date);
                  setMostrarCalendario(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="agenda-grid" style={{ gridTemplateColumns: `100px repeat(${barbeiros.length}, 1fr)` }}>
        <div></div>
        {barbeiros.map((barbeiro) => (
          <div key={barbeiro} className="barbeiro-header">{barbeiro}</div>
        ))}

        {horarios.map((hora) => (
          <React.Fragment key={hora}>
            <div className="hora-label">{hora}</div>
            {barbeiros.map((barbeiro) => (
              <div key={`${hora}-${barbeiro}`} className="celula-agenda"></div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
