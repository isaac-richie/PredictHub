"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Github, Twitter, MessageCircle } from 'lucide-react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number>(2025);
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700/50 mt-16">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-teal-500/5"></div>
      
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content - Single Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                PredictHub
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Multi-platform prediction market aggregator
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">All systems operational</span>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">Platforms</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="https://polymarket.com" target="_blank" className="text-xs text-gray-400 hover:text-blue-400 transition-colors">
                  Polymarket
                </Link>
              </li>
              <li>
                <Link href="https://polkamarkets.com" target="_blank" className="text-xs text-gray-400 hover:text-purple-400 transition-colors">
                  Myriad
                </Link>
              </li>
              <li>
                <Link href="https://limitless.exchange" target="_blank" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
                  Limitless
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">Resources</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">Connect</h3>
            <div className="flex gap-2 mb-3">
              <SocialIcon 
                href="https://x.com/predicthub" 
                icon={<Twitter className="w-3.5 h-3.5" />}
                label="Twitter"
              />
              <SocialIcon 
                href="https://discord.gg/predicthub" 
                icon={<MessageCircle className="w-3.5 h-3.5" />}
                label="Discord"
              />
              <SocialIcon 
                href="https://github.com/predicthub" 
                icon={<Github className="w-3.5 h-3.5" />}
                label="GitHub"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar - Compact */}
        <div className="border-t border-gray-700/50 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-gray-400">
            © {currentYear}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
              PredictHub
            </span>
          </p>
          
          <div className="flex items-center space-x-4 text-gray-400">
            <Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link>
          </div>
        </div>

        {/* Disclaimer - Ultra compact */}
        <div className="text-[10px] text-gray-600 text-center mt-4 leading-tight">
          PredictHub is an aggregator. Not affiliated with listed platforms. Trading involves risk. DYOR.
        </div>
      </div>
    </footer>
  );
};

// Social Icon Component - Compact style
const SocialIcon = ({ href, icon, label }: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
}) => (
  <Link 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
    aria-label={label}
  >
    <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
      {icon}
    </div>
  </Link>
);

export default Footer;
