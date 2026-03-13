import PageHeader from "@/components/PageHeader";
import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Submit a support request" subtitle="Tell us what happened. We'll triage and route it right away." />
        <SubmitForm />
      </div>
    </main>
  );
}
