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
const APIKEYS_PREFIX = 'ApiKeys';

/**
 * Manages the set of api keys and their associated metadata, using the given configuration storage as storage.
 *
 * @export
 * @class APIKeyManager
 */
export class APIKeyManager {
  constructor(private config: IConfigurationStore) {}

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
  status(key: string): Promise<KeyStatus> {
    return this.getKeyInfo(key).then(info => {
      if (info && info.issuee) {
        if (!info.isActive) return KeyStatus.Inactive;
        if (info.expiryDate && info.expiryDate < new Date()) return KeyStatus.Expired;
        return KeyStatus.Valid;
      }
      return KeyStatus.DoesNotExist;
    });
  }

  /**
   * Retrieves the meta data for a given api key
   *
   * @private
   * @param {string} key
   * @returns {Promise<APIKeyInfo>}
   * @memberof APIKeyManager
   */
  private getKeyInfo(key: string): Promise<APIKeyInfo> {
    return this.config.getGlobalData(this.getDBKey(key));
  }

  private getDBKey(key: string): string {
    return `${APIKEYS_PREFIX}/${key}`;
  }
}
