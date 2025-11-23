import { ChildProcess } from 'child_process';
import { RedisBinaryOpts } from './RedisBinary';
import { SpawnOptions, DebugFn, ErrorVoidCallback, EmptyVoidCallback } from '../types';
export interface RedisServerOps {
    instance: {
        port?: number;
        ip?: string;
        args?: string[];
    };
    binary?: RedisBinaryOpts;
    spawn?: SpawnOptions;
}
/**
 * Redis Instance Handler Class
 */
export default class RedisInstance {
    static childProcessList: ChildProcess[];
    opts: RedisServerOps;
    debug: DebugFn;
    childProcess: ChildProcess | null;
    killerProcess: ChildProcess | null;
    isInstanceReady: boolean;
    instanceReady: EmptyVoidCallback;
    instanceFailed: ErrorVoidCallback;
    constructor(opts: RedisServerOps);
    /**
     * Create an new instance an call method "run"
     * @param opts Options passed to the new instance
     */
    static run(opts: RedisServerOps): Promise<RedisInstance>;
    /**
     * Create an array of arguments for the redis-server instance
     */
    prepareCommandArgs(): string[];
    /**
     * Create the redis-server process
     */
    run(): Promise<this>;
    kill(): Promise<RedisInstance>;
    /**
     * Get the PID of the redis-server instance
     */
    getPid(): number | undefined;
    /**
     * Actually launch redis-server
     * @param redisBin The binary to run
     */
    _launchRedisServer(redisBin: string): ChildProcess;
    /**
     * Spawn an child to kill the parent and the redis-server instance if both are Dead
     * @param parentPid Parent to kill
     * @param childPid redis-server process to kill
     */
    _launchKiller(parentPid: number, childPid: number): ChildProcess;
    errorHandler(err: string): void;
    /**
     * Write the CLOSE event to the debug function
     * @param code The Exit code
     */
    closeHandler(code: number): void;
    /**
     * Write STDERR to debug function
     * @param message The STDERR line to write
     */
    stderrHandler(message: string | Buffer): void;
    /**
     * Write STDOUT to debug function AND instanceReady/instanceFailed if inputs match
     * @param message The STDOUT line to write/parse
     */
    stdoutHandler(message: string | Buffer): void;
}
//# sourceMappingURL=RedisInstance.d.ts.map