import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePreferences } from '@/context/PreferencesContext';
import KeybindingsSettings from '@/components/settings/KeybindingsSettings';
import ReadingSpeedSettings from '@/components/settings/ReadingSpeedSettings';
import { Moon, Sun, Keyboard, BookOpen, User, UserCog, Github, Twitter, Globe, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { preferences, setDarkMode } = usePreferences();
  const [activeTab, setActiveTab] = useState('appearance');
  const [username, setUsername] = useState('Player');
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  
  const handleSaveProfile = () => {
    // Here you would typically save to a backend
    toast({
      title: "Profile Updated",
      description: "Your account information has been saved",
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your QuizParserinator experience
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              {preferences.darkMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>Theme</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Reading</span>
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <span>Shortcuts</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto pr-1 -mr-1">
            <TabsContent value="account" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Username" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="your.email@example.com" 
                    />
                  </div>
                  
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Label>Connect Accounts</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Github className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                      <div className="text-sm text-muted-foreground">
                        Switch to a darker color scheme that's easier on the eyes
                      </div>
                    </div>
                    <Switch
                      id="darkMode"
                      checked={preferences.darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Color Theme Preview</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-4 rounded-md bg-background border">
                        <p className="font-medium text-foreground">Background</p>
                        <p className="text-sm text-muted-foreground">Text color</p>
                      </div>
                      <div className="p-4 rounded-md bg-primary text-primary-foreground">
                        <p className="font-medium">Primary</p>
                        <p className="text-sm opacity-90">Button color</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reading" className="m-0">
              <ReadingSpeedSettings />
            </TabsContent>
            
            <TabsContent value="shortcuts" className="m-0">
              <KeybindingsSettings />
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}