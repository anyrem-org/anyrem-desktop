import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { notes } from '../../notes/api/notes.api';
import { NoteCard } from '../../notes/components/NoteCard';
import { categories } from '../api/categories.api';
import { CategoryIcon } from '../components/CategoryIcon';

export function CategoryDetailPage() {
  const {id} = useParams(); const category = categories.find((item) => item.id === id); const matched = notes.filter((note) => note.categoryIds.includes(id ?? ''));
  if (!category) return <div className="p-8">Category not found.</div>;
  return <div className="mx-auto max-w-5xl p-8"><Button variant="ghost" asChild className="mb-5"><Link to="/categories" className="no-underline"><ArrowLeft size={16}/> Categories</Link></Button><div className="mb-7 flex items-center gap-4"><span className="grid size-14 place-items-center rounded-2xl" style={{background: `${category.color}14`, color: category.color}}><CategoryIcon name={category.icon} size={25}/></span><div><div className="flex items-center gap-2"><h2 className="m-0 text-2xl">{category.name}</h2><Badge>{matched.length} memories</Badge></div><p className="mb-0 mt-1 text-sm text-muted-foreground">{category.description}</p></div></div>{matched.length ? <div className="grid grid-cols-2 gap-4">{matched.map((note) => <NoteCard key={note.id} note={note}/>)}</div> : <div className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">No memories in this category yet.</div>}</div>;
}
