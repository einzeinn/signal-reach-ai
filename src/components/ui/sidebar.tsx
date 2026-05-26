'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Target, Activity, Mail, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Target Leads', icon: Target },
    { href: '/signals', label: 'Intent Signals', icon: Activity },
    { href: '/outreach', label: 'Auto-Outreach', icon: Mail },
  ];

  return (
    <>
      {/* Floating Hamburger Button (Hanya terlihat di Mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-40 bg-neo-yellow border-2 border-neo-black p-3 shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay Gelap (Hanya muncul saat menu dibuka di Mobile) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-64 border-r-2 border-neo-black bg-neo-white flex flex-col p-6 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 fill-neo-teal" />
            <h1 className="text-xl font-black uppercase tracking-tighter">SignalReach</h1>
          </div>
          
          {/* Close Button (X) for Mobile */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden bg-white border-2 border-neo-black w-8 h-8 flex items-center justify-center shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex flex-col gap-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)} // Auto close sidebar when link is clicked (on mobile)
                className={`flex items-center gap-3 font-bold p-3 transition-colors ${
                  isActive
                    ? 'bg-neo-teal border-2 border-neo-black shadow-[4px_4px_0_#000]'
                    : 'bg-white hover:bg-neo-yellow border-2 border-neo-black shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5 transition-all'
                }`}
              >
                <Icon className="w-5 h-5" /> {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}