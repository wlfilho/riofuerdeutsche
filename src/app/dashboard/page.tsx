import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, User, Mail, Shield, Calendar } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile from database
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const handleSignOut = async () => {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">App Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <form action={handleSignOut}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:text-black transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <div className="px-4 sm:px-0">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Perfil do Usuário</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Informações básicas da sua conta armazenadas no Supabase.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <div className="shadow sm:rounded-md overflow-hidden border border-gray-200">
                            <div className="px-4 py-5 bg-white sm:p-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-gray-100 p-3 rounded-full">
                                        <User className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">ID do Usuário</h4>
                                        <p className="text-sm font-semibold text-gray-900 break-all">{user.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-gray-100 p-3 rounded-full">
                                        <Mail className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                        <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                                    </div>
                                </div>

                                {profile && (
                                    <>
                                        <div className="flex items-start gap-4">
                                            <div className="bg-gray-100 p-3 rounded-full">
                                                <Shield className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Função (Role)</h4>
                                                <p className="text-sm font-semibold text-gray-900 capitalize">{profile.role}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-gray-100 p-3 rounded-full">
                                                <Calendar className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Membro desde</h4>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
