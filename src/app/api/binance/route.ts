import { handleDownloadDataRequest } from "@domains/downloader/api";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  console.log("GET", request.nextUrl.toJSON());
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
  const stream = await handleDownloadDataRequest(request);
  return new NextResponse(stream, { headers });
};
