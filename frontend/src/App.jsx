import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Items from './pages/Items';
import Brands from './pages/Brands';
import Models from './pages/Models';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/items" replace />} />
          <Route path="/items"  element={<Items />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/models" element={<Models />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;