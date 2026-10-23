<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#F5F4EF">
        <meta name="description" content="SponsorIn mempertemukan event organizer dan sponsor lewat data audiens berlabel, paket sponsorship terstruktur, dan proses kerja sama yang tercatat.">

        <title>SponsorIn — Ruang kerja sponsorship untuk sponsor dan EO</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700&display=swap" rel="stylesheet">

        <!-- Styles / Scripts -->
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --color-background:        #F5F4EF;
                    --color-background-muted:  #E7E8DF;
                    --color-surface:           #FFFFFF;
                    --color-primary:           #75836A;
                    --color-primary-soft:      #AAB49D;
                    --color-primary-strong:    #5f6e55;
                    --color-text:              #343B32;
                    --color-text-secondary:    #777B72;
                    --color-text-muted:        #92958B;
                    --color-border:            #DEDFD5;
                    --color-hover:             #ECEDE5;
                    --font-sans: 'Plus Jakarta Sans', Inter, ui-sans-serif, system-ui, sans-serif;
                }

                html { -webkit-text-size-adjust: 100%; }

                body {
                    min-height: 100vh;
                    background-color: var(--color-background);
                    color: var(--color-text);
                    font-family: var(--font-sans);
                    line-height: 1.6;
                    -webkit-font-smoothing: antialiased;
                    text-rendering: optimizeLegibility;
                }

                /* Layout */
                .page {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }

                .container {
                    width: 100%;
                    max-width: 1152px;
                    margin-inline: auto;
                    padding-inline: 20px;
                }

                /* Header */
                header {
                    border-bottom: 1px solid var(--color-border);
                    background-color: color-mix(in srgb, var(--color-background) 95%, transparent);
                    backdrop-filter: blur(8px);
                }

                .header-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 60px;
                }

                /* Logo */
                .logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }

                .logo-mark {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 28px;
                    width: 28px;
                    border-radius: 7px;
                    border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
                    background-color: var(--color-background-muted);
                }

                .logo-mark-inner {
                    height: 12px;
                    width: 12px;
                    border-radius: 3px;
                    border: 1px solid color-mix(in srgb, var(--color-primary-strong) 80%, transparent);
                }

                .logo-mark-dot {
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    height: 6px;
                    width: 6px;
                    border-radius: 50%;
                    background-color: var(--color-primary-strong);
                }

                .logo-text {
                    font-size: 16px;
                    font-weight: 600;
                    letter-spacing: -0.02em;
                    color: var(--color-text);
                }

                .logo-accent { color: var(--color-primary-strong); }

                /* Nav auth links */
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    height: 36px;
                    padding-inline: 14px;
                    border-radius: 10px;
                    border: 1px solid transparent;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: background-color 150ms, color 150ms, border-color 150ms;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .btn-primary {
                    background-color: var(--color-primary-strong);
                    color: #fff;
                    border-color: var(--color-primary-strong);
                }
                .btn-primary:hover { background-color: #52614a; }

                .btn-ghost {
                    color: var(--color-text-secondary);
                    background-color: transparent;
                    border-color: transparent;
                }
                .btn-ghost:hover { color: var(--color-text); background-color: var(--color-hover); }

                /* Hero */
                .hero {
                    padding-top: 80px;
                    padding-bottom: 80px;
                }

                .hero-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-primary-strong);
                }

                .hero h1 {
                    margin-top: 20px;
                    font-size: clamp(2.25rem, 5vw, 3.75rem);
                    font-weight: 700;
                    line-height: 1.07;
                    letter-spacing: -0.045em;
                    color: var(--color-text);
                    max-width: 680px;
                }

                .hero p {
                    margin-top: 24px;
                    font-size: 17px;
                    line-height: 1.65;
                    color: var(--color-text-secondary);
                    max-width: 520px;
                }

                .hero-cta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 16px;
                    margin-top: 36px;
                }

                .hero-cta .btn { height: 48px; padding-inline: 22px; font-size: 15px; }

                .link-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    text-decoration: underline;
                    text-decoration-color: var(--color-border);
                    text-underline-offset: 4px;
                }
                .link-text:hover { color: var(--color-text); }

                /* Trust row */
                .trust-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid var(--color-border);
                    font-size: 13px;
                    color: var(--color-text-secondary);
                }

                .trust-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .check-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                    color: var(--color-primary-strong);
                }

                /* CTA card */
                .cta-card {
                    margin-top: 4px;
                    margin-bottom: 40px;
                    border: 1px solid var(--color-border);
                    border-radius: 14px;
                    background-color: var(--color-surface);
                    padding: 36px 28px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                    align-items: center;
                    justify-content: space-between;
                }

                .cta-card h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    letter-spacing: -0.02em;
                    color: var(--color-text);
                    line-height: 1.3;
                }

                .cta-card p {
                    margin-top: 8px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--color-text-secondary);
                }

                .cta-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .btn-outline {
                    background-color: var(--color-surface);
                    color: var(--color-text);
                    border-color: var(--color-border);
                }
                .btn-outline:hover { background-color: var(--color-hover); }

                @media (max-width: 640px) {
                    .trust-row { grid-template-columns: 1fr; }
                    .cta-card { flex-direction: column; }
                }
            </style>
        @endif
    </head>
    <body>
        <div class="page">
            <header>
                <div class="container header-inner">
                    <a href="/" class="logo">
                        <span class="logo-mark">
                            <span class="logo-mark-inner"></span>
                            <span class="logo-mark-dot"></span>
                        </span>
                        <span class="logo-text">Sponsor<span class="logo-accent">In</span></span>
                    </a>

                    @if (Route::has('login'))
                        <div class="nav-links">
                            @auth
                                <a href="{{ url('/dashboard') }}" class="btn btn-primary">Ruang kerja</a>
                            @else
                                <a href="{{ route('login') }}" class="btn btn-ghost">Masuk</a>
                                @if (Route::has('register'))
                                    <a href="{{ route('register') }}" class="btn btn-primary">Daftar</a>
                                @endif
                            @endauth
                        </div>
                    @endif
                </div>
            </header>

            <main style="flex:1">
                <section class="hero">
                    <div class="container">
                        <p class="hero-label">Ruang kerja sponsorship untuk sponsor dan EO</p>
                        <h1>Temukan peluang yang bisa diperiksa sebelum disetujui.</h1>
                        <p>
                            SponsorIn menyusun data audiens, paket sponsorship, profil EO, dan riwayat
                            kerja sama sebagai satu berkas yang jelas. Bukan kumpulan klaim tanpa sumber.
                        </p>
                        <div class="hero-cta">
                            <a href="/events" class="btn btn-primary">
                                Telusuri peluang
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </a>
                            <a href="#cara-kerja" class="link-text">Lihat cara kerja</a>
                        </div>
                        <div class="trust-row">
                            <span class="trust-item">
                                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                                Sumber data audiens
                            </span>
                            <span class="trust-item">
                                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                                Status verifikasi
                            </span>
                            <span class="trust-item">
                                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                                Persetujuan dua pihak
                            </span>
                        </div>
                    </div>
                </section>

                <section class="container">
                    <div class="cta-card">
                        <div>
                            <h2>Mulai dari satu berkas yang bisa dibaca.</h2>
                            <p>Daftar sebagai sponsor atau EO. Verifikasi dan profil dibangun bertahap.</p>
                        </div>
                        <div class="cta-buttons">
                            @if (Route::has('register'))
                                <a href="{{ route('register') }}?role=sponsor" class="btn btn-primary" style="height:44px;padding-inline:18px;font-size:14px;">Daftar sebagai sponsor</a>
                                <a href="{{ route('register') }}?role=eo" class="btn btn-outline" style="height:44px;padding-inline:18px;font-size:14px;">Daftar sebagai EO</a>
                            @endif
                        </div>
                    </div>
                </section>
            </main>

            <footer style="border-top:1px solid var(--color-border); padding:20px; text-align:center; font-size:12px; color:var(--color-text-muted);">
                SponsorIn · MVP
            </footer>
        </div>
    </body>
</html>
