import { useParams, useNavigate } from 'react-router-dom';
import PatientEvolutionTab from '../../components/patient/PatientEvolutionTab';

export default function PatientEvolutionPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Evolución del Paciente</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        Visualización gráfica y cronológica del progreso.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/pacientes')}
                    className="btn btn-secondary"
                >
                    Volver a Pacientes
                </button>
            </div>

            <PatientEvolutionTab patientId={id} />
        </div>
    );
}

