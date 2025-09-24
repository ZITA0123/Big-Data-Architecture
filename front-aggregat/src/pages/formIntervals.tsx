import React, { useState } from 'react';
import "../css/formIntervals.css";

type IntervalType = 'heures' | 'jours';

interface IntervalOption {
  label: string;
  value: number;
}

const heuresOptions: IntervalOption[] = [
  { label: '1 heure', value: 1 },
  { label: '2 heures', value: 2 },
  { label: '3 heures', value: 3 },
  { label: '6 heures', value: 6 },
  { label: '12 heures', value: 12 },
];

const joursOptions: IntervalOption[] = [
  { label: '1 jour', value: 1 },
  { label: '2 jours', value: 2 },
  { label: '3 jours', value: 3 },
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
];

const FormulaireIntervalle: React.FC = () => {
  const [typeIntervalle, setTypeIntervalle] = useState<IntervalType>('heures');
  const [valeurIntervalle, setValeurIntervalle] = useState<IntervalOption | null>(null);
  const [date, setDate] = useState<string>('');

  const getMinDate = (): string => {
    const now = new Date();

    if (typeIntervalle === 'heures') {
      // Aujourd’hui à 00:00
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()+1)
        .toISOString()
        .split('T')[0];
    } else {
      // l'année dernière
      return new Date(now.getFullYear()-1, now.getMonth(), now.getDate()+2)
        .toISOString()
        .split('T')[0];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!valeurIntervalle) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const data = {
      typeIntervalle,
      valeur: valeurIntervalle,
      date: getMinDate(),
    };

    console.log('Formulaire soumis :', data);
  };
  



  const currentOptions = typeIntervalle === 'heures' ? heuresOptions : joursOptions;

  return (
    <form className={"form"} onSubmit={handleSubmit}>
      {/* Type d’intervalle */}
      <label>Type d’intervalle :</label>
      <select
        value={typeIntervalle}
        onChange={(e) => {
          const newType = e.target.value as IntervalType;
          setTypeIntervalle(newType);
          setValeurIntervalle(null);
          setDate('');
        }}
      >
        <option value="heures">Heures</option>
        <option value="jours">Jours</option>
      </select>
      <div>Début: {getMinDate()}</div>
      {/* Valeur d’intervalle */}
      <label>Valeur d’intervalle :</label>
      <select
        value={valeurIntervalle?.value ?? ''}
        onChange={(e) => {
          const selectedValue = parseInt(e.target.value, 10);
          const selected = currentOptions.find((opt) => opt.value === selectedValue) || null;
          setValeurIntervalle(selected);
        }}
      >
        <option value="">-- Choisir une valeur --</option>
        {currentOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <br />
      <button type="submit">Valider</button>
    </form>
  );
};

export default FormulaireIntervalle;
