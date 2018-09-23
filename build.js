const ConsoleColorLog = require('console-color');
const ConsolePrompt = require('console-prompt-eagle');
const DateCustom = require('./DateCustom');

const {google}  = require('googleapis');
const fsp = require('fsp-eagle');

const prettyLog = new ConsoleColorLog;
const prompt = new ConsolePrompt();
const date = new DateCustom;
const {installed } = require('./runtime/base');

const createToken = (auth, code) => new Promise((ok,bad)=> {
	auth.getToken(code, function (err, token) {
		if (err) return bad(err);
		ok(token)
	});
});
void async function build() {

	prettyLog.info('Build accesss file START');

	try {
		const {client_secret, client_id, redirect_uris} = installed;

		const auth =  new google.auth.OAuth2(
			client_id,
			client_secret,
			redirect_uris[0]
		);

		const url = auth.generateAuthUrl({
			access_type: 'offline',
			scope: [
				'https://www.googleapis.com/auth/drive.file',
				'https://www.googleapis.com/auth/drive',
				'https://www.googleapis.com/auth/drive.file',
				'https://www.googleapis.com/auth/drive.metadata'
			]
		});

		prettyLog.info(`Confirm connect in url`);
		prettyLog.info(url);

		const code = await prompt.ask('Enter code');
		const access = await createToken(auth, code);

		await fsp.writeFile(
			`${__dirname}/runtime/${date.toStringByFormat('ymdhis')}_access-Google.json`,
			JSON.stringify({access, installed}, null, '\t')
		);

		prettyLog.success(`Build accesss OK`);

	} catch (e) {
		prettyLog.error(`${e.message} \n stack \n ${e.stack}`);
	} finally {
		prettyLog.info('Build accesss file FINISH');
		process.exit()
	}
}();
