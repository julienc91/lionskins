import { NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export const middleware = (request) => {
  const shouldHandleLocale =
    !PUBLIC_FILE.test(request.nextUrl.pathname) &&
    !request.nextUrl.pathname.includes("/api/") &&
    request.nextUrl.locale === "default";

  return shouldHandleLocale
    ? NextResponse.redirect(
        new URL(`/en${request.nextUrl.pathname}`, request.url)
      )
    : undefined;
};
