import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Neues Passwort",
    robots: { index: false, follow: false },
};

export default function UpdatePasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
