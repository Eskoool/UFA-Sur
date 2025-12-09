import type { Medicamento, Semana } from '../types';

export const initialMedicamentos: Medicamento[] = [
  {
    id: '1',
    descripcion: 'ABACAVIR / LAMIVUDINA 600/300 mg comp.',
    upe: 30,
    nevera: false,
    codigo: 'V02032',
  },
  {
    id: '2',
    descripcion: 'ABACAVIR 300 mg comp oral',
    upe: 60,
    nevera: false,
    codigo: 'V10918',
  },
  {
    id: '3',
    descripcion: 'ABATACEPT 125 MG JGA PRECARGADA 1 ML SC',
    upe: 4,
    nevera: true,
    codigo: 'V01014',
  },
  {
    id: '4',
    descripcion: 'ABATACEPT 125 MG PLUMA PRECARGADA 1 ML SUBCUTANEA (ORENCIA)',
    upe: 4,
    nevera: true,
    codigo: 'V02464',
  },
  {
    id: '5',
    descripcion: 'ABROCITINIB 200 MG COMPRIMIDO ORAL',
    upe: 28,
    nevera: false,
    codigo: 'V93312',
  },
  {
    id: '6',
    descripcion: 'ADALIMUMAB 40 mg jeringa (HUMIRA)',
    upe: 2,
    nevera: true,
    codigo: 'V0954065',
  },
  {
    id: '7',
    descripcion: 'ADALIMUMAB 40 mg pluma precargada (HYRIMOZ)',
    upe: 2,
    nevera: true,
    codigo: 'V02120',
  },
  {
    id: '8',
    descripcion: 'AGUA ESTERIL 10 ML AMPOLLAS',
    upe: 50,
    nevera: false,
    codigo: 'V92149',
  },
  {
    id: '9',
    descripcion: 'ALFA-1-ANTITRIPSINA 1 g vial',
    upe: 1,
    nevera: false,
    codigo: 'V0917252',
  },
  {
    id: '10',
    descripcion: 'ALFA1 ANTITRIPSINA 5000 MG VIAL POLVO + DISOLVENTE INTRAVENOSA (RE',
    upe: 1,
    nevera: false,
    codigo: 'V93681',
  },
  {
    id: '11',
    descripcion: 'ALIROCUMAB 75 MG/1 ML PLUMA PRECARGA',
    upe: 1,
    nevera: true,
    codigo: 'V01367',
  },
  {
    id: '12',
    descripcion: 'ALIROCUMAB 300 MG/2 ML PLUMA PRECARGADA',
    upe: 1,
    nevera: true,
    codigo: 'V93421',
  },
  {
    id: '13',
    descripcion: 'AMBRISENTAN 10 mg comp',
    upe: 30,
    nevera: false,
    codigo: 'V01284',
  },
  {
    id: '14',
    descripcion: 'AMFOTERICINA B',
    upe: 1,
    nevera: false,
    codigo: 'V27606',
  },
  {
    id: '15',
    descripcion: 'AMPICILINA 1000 mg vial',
    upe: 1,
    nevera: false,
    codigo: 'V86285',
  },
];

// Generar semanas para los próximos 3 meses
const generateSemanas = (): Semana[] => {
  const semanas: Semana[] = [];
  const startDate = new Date('2025-12-09'); // Martes

  for (let i = 0; i < 12; i++) { // 12 semanas = 3 meses
    const fechaInicio = new Date(startDate);
    fechaInicio.setDate(startDate.getDate() + (i * 7));

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + 2); // Martes a Jueves (3 días)

    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('es-ES', { month: 'long' });
      return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
    };

    semanas.push({
      id: `semana-${i + 1}`,
      nombre: `SEMANA: ${formatDate(fechaInicio)} - ${formatDate(fechaFin)}`,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
    });
  }

  return semanas;
};

export const initialSemanas: Semana[] = generateSemanas();
