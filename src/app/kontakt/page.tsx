import Link from "next/link";
import { Suspense } from "react";
import AnfrageForm from "@/app/anfrage/AnfrageForm";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import { MessageCircle, Mail, Send, ChevronRight, CheckCircle2, Instagram, Youtube } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSettings, buildContactUrls } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.kontakt");
  return {
    title: t("metaTitle"),
    description: "Schreib mir! Ich antworte auf Deutsch, meistens innerhalb von 24 Stunden. Kontaktiere mich per WhatsApp oder E-Mail für deine private Tour in Rio de Janeiro.",
    alternates: {
      canonical: "https://riofuerdeutsche.de/kontakt",
    },
    openGraph: {
      url: "https://riofuerdeutsche.de/kontakt",
    },
  };
}

export default async function KontaktPage() {
  const t = await getTranslations("public.kontakt")
  const settings = await getSettings()
  const c = buildContactUrls(settings)

  return (
    <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
      <NavbarServer />

      <main className="flex-grow pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          {/* Breadcrumb */}
          <FadeIn direction="up">
            <nav className="flex items-center text-sm font-medium text-gray-500 mb-12" aria-label={t("breadcrumbAria")}>
              <Link href="/" className="hover:text-rio-green transition-colors">{t("breadcrumbHome")}</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
              <span className="text-rio-green font-semibold">{t("breadcrumbCurrent")}</span>
            </nav>
          </FadeIn>

          <div className="max-w-7xl">
            <FadeIn direction="up">
              <h1 className="text-5xl lg:text-7xl font-heading font-black text-gray-900 leading-tight mb-6 mt-2">
                {t("heroTitle")}
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl leading-relaxed mb-16">
                {t("heroSubtitle")}
              </p>
            </FadeIn>

            {/* Formulário no topo, canais abaixo. A /kontakt NÃO redireciona pra
                /anfrage de propósito: ela é "index, follow" e a /anfrage é
                "noindex, nofollow" — redirecionar jogaria fora o sinal de SEO de
                uma URL que já recebe tráfego e é linkada do rodapé.
                `defaultVon="site"` porque quem chega aqui veio navegando, não de
                campanha. */}
            <FadeIn direction="up">
              <div className="mb-20">
                <Suspense>
                  <AnfrageForm
                    embedded
                    defaultVon="site"
                    whatsappHref={c.whatsappHref}
                    instagramHref={c.instagramHref}
                    instagramHandle={settings.business_instagram.replace(/^@/, "")}
                  />
                </Suspense>
              </div>
            </FadeIn>

            <FadeIn direction="up">
              <h2 className="text-2xl lg:text-3xl font-heading font-black text-gray-900 mb-8">
                {t("directChannelsTitle")}
              </h2>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* WhatsApp Block */}
              {c.whatsappHref && (
              <FadeIn direction="up" delay={0.1}>
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-[#25D366]" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">{t("whatsappTitle")}</h2>
                  <p className="text-gray-600 text-lg mb-8 flex-grow">
                    {t("whatsappText")}
                  </p>
                  <a
                    href={c.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-full font-bold text-lg hover:bg-[#22c35e] transition-all shadow-lg shadow-[#25D366]/20"
                  >
                    {t("whatsappCta")}
                  </a>
                </div>
              </FadeIn>
              )}

              {/* Telegram Block */}
              {c.telegramHref && (
              <FadeIn direction="up" delay={0.15}>
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-[#0088cc]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Send className="w-8 h-8 text-[#0088cc]" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">{t("telegramTitle")}</h2>
                  <p className="text-gray-600 text-lg mb-8 flex-grow">
                    {t("telegramText")}
                  </p>
                  <a
                    href={c.telegramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0088cc] text-white rounded-full font-bold text-lg hover:bg-[#0077b5] transition-all shadow-lg shadow-[#0088cc]/20"
                  >
                    {t("telegramCta")}
                  </a>
                </div>
              </FadeIn>
              )}

              {/* Email Block */}
              {c.emailHref && (
              <FadeIn direction="up" delay={0.2}>
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-rio-blue/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Mail className="w-8 h-8 text-rio-blue" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">{t("emailTitle")}</h2>
                  <p className="text-gray-600 text-lg mb-8 flex-grow">
                    {t("emailText")}
                  </p>
                  <a
                    href={c.emailHref}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-blue text-white rounded-full font-bold text-lg hover:bg-rio-blue/90 transition-all shadow-lg shadow-rio-blue/20"
                  >
                    {t("emailCta")}
                  </a>
                </div>
              </FadeIn>
              )}
            </div>

            <FadeIn direction="up" delay={0.3}>
              <div className="mt-16 flex flex-col md:flex-row md:items-center justify-between gap-8 pt-16 border-t border-gray-100">
                <div className="flex items-center gap-3 px-6 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 w-fit">
                  <CheckCircle2 className="w-5 h-5 text-rio-green" />
                  <p className="text-gray-600 font-medium">
                    {t("languageNote")}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t("followMe")}</p>
                  <div className="flex items-center gap-4">
                    {c.instagramHref && (
                    <a
                      href={c.instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:scale-110 transition-all duration-300"
                    >
                      <Instagram className="w-6 h-6" />
                      <span className="sr-only">{t("instagram")}</span>
                    </a>
                    )}
                    {c.youtubeHref && (
                    <a
                      href={c.youtubeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-white hover:bg-[#FF0000] hover:scale-110 transition-all duration-300"
                    >
                      <Youtube className="w-6 h-6" />
                      <span className="sr-only">{t("youtube")}</span>
                    </a>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterServer />
    </div>
  );
}
