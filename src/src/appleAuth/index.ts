import fs from 'fs';

import appleSignin, { AppleAuthorizationTokenResponseType } from 'apple-signin-auth';
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = fs.readFileSync(__dirname + '/../../keys/appleAuthPrivateKey.p8', 'utf-8');
const CLIENT_ID = process.env.CLIENT_ID ?? '';
const TEAM_ID = process.env.TEAM_ID ?? '';
const KEY_ID = process.env.KEY_ID ?? '';
const REDIRECT_URI = process.env.REDIRECT_URI ?? '';

const getAccessToken = async (code: string) => {
	const clientSecret = appleSignin.getClientSecret({
		clientID: CLIENT_ID, // Apple Client ID
		teamID: TEAM_ID, // Apple Developer Team ID.
		privateKey: PRIVATE_KEY, // private key associated with your client ID. -- Or provide a `privateKeyPath` property instead.
		keyIdentifier: KEY_ID, // identifier of the private key.
		// OPTIONAL
		expAfter: 15777000 // Unix time in seconds after which to expire the clientSecret JWT. Default is now+5 minutes.
	});

	const options = {
		clientID: CLIENT_ID, // Apple Client ID
		redirectUri: REDIRECT_URI, // use the same value which you passed to authorisation URL.
		clientSecret: clientSecret
	};

	try {
		const tokenResponse = await appleSignin.getAuthorizationToken(code, options);
		return tokenResponse;
	} catch (err) {
		console.error(err);
	}
};

const getUserIDByAccessToken = async (tokenResponse: AppleAuthorizationTokenResponseType) => {
	try {
		const { sub: userAppleId } = await appleSignin.verifyIdToken(tokenResponse.id_token, {
			// Optional Options for further verification - Full list can be found here https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
			audience: CLIENT_ID, // client id - can also be an array
			// nonce: 'NONCE', // nonce // Check this note if coming from React Native AS RN automatically SHA256-hashes the nonce https://github.com/invertase/react-native-apple-authentication#nonce
			// If you want to handle expiration on your own, or if you want the expired tokens decoded
			ignoreExpiration: true // default is false
		});
		return userAppleId;
	} catch (err) {
		// Token is not verified
		console.error(err);
	}
};

export const getUserID = async (code: string) => {
	const accessToken = await getAccessToken(code);
	return accessToken ? getUserIDByAccessToken(accessToken) : undefined;
};
