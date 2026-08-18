/**
 * `page` es 0-based (igual que Spring Pageable). `onPageChange` recibe el
 * nuevo número de página 0-based.
 */
export default function Pagination({ page, totalPages, totalElements, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem'
        }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {totalElements} {totalElements === 1 ? 'registro' : 'registros'} en total
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={page <= 0}
                    onClick={() => onPageChange(page - 1)}
                >
                    ← Anterior
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Página {page + 1} de {totalPages}
                </span>
                <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={page >= totalPages - 1}
                    onClick={() => onPageChange(page + 1)}
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
}
