import { useContext } from 'react';
import { ConfirmContext } from '../../context/ConfirmContext';
import Modal from './Modal';

/**
 * Se monta una única vez en App.jsx. Reemplaza a window.confirm en toda la
 * app: cualquier componente llama a useConfirm()(mensaje) y espera la
 * promesa, en vez de bloquear el hilo con el diálogo nativo del navegador.
 */
export default function ConfirmDialog() {
    const { request, handleClose } = useContext(ConfirmContext);

    return (
        <Modal
            isOpen={!!request}
            onClose={() => handleClose(false)}
            maxWidth="420px"
            header={<h3 style={{ margin: '0 0 1rem 0' }}>{request?.title}</h3>}
        >
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                {request?.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => handleClose(false)}>
                    Cancelar
                </button>
                <button type="button" className="btn" onClick={() => handleClose(true)}>
                    Confirmar
                </button>
            </div>
        </Modal>
    );
}
