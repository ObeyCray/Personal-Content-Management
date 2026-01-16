import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/Toaster";
import { MainContent } from "@/components/layout/MainContent";
import "./globals.css";

export const metadata: Metadata = {
    title: "Personal AI CMS",
    description: "Advanced content management and planning with AI.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="flex">
                <Sidebar />
                <MainContent>
                    {children}
                </MainContent>
                <Toaster />
            </body>
        </html>
    );
}
