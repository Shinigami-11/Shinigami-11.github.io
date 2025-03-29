import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-darkest text-white py-4">
      <div className="container mx-auto text-center text-sm">
        <p>QuizParserinator &copy; {new Date().getFullYear()} | Cross-platform Quiz Application</p>
      </div>
    </footer>
  );
};

export default Footer;
