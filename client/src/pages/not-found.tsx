import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4 border-destructive/20 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-display">404 - LOST SIGNAL</h1>
          </div>

          <p className="mt-4 text-muted-foreground font-mono">
            The coordinates you requested do not exist in this sector.
            Return to base immediately.
          </p>
          
          <div className="mt-6 flex justify-end">
             <Link href="/" className="w-full">
               <Button className="w-full font-bold">RETURN TO MISSION</Button>
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
