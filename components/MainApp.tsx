'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UploadCloud, CheckCircle, File as FileIcon, Lock, Sparkles, ShieldAlert, Layers, ShieldCheck, Send, Music, Image as ImageIcon, Video, FileArchive, LogOut } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import AdComponent from '@/components/AdComponent';
import Link from 'next/link';

export default function MainApp({ 
  initialRoomId, 
  customLogoUrl, 
  customBackgroundUrl 
}: { 
  initialRoomId?: string, 
  customLogoUrl?: string, 
  customBackgroundUrl?: string 
} = {}) {
  const { user, isLoaded } = useUser();
  const plan = user?.publicMetadata?.plan || 'free';
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'melanbandara24@gmail.com';
  const isPro = plan === 'pro' || user?.publicMetadata?.isPro === true || isAdmin;
  const myBrand = (user?.publicMetadata?.brandName as string) || '';

  const [roomId, setRoomId] = useState<string>(initialRoomId || '');
  const [connected, setConnected] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  
  const [remoteBrand, setRemoteBrand] = useState<string>('');

  // Password Feature State
  const [roomPassword, setRoomPassword] = useState<string>('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<boolean>(false);
  const [joinPassword, setJoinPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Analytics & Security State
  const [transferProgress, setTransferProgress] = useState<number>(0);
  const [transferSpeed, setTransferSpeed] = useState<string>('');
  const [eta, setEta] = useState<string>('');
  const [isSecureE2EE, setIsSecureE2EE] = useState<boolean>(false);
  
  // Chat State
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [baseUrl, setBaseUrl] = useState<string>('https://nodeferry.com');
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const receiveBufferRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef<number>(0);
  const incomingFileMetaRef = useRef<{name: string, size: number} | null>(null);

  // E2EE State
  const encryptionKeyRef = useRef<CryptoKey | null>(null);
  const isIncomingEncryptedRef = useRef<boolean>(false);

  const lastChunkTimeRef = useRef<number>(0);
  const lastChunkSizeRef = useRef<number>(0);

  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.error('Wake Lock error:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const resetRoom = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    releaseWakeLock();

    setRoomId('');
    setConnected(false);
    setFiles([]);
    setCurrentFileIndex(0);
    setAuthError('');
    setRemoteBrand('');
    setMessages([]);
    setTransferProgress(0);
    setTransferSpeed('');
    setEta('');
    setIsSecureE2EE(false);
    setShowPasswordPrompt(false);
    setRoomPassword('');
    
    window.history.pushState({}, '', window.location.pathname);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
      
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room') || initialRoomId;
      if (roomParam && !connected && !roomId) {
        joinRoom(roomParam);
      }
    }
  }, [initialRoomId]);

  const initWebRTC = (isInit: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setAuthError('Connection lost. The peer may have disconnected.');
          setConnected(false);
          setIsSecureE2EE(false);
          releaseWakeLock();
      }
    };

    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      receiveChannel.binaryType = 'arraybuffer';
      receiveChannel.onmessage = handleReceiveMessage;
      receiveChannel.onopen = () => {
          setConnected(true);
          setShowPasswordPrompt(false);
          requestWakeLock();
          if (isInit && isPro && myBrand) {
              receiveChannel.send(JSON.stringify({ type: 'brand', name: myBrand }));
          }
      };
      dataChannelRef.current = receiveChannel;
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const calculateAnalytics = (currentSize: number, totalSize: number) => {
    const now = Date.now();
    if (lastChunkTimeRef.current === 0) {
      lastChunkTimeRef.current = now;
      lastChunkSizeRef.current = currentSize;
      return;
    }

    const timeDiff = (now - lastChunkTimeRef.current) / 1000;
    if (timeDiff >= 1) {
      const bytesInDiff = currentSize - lastChunkSizeRef.current;
      const speedMBps = (bytesInDiff / (1024 * 1024)) / timeDiff;
      setTransferSpeed(`${speedMBps.toFixed(2)} MB/s`);

      const remainingBytes = totalSize - currentSize;
      const remainingSeconds = remainingBytes / (bytesInDiff / timeDiff);
      
      if (remainingSeconds < 60) {
        setEta(`${Math.round(remainingSeconds)}s remaining`);
      } else {
        setEta(`${Math.floor(remainingSeconds / 60)}m ${Math.round(remainingSeconds % 60)}s remaining`);
      }

      lastChunkTimeRef.current = now;
      lastChunkSizeRef.current = currentSize;
    }
  };

  const handleReceiveMessage = async (event: MessageEvent) => {
    if (typeof event.data === 'string') {
      const message = JSON.parse(event.data);
      
      if (message.type === 'e2e_key') {
          const rawKey = new Uint8Array(message.key);
          encryptionKeyRef.current = await crypto.subtle.importKey(
              "raw",
              rawKey,
              { name: "AES-GCM" },
              true,
              ["encrypt", "decrypt"]
          );
      } else if (message.type === 'brand') {
          setRemoteBrand(message.name);
      } else if (message.type === 'meta') {
        incomingFileMetaRef.current = { name: message.name, size: message.size };
        isIncomingEncryptedRef.current = !!message.encrypted;
        setIsSecureE2EE(!!message.encrypted);
        receiveBufferRef.current = [];
        receivedSizeRef.current = 0;
        lastChunkTimeRef.current = 0;
        setTransferProgress(0);
        setTransferSpeed('');
        setEta('');
      } else if (message.type === 'end') {
        const blob = new Blob(receiveBufferRef.current);
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = incomingFileMetaRef.current?.name || 'downloaded_file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setTransferProgress(100);
        setTransferSpeed('Complete');
        setEta('');
        
        setTimeout(() => {
            setTransferProgress(0);
            setTransferSpeed('');
            setIsSecureE2EE(false);
        }, 1500);

      } else if (message.type === 'resume_request') {
        const file = files[currentFileIndex];
        if (file && file.name === message.filename) {
          console.log(`Resuming ${file.name} from offset ${message.offset}`);
          sendSingleFile(file, message.offset);
        }
      } else if (message.type === 'chat') {
        setMessages(prev => [...prev, { sender: 'Peer', text: message.text }]);
      }
    } else {
      let chunkData: ArrayBuffer = event.data;
      
      if (isIncomingEncryptedRef.current && encryptionKeyRef.current) {
          try {
              const payload = new Uint8Array(event.data as ArrayBuffer);
              const iv = payload.slice(0, 12);
              const ciphertext = payload.slice(12);
              chunkData = await crypto.subtle.decrypt(
                  { name: "AES-GCM", iv: iv },
                  encryptionKeyRef.current,
                  ciphertext
              );
          } catch (e) {
              console.error("Decryption failed", e);
              setAuthError("Failed to decrypt incoming chunk.");
              return;
          }
      }

      receiveBufferRef.current.push(chunkData);
      receivedSizeRef.current += chunkData.byteLength;
      
      if (incomingFileMetaRef.current) {
        const progress = Math.min(100, Math.round((receivedSizeRef.current / incomingFileMetaRef.current.size) * 100));
        setTransferProgress(progress);
        if (isPro) {
          calculateAnalytics(receivedSizeRef.current, incomingFileMetaRef.current.size);
        }
      }
    }
  };

  const proceedToOffer = async (pc: RTCPeerConnection, ws: WebSocket) => {
    const dataChannel = pc.createDataChannel('fileTransfer');
    dataChannel.binaryType = 'arraybuffer';
    dataChannel.onopen = () => {
        setConnected(true);
        requestWakeLock();
        if (isPro && myBrand) {
            dataChannel.send(JSON.stringify({ type: 'brand', name: myBrand }));
        }
    };
    dataChannel.onmessage = handleReceiveMessage;
    dataChannelRef.current = dataChannel;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', offer }));
  };

  const connectSignalingServer = async (id: string, isInitiator: boolean) => {
    const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8787';
    const ws = new WebSocket(`${signalingUrl}/room/${id}`);
    wsRef.current = ws;

    ws.onopen = async () => {
      const pc = initWebRTC(isInitiator);
      if (!isInitiator) {
        ws.send(JSON.stringify({ type: 'join' }));
      }
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (message.type === 'join' && isInitiator) {
        if (roomPassword) {
            ws.send(JSON.stringify({ type: 'auth_required' }));
        } else {
            proceedToOffer(pc, ws);
        }
      } else if (message.type === 'auth_required' && !isInitiator) {
          setShowPasswordPrompt(true);
      } else if (message.type === 'auth' && isInitiator) {
          if (message.password === roomPassword) {
              proceedToOffer(pc, ws);
          } else {
              ws.send(JSON.stringify({ type: 'auth_failed' }));
          }
      } else if (message.type === 'auth_failed' && !isInitiator) {
          setAuthError('Incorrect password. Please try again.');
      } else if (message.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', answer }));
      } else if (message.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
      } else if (message.type === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    setRoomId(newRoomId);
    window.history.pushState({}, '', `?room=${newRoomId}`);
    connectSignalingServer(newRoomId, true);
  };

  const joinRoom = (id: string) => {
    setRoomId(id);
    connectSignalingServer(id, false);
  };

  const handleJoinSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputRoom = formData.get('roomInput') as string;
    if (inputRoom) {
      window.history.pushState({}, '', `?room=${inputRoom}`);
      joinRoom(inputRoom);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      checkAndSetFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      checkAndSetFiles(Array.from(e.target.files));
    }
  };

  const checkAndSetFiles = (selectedFiles: File[]) => {
      if (!isPro) {
          if (selectedFiles.length > 1 || files.length > 0) {
              alert("Multi-file sharing is a Pro feature. Only the first file will be added.");
              selectedFiles = [selectedFiles[0]];
          }
          if (selectedFiles[0].size > 2 * 1024 * 1024 * 1024) {
              alert("Free accounts are limited to 2GB files. Please upgrade to Pro.");
              return;
          }
      }
      setFiles(prev => [...prev, ...selectedFiles]);
  }

  const sendSingleFile = (file: File, startOffset: number = 0) => {
      return new Promise<void>(async (resolve) => {
          const CHUNK_SIZE = 16 * 1024;
          const buffer = await file.arrayBuffer();
          let offset = startOffset;
          lastChunkTimeRef.current = 0;

          let key: CryptoKey | null = null;
          if (isPro) {
              key = await crypto.subtle.generateKey(
                  { name: "AES-GCM", length: 256 },
                  true,
                  ["encrypt", "decrypt"]
              );
              const exported = await crypto.subtle.exportKey("raw", key);
              dataChannelRef.current!.send(JSON.stringify({ 
                  type: 'e2e_key', 
                  key: Array.from(new Uint8Array(exported)) 
              }));
              setIsSecureE2EE(true);
          }

          if (startOffset === 0) {
            dataChannelRef.current!.send(JSON.stringify({ 
                type: 'meta', 
                name: file.name, 
                size: file.size,
                encrypted: isPro
            }));
          }

          const sendChunk = async () => {
              while (offset < buffer.byteLength) {
                  if (dataChannelRef.current!.bufferedAmount > 65535) {
                      setTimeout(sendChunk, 10);
                      return;
                  }
                  
                  const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
                  let dataToSend: ArrayBuffer = chunk;

                  if (isPro && key) {
                      const iv = crypto.getRandomValues(new Uint8Array(12));
                      const encrypted = await crypto.subtle.encrypt(
                          { name: "AES-GCM", iv: iv },
                          key,
                          chunk
                      );
                      const payload = new Uint8Array(iv.length + encrypted.byteLength);
                      payload.set(iv, 0);
                      payload.set(new Uint8Array(encrypted), iv.length);
                      dataToSend = payload.buffer;
                  }
                  
                  dataChannelRef.current!.send(dataToSend);
                  offset += CHUNK_SIZE;
                  
                  setTransferProgress(Math.min(100, Math.round((offset / buffer.byteLength) * 100)));
                  if (isPro) calculateAnalytics(offset, buffer.byteLength);
              }

              if (offset >= buffer.byteLength) {
                  dataChannelRef.current!.send(JSON.stringify({ type: 'end' }));
                  setTransferSpeed('Complete');
                  setEta('');
                  
                  if (isPro) {
                    fetch('/api/history', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ filename: file.name, sizeBytes: file.size, status: 'completed' })
                    }).catch(console.error);
                  }

                  setTimeout(() => {
                      setIsSecureE2EE(false);
                      resolve();
                  }, 500); 
              }
          };
          sendChunk();
      });
  };

  const sendAllFiles = async () => {
    if (files.length === 0 || !dataChannelRef.current || dataChannelRef.current.readyState !== 'open') return;

    for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        await sendSingleFile(files[i]);
    }

    setTimeout(() => {
        setTransferProgress(0);
        setFiles([]);
        setCurrentFileIndex(0);
        setTransferSpeed('');
    }, 2000);
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !dataChannelRef.current) return;
    
    dataChannelRef.current.send(JSON.stringify({ type: 'chat', text: chatInput }));
    setMessages(prev => [...prev, { sender: 'You', text: chatInput }]);
    setChatInput('');
  };

  const sendPasswordAuth = () => {
      wsRef.current?.send(JSON.stringify({ type: 'auth', password: joinPassword }));
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col xl:flex-row w-full max-w-7xl mx-auto items-center xl:items-start justify-between p-4 md:p-8 font-sans my-auto gap-12 min-h-[calc(100vh-64px)] bg-cover bg-center bg-no-repeat transition-all duration-700 relative z-10"
      style={customBackgroundUrl ? { backgroundImage: `url(${customBackgroundUrl})`, backgroundColor: 'rgba(15, 23, 42, 0.7)', backgroundBlendMode: 'overlay' } : {}}
    >
      {/* Floating Background File Tiles - Positioned relative to the whole screen */}
      {!connected && !customBackgroundUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block overflow-hidden">
          {/* Tile 1: Music - Top Right */}
          <div className="absolute top-[15%] right-[10%] bg-rose-500/90 backdrop-blur-md w-24 h-24 rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl rotate-12 transition-all duration-500 hover:rotate-0 hover:scale-110 pointer-events-auto border border-rose-400/50">
            <Music className="w-8 h-8 mb-1" />
            <span className="font-bold text-sm tracking-widest">.mp3</span>
          </div>
          {/* Tile 2: Image - Bottom Left */}
          <div className="absolute bottom-[20%] left-[5%] bg-emerald-500/90 backdrop-blur-md w-28 h-28 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-2xl -rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-110 pointer-events-auto border border-emerald-400/50">
            <ImageIcon className="w-10 h-10 mb-1" />
            <span className="font-bold text-base tracking-widest">.png</span>
          </div>
          {/* Tile 3: Video - Bottom Right */}
          <div className="absolute bottom-[15%] right-[8%] bg-violet-500/90 backdrop-blur-md w-24 h-24 rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl -rotate-12 transition-all duration-500 hover:rotate-0 hover:scale-110 pointer-events-auto border border-violet-400/50 animate-bounce" style={{ animationDuration: '6s' }}>
            <Video className="w-8 h-8 mb-1" />
            <span className="font-bold text-sm tracking-widest">.mp4</span>
          </div>
          {/* Tile 4: Archive - Top Left */}
          <div className="absolute top-[10%] left-[12%] bg-amber-500/90 backdrop-blur-md w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-110 pointer-events-auto border border-amber-400/50">
            <FileArchive className="w-7 h-7 mb-1" />
            <span className="font-bold text-xs tracking-widest">.zip</span>
          </div>
          {/* Tile 5: PSD - Middle Right */}
          <div className="absolute top-[45%] right-[3%] bg-blue-500/90 backdrop-blur-md w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl -rotate-3 transition-all duration-500 hover:rotate-0 hover:scale-110 pointer-events-auto border border-blue-400/50">
            <Layers className="w-7 h-7 mb-1" />
            <span className="font-bold text-xs tracking-widest">.psd</span>
          </div>
        </div>
      )}

      {/* Premium Abstract Background Elements (Visible only when no custom BG) */}
      {!customBackgroundUrl && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[100px] mix-blend-screen" style={{ animation: 'pulse 8s infinite alternate' }}></div>
          <div className="absolute -bottom-[20%] right-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" style={{ animation: 'pulse 12s infinite alternate' }}></div>
        </div>
      )}
      
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-center text-blue-600 mb-2">
                <Lock className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-center">Protected Room</h2>
            <p className="text-slate-500 text-sm text-center">This room requires a password to connect.</p>
            <input 
              type="password"
              value={joinPassword}
              onChange={e => { setJoinPassword(e.target.value); setAuthError(''); }}
              placeholder="Enter Password" 
              className="bg-slate-100 border border-transparent rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all text-center mt-2 font-medium"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') sendPasswordAuth(); }}
            />
            {authError && <p className="text-red-500 text-xs text-center font-medium">{authError}</p>}
            <button 
              onClick={sendPasswordAuth}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all mt-2 active:scale-95 shadow-md shadow-blue-500/20"
            >
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Left Column: Transfer Card */}
      <div className="w-full max-w-md xl:w-[400px] shrink-0">
        <div className="w-full bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col relative z-20 overflow-hidden text-slate-900">
          
          {authError && !showPasswordPrompt && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-red-600 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span className="font-medium text-sm">{authError}</span>
                  </div>
                  <button onClick={resetRoom} className="mt-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors">Start Over</button>
              </div>
          )}

          {!connected ? (
          <div className="flex flex-col items-center space-y-6 md:space-y-8 animate-in fade-in duration-700">
              {roomId ? (
              <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="bg-slate-50 p-6 rounded-3xl relative w-full flex justify-center">
                    <QRCodeSVG value={`${baseUrl}?room=${roomId}`} size={180} className="w-40 h-40 md:w-48 md:h-48" />
                    {roomPassword && (
                        <div className="absolute -bottom-3 -right-3 bg-blue-600 p-2.5 rounded-full ring-4 ring-white shadow-xl">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mt-2">
                  Room ID: <br /><span className="text-slate-900 font-extrabold text-2xl mt-1 inline-block">{roomId}</span>
                  </p>
                  {roomPassword && (
                      <p className="text-xs text-blue-600 font-bold bg-blue-50 px-4 py-1.5 rounded-full">
                          🔒 Password Protected
                      </p>
                  )}
                  <p className="text-sm font-medium text-slate-500">Waiting for peer to connect...</p>
                  
                  <button 
                  onClick={() => {
                      navigator.clipboard.writeText(`${baseUrl}?room=${roomId}`);
                      alert('Link copied!');
                  }}
                  className="w-full px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                  Copy Join Link
                  </button>

                  <button
                  onClick={resetRoom}
                  className="w-full mt-1 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors text-sm"
                  >
                  Cancel / Start Over
                  </button>
              </div>
              ) : (
              <div className="flex flex-col w-full gap-5">
                  {isPro && (
                    <div className="w-full flex flex-col gap-2 mb-2">
                      <label className="text-sm font-bold text-slate-700">Room Password (Optional)</label>
                      <input 
                        type="password"
                        value={roomPassword}
                        onChange={e => setRoomPassword(e.target.value)}
                        placeholder="Leave blank for open access" 
                        className="bg-slate-100 border-none rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                      />
                    </div>
                  )}

                  <button 
                  onClick={createRoom}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-lg"
                  >
                  Create New Room
                  </button>
                  
                  <div className="relative w-full flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase">Or Join Room</div>
                  </div>

                  <form onSubmit={handleJoinSubmit} className="w-full flex gap-2">
                  <input 
                      name="roomInput"
                      placeholder="Enter Room ID" 
                      className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 min-w-0"
                      required
                  />
                  <button 
                      type="submit"
                      className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
                  >
                      Join
                  </button>
                  </form>
              </div>
              )}
          </div>
          ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col items-center w-full">
              <div className="flex items-center justify-between mb-6 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full w-full">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold text-sm">Securely Connected</span>
                </div>
                <button onClick={resetRoom} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Disconnect">
                   <LogOut className="w-4 h-4" />
                </button>
              </div>
              
              <input 
              type="file" 
              id="fileInput" 
              className="hidden" 
              multiple={isPro}
              onChange={handleFileSelect} 
              />
              
              <div 
              className="w-full bg-slate-50 hover:bg-blue-50 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-3xl p-8 flex flex-col items-center justify-center transition-all group cursor-pointer text-center min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
              >
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-slate-900 mb-1">Upload Files</p>
              <p className="text-sm font-medium text-slate-500">{isPro ? 'Unlimited size' : 'Up to 2GB free'}</p>
              
              </div>

              {files.length > 0 && (
                  <div className="flex flex-col w-full gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  <div className="text-xs text-slate-500 mb-1 flex justify-between font-bold items-center uppercase tracking-wider px-1">
                      <span>Queue ({currentFileIndex + 1}/{files.length})</span>
                      {isSecureE2EE && (
                          <div className="flex items-center gap-1 text-emerald-600">
                              <ShieldCheck className="w-3.5 h-3.5" /> E2EE
                          </div>
                      )}
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-1 flex flex-col gap-2">
                    {files.map((f, idx) => (
                        <div key={idx} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${idx === currentFileIndex && transferProgress > 0 ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-slate-50'}`}>
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <FileIcon className="w-4 h-4 text-blue-500 shrink-0" />
                            </div>
                            <span className="text-sm font-semibold truncate flex-1 text-left text-slate-700">{f.name}</span>
                            <span className="text-xs font-bold text-slate-400 shrink-0">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                            {idx === currentFileIndex && transferProgress === 100 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </div>
                    ))}
                  </div>
                  
                  {transferProgress > 0 && transferProgress < 100 && (
                      <div className="w-full flex flex-col gap-2 mt-4 p-4 bg-slate-50 rounded-2xl">
                          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                              <span>Transferring...</span>
                              <span className="text-blue-600">{transferProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${transferProgress}%` }}
                              ></div>
                          </div>
                          {isPro && (transferSpeed || eta) && (
                              <div className="flex justify-between text-xs text-slate-500 mt-1 font-medium">
                                  <span>{transferSpeed}</span>
                                  <span>{eta}</span>
                              </div>
                          )}
                      </div>
                  )}
                  </div>
              )}

              <button 
                  onClick={(e) => {
                  e.stopPropagation();
                  sendAllFiles();
                  }}
                  disabled={files.length === 0 || (transferProgress > 0 && transferProgress < 100)}
                  className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white disabled:cursor-not-allowed rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-lg"
              >
                  {transferProgress > 0 && transferProgress < 100 ? `Transferring...` : `Send ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </button>
          </div>
          )}
        </div>
      </div>

      {/* Right Column: Hero Text / Chat */}
      <div className="flex-1 flex flex-col xl:pl-16 pt-8 xl:pt-24 max-w-2xl text-center xl:text-left relative z-20">
        {!connected ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-1000 relative z-10">
            <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] font-black mb-6 text-white tracking-tighter leading-[1.05] drop-shadow-2xl">
              {customLogoUrl ? (
                  <img src={customLogoUrl} alt="Brand Logo" className="h-20 md:h-28 object-contain mb-4 mx-auto xl:mx-0 drop-shadow-2xl" />
              ) : remoteBrand ? (
                  <div className="flex items-center justify-center xl:justify-start gap-4">
                      <Sparkles className="w-12 h-12 text-yellow-400" />
                      {remoteBrand}
                  </div>
              ) : (
                  <>Send files.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Move ideas.</span></>
              )}
            </h1>
            <p className="text-slate-300 text-lg md:text-2xl font-medium mb-12 max-w-xl mx-auto xl:mx-0 drop-shadow-md leading-relaxed tracking-wide">
              The simplest way to send big files around the world. No limits, pure peer-to-peer.
            </p>
            
            {!isPro && (
              <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-slate-900/60 backdrop-blur-md p-4 pr-6 rounded-2xl border border-slate-800 shadow-xl mx-auto xl:mx-0">
                <div className="bg-blue-600/20 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-sm">Need more power?</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Unlimited sizes, Custom Branding, & E2E Encryption.</p>
                </div>
                <Link href="/pricing" className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold rounded-xl transition-colors whitespace-nowrap shadow-sm">
                  Go Pro
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col h-[500px] shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800/80 pb-4 flex items-center justify-between">
              Live Room Chat
              {!isPro && <Lock className="w-4 h-4 text-slate-500" />}
            </h3>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-2 relative">
              {!isPro && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-800/50">
                  <div className="bg-blue-900/30 p-4 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-white text-lg font-bold mb-2">Encrypted Chat</p>
                  <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">Upgrade to Pro to exchange secure, private messages while your files transfer.</p>
                  <Link href="/pricing" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all text-white shadow-lg active:scale-95">
                    Unlock Chat
                  </Link>
                </div>
              )}
              
              {messages.length === 0 && isPro && (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <Sparkles className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">Say hi to your peer!</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === 'You' ? 'bg-blue-600 text-white ml-auto rounded-tr-sm' : 'bg-slate-800 text-slate-200 mr-auto rounded-tl-sm'} max-w-[85%] break-words`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={sendChatMessage} className="flex gap-2 relative z-0">
              <input 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={!isPro}
                placeholder="Type a message..." 
                className="flex-1 bg-slate-950/50 border border-slate-700/80 rounded-2xl px-5 py-3.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-sm disabled:opacity-50 text-white"
              />
              <button 
                disabled={!isPro || !chatInput.trim()}
                type="submit" 
                className="p-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl transition-colors shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
