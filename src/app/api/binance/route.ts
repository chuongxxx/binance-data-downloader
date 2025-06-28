import { handleDownloadDataRequest } from "@domains/downloader/api";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  console.log("GET", request.nextUrl.toJSON());

  return NextResponse.json("OK");
};

export const POST = async (request: NextRequest) => {
  return await handleDownloadDataRequest(request);
};
