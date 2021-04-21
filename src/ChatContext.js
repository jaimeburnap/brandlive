import React, { createContext, useContext } from 'react';

const ChatContext = createContext(null);

const ChatProvider = ({ children, socket, channel }) => {
	socket.on('error', (e) => {
		console.error('socket error', e);
	});

	socket.on('connect_error', (e) => {
		console.error('failed to connect', e);
	});

	socket.on('disconnect', () => {
		socket.removeAllListeners();
	});

	return (
		<ChatContext.Provider value={{ socket, channel }}>
			{children}
		</ChatContext.Provider>
	)
};

const useChat = () => useContext(ChatContext);

export { ChatProvider, useChat };
