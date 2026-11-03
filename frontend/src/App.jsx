import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#21262d',
              color: '#e6edf3',
              border: '1px solid #30363d',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '10px'
            },
            success: { iconTheme: { primary: '#52b788', secondary: '#21262d' } },
            error: { iconTheme: { primary: '#e63946', secondary: '#21262d' } }
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGroup />} />
          <Route path="/edit/:id" element={<CreateGroup />} />
          <Route path="/group/:id" element={<GroupDetail />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}