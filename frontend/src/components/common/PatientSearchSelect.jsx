import { useId, useRef, useState } from 'react';

/**
 * Combobox de búsqueda de paciente, accesible por teclado (rol
 * combobox/listbox/option, flechas + Enter + Escape). Unifica el
 * buscador tipo-autocompletar que antes estaba duplicado con
 * comportamiento distinto en ConsultationFormPage y EvolutionFormPage
 * — ninguno de los dos se podía usar sin mouse para elegir un
 * resultado, y solo uno de los dos mostraba "sin resultados".
 */
export default function PatientSearchSelect({
    patients,
    searchTerm,
    onSearchTermChange,
    onSelect,
    disabled = false,
    placeholder = 'Buscar por nombre, apellido o DNI...',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const listboxId = useId();
    const skipBlurClose = useRef(false);

    const openWithTerm = (value) => {
        onSearchTermChange(value);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const selectPatient = (patient) => {
        onSelect(patient);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.min(i + 1, patients.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0 && patients[highlightedIndex]) {
                e.preventDefault();
                selectPatient(patients[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const showDropdown = isOpen && searchTerm;

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                    className="form-input"
                    style={{ paddingLeft: '2.8rem' }}
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => openWithTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => {
                        if (skipBlurClose.current) { skipBlurClose.current = false; return; }
                        setIsOpen(false);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined}
                />
            </div>
            {showDropdown && (
                <ul
                    id={listboxId}
                    role="listbox"
                    aria-label="Resultados de búsqueda de pacientes"
                    style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: 'white', border: '1px solid var(--border-subtle)', borderRadius: '12px',
                        marginTop: '4px', maxHeight: '250px', overflowY: 'auto', zIndex: 10,
                        boxShadow: 'var(--shadow-lg)', listStyle: 'none', margin: '4px 0 0', padding: 0,
                    }}
                >
                    {patients.length > 0 ? patients.map((p, idx) => (
                        <li
                            key={p.id}
                            id={`${listboxId}-opt-${idx}`}
                            role="option"
                            aria-selected={idx === highlightedIndex}
                            onMouseDown={() => { skipBlurClose.current = true; }}
                            onClick={() => selectPatient(p)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            style={{
                                padding: '0.8rem 1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.8rem',
                                background: idx === highlightedIndex ? 'var(--muted)' : 'white',
                            }}
                        >
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-header)', fontSize: '0.95rem' }}>{p.nombre} {p.apellido}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DNI: {p.dni}</div>
                            </div>
                        </li>
                    )) : (
                        <li role="presentation" style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            No se encontraron pacientes.
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
