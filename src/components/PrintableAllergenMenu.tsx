import { useMemo, forwardRef } from 'react';
import { MenuItem, AllergenType, allergens, getCategoryById } from '@/data/menuTypes';
import logoImage from '@/assets/cesoir-logo.png';
import { AllergenModification } from '@/hooks/useAllergenModifications';
import { DbCategory } from '@/hooks/useCategories';

interface PrintableAllergenMenuProps {
  selectedAllergens: AllergenType[];
  menuItems: MenuItem[];
  modifications: AllergenModification[];
  categories: DbCategory[];
}

const COURSE_ORDER = ['crudo', 'appetizers', 'fruits-de-mer', 'pasta', 'entrees', 'sides', 'desserts', 'sauces'];
const BEVERAGE_CATS = ['wine', 'spirits', 'cocktails'];

type ItemStatus = 'safe' | 'modifiable' | 'avoid';

interface CategorizedItem {
  item: MenuItem;
  status: ItemStatus;
  matchingAllergens: AllergenType[];
  modNotes?: string;
}

export const PrintableAllergenMenu = forwardRef<HTMLDivElement, PrintableAllergenMenuProps>(
  ({ selectedAllergens, menuItems, modifications, categories }, ref) => {

    const allergenNames = selectedAllergens.map(id => {
      const a = allergens.find(al => al.id === id);
      return a ? `${a.icon} ${a.name}` : id;
    });

    const courseData = useMemo(() => {
      const foodItems = menuItems.filter(
        i => i.isPublished && !BEVERAGE_CATS.includes(i.categoryId)
      );

      const grouped: Record<string, CategorizedItem[]> = {};

      foodItems.forEach(item => {
        const matching = item.allergens.filter(a => selectedAllergens.includes(a));
        let status: ItemStatus = 'safe';
        let modNotes = '';

        if (matching.length > 0) {
          // Check if ALL matching allergens can be removed
          const allModifiable = matching.every(allergenId => {
            const mod = modifications.find(
              m => m.menu_item_id === item.id && m.allergen_type === allergenId
            );
            return mod?.can_remove;
          });

        if (allModifiable) {
            status = 'modifiable';
            const notes = matching
              .map(allergenId => {
                const mod = modifications.find(
                  m => m.menu_item_id === item.id && m.allergen_type === allergenId
                );
                return mod?.substitution_notes?.trim();
              })
              .filter(Boolean);
            modNotes = notes.join('; ');
          } else {
            // Skip items that cannot accommodate — don't add to print menu
            return;
          }
        }

        const catId = item.categoryId;
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push({ item, status, matchingAllergens: matching, modNotes });
      });

      // Sort by course order
      return COURSE_ORDER
        .filter(catId => grouped[catId] && grouped[catId].length > 0)
        .map(catId => {
          const cat = categories.find(c => c.id === catId);
          return {
            id: catId,
            name: cat?.name || catId,
            nameFrench: cat?.name_french || '',
            items: grouped[catId],
          };
        });
    }, [menuItems, selectedAllergens, modifications, categories]);

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
      <div ref={ref} className="print-menu" style={{ display: 'none' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-menu, .print-menu * {
              visibility: visible !important;
            }
            .print-menu {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0.5in 0.6in;
              font-family: 'DM Sans', sans-serif;
              font-size: 10pt;
              color: #1a1a1a;
              line-height: 1.4;
            }
            .print-logo {
              height: 60pt;
              width: auto;
              margin: 0 auto 8pt;
              display: block;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20pt;
              padding-bottom: 12pt;
              border-bottom: 1.5pt solid #b87333;
            }
            .print-title {
              font-family: 'Playfair Display', serif;
              font-size: 20pt;
              font-weight: 700;
              margin: 0 0 4pt;
              color: #1a1a1a;
            }
            .print-subtitle {
              font-size: 9pt;
              color: #666;
              margin: 0 0 8pt;
            }
            .print-allergens-list {
              display: inline-block;
              background: #fef3e6;
              border: 1pt solid #e8c19a;
              border-radius: 4pt;
              padding: 4pt 10pt;
              font-size: 9pt;
              font-weight: 600;
              color: #8b5e34;
            }
            .print-legend {
              display: flex;
              justify-content: center;
              gap: 16pt;
              margin: 10pt 0 4pt;
              font-size: 8pt;
              color: #888;
            }
            .print-legend-item {
              display: flex;
              align-items: center;
              gap: 3pt;
            }
            .dot-safe { width: 6pt; height: 6pt; border-radius: 50%; background: #5a8f5a; display: inline-block; }
            .dot-mod { width: 6pt; height: 6pt; border-radius: 50%; background: #d4a030; display: inline-block; }
            
            .print-course {
              margin-bottom: 14pt;
              page-break-inside: avoid;
            }
            .print-course-title {
              font-family: 'Playfair Display', serif;
              font-size: 12pt;
              font-weight: 700;
              color: #b87333;
              border-bottom: 0.5pt solid #ddd;
              padding-bottom: 3pt;
              margin-bottom: 6pt;
            }
            .print-item {
              display: flex;
              align-items: baseline;
              gap: 6pt;
              padding: 2pt 0;
              page-break-inside: avoid;
            }
            .print-item-status {
              flex-shrink: 0;
              width: 8pt;
              height: 8pt;
              border-radius: 50%;
              margin-top: 3pt;
            }
            .status-safe { background: #5a8f5a; }
            .status-modifiable { background: #d4a030; }
            .print-item-name {
              font-weight: 600;
              font-size: 10pt;
            }
            .print-item-desc {
              color: #666;
              font-size: 8.5pt;
              margin-left: 14pt;
              font-style: italic;
            }
            .print-item-mod {
              color: #8b6914;
              font-size: 8pt;
              margin-left: 14pt;
              padding: 1pt 0;
            }
            .print-footer {
              margin-top: 16pt;
              padding-top: 8pt;
              border-top: 0.5pt solid #ddd;
              text-align: center;
              font-size: 7.5pt;
              color: #999;
            }
            .print-warning {
              margin-top: 12pt;
              padding: 6pt 10pt;
              border: 1pt solid #e8c19a;
              border-radius: 4pt;
              background: #fffbf5;
              font-size: 8pt;
              color: #8b5e34;
              text-align: center;
            }
          }
        `}</style>

        <div className="print-header">
          <img src={logoImage} alt="Ce Soir" className="print-logo" />
          <div className="print-title">Adapted Menu</div>
          <div className="print-subtitle">{today}</div>
          <div className="print-allergens-list">
            Avoiding: {allergenNames.join(' · ')}
          </div>
          <div className="print-legend">
            <span className="print-legend-item"><span className="dot-safe" /> Safe as-is</span>
            <span className="print-legend-item"><span className="dot-mod" /> Can be modified</span>
            <span className="print-legend-item"><span className="dot-avoid" /> Cannot accommodate</span>
          </div>
        </div>

        {courseData.map(course => (
          <div key={course.id} className="print-course">
            <div className="print-course-title">{course.name}</div>
            {course.items.map(({ item, status, modNotes }) => (
              <div key={item.id}>
                <div className="print-item">
                  <span className={`print-item-status status-${status}`} />
                  <span className={`print-item-name ${status === 'avoid' ? 'print-item-avoid' : ''}`}>
                    {item.name}
                  </span>
                </div>
                {item.shortDescription && (
                  <div className={`print-item-desc ${status === 'avoid' ? 'print-item-avoid' : ''}`}>
                    {item.shortDescription}
                  </div>
                )}
                {status === 'modifiable' && modNotes && (
                  <div className="print-item-mod">⟶ {modNotes}</div>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="print-warning">
          ⚠ Our kitchen handles all major allergens. While we take precautions, we cannot guarantee a completely allergen-free environment. Please inform your server of any allergies.
        </div>

        <div className="print-footer">
          Ce Soir Naples · 492 Bayfront Pl, Naples FL 34102 · cesoirnaples.com
        </div>
      </div>
    );
  }
);

PrintableAllergenMenu.displayName = 'PrintableAllergenMenu';
