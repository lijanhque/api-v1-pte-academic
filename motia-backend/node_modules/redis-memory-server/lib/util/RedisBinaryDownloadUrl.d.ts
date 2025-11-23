export interface RedisBinaryDownloadUrlOpts {
    version: string;
}
/**
 * Download URL generator
 */
export default class RedisBinaryDownloadUrl {
    version: string;
    constructor({ version }: RedisBinaryDownloadUrlOpts);
    /**
     * Assemble the URL to download
     * Calls all the necessary functions to determine the URL
     */
    getDownloadUrl(): Promise<string>;
    /**
     * Get the archive
     * Version independent
     */
    getArchiveName(): Promise<string>;
}
//# sourceMappingURL=RedisBinaryDownloadUrl.d.ts.map