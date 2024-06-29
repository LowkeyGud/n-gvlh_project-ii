import RightSidebar from "@/components/shared/RightSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <main className="relative dark:bg-slate-900">
      <div className="flex">
        <section className="flex min-h-[calc(100vh-80px)] flex-1 flex-col px-6 py-6 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>
        <RightSidebar />
      </div>
      <Toaster />
    </main>
  );
};

export const metadata: Metadata = {
  authors: [
    {
      name: "CMRegmi | Github",
      url: "https://github.com/LowkeyGud",
    },
    {
      name: "CMRegmi | Wakatime",
      url: "https://wakatime.com/@lowkeygud",
    },
  ],
  title: "N-GVLH",
  description: "Next-Gen Virtual Learning Hub",
  icons: {
    icon: "/icons/favicon.svg",
  },
  openGraph: {
    title: "N-GVLH",
    description:
      "Have a problem that's been buggin you? Just post it to N-GVLH and people around the globe will help you solve it.",
    url: "https://next-ecotone.vercel.app/",
    siteName: "N-GVLH | Get Answers To Your Problems",
    images: [
      {
        url: "https://i.ibb.co/L8SN9vj/n-gvlh.jpg",
        width: 1200,
        height: 630,
        alt: "N-GVLH Q&A",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "N-GVLH | Get Answers To Your Problems",
    description:
      "Have a problem that's been buggin you? Just post it to N-GVLH and people around the globe will help you solve it.",
    // siteId: '',
    creator: "@LastSighh",
    // creatorId: '',
    images: ["https://i.ibb.co/L8SN9vj/n-gvlh.jpg"],
  },
};

export default Layout;
