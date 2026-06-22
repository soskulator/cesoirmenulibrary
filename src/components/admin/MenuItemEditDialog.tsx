import { useState, useEffect, useRef } from 'react';
import { MenuItem, categories, AllergenType } from '@/data/menuTypes';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ALLERGEN_OPTIONS: AllergenType[] = [
  'gluten', 'dairy', 'egg', 'nuts', 'shellfish', 'fish', 
  'soy', 'sesame', 'allium', 'nightshade'
];

interface MenuItemEditDialogProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<MenuItem>) => Promise<boolean>;
  onAdd?: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> & { idPrefix?: string }) => Promise<MenuItem | null>;
  mode?: 'edit' | 'add';
}

type CocktailStyle = 'classic' | 'signature';

const initialFormData = {
  name: '',
  shortDescription: '',
  longDescription: '',
  categoryId: '',
  ingredientsText: '',
  prepNotes: '',
  sellingPointsText: '',
  allergens: [] as AllergenType[],
  isPublished: true,
  imageUrl: '/placeholder.svg',
};

const detectCocktailStyle = (id: string | undefined): CocktailStyle => {
  return id?.startsWith('signature-cocktail') ? 'signature' : 'classic';
};

export function MenuItemEditDialog({ 
  item, 
  open, 
  onOpenChange, 
  onSave, 
  onAdd,
  mode = 'edit' 
}: MenuItemEditDialogProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [cocktailStyle, setCocktailStyle] = useState<CocktailStyle>('signature');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        name: item.name,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        categoryId: item.categoryId,
        ingredientsText: item.ingredientsText,
        prepNotes: item.prepNotes,
        sellingPointsText: item.sellingPointsText,
        allergens: item.allergens,
        isPublished: item.isPublished,
        imageUrl: item.imageUrl,
      });
      setCocktailStyle(detectCocktailStyle(item.id));
      setPreviewUrl(item.imageUrl !== '/placeholder.svg' ? item.imageUrl : null);
    } else if (mode === 'add') {
      setFormData(initialFormData);
      setCocktailStyle('signature');
      setPreviewUrl(null);
    }
  }, [item, mode, open]);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Could not upload image.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload to storage
    const publicUrl = await uploadImage(file);
    if (publicUrl) {
      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } else {
      // Reset preview on failure
      setPreviewUrl(formData.imageUrl !== '/placeholder.svg' ? formData.imageUrl : null);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, imageUrl: '/placeholder.svg' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Item name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    
    if (mode === 'edit' && item) {
      const success = await onSave(item.id, formData);
      if (success) {
        onOpenChange(false);
      }
    } else if (mode === 'add' && onAdd) {
      const { ...itemData } = formData;
      const idPrefix = itemData.categoryId === 'cocktails'
        ? (cocktailStyle === 'signature' ? 'signature-cocktail' : 'cocktail')
        : undefined;
      const result = await onAdd({
        ...itemData,
        questions: [],
        idPrefix,
      });
      if (result) {
        onOpenChange(false);
      }
    }
    
    setSaving(false);
  };

  const toggleAllergen = (allergen: AllergenType) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit Menu Item' : 'Add New Item';
  const buttonText = isEdit ? 'Save Changes' : 'Add Item';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-4 pb-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted/50 flex items-center justify-center">
                  {previewUrl ? (
                    <>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-terra-cotta" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mb-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cocktail Style (only for cocktails category) */}
            {formData.categoryId === 'cocktails' && (
              <div className="space-y-2">
                <Label htmlFor="cocktailStyle">Cocktail Style *</Label>
                <Select
                  value={cocktailStyle}
                  onValueChange={(value) => setCocktailStyle(value as CocktailStyle)}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">⏱ Classic</SelectItem>
                    <SelectItem value="signature">⭐ Signature</SelectItem>
                  </SelectContent>
                </Select>
                {isEdit && (
                  <p className="text-xs text-muted-foreground">
                    Style is set at creation and cannot be changed here.
                  </p>
                )}
              </div>
            )}

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief description"
              />
            </div>

            {/* Long Description */}
            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                placeholder="Detailed description"
                rows={3}
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredientsText}
                onChange={(e) => setFormData(prev => ({ ...prev, ingredientsText: e.target.value }))}
                placeholder="List of ingredients"
                rows={2}
              />
            </div>

            {/* Prep Notes */}
            <div className="space-y-2">
              <Label htmlFor="prepNotes">Prep Notes</Label>
              <Textarea
                id="prepNotes"
                value={formData.prepNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, prepNotes: e.target.value }))}
                placeholder="Preparation notes"
                rows={2}
              />
            </div>

            {/* Selling Points */}
            <div className="space-y-2">
              <Label htmlFor="sellingPoints">Selling Points</Label>
              <Textarea
                id="sellingPoints"
                value={formData.sellingPointsText}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPointsText: e.target.value }))}
                placeholder="Key selling points"
                rows={2}
              />
            </div>

            {/* Allergens */}
            <div className="space-y-2">
              <Label>Allergens</Label>
              <div className="grid grid-cols-3 gap-2">
                {ALLERGEN_OPTIONS.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergen-${allergen}`}
                      checked={formData.allergens.includes(allergen)}
                      onCheckedChange={() => toggleAllergen(allergen)}
                    />
                    <label
                      htmlFor={`allergen-${allergen}`}
                      className="text-xs capitalize cursor-pointer"
                    >
                      {allergen.replace('-', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Published */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isPublished: checked === true }))
                }
              />
              <label htmlFor="isPublished" className="text-sm cursor-pointer">
                Published (visible to staff)
              </label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || uploading}
            className="bg-terra-cotta hover:bg-terra-cotta/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
