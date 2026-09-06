import { getSettings, buildContactUrls } from "@/lib/settings";

/**
 * llms.txt dinâmico. Era um arquivo estático em public/, que tinha um
 * WhatsApp hardcoded ERRADO (+57..., número colombiano) — exatamente o bug
 * que a regra "contato sempre via settings" do CLAUDE.md existe pra impedir.
 * Como rota, o contato vem de getSettings()/buildContactUrls() como em todo
 * o resto do site, e a lista de páginas vive no código, versionada.
 *
 * Revalida a cada hora: o conteúdo só muda em deploy ou quando o Will edita
 * o contato no /admin/configuracoes.
 */
export const revalidate = 3600;

export async function GET() {
    const settings = await getSettings();
    const c = buildContactUrls(settings);

    const kontakt = [
        "- Website: https://riofuerdeutsche.de",
        c.whatsappHref ? `- WhatsApp: ${c.whatsappHref}` : null,
        c.emailHref ? `- E-Mail: ${c.emailHref.replace("mailto:", "")}` : null,
        c.instagramHref ? `- Instagram: ${c.instagramHref}` : null,
        c.youtubeHref ? `- YouTube: ${c.youtubeHref}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    const text = `# Rio für Deutsche

> Deutschsprachiger Reiseführer und lokaler Guide für Rio de Janeiro. Geführte Touren, Sicherheitstipps und Insider-Wissen für deutsche Touristen, von einem echten Carioca, der fließend Deutsch spricht.

Rio für Deutsche (riofuerdeutsche.de) ist eine deutschsprachige Reiseplattform für Rio de Janeiro, betrieben von Will, einem gebürtigen Carioca mit langjähriger Erfahrung in Deutschland (Köln). Das Angebot richtet sich ausschließlich an deutschsprachige Reisende.

## Angebote

- Geführte Stadtführungen und Touren in Rio de Janeiro auf Deutsch
- Klassiker Tour: Corcovado, Zuckerhut, Ipanema und mehr
- Favela Tour: respektvoller Einblick in Rocinha und Santa Marta
- Natur & Strände: Tijuca-Regenwald, Pedra da Gávea, versteckte Strände
- Karneval Tour: Sambódromo, Blocos de Rua, authentisches Karnevalserlebnis
- Rio by Night: Lapa, Samba, Leblon
- Kultur & Geschichte: historisches Centro, Museen, Santa Teresa
- Fußball Tour: Maracanã, brasilianische Fußballkultur
- Sport & Abenteuer: Paragliding, Surfen, Stand-up Paddle
- Tagesausflüge: Búzios, Ilha Grande, Paraty, Petrópolis
- Individuelle Touren: maßgeschneiderte Programme auf Anfrage
- Flughafen-Transfer: vom Flughafen direkt zur Unterkunft
- Reiseplanung zur FIFA Frauen-WM 2027 in Rio (Eröffnung und Finale im Maracanã)

## Frauen-WM 2027 in Brasilien

Die FIFA Frauen-Weltmeisterschaft 2027 findet vom 24. Juni bis 25. Juli 2027 in acht brasilianischen Städten statt. Eröffnungsspiel und Finale werden im Maracanã in Rio de Janeiro ausgetragen. Rio für Deutsche begleitet deutschsprachige Fans vor Ort: Spieltage, spielfreie Tage, Unterkunft, Transfer und Sicherheit. Die Auslosung der Gruppen findet am 11. Dezember 2026 in Rio statt.

## Zielgruppe

Deutschsprachige Touristen (Deutschland, Österreich, Schweiz), die Rio de Janeiro sicher, authentisch und auf Deutsch erleben möchten.

## Alleinstellungsmerkmale

- Einziger deutschsprachiger Guide, der als echter Carioca geboren wurde
- Vier Jahre in Köln gelebt, versteht deutsche Mentalität und Reisegewohnheiten
- Sicherheit als primärer Differenzierungsfaktor (größte Barriere für deutsche Touristen)
- Persönliche, private Touren, kein Massentourismus

## Seiten

- Homepage: https://riofuerdeutsche.de
- Alle Touren im Überblick: https://riofuerdeutsche.de/touren
- Klassiker Tour: https://riofuerdeutsche.de/touren/klassiker
- Favela Tour: https://riofuerdeutsche.de/touren/favela-tour
- Natur & Strände: https://riofuerdeutsche.de/touren/natur-und-straende
- Karneval Tour: https://riofuerdeutsche.de/touren/karneval-tour
- Rio by Night: https://riofuerdeutsche.de/touren/by-night
- Kultur & Geschichte: https://riofuerdeutsche.de/touren/kultur-und-geschichte
- Fußball Tour: https://riofuerdeutsche.de/touren/fussball
- Sport & Abenteuer: https://riofuerdeutsche.de/touren/sport-und-abenteuer
- Tagesausflüge: https://riofuerdeutsche.de/touren/tagesausfluege
- Regentage in Rio: https://riofuerdeutsche.de/touren/regentage
- Individuelle Tour: https://riofuerdeutsche.de/touren/individuell
- Flughafen-Transfer: https://riofuerdeutsche.de/touren/flughafen-transfer
- Frauen-WM 2027 (Übersicht): https://riofuerdeutsche.de/frauen-wm-2027
- Frauen-WM 2027 in Rio de Janeiro: https://riofuerdeutsche.de/frauen-wm-2027/rio-de-janeiro
- Spielplan der Frauen-WM 2027: https://riofuerdeutsche.de/frauen-wm-2027/spielplan
- Stadien & Spielorte der Frauen-WM 2027: https://riofuerdeutsche.de/frauen-wm-2027/stadien
- Rio-Guide Sehenswürdigkeiten: https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten
- Maracanã: https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/maracana
- Ist Rio gefährlich?: https://riofuerdeutsche.de/rio-guide/sicherheit/ist-rio-gefaehrlich
- Bewertungen: https://riofuerdeutsche.de/bewertungen
- Tour-Anfrage: https://riofuerdeutsche.de/anfrage
- Kontakt: https://riofuerdeutsche.de/kontakt

## Kontakt

${kontakt}
`;

    return new Response(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
