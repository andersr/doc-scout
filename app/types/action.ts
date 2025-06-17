export type ActionHandlerFn = ({
  formData,
  request,
}: {
  formData: FormData;
  request: Request;
}) => Promise<Response | null>;
