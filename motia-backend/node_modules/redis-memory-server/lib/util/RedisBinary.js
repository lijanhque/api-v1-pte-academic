"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LATEST_VERSION = void 0;
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("fs/promises");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const lockfile_1 = __importDefault(require("lockfile"));
const find_cache_dir_1 = __importDefault(require("find-cache-dir"));
const child_process_1 = require("child_process");
const RedisBinaryDownload_1 = __importDefault(require("./RedisBinaryDownload"));
const resolve_config_1 = __importStar(require("./resolve-config"));
const debug_1 = __importDefault(require("debug"));
const log = (0, debug_1.default)('RedisMS:RedisBinary');
exports.LATEST_VERSION = 'stable';
class RedisBinary {
    /**
     * Probe if the provided "systemBinary" is an existing path
     * @param systemBinary The Path to probe for an System-Binary
     * @return System Binary path or empty string
     */
    static getSystemPath(systemBinary) {
        return __awaiter(this, void 0, void 0, function* () {
            let binaryPath = '';
            try {
                yield (0, promises_1.access)(systemBinary);
                log(`RedisBinary: found system binary path at "${systemBinary}"`);
                binaryPath = systemBinary;
            }
            catch (err) {
                log(`RedisBinary: can't find system binary at "${systemBinary}".\n${err === null || err === void 0 ? void 0 : err.message}`);
            }
            return binaryPath;
        });
    }
    /**
     * Check if specified version already exists in the cache
     * @param version The Version to check for
     */
    static getCachePath(version) {
        return this.cache[version];
    }
    /**
     * Probe download path and download the binary
     * @param options Options Configuring which binary to download and to which path
     * @returns The BinaryPath the binary has been downloaded to
     */
    static getDownloadPath(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { downloadDir, version, ignoreDownloadCache } = options;
            // create downloadDir
            yield (0, promises_1.mkdir)(downloadDir, { recursive: true });
            /** Lockfile path */
            const lockfile = path_1.default.resolve(downloadDir, `${version}.lock`);
            // wait to get a lock
            // downloading of binaries may be quite long procedure
            // that's why we are using so big wait/stale periods
            yield new Promise((resolve, reject) => {
                lockfile_1.default.lock(lockfile, {
                    wait: 1000 * 120, // 120 seconds
                    pollPeriod: 100,
                    stale: 1000 * 110, // 110 seconds
                    retries: 3,
                    retryWait: 100,
                }, (err) => {
                    return err ? reject(err) : resolve(null);
                });
            });
            // check cache if it got already added to the cache
            if (!this.getCachePath(version) || ignoreDownloadCache) {
                const downloader = new RedisBinaryDownload_1.default({
                    downloadDir,
                    version,
                    ignoreDownloadCache,
                });
                this.cache[version] = yield downloader.getRedisServerPath();
            }
            // remove lock
            yield new Promise((res) => {
                lockfile_1.default.unlock(lockfile, (err) => {
                    log(err
                        ? `RedisBinary: Error when removing download lock ${err}`
                        : `RedisBinary: Download lock removed`);
                    res(null); // we don't care if it was successful or not
                });
            });
            return this.getCachePath(version);
        });
    }
    /**
     * Probe all supported paths for an binary and return the binary path
     * @param opts Options configuring which binary to search for
     * @throws {Error} if no valid BinaryPath has been found
     * @return The first found BinaryPath
     */
    static getPath() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
            const legacyDLDir = path_1.default.resolve(os_1.default.homedir(), '.cache/redis-binaries');
            // if we're in postinstall script, npm will set the cwd too deep
            let nodeModulesDLDir = process.cwd();
            while (nodeModulesDLDir.endsWith(`node_modules${path_1.default.sep}redis-memory-server`)) {
                nodeModulesDLDir = path_1.default.resolve(nodeModulesDLDir, '..', '..');
            }
            // "||" is still used here, because it should default if the value is false-y (like an empty string)
            const defaultOptions = {
                downloadDir: (0, resolve_config_1.default)('DOWNLOAD_DIR') ||
                    (fs_1.default.existsSync(legacyDLDir)
                        ? legacyDLDir
                        : path_1.default.resolve(this._findCacheDirRecursively({
                            name: 'redis-memory-server',
                            cwd: nodeModulesDLDir,
                        }) || '', 'redis-binaries')),
                version: (0, resolve_config_1.default)('VERSION') || exports.LATEST_VERSION,
                systemBinary: (0, resolve_config_1.default)('SYSTEM_BINARY'),
                ignoreDownloadCache: (0, resolve_config_1.envToBool)((0, resolve_config_1.default)('IGNORE_DOWNLOAD_CACHE')),
            };
            /** Provided Options combined with the Default Options */
            const options = Object.assign(Object.assign({}, defaultOptions), opts);
            log(`RedisBinary options:`, JSON.stringify(options, null, 2));
            let binaryPath = '';
            if (options.systemBinary) {
                binaryPath = yield this.getSystemPath(options.systemBinary);
                if (binaryPath) {
                    if (binaryPath.indexOf(' ') >= 0) {
                        binaryPath = `"${binaryPath}"`;
                    }
                    const binaryVersion = (0, child_process_1.execSync)(`${binaryPath} --version`)
                        .toString()
                        .split('\n')[0]
                        .split(' ')[2];
                    if (options.version !== exports.LATEST_VERSION && options.version !== binaryVersion) {
                        // we will log the version number of the system binary and the version requested so the user can see the difference
                        log('RedisMemoryServer: Possible version conflict\n' +
                            `  SystemBinary version: ${binaryVersion}\n` +
                            `  Requested version:    ${options.version}\n\n` +
                            '  Using SystemBinary!');
                    }
                }
            }
            if (!binaryPath && !options.ignoreDownloadCache) {
                binaryPath = this.getCachePath(options.version);
            }
            if (!binaryPath) {
                binaryPath = yield this.getDownloadPath(options);
            }
            if (!binaryPath) {
                throw new Error(`RedisBinary.getPath: could not find an valid binary path! (Got: "${binaryPath}")`);
            }
            log(`RedisBinary: redis-server binary path: "${binaryPath}"`);
            return binaryPath;
        });
    }
    /**
     * Find the named cache directory recursively, if it exists.
     * If it's not found, fall back to the first `find-cache-dir` result.
     * @param options Options
     * @returns Cache directory
     * @private
     */
    static _findCacheDirRecursively(options) {
        const firstResult = (0, find_cache_dir_1.default)(options);
        if (firstResult === undefined) {
            return undefined;
        }
        let result = firstResult;
        while (!fs_1.default.existsSync(result)) {
            const nextResult = (0, find_cache_dir_1.default)(Object.assign(Object.assign({}, options), { 
                // start above the previous `find-cache-dir` result
                cwd: path_1.default.join(result, '..', '..', '..', '..') }));
            if (nextResult === undefined || nextResult === result) {
                return firstResult;
            }
            result = nextResult;
        }
        return result;
    }
}
RedisBinary.cache = {};
exports.default = RedisBinary;
//# sourceMappingURL=RedisBinary.js.map