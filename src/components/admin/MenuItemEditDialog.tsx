import { useState, useEffect } from 'react';
import { MenuItem, categories, AllergenType } from '@/data/menuData';
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
import { Loader2 } from 'lucide-react';

const ALLERGEN_OPTIONS: AllergenType[] = [
  'gluten', 'dairy', 'egg', 'nuts', 'shellfish', 'fish', 
  'soy', 'sesame', 'allium', 'nightshade'
];

interface MenuItemEditDialogProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<MenuItem>) => Promise<boolean>;
}

export function MenuItemEditDialog({ item, open, onOpenChange, onSave }: MenuItemEditDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    longDescription: '',
    categoryId: '',
    ingredientsText: '',
    prepNotes: '',
    sellingPointsText: '',
    allergens: [] as AllergenType[],
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
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
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    const success = await onSave(item.id, formData);
    setSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const toggleAllergen = (allergen: AllergenType) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-serif text-xl">Edit Menu Item</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-4 pb-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-terra-cotta hover:bg-terra-cotta/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
