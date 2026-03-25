import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <SignUp 
        path="/sign-up"
        routing="path"
        appearance={{
          elements: {
            formButtonPrimary: "bg-slate-900 border-none hover:bg-slate-800 text-sm normal-case",
            card: "shadow-xl border-none rounded-2xl",
            headerTitle: "text-2xl font-bold tracking-tight",
            headerSubtitle: "text-slate-500 font-medium",
            socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold",
          }
        }}
      />
    </div>
  );
}
