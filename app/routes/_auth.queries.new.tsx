import type { LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData, useNavigation } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { requireUser } from "~/.server/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma";
import { type NewQuery, newQueryResolver } from "~/lib/schemas/newQuery";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { RouteData } from "~/types/routeData";

const PAGE_TITLE = "New Query";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [
    { title: PAGE_TITLE },
    { content: "Start a new query", name: "description" },
  ];
}

export async function loader() {
  const collections = await prisma.collection.findMany();
  return {
    collections,
  };
}

export default function NewInquiry() {
  const { collections } = useLoaderData<typeof loader>();

  const navigation = useNavigation();

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useRemixForm<NewQuery>({
    mode: "onSubmit",
    resolver: newQueryResolver,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{PAGE_TITLE}</h1>
      <Form
        method="POST"
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        <select
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("collectionId")}
        >
          <option value="">Select a collection</option>
          {collections.map((collection) => (
            <option key={collection.publicId} value={collection.publicId}>
              {collection.name}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={!isValid}>
          {navigation.state === "submitting" ? "Creating..." : "Continue"}
        </Button>
      </Form>
      {errors.collectionId && <p>{errors.collectionId.message}</p>}
    </div>
  );
}

export async function action(args: LoaderFunctionArgs) {
  await requireUser(args);
  try {
    const {
      data,
      errors,
      receivedValues: defaultValues,
    } = await getValidatedFormData<NewQuery>(args.request, newQueryResolver);

    if (errors) {
      return { defaultValues, errors, ok: false };
    }

    const selectedCollection = await prisma.collection.findFirstOrThrow({
      where: {
        publicId: data.collectionId,
      },
    });

    const chat = await prisma.chat.create({
      data: {
        chatCollections: {
          create: {
            collectionId: selectedCollection.id,
          },
        },
        createdAt: new Date(),
        publicId: generateId(),
      },
    });

    return redirect(appRoutes("/queries/:id", { id: chat.publicId }));
  } catch (error) {
    console.error("Inquiry creation error: ", error);
    return {
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    };
  }
}
