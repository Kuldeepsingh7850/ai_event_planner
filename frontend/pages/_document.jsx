import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="description" content="AI-Powered Event Planner and Organizer. Automate timelines, budgets, and recommendations with Groq, Grok, or Gemini AI." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased bg-[#0d0f14] text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
