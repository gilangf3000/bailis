# Bailis

Bailis adalah library WebSocket ringan untuk berinteraksi dengan WhatsApp Web (fork dari Baileys). Dokumentasi ini versi Bahasa Indonesia dan berfokus pada penggunaan praktis yang paling sering dipakai.

## Instalasi

Dengan npm:

```bash
npm i @gilangf3000/bailis
```

Dengan yarn:

```bash
yarn add @gilangf3000/bailis
```

## Quick Start

```ts
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@gilangf3000/bailis'

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
  })

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode
      if (statusCode !== DisconnectReason.loggedOut) {
        startSock()
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

startSock()
```

## Autentikasi

Gunakan `useMultiFileAuthState` untuk menyimpan kredensial secara aman dan mudah:

```ts
import { useMultiFileAuthState } from '@gilangf3000/bailis'

const { state, saveCreds } = await useMultiFileAuthState('auth')
```

## In-Memory Store

Bailis menyediakan store in-memory (mirip Baileys upstream) untuk menyimpan chat, kontak, pesan, metadata grup, label, dll.

```ts
import makeWASocket, { makeInMemoryStore } from '@gilangf3000/bailis'

const store = makeInMemoryStore({})
store.readFromFile('./baileys_store.json')

setInterval(() => {
  store.writeToFile('./baileys_store.json')
}, 10_000)

const sock = makeWASocket({ /* config */ })
store.bind(sock.ev)
```

### Catatan penting
- Store hanya menyimpan data yang pernah diterima oleh socket atau dibaca dari file.
- Untuk history lengkap, pastikan `syncFullHistory: true` dan `shouldSyncHistoryMessage: () => true`.

## History Sync

History akan masuk lewat event `messaging-history.set`.

```ts
const sock = makeWASocket({
  // ...
  syncFullHistory: true,
  shouldSyncHistoryMessage: () => true,
})
```

## Kirim Pesan

```ts
await sock.sendMessage('62812xxxx@s.whatsapp.net', { text: 'Halo!' })
```

## Ambil Pesan dari Store

```ts
const msgs = await store.loadMessages('62812xxxx@s.whatsapp.net', 25)
console.log(msgs)
```

## Event Penting

- `connection.update`
- `creds.update`
- `messaging-history.set`
- `messages.upsert`
- `messages.update`
- `messages.delete`
- `chats.upsert`, `chats.update`, `chats.delete`
- `contacts.upsert`, `contacts.update`
- `presence.update`
- `messages.reaction`
- `message-receipt.update`

## Media

Untuk upload/download media, gunakan helper di `Utils`. Contoh umum:

```ts
import { downloadMediaMessage } from '@gilangf3000/bailis'

const buffer = await downloadMediaMessage(msg, 'buffer')
```

## Troubleshooting

- Jika login gagal, hapus folder auth lalu login ulang.
- Jika sering disconnect, gunakan `fetchLatestBaileysVersion()` dan update versi.
- Hindari menyimpan semua history di memori jika skala besar, gunakan database sendiri.

## Build

```bash
npm run build
```

Bailis mendukung build ESM dan CJS:
- ESM: `lib/index.js`
- CJS: `lib/cjs/index.js`

## Lisensi

MIT
