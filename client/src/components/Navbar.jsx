import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const link = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">TaskFlow</span>
        <button className="menu-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          Menu
        </button>
        <nav className={open ? 'nav open' : 'nav'} onClick={() => setOpen(false)}>
          <NavLink to="/" end className={link}>Dashboard</NavLink>
          <NavLink to="/projects" className={link}>Projects</NavLink>
          <NavLink to="/tasks" className={link}>Tasks</NavLink>
        </nav>
      </div>
    </header>
  );
}
