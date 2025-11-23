import { DownloadProgressT } from '../types';
import { HttpsProxyAgent } from 'https-proxy-agent';
import './resolve-config';
export interface RedisBinaryDownloadOpts {
    version?: string;
    downloadDir?: string;
    ignoreDownloadCache?: boolean;
}
interface HttpDownloadOptions {
    hostname: string;
    port: string;
    path: string;
    protocol: string;
    method: 'GET' | 'POST';
    rejectUnauthorized?: boolean;
    agent: HttpsProxyAgent<string> | undefined;
}
/**
 * Download and extract the "redis-server" binary
 */
export default class RedisBinaryDownload {
    dlProgress: DownloadProgressT;
    _downloadingUrl?: string;
    downloadDir: string;
    version: string;
    ignoreDownloadCache: boolean;
    constructor({ downloadDir, version, ignoreDownloadCache }: RedisBinaryDownloadOpts);
    /**
     * Get the path of the already downloaded "redis-server" file
     * otherwise download it and then return the path
     */
    getRedisServerPath(): Promise<string>;
    /**
     * Download the Redis Archive
     * @returns The Redis Archive location
     */
    startDownload(): Promise<string>;
    /**
     * Download file from downloadUrl
     * @param downloadUrl URL to download a File
     */
    download(downloadUrl: string): Promise<string>;
    /**
     * Extract given Archive
     * @param redisArchive Archive location
     * @returns extracted directory location
     */
    extract(redisArchive: string): Promise<string>;
    /**
     * Extract a .tar.gz archive
     * @param redisArchive Archive location
     * @param extractDir Directory to extract to
     */
    extractTarGz(redisArchive: string, extractDir: string): Promise<void>;
    /**
     * Extract a .zip archive
     * @param redisArchive Archive location
     * @param extractDir Directory to extract to
     */
    extractZip(redisArchive: string, extractDir: string): Promise<void>;
    /**
     * Extract a .msi archive
     * @param redisArchive Archive location
     * @param extractDir Directory to extract to
     */
    extractMsi(redisArchive: string, extractDir: string): Promise<void>;
    /**
     * Downlaod given httpOptions to tempDownloadLocation, then move it to downloadLocation
     * @param httpOptions The httpOptions directly passed to https.get
     * @param downloadLocation The location the File should be after the download
     * @param tempDownloadLocation The location the File should be while downloading
     */
    httpDownload(httpOptions: HttpDownloadOptions, downloadLocation: string, tempDownloadLocation: string): Promise<string>;
    /**
     * Print the Download Progress to STDOUT
     * @param chunk A chunk to get the length
     */
    printDownloadProgress(chunk: {
        length: number;
    }): void;
    /**
     * Make and install given extracted directory
     * @param extractDir Extracted directory location
     * @returns void
     */
    makeInstall(extractDir: string): Promise<void>;
    /**
     * copy binary to parent folder and delete given extracted directory
     * @param extractDir Extracted directory location
     * @returns void
     */
    makeInstallWin32(extractDir: string): Promise<void>;
    /**
     * Test if the location given is already used
     * Does *not* dereference links
     * @param location The Path to test
     */
    locationExists(location: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=RedisBinaryDownload.d.ts.map