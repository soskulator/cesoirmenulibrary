import { Layout } from '@/components/Layout';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { Download, Check, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Install() {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Layout>
      <div className="min-h-[80svh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo area */}
          <div className="space-y-3">
            <h1 className="font-playfair text-3xl font-semibold text-foreground">
              Install Ce Soir
            </h1>
            <p className="text-muted-foreground text-sm">
              Add the training app to your home screen for quick access.
            </p>
          </div>

          {isInstalled ? (
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-playfair text-xl font-medium text-foreground">
                Already Installed
              </h2>
              <p className="text-muted-foreground text-sm">
                Ce Soir is on your home screen. Open it from there for the best experience.
              </p>
            </div>
          ) : isInstallable ? (
            <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-playfair text-xl font-medium text-foreground">
                Ready to Install
              </h2>
              <p className="text-muted-foreground text-sm">
                Install the app for offline access and a native-like experience.
              </p>
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12"
                onClick={promptInstall}
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            </div>
          ) : isIOS ? (
            <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-playfair text-xl font-medium text-foreground">
                Install on iPhone
              </h2>
              <div className="text-left space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">1</span>
                  <p>Tap the <Share className="inline w-4 h-4 text-primary" /> <strong>Share</strong> button in Safari's toolbar.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">2</span>
                  <p>Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">3</span>
                  <p>Tap <strong>"Add"</strong> to confirm.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-playfair text-xl font-medium text-foreground">
                Install from Browser
              </h2>
              <p className="text-muted-foreground text-sm">
                Open this page in Chrome or Edge, then look for the install option in your browser's menu.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
