import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-left">© {new Date().getFullYear()} Jacksonville Humane Society — Pet Help Center</div>
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/reports">Reports</Link>
        <a href="/LICENSE" target="_blank" rel="noreferrer">License</a>
      </div>
    </footer>
  );
}
