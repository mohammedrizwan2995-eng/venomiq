import React from 'react';
import { ViewState } from '../types';
import { Activity, FlaskConical, TrendingUp, Radio, Menu, X, ShieldAlert, Bug } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, setIsOpen }) => {
  const navItems = [
    { id: ViewState.OPERATIONS, label: 'Operations', icon: Activity },
    { id: ViewState.LAB, label: 'Research Lab', icon: FlaskConical },
    { id: ViewState.MARKET, label: 'Market Pulse', icon: TrendingUp },
    { id: ViewState.SAFETY, label: 'Safety Log', icon: ShieldAlert },
    { id: ViewState.HUB, label: 'Global Hub', icon: Radio },
  ];

  const handleNav = (id: ViewState) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-stone-800">
           <span>🦂 Venom<span className="text-orange-600">IQ</span></span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-stone-500">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen flex flex-col
      `}>
        <div className="p-6 border-b border-stone-100">
          <h1 className="text-xl font-bold flex items-center text-stone-800">
            <span className="mr-2 text-2xl">🦂</span> Venom<span className="text-orange-600">IQ</span>
          </h1>
          <div className="mt-4 relative">
             <input disabled placeholder="Search modules..." className="w-full pl-3 pr-3 py-2 text-xs rounded-lg border border-stone-200 bg-stone-50 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase px-3 mb-2 tracking-widest">Control</div>
            {navItems.slice(0, 3).map((item) => (
              <NavButton key={item.id} item={item} isActive={currentView === item.id} onClick={() => handleNav(item.id)} />
            ))}
            
            <div className="text-[10px] font-bold text-stone-400 uppercase px-3 mt-6 mb-2 tracking-widest">Management</div>
            {navItems.slice(3).map((item) => (
              <NavButton key={item.id} item={item} isActive={currentView === item.id} onClick={() => handleNav(item.id)} />
            ))}
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50">
           <div className="flex items-center space-x-3">
               <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-xs">AD</div>
               <div>
                   <p className="text-[11px] font-bold text-stone-800 uppercase">System Admin</p>
                   <p className="text-[10px] text-green-600 font-bold">Online & Synced</p>
               </div>
           </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const NavButton = ({ item, isActive, onClick }: any) => (
    <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
      ${isActive 
        ? 'bg-orange-50 text-orange-700 font-semibold' 
        : 'text-stone-500 hover:text-orange-600 hover:bg-stone-50'}
    `}
  >
    <item.icon className="w-4 h-4" />
    <span>{item.label}</span>
  </button>
)

export default Sidebar;