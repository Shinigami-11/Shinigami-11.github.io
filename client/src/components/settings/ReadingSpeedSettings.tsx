import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { usePreferences } from "@/context/PreferencesContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";

interface ReadingSpeedSettingsProps {
  className?: string;
}

export default function ReadingSpeedSettings({ className }: ReadingSpeedSettingsProps) {
  const { preferences, setReadingSpeed, setBuzzTimeout } = usePreferences();
  const [localSpeed, setLocalSpeed] = useState(preferences.readingSpeed);
  const [localBuzzTimeout, setLocalBuzzTimeout] = useState(preferences.buzzTimeout);
  const { toast } = useToast();

  // Keep local state in sync with preferences
  useEffect(() => {
    setLocalSpeed(preferences.readingSpeed);
    setLocalBuzzTimeout(preferences.buzzTimeout);
  }, [preferences.readingSpeed, preferences.buzzTimeout]);

  const handleSpeedChange = (value: number[]) => {
    setLocalSpeed(value[0]);
  };

  const handleBuzzTimeoutChange = (value: number[]) => {
    setLocalBuzzTimeout(value[0]);
  };

  const applySpeedChange = () => {
    setReadingSpeed(localSpeed);
    toast({
      title: "Reading Speed Updated",
      description: `Reading speed set to ${getSpeedLabel(localSpeed)} (${localSpeed}/10)`,
    });
  };
  
  const applyBuzzTimeoutChange = () => {
    setBuzzTimeout(localBuzzTimeout);
    toast({
      title: "Buzz Timeout Updated",
      description: `Buzz timeout set to ${localBuzzTimeout} seconds`,
    });
  };

  const getSpeedLabel = (speed: number) => {
    if (speed <= 2) return "Very Slow";
    if (speed <= 4) return "Slow";
    if (speed <= 6) return "Medium";
    if (speed <= 8) return "Fast";
    return "Very Fast";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Reading & Timer Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reading Speed Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <Label>Reading Speed</Label>
            <span className="text-sm font-medium">
              {getSpeedLabel(localSpeed)} ({localSpeed}/10)
            </span>
          </div>
          <Slider
            value={[localSpeed]}
            min={1}
            max={10}
            step={1}
            onValueChange={handleSpeedChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slower</span>
            <span>Faster</span>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={applySpeedChange} 
              className="w-full"
              variant="outline"
            >
              Apply Speed Setting
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>How it works:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Very Slow: Questions reveal at a deliberate pace for beginners</li>
              <li>Medium: Balanced reading speed for normal practice</li>
              <li>Very Fast: Quick reveal for advanced players</li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Buzz Timeout Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label>Buzz Timeout</Label>
            </div>
            <span className="text-sm font-medium">
              {localBuzzTimeout} seconds
            </span>
          </div>
          <Slider
            value={[localBuzzTimeout]}
            min={1}
            max={30}
            step={1}
            onValueChange={handleBuzzTimeoutChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Shorter</span>
            <span>Longer</span>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={applyBuzzTimeoutChange} 
              className="w-full"
              variant="outline"
            >
              Apply Timeout Setting
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Timer Information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Timer starts automatically after question reading completes</li>
              <li>You must answer within the timeout period</li>
              <li>Adjust based on your skill level and reaction time</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}