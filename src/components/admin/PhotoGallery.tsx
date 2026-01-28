import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ImageIcon, 
  Upload, 
  Search, 
  Trash2, 
  Link2, 
  Loader2,
  X,
  Check
} from 'lucide-react';
import { MenuItem, categories } from '@/data/menuData';

interface PhotoFile {
  name: string;
  url: string;
  created_at: string;
  size: number;
}

interface PhotoGalleryProps {
  menuItems: MenuItem[];
  onAssignPhoto: (itemId: string, photoUrl: string) => Promise<boolean>;
}

export function PhotoGallery({ menuItems, onAssignPhoto }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoFile | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch photos from storage
  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('menu-images')
        .list('items', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const photoFiles: PhotoFile[] = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('menu-images')
            .getPublicUrl(`items/${file.name}`);
          
          return {
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || new Date().toISOString(),
            size: file.metadata?.size || 0,
          };
        });

      setPhotos(photoFiles);
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Error Loading Photos',
        description: error.message || 'Could not load photos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('menu-images')
          .upload(`items/${fileName}`, file);

        if (!error) successCount++;
      }

      if (successCount > 0) {
        toast({
          title: 'Photos Uploaded',
          description: `${successCount} photo(s) uploaded successfully.`,
        });
        await fetchPhotos();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Some photos failed to upload.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photo: PhotoFile) => {
    setDeleting(photo.name);
    try {
      const { error } = await supabase.storage
        .from('menu-images')
        .remove([`items/${photo.name}`]);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.name !== photo.name));
      toast({
        title: 'Photo Deleted',
        description: 'The photo has been removed.',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Could not delete photo.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedPhoto || !selectedItemId) return;

    setAssigning(true);
    const success = await onAssignPhoto(selectedItemId, selectedPhoto.url);
    setAssigning(false);

    if (success) {
      toast({
        title: 'Photo Assigned',
        description: 'The photo has been assigned to the menu item.',
      });
      setAssignDialogOpen(false);
      setSelectedPhoto(null);
      setSelectedItemId('');
    }
  };

  const openAssignDialog = (photo: PhotoFile) => {
    setSelectedPhoto(photo);
    setAssignDialogOpen(true);
  };

  const filteredPhotos = photos.filter(photo =>
    photo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group menu items by category for the select dropdown
  const groupedItems = categories.map(cat => ({
    category: cat,
    items: menuItems.filter(item => item.categoryId === cat.id),
  })).filter(group => group.items.length > 0);

  return (
    <>
      <Card className="bg-card shadow-card h-full">
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
            </div>
            <Button 
              size="sm" 
              className="bg-terra-cotta hover:bg-terra-cotta/90 text-white text-xs sm:text-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 mr-1" />
              )}
              Upload
            </Button>
          </div>
          <CardTitle className="font-serif text-lg sm:text-xl">Photo Gallery</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {photos.length} photos • Click to assign to menu items
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[280px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click Upload to add menu photos</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pr-3">
                {filteredPhotos.map((photo) => (
                  <div 
                    key={photo.name}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7"
                        onClick={() => openAssignDialog(photo)}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        disabled={deleting === photo.name}
                        onClick={() => handleDelete(photo)}
                      >
                        {deleting === photo.name ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Assign Photo Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Assign Photo to Menu Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedPhoto && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img 
                  src={selectedPhoto.url} 
                  alt="Selected" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Menu Item</label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a menu item..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {groupedItems.map(group => (
                    <div key={group.category.id}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                        {group.category.icon} {group.category.name}
                      </div>
                      {group.items.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedItemId || assigning}
              className="bg-terra-cotta hover:bg-terra-cotta/90"
            >
              {assigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Assign Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
