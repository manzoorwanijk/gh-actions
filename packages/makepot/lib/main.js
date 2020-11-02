"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@eventespresso-actions/io"));
const exec_1 = require("@actions/exec");
const utils_1 = require("@eventespresso-actions/utils");
const utils_2 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const { exclude, headers, ignoreDomain, include, packageName, savePath, slug, textDomain } = utils_2.getInput();
        try {
            //#region WP CLI setup
            core.startGroup('Setup WP-CLI');
            const wpcliPath = 'wp-cli.phar';
            // download WP CLI executable
            const error = yield utils_1.downloadUrl('https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar', wpcliPath);
            if (error) {
                throw new Error(error);
            }
            // make the file executable
            yield io.chmod(wpcliPath, 0o765);
            // move to path
            yield exec_1.exec('sudo mv', [wpcliPath, '/usr/local/bin/wp']);
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
            yield exec_1.exec('wp i18n make-pot .', [potPath, ...args, `--allow-root`]);
            const pot = io.readFileSync(potPath, { encoding: 'utf8' });
            core.info(pot);
            core.endGroup();
            //#endregion
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
