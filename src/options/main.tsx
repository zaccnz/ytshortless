import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App';
import { ConfigProvider } from '@/ConfigProvider';
import '@/style.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ConfigProvider>
            <App />
        </ConfigProvider>
    </React.StrictMode>,
)
