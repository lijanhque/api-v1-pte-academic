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
const tmp = __importStar(require("tmp"));
const get_port_1 = __importDefault(require("get-port"));
const db_util_1 = require("./util/db_util");
const RedisInstance_1 = __importDefault(require("./util/RedisInstance"));
const debug_1 = __importDefault(require("debug"));
const log = (0, debug_1.default)('RedisMS:RedisMemoryServer');
tmp.setGracefulCleanup();
class RedisMemoryServer {
    /**
     * Create an Redis-Memory-Sever Instance
     *
     * Note: because of JavaScript limitations, autoStart cannot be awaited here, use ".create" for async/await ability
     * @param opts Redis-Memory-Sever Options
     */
    constructor(opts) {
        this.runningInstance = null;
        this.instanceInfoSync = null;
        this.opts = Object.assign({}, opts);
        if ((opts === null || opts === void 0 ? void 0 : opts.autoStart) === true) {
            log('Autostarting Redis instance...');
            this.start();
        }
    }
    /**
     * Create an Redis-Memory-Sever Instance that can be awaited
     * @param opts Redis-Memory-Sever Options
     */
    static create(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // create an instance WITHOUT autoStart so that the user can await it
            const instance = new RedisMemoryServer(Object.assign(Object.assign({}, opts), { autoStart: false }));
            if (opts === null || opts === void 0 ? void 0 : opts.autoStart) {
                yield instance.start();
            }
            return instance;
        });
    }
    /**
     * Start the in-memory Instance
     * (when options.autoStart is true, this already got called)
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            log('Called RedisMemoryServer.start() method');
            if (this.runningInstance) {
                throw new Error('Redis instance already in status startup/running/error. Use debug for more info.');
            }
            this.runningInstance = this._startUpInstance()
                .catch((err) => {
                var _a;
                if (err.message === 'redis-server shutting down' || err === 'redis-server shutting down') {
                    log(`Redis did not start. Trying to start on another port one more time...`);
                    if ((_a = this.opts.instance) === null || _a === void 0 ? void 0 : _a.port) {
                        this.opts.instance.port = null;
                    }
                    return this._startUpInstance();
                }
                throw err;
            })
                .catch((err) => {
                if (!debug_1.default.enabled('RedisMS:RedisMemoryServer')) {
                    console.warn('Starting the instance failed, please enable debug for more information.');
                }
                throw err;
            });
            return this.runningInstance.then((data) => {
                this.instanceInfoSync = data;
                return true;
            });
        });
    }
    /**
     * Internal Function to start an instance
     * @private
     */
    _startUpInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            /** Shortcut to this.opts.instance */
            const instOpts = (_a = this.opts.instance) !== null && _a !== void 0 ? _a : {};
            const data = {
                port: (_c = (_b = this._previousInstanceConfig) === null || _b === void 0 ? void 0 : _b.port) !== null && _c !== void 0 ? _c : (yield (0, get_port_1.default)({ port: (_d = instOpts.port) !== null && _d !== void 0 ? _d : undefined })), // do (null or undefined) to undefined
                ip: (_e = instOpts.ip) !== null && _e !== void 0 ? _e : '127.0.0.1',
                tmpDir: undefined,
            };
            if (instOpts.port != data.port) {
                log(`starting with port ${data.port}, since ${instOpts.port} was locked:`, data.port);
            }
            log(`Starting Redis instance with following options: ${JSON.stringify(data)}`);
            // Download if not exists redis binaries in ~/.redis-prebuilt
            // After that startup Redis instance
            const instance = yield RedisInstance_1.default.run({
                instance: {
                    ip: data.ip,
                    port: data.port,
                    args: instOpts.args,
                },
                binary: this.opts.binary,
                spawn: this.opts.spawn,
            });
            return Object.assign(Object.assign({}, data), { instance: instance, childProcess: (_f = instance.childProcess) !== null && _f !== void 0 ? _f : undefined });
        });
    }
    /**
     * Stop the current In-Memory Instance
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            log('Called RedisMemoryServer.stop() method');
            // just return "true" if the instance is already running / defined
            if ((0, db_util_1.isNullOrUndefined)(this.runningInstance)) {
                log('Instance is already stopped, returning true');
                return true;
            }
            const { instance, port, tmpDir } = yield this.ensureInstance();
            log(`Shutdown Redis server on port ${port} with pid ${instance.getPid() || ''}`);
            yield instance.kill();
            this.runningInstance = null;
            this.instanceInfoSync = null;
            this._previousInstanceConfig = { port };
            if (tmpDir) {
                log(`Removing tmpDir ${tmpDir.name}`);
                tmpDir.removeCallback();
            }
            return true;
        });
    }
    /**
     * Get Information about the currently running instance, if it is not running it returns "false"
     */
    getInstanceInfo() {
        var _a;
        return (_a = this.instanceInfoSync) !== null && _a !== void 0 ? _a : false;
    }
    /**
     * Ensure that the instance is running
     * -> throws if instance cannot be started
     */
    ensureInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            log('Called RedisMemoryServer.ensureInstance() method');
            if (this.runningInstance) {
                return this.runningInstance;
            }
            log(' - no running instance, call `start()` command');
            yield this.start();
            log(' - `start()` command was succesfully resolved');
            // check again for 1. Typescript-type reasons and 2. if .start failed to throw an error
            if (!this.runningInstance) {
                throw new Error('Ensure-Instance failed to start an instance!');
            }
            return this.runningInstance;
        });
    }
    /**
     * Get a redis host
     */
    getHost() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getIp();
        });
    }
    /**
     * Get a redis IP
     */
    getIp() {
        return __awaiter(this, void 0, void 0, function* () {
            const { ip } = yield this.ensureInstance();
            return ip;
        });
    }
    /**
     * Get the Port of the currently running Instance
     * Note: calls "ensureInstance"
     */
    getPort() {
        return __awaiter(this, void 0, void 0, function* () {
            const { port } = yield this.ensureInstance();
            return port;
        });
    }
}
exports.default = RedisMemoryServer;
//# sourceMappingURL=RedisMemoryServer.js.map