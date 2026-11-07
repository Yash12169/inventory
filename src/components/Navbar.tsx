'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        <div className="navbar-logo-icon">📦</div>
        <span className="navbar-logo-text">Inventory</span>
      </Link>

      <div className="navbar-nav">
        <Link
          href="/"
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          id="nav-home"
        >
          <span>🗂️</span>
          <span>All Items</span>
        </Link>

        <Link
          href="/add"
          className="btn-add-nav"
          id="nav-add"
        >
          <span>+</span>
          <span>Add Item</span>
        </Link>
      </div>
    </nav>
  );
}
