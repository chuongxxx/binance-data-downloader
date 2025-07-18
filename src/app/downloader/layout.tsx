import { ThemedLayoutV2 } from "@refinedev/antd";
import { Header } from "@shared/components/header";
import React from "react";

export default async function Layout({ children }: React.PropsWithChildren) {
  return <ThemedLayoutV2 Header={Header}>{children}</ThemedLayoutV2>;
}
