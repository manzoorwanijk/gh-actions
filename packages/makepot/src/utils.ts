import * as core from '@actions/core';

export interface Input {
	savePath: string;
	slug: string;
	textDomain?: string;
	packageName?: string;
	include?: string;
	exclude?: string;
	headers?: string;
}

export function getInput(): Input {
	const savePath = core.getInput('save-path');
	const slug = core.getInput('slug');
	const textDomain = core.getInput('text-domain') || slug;
	const packageName = core.getInput('package-name');
	const include = core.getInput('include');
	const exclude = core.getInput('exclude');
	const headers = core.getInput('headers');

	if (!savePath) {
		throw new Error('`save-path` input not proved');
	}
	if (!slug) {
		throw new Error('`slug` input not proved');
	}

	return { savePath, slug, textDomain, packageName, include, exclude, headers };
}
