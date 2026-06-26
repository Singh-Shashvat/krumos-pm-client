import React from 'react';
import {
  ChevronDown,
  Plus,
  Settings,
  Archive,
  Trash2,
  Filter,
} from 'lucide-react';

import type { Project } from '../../types/board';
import type { Member } from '../../types/members';

interface BoardHeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
  isPrivileged: boolean;
  isAdmin: boolean;
  activeRole: string | null;
  members: Member[];

  // Create triggers
  onCreateProjectClick: () => void;
  onCreateTaskClick: () => void;

  // Project settings
  projectSettingsOpen: boolean;
  setProjectSettingsOpen: (open: boolean) => void;
  onArchiveProject: () => void;
  onDeleteProject: () => void;

  // Filters
  filterAssignee: string;
  setFilterAssignee: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  filterDue: string;
  setFilterDue: (val: string) => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  projects,
  selectedProject,
  setSelectedProject,
  isPrivileged,
  isAdmin,
  activeRole,
  members,
  onCreateProjectClick,
  onCreateTaskClick,
  projectSettingsOpen,
  setProjectSettingsOpen,
  onArchiveProject,
  onDeleteProject,
  filterAssignee,
  setFilterAssignee,
  filterPriority,
  setFilterPriority,
  filterDue,
  setFilterDue,
}) => {
  return (
    <>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-bone-dark krumos-border p-4 relative z-10 shrink-0">
        {/* Left: Project Picker */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative">
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const matched = projects.find((p) => p.id === e.target.value);
                if (matched) setSelectedProject(matched);
              }}
              className="bg-bone border border-ink/25 px-4 py-2.5 text-xs font-mono font-bold text-ink uppercase focus:outline-none focus:border-orange-accent appearance-none pr-8 cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value="">NO ACTIVE PROJECTS</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.status === 'ARCHIVED' ? '[ARCHIVED]' : ''}
                  </option>
                ))
              )}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-3.5 pointer-events-none text-ink/65"
            />
          </div>

          {isPrivileged && (
            <button
              onClick={onCreateProjectClick}
              className="bg-ink hover:bg-ink-soft text-bone p-2.5 border border-transparent shadow hover:shadow-md transition-all active:scale-95 shrink-0"
              title="Create new project"
            >
              <Plus size={16} />
            </button>
          )}

          {selectedProject && isPrivileged && (
            <div className="relative">
              <button
                onClick={() => setProjectSettingsOpen(!projectSettingsOpen)}
                className="bg-bone border border-ink/20 hover:bg-bone-dark p-2.5 transition-all text-ink focus:outline-none"
              >
                <Settings size={14} />
              </button>
              {projectSettingsOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-bone border border-ink shadow-2xl py-1 z-30 font-mono text-[9px] uppercase">
                  <div className="px-3 py-1.5 border-b border-ink/10 text-ink/40 font-bold">
                    PROJECT CONTROLS
                  </div>
                  <button
                    onClick={() => {
                      onArchiveProject();
                      setProjectSettingsOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-bone-dark text-ink font-bold"
                  >
                    <Archive size={12} />
                    <span>
                      {selectedProject.status === 'ARCHIVED'
                        ? 'ACTIVATE'
                        : 'ARCHIVE'}
                    </span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onDeleteProject();
                        setProjectSettingsOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-orange-deep/10 text-orange-hot font-bold border-t border-ink/5"
                    >
                      <Trash2 size={12} />
                      <span>DELETE PROJECT</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedProject &&
            selectedProject.status === 'ACTIVE' &&
            isPrivileged && (
              <button
                onClick={onCreateTaskClick}
                className="bg-ink hover:bg-ink-soft text-bone px-4 py-2.5 border border-transparent shadow hover:shadow-md transition-all active:scale-95 shrink-0 flex items-center space-x-1.5 font-mono text-[10px] font-bold tracking-wider"
                title="Create new task"
              >
                <Plus size={12} />
                <span>NEW TASK</span>
              </button>
            )}
        </div>

        {/* Right: Quick Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-bone px-3 py-1.5 border border-ink/10">
            <Filter size={12} className="text-ink/45" />
            <span className="font-mono text-[9px] text-ink/50 uppercase">
              FILTERS:
            </span>
          </div>

          {/* Assignee filter - Hidden for MEMBERs as the backend restricts them to their own tasks anyway */}
          {activeRole !== 'MEMBER' && (
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-bone border border-ink/15 px-3 py-2 text-[10px] font-mono text-ink/75 focus:outline-none"
            >
              <option value="">ALL ASSIGNEES</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name.toUpperCase()}
                </option>
              ))}
            </select>
          )}

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-bone border border-ink/15 px-3 py-2 text-[10px] font-mono text-ink/75 focus:outline-none"
          >
            <option value="">ALL PRIORITIES</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>

          {/* Due filter */}
          <select
            value={filterDue}
            onChange={(e) => setFilterDue(e.target.value)}
            className="bg-bone border border-ink/15 px-3 py-2 text-[10px] font-mono text-ink/75 focus:outline-none"
          >
            <option value="">ALL DATES</option>
            <option value="overdue">OVERDUE</option>
            <option value="due_soon">DUE SOON (48H)</option>
            <option value="no_date">NO DUE DATE</option>
          </select>

          {/* Clear filters button */}
          {(filterAssignee || filterPriority || filterDue) && (
            <button
              onClick={() => {
                setFilterAssignee('');
                setFilterPriority('');
                setFilterDue('');
              }}
              className="bg-orange-deep/10 hover:bg-orange-deep/20 text-orange-hot border border-orange-accent/30 hover:border-orange-accent/50 px-3 py-2 text-[10px] font-mono font-bold tracking-wider transition-colors cursor-pointer"
            >
              CLEAR FILTERS
            </button>
          )}
        </div>
      </div>

      {/* Project Description Block */}
      {selectedProject && (
        <div className="bg-bone-dark krumos-border px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div>
            <h2 className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
              {selectedProject.name} DESCRIPTION
            </h2>
            <p className="text-xs text-ink-text/80 mt-1 max-w-2xl leading-relaxed">
              {selectedProject.description ||
                'No project description supplied.'}
            </p>
          </div>
          {selectedProject.status === 'ARCHIVED' && (
            <span className="font-mono text-[9px] bg-orange-deep/20 text-orange-hot border border-orange-accent/50 px-3 py-1 font-bold tracking-widest uppercase">
              ARCHIVED PROJECT
            </span>
          )}
        </div>
      )}
    </>
  );
};
