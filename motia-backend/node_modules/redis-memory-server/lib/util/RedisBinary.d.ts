export declare const LATEST_VERSION: string;
export interface RedisBinaryCache {
    [version: string]: string;
}
export interface RedisBinaryOpts {
    version?: string;
    downloadDir?: string;
    systemBinary?: string;
    ignoreDownloadCache?: boolean;
}
export default class RedisBinary {
    static cache: RedisBinaryCache;
    /**
     * Probe if the provided "systemBinary" is an existing path
     * @param systemBinary The Path to probe for an System-Binary
     * @return System Binary path or empty string
     */
    static getSystemPath(systemBinary: string): Promise<string>;
    /**
     * Check if specified version already exists in the cache
     * @param version The Version to check for
     */
    static getCachePath(version: string): string;
    /**
     * Probe download path and download the binary
     * @param options Options Configuring which binary to download and to which path
     * @returns The BinaryPath the binary has been downloaded to
     */
    static getDownloadPath(options: Required<Omit<RedisBinaryOpts, 'systemBinary'>>): Promise<string>;
    /**
     * Probe all supported paths for an binary and return the binary path
     * @param opts Options configuring which binary to search for
     * @throws {Error} if no valid BinaryPath has been found
     * @return The first found BinaryPath
     */
    static getPath(opts?: RedisBinaryOpts): Promise<string>;
    /**
     * Find the named cache directory recursively, if it exists.
     * If it's not found, fall back to the first `find-cache-dir` result.
     * @param options Options
     * @returns Cache directory
     * @private
     */
    static _findCacheDirRecursively(options: {
        name: string;
        cwd: string;
    }): string | undefined;
}
//# sourceMappingURL=RedisBinary.d.ts.map