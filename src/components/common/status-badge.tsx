"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

// ─── Task Status Badge ───────────────────────────────────────────────────────

const TASK_STATUS_CONFIG = {
	done: {
		label: "Done",
		className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
	},
	in_review: {
		label: "In Review",
		className: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
	},
	in_progress: {
		label: "In Progress",
		className: "bg-primary/10 text-primary border border-primary/20",
	},
	backlog: {
		label: "Backlog",
		className: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
	},
	todo: {
		label: "To Do",
		className: "bg-muted text-muted-foreground border border-border",
	},
} as const;

type TaskStatus = keyof typeof TASK_STATUS_CONFIG;

interface TaskStatusBadgeProps {
	status: string;
	className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
	const config = TASK_STATUS_CONFIG[status as TaskStatus] ?? {
		label: status,
		className: "bg-muted text-muted-foreground border border-border",
	};
	return (
		<Badge className={`text-[9px] uppercase font-bold ${config.className} ${className ?? ""}`}>
			{config.label}
		</Badge>
	);
}

// ─── Task Priority Badge ─────────────────────────────────────────────────────

const TASK_PRIORITY_CONFIG = {
	urgent: {
		label: "Urgent",
		className: "bg-red-500/10 text-red-500 border border-red-500/20",
	},
	high: {
		label: "High",
		className: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
	},
	medium: {
		label: "Medium",
		className: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
	},
	low: {
		label: "Low",
		className: "bg-muted text-muted-foreground border border-border",
	},
} as const;

type TaskPriority = keyof typeof TASK_PRIORITY_CONFIG;

interface TaskPriorityBadgeProps {
	priority: string;
	className?: string;
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
	const config = TASK_PRIORITY_CONFIG[priority as TaskPriority] ?? {
		label: priority,
		className: "bg-muted text-muted-foreground border border-border",
	};
	return (
		<Badge className={`text-[9px] uppercase font-bold ${config.className} ${className ?? ""}`}>
			{config.label}
		</Badge>
	);
}

// ─── Project Status Badge ────────────────────────────────────────────────────

const PROJECT_STATUS_CONFIG = {
	active: {
		label: "Active",
		className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
	},
	completed: {
		label: "Completed",
		className: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
	},
	on_hold: {
		label: "On Hold",
		className: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
	},
	planning: {
		label: "Planning",
		className: "bg-muted text-muted-foreground border border-border",
	},
} as const;

type ProjectStatus = keyof typeof PROJECT_STATUS_CONFIG;

interface ProjectStatusBadgeProps {
	status: string;
	className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
	const config = PROJECT_STATUS_CONFIG[status as ProjectStatus] ?? {
		label: status,
		className: "bg-muted text-muted-foreground border border-border",
	};
	return (
		<Badge className={`${config.className} ${className ?? ""}`}>
			{config.label}
		</Badge>
	);
}
