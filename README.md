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
4. Scroll naar **Privileged Gateway Intents** — voor deze bot hoef je niks aan te
   vinken (we gebruiken alleen slash commands en knoppen).
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
Er verschijnt een bericht met een knop **"Open Ticket"**. Elke gebruiker die
erop klikt krijgt een eigen privé kanaal (`ticket-gebruikersnaam`) aangemaakt,
zichtbaar voor henzelf, de bot en de support-rol. In dat kanaal kan iedereen
met voldoende rechten op **"Sluit Ticket"** klikken om het kanaal na 5 seconden
te verwijderen (en optioneel te loggen in je logkanaal).

## Stap 8 — Reviews plaatsen

Iedereen kan overal typen:
```
/review rating:5 bericht:Top service, heel snel geholpen!
```
De review verschijnt als nette embed (met sterren) in je `REVIEW_CHANNEL_ID`.

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
├── index.js              # Hoofdbestand: start de bot, verwerkt commands & knoppen
├── deploy-commands.js     # Registreert de slash commands bij Discord
├── tickets.js             # Logica voor ticket aanmaken/sluiten
├── commands/
│   ├── review.js          # /review command
│   └── setup-tickets.js   # /setup-tickets command
├── .env.example           # Voorbeeld van benodigde instellingen
├── .env                    # (zelf aanmaken, nooit delen!)
└── package.json
```
