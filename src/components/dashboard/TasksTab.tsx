"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TaskWithAssignee, GalaMember, User } from "@/types/database";
import AlertDialog from "@/components/AlertDialog";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  galaId: string;
  userId: string;
  tasks: TaskWithAssignee[];
  members: (GalaMember & { user: User })[];
  onRefresh: () => void;
}

const STATUS_META = {
  todo: { label: "TO DO", color: "bg-slate-100 text-slate-600 border-slate-300", dot: "bg-slate-400", icon: "radio_button_unchecked" },
  doing: { label: "IN PROGRESS", color: "bg-yellow-100 text-yellow-700 border-yellow-400", dot: "bg-yellow-400", icon: "pending" },
  done: { label: "DONE", color: "bg-green-100 text-green-700 border-green-400", dot: "bg-green-500", icon: "check_circle" },
  cancelled: { label: "CANCELLED", color: "bg-red-100 text-red-700 border-red-400", dot: "bg-red-500", icon: "cancel" },
} as const;

type Status = keyof typeof STATUS_META;

function SortableTask({ task, status }: { task: TaskWithAssignee; status: Status }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card p-4 rounded-xl border-3 border-slate-900 dark:border-white/20 shadow-playful-sm hover:shadow-[6px_6px_0px_0px_rgba(255,88,51,1)] transition-all group cursor-grab active:cursor-grabbing touch-none"
    >
      <p className={`font-extrabold mb-3 group-hover:text-[#ff5833] transition-colors ${task.status === "done" ? "line-through text-slate-400" : task.status === "cancelled" ? "line-through text-red-300" : ""}`}>
        {task.title}
      </p>
      {task.assignee_name && (
        <div className="flex items-center gap-2 mb-1">
          <div className="size-6 rounded-full bg-[#ff5833] flex items-center justify-center overflow-hidden">
            {task.assignee_avatar ? (
              <img src={task.assignee_avatar} alt={task.assignee_name} className="size-full object-cover" />
            ) : (
              <span className="text-white text-xs font-black">
                {task.assignee_name.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500">{task.assignee_name}</span>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: TaskWithAssignee }) {
  return (
    <div className="bg-card p-4 rounded-xl border-3 border-slate-900 dark:border-white/20 shadow-playful-sm cursor-grabbing">
      <p className={`font-extrabold mb-3 ${task.status === "done" ? "line-through text-slate-400" : task.status === "cancelled" ? "line-through text-red-300" : ""}`}>
        {task.title}
      </p>
      {task.assignee_name && (
        <div className="flex items-center gap-2 mb-1">
          <div className="size-6 rounded-full bg-[#ff5833] flex items-center justify-center">
            <span className="text-white text-xs font-black">
              {task.assignee_name.charAt(0)}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">{task.assignee_name}</span>
        </div>
      )}
    </div>
  );
}

function DroppableColumn({ status, children }: { status: Status; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[200px] rounded-xl p-2 transition-colors ${isOver ? "bg-[#ff5833]/5" : ""}`}
    >
      {children}
    </div>
  );
}

export default function TasksTab({ galaId, userId, tasks, members, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean; title: string; message: string; type: "error"|"success"|"warning"|"info"}>({isOpen: false, title: "", message: "", type: "error"});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const grouped: Record<Status, TaskWithAssignee[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    doing: tasks.filter((t) => t.status === "doing"),
    done: tasks.filter((t) => t.status === "done"),
    cancelled: tasks.filter((t) => t.status === "cancelled"),
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("tasks").insert({
      gala_id: galaId,
      title: newTitle.trim(),
      assigned_to: assignTo || null,
      status: "todo",
    });
    
    if (error) {
      console.error("Failed to create task:", error);
      setAlertDialog({isOpen: true, title: "Task Creation Failed", message: "Failed to create task. Please try again.", type: "error"});
      setSubmitting(false);
      return;
    }
    
    setNewTitle("");
    setAssignTo("");
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const updateStatus = async (id: string, status: Status) => {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    
    if (error) {
      console.error("Failed to update task:", error);
      setAlertDialog({isOpen: true, title: "Task Update Failed", message: "Failed to update task. Please try again.", type: "error"});
      return;
    }
    
    onRefresh();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback is handled by DroppableColumn's isOver
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    // Determine target column: if dropped on a column directly, use that; else use the task's column
    let targetStatus: Status | undefined;
    
    if (["todo", "doing", "done", "cancelled"].includes(over.id as string)) {
      targetStatus = over.id as Status;
    } else {
      // Dropped onto another task — find which column it's in
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status as Status;
    }

    if (!targetStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      updateStatus(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black leading-none">Task Board</h2>
          <p className="text-slate-500 font-medium mt-1">
            Drag tasks between columns to update their status.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#ff5833] text-white font-black px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          NEW TASK
        </button>
      </div>

      {/* Add Task modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-xl bold-border shadow-playful w-full max-w-md p-6">
            <h3 className="text-2xl font-black mb-4">New Task</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Task Title *
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Book the venue"
                  className="w-full h-12 px-4 border-3 border-slate-900 dark:border-white/20 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Assign To (optional)
                </label>
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full h-12 px-4 border-3 border-slate-900 dark:border-white/20 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-background text-foreground"
                >
                  <option value="">Unassigned</option>
                  {members.map(({ user }) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-[#ff5833] text-white font-black rounded-lg border-2 border-slate-900 btn-push disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-12 px-6 bg-white font-black rounded-lg border-2 border-slate-900 btn-push"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban columns with drag and drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(["todo", "doing", "done", "cancelled"] as Status[]).map((status) => (
            <div key={status} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${STATUS_META[status].dot}`} />
                  <h3 className="font-black text-sm sm:text-lg">{STATUS_META[status].label}</h3>
                  <span className="bg-slate-900 dark:bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {grouped[status].length}
                  </span>
                </div>
              </div>

              <DroppableColumn status={status}>
                <SortableContext items={grouped[status].map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {grouped[status].map((task) => (
                    <SortableTask key={task.id} task={task} status={status} />
                  ))}
                </SortableContext>
                {grouped[status].length === 0 && (
                  <div className="border-3 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 text-center text-slate-300 dark:text-white/20 font-bold text-sm">
                    Drop tasks here
                  </div>
                )}
              </DroppableColumn>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({...alertDialog, isOpen: false})}
      />
    </div>
  );
}
