import 'reflect-metadata';
import fs from 'fs';
import https from 'https';

import dotenv from 'dotenv';
import express from 'express';

import { getUserID } from './appleAuth';
import { AppDataSource } from './data-source';
import { OriginalUser } from './entity/OriginalUser';

dotenv.config();

AppDataSource.initialize()
	.then(() => {
		// here you can start to work with your database
	})
	.catch((error) => console.log(error));
const originalUserRepo = AppDataSource.getRepository(OriginalUser);

const expressApp = async () => {
	const app: express.Express = express();
	app.use(express.urlencoded({ extended: true }));
	app.set('view engine', 'ejs');
	const port = 443;
	const httpsServer = https.createServer(
		{
			key: fs.readFileSync(__dirname + '/../keys/privatekey.pem'),
			cert: fs.readFileSync(__dirname + '/../keys/cert.pem')
		},
		app
	);

	app.get('/', (req, res) => {
		var data = {
			item: {
				clientId: process.env.CLIENT_ID ?? '',
				redirectURI: process.env.REDIRECT_URI ?? ''
			}
		};
		res.render(__dirname + '/ejs/index.ejs', data);
	});

	// テストデータの保存
	app.get('/saveTest', async (req, res) => {
		const user = new OriginalUser();
		user.appleId = 'testAppleID';
		user.name = 'testUserName';
		res.json(await originalUserRepo.save(user));
	});

	// DB上の全てのデータを返す
	app.get('/allData', async (req, res) => {
		res.json(await originalUserRepo.find());
	});

	// DB上の全てのデータを消去
	app.get('/removeAll', async (req, res) => {
		res.json(await originalUserRepo.remove(await originalUserRepo.find()));
	});

	// すでにあるユーザの情報を更新。nameをつけるのに使うと良い。
	app.get('/updateName', async (req, res) => {
		const name = req.query.name as string;
		const appleId = req.query.appleId as string;
		if (name && appleId) {
			const userToUpdate = await originalUserRepo.findOneBy({
				appleId
			});
			if (userToUpdate) {
				userToUpdate.name = name;
				res.json(await originalUserRepo.save(userToUpdate));
				return;
			} else {
				res.json({ message: 'user not found' });
				return;
			}
		} else {
			res.json({ message: 'invalid parameters' });
		}
		return;
	});

	// SignInWithApple認証後のcallback
	// 未登録の場合はDBにデータを格納。すでに登録されているユーザならその情報をjsonで返す。
	app.post('/auth/apple/callback', async (req, res) => {
		const appleUserId = await getUserID(req.body.code);
		if (!appleUserId) {
			res.sendFile(__dirname + `/html/index.html`);
			return;
		}

		const DBsearchedData = await originalUserRepo.find({
			where: {
				appleId: appleUserId
			}
		});
		if (DBsearchedData.length > 0) {
			res.json(DBsearchedData);
			return;
		} else {
			const user = new OriginalUser();
			user.appleId = appleUserId;
			res.json(await originalUserRepo.save(user));
			return;
		}
	});
	httpsServer.listen(port, () => {
		console.log(`App listening on port ${port}`);
	});
};
expressApp();
