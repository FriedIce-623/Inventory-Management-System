import React from 'react';
import { Menu, Bell, LayoutDashboard, Package, ReceiptIndianRupee, BarChart3, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'dashboard' | 'inventory' | 'pos' | 'analytics';
  onViewChange: (view: 'dashboard' | 'inventory' | 'pos' | 'analytics') => void;
}

export default function Layout({ children, activeView, onViewChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-container-highest px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors active:scale-95">
            <Menu className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-bold text-primary tracking-tight">ShelfSense</h1>
        </div>
        <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors active:scale-95 relative">
          <Bell className="w-6 h-6 text-primary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-32">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-glass border-t border-surface-container-highest px-2 pt-3 pb-8 flex justify-around items-center z-50 rounded-t-[2rem] shadow-[0_-12px_32px_-4px_rgba(31,16,142,0.08)]">
        <NavItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Home" 
          active={activeView === 'dashboard'} 
          onClick={() => onViewChange('dashboard')} 
        />
        <NavItem 
          icon={<Package className="w-5 h-5" />} 
          label="Stock" 
          active={activeView === 'inventory'} 
          onClick={() => onViewChange('inventory')} 
        />
        <NavItem 
          icon={<ReceiptIndianRupee className="w-5 h-5" />} 
          label="POS" 
          active={activeView === 'pos'} 
          onClick={() => onViewChange('pos')} 
        />
        <NavItem 
          icon={<BarChart3 className="w-5 h-5" />} 
          label="Analytics" 
          active={activeView === 'analytics'} 
          onClick={() => onViewChange('analytics')} 
        />
        <NavItem 
          icon={<Wallet className="w-5 h-5" />} 
          label="Khata" 
          active={false} 
          onClick={() => {}} 
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all duration-300",
        active ? "bg-primary/10 text-primary scale-110" : "text-on-surface-variant/60 hover:text-primary"
      )}
    >
      <div className={cn("transition-transform duration-300", active && "scale-110")}>
        {React.cloneElement(icon as React.ReactElement, { 
          fill: active ? "currentColor" : "none",
          strokeWidth: active ? 2.5 : 2
        })}
      </div>
      <span className={cn("text-[9px] font-bold uppercase tracking-widest mt-1.5", active ? "opacity-100" : "opacity-70")}>
        {label}
      </span>
    </button>
  );
}
