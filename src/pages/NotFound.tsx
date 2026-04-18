import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4 hero-gradient">
    <div className="text-center max-w-md">
      <Logo size="lg" className="justify-center mb-8" />
      <div className="text-8xl font-bold gradient-text mb-4">404</div>
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  </div>
);

export default NotFound;
