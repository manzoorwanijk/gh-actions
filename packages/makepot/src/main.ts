import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import { exec } from '@actions/exec';
import { downloadUrl } from '@eventespresso-actions/utils';

import { getInput } from './utils';

async function run(): Promise<void> {
	const {
		exclude,
		headers,
		headersJsonFile,
		ignoreDomain,
		include,
		packageName,
		savePath,
		slug,
		textDomain,
	} = getInput();

	try {
		//#region WP CLI setup
		core.startGroup('Setup WP-CLI');
		const wpcliPath = 'wp-cli.phar';
		// download WP CLI executable
		const error = await downloadUrl(
			'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar',
			wpcliPath
		);
		if (error) {
			throw new Error(error);
		}
		// make the file executable
		await io.chmod(wpcliPath, 0o765);
		// move to path
		await exec('sudo mv', [wpcliPath, '/usr/local/bin/wp']);
		core.endGroup();
		//#endregion

		//#region Configuration
		const potPath = `${savePath}/${textDomain}.pot`;
		let potHeaders: string;

		if (headersJsonFile && io.existsSync(headersJsonFile)) {
			// JSON file may have spaces and new lines
			// we will parse it and stringify again to get rid of spaces and line breaks
			const headersObj = JSON.parse(io.readFileSync(headersJsonFile, { encoding: 'utf8' }));
			potHeaders = JSON.stringify(headersObj);
		} else {
			potHeaders = headers;
		}
		const args = [
			`--slug=${slug}`,
			exclude && `--exclude=${exclude}`,
			potHeaders && `--headers=${potHeaders}`,
			ignoreDomain && '--ignore-domain',
			include && `--include=${include}`,
			packageName && `--package-name="${packageName}"`,
			textDomain && `--domain=${textDomain}`,
		].filter(Boolean);
		//#endregion

		//#region POT file generation
		core.startGroup('Generating POT File');
		await exec('wp i18n make-pot .', [potPath, ...args, `--allow-root`]);
		const pot = io.readFileSync(potPath, { encoding: 'utf8' });
		core.info(pot);
		core.endGroup();
		//#endregion
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
