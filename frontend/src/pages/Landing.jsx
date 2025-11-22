import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Floating Navbar */}
      <nav className="navbar-floating">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-bold text-slate-800">StockMaster</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="link text-sm font-medium">Login</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '9999px' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-40 pb-12 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: '#dbeafe', filter: 'blur(80px)', opacity: 0.5 }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: '#e0e7ff', filter: 'blur(80px)', opacity: 0.6 }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">



          <h1 className="landing-title">
            Inventory Management <br className="hidden md:block" />
            <span className="text-gradient">Reimagined.</span>
          </h1>

          <p className="landing-desc">
            StockMaster helps warehouses and SMEs track, manage, and optimize inventory with zero clutter and real-time insights.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link to="/signup" className="btn btn-primary inline-flex items-center justify-center" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Start Free Trial
            </Link>
            <Link to="/login" className="btn btn-outline inline-flex items-center justify-center" style={{ padding: '0.875rem 2rem', fontSize: '1rem', background: 'white' }}>
              View Live Demo
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto text-left mt-16">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>⚡</div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p className="text-sm text-gray-600">Monitor stock levels instantly as they change across all your locations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>🛡️</div>
              <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security with automated daily backups to keep your data safe.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>📊</div>
              <h3 className="text-xl font-bold mb-2">Smart Analytics</h3>
              <p className="text-sm text-gray-600">Gain actionable insights into your inventory turnover and optimize your supply chain.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-sm border-t bg-white relative z-10">
        <p>© 2024 StockMaster Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
