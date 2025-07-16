
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useTranslations } from "next-intl";

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

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const t = useTranslations("Clients");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? isEditing
          ? t("clientForm_updating")
          : t("clientForm_creating")
        : isEditing
          ? t("clientForm_updateClient")
          : t("clientForm_createClient")}
    </Button>
  );
}

export default function ClientForm({ initialData, action }: ClientFormProps) {
  const t = useTranslations("Clients");
  const [state, dispatch] = useFormState<State, FormData>(action, {
    message: null,
    errors: {},
  });

  return (
    <form action={dispatch} className="space-y-4">
      {initialData?.id && (
        <input type="hidden" name="id" defaultValue={initialData.id} />
      )}
      <div>
        <Label htmlFor="name">{t("clientForm_name")}</Label>
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
        <Label htmlFor="email">{t("clientForm_email")}</Label>
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
        <Label htmlFor="phone">{t("clientForm_phone")}</Label>
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
        <Label htmlFor="status">{t("clientForm_status")}</Label>
        <select
          id="status"
          name="status"
          defaultValue={initialData?.status || "pending"}
          className="w-full p-2 border rounded"
        >
          <option value="active">{t("clientForm_active")}</option>
          <option value="inactive">{t("clientForm_inactive")}</option>
          <option value="pending">{t("clientForm_pending")}</option>
        </select>
        {state?.errors?.status && (
          <p className="text-red-500 text-sm">{state?.errors?.status[0]}</p>
        )}
      </div>
      <SubmitButton isEditing={!!initialData} />
      {state?.message && (
        <p className="text-red-500 text-sm">
          {state.message === "Client with this email already exists."
            ? t("clientForm_emailExists")
            : state.message}
        </p>
      )}
    </form>
  );
}