import { Link } from "react-router";
import { APP_NAME, TAG_LINE } from "~/config/app";
import { appRoutes } from "~/shared/appRoutes";
import { Logo } from "./brand/Logo";
import { Footer } from "./layout/Footer";
import { UserMenu } from "./user/UserMenu";

export default function LandingPage() {
  return (
    <div className="flex h-full flex-col px-4">
      <title>{`${APP_NAME} - ${TAG_LINE}`}</title>
      <header>
        <div className="flex flex-row items-center justify-between py-4 pr-3 pl-2 md:py-6">
          <Logo withText customStyles="text-pompadour/80" customOpacity={1} />
          <UserMenu user={null} />
        </div>
      </header>
      <div className="mx-auto mt-2 flex max-w-4xl flex-1 flex-col gap-8 px-6 py-4 md:mt-20 md:gap-16">
        <div className="text-center">
          <h1 className="text-pompadour/80 text-5xl tracking-tight font-stretch-50% md:text-7xl">
            {TAG_LINE}
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 md:mt-8">
            From research papers to regulatory docs, Doc Scout makes it easy to
            extract insights and get answers.
          </p>
          <div className="mt-6 flex items-center justify-center gap-x-6 md:mt-10">
            <Link
              to={appRoutes("/login")}
              className="bg-navy-blue/75 hover:bg-navy-blue rounded-md px-6 py-3 text-xl text-white shadow-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:px-8"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Add Docs
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Support for PDFs, Markdown files, and more. Add docs up to 50mb in
              size.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Chat</h3>
            <p className="mt-2 text-sm text-gray-600">
              Ask questions and get detailed answers from your docs using
              AI-powered chat.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Get Answers
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Perfect for regulatory docs, research papers, and other complex
              materials.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <Footer />
      </div>
    </div>
  );
}
