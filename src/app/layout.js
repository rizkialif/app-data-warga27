import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import AppTokenHandler from '@/components/AppTokenHandler'

export const metadata = {
  title: 'CRM 027',
  description: 'A modern CRM for resident management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AntdRegistry>
          <AppTokenHandler />
          {children}
        </AntdRegistry>
      </body>
    </html>
  )
}
