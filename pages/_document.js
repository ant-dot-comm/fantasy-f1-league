import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/fav.png" />
        <title>Fantasy F1 League</title>

        {/* Meta tags for SEO */}
        <meta name="description" content="Fantasy F1 League - Make your picks and compete for the title!" />
        <meta name="keywords" content="Formula 1, Fantasy, F1, Racing, Motorsport" />
        <meta name="author" content="Fantasy F1 League" />

        {/* Open Graph (Facebook) */}
        <meta property="og:title" content="Fantasy F1 League" />
        <meta property="og:description" content="Pick your drivers, score points, and compete with friends!" />
        <meta property="og:image" content="/social-media-meta.png" />
        <meta property="og:url" content="https://fantasy-f1-league.vercel.app" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fantasy F1 League" />
        <meta name="twitter:description" content="Join the best Fantasy F1 League and prove your racing strategy skills!" />
        <meta name="twitter:image" content="/social-media-meta.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}