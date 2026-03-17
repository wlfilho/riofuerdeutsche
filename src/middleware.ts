import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    const response = await updateSession(request);
    
    // Simplificar: o updateSession já lida com o refresh da sessão e retorna o user se disponível
    // No entanto, para redirecionamentos complexos baseados em role, precisamos do profile.
    // Como o middleware roda em Edge, buscar no banco pode ser lento, mas faremos apenas para /login e /signup.
    
    const pathname = request.nextUrl.pathname;
    const isLoginPage = pathname === "/login";
    const isSignupPage = pathname === "/signup";

    if (isLoginPage || isSignupPage) {
        // Verificar se há uma sessão ativa
        const { createServerClient } = await import('@supabase/ssr');
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll().map((cookie) => ({
                            name: cookie.name,
                            value: cookie.value,
                        }));
                    },
                    setAll() {}
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Usuário já logado tentando acessar login/signup
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            let redirectTo = '/guide/sicherheit';
            if (profile?.role === 'admin') redirectTo = '/dashboard';
            else if (profile?.role === 'premium') redirectTo = '/guide';

            return Response.redirect(new URL(redirectTo, request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - robots.txt (SEO crawler instructions)
         * - sitemap.xml (SEO sitemap)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
