"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addClient, updateClient } from "@/app/clients/actions";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";

interface ClientFormProps {
  initialData: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
  } | null;
  action: (prevState: any, formData: FormData) => Promise<any>;
}

interface State {
  message: string | null;
  errors: {
    name?: string[];
    email?: string[];
    phone?: string[];
    status?: string[];
  };
}

export default function ClientForm({ initialData, action }: ClientFormProps) {
  const [state, dispatch] = useFormState<State, FormData>(action, {
    message: null,
    errors: {},
  });
  const { pending } = useFormStatus();

  return (
    <form action={dispatch} className="space-y-4">
      {initialData?.id && (
        <input type="hidden" name="id" defaultValue={initialData.id} />
      )}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          defaultValue={initialData?.name || ""}
          required
        />
        {state?.errors?.name && (
          <p className="text-red-500 text-sm">{state?.errors?.name[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          defaultValue={initialData?.email || ""}
        />
        {state?.errors?.email && (
          <p className="text-red-500 text-sm">{state?.errors?.email[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="text"
          id="phone"
          name="phone"
          defaultValue={initialData?.phone || ""}
        />
        {state?.errors?.phone && (
          <p className="text-red-500 text-sm">{state?.errors?.phone[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={initialData?.status || "pending"}
          className="w-full p-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        {state?.errors?.status && (
          <p className="text-red-500 text-sm">{state?.errors?.status[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending
          ? initialData
            ? "Updating..."
            : "Creating..."
          : initialData
            ? "Update Client"
            : "Create Client"}
      </Button>
      {state?.message && (
        <p className="text-red-500 text-sm">{state?.message}</p>
      )}
    </form>
  );
}