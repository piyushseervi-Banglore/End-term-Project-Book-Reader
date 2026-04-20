import { useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { usePDF } from './contexts/PDFContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { PDFToolbar } from './components/PDF/PDFToolbar';
import { PDFViewer } from './components/PDF/PDFViewer';
import { AIAssistant } from './components/AI/AIAssistant';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner" />
    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading BookReader…</span>
  </div>
);

const ReaderApp = () => {
  const { setFile, setPage, zoomIn, zoomOut, nextPage, prevPage, setSelectedText } = usePDF();

  const handleFileSelect = useCallback((file) => {
    if (!file || file.type !== 'application/pdf') return;
    const url = URL.createObjectURL(file);
    setFile(url, file.name);
  }, [setFile]);

  // Listen for drag-drop from PDFViewer
  useEffect(() => {
    const handler = (e) => handleFileSelect(e.detail);
    window.addEventListener('pdf-drop', handler);
    return () => window.removeEventListener('pdf-drop', handler);
  }, [handleFileSelect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPage();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevPage();
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
      if (e.key === '-')                  { e.preventDefault(); zoomOut(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextPage, prevPage, zoomIn, zoomOut]);

  const handleTextSelect = useCallback((text) => {
    setSelectedText(text);
  }, [setSelectedText]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header />
      <Sidebar />
      <PDFToolbar onFileSelect={handleFileSelect} />

      <div className="viewer-layout" style={{ paddingTop: 'calc(var(--header-height) + var(--toolbar-height))' }}>
        <PDFViewer onTextSelect={handleTextSelect} />
      </div>

      <AIAssistant />
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user)   return <LoginPage />;
  return <ReaderApp />;
}

export default App;
