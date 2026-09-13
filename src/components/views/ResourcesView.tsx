import React from 'react';
import { Bookmark, Plus, ExternalLink, Globe, Book, Video, Code } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ResourcesView: React.FC<{ onOpenQuickAction: (type?: string) => void }> = ({
  onOpenQuickAction
}) => {
  const { resources } = useDashboardStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'youtube':
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'github':
        return <Code className="w-4 h-4 text-purple-500" />;
      case 'documentation':
        return <Book className="w-4 h-4 text-blue-500" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[var(--accent-primary)]" />
            Bookmarks & Resources
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Curated repository of whitepapers, documentation, GitHub repos, and video tutorials.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => onOpenQuickAction('resource')}
        >
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => (
          <Card key={res.id} hoverEffect className="flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--bg-surface-hover)]">{getIcon(res.type)}</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {res.type}
                  </span>
                </div>
                <Badge variant={res.status === 'completed' ? 'green' : 'blue'}>
                  {res.status.replace('_', ' ')}
                </Badge>
              </div>

              <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug">{res.title}</h4>
              {res.description && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                  {res.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)]">{res.category}</span>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-primary)] font-semibold hover:underline flex items-center gap-1"
              >
                Open Link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
