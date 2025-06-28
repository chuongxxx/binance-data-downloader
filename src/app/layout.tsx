import { useNotificationProvider } from "@refinedev/antd";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@refinedev/antd/dist/reset.css";
import { ColorModeContextProvider } from "@shared/contexts/color-mode";
import { dataProvider } from "@shared/providers/data-provider";

export const metadata: Metadata = {
  title: "Binance data downloader",
  description: "Developed by ChuongDo",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <html lang="en">
      <body>
        <Suspense>
          <RefineKbarProvider>
            <AntdRegistry>
              <ColorModeContextProvider defaultMode={defaultMode}>
                <Refine
                  routerProvider={routerProvider}
                  dataProvider={dataProvider}
                  notificationProvider={useNotificationProvider}
                  resources={[
                    {
                      name: "downloader",
                      list: "/downloader",
                      meta: {
                        canDelete: false,
                      },
                    },
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "5krG0o-DIsDeh-e2dZeD",
                  }}
                >
                  {children}
                  <RefineKbar />
                </Refine>
              </ColorModeContextProvider>
            </AntdRegistry>
          </RefineKbarProvider>
        </Suspense>
      </body>
    </html>
  );
}
