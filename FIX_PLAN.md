# Emergency Fix: Dashboard Chart Data Mismatch

## Diagnosis
The `ClientProgressChart` component expects data in a format that does not match the output of `ChartDataService.formatProgressData`. This causes a runtime error when rendering the chart.

## Steps

1. **Refactor ClientProgressChart component**  
   - Change the component's props to accept data in the format provided by `ChartDataService`  
   - Update the component to transform this data into the structure required by Chart.js  

   File: [`src/app/dashboard/_components/ClientProgressChart.tsx`](src/app/dashboard/_components/ClientProgressChart.tsx)  

   Changes:  
   ```diff
   interface ClientProgressChartProps {
   -  data: {
   -    labels: string[]
   -    measurements: number[]
   -  }
   +  data: Array<{ x: string; y: number }>
     title?: string
   }
   
   export default function ClientProgressChart({ data, title }: ClientProgressChartProps) {
     const chartData = {
   -    labels: data.labels,
   -    datasets: [
   -      {
   -        label: 'Progress',
   -        data: data.measurements,
   +    labels: data.map(d => d.x),
   +    datasets: [
   +      {
   +        label: 'Progress',
   +        data: data.map(d => d.y),
         borderColor: 'rgb(75, 192, 192)',
         backgroundColor: 'rgba(75, 192, 192, 0.5)',
         tension: 0.4,
   ```

2. **Update Tests**  
   Update test data in [`src/app/dashboard/_components/ClientProgressChart.test.tsx`](src/app/dashboard/_components/ClientProgressChart.test.tsx) to match new data format:
   
   ```diff
   const testData = {
   -  labels: ['2025-01-01', '2025-01-02', '2025-01-03'],
   -  measurements: [65, 59, 80]
   +  [
   +    { x: '2025-01-01', y: 65 },
   +    { x: '2025-01-02', y: 59 },
   +    { x: '2025-01-03', y: 80 }
   +  ]
   ```

3. **Verify Integration**  
   Confirm that `DashboardContent` passes data correctly without transformation:
   ```typescript
   <ClientProgressChart data={chartData} title="Client Progress" />
   ```

## Expected Outcome
The chart will render without errors, using the data provided by `ChartDataService`.