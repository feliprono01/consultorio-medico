import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Detect if we are in the Split View (New or Edit Consultation)
    // We want a more "App-like" feel here: max height, no window scrollbar.
    const isSplitView = location.pathname.includes('/consultas/new') ||
        location.pathname.includes('/consultas/edit/');

    // Cerrar el menú móvil al navegar a otra ruta.
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Cerrar con Escape (mismo criterio que los modales).
    useEffect(() => {
        if (!sidebarOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sidebarOpen]);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Ocultar sidebar en vista dividida */}
            {!isSplitView && (
                <>
                    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    {sidebarOpen && (
                        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
                    )}
                </>
            )}
            <main
                className={isSplitView ? 'app-main app-main--full' : 'app-main'}
                style={{
                    flex: 1,
                    // If Split View: minimal padding, fixed height, no outer scroll
                    // If Standard View: normal padding, allows scrolling
                    padding: isSplitView ? '0' : '3rem',
                    height: '100vh',
                    overflowY: isSplitView ? 'hidden' : 'auto', // Split view handles su propio scroll
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'auto',
                    boxSizing: 'border-box'
                }}
            >
                {!isSplitView && (
                    <div className="mobile-topbar">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Abrir menú de navegación"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-header)', padding: '0.25rem', display: 'flex' }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        </button>
                        <span style={{ fontWeight: 700, fontFamily: 'Figtree, sans-serif', color: 'var(--text-header)' }}>Consultorio</span>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    );
}
