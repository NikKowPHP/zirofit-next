# Ticket: Implement Dark Mode

## Objective
To add full dark mode support to the application, fulfilling a key requirement from the Phase 2 master plan (`work_items/dev_todo_phase_2.md`).

## Problem Statement
This feature is currently missing. The necessary CSS in `globals.css` is commented out, Tailwind CSS is not configured for class-based dark mode, and there is no UI mechanism (e.g., a toggle button) for users to switch themes.

## Architect's Task
The `Architect` agent must create a new, detailed, and tagged `dev_todo_*.md` plan to be registered in the `project_manifest.json`. This plan must outline the steps to:
1.  **(UI)** Configure `tailwind.config.ts` to enable the `class` strategy for dark mode.
2.  **(UI)** Implement the necessary global styles for dark mode in `globals.css`.
3.  **(LOGIC)** Create a theme-provider or hook to manage the current theme state (light/dark) and persist the user's choice in `localStorage`.
4.  **(UI)** Add a theme-toggle button to a shared layout, such as `TrainerDashboardLayout.tsx`, so the user can switch themes.
5.  **(UI)** Systematically apply `dark:` variant styles to all major components (layouts, forms, buttons, cards, etc.) to ensure the application is fully functional and readable in dark mode.