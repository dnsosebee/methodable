import { NextResponse } from "next/server";
export async function middleware(req, ev) {
  const { pathname } = req.nextUrl;
  if (pathname === "/" || pathname === "/home") {
    const url = req.nextUrl.clone();
    url.pathname = "/edit/home";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
