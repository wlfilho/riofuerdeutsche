import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // Propaga o pathname para os Server Components: o next-intl (src/i18n/request.ts)
    // usa este header para resolver o locale (/admin → pt-BR, resto → de).
    // Precisa ser setado ANTES do createServerClient porque os NextResponse.next({request})
    // do fluxo de cookies reconstroem a resposta a partir do request.
    request.headers.set("x-pathname", request.nextUrl.pathname);

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // --- REGRAS DE REDIRECIONAMENTO PARA LOGIN/SIGNUP ---
    if (user && (pathname === "/login" || pathname === "/signup")) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        let redirectTo = "/dashboard";
        if (profile?.role === "admin") redirectTo = "/admin";
        if (profile?.role === "driver") redirectTo = "/motorista";

        return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // --- ROTA /motorista: área do motorista escalado nos tours ---
    if (pathname.startsWith("/motorista")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // Admin entra para conferir o que o motorista vê; membro comum não
        // tem nada aqui e volta pro hub dele.
        if (profile?.role !== "driver" && profile?.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // --- ROTA /dashboard: hub da área de membros (qualquer membro autenticado) ---
    if (pathname.startsWith("/dashboard")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }
    }

    // --- ROTAS /guide/*: conteúdo do guide ---
    if (pathname.startsWith("/guide")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }

        // /guide/sicherheit é acessível para qualquer usuário autenticado
        // Os demais capítulos exigem premium ou admin
        if (!pathname.startsWith("/guide/sicherheit")) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role, premium_until")
                .eq("id", user.id)
                .single();

            const role = profile?.role;
            const isPremium =
                role === "admin" ||
                (role === "premium" &&
                    (!profile?.premium_until ||
                        new Date(profile.premium_until) > new Date()));

            if (!isPremium) {
                const url = request.nextUrl.clone();
                url.pathname = "/dashboard";
                url.searchParams.set("upgrade", "true");
                return NextResponse.redirect(url);
            }
        }
    }

    // --- ROTA /admin: apenas admins ---
    if (pathname.startsWith("/admin")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // --- REGRA GERAL: apenas rotas explicitamente protegidas requerem autenticação ---
    // Rotas desconhecidas são deixadas passar para o Next.js renderizar o not-found.tsx
    // /update-password NÃO entra aqui de propósito: sem sessão ela precisa renderizar
    // o aviso de "link expirado" + botão de novo link. Um redirect para /login engoliria
    // esse contexto (e o ?error=expired vindo do /auth/callback), deixando o usuário
    // numa tela de login sem explicação de por que o link dele não funcionou.
    const protectedPrefixes: string[] = [];
    const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (!user && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as is. If you're creating a
    // new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but remember that it should return a NextResponse.

    return supabaseResponse;
}
