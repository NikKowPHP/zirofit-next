# Plan: Fix and Implement Dashboard Charts

## Objective
Correctly implement data visualization charts on the dashboard as specified in ticket_fix_dashboard_charts.md

## Tasks:
- [ ] (LOGIC) Create data service in `lib/services/ChartDataService.ts` to format data for charts
- [ ] (UI) Implement functional line chart in `src/app/dashboard/_components/ClientProgressChart.tsx`
- [ ] (UI) Create new `MonthlyActivityChart.tsx` component for bar chart visualization
- [ ] (UI) Integrate both charts into `src/app/dashboard/DashboardContent.tsx`
- [ ] (LOGIC) Write Jest tests for chart components in `src/app/dashboard/_components/ClientProgressChart.test.tsx` and `MonthlyActivityChart.test.tsx`
- [ ] (UI) Deprecate or remove incorrect `ClientSpotlight` chart component
- [ ] (UI) Verify chart functionality with sample data