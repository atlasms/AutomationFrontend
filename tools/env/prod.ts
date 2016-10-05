import {EnvConfig} from './env-config.interface';

const ProdConfig: EnvConfig = {
  ENV: 'PROD'
  , API: 'http://localhost:80/misc/fakeapi/'
};

export = ProdConfig;

