import { Form } from "react-router";

export function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <Form method="POST" className="flex flex-col gap-4">
      {children}
    </Form>
  );
}
