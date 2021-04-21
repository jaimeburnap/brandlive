import React, { useState, useRef, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { DateTime } from 'luxon';

import {useChat} from "./ChatContext";

const Chat = () => {
	const [username, setUsername] = useState(localStorage.getItem("username"));
	const [chats, setChats] = useState([]);

	const { socket, channel } = useChat();
	const { register: loginRegister, handleSubmit: handleLoginSubmit } = useForm();
	const { register: chatRegister, handleSubmit: handleChatSubmit } = useForm();
	const useMountEffect = func => useEffect(func, []);

	useMountEffect(() => {
		const updateChats = (message) => {
			let messages = JSON.parse(localStorage.getItem('messages'));
			if (!messages) {
				messages = [];
			}

			if (message) {
				messages.push({message: message.message, username: message.username, time: Date.now()});
			} else { // initial load, remove old stuff
				const now = Date.now();
				messages = messages.filter(message => now - message.time < 3600000);
			}

			localStorage.setItem('messages', JSON.stringify(messages));
			setChats(messages);
		};

		socket.on('message', (message) => {
			updateChats(message);
		});

		updateChats();

		return () => socket.removeAllListeners();
	});

	const renderMessages = () => {
		const messages = chats;

		if (!messages) {
			return null;
		}

		return messages.map(message => {
			const time = DateTime.fromMillis(message.time);
			return (
				<div key={message.time} className={`flex flex-col pb-4`}>
					<div className="flex flex-row pb-1 item-end">
						<p className="text-sm text-gray-900 pr-2">{ message.username }</p>
						<p className="text-sm text-gray-400">{time.toLocaleString(DateTime.TIME_SIMPLE)}</p>
					</div>
					<div className="flex flex-row">
						<p className={`text-gray-900 rounded-r-lg rounded-bl-lg bg-white px-4 py-1`}>{message.message}</p>
					</div>
				</div>
			);
		});
	};

	const onLoginSubmit = (data) => {
		localStorage.setItem('username', data.name);
		setUsername(data.name);
	};

	const onChatSubmit = (data) => {
		console.log('chat submit', data);
		socket.emit('message', { message: data.message, username }, channel);
	};

	const logout = () => {
		localStorage.removeItem('username');
		setUsername('');
	};

	const BottomScroll = () => {
		const elementRef = useRef(null);
		useEffect(() => elementRef.current.scrollIntoView());

		return <div ref={elementRef} />;
	};

	const Login = () => {
		return (
			<div className="w-full">
				<form onSubmit={handleLoginSubmit(onLoginSubmit)} className="flex flex-col w-full items-center">
				<p className="pt-4 pb-4 font-bold">What's your name?</p>
				<input type="text" name="name" id="name" className="border-b padding-b-2 focus:outline-none text-center w-full lg:w-1/4" ref={loginRegister({required: true})}/>
				<button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full lg:w-1/4" type="submit">
					Join!
				</button>
				</form>
			</div>
		);
	};

	const Room = () => {
		return (
			<div className="w-full flex-flex-col">
				<form onSubmit={handleChatSubmit(onChatSubmit)} className="flex flex-col w-full items-center">
					<div className="w-full border overflow-y-auto chat-history p-2 bg-gray-100">{renderMessages()}<BottomScroll /></div>
					<input name="message" className="w-full mt-4 border" ref={chatRegister} />
					<button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full lg:w-1/4" type="submit">
						Send
					</button>
				</form>
				<button className="border-2 border-blue-500 hover:border-blue-700 text-blue-700 font-bold py-2 px-4 rounded mt-4" type="button" onClick={logout}>Logout</button>
			</div>
		)
	};

	return <div className="flex flex-col items-center px-2 lg:px-0">
		<div className="flex flex-col w-full lg:w-1/2 items-center">
			<h1 className="text-center font-bold text-xl lg:text-2xl pb-4">Chat</h1>
			{!username ? <Login /> : <Room />}
		</div>
	</div>;

};

export default Chat;
