interface Measurement {
  date: Date;
  value: number;
  type: string;
}

interface ClientSpotlightProps {
  clientName?: string;
  measurements?: Measurement[];
}

export default function ClientSpotlight({ clientName, measurements }: ClientSpotlightProps) {
  if (!clientName || !measurements) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-500">Log new measurements to see client progress here!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-2">{clientName}'s Progress</h3>
      <div className="h-48">
        {/* Chart implementation would go here */}
        <p className="text-gray-500">Chart placeholder for {measurements.length} measurements</p>
      </div>
    </div>
  );
}