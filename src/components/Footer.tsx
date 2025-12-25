import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { OpenTableLogo } from './OpenTableLogo';
export function Footer() {
  return <footer className="bg-charcoal text-cream border-t border-border">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-semibold mb-4">Ce Soir</h3>
            <p className="text-cream/60 text-sm leading-relaxed">French - Mediterranean cuisine in the heart of Naples, Florida.</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-sm mb-4 text-copper">Contact</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-copper shrink-0" />
                <span>492 Bayfront Place
Naples, FL 34102<br />Naples, FL 34102</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-copper shrink-0" />
                <a href="tel:+12392619935" className="hover:text-cream transition-colors">
                  (239) 261-9935
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-copper shrink-0" />
                <a href="mailto:info@cesoirnaples.com" className="hover:text-cream transition-colors">
                  info@cesoirnaples.com
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-sm mb-4 text-copper">Hours</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-copper shrink-0" />
                <div>
                  <p><span className="text-cream">Mon - Thu:</span> 3pm - 10pm</p>
                  <p><span className="text-cream">Fri - Sat:</span> 3pm - 2am</p>
                  <p><span className="text-cream">Sunday:</span> 3pm - 10pm</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-sm mb-4 text-copper">Connect</h4>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/cesoirnaples" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream/70 hover:bg-copper hover:text-charcoal transition-all" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/cesoirnaples" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream/70 hover:bg-copper hover:text-charcoal transition-all" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.opentable.com/r/ce-soir-naples" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream/70 hover:bg-copper hover:text-charcoal transition-all" aria-label="OpenTable">
                <OpenTableLogo className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream/50">
          <p>© {new Date().getFullYear()} Ce Soir Restaurant. All rights reserved.</p>
          <p className="text-xs">Staff Training Portal</p>
        </div>
      </div>
    </footer>;
}