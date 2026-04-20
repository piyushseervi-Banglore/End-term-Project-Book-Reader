import { useState } from 'react';
import { usePDF } from '../../contexts/PDFContext';
import { useRecentBooks } from '../../hooks/useLocalStorage';
import { List, Clock, ChevronRight, FileText, BookOpen } from 'lucide-react';

const TOCItem = ({ item, level = 0, onNavigate }) => {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = item.items && item.items.length > 0;

  return (
    <div>
      <div
        className="toc-item"
        style={{ paddingLeft: `${8 + level * 14}px` }}
        onClick={() => {
          if (hasChildren) setExpanded((p) => !p);
          if (item.dest || item.pageNumber) onNavigate(item);
        }}
        title={item.title}
      >
        {hasChildren && (
          <ChevronRight
            size={12}
            style={{
              display: 'inline',
              verticalAlign: 'middle',
              marginRight: 4,
              transition: 'transform 150ms',
              transform: expanded ? 'rotate(90deg)' : 'none',
            }}
          />
        )}
        {!hasChildren && <span style={{ display: 'inline-block', width: 16 }} />}
        {item.title}
      </div>
      {hasChildren && expanded && (
        <div>
          {item.items.map((child, i) => (
            <TOCItem key={i} item={child} level={level + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const { sidebarOpen, outline, setPage, fileName } = usePDF();
  const { recent } = useRecentBooks();
  const [activeTab, setActiveTab] = useState('toc');

  const handleTOCNav = (item) => {
    if (item.pageNumber) {
      setPage(item.pageNumber);
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'toc' ? 'active' : ''}`}
          onClick={() => setActiveTab('toc')}
        >
          <List size={13} /> Contents
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          <Clock size={13} /> Recent
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'toc' && (
          <>
            {outline.length === 0 ? (
              <div className="toc-empty">
                <BookOpen size={32} color="var(--text-disabled)" />
                <div>
                  {fileName
                    ? 'No table of contents found in this PDF'
                    : 'Open a PDF to see its table of contents'}
                </div>
              </div>
            ) : (
              outline.map((item, i) => (
                <TOCItem key={i} item={item} onNavigate={handleTOCNav} />
              ))
            )}
          </>
        )}

        {activeTab === 'recent' && (
          <>
            {recent.length === 0 ? (
              <div className="toc-empty">
                <Clock size={32} color="var(--text-disabled)" />
                <div>No recent books yet. Open a PDF to get started.</div>
              </div>
            ) : (
              recent.map((book) => (
                <div key={book.fileName} className="recent-book-item">
                  <div className="book-icon">📖</div>
                  <div className="book-info">
                    <div className="book-title">{book.fileName}</div>
                    <div className="book-meta">
                      Page {book.page} · {new Date(book.lastOpened).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </aside>
  );
};
