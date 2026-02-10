import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermissionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAccess: 'lead_admin' | 'admin';
  moduleName: string;
}

export function PermissionGateModal({ isOpen, onClose, requiredAccess, moduleName }: PermissionGateModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #FAF8F5, #FFFFFF)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-copper to-transparent" />

            <div className="flex flex-col items-center text-center px-6 py-8">
              {/* Animated lock icon */}
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShieldAlert className="w-12 h-12 text-copper" strokeWidth={1.5} />
              </motion.div>

              <h3 className="mt-4 font-serif text-xl font-semibold text-espresso">
                Access Restricted
              </h3>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {requiredAccess === 'lead_admin'
                  ? <>Only the Lead Admin can access the <strong className="text-foreground">{moduleName}</strong> module.</>
                  : <>Only Admins can access the <strong className="text-foreground">{moduleName}</strong> module.</>
                }
              </p>

              <p className="mt-1.5 text-xs text-muted-foreground/70 italic">
                Please contact your Lead Admin for access.
              </p>

              <Button
                variant="outline"
                className="mt-6 rounded-lg border-copper text-copper hover:bg-copper/10"
                onClick={onClose}
              >
                Understood
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
