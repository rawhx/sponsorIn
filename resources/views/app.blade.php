<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#F5F4EF">
        <meta name="description" content="SponsorIn mempertemukan event organizer dan sponsor lewat data audiens berlabel, paket sponsorship terstruktur, dan proses kerja sama yang tercatat.">
        <title inertia>{{ config('app.name', 'SponsorIn') }}</title>

        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
