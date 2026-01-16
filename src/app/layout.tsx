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
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                    rel="stylesheet"
                />
            </head>
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
