import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import SubmitForm from "@/components/SubmitForm";

export default async function SubmitPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/submit");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Submit a support request" subtitle="Tell us what happened. We'll triage and route it right away." />
        <SubmitForm user={session.user} />
      </div>
    </main>
  );
}
