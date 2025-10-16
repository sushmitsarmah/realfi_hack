import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { WakuMessenger, type Message } from '@/lib/waku-messenger'
import { useNillionMessenger } from '@/hooks/useNillionMessenger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Contact {
  address: string
  name?: string
  lastMessage?: string
  unread?: number
}

export default function MessengerView() {
  const { address } = useAccount()
  const [messenger, setMessenger] = useState<WakuMessenger | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [newContactAddress, setNewContactAddress] = useState('')
  const [activeTab, setActiveTab] = useState<'chat' | 'payment'>('chat')
  const [paymentAmount, setPaymentAmount] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use Nillion for encrypted storage
  const {
    contacts,
    messages,
    isConnected: nillionConnected,
    saveContact,
    saveMessageHistory,
    loadMessageHistory
  } = useNillionMessenger()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeWaku = async () => {
    if (!address) return

    setIsInitializing(true)
    try {
      const waku = new WakuMessenger()
      await waku.initialize()

      await waku.subscribe(address, async (msg: Message) => {
        // Save message to Nillion encrypted storage
        await saveMessageHistory(msg)

        // Auto-add sender as contact if not exists
        const existingContact = contacts.find(c => c.address === msg.from)
        if (!existingContact) {
          await saveContact({ address: msg.from })
        }
      })

      setMessenger(waku)
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to initialize Waku:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const sendChatMessage = async () => {
    if (!messenger || !selectedContact || !newMessage.trim() || !address) return

    try {
      await messenger.sendChat(selectedContact, newMessage, address)
      const sentMsg: Message = {
        id: `${Date.now()}-local`,
        from: address,
        to: selectedContact,
        content: newMessage,
        type: 'chat',
        timestamp: Date.now()
      }

      // Save sent message to Nillion encrypted storage
      await saveMessageHistory(sentMsg)

      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const requestPayment = async () => {
    if (!messenger || !selectedContact || !paymentAmount || !address) return

    try {
      await messenger.requestPayment(selectedContact, paymentAmount, 'Payment request', address)
      setPaymentAmount('')
    } catch (error) {
      console.error('Failed to request payment:', error)
    }
  }

  const addContact = async () => {
    if (!newContactAddress.trim()) return

    const exists = contacts.find(c => c.address === newContactAddress)
    if (!exists) {
      // Save contact to Nillion encrypted storage
      await saveContact({ address: newContactAddress })
    }
    setSelectedContact(newContactAddress)
    setNewContactAddress('')
  }

  // Load message history when selecting a contact
  useEffect(() => {
    if (selectedContact) {
      loadMessageHistory(selectedContact)
    }
  }, [selectedContact, loadMessageHistory])

  const selectedMessages = messages.filter(
    m => (m.from === selectedContact && m.to === address) ||
         (m.from === address && m.to === selectedContact)
  ).sort((a, b) => a.timestamp - b.timestamp)

  if (!address) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Secure Messenger</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to use the messenger.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💬</span>
              <CardTitle className="text-gray-100">Secure Messenger</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              {nillionConnected && (
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  Nillion Encrypted
                </div>
              )}
              {!isConnected ? (
                <Button
                  onClick={initializeWaku}
                  disabled={isInitializing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isInitializing ? 'Connecting...' : 'Connect to Waku'}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Waku Connected
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-12 text-gray-400">
              <p className="mb-4">🔒 P2P encrypted messaging powered by Waku</p>
              <p className="mb-2">🔐 Contacts & messages stored in Nillion (encrypted)</p>
              <p className="text-sm mt-4">Click "Connect to Waku" to start messaging</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
              {/* Contacts List */}
              <div className="border-r border-gray-700 pr-4 space-y-4 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Add Contact</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0x..."
                      value={newContactAddress}
                      onChange={(e) => setNewContactAddress(e.target.value)}
                      className="bg-gray-900 border-gray-600 text-gray-100"
                    />
                    <Button onClick={addContact} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Contacts</h3>
                  <div className="space-y-2">
                    {contacts.length === 0 ? (
                      <p className="text-sm text-gray-500">No contacts yet</p>
                    ) : (
                      contacts.map((contact) => (
                        <div
                          key={contact.address}
                          onClick={() => setSelectedContact(contact.address)}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedContact === contact.address
                              ? 'bg-blue-600/20 border border-blue-600'
                              : 'bg-gray-900/50 hover:bg-gray-900 border border-transparent'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-200 truncate">
                                {contact.name || `${contact.address.slice(0, 6)}...${contact.address.slice(-4)}`}
                              </p>
                              {contact.lastMessage && (
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {contact.lastMessage}
                                </p>
                              )}
                            </div>
                            {contact.unread && contact.unread > 0 && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-600 rounded-full">
                                {contact.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="md:col-span-2 flex flex-col">
                {!selectedContact ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a contact to start messaging
                  </div>
                ) : (
                  <>
                    {/* Contact Header */}
                    <div className="pb-4 border-b border-gray-700 mb-4">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {`${selectedContact.slice(0, 6)}...${selectedContact.slice(-4)}`}
                      </h3>
                      <p className="text-xs text-gray-500">🔒 Waku P2P • 🔐 Nillion Encrypted</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-4 border-b border-gray-700">
                      <button
                        onClick={() => setActiveTab('chat')}
                        className={`pb-2 px-4 ${
                          activeTab === 'chat'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-400'
                        }`}
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => setActiveTab('payment')}
                        className={`pb-2 px-4 ${
                          activeTab === 'payment'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-400'
                        }`}
                      >
                        Payment
                      </button>
                    </div>

                    {activeTab === 'chat' ? (
                      <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                          {selectedMessages.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                          ) : (
                            selectedMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.from === address ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    msg.from === address
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-700 text-gray-100'
                                  }`}
                                >
                                  {msg.type === 'payment-request' && (
                                    <div className="flex items-center gap-2 text-xs mb-1 opacity-80">
                                      <span>💸</span>
                                      <span>Payment Request: {msg.metadata?.amount} ETH</span>
                                    </div>
                                  )}
                                  {msg.type === 'payment' && (
                                    <div className="flex items-center gap-2 text-xs mb-1 opacity-80">
                                      <span>✅</span>
                                      <span>Payment Sent: {msg.metadata?.amount} ETH</span>
                                    </div>
                                  )}
                                  <p className="text-sm">{msg.content}</p>
                                  <p className="text-xs opacity-60 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                            className="bg-gray-900 border-gray-600 text-gray-100"
                          />
                          <Button onClick={sendChatMessage} className="bg-blue-600 hover:bg-blue-700">
                            Send
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center items-center gap-4">
                        <h3 className="text-xl font-semibold text-gray-100">Request Payment</h3>
                        <div className="w-full max-w-md space-y-4">
                          <Input
                            type="number"
                            placeholder="Amount in ETH"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="bg-gray-900 border-gray-600 text-gray-100"
                          />
                          <Button
                            onClick={requestPayment}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Send Payment Request
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}