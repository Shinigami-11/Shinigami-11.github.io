import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Keybindings } from "@shared/schema";
import { usePreferences } from "@/context/PreferencesContext";
import { RotateCcw } from "lucide-react";

interface KeybindingsSettingsProps {
  className?: string;
}

export default function KeybindingsSettings({ className }: KeybindingsSettingsProps) {
  const { preferences, updateKeybinding, resetKeybindings } = usePreferences();
  const [listeningFor, setListeningFor] = useState<keyof Keybindings | null>(null);
  const [localBindings, setLocalBindings] = useState<Keybindings>(preferences.keybindings);

  // Update local bindings when preferences change
  useEffect(() => {
    setLocalBindings(preferences.keybindings);
  }, [preferences.keybindings]);

  // Handle keydown event for setting new key
  useEffect(() => {
    if (!listeningFor) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const newKey = e.code || e.key;
      updateKeybinding(listeningFor, newKey);
      setListeningFor(null);
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [listeningFor, updateKeybinding]);

  const startListening = (key: keyof Keybindings) => {
    setListeningFor(key);
  };

  const handleReset = () => {
    resetKeybindings();
  };

  // Helper to convert key codes to display names
  const displayKeyName = (key: string) => {
    const keyMap: Record<string, string> = {
      "Space": "Spacebar",
      "ArrowRight": "→",
      "ArrowLeft": "←",
      "ArrowUp": "↑",
      "ArrowDown": "↓",
      "Enter": "Enter",
      "Escape": "Esc",
    };

    return keyMap[key] || key;
  };

  const keybindingLabels: Record<keyof Keybindings, string> = {
    buzzIn: "Buzz In",
    nextQuestion: "Next Question",
    prevQuestion: "Previous Question",
    skipQuestion: "Skip Question",
    resetQuestion: "Reset Question",
    toggleDarkMode: "Toggle Dark Mode",
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Keyboard Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(localBindings).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor={key} className="text-right">
              {keybindingLabels[key as keyof Keybindings]}
            </Label>
            <div className="flex gap-2">
              <Input
                id={key}
                value={listeningFor === key ? "Press any key..." : displayKeyName(value)}
                onFocus={() => startListening(key as keyof Keybindings)}
                readOnly
                className="w-40 font-mono text-center"
              />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </CardFooter>
    </Card>
  );
}