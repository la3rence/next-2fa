import {
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

type CookieStore = Awaited<ReturnType<typeof cookies>>

function createCookieGetter(cookieStore: CookieStore) {
  return () => cookieStore as unknown as ReturnType<typeof cookies>
}

export async function createSupabaseServerClient<Database = any>() {
  const cookieStore = await cookies()

  return createServerComponentClient<Database>({
    cookies: createCookieGetter(cookieStore),
  })
}

export async function createSupabaseRouteClient<Database = any>() {
  const cookieStore = await cookies()

  return createRouteHandlerClient<Database>({
    cookies: createCookieGetter(cookieStore),
  })
}
