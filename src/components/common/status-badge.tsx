"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
	CheckCircle2,
	Eye,
	Activity,
	Layers,
	Circle,
	AlertOctagon,
	ArrowUpCircle,
	ArrowRightCircle,
	ArrowDownCircle,
	TrendingUp,
	PauseCircle,
	Sparkles,
} from "lucide-react";

// ─── Task Status Badge ───────────────────────────────────────────────────────

const TASK_STATUS_CONFIG = {
	done: {
		label: "Done",
		icon: CheckCircle2,
		className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
	},
	in_review: {
		label: "In Review",
		icon: Eye,
		className: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
	},
	in_progress: {
		label: "In Progress",
		icon: Activity,
		className: "bg-primary/10 text-primary border border-primary/20",
	},
	backlog: {
		label: "Backlog",
		icon: Layers,
		className: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
	},
	todo: {
		label: "To Do",
		icon: Circle,
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
		icon: Circle,
		className: "bg-muted text-muted-foreground border border-border",
	};
	const Icon = config.icon;
	return (
		<Badge className={`text-[9px] uppercase font-bold flex items-center gap-1 w-fit py-0.5 px-1.5 ${config.className} ${className ?? ""}`}>
			<Icon className="size-2.5 shrink-0" />
			<span>{config.label}</span>
		</Badge>
	);
}

// ─── Task Priority Badge ─────────────────────────────────────────────────────

const TASK_PRIORITY_CONFIG = {
	urgent: {
		label: "Urgent",
		icon: AlertOctagon,
		className: "bg-red-500/10 text-red-500 border border-red-500/20",
	},
	high: {
		label: "High",
		icon: ArrowUpCircle,
		className: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
	},
	medium: {
		label: "Medium",
		icon: ArrowRightCircle,
		className: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
	},
	low: {
		label: "Low",
		icon: ArrowDownCircle,
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
		icon: ArrowRightCircle,
		className: "bg-muted text-muted-foreground border border-border",
	};
	const Icon = config.icon;
	return (
		<Badge className={`text-[9px] uppercase font-bold flex items-center gap-1 w-fit py-0.5 px-1.5 ${config.className} ${className ?? ""}`}>
			<Icon className="size-2.5 shrink-0" />
			<span>{config.label}</span>
		</Badge>
	);
}

// ─── Project Status Badge ────────────────────────────────────────────────────

const PROJECT_STATUS_CONFIG = {
	active: {
		label: "Active",
		icon: TrendingUp,
		className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
	},
	completed: {
		label: "Completed",
		icon: CheckCircle2,
		className: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
	},
	on_hold: {
		label: "On Hold",
		icon: PauseCircle,
		className: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
	},
	planning: {
		label: "Planning",
		icon: Sparkles,
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
		icon: Sparkles,
		className: "bg-muted text-muted-foreground border border-border",
	};
	const Icon = config.icon;
	return (
		<Badge className={`text-[9px] uppercase font-bold flex items-center gap-1.5 py-0.5 px-2.5 ${config.className} ${className ?? ""}`}>
			<Icon className="size-3 shrink-0" />
			<span>{config.label}</span>
		</Badge>
	);
}
