import { useParams } from "react-router";
import { prisma } from "~/lib/prisma";
import type { RouteData } from "~/types/routeData";

const PAGE_TITLE = "Inquiry";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [
    { title: PAGE_TITLE },
    { name: "description", content: "Inquiry chat interface" },
  ];
}

export async function loader({ params }: { params: { id: string } }) {
  const { id } = params;

  const chat = await prisma.chat.findUnique({
    where: {
      publicId: id,
    },
    include: {
      chatCollections: {
        include: {
          collection: true,
        },
      },
    },
  });

  if (!chat) {
    throw new Response("Chat not found", { status: 404 });
  }

  return {
    chat,
  };
}

export default function InquiryChat() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inquiry Chat</h1>
      <p className="mb-4">Chat ID: {id}</p>
      <p>Chat interface will be implemented in a future step.</p>
    </div>
  );
}
