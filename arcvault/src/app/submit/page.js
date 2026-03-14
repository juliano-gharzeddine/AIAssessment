import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import SubmitForm from "@/components/SubmitForm";
import CustomerHeader from "@/components/CustomerHeader";

export default async function SubmitPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/submit");
  }

  if (session.user.role !== "CUSTOMER") {
    if (session.user.role === "REGULATOR") redirect("/regulator");
    if (session.user.role === "DEPARTMENT") redirect("/department");
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 pb-10 pt-28">
      <div className="mx-auto max-w-6xl">
        <CustomerHeader name={session.user.name} />
        <PageHeader title="Submit a support request" subtitle="Tell us what happened. We'll triage and route it right away." />
        <SubmitForm user={session.user} />
      </div>
    </main>
  );
}
