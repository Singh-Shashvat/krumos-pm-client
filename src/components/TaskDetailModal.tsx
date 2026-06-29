import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useGetMembers } from '../api/useMembersApi';
import {
  useGetTaskDetail,
  useGetComments,
  useGetTaskLogs,
  useUpdateTaskField,
  useAddComment,
  useEditComment,
  useDeleteComment,
} from '../api/useTaskDetailApi';
import { getMessageFromError } from '../utils';
import { X, MessageSquare, History, Edit2 } from 'lucide-react';
import { ConfirmDialog } from './common/ConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';
import queryKeys from '../api/queryKeys';
import type { Task } from '../types/board';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
}) => {
  const { user: currentUser } = useAuth();
  const { activeWorkspace, activeRole } = useWorkspace();
  const { registerListener } = useSocket();
  const toast = useToast();
  const queryClient = useQueryClient();

  const modalRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: task, isLoading: isTaskLoading } = useGetTaskDetail(
    activeWorkspace?.id,
    taskId
  );
  const { data: members = [] } = useGetMembers(activeWorkspace?.id);
  const { data: comments = [] } = useGetComments(activeWorkspace?.id, taskId);
  const { data: logs = [] } = useGetTaskLogs(activeWorkspace?.id, taskId);

  // Mutations
  const updateFieldMutation = useUpdateTaskField(activeWorkspace?.id, taskId);
  const addCommentMutation = useAddComment(activeWorkspace?.id, taskId);
  const editCommentMutation = useEditComment(activeWorkspace?.id, taskId);
  const deleteCommentMutation = useDeleteComment(activeWorkspace?.id, taskId);

  // Local editing states
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>('');

  const [isEditingDesc, setIsEditingDesc] = useState<boolean>(false);
  const [tempDesc, setTempDesc] = useState<string>('');
  const [tempStatus, setTempStatus] = useState<
    'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | ''
  >('');

  // Comment Creation/Edition State
  const [newComment, setNewComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>('');

  // Deletion confirmation state
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<
    string | null
  >(null);

  const isAdminOrManager = activeRole === 'ADMIN' || activeRole === 'MANAGER';
  const canEditAllFields = activeRole === 'ADMIN' || activeRole === 'MANAGER';

  // Synchronize initial local edit states with queries
  useEffect(() => {
    if (task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempTitle(task.title);
      setTempDesc(task.description || '');
      setTempStatus(task.status);
    }
  }, [task]);

  // Real-time synchronization via socket invalidations
  useEffect(() => {
    if (!activeWorkspace) return;
    const unbind = registerListener('task_updated', (data: unknown) => {
      const updateData = data as { id?: string } | null;
      if (updateData?.id === taskId) {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.GET_TASK_DETAIL, activeWorkspace.id, taskId],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.GET_TASK_LOGS, activeWorkspace.id, taskId],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.GET_TASKS, activeWorkspace.id],
        });
      }
    });
    return () => unbind();
  }, [activeWorkspace, taskId, queryClient, registerListener]);

  // Accessibility keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDeleteCommentId) return; // Prioritize confirm dialog Escape close
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, confirmDeleteCommentId]);

  // Trap focus within the modal dialog
  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  const handleUpdateField = (fields: Partial<Task>) => {
    updateFieldMutation.mutate(fields, {
      onError: (err: unknown) => {
        toast.error(getMessageFromError(err));
      },
    });
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== task?.title) {
      handleUpdateField({ title: tempTitle.trim() });
    } else {
      setTempTitle(task?.title || '');
    }
  };

  const handleDescBlur = () => {
    setIsEditingDesc(false);
    if (tempDesc !== task?.description) {
      handleUpdateField({ description: tempDesc });
    }
  };

  // Comments CRUD Handlers
  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeWorkspace) return;
    addCommentMutation.mutate(
      { text: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment('');
          toast.success('Comment added successfully');
        },
        onError: (err: unknown) => {
          toast.error(getMessageFromError(err));
        },
      }
    );
  };

  const handleStartEditComment = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(text);
  };

  const handleSaveEditComment = (commentId: string) => {
    if (!editingCommentText.trim() || !activeWorkspace) return;
    editCommentMutation.mutate(
      { commentId, text: editingCommentText.trim() },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          toast.success('Comment updated successfully');
        },
        onError: (err: unknown) => {
          toast.error(getMessageFromError(err));
        },
      }
    );
  };

  const handleDeleteCommentConfirm = () => {
    if (!confirmDeleteCommentId) return;
    deleteCommentMutation.mutate(confirmDeleteCommentId, {
      onSuccess: () => {
        setConfirmDeleteCommentId(null);
        toast.success('Comment deleted successfully');
      },
      onError: (err: unknown) => {
        toast.error(getMessageFromError(err));
      },
    });
  };

  if (isTaskLoading || !task) {
    return (
      <div className="fixed inset-0 krumos-overlay flex items-center justify-center z-50 p-4">
        <div className="bg-bone border border-ink text-ink max-w-sm w-full p-6 text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ink mx-auto"></div>
          <p className="krumos-eyebrow text-xs">Fetching task card data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 krumos-overlay flex items-center justify-center z-50 p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-portal-title"
    >
      <div className="bg-bone border border-ink text-ink max-w-4xl w-full h-[90vh] flex flex-col relative shadow-2xl">
        {/* Close Button Anchor */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-ink/65 hover:text-ink hover:bg-ink/5 p-1 rounded-none border border-transparent hover:border-ink/10 transition-all cursor-pointer"
          aria-label="Close task portal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <header className="p-6 krumos-border-b bg-bone-dark shrink-0 flex items-center justify-between">
          <div className="space-y-1">
            <span className="krumos-eyebrow text-[9px] text-orange-accent block">
              TASK INTERACTION PORTAL
            </span>
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                className="text-lg font-bold text-ink uppercase bg-bone border border-ink/20 px-2 py-0.5 focus:outline-none w-[320px] sm:w-[500px]"
                autoFocus
              />
            ) : (
              <h2
                id="task-portal-title"
                onClick={() => canEditAllFields && setIsEditingTitle(true)}
                className={`text-lg font-bold text-ink uppercase tracking-wide flex items-center space-x-2 ${
                  canEditAllFields ? 'cursor-pointer hover:underline' : ''
                }`}
              >
                <span>{task.title}</span>
                {canEditAllFields && (
                  <Edit2 size={12} className="text-ink/30" />
                )}
              </h2>
            )}
          </div>
        </header>

        {/* Split View Workspace Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Panel: Description and Comments */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 md:krumos-border-r border-ink/15">
            {/* Description Area */}
            <div className="space-y-3">
              <span className="krumos-eyebrow text-[9px] text-ink/40 tracking-wider block">
                TASK DESCRIPTION
              </span>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={tempDesc}
                    onChange={(e) => setTempDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-bone border border-ink/25 p-3 text-xs text-ink focus:outline-none resize-none font-sans"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsEditingDesc(false);
                        setTempDesc(task.description || '');
                      }}
                      className="px-3 py-1.5 bg-bone-dark border border-ink/15 text-[9px] krumos-mono-btn text-ink"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleDescBlur}
                      className="px-3 py-1.5 bg-ink text-bone text-[9px] krumos-mono-btn hover:bg-ink-soft"
                    >
                      SAVE CHANGES
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => canEditAllFields && setIsEditingDesc(true)}
                  className={`bg-bone-dark/50 border border-dashed border-ink/15 p-4 min-h-[80px] transition-all ${
                    canEditAllFields
                      ? 'hover:bg-bone-dark hover:border-ink/30 cursor-pointer'
                      : ''
                  }`}
                >
                  <p className="text-xs text-ink-text leading-relaxed whitespace-pre-wrap">
                    {task.description ||
                      (canEditAllFields
                        ? 'No description supplied. Click here to edit details.'
                        : 'No description supplied.')}
                  </p>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-ink/10 pb-2">
                <MessageSquare size={14} className="text-orange-accent" />
                <span className="krumos-eyebrow text-[9px] text-ink/60">
                  DISCUSSION ({comments.length})
                </span>
              </div>

              {/* Add comment form */}
              <form
                onSubmit={handleAddCommentSubmit}
                className="flex space-x-3"
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or leave updates..."
                  className="flex-1 bg-bone border border-ink/20 px-3 py-2 text-xs focus:outline-none focus:border-orange-accent"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-ink text-bone hover:bg-ink-soft px-4 py-2 text-[10px] krumos-mono-btn disabled:opacity-50"
                >
                  COMMENT
                </button>
              </form>

              {/* Comments Feed List */}
              <div className="space-y-4 pt-2">
                {comments.length === 0 ? (
                  <p className="text-[10px] font-mono text-ink/40 italic text-center py-4">
                    No comments posted yet.
                  </p>
                ) : (
                  comments.map((c) => {
                    const isAuthor = c.authorId === currentUser?.id;
                    const canDelete = isAuthor || isAdminOrManager;

                    return (
                      <div
                        key={c.id}
                        className="p-3 bg-bone-dark/50 border border-ink/5 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 min-w-0">
                            {/* Local default avatar fallback instead of external service */}
                            <div className="w-5 h-5 bg-ink text-bone border border-ink/10 flex items-center justify-center font-mono text-[9px] font-bold">
                              {c.author?.picture ? (
                                <img
                                  src={c.author.picture}
                                  alt={c.author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                c.author?.name.substring(0, 1).toUpperCase()
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-ink uppercase truncate">
                              {c.author?.name}
                            </span>
                            <span className="text-[8px] font-mono text-ink/45">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Comment Options */}
                          <div className="flex space-x-2 shrink-0">
                            {isAuthor && editingCommentId !== c.id && (
                              <button
                                onClick={() =>
                                  handleStartEditComment(c.id, c.text)
                                }
                                className="text-[9px] font-mono text-ink/50 hover:text-ink uppercase"
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setConfirmDeleteCommentId(c.id)}
                                className="text-[9px] font-mono text-orange-accent hover:text-orange-hot uppercase"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {editingCommentId === c.id ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                              className="flex-1 bg-bone border border-ink/20 px-2 py-1 text-xs"
                            />
                            <button
                              onClick={() => handleSaveEditComment(c.id)}
                              className="bg-ink text-bone px-2 py-1 text-[9px] krumos-mono-btn"
                            >
                              SAVE
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="bg-bone-dark border border-ink/15 text-[9px] krumos-mono-btn text-ink"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-ink-text leading-relaxed font-sans">
                            {c.text}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Metadata and Audit Log Timeline */}
          <div className="w-full md:w-[320px] bg-bone-dark p-6 space-y-8 overflow-y-auto shrink-0">
            {/* Metadata Fields Panel */}
            <div className="space-y-4">
              <span className="krumos-eyebrow text-[9px] text-ink/40 tracking-wider block">
                METADATA PROFILES
              </span>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="krumos-eyebrow text-[8px] text-ink/65 block">
                  STATUS
                </label>
                <select
                  value={tempStatus}
                  onChange={(e) =>
                    setTempStatus(e.target.value as Task['status'])
                  }
                  className="w-full bg-bone border border-ink/20 px-2.5 py-1.5 text-[10px] font-mono font-bold text-ink focus:outline-none"
                >
                  <option value="TO_DO">TO DO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
                {tempStatus !== task.status && (
                  <div className="flex space-x-2 pt-1.5">
                    <button
                      onClick={() => setTempStatus(task.status)}
                      className="flex-1 px-3 py-1 bg-bone border border-ink/15 text-[9px] font-mono krumos-mono-btn text-ink text-center"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateField({
                          status: tempStatus as Task['status'],
                        })
                      }
                      className="flex-1 px-3 py-1 bg-ink text-bone text-[9px] font-mono krumos-mono-btn hover:bg-ink-soft text-center"
                    >
                      SAVE
                    </button>
                  </div>
                )}
              </div>

              {/* Priority Selector */}
              <div className="space-y-1">
                <label className="krumos-eyebrow text-[8px] text-ink/65 block">
                  PRIORITY
                </label>
                <select
                  value={task.priority}
                  disabled={!canEditAllFields}
                  onChange={(e) =>
                    handleUpdateField({
                      priority: e.target.value as Task['priority'],
                    })
                  }
                  className="w-full bg-bone border border-ink/20 px-2.5 py-1.5 text-[10px] font-mono font-bold text-ink focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              {/* Assignee Selector */}
              <div className="space-y-1">
                <label className="krumos-eyebrow text-[8px] text-ink/65 block">
                  ASSIGNEE
                </label>
                <div className="relative">
                  <select
                    value={task.assigneeId || ''}
                    disabled={!canEditAllFields}
                    onChange={(e) =>
                      handleUpdateField({ assigneeId: e.target.value || null })
                    }
                    className="w-full bg-bone border border-ink/20 px-2.5 py-1.5 text-[10px] font-mono font-bold text-ink focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">UNASSIGNED</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date Input */}
              <div className="space-y-1">
                <label className="krumos-eyebrow text-[8px] text-ink/65 block">
                  DUE DATE
                </label>
                <input
                  type="date"
                  value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                  disabled={!canEditAllFields}
                  onChange={(e) =>
                    handleUpdateField({ dueDate: e.target.value || null })
                  }
                  className="w-full bg-bone border border-ink/20 px-2.5 py-1.5 text-[10px] font-mono text-ink focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Audit Logs Timeline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-ink/10 pb-2">
                <History size={14} className="text-orange-accent" />
                <span className="krumos-eyebrow text-[9px] text-ink/60">
                  AUDIT LOGS ({logs.length})
                </span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <p className="text-[9px] font-mono text-ink/40 italic">
                    No activity logs recorded.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="text-[10px] leading-relaxed border-b border-ink/5 pb-2"
                    >
                      <p className="text-ink-text/90">
                        <span className="font-bold text-ink uppercase">
                          {log.performer?.name || 'System'}
                        </span>{' '}
                        {log.description}
                      </p>
                      <span className="block text-[8px] text-ink/45 font-mono mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString()}{' '}
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Deletion of Comment */}
      <ConfirmDialog
        isOpen={confirmDeleteCommentId !== null}
        title="DELETE COMMENT"
        message="Are you sure you want to delete this comment permanently? This action is absolute and cannot be undone."
        onConfirm={handleDeleteCommentConfirm}
        onCancel={() => setConfirmDeleteCommentId(null)}
      />
    </div>
  );
};

export default TaskDetailModal;
