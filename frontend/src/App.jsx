import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Items from './pages/items';
import Brands from './pages/brands';
import Models from './pages/models';
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