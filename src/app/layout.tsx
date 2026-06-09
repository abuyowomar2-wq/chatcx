import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatCX - منصة إدارة خدمة العملاء",
  description: "اربط متجرك في سلة مع واتساب، واجمع محادثات العملاء وطلباتهم وردود فريقك داخل لوحة واحدة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
