import { IConfigurationStore } from '@fvlab/configurationstore';
/**
 * API Key metadata
 *
 * @export
 * @class APIKeyInfo
 */
export declare class APIKeyInfo {
    issuee: string;
    issueDate: Date;
    expiryDate: Date;
    isActive: boolean;
    notes: string;
}
/**
 * The current status type of an API key
 *
 * @export
 * @enum {number}
 */
export declare enum KeyStatus {
    DoesNotExist = 0,
    Inactive = 1,
    Expired = 2,
    Valid = 3
}
/**
 * Manages the set of api keys and their associated metadata, using the given configuration storage as storage.
 *
 * @export
 * @class APIKeyManager
 */
export declare class APIKeyManager {
    private config;
    private requestHeaderKey;
    /**
     *Creates an instance of APIKeyManager.
     * @param {IConfigurationStore} config The configuration store to use for storing registered api key information
     * @param {string} [requestHeaderKey='X-APIKEY'] The header element to look for the api key
     * @memberof APIKeyManager
     */
    constructor(config: IConfigurationStore, requestHeaderKey?: string);
    /**
     * Check that the request has an existing api key registered
     *
     * @param {Request} request
     * @returns {Promise<APIKeyInfo>}
     * @memberof APIKeyManager
     */
    withExistingKey(request: any): Promise<APIKeyInfo>;
    /**
     * Check that the request has a valid api key registered
     *
     * @param {Request} request
     * @returns {Promise<APIKeyInfo>}
     * @memberof APIKeyManager
     */
    withValidKey(request: any): Promise<APIKeyInfo>;
    /**
     * Generates and returns a unique api key
     *
     * @returns {string}
     * @memberof APIKeyManager
     */
    generateNewKey(): string;
    /**
     * Insert or updates an api key along with its associated metadata
     *
     * @param {string} key
     * @param {APIKeyInfo} info
     * @returns {Promise<void>}
     * @memberof APIKeyManager
     */
    upsert(key: string, info: APIKeyInfo): Promise<void>;
    /**
     * Removes an api key
     *
     * @param {string} key
     * @returns {Promise<void>}
     * @memberof APIKeyManager
     */
    delete(key: string): Promise<void>;
    /**
     * Return the status of the given api key
     *
     * @param {string} key
     * @returns {Promise<KeyStatus>}
     * @memberof APIKeyManager
     */
    status(info: APIKeyInfo): KeyStatus;
    /**
     * Retrieves the meta data for a given api key
     *
     * @private
     * @param {string} key
     * @returns {Promise<APIKeyInfo>}
     * @memberof APIKeyManager
     */
    getKeyInfo(key: string): Promise<APIKeyInfo>;
    private getDBKey;
}
