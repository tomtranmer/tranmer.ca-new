import '../styles/globals.css';
import Script from 'next/script';
import type { AppProps } from 'next/app';

const GTAG = "G-QWBVMVN2LM";        // Appstravaganza Analytics

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GTAG}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GTAG}');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
