"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_config_1 = __importDefault(require("./resolve-config"));
const debug_1 = __importDefault(require("debug"));
const RedisBinary_1 = require("./RedisBinary");
const https_1 = __importDefault(require("https"));
const log = (0, debug_1.default)('RedisMS:RedisBinaryDownloadUrl');
/**
 * Download URL generator
 */
class RedisBinaryDownloadUrl {
    constructor({ version }) {
        this.version = version;
    }
    /**
     * Assemble the URL to download
     * Calls all the necessary functions to determine the URL
     */
    getDownloadUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            var _d;
            const downloadUrl = (0, resolve_config_1.default)('DOWNLOAD_URL');
            if (downloadUrl) {
                log(`Using "${downloadUrl}" as the Download-URL`);
                return downloadUrl;
            }
            if (process.platform === 'win32') {
                log('Getting download link from Memurai');
                const response = yield new Promise((resolve, reject) => {
                    https_1.default.get('https://www.memurai.com/api/request-download-link?version=windows-redis', (response) => {
                        if (response.statusCode !== 200) {
                            return reject(new Error("Memurai Status code isn't 200!"));
                        }
                        resolve(response);
                    });
                });
                const chunks = [];
                try {
                    for (var _e = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _e = true) {
                        _c = response_1_1.value;
                        _e = false;
                        const chunk = _c;
                        chunks.push(chunk);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_e && !_a && (_b = response_1.return)) yield _b.call(response_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                const { url } = JSON.parse(Buffer.concat(chunks).toString());
                log('Got download link from Memurai');
                return url;
            }
            const archive = yield this.getArchiveName();
            log(`Using "${archive}" as the Archive String`);
            const mirror = (_d = (0, resolve_config_1.default)('DOWNLOAD_MIRROR')) !== null && _d !== void 0 ? _d : 'https://download.redis.io';
            log(`Using "${mirror}" as the mirror`);
            return this.version === RedisBinary_1.LATEST_VERSION
                ? `${mirror}/${archive}`
                : `${mirror}/releases/${archive}`;
        });
    }
    /**
     * Get the archive
     * Version independent
     */
    getArchiveName() {
        return __awaiter(this, void 0, void 0, function* () {
            return `redis-${this.version}.tar.gz`;
        });
    }
}
exports.default = RedisBinaryDownloadUrl;
//# sourceMappingURL=RedisBinaryDownloadUrl.js.map