# Ticket: Fix and Implement Dashboard Charts

## Objective
To correctly implement the data visualization charts on the main dashboard as originally specified in the Phase 2 plans. The current implementation is incorrect and incomplete.

## Problem Statement
The current implementation deviates from the plan (`work_items/dev_todo_phase_2_charts.md`):
1.  The `ClientProgressChart` component is a non-functional stub.
2.  A `ClientSpotlight` component was created with a bar chart, which was not part of the original plan and does not fulfill the requirement for a client progress line chart.
3.  A monthly activity or revenue chart is completely missing.

## Architect's Task
The `Architect` agent must create a new, detailed, and tagged `dev_todo_*.md` plan to be registered in the `project_manifest.json`. This plan must outline the steps to:
1.  **(LOGIC)** Create or refactor a service in `lib/` to provide properly formatted data for a client progress **line chart** and a monthly activity **bar chart**.
2.  **(UI)** Implement a functional **line chart** in `ClientProgressChart.tsx` to visualize a client's measurement history over time.
3.  **(UI)** Create a new component for a monthly activity **bar chart** (e.g., `MonthlyActivityChart.tsx`).
4.  **(UI)** Integrate these two new, correct charts into the `DashboardContent.tsx` layout.
5.  **(LOGIC)** Create Jest tests for the new chart components to verify data handling.
6.  **(UI)** Mark the incorrect `ClientSpotlight` chart for deprecation or remove it entirely.