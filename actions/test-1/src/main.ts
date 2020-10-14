import * as core from '@actions/core';
import { wait } from './wait';

import { NOW, THEN } from '@eventespresso-actions/utils';

async function run(): Promise<void> {
	try {
		const ms: string = core.getInput('milliseconds');
		core.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

		core.debug(new Date().toTimeString());
		await wait(parseInt(ms, 10));
		core.debug(new Date().toTimeString());
		core.info(`NOW it is: ${NOW.toTimeString()}`);
		core.info(`Then it was: ${THEN.toTimeString()}`);

		core.setOutput('time', new Date().toTimeString());
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
