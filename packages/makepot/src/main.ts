import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import { exec } from '@actions/exec';
import { downloadUrl } from '@eventespresso-actions/utils';

import { getInput } from './utils';

async function run(): Promise<void> {
	const { exclude, headers, ignoreDomain, include, packageName, savePath, slug, textDomain } = getInput();

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
		core.startGroup('Configuration');
		const potPath = `"${savePath}/${textDomain}.pot"`;
		const args = [
			`--slug="${slug}"`,
			exclude && `--exclude=${exclude}`,
			headers && `--headers=${headers}`,
			ignoreDomain && '--ignore-domain',
			include && `--include=${include}`,
			packageName && `--package-name=${packageName}`,
			textDomain && `--domain=${textDomain}`,
		].filter(Boolean);

		core.info(`POT path: ${potPath}`);
		core.info(args.join(`\n`));
		core.endGroup();
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
