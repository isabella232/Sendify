import { AppShell } from '@mantine/core';
import { Web3Provider } from './providers/Web3Provider';
import { Topbar } from './components/Topbar';
import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';
import { HashRouter as Router, Route, Routes } from "react-router-dom"

import '@mantine/notifications/styles.css';
import "@mantine/core/styles.css"
import "./App.css"

import { Send } from './components/Send';
import { Notifications } from '@mantine/notifications';

const myColor: MantineColorsTuple = [
  '#eafcea',
  '#daf1dc',
  '#b9e1bb',
  '#94cf97',
  '#74c079',
  '#60b765',
  '#55b25a',
  '#449c4a',
  '#3a8c3f',
  '#2b7833'
];

const theme = createTheme({
  colors: {
    primary: myColor,
  },
  primaryColor: "primary",
});

export function App() {
  return (
    <Web3Provider>
      <MantineProvider theme={theme}>
        <Router>
          <AppShell
            header={{ height: 62 }}
          >
            <AppShell.Header >
              <div style={{ margin: "0 2rem" }}>
                <Topbar />
              </div>
            </AppShell.Header>
            <AppShell.Main style={{
              textAlign: "left",
              width: "100%",
              padding: "5rem",
            }}>
              <Routes>
                <Route path="/" element={<Send />} />
              </Routes>
            </AppShell.Main>
            <Notifications
              style={{
                marginTop: 62,
              }}
              autoClose={10000}
              position='top-right'
            />
          </AppShell>
        </Router>
      </MantineProvider>
    </Web3Provider> 
  );
}