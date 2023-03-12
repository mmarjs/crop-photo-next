import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  console.log(`[${new Date().toISOString()}]`, "[Middleware]", req.method, req.url);
  return NextResponse.next();
}
