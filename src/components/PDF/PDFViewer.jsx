import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { usePDF } from '../../contexts/PDFContext';
import { useRecentBooks, useReadingSession } from '../../hooks/useLocalStorage';
import { Upload, FileText } from 'lucide-react';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const AUTOSAVE_INTERVAL = 3000;

export const PDFViewer = ({ onTextSelect }) => {
  const {
    file, fileName, currentPage, scale, sidebarOpen, aiPanelOpen,
    setNumPages, setOutline, restore,
  } = usePDF();
  const { addBook, updateProgress } = useRecentBooks();
  const { save, load } = useReadingSession(fileName);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const canvasAreaRef = useRef(null);
  const autosaveRef = useRef(null);

  // Restore session on file open
  useEffect(() => {
    if (!fileName) return;
    const session = load();
    if (session) {
      restore({ currentPage: session.currentPage || 1, scale: session.scale || 1.2 });
    }
  }, [fileName]);

  // Autosave every 3 seconds while reading
  useEffect(() => {
    if (!fileName) return;
    clearInterval(autosaveRef.current);
    autosaveRef.current = setInterval(() => {
      save({ currentPage, scale });
      updateProgress(fileName, currentPage, scale);
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(autosaveRef.current);
  }, [fileName, currentPage, scale]);

  // Animate page change
  useEffect(() => { setPageKey((k) => k + 1); }, [currentPage]);

  const onDocumentLoadSuccess = useCallback(async (pdfDoc) => {
    const { numPages } = pdfDoc;
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    addBook(fileName, currentPage, scale);

    // Extract outline (table of contents)
    try {
      const outline = await pdfDoc.getOutline();
      if (outline && outline.length > 0) {
        const processItems = async (items) => {
          return Promise.all(
            items.map(async (item) => {
              let pageNumber = null;
              try {
                if (item.dest) {
                  const dest = Array.isArray(item.dest)
                    ? item.dest
                    : await pdfDoc.getDestination(item.dest);
                  if (dest) {
                    const pageRef = dest[0];
                    pageNumber = await pdfDoc.getPageIndex(pageRef) + 1;
                  }
                }
              } catch {}
              return {
                title: item.title,
                pageNumber,
                dest: item.dest,
                items: item.items?.length > 0 ? await processItems(item.items) : [],
              };
            })
          );
        };
        const processed = await processItems(outline);
        setOutline(processed);
      }
    } catch (e) {
      console.warn('Could not extract outline:', e);
    }
  }, [fileName, currentPage, scale, setNumPages, setOutline, addBook]);

  const onDocumentLoadError = (err) => {
    console.error('PDF load error:', err);
    setError('Failed to load PDF. Please check the file and try again.');
    setLoading(false);
  };

  // Text selection → AI context
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 0) {
      onTextSelect?.(text);
    }
  }, [onTextSelect]);

  // Drag & drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'application/pdf') {
      // bubble up handled in parent (App)
      const event = new CustomEvent('pdf-drop', { detail: f });
      window.dispatchEvent(event);
    }
  }, []);

  const rightOffset = aiPanelOpen ? 'var(--ai-panel-width)' : '0px';

  if (!file) {
    return (
      <div
        className={`pdf-canvas-area drop-zone ${dragOver ? 'drag-over' : ''}`}
        style={{
          marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
          marginRight: rightOffset,
          transition: 'margin var(--transition-base)',
          minHeight: 'calc(100vh - 124px)',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="drop-zone-icon">📄</div>
        <div className="drop-zone-title">Drop your PDF here</div>
        <div className="drop-zone-subtitle">or use the "Open PDF" button in the toolbar</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {['Research papers', 'E-books', 'Reports', 'Manuals'].map((t) => (
            <span key={t} style={{
              padding: '4px 12px', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
              fontSize: 12, color: 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="pdf-canvas-area"
      ref={canvasAreaRef}
      style={{
        marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
        marginRight: rightOffset,
        transition: 'margin var(--transition-base)',
      }}
      onMouseUp={handleMouseUp}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        onLoadStart={() => setLoading(true)}
        loading={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 48 }}>
            <div className="loading-spinner" />
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading PDF…</span>
          </div>
        }
        error={
          <div style={{ color: 'var(--accent-danger)', padding: 24, textAlign: 'center' }}>
            {error || 'Failed to load PDF'}
          </div>
        }
      >
        <div key={pageKey} className="pdf-page-wrapper animate-pageTurn">
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderAnnotationLayer
            renderTextLayer
            loading={
              <div style={{ width: 595 * scale, height: 842 * scale, background: 'var(--bg-card)' }}
                className="skeleton" />
            }
          />
        </div>
      </Document>
    </div>
  );
};
