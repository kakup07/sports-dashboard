import { match } from 'assert';
import { WebSocket, WebSocketServer } from 'ws';

const matchSubscriber = new Map()

function subscribe(matchId, socket){
  const subscribers = matchSubscriber.get(matchId)
  if(!subscribers){
    matchSubscriber.set(matchId, new Set())
  }
  matchSubscriber.get(matchId).add(socket)
}

function unsubscribe(matchId, socket){
  const subscribers = matchSubscriber.get(matchId)
  if(!subscribers) return
  if(subscribers.size === 0) {
    return matchSubscriber.delete(matchId)
  }
  subscribers.delete(socket)
}

function cleanupSubscriptions(socket){
  for(const matchId of socket.subscribtions){
      unsubscribe(matchId, socket)
  }
}

function broadcastToMatch(matchId, payload){
  const subscribers = matchSubscriber.get(matchId)
  if(!subscribers || subscribers.size === 0) return

  const message = JSON.stringify(payload)
  console.log(subscribers)
  for(const subscriber of subscribers){
    if(subscriber.readyState === WebSocket.OPEN)
    subscriber.send(message)
  }
}

function sendJson(socket, payload){
  if(socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify(payload))
}

function broadcastToAll(wss, payload){
  for(const client of wss.clients) {
    if(client.readyState !== WebSocket.OPEN) continue
    client.send(JSON.stringify(payload))
  }
}

function handleMessage(socket, data){
  let message
  try {
    message = JSON.parse(data.toString())
  } catch (err){
    return sendJson(socket, {type: 'error', message: 'Invalid Json'})
  }

  if(message?.type === 'subscribe' && Number.isInteger(message.matchId)){
    subscribe(message.matchId, socket)
    socket.subscribtions.add(message.matchId)
    sendJson(socket, {type: 'subscribe', matchId: message.matchId})
    return
  }

  if(message?.type === 'unsubscribe' && Number.isInteger(message.matchId)){
    const matchId = message.matchId
    unsubscribe(matchId)
    socket.subscribtions.delete(matchId)
    sendJson(socket, {type: 'unsubscribed', matchId: message.matchId})
  }
}

export function attachWebSocketServer(server){
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 1024*1024
  })

  wss.on('connection', (socket) => {
    socket.isAlive = true
    socket.on('pong', () => { socket.isAlive = true })
    socket.subscribtions = new Set()
    socket.on('message', (payload) => {
      handleMessage(socket, payload)
    }) 

    sendJson(socket, {type: 'welcome'})

    socket.on('error', () => {
      socket.terminate()
    })

    socket.on('close', () => {
      cleanupSubscriptions(socket)
    })
  })

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if(ws.isAlive === false) return ws.terminate()
      
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('close', () => clearInterval(interval))

  function broadcastMatchCreated(match){
    broadcastToAll(wss, {type: 'match_created', data: match})
  }

  function broadcastCommentary(matchId, comment){
    console.log('inside broadcastCommentary')
    broadcastToMatch(matchId, {type: 'commentary', data: comment})
  }

  return { broadcastMatchCreated, broadcastCommentary }
}