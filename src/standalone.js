import {
	clients,
	openRoom,
	joinRoom,
	doLogin,
	sendRandomMessage,
	connect,
	setDefaultCredentials,
} from './lib/api';

import {
	initOffset,
	getLoginOffset,
} from './lib/utils';

const {
	HOW_MANY = 1,
	LOGIN_BATCH = 10,
	OPEN_ROOM = 'true',
	ROOM_ID = 'GENERAL',
	JOIN_ROOM,
	SEND_MESSAGES = 'yes',
	CLIENT_TYPE = 'web',
	USERS_USERNAME,
	USERS_PASSWORD,
	USERS_EMAIL,
} = process.env;

setDefaultCredentials({
	username: USERS_USERNAME,
	password: USERS_PASSWORD,
	email: USERS_EMAIL,
});

async function main () {
	await initOffset();

	console.log('connecting clients:', HOW_MANY);

	const go = [];
	for (let i = 0; i < parseInt(HOW_MANY); i++) {
		go.push(connect(CLIENT_TYPE));
	}
	await Promise.all(go).then(c => clients.push(...c));

	console.log('logging in clients:', HOW_MANY);

	await doLogin(await getLoginOffset(parseInt(HOW_MANY)), Math.min(parseInt(HOW_MANY), parseInt(LOGIN_BATCH)), CLIENT_TYPE);

	if (JOIN_ROOM) {
		console.log('joining room:', JOIN_ROOM);

		let i = 0;
		while (i < parseInt(HOW_MANY)) {
			if (!clients[i].loggedInInternal) {
				i++;
				continue;
			}
			await joinRoom(clients[i], JOIN_ROOM);
			i++;
		}
	}

	if (['yes', 'true'].includes(OPEN_ROOM)) {
		console.log('opening room:', ROOM_ID);

		const total = clients.length;

		let i = 0;
		while (i < total) {
			if (!clients[i].loggedInInternal) {
				i++;
				continue;
			}
			await openRoom(clients[i], ROOM_ID, CLIENT_TYPE);
			i++;
		}

		if (['yes', 'true'].includes(SEND_MESSAGES)) {
			console.log('sending messages to:', ROOM_ID);

			sendRandomMessage({ rid: ROOM_ID });
		}
	}
	console.log('done!');
};
main();
