import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { X, MessageSquare, History, Edit2 } from 'lucide-react';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    picture: string;
  };
}

interface TaskDetails {
  id: string;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  assigneeId: string | null;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    picture: string;
  };
}

interface ActivityLog {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
  performer: {
    id: string;
    name: string;
  } | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
}) => {
  const { activeWorkspace, activeRole, user: currentUser } = useAuth();
  const { registerListener } = useSocket();

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Editing Fields
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

  const [loading, setLoading] = useState<boolean>(true);

  const isAdminOrManager = activeRole === 'ADMIN' || activeRole === 'MANAGER';
  const canEditAllFields = activeRole === 'ADMIN' || activeRole === 'MANAGER';

  const fetchTaskDetails = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await api.get(
        `/workspaces/${activeWorkspace.id}/tasks/${taskId}`
      );
      setTask(res.data);
      setTempTitle(res.data.title);
      setTempDesc(res.data.description || '');
      setTempStatus(res.data.status);
    } catch (err) {
      console.error('Failed to fetch task details', err);
      onClose();
    }
  };

  const fetchMembers = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await api.get(`/workspaces/${activeWorkspace.id}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch members list', err);
    }
  };

  const fetchComments = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await api.get(
        `/workspaces/${activeWorkspace.id}/tasks/${taskId}/comments`
      );
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  const fetchLogs = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await api.get(
        `/workspaces/${activeWorkspace.id}/tasks/${taskId}/logs`
      );
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTaskDetails(),
      fetchMembers(),
      fetchComments(),
      fetchLogs(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [taskId, activeWorkspace]);

  // Real-time synchronization
  useEffect(() => {
    if (!activeWorkspace) return;
    const unbind = registerListener('task_updated', (data) => {
      if (data?.id === taskId) {
        fetchTaskDetails();
        fetchLogs();
      }
    });
    return () => unbind();
  }, [activeWorkspace, taskId]);

  const handleUpdateField = async (fields: Partial<TaskDetails>) => {
    if (!activeWorkspace || !task) return;
    try {
      // Optimistic updates
      setTask((prev) => (prev ? { ...prev, ...fields } : null));

      await api.patch(
        `/workspaces/${activeWorkspace.id}/tasks/${taskId}`,
        fields
      );
      fetchLogs();
    } catch (err) {
      console.error('Failed to update task field', err);
      fetchTaskDetails(); // Revert
    }
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
  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeWorkspace) return;
    try {
      await api.post(
        `/workspaces/${activeWorkspace.id}/tasks/${taskId}/comments`,
        {
          text: newComment.trim(),
        }
      );
      setNewComment('');
      fetchComments();
      fetchLogs();
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleStartEditComment = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(text);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editingCommentText.trim() || !activeWorkspace) return;
    try {
      await api.patch(
        `/workspaces/${activeWorkspace.id}/comments/${commentId}`,
        {
          text: editingCommentText.trim(),
        }
      );
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      console.error('Failed to edit comment', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeWorkspace || !window.confirm('Delete this comment permanently?'))
      return;
    try {
      await api.delete(
        `/workspaces/${activeWorkspace.id}/comments/${commentId}`
      );
      fetchComments();
      fetchLogs();
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  if (loading || !task) {
    return (
      <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-bone border border-ink text-ink max-w-sm w-full p-6 text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ink mx-auto"></div>
          <p className="krumos-eyebrow text-xs">Fetching task card data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-bone border border-ink text-ink max-w-4xl w-full h-[90vh] flex flex-col relative shadow-2xl">
        {/* Close Button Anchor */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-ink/65 hover:text-ink hover:bg-ink/5 p-1 rounded-none border border-transparent hover:border-ink/10 transition-all cursor-pointer"
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
                            <img
                              src={
                                c.author?.picture ||
                                'https://via.placeholder.com/150'
                              }
                              alt={c.author?.name}
                              className="w-5 h-5 rounded-none border border-ink/10"
                            />
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
                                onClick={() => handleDeleteComment(c.id)}
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
                  onChange={(e) => setTempStatus(e.target.value as any)}
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
                        handleUpdateField({ status: tempStatus as any })
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
                    handleUpdateField({ priority: e.target.value as any })
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
    </div>
  );
};

export default TaskDetailModal;
