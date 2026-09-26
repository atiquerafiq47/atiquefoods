import { LoginForm } from "@/components/auth/login-form";
import { getSiteName } from "@/lib/env";

export default function LoginPage() {
  return <LoginForm siteName={getSiteName()} />;
}
