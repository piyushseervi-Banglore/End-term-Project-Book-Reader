import { useRef, useState, useEffect } from 'react';
import { usePDF } from '../../contexts/PDFContext';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  RotateCcw, Upload,
} from 'lucide-react';

const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5];

export const PDFToolbar = ({ onFileSelect }) => {
  const {
    currentPage, numPages, scale,
    nextPage, prevPage, setPage, zoomIn, zoomOut, setScale,
    sidebarOpen,
  } = usePDF();
  const [pageInput, setPageInput] = useState(String(currentPage));
  const fileRef = useRef();

  // Keep local input in sync with actual page
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageKeyDown = (e) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput, 10);
      if (!isNaN(val)) setPage(val);
      e.target.blur();
    }
    if (e.key === 'Escape') {
      setPageInput(String(currentPage));
      e.target.blur();
    }
  };

  const handlePageBlur = () => {
    // Reset to real page if left invalid
    const val = parseInt(pageInput, 10);
    if (isNaN(val) || val < 1 || val > numPages) {
      setPageInput(String(currentPage));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  const zoomPct = Math.round(scale * 100);

  return (
    <div className={`pdf-toolbar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Navigation */}
      <button className="btn-icon" onClick={prevPage} disabled={currentPage <= 1} title="Previous page (←)">
        <ChevronLeft size={18} />
      </button>

      <input
        className="page-input"
        type="number"
        min={1}
        max={numPages || 1}
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        onKeyDown={handlePageKeyDown}
        onBlur={handlePageBlur}
        onFocus={(e) => e.target.select()}
      />
      <span className="page-count">/ {numPages || '—'}</span>

      <button className="btn-icon" onClick={nextPage} disabled={currentPage >= numPages} title="Next page (→)">
        <ChevronRight size={18} />
      </button>

      <div className="toolbar-divider" />

      {/* Zoom Controls */}
      <button className="btn-icon" onClick={zoomOut} disabled={scale <= 0.5} title="Zoom out (-)">
        <ZoomOut size={18} />
      </button>

      <select
        className="page-input"
        style={{ width: 70, cursor: 'pointer' }}
        value={scale}
        onChange={(e) => setScale(parseFloat(e.target.value))}
      >
        {ZOOM_PRESETS.map((z) => (
          <option key={z} value={z}>{Math.round(z * 100)}%</option>
        ))}
        {!ZOOM_PRESETS.includes(parseFloat(scale.toFixed(2))) && (
          <option value={scale}>{zoomPct}%</option>
        )}
      </select>

      <button className="btn-icon" onClick={zoomIn} disabled={scale >= 3.0} title="Zoom in (+)">
        <ZoomIn size={18} />
      </button>

      <button className="btn-icon" onClick={() => setScale(1.2)} title="Reset zoom">
        <RotateCcw size={16} />
      </button>

      <div className="toolbar-divider" />

      <div className="toolbar-spacer" />

      {/* Upload */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button className="upload-btn" onClick={() => fileRef.current?.click()}>
        <Upload size={14} />
        Open PDF
      </button>
    </div>
  );
};
