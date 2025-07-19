import "material-symbols/outlined.css";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  data,
  Links,
  type LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { getToast } from "remix-toast";
import { twMerge } from "tailwind-merge";
import type { Route } from "./+types/root";
import { MainLayout } from "./components/layout/MainLayout";
import { APP_NAME } from "./config/app";
import { ErrorBoundaryInfo } from "./lib/errorBoundary/ErrorBoundaryInfo";
import { useErrorBoundary } from "./lib/errorBoundary/useErrorBoundary";
import "./styles/app.css";

export const links: Route.LinksFunction = () => [
  { href: "https://fonts.googleapis.com", rel: "preconnect" },
  {
    crossOrigin: "anonymous",
    href: "https://fonts.gstatic.com",
    rel: "preconnect",
  },
  {
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    rel: "stylesheet",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { headers, toast } = await getToast(request);
  return data({ alert: toast }, { headers });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { alert } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (alert) {
      toast(alert.message);
    }
  }, [alert]);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Doc Scout" />
        <link rel="manifest" href="/site.webmanifest" />
        <Meta />
        <Links />
        <title>{APP_NAME}</title>
      </head>
      <body className={twMerge("h-full", "md:bg-background")}>
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const output = useErrorBoundary(error);

  return (
    <MainLayout pageTitle={output.title} user={null} systemError>
      <ErrorBoundaryInfo {...output} />
    </MainLayout>
  );
}
