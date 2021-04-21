import React, { useState, useEffect } from 'react';

import io from "socket.io-client";

import './output.css';
import { ChatProvider } from './ChatContext';
import Chat from "./Chat";

const App = () => {
	const [socket, setSocket] = useState(null);
	const useMountEffect = func => useEffect(func, []);
	const channel = 'code-test';

	useMountEffect(() => {
		const skt = io.connect('wss://codechallenge.brand.live', { transports: ['websocket'] });
		skt.on('connect', () => {
			skt.emit('join-channel', channel);
		});

		setSocket(skt);
	});

	return socket ? (<ChatProvider socket={socket} channel={channel}><Chat/></ChatProvider>) : <div></div>
};

export default App;
