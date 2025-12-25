import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  Upload, 
  Users, 
  Calendar,
  FileText,
  Image,
  Lock,
  ArrowRight
} from 'lucide-react';

const adminSections = [
  {
    title: 'Menu Items',
    description: 'Add, edit, or remove menu items',
    icon: FileText,
    path: '/admin/items',
    badge: 'Coming Soon',
    disabled: true,
  },
  {
    title: 'Categories',
    description: 'Manage menu categories',
    icon: Database,
    path: '/admin/categories',
    badge: 'Coming Soon',
    disabled: true,
  },
  {
    title: 'CSV Import',
    description: 'Bulk import menu items from CSV',
    icon: Upload,
    path: '/admin/import',
    badge: 'Coming Soon',
    disabled: true,
  },
  {
    title: 'Daily Focus',
    description: 'Schedule featured items for each day',
    icon: Calendar,
    path: '/admin/focus',
    badge: 'Coming Soon',
    disabled: true,
  },
  {
    title: 'Assets & Design',
    description: 'Upload logos, images, and brand assets',
    icon: Image,
    path: '/admin/assets',
    badge: null,
    disabled: false,
  },
  {
    title: 'User Management',
    description: 'Manage admin and staff access',
    icon: Users,
    path: '/admin/users',
    badge: null,
    disabled: false,
  },
];

export default function AdminPage() {
  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage menu content and settings
              </p>
            </div>
          </div>
        </div>

        {/* Login Notice */}
        <Card className="mb-8 bg-burgundy/5 border-burgundy/20">
          <CardContent className="p-6 flex items-center gap-4">
            <Lock className="w-8 h-8 text-burgundy" />
            <div>
              <h3 className="font-semibold text-burgundy">Authentication Required</h3>
              <p className="text-sm text-muted-foreground">
                To enable full admin functionality with database persistence, 
                connect to Lovable Cloud for authentication and data storage.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Sections */}
        <div className="grid md:grid-cols-2 gap-4">
          {adminSections.map((section, index) => (
            <motion.div
              key={section.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {section.disabled ? (
                <Card className="h-full opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      {section.badge && (
                        <Badge variant="secondary">{section.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <Link to={section.path}>
                  <Card className="h-full hover:shadow-card-hover transition-all hover:-translate-y-1 group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                          <section.icon className="w-5 h-5 text-gold" />
                        </div>
                        {section.badge && (
                          <Badge variant="gold">{section.badge}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-burgundy transition-colors">
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="link" className="p-0 h-auto text-burgundy">
                        Open
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Current Menu Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-serif font-bold text-burgundy">9</p>
                <p className="text-sm text-muted-foreground">Menu Items</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-burgundy">5</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-burgundy">10</p>
                <p className="text-sm text-muted-foreground">Allergens</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-burgundy">27</p>
                <p className="text-sm text-muted-foreground">Quiz Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
