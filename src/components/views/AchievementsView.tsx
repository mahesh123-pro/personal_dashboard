import React, { useState } from 'react';
import {
  Trophy,
  ExternalLink,
  Calendar,
  Star,
  Sparkles,
  Plus,
  Search,
  Trash2,
  Award,
  Zap,
  CheckCircle2,
  Share2,
  Check,
  FolderGit2,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { Achievement } from '../../types';

export const AchievementsView: React.FC = () => {
  const { achievements, certifications, projects, goals, habits } = useDashboardStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Achievement['category']>('certification');
  const [date, setDate] = useState(todayStr);
  const [description, setDescription] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');

  // ----------------------------------------------------
  // AUTOMATIC ACHIEVEMENT AUTO-DETECTION ENGINE
  // ----------------------------------------------------
  const handleAutoDetectMilestones = () => {
    let newlyDetectedCount = 0;
    const existingTitles = new Set(achievements.map((a) => a.title.toLowerCase()));

    // 1. Detect Passed Certifications
    certifications.forEach((cert) => {
      if (cert.status === 'passed' && !existingTitles.has(`certified: ${cert.name.toLowerCase()}`)) {
        store.addAchievement({
          title: `Certified: ${cert.name}`,
          category: 'certification',
          date: cert.completionDate || todayStr,
          description: `Passed ${cert.name} certification provided by ${cert.provider}.${cert.score ? ` Score: ${cert.score}` : ''}`,
          credentialUrl: cert.credentialUrl
        });
        newlyDetectedCount++;
      }
    });

    // 2. Detect Completed Projects
    projects.forEach((proj) => {
      if ((proj.status === 'completed' || proj.progress === 100) && !existingTitles.has(`shipped: ${proj.name.toLowerCase()}`)) {
        store.addAchievement({
          title: `Shipped: ${proj.name}`,
          category: 'project',
          date: proj.targetCompletionDate || todayStr,
          description: `Completed full product development for ${proj.name}. Built with ${proj.techStack.join(', ')}.`,
          credentialUrl: proj.deployUrl || proj.repoUrl
        });
        newlyDetectedCount++;
      }
    });

    // 3. Detect Completed Goals
    goals.forEach((goal) => {
      if (goal.status === 'completed' && !existingTitles.has(`goal achieved: ${goal.name.toLowerCase()}`)) {
        store.addAchievement({
          title: `Goal Achieved: ${goal.name}`,
          category: 'competition',
          date: goal.deadline || todayStr,
          description: `Successfully accomplished strategic goal: ${goal.description}`
        });
        newlyDetectedCount++;
      }
    });

    // 4. Detect High Habit Streaks (>= 7 days)
    habits.forEach((habit) => {
      if (habit.bestStreak >= 7 && !existingTitles.has(`${habit.name.toLowerCase()} milestone`)) {
        store.addAchievement({
          title: `🔥 ${habit.bestStreak}-Day ${habit.name} Streak`,
          category: 'award',
          date: todayStr,
          description: `Maintained a continuous ${habit.bestStreak}-day habit streak for ${habit.name}.`
        });
        newlyDetectedCount++;
      }
    });

    if (newlyDetectedCount > 0) {
      alert(`🎉 Auto-detected ${newlyDetectedCount} new milestones and added them to your Trophy Showcase!`);
    } else {
      alert('⚡ All completed projects, certifications, and habit milestones are already in your Trophy Showcase!');
    }
  };

  // Calculate XP & Rank
  const totalXP = achievements.length * 250 + certifications.filter((c) => c.status === 'passed').length * 400;
  const userLevel = Math.floor(totalXP / 500) + 1;
  const levelProgress = ((totalXP % 500) / 500) * 100;

  // Filter & Search
  const filteredAchievements = achievements.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const sortedAchievements = [...filteredAchievements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddManualAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    store.addAchievement({
      title: title.trim(),
      category,
      date,
      description: description.trim(),
      credentialUrl: credentialUrl.trim() || undefined
    });

    setTitle('');
    setDescription('');
    setCredentialUrl('');
    setIsModalOpen(false);
  };

  const handleShareAchievement = (item: Achievement) => {
    const text = `🏆 ACHIEVEMENT UNLOCKED: ${item.title}\n📅 Date: ${item.date}\n📜 Details: ${item.description}${item.credentialUrl ? `\n🔗 Credential: ${item.credentialUrl}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-[var(--bg-surface-subtle)] via-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border border-[var(--border-main)] shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Trophy Cabinet & Milestones
              </span>
              <span className="text-xs text-[var(--text-muted)]">• Level {userLevel} Tech Scholar</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Achievements & Milestone Showcase
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-xl mt-1">
              Verified certifications, deployed engineering projects, hackathon wins, and personal B.Tech milestones.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleAutoDetectMilestones}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Auto-Detect Milestones
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Milestone
            </Button>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-5 pt-4 border-t border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs border border-amber-500/20">
              ⚡
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Scholar Level {userLevel}</span>
                <span className="text-[10px] text-[var(--text-muted)]">({totalXP} Total XP)</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {500 - (totalXP % 500)} XP to Level {userLevel + 1}
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="w-full bg-[var(--bg-surface-hover)] h-2 rounded-full overflow-hidden border border-[var(--border-main)]">
              <div
                className="bg-gradient-to-r from-amber-500 to-[var(--accent-primary)] h-full rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* METRIC STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Total Unlocked
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{achievements.length}</div>
          <div className="text-[10px] text-[var(--text-muted)]">Verified milestones</div>
        </Card>

        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-blue-500" /> Certifications
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {achievements.filter((a) => a.category === 'certification').length}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Passed credentials</div>
        </Card>

        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" /> Deployments
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {achievements.filter((a) => a.category === 'project').length}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Shipped products</div>
        </Card>

        <Card p-4 className="space-y-1 bg-[var(--bg-surface)] border-[var(--border-main)] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-purple-500" /> Hackathons & Awards
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {achievements.filter((a) => a.category === 'hackathon' || a.category === 'competition' || a.category === 'award').length}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Competitions & honors</div>
        </Card>
      </div>

      {/* FILTER TABS & SEARCH & VIEW MODE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'certification', label: 'Certifications' },
            { id: 'project', label: 'Projects' },
            { id: 'hackathon', label: 'Hackathons' },
            { id: 'competition', label: 'Competitions' },
            { id: 'award', label: 'Awards' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] w-44"
            />
          </div>

          {/* View Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : ''}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs' : ''}`}
              title="Timeline View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRID GALLERY VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                <Trophy className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="font-semibold text-[var(--text-primary)]">No achievements found matching your filter.</p>
                <p>Click "Auto-Detect Milestones" above to pull completed certifications and projects.</p>
              </Card>
            </div>
          ) : (
            sortedAchievements.map((item) => (
              <Card
                key={item.id}
                className="p-5 relative overflow-hidden bg-[var(--bg-surface)] border-[var(--border-main)] hover:border-[var(--border-strong)] transition-all space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleShareAchievement(item)}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                        title="Copy Achievement Card"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => store.deleteAchievement(item.id)}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete achievement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>

                  {item.credentialUrl ? (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent-primary)] font-semibold hover:underline flex items-center gap-1"
                    >
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)] italic flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="relative pl-6 border-l-2 border-[var(--border-main)] space-y-6 my-6">
          {sortedAchievements.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline Node */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[var(--accent-primary)] ring-4 ring-[var(--bg-app)] flex items-center justify-center text-white">
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>

              <Card hoverEffect className="p-4 space-y-2 bg-[var(--bg-surface)] border-[var(--border-main)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                    {item.category}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {item.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>

                {item.credentialUrl && (
                  <div className="pt-2 border-t border-[var(--border-main)]">
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent-primary)] font-semibold hover:underline flex items-center gap-1"
                    >
                      Verify Credential <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* ADD MANUAL ACHIEVEMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Achievement or Milestone"
        maxWidth="md"
      >
        <form onSubmit={handleAddManualAchievement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Achievement Title
            </label>
            <input
              type="text"
              placeholder="e.g. AWS Certified Solutions Architect - Associate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="certification">Certification</option>
                <option value="project">Project Deployment</option>
                <option value="hackathon">Hackathon</option>
                <option value="competition">Competition</option>
                <option value="award">Award / Honor</option>
                <option value="github">GitHub / Code</option>
                <option value="course">Course Completion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Achievement Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of your accomplishment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Credential / Verification Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://www.credly.com/badges/..."
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Achievement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
