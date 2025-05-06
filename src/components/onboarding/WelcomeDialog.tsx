import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, Shield, Code, CheckCircle } from 'lucide-react';

interface UserPreference {
  id: string;
  user_id: string;
  has_completed_onboarding: boolean;
  theme: string;
  created_at: string;
}

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('welcome');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('has_completed_onboarding')
          .eq('user_id', user.id)
          .single() as { data: UserPreference | null, error: any };
        
        if (error) {
          // If no record exists, create one and show onboarding
          if (error.code === 'PGRST116') {
            setOpen(true);
          } else {
            console.error('Error fetching onboarding status:', error);
          }
        } else if (data) {
          setHasSeenOnboarding(data.has_completed_onboarding || false);
          
          if (!data.has_completed_onboarding) {
            setOpen(true);
          }
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleFinishOnboarding = async () => {
    if (!user) return;
    
    try {
      // Save user preference
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id, 
          has_completed_onboarding: true,
          theme: 'system',
          created_at: new Date().toISOString() 
        }) as { error: any };
      
      if (error) throw error;
      
      setHasSeenOnboarding(true);
      setOpen(false);
      
      toast({
        title: "Welcome aboard!",
        description: "You're all set up and ready to start using Algo Garden."
      });
      
    } catch (error: any) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleSkipOnboarding = async () => {
    await handleFinishOnboarding();
    navigate('/');
  };

  const handleNextStep = (nextStep: string) => {
    setOnboardingStep(nextStep);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <Tabs value={onboardingStep} onValueChange={setOnboardingStep}>
          <TabsContent value="welcome">
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to Algo Garden!</DialogTitle>
              <DialogDescription>
                Let's get you started with algorithmic trading.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="space-y-4">
                <p className="text-sm">
                  Algo Garden helps you create, test, and deploy algorithmic trading strategies without writing any code.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start space-x-3 bg-muted/40 rounded p-3">
                    <Rocket className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Build Algorithms</h3>
                      <p className="text-sm text-muted-foreground">Create trading algorithms with our visual editor</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 bg-muted/40 rounded p-3">
                    <Code className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Test Strategies</h3>
                      <p className="text-sm text-muted-foreground">Backtest your algorithms before deploying them</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 bg-muted/40 rounded p-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Secure Trading</h3>
                      <p className="text-sm text-muted-foreground">Deploy with confidence using our security features</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleSkipOnboarding}>
                Skip Tour
              </Button>
              <Button onClick={() => handleNextStep('connect')}>
                Continue
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="connect">
            <DialogHeader>
              <DialogTitle className="text-2xl">Connect Your Brokerage</DialogTitle>
              <DialogDescription>
                Connect to Alpaca to start trading with your algorithms
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-4">
              <p className="text-sm">
                Algo Garden uses Alpaca as the brokerage to execute trades. You'll need to connect your Alpaca account to get started.
              </p>
              
              <div className="bg-muted/40 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">How to connect:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Sign up for an Alpaca account at <span className="font-mono text-xs bg-muted p-1 rounded">alpaca.markets</span></li>
                  <li>Generate API keys in your Alpaca dashboard</li>
                  <li>Enter your keys in the Deployment section</li>
                </ol>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => handleNextStep('welcome')}>
                Back
              </Button>
              <Button onClick={() => handleNextStep('templates')}>
                Continue
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="templates">
            <DialogHeader>
              <DialogTitle className="text-2xl">Algorithm Templates</DialogTitle>
              <DialogDescription>
                Start with pre-built templates to get up and running quickly
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-4">
              <p className="text-sm">
                We've created several algorithmic trading templates to help you get started quickly.
                You can use these as a starting point and customize them to your needs.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-muted/40 p-3 rounded-md">
                  <h3 className="text-sm font-medium">Moving Average Crossover</h3>
                  <p className="text-xs text-muted-foreground">
                    Buy when the fast MA crosses above the slow MA, sell when it crosses below
                  </p>
                </div>
                
                <div className="bg-muted/40 p-3 rounded-md">
                  <h3 className="text-sm font-medium">RSI Overbought/Oversold</h3>
                  <p className="text-xs text-muted-foreground">
                    Buy when RSI indicates oversold conditions, sell when overbought
                  </p>
                </div>
                
                <div className="bg-muted/40 p-3 rounded-md">
                  <h3 className="text-sm font-medium">Mean Reversion</h3>
                  <p className="text-xs text-muted-foreground">
                    Strategy that assumes prices will revert to their mean over time
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => handleNextStep('connect')}>
                Back
              </Button>
              <Button onClick={() => handleNextStep('finished')}>
                Continue
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="finished">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                You're all set!
              </DialogTitle>
              <DialogDescription>
                You're ready to start creating algorithms
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-4 text-center">
              <p className="text-sm">
                Congratulations! You've completed the onboarding process and are ready to start using Algo Garden.
              </p>
              
              <div className="flex flex-col items-center justify-center py-4">
                <Rocket className="h-16 w-16 text-primary mb-3" />
                <p className="font-medium">Happy trading!</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleFinishOnboarding} className="w-full">
                Get Started
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
