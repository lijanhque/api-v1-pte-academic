export type DebugFn = (...args: any[]) => any;
export type DebugPropT = boolean;
export interface DownloadProgressT {
    current: number;
    length: number;
    totalMb: number;
    lastPrintedAt: number;
}
export type CallbackFn = (...args: any[]) => any;
export { SpawnOptions } from 'child_process';
export interface RedisMemoryInstancePropBaseT {
    args?: string[];
    port?: number | null;
}
export interface RedisMemoryInstancePropT extends RedisMemoryInstancePropBaseT {
    ip?: string;
}
export type ErrorVoidCallback = (err: any) => void;
export type EmptyVoidCallback = () => void;
//# sourceMappingURL=types.d.ts.map