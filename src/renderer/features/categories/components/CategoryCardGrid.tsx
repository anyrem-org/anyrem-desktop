import { Link } from 'react-router-dom';
import { Badge } from '../../../shared/components/ui/badge';
import { Card, CardContent } from '../../../shared/components/ui/card';
import type { Category } from '../types/category.types';
import { CategoryActions } from './CategoryActions';
import { CategoryIcon } from './CategoryIcon';

export function CategoryCardGrid({
  categories,
  pending,
  onDelete,
}: {
  categories: Category[];
  pending: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => {
        return (
          <Card
            key={category.id}
            className="h-full transition hover:border-primary/30 hover:shadow-md"
          >
            <CardContent className="p-5">
              <Link to={`/categories/${category.id}`} className="block no-underline">
                <div className="flex items-start justify-between">
                  <span
                    className="grid size-11 place-items-center rounded-xl"
                    style={{ background: `${category.color}14`, color: category.color }}
                  >
                    <CategoryIcon name={category.icon} />
                  </span>
                  <Badge>{category.noteCount} notes</Badge>
                </div>
                <h3 className="mb-1 mt-5 text-foreground">{category.name}</h3>
                <p className="min-h-10 text-xs leading-5 text-muted-foreground">
                  {category.description}
                </p>
              </Link>
              <div className="mt-4">
                <CategoryActions category={category} pending={pending} onDelete={onDelete} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
