import { createContext, useContext, useReducer, useCallback } from 'react';

const PDFContext = createContext(null);

const initialState = {
  file: null,
  fileName: '',
  numPages: 0,
  currentPage: 1,
  scale: 1.2,
  outline: [],
  sidebarOpen: true,
  aiPanelOpen: false,
  selectedText: '',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, file: action.file, fileName: action.fileName, currentPage: 1, outline: [] };
    case 'SET_NUM_PAGES':
      return { ...state, numPages: action.numPages };
    case 'SET_PAGE':
      return { ...state, currentPage: Math.max(1, Math.min(action.page, state.numPages)) };
    case 'SET_SCALE':
      return { ...state, scale: Math.max(0.5, Math.min(3.0, action.scale)) };
    case 'SET_OUTLINE':
      return { ...state, outline: action.outline };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'TOGGLE_AI':
      return { ...state, aiPanelOpen: !state.aiPanelOpen };
    case 'SET_AI_OPEN':
      return { ...state, aiPanelOpen: action.open };
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.text };
    case 'RESTORE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const PDFProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setFile = useCallback((file, fileName) => {
    dispatch({ type: 'SET_FILE', file, fileName });
  }, []);

  const setNumPages = useCallback((n) => dispatch({ type: 'SET_NUM_PAGES', numPages: n }), []);
  const setPage = useCallback((p) => dispatch({ type: 'SET_PAGE', page: p }), []);
  const nextPage = useCallback(() => dispatch({ type: 'SET_PAGE', page: state.currentPage + 1 }), [state.currentPage]);
  const prevPage = useCallback(() => dispatch({ type: 'SET_PAGE', page: state.currentPage - 1 }), [state.currentPage]);
  const zoomIn = useCallback(() => dispatch({ type: 'SET_SCALE', scale: state.scale + 0.1 }), [state.scale]);
  const zoomOut = useCallback(() => dispatch({ type: 'SET_SCALE', scale: state.scale - 0.1 }), [state.scale]);
  const setScale = useCallback((s) => dispatch({ type: 'SET_SCALE', scale: s }), []);
  const setOutline = useCallback((o) => dispatch({ type: 'SET_OUTLINE', outline: o }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const toggleAI = useCallback(() => dispatch({ type: 'TOGGLE_AI' }), []);
  const setAIOpen = useCallback((open) => dispatch({ type: 'SET_AI_OPEN', open }), []);
  const setSelectedText = useCallback((text) => dispatch({ type: 'SET_SELECTED_TEXT', text }), []);
  const restore = useCallback((payload) => dispatch({ type: 'RESTORE', payload }), []);

  return (
    <PDFContext.Provider value={{
      ...state,
      setFile, setNumPages, setPage, nextPage, prevPage,
      zoomIn, zoomOut, setScale, setOutline,
      toggleSidebar, toggleAI, setAIOpen, setSelectedText, restore,
    }}>
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = () => {
  const ctx = useContext(PDFContext);
  if (!ctx) throw new Error('usePDF must be used within PDFProvider');
  return ctx;
};
