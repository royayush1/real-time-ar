import DeviceRestriction from './components/DeviceRestriction';
import './globals.css';

export const metadata = {
  title: "AR Game",
  description: "An AR Game showing my skills in machine learning"
}

export default function RootLayout({children} : {children: React.ReactNode}) {
  return(
    <html lang='en' >
      <head>
        <meta name='viewport' content="width=device-width, initial-scale=1, maximum-scale=1"/>
      </head>
      <body>
        <DeviceRestriction>
          <main>{children}</main>
        </DeviceRestriction>
      </body>
    </html>
  );
}
