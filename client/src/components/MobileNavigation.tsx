import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  onToggleFilters: () => void;
}

export default function MobileNavigation({ onToggleFilters }: MobileNavigationProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 flex justify-around lg:hidden z-10">
      <Button variant="ghost" className="flex flex-col items-center text-primary">
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span className="text-xs mt-1">Home</span>
      </Button>
      
      <Button variant="ghost" className="flex flex-col items-center text-neutral-500 hover:text-primary">
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <span className="text-xs mt-1">Search</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="flex flex-col items-center text-neutral-500 hover:text-primary"
        onClick={onToggleFilters}
      >
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"></path>
        </svg>
        <span className="text-xs mt-1">Filters</span>
      </Button>
      
      <Button variant="ghost" className="flex flex-col items-center text-neutral-500 hover:text-primary">
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
        <span className="text-xs mt-1">Stats</span>
      </Button>
    </div>
  );
}
