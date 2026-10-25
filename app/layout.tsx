import type { Metadata } from 'next';
export const metadata: Metadata = { title:'回声 ECHO · 让经历成为创造的起点',description:'从私人札记、过往经历与历史启发中，找到自己的创作方向。',icons:{icon:'/echo/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="zh-CN"><body>{children}</body></html>; }
