import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export function EnhancedSignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"choose" | "password" | "otp" | "otp-verify" | "reset-password" | "reset-verify">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google");
    } catch (error) {
      toast.error("Failed to sign in with Google");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const authData: any = { 
        email, 
        password, 
        flow: isSignUp ? "signUp" : "signIn" 
      };
      
      if (isSignUp && username) {
        authData.name = username; // Use username as name for profile creation
      }
      
      await signIn("password", authData);
      toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
    } catch (error: any) {
      if (error.message?.includes("Invalid password")) {
        toast.error("Invalid password. Please try again or reset your password.");
      } else {
        toast.error(isSignUp ? "Failed to create account" : "Failed to sign in");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn("resend", { email });
      setStep("otp-verify");
      toast.success("Verification code sent to your email!");
    } catch (error) {
      toast.error("Failed to send verification code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn("resend", { email, code });
      toast.success("Signed in successfully!");
    } catch (error) {
      toast.error("Invalid verification code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn("password", { email, flow: "reset" });
      setStep("reset-verify");
      toast.success("Password reset code sent to your email!");
    } catch (error) {
      toast.error("Failed to send password reset code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    
    try {
      await signIn("password", { 
        email, 
        code: resetCode, 
        newPassword,
        flow: "reset-verification" 
      });
      toast.success("Password reset successfully! You are now signed in.");
      // Reset form state
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setResetCode("");
      setStep("choose");
    } catch (error) {
      toast.error("Invalid reset code or failed to reset password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (step === "choose") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 text-center mb-6">Sign In to ArtAuction</h3>
        
        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Email/Password Option */}
        <button
          onClick={() => setStep("password")}
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Email & Password
        </button>

        {/* OTP Option */}
        <button
          onClick={() => setStep("otp")}
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Email Verification Code
        </button>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {isSignUp ? "Create Account" : "Sign In"}
          </h3>
          <button
            onClick={() => setStep("choose")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handlePasswordAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a unique username"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (isSignUp && !username.trim())}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="space-y-2 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
          
          {!isSignUp && (
            <div>
              <button
                onClick={() => setStep("reset-password")}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "reset-password") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
          <button
            onClick={() => setStep("password")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a code to reset your password.
        </p>

        <form onSubmit={handleSendPasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      </div>
    );
  }

  if (step === "reset-verify") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Reset Your Password</h3>
          <button
            onClick={() => setStep("reset-password")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back
          </button>
        </div>

        <p className="text-sm text-gray-600">
          We sent a reset code to <strong>{email}</strong>. Enter the code and your new password below.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reset Code
            </label>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || resetCode.length !== 6 || newPassword !== confirmPassword}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setStep("reset-password");
              setResetCode("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Didn't receive the code? Send again
          </button>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Email Verification</h3>
          <button
            onClick={() => setStep("choose")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a verification code to sign in.
        </p>

        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      </div>
    );
  }

  if (step === "otp-verify") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Enter Verification Code</h3>
          <button
            onClick={() => setStep("otp")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back
          </button>
        </div>

        <p className="text-sm text-gray-600">
          We sent a verification code to <strong>{email}</strong>. Enter it below to sign in.
        </p>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setStep("otp");
              setCode("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Didn't receive the code? Send again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
