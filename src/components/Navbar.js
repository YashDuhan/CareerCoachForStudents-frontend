import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <ul>
          <li className="logo"><Link to="/">AI Career Coach</Link></li>
          {/* Add other nav links here if needed in the future */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 