import { Boom } from '@hapi/boom'
import NodeCache from '@cacheable/node-cache'
import readline from 'readline'
import makeWASocket, { AnyMessageContent, BinaryInfo, CacheStore, delay, DisconnectReason, downloadAndProcessHistorySyncNotification, encodeWAM, fetchLatestBaileysVersion, getAggregateVotesInPollMessage, getHistoryMsg, isJidNewsletter, jidDecode, makeCacheableSignalKeyStore, normalizeMessageContent, PatchedMessageWithRecipientJID, proto, useMultiFileAuthState, WAMessageContent, WAMessageKey } from '../src'
//import MAIN_LOGGER from '../src/Utils/logger'
import open from 'open'
import fs from 'fs'
import P from 'pino'
import dns from 'dns'
import express from 'express'
import cors from 'cors'
import multer from 'multer'

const app = express()
app.use(cors())
app.use(express.json())
const upload = multer({ dest: 'uploads/' })

let globalSock: ReturnType<typeof makeWASocket> | null = null;

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/Example/ui.html')
})

app.post('/api/send-message', async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const { jid, text } = req.body
    await globalSock.sendMessage(jid, { text })
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/send-image', upload.single('image'), async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const jid = req.body.jid
    const caption = req.body.caption
    const file = req.file
    if (!file) throw new Error('No image uploaded')
    const buffer = fs.readFileSync(file.path)
    await globalSock.sendMessage(jid, { image: buffer, caption })
    fs.unlinkSync(file.path) // Cleanup
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/send-poll', async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const { jid, name, options } = req.body
    await globalSock.sendMessage(jid, { poll: { name, values: options } })
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/send-list', async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const { jid, title, description, buttonText, options } = req.body
    
    const interactiveMessage = {
      header: { 
        title: title || "Select Option",
        subtitle: "",
        hasMediaAttachment: false
      },
      body: { 
        text: description || "Please select from the list below" 
      },
      footer: { text: "Select an option" },
      nativeFlowMessage: {
        messageVersion: 1,
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: buttonText || "Select Option",
              sections: [
                {
                  title: "Options",
                  rows: options.map((opt: string, i: number) => ({
                    header: "",
                    title: opt,
                    description: "",
                    id: `list_id_${i}`
                  }))
                }
              ]
            })
          }
        ]
      }
    }

    await globalSock.relayMessage(jid, { 
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage
        }
      }
    }, {})
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Video ---
app.post('/api/send-video', upload.single('video'), async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const jid = req.body.jid
    const caption = req.body.caption || ''
    const file = req.file
    if (!file) throw new Error('No video uploaded')
    const buffer = fs.readFileSync(file.path)
    await globalSock.sendMessage(jid, { video: buffer, caption })
    fs.unlinkSync(file.path)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Audio ---
app.post('/api/send-audio', upload.single('audio'), async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const jid = req.body.jid
    const ptt = req.body.ptt === 'true' // voice note flag
    const file = req.file
    if (!file) throw new Error('No audio uploaded')
    const buffer = fs.readFileSync(file.path)
    await globalSock.sendMessage(jid, { audio: buffer, ptt, mimetype: 'audio/mpeg' })
    fs.unlinkSync(file.path)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Document ---
app.post('/api/send-document', upload.single('document'), async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const jid = req.body.jid
    const caption = req.body.caption || ''
    const fileName = req.body.fileName || req.file?.originalname || 'document'
    const mimetype = req.body.mimetype || req.file?.mimetype || 'application/octet-stream'
    const file = req.file
    if (!file) throw new Error('No document uploaded')
    const buffer = fs.readFileSync(file.path)
    await globalSock.sendMessage(jid, { document: buffer, mimetype, fileName, caption })
    fs.unlinkSync(file.path)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Sticker ---
app.post('/api/send-sticker', upload.single('sticker'), async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const jid = req.body.jid
    const file = req.file
    if (!file) throw new Error('No sticker uploaded')
    const buffer = fs.readFileSync(file.path)
    await globalSock.sendMessage(jid, { sticker: buffer })
    fs.unlinkSync(file.path)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Location ---
app.post('/api/send-location', async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const { jid, latitude, longitude, name, address } = req.body
    if (latitude == null || longitude == null) throw new Error('latitude and longitude are required')
    await globalSock.sendMessage(jid, {
      location: {
        degreesLatitude: parseFloat(latitude),
        degreesLongitude: parseFloat(longitude),
        name: name || undefined,
        address: address || undefined,
      }
    })
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Contact Card ---
app.post('/api/send-contact', async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const { jid, contactName, contactNumber } = req.body
    if (!contactName || !contactNumber) throw new Error('contactName and contactNumber are required')
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;type=CELL;type=VOICE;waid=${contactNumber}:+${contactNumber}\nEND:VCARD`
    await globalSock.sendMessage(jid, {
      contacts: {
        displayName: contactName,
        contacts: [{ displayName: contactName, vcard }]
      }
    })
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Reaction ---
app.post('/api/send-reaction', async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const { jid, messageId, emoji } = req.body
    if (!messageId || !emoji) throw new Error('messageId and emoji are required')
    await globalSock.sendMessage(jid, {
      react: {
        text: emoji,
        key: { remoteJid: jid, id: messageId }
      }
    })
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Buttons ---
app.post('/api/send-buttons', async (req, res) => {
  if (!globalSock) return res.status(500).json({ error: 'WhatsApp not connected' })
  try {
    const { jid, text, options } = req.body
    if (!text || !options || options.length === 0) throw new Error('Question and options are required')
    
    const interactiveMessage = {
      body: { 
        text: text 
      },
      footer: { text: "Select an option" },
      nativeFlowMessage: {
        messageVersion: 1,
        buttons: options.map((opt: string, i: number) => ({
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: opt,
            id: `btn_${i}`
          })
        }))
      }
    }

    await globalSock.relayMessage(jid, { 
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage
        }
      }
    }, {})
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// --- Connection Status ---
app.get('/api/status', (req, res) => {
  res.json({
    connected: !!globalSock,
    timestamp: new Date().toISOString()
  })
})

app.listen(3000, () => {
  console.log('Web UI running at http://localhost:3000')
})

const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = function(domain, options, callback) {
  if (domain === 'web.whatsapp.com') {
    if (typeof options === 'function') {
      return options(null, '57.144.211.32', 4);
    }
    if (options && options.all) {
      return callback(null, [{ address: '57.144.211.32', family: 4 }]);
    }
    // Forces resolution to correct Meta IP, bypassing DNS issues
    return callback(null, '57.144.211.32', 4);
  }
  return originalLookup.call(dns, domain, options, callback);
};
const logger = P({
  level: "trace",
  transport: {
    targets: [
      {
        target: "pino-pretty", // pretty-print for console
        options: { colorize: true },
        level: "trace",
      },
      {
        target: "pino/file", // raw file output
        options: { destination: './wa-logs.txt' },
        level: "trace",
      },
    ],
  },
})
logger.level = 'trace'

const doReplies = process.argv.includes('--do-reply')
const usePairingCode = process.argv.includes('--use-pairing-code')

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterCache = new NodeCache() as CacheStore

const onDemandMap = new Map<string, string>()

// Read line interface
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text: string) => new Promise<string>((resolve) => rl.question(text, resolve))

// start a connection
const startSock = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

	const sock = makeWASocket({
		version,
		printQRInTerminal: true,
		logger,
		auth: {
			creds: state.creds,
			/** caching makes the store faster to send/recv messages */
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		msgRetryCounterCache,
		generateHighQualityLinkPreview: true,
		// ignore all broadcast messages -- to receive the same
		// comment the line below out
		// shouldIgnoreJid: jid => isJidBroadcast(jid),
		// implement to handle retries & poll updates
		getMessage
	})

  globalSock = sock;

  // Automatically open browser UI for QR code if it is generated
  sock.ev.on('connection.update', (update) => {
    if (update.qr) {
      console.log('Got QR string:', update.qr);
      const html = `<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#222;color:#fff;font-family:sans-serif;">
        <div style="text-align:center;">
            <h1>Scan this QR on WhatsApp</h1>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(update.qr)}" style="border: 20px solid white; border-radius: 10px;" />
        </div>
      </body></html>`;
      fs.writeFileSync('./qr.html', html);
      open('file://' + fs.realpathSync('./qr.html')).catch(console.error);
    }
  });


	// Pairing code for Web clients
	if (usePairingCode && !sock.authState.creds.registered) {
		// todo move to QR event
		const phoneNumber = await question('Please enter your phone number:\n')
		const code = await sock.requestPairingCode(phoneNumber)
		console.log(`Pairing code: ${code}`)
	}

	const sendMessageWTyping = async(msg: AnyMessageContent, jid: string) => {
		await sock.presenceSubscribe(jid)
		await delay(500)

		await sock.sendPresenceUpdate('composing', jid)
		await delay(2000)

		await sock.sendPresenceUpdate('paused', jid)

		await sock.sendMessage(jid, msg)
	}

	// the process function lets you process all events that just occurred
	// efficiently in a batch
	sock.ev.process(
		// events is a map for event name => event data
		async(events) => {
			// something about the connection changed
			// maybe it closed, or we received all offline message or connection opened
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if(connection === 'close') {
					// reconnect if not logged out
					if((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
						startSock()
					} else {
						console.log('Connection closed. You are logged out.')
					}
				}
				console.log('connection update', update)
			}

			// credentials updated -- save them
			if(events['creds.update']) {
				await saveCreds()
			}

			if(events['labels.association']) {
				console.log(events['labels.association'])
			}


			if(events['labels.edit']) {
				console.log(events['labels.edit'])
			}

			if(events.call) {
				console.log('recv call event', events.call)
			}

			// history received
			if(events['messaging-history.set']) {
				const { chats, contacts, messages, isLatest, progress, syncType } = events['messaging-history.set']
				if (syncType === proto.HistorySync.HistorySyncType.ON_DEMAND) {
					console.log('received on-demand history sync, messages=', messages)
				}
				console.log(`recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest}, progress: ${progress}%), type: ${syncType}`)
			}

			// received a new message
      if (events['messages.upsert']) {
        const upsert = events['messages.upsert']
        console.log('recv messages ', JSON.stringify(upsert, undefined, 2))

        if (!!upsert.requestId) {
          console.log("placeholder message received for request of id=" + upsert.requestId, upsert)
        }



        if (upsert.type === 'notify') {
          for (const msg of upsert.messages) {
            if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
              const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
              if (text == "requestPlaceholder" && !upsert.requestId) {
                const messageId = await sock.requestPlaceholderResend(msg.key)
                console.log('requested placeholder resync, id=', messageId)
              }

              // go to an old chat and send this
              if (text == "onDemandHistSync") {
                const messageId = await sock.fetchMessageHistory(50, msg.key, msg.messageTimestamp!)
                console.log('requested on-demand sync, id=', messageId)
              }

              if (!msg.key.fromMe && doReplies && !isJidNewsletter(msg.key?.remoteJid!)) {

                console.log('replying to', msg.key.remoteJid)
                await sock!.readMessages([msg.key])
                await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid!)
              }
            }
          }
        }
      }

			// messages updated like status delivered, message deleted etc.
			if(events['messages.update']) {
				console.log(
					JSON.stringify(events['messages.update'], undefined, 2)
				)

				for(const { key, update } of events['messages.update']) {
					if(update.pollUpdates) {
						const pollCreation: proto.IMessage = {} // get the poll creation message somehow
						if(pollCreation) {
							console.log(
								'got poll update, aggregation: ',
								getAggregateVotesInPollMessage({
									message: pollCreation,
									pollUpdates: update.pollUpdates,
								})
							)
						}
					}
				}
			}

			if(events['message-receipt.update']) {
				console.log(events['message-receipt.update'])
			}

			if(events['messages.reaction']) {
				console.log(events['messages.reaction'])
			}

			if(events['presence.update']) {
				console.log(events['presence.update'])
			}

			if(events['chats.update']) {
				console.log(events['chats.update'])
			}

			if(events['contacts.update']) {
				for(const contact of events['contacts.update']) {
					if(typeof contact.imgUrl !== 'undefined') {
						const newUrl = contact.imgUrl === null
							? null
							: await sock!.profilePictureUrl(contact.id!).catch(() => null)
						console.log(
							`contact ${contact.id} has a new profile pic: ${newUrl}`,
						)
					}
				}
			}

			if(events['chats.delete']) {
				console.log('chats deleted ', events['chats.delete'])
			}
		}
	)

	return sock

	async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
	  // Implement a way to retreive messages that were upserted from messages.upsert
			// up to you

		// only if store is present
		return proto.Message.create({ conversation: 'test' })
	}
}

startSock()
