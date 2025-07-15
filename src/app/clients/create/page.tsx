import ClientForm from "../../../components/clients/ClientForm";
import BackLink from "@/components/ui/BackLink";
import { addClient } from "../actions";

export default async function CreateClientPage() {
  return (
    <div>
      <BackLink href="/clients" text="← Back to Client List" />
      <ClientForm initialData={null} action={addClient} />
    </div>
  );
}