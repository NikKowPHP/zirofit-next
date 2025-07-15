import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/clients/create">Add New Client</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/clients">Log a Session</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/clients">Add Measurement</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;