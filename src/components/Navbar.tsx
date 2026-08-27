"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    MapPin,
    Menu,
    X,
    Instagram,
    Youtube,
    Mail,
    Send,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import HeaderAuth from "./HeaderAuth";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import type { ContactUrls } from "@/lib/settings";
import { FALLBACK_CONTACT } from "@/lib/contactFallback";

type SubLink = { href: string; label: string };

type SubGroup = {
    label: string;
    href: string;
    items: SubLink[];
    allHref?: string;
    allLabel?: string;
};

type NavLink =
    | { label: string; href: string; subLinks?: never; subGroups?: never; directLinks?: never }
    | { label: string; href: string; subLinks: SubLink[]; subGroups?: never; directLinks?: never }
    | { label: string; href: string; subGroups: SubGroup[]; subLinks?: never; directLinks?: SubLink[] };

/**
 * O catálogo é lido por hook, então a lista precisa ser construída dentro do
 * componente — daí ser função de `t` em vez de constante de módulo.
 */
function buildNavLinks(t: (key: string) => string): NavLink[] {
    return [
    {
        label: t("tourenUndAusfluege"),
        href: "/touren",
        subLinks: [
            { href: "/touren/klassiker", label: t("klassikerTour") },
            { href: "/touren/natur-und-straende", label: t("naturUndStraende") },
            { href: "/touren/favela-tour", label: t("favelaTour") },
            { href: "/touren/kultur-und-geschichte", label: t("kulturUndGeschichte") },
            { href: "/touren/by-night", label: t("rioByNight") },
            { href: "/touren/karneval-tour", label: t("karnevalTour") },
            { href: "/touren/regentage", label: t("regentageInRio") },
            { href: "/touren/fussball", label: t("fussballTour") },
            { href: "/touren/sport-und-abenteuer", label: t("sportUndAbenteuer") },
            { href: "/touren/tagesausfluege", label: t("tagesausfluege") },
            { href: "/touren/individuell", label: t("individuelleTour") },
        ],
    },
    {
        label: t("rioGuide"),
        href: "/rio-guide",
        subGroups: [
            {
                label: t("sehenswuerdigkeiten"),
                href: "/rio-guide/sehenswuerdigkeiten",
                items: [
                    { href: "/rio-guide/sehenswuerdigkeiten/christus-erloeser", label: t("christusErloeser") },
                    { href: "/rio-guide/sehenswuerdigkeiten/zuckerhut", label: t("zuckerhut") },
                    { href: "/rio-guide/sehenswuerdigkeiten/escadaria-selaron", label: t("escadariaSelaron") },
                    { href: "/rio-guide/sehenswuerdigkeiten/rocinha", label: t("rocinha") },
                    { href: "/rio-guide/sehenswuerdigkeiten/santa-marta", label: t("santaMarta") },
                    { href: "/rio-guide/sehenswuerdigkeiten/the-maze", label: t("theMaze") },
                ],
                allHref: "/rio-guide/sehenswuerdigkeiten",
                allLabel: t("alleAnsehen"),
            },
        ],
        directLinks: [
            { href: "/ist-rio-gefaehrlich", label: t("sicherheit") },
        ],
    },
    { href: "/ueber-will", label: t("ueberUns") },
    { href: "/bewertungen", label: t("bewertungen") },
    { href: "/kontakt", label: t("kontakt") },
    ];
}

/**
 * Estrutura achatada do menu mobile: um único nível de submenu.
 *
 * No desktop o Rio-Guide tem flyout aninhado (Rio-Guide › Sehenswürdigkeiten ›
 * itens), que num celular viraria três toques e dois acordeões para chegar em
 * conteúdo que cabe numa lista só. Aqui os `subGroups` são fundidos com os
 * `directLinks` num único acordeão.
 */
type MobileEntry =
    | { kind: "link"; key: string; label: string; href: string }
    | {
          kind: "group";
          key: string;
          label: string;
          basePath: string;
          items: SubLink[];
          allHref?: string;
          allLabel?: string;
      };

function buildMobileEntries(links: NavLink[], allTourenLabel: string): MobileEntry[] {
    return links.flatMap((link): MobileEntry[] => {
        if (link.subLinks) {
            return [{
                kind: "group",
                key: link.href,
                label: link.label,
                basePath: link.href,
                items: link.subLinks,
                allHref: link.href,
                allLabel: allTourenLabel,
            }];
        }

        // Rio-Guide vai direto para o hub em vez de listar os pontos turísticos.
        // Um ponto turístico é conteúdo de pesquisa: o hub, com foto e contexto,
        // apresenta cada um melhor do que seis linhas de texto num menu — e sem
        // o segundo acordeão o menu inteiro cabe sem rolagem.
        //
        // Não é perda de SEO: o dropdown do desktop renderiza no mesmo HTML, o
        // hub linka os seis, e link repetido para a mesma URL na mesma página
        // não soma equity.
        if (link.subGroups) {
            const hubHref = link.subGroups[0]?.allHref ?? link.subGroups[0]?.href ?? link.href;
            return [
                { kind: "link", key: link.href, label: link.label, href: hubHref },
                // Os directLinks sobem para o primeiro nível: sem o acordeão do
                // Rio-Guide eles ficariam sem casa, e "Ist Rio gefährlich?" é a
                // dúvida nº1 do público — isca de conteúdo, não sub-item.
                ...(link.directLinks ?? []).map((dl): MobileEntry => ({
                    kind: "link",
                    key: dl.href,
                    label: dl.label,
                    href: dl.href,
                })),
            ];
        }

        return [{ kind: "link", key: link.href, label: link.label, href: link.href }];
    });
}

/**
 * Separa o emoji inicial do rótulo ("🏔️ Klassiker Tour") para renderizar num
 * slot de largura fixa. Sem isso cada linha começa num x diferente e a lista
 * perde o eixo de leitura.
 */
const LEADING_EMOJI = /^(\p{Extended_Pictographic}️?)\s*/u;

function splitEmoji(label: string): { emoji: string | null; text: string } {
    const match = label.match(LEADING_EMOJI);
    return match ? { emoji: match[1], text: label.slice(match[0].length) } : { emoji: null, text: label };
}


const MOBILE_MENU_ID = "mobile-nav-panel";

export default function Navbar({ contact: contactProp }: { contact?: ContactUrls }) {
    const t = useTranslations('public.nav');
    const pathname = usePathname();
    const navLinks = buildNavLinks(t);
    const mobileEntries = buildMobileEntries(navLinks, t('alleTourenAnsehen'));

    // Merge por campo: usa o valor do banco quando existir, senão o fallback.
    // Um default de parâmetro só valeria com `contact` undefined — um objeto com
    // strings vazias (miss no banco) anularia o FALLBACK_CONTACT inteiro.
    const pick = (value: string | undefined, fallback: string) => value?.trim() || fallback;
    const contact: ContactUrls = {
        ...FALLBACK_CONTACT,
        ...contactProp,
        phone: pick(contactProp?.phone, FALLBACK_CONTACT.phone),
        phoneHref: contactProp?.phoneHref?.trim() && contactProp.phoneHref.trim() !== 'tel:'
            ? contactProp.phoneHref
            : FALLBACK_CONTACT.phoneHref,
        whatsappHref: pick(contactProp?.whatsappHref, FALLBACK_CONTACT.whatsappHref),
        emailHref: pick(contactProp?.emailHref, FALLBACK_CONTACT.emailHref),
        instagramHref: pick(contactProp?.instagramHref, FALLBACK_CONTACT.instagramHref),
        youtubeHref: pick(contactProp?.youtubeHref, FALLBACK_CONTACT.youtubeHref),
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const panelRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const isActive = useCallback(
        (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)),
        [pathname]
    );

    const isGroupActive = (entry: Extract<MobileEntry, { kind: "group" }>) =>
        isActive(entry.basePath) || entry.items.some((item) => isActive(item.href));

    const activeGroupKey =
        mobileEntries.find((e) => e.kind === "group" && isGroupActive(e))?.key ?? null;

    const closeMenu = useCallback(() => setIsMenuOpen(false), []);

    // Abre já com o grupo da página atual expandido — evita o toque extra para
    // o usuário se localizar.
    const toggleMenu = () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
            return;
        }
        setOpenGroup(activeGroupKey);
        setIsMenuOpen(true);
    };

    // Navegou? O overlay fecha sozinho — cobre o botão "voltar" do navegador,
    // que não passa pelo onClick dos links. Ajuste durante o render (e não num
    // efeito) para não disparar um segundo render em cascata.
    const [lastPathname, setLastPathname] = useState(pathname);
    if (pathname !== lastPathname) {
        setLastPathname(pathname);
        setIsMenuOpen(false);
    }

    // Enquanto aberto: trava o scroll do fundo, prende o foco e escuta Escape.
    useEffect(() => {
        if (!isMenuOpen) return;

        const { body } = document;
        const previousOverflow = body.style.overflow;
        body.style.overflow = "hidden";

        panelRef.current?.focus();

        const focusables = () => {
            const inPanel = panelRef.current
                ? Array.from(
                      panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
                  ).filter((el) => !el.closest("[inert]"))
                : [];
            return toggleRef.current ? [...inPanel, toggleRef.current] : inPanel;
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                toggleRef.current?.focus();
                return;
            }
            if (event.key !== "Tab") return;

            const list = focusables();
            if (list.length === 0) return;

            const first = list[0];
            const last = list[list.length - 1];
            const index = list.indexOf(document.activeElement as HTMLElement);

            if (index === -1) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            } else if (event.shiftKey && index === 0) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && index === list.length - 1) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            body.style.overflow = previousOverflow;
        };
    }, [isMenuOpen]);

    const socials: { href: string; label: string; icon: React.ReactNode }[] = [
        { href: contact.instagramHref, label: "Instagram", icon: <Instagram className="h-[18px] w-[18px]" /> },
        { href: contact.youtubeHref, label: "YouTube", icon: <Youtube className="h-[18px] w-[18px]" /> },
        { href: contact.telegramHref, label: "Telegram", icon: <Send className="h-[16px] w-[16px]" /> },
        { href: contact.emailHref, label: "E-Mail", icon: <Mail className="h-[16px] w-[16px]" /> },
    ].filter((s) => Boolean(s.href));

    return (
        <>
            {/* NAVBAR */}
            <header className="fixed top-0 left-0 right-0 z-[120] bg-white lg:bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="font-heading font-black text-2xl tracking-tight text-rio-green flex items-center gap-2 group relative z-[130] min-w-0"
                        onClick={closeMenu}
                    >
                        <MapPin className="h-7 w-7 shrink-0 text-rio-yellow group-hover:-translate-y-1 transition-transform" />
                        <span className="truncate">Rio<span className="text-rio-blue font-light">FürDeutsche</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex gap-8 items-center" aria-label={t('hauptnavigation')}>
                        {navLinks.map((link) => {
                            if (link.subLinks) {
                                return (
                                    <div key={link.label} className="relative group p-2">
                                        <Link
                                            href={link.href}
                                            className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-rio-green transition-colors duration-200"
                                        >
                                            {link.label}
                                            <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
                                        </Link>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform origin-top translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="py-2">
                                                    {link.subLinks.map((sub, i) => (
                                                        <Link
                                                            key={i}
                                                            href={sub.href}
                                                            className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green transition-colors"
                                                        >
                                                            {sub.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (link.subGroups) {
                                return (
                                    <div key={link.label} className="relative group p-2">
                                        <button
                                            className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-rio-green transition-colors duration-200 cursor-default"
                                        >
                                            {link.label}
                                            <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
                                        </button>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 transform origin-top translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="py-2">
                                                    {link.subGroups.map((group, gi) => (
                                                        <div key={gi} className="relative group/sub">
                                                            <span
                                                                className="flex items-center justify-between px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green transition-colors rounded-t-xl cursor-default"
                                                            >
                                                                {group.label}
                                                                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                                                            </span>
                                                            {/* Flyout opens to the right */}
                                                            <div className="absolute top-0 left-[calc(100%-8px)] w-56 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-[60]">
                                                                <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                                                                    <div className="py-2">
                                                                        {group.items.map((item, ii) => (
                                                                            <Link
                                                                                key={ii}
                                                                                href={item.href}
                                                                                className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green transition-colors"
                                                                            >
                                                                                {item.label}
                                                                            </Link>
                                                                        ))}
                                                                        {group.allHref && (
                                                                            <>
                                                                                <div className="mx-4 my-1 h-px bg-gray-100" />
                                                                                <Link
                                                                                    href={group.allHref}
                                                                                    className="block px-5 py-2.5 text-sm font-medium text-rio-green hover:bg-rio-green/5 transition-colors"
                                                                                >
                                                                                    {group.allLabel} →
                                                                                </Link>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {link.directLinks && link.directLinks.length > 0 && (
                                                        <>
                                                            <div className="mx-4 my-1 h-px bg-gray-100" />
                                                            {link.directLinks.map((dl, i) => (
                                                                <Link
                                                                    key={i}
                                                                    href={dl.href}
                                                                    className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green transition-colors"
                                                                >
                                                                    {dl.label}
                                                                </Link>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="p-2 text-sm font-medium text-gray-700 hover:text-rio-green transition-colors duration-200"
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* No mobile o acesso à conta vive dentro do menu: a variante
                        desktop deste bloco tem ~140px e, somada ao logo, empurrava
                        o hambúrguer para fora do viewport em telas < 430px. */}
                    <div className="hidden lg:flex items-center gap-4">
                        <HeaderAuth />
                    </div>

                    <button
                        ref={toggleRef}
                        className="lg:hidden -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-700 hover:text-rio-green hover:bg-gray-50 transition-colors relative z-[130]"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? t('menueSchliessen') : t('menueOeffnen')}
                        aria-expanded={isMenuOpen}
                        aria-controls={MOBILE_MENU_ID}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </header>

            {/* MENU MOBILE */}
            <div
                id={MOBILE_MENU_ID}
                ref={panelRef}
                tabIndex={-1}
                className={`fixed inset-0 z-[110] lg:hidden bg-white outline-none transition-all duration-300 ease-out ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
                role="dialog"
                aria-modal="true"
                aria-label={t('mobileNavigation')}
                aria-hidden={!isMenuOpen}
                inert={!isMenuOpen}
            >
                <div className="flex h-[100dvh] flex-col pt-20">
                    <nav
                        className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-6"
                        aria-label={t('mobileNavigation')}
                    >
                        <ul className="flex flex-col">
                            {mobileEntries.map((entry) => {
                                if (entry.kind === "link") {
                                    const active = isActive(entry.href);
                                    return (
                                        <li key={entry.key}>
                                            <Link
                                                href={entry.href}
                                                onClick={closeMenu}
                                                aria-current={active ? "page" : undefined}
                                                className={`flex h-14 items-center rounded-xl px-3 text-lg font-bold transition-colors ${active ? "bg-rio-green/10 text-rio-green" : "text-gray-900 active:bg-gray-50"}`}
                                            >
                                                {entry.label}
                                            </Link>
                                        </li>
                                    );
                                }

                                const open = openGroup === entry.key;
                                const active = isGroupActive(entry);

                                return (
                                    <li key={entry.key}>
                                        {/* A linha inteira é um único alvo: no menu antigo o
                                            rótulo navegava e só o chevron expandia, dois destinos
                                            no mesmo item sem nada que os diferenciasse. */}
                                        <button
                                            type="button"
                                            onClick={() => setOpenGroup(open ? null : entry.key)}
                                            aria-expanded={open}
                                            aria-controls={`${MOBILE_MENU_ID}-${entry.key}`}
                                            className={`flex h-14 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-lg font-bold transition-colors active:bg-gray-50 ${active ? "text-rio-green" : "text-gray-900"}`}
                                        >
                                            <span>{entry.label}</span>
                                            <ChevronDown
                                                className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? "-rotate-180 text-rio-green" : "text-gray-400"}`}
                                            />
                                        </button>

                                        {/* grid-rows 0fr→1fr anima até a altura real do conteúdo;
                                            o max-h fixo de antes cortava a lista se ela crescesse. */}
                                        <div
                                            id={`${MOBILE_MENU_ID}-${entry.key}`}
                                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                                        >
                                            <div className="overflow-hidden" inert={!open}>
                                                <ul className="ml-3 flex flex-col border-l border-gray-100 pb-2 pl-3">
                                                    {entry.items.map((item) => {
                                                        const { emoji, text } = splitEmoji(item.label);
                                                        const itemActive = isActive(item.href);
                                                        return (
                                                            <li key={item.href}>
                                                                <Link
                                                                    href={item.href}
                                                                    onClick={closeMenu}
                                                                    aria-current={itemActive ? "page" : undefined}
                                                                    className={`flex min-h-12 items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] transition-colors active:bg-gray-50 ${itemActive ? "font-bold text-rio-green" : "font-medium text-gray-600"}`}
                                                                >
                                                                    {emoji && (
                                                                        <span aria-hidden="true" className="w-6 shrink-0 text-center text-base leading-none">
                                                                            {emoji}
                                                                        </span>
                                                                    )}
                                                                    <span>{text}</span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}

                                                    {entry.allHref && (
                                                        <li>
                                                            <Link
                                                                href={entry.allHref}
                                                                onClick={closeMenu}
                                                                className="flex min-h-12 items-center gap-1 rounded-lg px-2 py-2.5 text-[15px] font-bold text-rio-green active:bg-rio-green/5"
                                                            >
                                                                {entry.allLabel}
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Link>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Área de membros: bloco à parte, não é navegação do site */}
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <HeaderAuth isMobile onItemClick={closeMenu} />
                        </div>
                    </nav>

                    {/* Rodapé fixo — zona de alcance do polegar */}
                    <div className="shrink-0 border-t border-gray-100 bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        {contact.whatsappHref && (
                            <a
                                href={contact.whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeMenu}
                                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] text-base font-bold text-white shadow-lg shadow-[#25D366]/25 transition-transform active:scale-[0.99]"
                            >
                                <WhatsAppIcon className="h-5 w-5" />
                                {t('whatsappSchreiben')}
                            </a>
                        )}

                        {socials.length > 0 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {socials.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                                        rel="noopener noreferrer"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-rio-green"
                                    >
                                        {social.icon}
                                        <span className="sr-only">{social.label}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
