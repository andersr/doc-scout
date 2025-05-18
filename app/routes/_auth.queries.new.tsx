import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData, useNavigation } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { newQuerySchema } from "~/lib/formSchemas";
import { prisma } from "~/lib/prisma";
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
    { name: "description", content: "Start a new query" },
  ];
}

type FormData = z.infer<typeof newQuerySchema>;
const resolver = zodResolver(newQuerySchema);

export async function loader() {
  const collections = await prisma.collection.findMany();
  return {
    collections,
  };
}

export default function NewInquiry() {
  const { collections } = useLoaderData<typeof loader>();
  const [selectedCollections, setSelectedCollections] = useState<
    Array<(typeof collections)[0]>
  >([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const navigation = useNavigation();

  const handleAddCollection = () => {
    if (!selectedCollectionId) return;

    const collection = collections.find(
      (c) => c.id.toString() === selectedCollectionId,
    );
    if (!collection) return;

    if (selectedCollections.some((c) => c.id === collection.id)) return;

    setSelectedCollections([...selectedCollections, collection]);
    setSelectedCollectionId("");
  };

  const handleRemoveCollection = (id: number) => {
    setSelectedCollections(selectedCollections.filter((c) => c.id !== id));
  };

  const {
    handleSubmit,
    formState: { errors, isValid },
    register,
  } = useRemixForm<FormData>({
    mode: "onSubmit",
    resolver,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{PAGE_TITLE}</h1>

      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="collection-select">Select a Collection</Label>
          <div className="flex gap-2">
            <select
              id="collection-select"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
            >
              <option value="">Select a collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id.toString()}>
                  {collection.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={handleAddCollection}
              disabled={!selectedCollectionId}
            >
              Add
            </Button>
          </div>
        </div>

        {selectedCollections.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>Selected Collections</Label>
            <ul className="border rounded-md p-2">
              {selectedCollections.map((collection) => (
                <li
                  key={collection.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span>{collection.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCollection(collection.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Form
        method="POST"
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        {selectedCollections.map((collection) => (
          <input
            key={collection.publicId}
            type="hidden"
            value={collection.publicId}
            {...register("collectionId")}
          />
        ))}

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
      errors,
      data,
      receivedValues: defaultValues,
    } = await getValidatedFormData<FormData>(args.request, resolver);

    if (errors) {
      return { errors, defaultValues, ok: false };
    }

    const selectedCollection = await prisma.collection.findFirstOrThrow({
      where: {
        publicId: data.collectionId,
      },
    });

    const chatPublicId = generateId();
    const chat = await prisma.chat.create({
      data: {
        publicId: chatPublicId,
        createdAt: new Date(),
        chatCollections: {
          create: {
            collectionId: selectedCollection.id,
          },
        },
      },
    });

    return redirect(appRoutes("/queries/:id", { id: chat.publicId }));
  } catch (error) {
    console.error("Inquiry creation error: ", error);
    return {
      ok: false,
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
    };
  }
}
