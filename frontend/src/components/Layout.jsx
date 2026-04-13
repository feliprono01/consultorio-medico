import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    const location = useLocation();

    // Detect if we are in the Split View (New or Edit Consultation)
    // We want a more "App-like" feel here: max height, no window scrollbar.
    const isSplitView = location.pathname.includes('/consultas/new') ||
        location.pathname.includes('/consultas/edit/');

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Ocultar sidebar en vista dividida */}
            {!isSplitView && <Sidebar />}
            <main style={{
                flex: 1,
                marginLeft: isSplitView ? '0' : '260px',
                // If Split View: minimal padding, fixed height, no outer scroll
                // If Standard View: normal padding, allows scrolling
                padding: isSplitView ? '0' : '3rem',
                width: isSplitView ? '100%' : 'calc(100% - 260px)',
                height: '100vh',
                overflowY: isSplitView ? 'hidden' : 'auto', // Split view handles its own scroll
                position: 'relative',
                zIndex: 10,
                pointerEvents: 'auto',
                boxSizing: 'border-box'
            }}>
                <Outlet />
            </main>
        </div>
    );
}
