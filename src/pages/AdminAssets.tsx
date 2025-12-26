import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  FileText, 
  Palette, 
  Download,
  CheckCircle,
  Circle,
  ArrowLeft
} from 'lucide-react';

const requiredAssets = [
  {
    name: 'Logo (SVG or PNG)',
    description: 'Primary logo for header and branding. Recommended: SVG for scalability, or PNG at 200x200px minimum.',
    status: 'missing',
    fileTypes: '.svg, .png',
  },
  {
    name: 'Brand Colors',
    description: 'Primary and secondary brand colors. Currently using: Burgundy (#8B2942), Gold (#C9A227), Cream (#FAF8F5)',
    status: 'configured',
    fileTypes: 'HEX or RGB values',
  },
  {
    name: 'Font Files (Optional)',
    description: 'Currently using Playfair Display (serif) and DM Sans (sans-serif) from Google Fonts.',
    status: 'configured',
    fileTypes: '.woff, .woff2, .ttf',
  },
  {
    name: 'Menu Item Photos',
    description: 'High-quality photos of each dish. Recommended: 800x600px, JPG format, consistent lighting.',
    status: 'missing',
    fileTypes: '.jpg, .png, .webp',
  },
  {
    name: 'Menu Spreadsheet (CSV)',
    description: 'Bulk import menu data including names, descriptions, ingredients, allergens, and questions.',
    status: 'missing',
    fileTypes: '.csv',
  },
  {
    name: 'Recipe PDFs (Optional)',
    description: 'Detailed recipe documents for manager/kitchen reference.',
    status: 'missing',
    fileTypes: '.pdf',
  },
];

export default function AdminAssetsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You need admin permissions to access this page.',
        variant: 'destructive',
      });
    }
  }, [authLoading, user, isAdmin, navigate, toast]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <p className="text-muted-foreground">Checking permissions…</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <Image className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Assets & Design Direction</h1>
              <p className="text-muted-foreground">
                Upload brand assets and design files
              </p>
            </div>
          </div>
        </div>

        {/* Required Assets Checklist */}
        <div className="space-y-4 mb-8">
          <h2 className="font-serif text-xl font-semibold">Required Assets Checklist</h2>
          
          {requiredAssets.map((asset, index) => (
            <motion.div
              key={asset.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={asset.status === 'configured' ? 'border-sage/50 bg-sage/5' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {asset.status === 'configured' ? (
                        <CheckCircle className="w-5 h-5 text-sage" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{asset.name}</h3>
                        <Badge variant={asset.status === 'configured' ? 'sage' : 'secondary'}>
                          {asset.status === 'configured' ? 'Configured' : 'Needed'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {asset.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Accepted formats: {asset.fileTypes}
                      </p>
                    </div>
                    {asset.status !== 'configured' && (
                      <Button variant="outline" size="sm" disabled>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CSV Template */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              CSV Import Template
            </CardTitle>
            <CardDescription>
              Download the template to bulk import menu items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg mb-4 font-mono text-xs overflow-x-auto">
              <p>name,category,shortDescription,longDescription,ingredients,allergens,sellingPoints,question1,answer1,question2,answer2</p>
              <p>"French Onion Soup","appetizers","Classic caramelized onion soup...","Our signature...","Vidalia onions, beef stock...","gluten,dairy,allium","House-made stock • 4-hour caramelized...","What makes our soup special?","4-hour caramelized onions...","Is it gluten-free?","Yes, without crouton"</p>
            </div>
            <Button variant="burgundy" disabled>
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Note: CSV import requires Lovable Cloud connection for database storage.
            </p>
          </CardContent>
        </Card>

        {/* Current Brand Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gold" />
              Current Brand Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Brand Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-burgundy" />
                    <div>
                      <p className="text-sm font-medium">Burgundy (Primary)</p>
                      <p className="text-xs text-muted-foreground">HSL: 350 65% 35%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold" />
                    <div>
                      <p className="text-sm font-medium">Gold (Accent)</p>
                      <p className="text-xs text-muted-foreground">HSL: 38 70% 55%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cream border" />
                    <div>
                      <p className="text-sm font-medium">Cream (Background)</p>
                      <p className="text-xs text-muted-foreground">HSL: 40 30% 97%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-serif text-2xl">Playfair Display</p>
                    <p className="text-xs text-muted-foreground">Headlines & Titles</p>
                  </div>
                  <div>
                    <p className="font-sans text-lg">DM Sans</p>
                    <p className="text-xs text-muted-foreground">Body Text & UI</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cloud CTA */}
        <Card className="mt-8 bg-gradient-to-r from-burgundy/5 to-gold/5 border-none">
          <CardContent className="p-6 text-center">
            <h3 className="font-serif text-xl font-semibold mb-2">
              Ready to go live?
            </h3>
            <p className="text-muted-foreground mb-4">
              Connect to Lovable Cloud to enable file uploads, user authentication, 
              and persistent data storage.
            </p>
            <Button variant="burgundy" disabled>
              Connect Lovable Cloud
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
