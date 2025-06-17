# Plan: Fix and Implement Dashboard Charts

## Objective
Correctly implement data visualization charts on the dashboard as specified in ticket_fix_dashboard_charts.md

## Tasks:
- [x] (LOGIC) Create data service in `lib/services/ChartDataService.ts` to format data for charts
- [x] (UI) Implement functional line chart in `src/app/dashboard/_components/ClientProgressChart.tsx`
- [x] **Implement MonthlyActivityChart component:**
  - [x] (UI) Create `src/app/dashboard/_components/MonthlyActivityChart.tsx`
  - [x] (UI) Implement bar chart using Chart.js similar to ClientSpotlight
  - [x] (UI) Use `ChartDataService.formatActivityData()` for data formatting
  - [x] (UI) Add TypeScript interface for props
- [x] (UI) Integrate both charts into `src/app/dashboard/DashboardContent.tsx`
- [ ] (LOGIC) Write Jest tests for chart components in `src/app/dashboard/_components/ClientProgressChart.test.tsx` and `MonthlyActivityChart.test.tsx`
- [x] (UI) Deprecate or remove incorrect `ClientSpotlight` chart component
- [ ] (UI) Verify chart functionality with sample data