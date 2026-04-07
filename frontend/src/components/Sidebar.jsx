import React from 'react';

const Sidebar = ({ isOpen, toggleSidebar, onNewChat }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-[260px] bg-[#171717] flex flex-col p-3 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* New Chat Button */}
        <button 
          onClick={onNewChat}
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-[#202123] text-sm text-gray-100 transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="font-medium">New chat</span>
        </button>

        {/* Brand / Logo */}
        <div className="mt-auto px-3 py-2 text-xs text-gray-400 font-medium">
          DD System
        </div>
      </div>
    </>
  );
};

export default Sidebar;