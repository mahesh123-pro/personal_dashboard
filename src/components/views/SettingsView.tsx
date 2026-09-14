import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Save,
  MoreVertical,
  Database,
  Sliders,
  Camera,
  Eye,
  CheckCircle2,
  Type,
  Tag,
  Calendar,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { useDashboardStore, store } from '../../store/dashboardStore';
import { useTheme } from '../../context/ThemeContext';
import type { FontFamily, FontSize, LabelStyle } from '../../context/ThemeContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';


// Preset Avatars (Scalable Vector Data URIs)
const PRESET_AVATARS = [
  {
    id: 'cloud',
    name: 'Cloud Engineer',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%232563eb"/><path d="M50 25a18 18 0 0 1 18 18c6 0 10 4 10 10s-4 10-10 10H32c-6 0-10-4-10-10s4-10 10-10a18 18 0 0 1 18-18z" fill="%23ffffff"/></svg>'
  },
  {
    id: 'vlsi',
    name: 'VLSI / Hardware',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%237c3aed"/><rect x="30" y="30" width="40" height="40" rx="6" fill="%23ffffff"/><circle cx="50" cy="50" r="10" fill="%237c3aed"/></svg>'
  },
  {
    id: 'devops',
    name: 'DevOps & Linux',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23059669"/><path d="M30 40l20-15 20 15v25L50 80 30 65V40z" fill="%23ffffff"/></svg>'
  },
  {
    id: 'cyber',
    name: 'Systems Architect',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230891b2"/><circle cx="50" cy="40" r="16" fill="%23ffffff"/><path d="M25 75c0-14 11-25 25-25s25 11 25 25" fill="%23ffffff"/></svg>'
  },
  {
    id: 'grad',
    name: 'Tech Scholar',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23d97706"/><path d="M50 25L20 40l30 15 30-15-30-15zm-20 25v15c0 10 20 10 20 10s20 0 20-10V50" fill="%23ffffff"/></svg>'
  }
];

export const SettingsView: React.FC = () => {
  const state = useDashboardStore();
  const { profile } = state;
  const { theme, setTheme, accent, setAccent, preferences, updatePreferences } = useTheme();

  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [college, setCollege] = useState(profile.college);
  const [degree, setDegree] = useState(profile.degree);
  const [gradYear, setGradYear] = useState(profile.graduationYear.toString());
  const [savedToast, setSavedToast] = useState(false);

  // More Options Menus State
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAvatarMoreOpen, setIsAvatarMoreOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedDataUri, setCopiedDataUri] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close popup menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({
      name,
      role,
      college,
      degree,
      graduationYear: parseInt(gradYear) || 2027
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Profile Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          store.updateProfile({ avatarUrl: event.target.result as string });
          setIsAvatarMoreOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    store.updateProfile({ avatarUrl: undefined });
    setIsAvatarMoreOpen(false);
  };

  const handleSelectPresetAvatar = (url: string) => {
    store.updateProfile({ avatarUrl: url });
    setIsAvatarMoreOpen(false);
  };

  const handleCopyAvatarDataUri = () => {
    if (profile.avatarUrl) {
      navigator.clipboard.writeText(profile.avatarUrl);
      setCopiedDataUri(true);
      setTimeout(() => setCopiedDataUri(false), 2000);
    }
    setIsAvatarMoreOpen(false);
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.getState(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `personal_os_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsMoreMenuOpen(false);
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          store.importState(parsed);
          alert('Data imported successfully!');
        } catch (err) {
          alert('Failed to import JSON file. Please ensure it is a valid backup file.');
        }
      };
    }
    setIsMoreMenuOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header Bar with More Options Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
            System Settings & Preferences
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Customize typography, font sizes, UI labels, color themes, and manage data backups.
          </p>
        </div>

        {/* Top Actions & More Options Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="primary"
            size="sm"
            onClick={handleProfileSave}
            icon={<Save className="w-4 h-4" />}
          >
            Save Profile
          </Button>

          {/* More Options Popover Button */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
              title="More System Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Popover Dropdown Menu */}
            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-panel bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-xl z-50 py-2 animate-fadeIn text-xs">
                <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)] border-b border-[var(--border-main)]">
                  Data & Backup Controls
                </div>

                <button
                  onClick={handleExportData}
                  className="w-full px-3.5 py-2 text-left text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Export JSON Backup</span>
                </button>

                <label className="w-full px-3.5 py-2 text-left text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-2 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Import JSON Backup</span>
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>

                <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)] border-t border-b border-[var(--border-main)] mt-1">
                  Diagnostics & Maintenance
                </div>

                <button
                  onClick={() => {
                    setShowDiagnostics(!showDiagnostics);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-purple-500" />
                  <span>{showDiagnostics ? 'Hide Storage Metrics' : 'View Storage Metrics'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all dashboard data to initial defaults?')) {
                      store.resetToDefault();
                      alert('Dashboard reset to defaults successfully.');
                    }
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 transition-colors cursor-pointer border-t border-[var(--border-main)] mt-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Profile & System settings saved successfully!
          </span>
          <button onClick={() => setSavedToast(false)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Diagnostics Panel */}
      {showDiagnostics && (
        <Card title="System Storage & Diagnostics Metrics">
          <div className="p-3 bg-[var(--bg-surface-subtle)] rounded-xl border border-[var(--border-main)] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Local Storage Footprint:</span>
              <span className="font-mono font-bold text-[var(--accent-primary)]">
                {(new Blob([JSON.stringify(state)]).size / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Active Store Modules:</span>
              <span className="font-mono text-[var(--text-primary)]">
                {Object.keys(state).length} modules loaded
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Current UI Preferences:</span>
              <span className="font-mono text-[var(--text-primary)]">
                Font: {preferences.fontFamily} | Size: {preferences.fontSize} | Badges: {preferences.labelStyle}
              </span>
            </div>
          </div>
        </Card>
      )}


      {/* SECTION 1: PROFILE PICTURE & AVATAR MANAGER CARD */}
      <Card title="Profile Picture & Avatar Options">
        <div className="flex flex-col sm:flex-row items-center gap-6 p-2">
          {/* Avatar Display with Live Camera Trigger */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-2 border-[var(--accent-primary)] flex items-center justify-center font-bold text-3xl shadow-md overflow-hidden relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Quick Upload Floating Trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-full bg-[var(--accent-primary)] text-white shadow-lg hover:scale-110 transition-transform cursor-pointer"
              title="Upload Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{profile.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{profile.role}</p>
              </div>

              {/* Avatar More Options Dropdown */}
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setIsAvatarMoreOpen(!isAvatarMoreOpen)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                >
                  <span>Avatar Options</span>
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {isAvatarMoreOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-xl z-50 py-2 animate-fadeIn text-xs">
                    {profile.avatarUrl && (
                      <button
                        onClick={() => {
                          setIsPreviewOpen(true);
                          setIsAvatarMoreOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>View Fullsize Avatar</span>
                      </button>
                    )}

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3.5 py-2 text-left text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-emerald-500" />
                      <span>Upload Custom Image</span>
                    </button>

                    {profile.avatarUrl && (
                      <button
                        onClick={handleCopyAvatarDataUri}
                        className="w-full px-3.5 py-2 text-left text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-2"
                      >
                        {copiedDataUri ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-purple-500" />}
                        <span>{copiedDataUri ? 'Copied Data Link' : 'Copy Image Link'}</span>
                      </button>
                    )}

                    {profile.avatarUrl && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="w-full px-3.5 py-2 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 border-t border-[var(--border-main)] mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Avatar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Scalable SVG Preset Avatars Picker */}
            <div className="pt-2 border-t border-[var(--border-main)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Or Select Specialized Tech Preset:
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPresetAvatar(preset.url)}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-[var(--accent-primary)] transition-all transform hover:scale-110"
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 2: TYPOGRAPHY, FONT SIZE & DENSITY OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Font Family Selection */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[var(--accent-primary)]" />
              Font Family & Typography
            </span>
          }
        >
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[var(--text-muted)]">
              Choose your preferred interface typography for optimal legibility.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'inter', name: 'Inter (Default)', sample: 'Clean & Balanced' },
                { id: 'outfit', name: 'Outfit', sample: 'Modern Tech' },
                { id: 'roboto', name: 'Roboto', sample: 'Classic Standard' },
                { id: 'jetbrains', name: 'JetBrains Mono', sample: 'Developer Code' }
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() => updatePreferences({ fontFamily: font.id as FontFamily })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferences.fontFamily === font.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]/30'
                      : 'border-[var(--border-main)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-xs font-bold text-[var(--text-primary)]">{font.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">{font.sample}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Font Size & Scale Control */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--accent-primary)]" />
              Font Size & Scale
            </span>
          }
        >
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[var(--text-muted)]">
              Adjust global font scale for compact density or large high legibility.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'compact', name: 'Compact (13px)', desc: 'High Density' },
                { id: 'normal', name: 'Normal (14px)', desc: 'Standard Default' },
                { id: 'comfortable', name: 'Comfortable (15px)', desc: 'Relaxed Reading' },
                { id: 'large', name: 'Large (16px)', desc: 'Maximum Legibility' }
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => updatePreferences({ fontSize: size.id as FontSize })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferences.fontSize === size.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]/30'
                      : 'border-[var(--border-main)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-xs font-bold text-[var(--text-primary)]">{size.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{size.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 3: LABELS, BADGES & DATE/TIME OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Label & Badge Styling */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--accent-primary)]" />
              Labels & Badge Options
            </span>
          }
        >
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Badge Visual Style
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'pill', label: 'Pill Badges' },
                  { id: 'chip', label: 'Border Chips' },
                  { id: 'dot', label: 'Dot Indicators' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updatePreferences({ labelStyle: style.id as LabelStyle })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      preferences.labelStyle === style.id
                        ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                        : 'bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-main)]">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="font-semibold text-[var(--text-primary)]">Show Priority Badges</span>
                <input
                  type="checkbox"
                  checked={preferences.showPriorityBadges}
                  onChange={(e) => updatePreferences({ showPriorityBadges: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--accent-primary)]"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="font-semibold text-[var(--text-primary)]">Show Category Icons in Lists</span>
                <input
                  type="checkbox"
                  checked={preferences.showCategoryIcons}
                  onChange={(e) => updatePreferences({ showCategoryIcons: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--accent-primary)]"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Date & Time Format Options */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
              Date & Time Display Preferences
            </span>
          }
        >
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Date Formatting
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => updatePreferences({ dateFormat: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-13)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (13/09/2026)</option>
                <option value="MMM DD, YYYY">MMM DD, YYYY (Sep 13, 2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Time Format
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: '12h', label: '12-Hour AM/PM' },
                  { id: '24h', label: '24-Hour Military' }
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => updatePreferences({ timeFormat: tf.id as any })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      preferences.timeFormat === tf.id
                        ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                        : 'bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 4: THEME & COLOR PALETTE CARDS */}
      <Card title="Interface Theme & Color Palette">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
              Appearance Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: '☀️ Light Mode' },
                { id: 'dark', label: '🌙 Dark Mode' },
                { id: 'system', label: '💻 Auto System' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTheme(m.id as any)}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    theme === m.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-xs'
                      : 'border-[var(--border-main)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-main)]">
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
              Accent Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { id: 'blue', label: 'Electric Blue', color: '#2563eb' },
                { id: 'purple', label: 'Cyber Violet', color: '#7c3aed' },
                { id: 'emerald', label: 'Emerald Matrix', color: '#059669' },
                { id: 'rose', label: 'Crimson Rose', color: '#e11d48' },
                { id: 'amber', label: 'Gold Amber', color: '#d97706' },
                { id: 'cyan', label: 'Ocean Cyan', color: '#0891b2' }
              ].map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => setAccent(pal.id as any)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                    accent === pal.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)] shadow-xs'
                      : 'border-[var(--border-main)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: pal.color }} />
                  <span className="truncate">{pal.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 5: PROFILE FORM */}
      <Card title="Student Profile Details">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Role / Specialization Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                College / Institution
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Degree / Program
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-main)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="md" type="submit" icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* FULLSIZE AVATAR PREVIEW MODAL */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Profile Picture Preview" maxWidth="sm">
        <div className="space-y-4 text-center">
          <div className="w-48 h-48 rounded-2xl mx-auto overflow-hidden border-2 border-[var(--accent-primary)] shadow-xl">
            {profile.avatarUrl && <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{profile.name} • {profile.role}</p>
          <div className="flex justify-center pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
