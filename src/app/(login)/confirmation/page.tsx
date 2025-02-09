import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function RegistrationConfirmation() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[540px] text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <Mail className="h-16 w-16 text-blue-500" />
          </div>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a password reset link to your email address. Please
            check your inbox and click the link to reset your password.
          </p>
          <p className="text-sm text-gray-500">
            If you don&apos;t see the email, please check your spam folder.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
