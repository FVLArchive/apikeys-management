import { IConfigurationStore } from '@fvlab/configurationstore';
import uuidv1 from 'uuid/v1';

/**
 * API Key metadata
 *
 * @export
 * @class APIKeyInfo
 */
export class APIKeyInfo {
  issuee: string;
  issueDate: Date;
  expiryDate: Date;
  isActive: boolean = true;
  notes: string;
}

/**
 * The current status type of an API key
 *
 * @export
 * @enum {number}
 */
export enum KeyStatus {
  DoesNotExist,
  Inactive,
  Expired,
  Valid
}

const APIKEYS_PREFIX = 'APIKeys';

/**
 * Manages the set of api keys and their associated metadata, using the given configuration storage as storage.
 *
 * @export
 * @class APIKeyManager
 */
export class APIKeyManager {
  /**
   *Creates an instance of APIKeyManager.
   * @param {IConfigurationStore} config The configuration store to use for storing registered api key information
   * @param {string} [requestHeaderKey='X-APIKEY'] The header element to look for the api key
   * @memberof APIKeyManager
   */
  constructor(private config: IConfigurationStore, private requestHeaderKey = 'x-api-key') {}

  /**
   * Check that the request has an existing api key registered
   *
   * @param {Request} request
   * @returns {Promise<APIKeyInfo>}
   * @memberof APIKeyManager
   */
  withExistingKey(request: any): Promise<APIKeyInfo> {
    const key = request && request.headers && request.headers[this.requestHeaderKey];
    if (key)
      return this.getKeyInfo(key.trim()).then(keyInfo => {
        if (this.status(keyInfo) !== KeyStatus.DoesNotExist) return keyInfo;
        throw new Error('API Key does not exist');
      });
    throw new Error('API key was not specified in request header');
  }

  /**
   * Check that the request has a valid api key registered
   *
   * @param {Request} request
   * @returns {Promise<APIKeyInfo>}
   * @memberof APIKeyManager
   */
  withValidKey(request: any): Promise<APIKeyInfo> {
    return this.withExistingKey(request).then(keyInfo => {
      if (this.status(keyInfo) === KeyStatus.Valid) return keyInfo;
      throw new Error('API key is invalid');
    });
  }

  /**
   * Generates and returns a unique api key
   *
   * @returns {string}
   * @memberof APIKeyManager
   */
  generateNewKey(): string {
    return uuidv1();
  }

  /**
   * Insert or updates an api key along with its associated metadata
   *
   * @param {string} key
   * @param {APIKeyInfo} info
   * @returns {Promise<void>}
   * @memberof APIKeyManager
   */
  upsert(key: string, info: APIKeyInfo): Promise<void> {
    return this.config.setGlobalData(this.getDBKey(key), info).then(() => {
      return;
    });
  }

  /**
   * Removes an api key
   *
   * @param {string} key
   * @returns {Promise<void>}
   * @memberof APIKeyManager
   */
  delete(key: string): Promise<void> {
    return this.config.setGlobalData(this.getDBKey(key), {}).then(() => {
      return;
    });
  }

  /**
   * Return the status of the given api key
   *
   * @param {string} key
   * @returns {Promise<KeyStatus>}
   * @memberof APIKeyManager
   */
  status(info: APIKeyInfo): KeyStatus {
    if (info && info.issuee) {
      if (!info.isActive) return KeyStatus.Inactive;
      if (info.expiryDate && info.expiryDate < new Date()) return KeyStatus.Expired;
      return KeyStatus.Valid;
    }
    return KeyStatus.DoesNotExist;
  }

  /**
   * Retrieves the meta data for a given api key
   *
   * @private
   * @param {string} key
   * @returns {Promise<APIKeyInfo>}
   * @memberof APIKeyManager
   */
  getKeyInfo(key: string): Promise<APIKeyInfo> {
    return this.config.getGlobalData(this.getDBKey(key));
  }

  private getDBKey(key: string): string {
    return `${APIKEYS_PREFIX}/${key}`;
  }
}
