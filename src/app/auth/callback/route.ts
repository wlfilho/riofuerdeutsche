import { NextResponse } from "next/server";
// The client you created from the server-side auth instructions
import { createClient } from "@/utils/supabase/server";

// Apenas hosts confiáveis podem ser destino do redirect pós-login.
// Evita open redirect via header x-forwarded-host falsificado.
function isAllowedHost(host: string): boolean {
    return (
        host === "riofuerdeutsche.de" ||
        host === "www.riofuerdeutsche.de" ||
        host.endsWith(".vercel.app") // previews do Vercel
    );
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // "next" deve ser um caminho relativo interno (começa com "/", mas não "//").
    const rawNext = searchParams.get("next");
    const next =
        rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
            ? rawNext
            : "/admin";

    if (code) {
        const supabase = await createClient();
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Sync first_name from user_metadata to profiles table
            const user = sessionData?.user;
            if (user) {
                const firstName = user.user_metadata?.first_name;
                if (firstName) {
                    await supabase
                        .from('profiles')
                        .upsert(
                            { id: user.id, first_name: firstName },
                            { onConflict: 'id', ignoreDuplicates: false }
                        );
                }
            }
            const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
            const isLocalHost = origin.startsWith("http://localhost");
            if (isLocalHost) {
                // we can be sure that originated from the local dev-server
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost && isAllowedHost(forwardedHost)) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
