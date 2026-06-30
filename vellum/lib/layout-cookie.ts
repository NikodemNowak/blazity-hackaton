// Plain module (NOT "use client") so the cookie name can be imported by both the
// server layout and the client provider. Importing a value from a "use client"
// module into a Server Component yields a client-reference proxy, not the string.
export const LAYOUT_COOKIE = "vellum-layout";
