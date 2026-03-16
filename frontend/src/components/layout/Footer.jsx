// Footer component
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';

export const Footer = () => {
  return (
    <footer
      className={cn(
        'bg-[#FAFAFA] border-t border-[rgba(0,0,0,0.05)]',
        'py-16 md:py-20'
      )}
      data-testid="footer"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-1 mb-4">
              <span className="font-heading font-semibold text-[#09090B]">100Cr</span>
              <span className="font-heading text-[#A1A1AA]">Engine</span>
            </Link>
            <p className="text-sm text-[#52525B] leading-relaxed">
              {copy.footer.tagline}
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="type-label text-[#A1A1AA] mb-4">
              {copy.footer.links.product}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/tools/100cr-calculator"
                  className="text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
                >
                  {copy.footer.links.calculator}
                </Link>
              </li>
              <li>
                <Link
                  to="/tools/100cr-calculator#benchmarks"
                  className="text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
                >
                  {copy.footer.links.benchmarks}
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
                >
                  {copy.footer.links.pricing}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="type-label text-[#A1A1AA] mb-4">
              {copy.footer.links.resources}
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-[#A1A1AA] cursor-not-allowed">
                  {copy.footer.links.blog} (Coming soon)
                </span>
              </li>
              <li>
                <span className="text-sm text-[#A1A1AA] cursor-not-allowed">
                  {copy.footer.links.guides} (Coming soon)
                </span>
              </li>
              <li>
                <span className="text-sm text-[#A1A1AA] cursor-not-allowed">
                  {copy.footer.links.support} (Coming soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="type-label text-[#A1A1AA] mb-4">
              {copy.footer.links.legal}
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-[#A1A1AA] cursor-not-allowed">
                  {copy.footer.links.privacy}
                </span>
              </li>
              <li>
                <span className="text-sm text-[#A1A1AA] cursor-not-allowed">
                  {copy.footer.links.terms}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-[rgba(0,0,0,0.05)]">
          <p className="text-xs text-[#A1A1AA] text-center">
            {copy.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
