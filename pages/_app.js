import "@/styles/globals.css";
import { Belanosima, Geologica } from "next/font/google";

const belanosima = Belanosima({ 
  subsets: ["latin"], 
  weight: ["400", "700"],
  variable: "--font-belanosima"
});
const geologica = Geologica({ 
  subsets: ["latin"], 
  weight: ["400", "700"] ,
  variable: "--font-paragraph"
});


export default function App({ Component, pageProps }) {
  return <div className={`${geologica.className} ${belanosima.className}`}><Component {...pageProps} /></div>;
}
