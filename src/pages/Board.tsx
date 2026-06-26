import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import queryKeys from '../api/queryKeys';
import { getMessageFromError } from '../utils';
import { useGetMembers } from '../api/useMembersApi';
import {
  useGetProjects,
  useGetTasks,
  useCreateProject,
  useDeleteProject,
  useArchiveProject,
  useCreateTask,
  useMoveTask,
} from '../api/useBoardApi';
import { FolderKanban } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';
import { CreateProjectModal } from '../components/board/CreateProjectModal';
import { CreateTaskModal } from '../components/board/CreateTaskModal';
import { BoardColumn } from '../components/board/BoardColumn';
import { BoardHeader } from '../components/board/BoardHeader';

import type { Project, Task } from '../types/board';

const Board: React.FC = () => {
  const { activeWorkspace, activeRole } = useAuth();
  const { registerListener } = useSocket();
  const queryClient = useQueryClient();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filtering State
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterDue, setFilterDue] = useState<string>('');

  // Modals & Panels Toggles
  const [showCreateProject, setShowCreateProject] = useState<boolean>(false);
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(
    null
  );
  const [projectSettingsOpen, setProjectSettingsOpen] =
    useState<boolean>(false);

  const isPrivileged = activeRole === 'ADMIN' || activeRole === 'MANAGER';
  const isAdmin = activeRole === 'ADMIN';

  // React Query Hooks
  const { data: projects = [] } = useGetProjects(activeWorkspace?.id);
  const { data: members = [] } = useGetMembers(activeWorkspace?.id);

  const taskFilters = useMemo(
    () => ({
      assigneeId: filterAssignee || undefined,
      priority: filterPriority || undefined,
      dueFilter: filterDue || undefined,
    }),
    [filterAssignee, filterPriority, filterDue]
  );

  const { data: rawTasks = [] } = useGetTasks(
    activeWorkspace?.id,
    selectedProject?.id,
    taskFilters
  );

  const tasks = useMemo(() => {
    return [...rawTasks].sort((a, b) => a.order - b.order);
  }, [rawTasks]);

  const createProjectMutation = useCreateProject(activeWorkspace?.id);
  const deleteProjectMutation = useDeleteProject(activeWorkspace?.id);
  const archiveProjectMutation = useArchiveProject(activeWorkspace?.id);
  const createTaskMutation = useCreateTask(
    activeWorkspace?.id,
    selectedProject?.id
  );
  const moveTaskMutation = useMoveTask(activeWorkspace?.id);

  // Sync selected project with list
  useEffect(() => {
    if (projects.length > 0) {
      const storedProjectId = localStorage.getItem(
        `krumos_${activeWorkspace?.id}_project`
      );
      const matched = projects.find((p: Project) => p.id === storedProjectId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProject(matched || projects[0]);
    } else {
      setSelectedProject(null);
    }
  }, [projects, activeWorkspace?.id]);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem(
        `krumos_${activeWorkspace?.id}_project`,
        selectedProject.id
      );
    }
  }, [selectedProject, activeWorkspace?.id]);

  // Real-time synchronization
  useEffect(() => {
    if (!activeWorkspace) return;
    const unbind = registerListener('task_updated', () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASKS, activeWorkspace.id],
      });
    });
    return () => unbind();
  }, [activeWorkspace, queryClient, registerListener]);

  const handleCreateProjectSubmit = async (
    name: string,
    description: string
  ) => {
    setShowCreateProject(false);
    createProjectMutation.mutate(
      { name, description },
      {
        onSuccess: (newProj) => {
          setSelectedProject(newProj);
        },
        onError: (err) => {
          console.error('Failed to create project', err);
          alert('Failed to create project. Please try again.');
        },
      }
    );
  };

  const handleCreateTaskSubmit = async (data: {
    title: string;
    description: string;
    priority: Task['priority'];
    assigneeId?: string;
    dueDate?: string;
  }) => {
    if (!selectedProject) return;

    setShowCreateTask(false);
    createTaskMutation.mutate(data, {
      onError: (err) => {
        console.error('Failed to create task', err);
        alert('Failed to create task. Please try again.');
      },
    });
  };

  // Native Drag and Drop Implementation
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetStatus: Task['status']
  ) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const columnTasks = tasks.filter((t) => t.status === targetStatus);
    const targetOrder = columnTasks.length + 1;

    moveTaskMutation.mutate(
      { taskId, status: targetStatus, order: targetOrder },
      {
        onError: (err) => {
          console.error('Failed to move task', err);
        },
      }
    );
  };

  // Project archiving/deleting commands
  const handleArchiveProject = async () => {
    if (!selectedProject) return;
    const isArchived = selectedProject.status === 'ARCHIVED';
    const endpoint = isArchived ? 'activate' : 'archive';
    if (
      !window.confirm(
        `Are you sure you want to ${isArchived ? 'reactivate' : 'archive'} this project?`
      )
    )
      return;

    archiveProjectMutation.mutate(
      { projectId: selectedProject.id, endpoint },
      {
        onError: (err) => {
          console.error('Project status modification failed', err);
        },
      }
    );
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    const confirmName = window.prompt(
      `CAUTION: To permanently delete project "${selectedProject.name}" and all its tasks/comments, type the project name below:`
    );
    if (confirmName === null) return;
    if (
      confirmName.trim().toLowerCase() !== selectedProject.name.toLowerCase()
    ) {
      alert('Confirmation name mismatch. Action cancelled.');
      return;
    }

    deleteProjectMutation.mutate(
      { projectId: selectedProject.id, confirmName: confirmName.trim() },
      {
        onSuccess: () => {
          setSelectedProject(null);
        },
        onError: (err: unknown) => {
          alert(getMessageFromError(err));
        },
      }
    );
  };

  const columns: { status: Task['status']; title: string; color: string }[] = [
    { status: 'TO_DO', title: 'TO DO', color: 'bg-ink/5 text-ink/75' },
    {
      status: 'IN_PROGRESS',
      title: 'IN PROGRESS',
      color: 'bg-orange-accent/5 text-orange-accent',
    },
    {
      status: 'IN_REVIEW',
      title: 'IN REVIEW',
      color: 'bg-orange-hot/5 text-orange-hot',
    },
    {
      status: 'DONE',
      title: 'DONE',
      color: 'bg-success-green/5 text-success-green',
    },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full min-w-0">
      {/* Header and Project selection block */}
      <BoardHeader
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        isPrivileged={isPrivileged}
        isAdmin={isAdmin}
        activeRole={activeRole}
        members={members}
        onCreateProjectClick={() => setShowCreateProject(true)}
        onCreateTaskClick={() => setShowCreateTask(true)}
        projectSettingsOpen={projectSettingsOpen}
        setProjectSettingsOpen={setProjectSettingsOpen}
        onArchiveProject={handleArchiveProject}
        onDeleteProject={handleDeleteProject}
        filterAssignee={filterAssignee}
        setFilterAssignee={setFilterAssignee}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterDue={filterDue}
        setFilterDue={setFilterDue}
      />

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto min-h-0 relative z-0">
        {!selectedProject ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-ink/20 bg-bone-dark/50">
            <FolderKanban size={32} className="text-ink/30" />
            <div className="space-y-1">
              <h3 className="font-bold text-xs uppercase text-ink">
                NO SELECTED PROJECT
              </h3>
              <p className="text-[10px] text-ink/50 font-mono">
                Create a new project or select an existing one to visualize
                tasks.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full items-start pb-6">
            {columns.map((col) => (
              <BoardColumn
                key={col.status}
                title={col.title}
                status={col.status}
                color={col.color}
                tasks={tasks.filter((t) => t.status === col.status)}
                isProjectArchived={selectedProject.status === 'ARCHIVED'}
                draggedOverColumn={draggedOverColumn}
                onDragOver={handleDragOver}
                onDragLeave={() => setDraggedOverColumn(null)}
                onDrop={handleDrop}
                onTaskDragStart={handleDragStart}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Details Modal overlay */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask.id}
          onClose={() => {
            setSelectedTask(null);
            queryClient.invalidateQueries({
              queryKey: [
                queryKeys.GET_TASKS,
                activeWorkspace?.id,
                selectedProject?.id,
              ],
            });
          }}
        />
      )}

      {/* Modal Dialog for Project Creation */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSubmit={handleCreateProjectSubmit}
      />

      {/* Modal Dialog for Task Creation */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={handleCreateTaskSubmit}
        members={members}
      />
    </div>
  );
};

export default Board;
