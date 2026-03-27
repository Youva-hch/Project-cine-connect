import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/discussion')({
  component: Discussion,
})

// Données de test (sera remplacé par l'API)
const mockMessages = [
  {
    id: 1,
    sender: 'Alice Martin',
    senderAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'Salut Bob ! As-tu vu Inception ? Je l\'ai adoré !',
    timestamp: 'Il y a 2 heures',
    isRead: true,
  },
  {
    id: 2,
    sender: 'Bob Dupont',
    senderAvatar: 'https://i.pravatar.cc/150?img=12',
    content: 'Oui, je l\'ai vu hier soir. C\'était vraiment bien !',
    timestamp: 'Il y a 1 heure',
    isRead: true,
  },
  {
    id: 3,
    sender: 'Alice Martin',
    senderAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'Tu devrais regarder The Dark Knight, c\'est incroyable !',
    timestamp: 'Il y a 30 minutes',
    isRead: false,
  },
]

const mockFriends = [
  { id: 1, name: 'Bob Dupont', avatar: 'https://i.pravatar.cc/150?img=12', isOnline: true },
  { id: 2, name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?img=15', isOnline: false },
]

function Discussion() {
  const [selectedFriend, setSelectedFriend] = useState(mockFriends[0])
  const [message, setMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      // TODO: Envoyer le message via l'API
      setMessage('')
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Liste des amis */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {mockFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedFriend.id === friend.id ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              {friend.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{friend.name}</p>
                        <p className="text-sm text-gray-600">
                          {friend.isOnline ? 'En ligne' : 'Hors ligne'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de chat */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {selectedFriend.avatar ? (
                      <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {selectedFriend.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedFriend.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedFriend.isOnline ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'Alice Martin' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'Alice Martin' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.sender} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            {msg.sender.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'Alice Martin'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === 'Alice Martin' ? 'text-emerald-200' : 'text-gray-500'
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
