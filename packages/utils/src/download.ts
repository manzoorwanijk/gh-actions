import https from 'https';
import fs from 'fs';

export const downloadUrl = (url: string, dest: string): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const file = fs.createWriteStream(dest, { flags: 'wx' });

		const request = https.get(url, (response) => {
			// make sure we have a valid status code
			if (response.statusCode === 200) {
				response.pipe(file);
			} else {
				file.close();
				fs.unlink(dest, () => null);
				reject(`Download failed! Server responded with ${response.statusCode}: ${response.statusMessage}`);
			}
		});

		request.on('error', (err) => {
			file.close();
			fs.unlink(dest, () => null);
			reject(err.message);
		});

		file.on('finish', () => {
			resolve();
		});

		file.on('error', (err) => {
			file.close();

			if (err.name === 'EEXIST') {
				reject('File already exists');
			} else {
				fs.unlink(dest, () => null);
				reject(err.message);
			}
		});
	});
};
