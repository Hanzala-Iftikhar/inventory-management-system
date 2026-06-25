import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">📦 Inventory Manager</span>
      <div className="navbar-links">
        <NavLink to="/items"  className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Items</NavLink>
        <NavLink to="/brands" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Brands</NavLink>
        <NavLink to="/models" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Models</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;