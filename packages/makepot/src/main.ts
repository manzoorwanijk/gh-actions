import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import exec from '@actions/exec';
import { downloadUrl } from '@eventespresso-actions/utils';

import { getInput } from './utils';

async function run(): Promise<void> {
	const { savePath, slug, textDomain, packageName, include, exclude, headers } = getInput();

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
		await io.chmod(wpcliPath, '0o765');
		// move to path
		await io.mv(wpcliPath, '/usr/local/bin/wp');
		core.endGroup();
		//#endregion

		//#region Output config
		core.startGroup('Configuration');
		const potPath = `"${savePath}/${textDomain}.pot"`;
		const args = [
			`--slug="${slug}"`,
			`--package-name="${packageName}"`,
			`--headers="${headers}"`,
			`--domain="${textDomain}"`,
			`--include="${include}"`,
			`--exclude="${exclude}"`,
		];
		core.info(`POT path: ${potPath}`);
		core.info(args.join(`\n`));
		core.endGroup();

		//#region POT file generation
		core.startGroup('Generating POT File');
		await exec.exec('wp', ['i18n', 'make-pot', '.', potPath, ...args, `--allow-root`]);
		const pot = io.readFileSync(potPath, { encoding: 'utf8' });
		core.info(pot);
		core.endGroup();
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
