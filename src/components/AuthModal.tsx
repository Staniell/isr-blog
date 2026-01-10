"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthModal({ defaultTab = "login" }: { defaultTab?: "login" | "signup" }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Credentials login typically redirects or handles error, we can use signIn here too
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      });
      // Close modal if success (though redirect usually happens)
      setOpen(false);
    } catch (error) {
      // Handle error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual signup server action call here
    // For now, let's just show it's "Working on it" or assume the user exists
    alert("Signup logic not yet implemented in backend. Please use Google Sign In.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={defaultTab === "signup" ? "default" : "ghost"}
          className={
            defaultTab === "signup"
              ? "bg-accent hover:bg-accent/90 text-white border-0"
              : "text-(--text-primary) hover:bg-(--bg-secondary) hover:text-(--text-primary)"
          }
        >
          {defaultTab === "signup" ? "Sign Up" : "Log In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-(--bg-primary) border-(--bg-secondary) text-(--text-primary)">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription className="text-(--text-secondary)">
            Sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-(--bg-secondary)">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-(--bg-primary) data-[state=active]:text-(--text-primary) text-(--text-secondary)"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-(--bg-primary) data-[state=active]:text-(--text-primary) text-(--text-secondary)"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleCredentialsLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-(--text-primary)">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-(--bg-secondary) border-transparent text-(--text-primary) placeholder:text-(--text-secondary)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" title="Password" className="text-(--text-primary)">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-(--bg-secondary) border-transparent text-(--text-primary)"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isLoading}>
                {isLoading ? "Loading..." : "Log In with Email"}
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-(--bg-secondary)" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-(--bg-primary) px-2 text-(--text-secondary)">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-(--bg-primary) border-(--bg-secondary) hover:bg-(--bg-secondary) text-(--text-primary)"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-(--text-primary)">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-(--bg-secondary) border-transparent text-(--text-primary) placeholder:text-(--text-secondary)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-(--text-primary)">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-(--bg-secondary) border-transparent text-(--text-primary)"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isLoading}>
                {isLoading ? "Loading..." : "Sign Up with Email"}
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-(--bg-secondary)" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-(--bg-primary) px-2 text-(--text-secondary)">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-(--bg-primary) border-(--bg-secondary) hover:bg-(--bg-secondary) text-(--text-primary)"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
