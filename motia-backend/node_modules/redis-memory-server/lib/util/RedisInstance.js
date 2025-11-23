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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const path_1 = __importDefault(require("path"));
const RedisBinary_1 = __importDefault(require("./RedisBinary"));
const debug_1 = __importDefault(require("debug"));
const db_util_1 = require("./db_util");
const log = (0, debug_1.default)('RedisMS:RedisInstance');
/**
 * Redis Instance Handler Class
 */
class RedisInstance {
    constructor(opts) {
        var _a;
        this.isInstanceReady = false;
        this.instanceReady = () => { };
        this.instanceFailed = () => { };
        this.opts = opts;
        this.childProcess = null;
        this.killerProcess = null;
        if (!this.opts.instance) {
            this.opts.instance = {};
        }
        if (!this.opts.binary) {
            this.opts.binary = {};
        }
        if (debug_1.default.enabled('RedisMS:RedisInstance')) {
            // add instance's port to debug output
            const port = (_a = this.opts.instance) === null || _a === void 0 ? void 0 : _a.port;
            this.debug = (msg) => {
                log(`Redis[${port}]: ${msg}`);
            };
        }
        else {
            this.debug = () => { };
        }
    }
    /**
     * Create an new instance an call method "run"
     * @param opts Options passed to the new instance
     */
    static run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = new this(opts);
            return instance.run();
        });
    }
    /**
     * Create an array of arguments for the redis-server instance
     */
    prepareCommandArgs() {
        const { ip, port, args } = this.opts.instance;
        const result = [];
        result.push('--save', ''); // disable RDB snapshotting
        result.push('--appendonly', 'no'); // disable AOF
        result.push('--bind', ip || '127.0.0.1');
        if (port) {
            result.push('--port', port.toString());
        }
        return result.concat(args !== null && args !== void 0 ? args : []);
    }
    /**
     * Create the redis-server process
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const launch = new Promise((resolve, reject) => {
                this.instanceReady = () => {
                    this.isInstanceReady = true;
                    this.debug('RedisInstance: Instance is ready!');
                    resolve(Object.assign({}, this.childProcess));
                };
                this.instanceFailed = (err) => {
                    this.debug(`RedisInstance: Instance has failed: ${err.toString()}`);
                    if (this.killerProcess) {
                        this.killerProcess.kill();
                    }
                    reject(err);
                };
            });
            const redisBin = yield RedisBinary_1.default.getPath(this.opts.binary);
            this.childProcess = this._launchRedisServer(redisBin);
            if (this.childProcess.pid) {
                this.killerProcess = this._launchKiller(process.pid, this.childProcess.pid);
            }
            yield launch;
            return this;
        });
    }
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug('Called RedisInstance.kill():');
            /**
             * Function to De-Duplicate Code
             * @param _process The Process to kill
             * @param name the name used in the logs
             * @param debugfn the debug function
             */
            function kill_internal(_process, name, debugfn) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!(0, db_util_1.isAlive)(_process.pid)) {
                        debugfn('kill_internal given process PID is not alive anymore');
                        return;
                    }
                    const timeoutTime = 1000 * 10;
                    yield new Promise((resolve, reject) => {
                        let timeout = setTimeout(() => {
                            debugfn('kill_internal timeout triggered, trying SIGKILL');
                            if (!debug_1.default.enabled('RedisMS:RedisInstance')) {
                                console.warn('An Process didnt exit with signal "SIGINT" within 10 seconds, using "SIGKILL"!\n' +
                                    'Enable debug logs for more information');
                            }
                            _process.kill('SIGKILL');
                            timeout = setTimeout(() => {
                                debugfn('kill_internal timeout triggered again, rejecting');
                                reject(new Error('Process didnt exit, enable debug for more information.'));
                            }, timeoutTime);
                        }, timeoutTime);
                        _process.once(`exit`, (code, signal) => {
                            debugfn(`- ${name}: got exit signal, Code: ${code}, Signal: ${signal}`);
                            clearTimeout(timeout);
                            resolve(null);
                        });
                        debugfn(`- ${name}: send "SIGINT"`);
                        _process.kill('SIGINT');
                    });
                });
            }
            if (!(0, db_util_1.isNullOrUndefined)(this.childProcess)) {
                yield kill_internal(this.childProcess, 'childProcess', this.debug);
            }
            else {
                this.debug('- childProcess: nothing to shutdown, skipping.');
            }
            if (!(0, db_util_1.isNullOrUndefined)(this.killerProcess)) {
                yield kill_internal(this.killerProcess, 'killerProcess', this.debug);
            }
            else {
                this.debug('- killerProcess: nothing to shutdown, skipping.');
            }
            this.debug('Instance Finished Shutdown');
            return this;
        });
    }
    /**
     * Get the PID of the redis-server instance
     */
    getPid() {
        var _a;
        return (_a = this.childProcess) === null || _a === void 0 ? void 0 : _a.pid;
    }
    /**
     * Actually launch redis-server
     * @param redisBin The binary to run
     */
    _launchRedisServer(redisBin) {
        var _a, _b, _c;
        const spawnOpts = (_a = this.opts.spawn) !== null && _a !== void 0 ? _a : {};
        if (!spawnOpts.stdio) {
            spawnOpts.stdio = 'pipe';
        }
        const childProcess = (0, cross_spawn_1.default)(redisBin, this.prepareCommandArgs(), spawnOpts);
        (_b = childProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', this.stderrHandler.bind(this));
        (_c = childProcess.stdout) === null || _c === void 0 ? void 0 : _c.on('data', this.stdoutHandler.bind(this));
        childProcess.on('close', this.closeHandler.bind(this));
        childProcess.on('error', this.errorHandler.bind(this));
        if ((0, db_util_1.isNullOrUndefined)(childProcess.pid)) {
            throw new Error('Spawned Redis Instance PID is undefined');
        }
        return childProcess;
    }
    /**
     * Spawn an child to kill the parent and the redis-server instance if both are Dead
     * @param parentPid Parent to kill
     * @param childPid redis-server process to kill
     */
    _launchKiller(parentPid, childPid) {
        var _a, _b, _c;
        this.debug(`Called RedisInstance._launchKiller(parent: ${parentPid}, child: ${childPid}):`);
        // spawn process which kills itself and redis process if current process is dead
        const killer = (0, cross_spawn_1.default)((_a = process.env['NODE']) !== null && _a !== void 0 ? _a : process.argv[0], // try Environment variable "NODE" before using argv[0]
        [
            path_1.default.resolve(__dirname, '../../scripts/redis_killer.js'),
            parentPid.toString(),
            childPid.toString(),
        ], { stdio: 'pipe' });
        (_b = killer.stdout) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            this.debug(`[RedisKiller]: ${data}`);
        });
        (_c = killer.stderr) === null || _c === void 0 ? void 0 : _c.on('data', (data) => {
            this.debug(`[RedisKiller]: ${data}`);
        });
        ['exit', 'message', 'disconnect', 'error'].forEach((type) => {
            killer.on(type, (...args) => {
                this.debug(`[RedisKiller]: ${type} - ${JSON.stringify(args)}`);
            });
        });
        return killer;
    }
    errorHandler(err) {
        this.instanceFailed(err);
    }
    /**
     * Write the CLOSE event to the debug function
     * @param code The Exit code
     */
    closeHandler(code) {
        if (code != 0) {
            this.debug('redis-server instance closed with an non-0 code!');
        }
        this.debug(`CLOSE: ${code}`);
        this.instanceFailed(`redis-server instance closed with code "${code}"`);
    }
    /**
     * Write STDERR to debug function
     * @param message The STDERR line to write
     */
    stderrHandler(message) {
        this.debug(`STDERR: ${message.toString()}`);
    }
    /**
     * Write STDOUT to debug function AND instanceReady/instanceFailed if inputs match
     * @param message The STDOUT line to write/parse
     */
    stdoutHandler(message) {
        const line = message.toString();
        this.debug(`STDOUT: ${line}`);
        if (/Ready to accept connections/i.test(line)) {
            this.instanceReady();
        }
        else if (/Address already in use/i.test(line)) {
            this.instanceFailed(`Port ${this.opts.instance.port} already in use`);
        }
        else if (/redis-server instance already running/i.test(line)) {
            this.instanceFailed('redis-server already running');
        }
        else if (/permission denied/i.test(line)) {
            this.instanceFailed('redis-server permission denied');
        }
        else if (/shutting down with code/i.test(line)) {
            // if redis-server started succesfully then no error on shutdown!
            if (!this.isInstanceReady) {
                this.instanceFailed('redis-server shutting down');
            }
        }
        else if (/\*\*\*aborting after/i.test(line)) {
            this.instanceFailed('redis-server internal error');
        }
    }
}
RedisInstance.childProcessList = [];
exports.default = RedisInstance;
//# sourceMappingURL=RedisInstance.js.map