import React from 'react';
import { Calendar } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-blue-600 font-semibold">
            <Calendar className="h-5 w-5" />
            <span>EventQA</span>
            <span className="text-gray-400 text-sm font-normal">| STQA Capstone Project</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EventQA. Built for Software Testing and Quality Assurance.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
