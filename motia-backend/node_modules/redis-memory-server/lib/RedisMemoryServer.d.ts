import { ChildProcess } from 'child_process';
import * as tmp from 'tmp';
import RedisInstance from './util/RedisInstance';
import { RedisBinaryOpts } from './util/RedisBinary';
import { RedisMemoryInstancePropT, SpawnOptions } from './types';
/**
 * Starting Options
 */
export interface RedisMemoryServerOptsT {
    instance?: RedisMemoryInstancePropT;
    binary?: RedisBinaryOpts;
    spawn?: SpawnOptions;
    autoStart?: boolean;
}
/**
 * Data used by _startUpInstance's "data" variable
 */
export interface StartupInstanceData {
    port: number;
    ip: string;
    tmpDir?: tmp.DirResult;
}
/**
 * Information about the currently running instance
 */
export interface RedisInstanceDataT extends StartupInstanceData {
    instance: RedisInstance;
    childProcess?: ChildProcess;
}
export default class RedisMemoryServer {
    runningInstance: Promise<RedisInstanceDataT> | null;
    instanceInfoSync: RedisInstanceDataT | null;
    opts: RedisMemoryServerOptsT;
    /**
     * @private
     */
    _previousInstanceConfig?: {
        port: number;
    };
    /**
     * Create an Redis-Memory-Sever Instance
     *
     * Note: because of JavaScript limitations, autoStart cannot be awaited here, use ".create" for async/await ability
     * @param opts Redis-Memory-Sever Options
     */
    constructor(opts?: RedisMemoryServerOptsT);
    /**
     * Create an Redis-Memory-Sever Instance that can be awaited
     * @param opts Redis-Memory-Sever Options
     */
    static create(opts?: RedisMemoryServerOptsT): Promise<RedisMemoryServer>;
    /**
     * Start the in-memory Instance
     * (when options.autoStart is true, this already got called)
     */
    start(): Promise<boolean>;
    /**
     * Internal Function to start an instance
     * @private
     */
    _startUpInstance(): Promise<RedisInstanceDataT>;
    /**
     * Stop the current In-Memory Instance
     */
    stop(): Promise<boolean>;
    /**
     * Get Information about the currently running instance, if it is not running it returns "false"
     */
    getInstanceInfo(): RedisInstanceDataT | false;
    /**
     * Ensure that the instance is running
     * -> throws if instance cannot be started
     */
    ensureInstance(): Promise<RedisInstanceDataT>;
    /**
     * Get a redis host
     */
    getHost(): Promise<string>;
    /**
     * Get a redis IP
     */
    getIp(): Promise<string>;
    /**
     * Get the Port of the currently running Instance
     * Note: calls "ensureInstance"
     */
    getPort(): Promise<number>;
}
//# sourceMappingURL=RedisMemoryServer.d.ts.map