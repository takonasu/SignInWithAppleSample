import { DataSource } from 'typeorm';

import { OriginalUser } from './entity/OriginalUser';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'postgres',
	port: 5432,
	username: 'postgres',
	password: 'postgres',
	database: 'signinwithapple',
	synchronize: true,
	logging: true,
	entities: [OriginalUser],
	subscribers: [],
	migrations: []
});
