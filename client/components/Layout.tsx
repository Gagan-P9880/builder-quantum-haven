import { Shield, Activity, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export default function Layout({
  children,
  showNavigation = true,
}: LayoutProps) {
  const location = useLocation();

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "RFID Monitor", href: "/rfid", icon: Shield },
    { name: "DoS Protection", href: "/dos", icon: Shield },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="p-2 bg-primary rounded-lg">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      SecureGuard
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Security Monitoring Platform
                    </p>
                  </div>
                </Link>
              </div>

              <nav className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.name} to={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "flex items-center space-x-2",
                          isActive && "bg-primary text-primary-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center space-x-2">
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main
        className={cn(
          "container mx-auto px-4",
          showNavigation ? "py-6" : "py-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}
