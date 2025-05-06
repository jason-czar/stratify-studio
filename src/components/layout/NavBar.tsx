
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Home, 
  LayoutDashboard, 
  Binary, 
  Rocket, 
  ClipboardCheck,
  Bell,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function NavBar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Binary className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            Algo Garden
          </span>
        </Link>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive('/') && "bg-accent text-accent-foreground"
                  )}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Builder
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/dashboard">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive('/dashboard') && "bg-accent text-accent-foreground"
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/deployment">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive('/deployment') && "bg-accent text-accent-foreground"
                  )}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Deployment
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Shield className="mr-2 h-4 w-4" />
                Security
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[200px]">
                  <li>
                    <Link to="/security">
                      <NavigationMenuLink className="flex h-full w-full select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 no-underline outline-none focus:shadow-md">
                        <div className="mb-2 mt-1 text-base font-medium">
                          <Shield className="h-4 w-4 inline-block mr-2" />
                          Security Settings
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Manage account security, API keys and encryption settings
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  <li>
                    <Link to="/security?tab=api-keys">
                      <Button variant="ghost" className="w-full justify-start">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        API Keys
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link to="/security?tab=alerts">
                      <Button variant="ghost" className="w-full justify-start">
                        <Bell className="mr-2 h-4 w-4" />
                        Alert System
                      </Button>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <ProfileDropdown />
          </nav>
        </div>
      </div>
    </header>
  );
}
