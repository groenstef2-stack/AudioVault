# Discord Ticket & Review Bot

Een bot met:
- 🎫 **Ticket systeem** — gebruikers klikken op een knop en krijgen een privé kanaal
- ⭐ **`/review`** — plaatst een review met sterren-rating in een reviews-kanaal
- 🔌 Alvast voorbereid om reviews door te sturen naar je **Base44** website via een webhook

---

## Stap 1 — Bot aanmaken in het Discord Developer Portal

1. Ga naar https://discord.com/developers/applications
2. Klik **New Application**, geef een naam, klik **Create**.
3. Ga naar het tabblad **Bot** (links) → **Reset Token** → kopieer het token.
   Dit is je `DISCORD_TOKEN`. **Deel dit nooit met iemand.**
4. Scroll naar **Privileged Gateway Intents** en zet **Server Members Intent**
   aan (nodig voor de welkomstberichten bij nieuwe leden). Klik **Save Changes**.
   Zonder dit aan te zetten start de bot niet op zodra je de nieuwste code draait.
5. Ga naar het tabblad **General Information** → kopieer de **Application ID**.
   Dit is je `CLIENT_ID`.

## Stap 2 — Bot uitnodigen op je server

1. Ga naar het tabblad **OAuth2 → URL Generator**.
2. Vink bij **Scopes** aan: `bot` en `applications.commands`.
3. Vink bij **Bot Permissions** aan: `Manage Channels`, `Send Messages`,
   `Read Message History`, `Embed Links`, `View Channels`.
4. Kopieer de gegenereerde URL onderaan, open die in je browser en kies je server.

## Stap 3 — Server-ID's verzamelen

Zet in Discord **Instellingen → Geavanceerd → Ontwikkelaarsmodus** aan.
Klik daarna steeds met de rechtermuisknop en kies **Kopieer ID**:

- Rechtsklik je **server icoon** → `GUILD_ID`
- Rechtsklik de **categorie** waarin tickets moeten komen (maak er eerst een aan,
  bijv. "Tickets") → `TICKET_CATEGORY_ID`
- Rechtsklik de **rol** die tickets mag behandelen (bijv. "Support") →
  `SUPPORT_ROLE_ID`
- Rechtsklik het **kanaal** waar reviews moeten verschijnen → `REVIEW_CHANNEL_ID`
- (optioneel) Rechtsklik een **logkanaal** → `TICKET_LOG_CHANNEL_ID`

## Stap 4 — Project instellen

1. Zorg dat [Node.js](https://nodejs.org) versie 18 of hoger is geïnstalleerd
   (`node -v` in je terminal om te checken).
2. Open een terminal in deze projectmap en installeer de dependencies:
   ```
   npm install
   ```
3. Kopieer `.env.example` naar een nieuw bestand genaamd `.env`:
   ```
   cp .env.example .env
   ```
4. Open `.env` en vul alle waarden in die je in stap 1 en 3 hebt verzameld.

## Stap 5 — Slash commands registreren

Elke keer dat je een command toevoegt of wijzigt, moet je dit opnieuw draaien:
```
npm run deploy
```
Je zou moeten zien: `✅ 2 command(s) succesvol geregistreerd.`

## Stap 6 — Bot starten

```
npm start
```
Als alles goed gaat zie je: `✅ Ingelogd als JouwBotNaam#1234`

## Stap 7 — Ticket-paneel plaatsen

Typ in het kanaal waar je het ticket-paneel wilt, als admin:
```
/setup-tickets
```
Er verschijnt een bericht met twee knoppen:
- **🎫 Open Support Ticket** — voor algemene vragen/problemen
- **💼 Work For Us** — voor sollicitaties

Elke gebruiker die op een knop klikt krijgt een eigen privé kanaal aangemaakt
(`ticket-gebruikersnaam` of `application-gebruikersnaam`), zichtbaar voor
henzelf, de bot en de support-rol, met een passend welkomstbericht. In dat
kanaal kan iedereen met voldoende rechten op **"Close Ticket"** klikken om het
kanaal na 5 seconden te verwijderen (en optioneel te loggen in je logkanaal).

## Stap 8 — Reviews plaatsen

Iedereen kan overal typen:
```
/review rating:5 message:Great service, helped me super fast!
```
De review verschijnt als nette embed (met sterren) in je `REVIEW_CHANNEL_ID`.

## Stap 9 — Eigen embed-berichten sturen (alleen admins)

Typ, als admin:
```
/embed channel:#aankondigingen
```
Er verschijnt een formulier waarin je titel, tekst, kleur, afbeelding-URL en
footer kunt invullen. Na verzenden plaatst de bot het bericht direct in het
gekozen kanaal. Alleen mensen met "Manage Server"-rechten zien dit commando
en kunnen het gebruiken.

## Stap 10 — Welkomstberichten

Zodra je `WELCOME_CHANNEL_ID` in je `.env` (of Railway Variables) hebt
ingevuld, stuurt de bot automatisch een welkomstbericht naar dat kanaal zodra
iemand nieuw de server binnenkomt. Vergeet niet **Server Members Intent** aan
te zetten in het Developer Portal (zie Stap 1) — zonder dat werkt dit niet.

---

## Koppeling met je Base44-website (later)

De code in `commands/review.js` heeft al een stukje klaarstaan: zodra je in
`.env` een `BASE44_WEBHOOK_URL` invult, stuurt de bot bij elke review ook
automatisch een POST-request met JSON data (`user`, `rating`, `message`, `createdAt`)
naar die URL. Je hoeft dan alleen in Base44 een endpoint/workflow te maken die
die JSON opslaat in je database — de botcode hoeft dan niet meer aangepast te
worden. Laat het weten zodra je zover bent, dan help ik je de Base44-kant
(en eventueel de exacte payload-vorm) verder in te richten.

---

## PostgreSQL database toevoegen (Railway)

Elke review en elk ticket wordt automatisch ook opgeslagen in een database, náást de
Discord-berichten — handig als backup, voor eigen statistieken, en als tussenstap
richting je Base44-website.

1. Open je project in Railway (niet de service, het hele project).
2. Klik **+ New** → **Database** → **Add PostgreSQL**.
3. Railway maakt de database aan en zet automatisch een `DATABASE_URL` variabele
   klaar. **Belangrijk:** dit gebeurt in een aparte "Postgres" service — je moet 'm
   nog delen met je bot-service.
4. Ga naar je **bot-service** → tabblad **Variables** → **New Variable** →
   gebruik de "Reference"-optie (of typ `${{Postgres.DATABASE_URL}}` als waarde,
   Railway vult 'm dan automatisch aan met de echte connectiegegevens).
5. De bot maakt bij het opstarten automatisch de benodigde tabellen aan
   (`reviews` en `tickets`) — je hoeft zelf niks aan te maken.
6. Check in de Railway logs of je ziet staan:
   `✅ Database tabellen zijn klaar (reviews, tickets).`

Zonder `DATABASE_URL` blijft de bot gewoon werken (alleen Discord-embeds, geen
database-opslag) — dit is dus volledig optioneel.

### Data bekijken
Klik in Railway op je Postgres-service → tabblad **Data** om je tabellen en
opgeslagen reviews/tickets direct in de browser te bekijken, of verbind met een
tool als [TablePlus](https://tableplus.com/) of [DBeaver](https://dbeaver.io/)
via de connectiegegevens die Railway toont.

### Koppeling met Base44
Base44 gebruikt zelf een ingebouwde database en ondersteunt momenteel geen
rechtstreekse externe Postgres-koppeling. Daarom blijft de `BASE44_WEBHOOK_URL`
(hierboven) de aanbevolen weg om reviews ook op je website te krijgen: de
Postgres-database is voor jouw eigen data/backup, de webhook stuurt dezelfde
review-data naar Base44 zodra jij daar een endpoint voor hebt ingericht.

---

## Waar host je de bot? (advies)

Voor nu draai je de bot prima lokaal op je eigen pc met `npm start` — handig
om te testen. Let op: zodra je je terminal sluit, stopt de bot ook.

Voor 24/7 online:
- **Railway.app** of **Render.com** — makkelijkste start, gratis/goedkope tier,
  je pusht de code (bijv. via GitHub) en zij draaien `npm start` voor je.
- **Een goedkope VPS** (bijv. Hetzner, DigitalOcean, Contabo) — meer controle,
  iets technischer. Je draait de bot dan met een process manager als
  [PM2](https://pm2.keymetrics.io/) zodat hij automatisch herstart bij een crash
  of server-reboot: `npm install -g pm2` → `pm2 start index.js --name discord-bot`.

Zeg maar welke richting je op wilt, dan loop ik met je door de exacte
deploy-stappen heen.

---

## Bestandenoverzicht

```
discord-bot/
├── index.js               # Hoofdbestand: start de bot, verwerkt commands, knoppen & modals
├── deploy-commands.js      # Registreert de slash commands bij Discord
├── tickets.js              # Logica voor ticket aanmaken/sluiten (support + work)
├── welcome.js              # Welkomstbericht voor nieuwe leden
├── db.js                   # PostgreSQL connectie en queries
├── commands/
│   ├── review.js            # /review command
│   ├── setup-tickets.js     # /setup-tickets command
│   └── embed.js              # /embed command (admin only)
├── .env.example             # Voorbeeld van benodigde instellingen
├── .env                      # (zelf aanmaken, nooit delen!)
└── package.json
```
