"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var v1_1 = require("uuid/v1");
/**
 * API Key metadata
 *
 * @export
 * @class APIKeyInfo
 */
var APIKeyInfo = /** @class */ (function () {
    function APIKeyInfo() {
        this.isActive = true;
    }
    return APIKeyInfo;
}());
exports.APIKeyInfo = APIKeyInfo;
/**
 * The current status type of an API key
 *
 * @export
 * @enum {number}
 */
var KeyStatus;
(function (KeyStatus) {
    KeyStatus[KeyStatus["DoesNotExist"] = 0] = "DoesNotExist";
    KeyStatus[KeyStatus["Inactive"] = 1] = "Inactive";
    KeyStatus[KeyStatus["Expired"] = 2] = "Expired";
    KeyStatus[KeyStatus["Valid"] = 3] = "Valid";
})(KeyStatus = exports.KeyStatus || (exports.KeyStatus = {}));
var APIKEYS_PREFIX = 'ApiKeys';
/**
 * Manages the set of api keys and their associated metadata, using the given configuration storage as storage.
 *
 * @export
 * @class APIKeyManager
 */
var APIKeyManager = /** @class */ (function () {
    function APIKeyManager(config) {
        this.config = config;
    }
    /**
     * Generates and returns a unique api key
     *
     * @returns {string}
     * @memberof APIKeyManager
     */
    APIKeyManager.prototype.generateNewKey = function () {
        return v1_1.default();
    };
    /**
     * Insert or updates an api key along with its associated metadata
     *
     * @param {string} key
     * @param {APIKeyInfo} info
     * @returns {Promise<void>}
     * @memberof APIKeyManager
     */
    APIKeyManager.prototype.upsert = function (key, info) {
        return this.config.setGlobalData(this.getDBKey(key), info).then(function () {
            return;
        });
    };
    /**
     * Removes an api key
     *
     * @param {string} key
     * @returns {Promise<void>}
     * @memberof APIKeyManager
     */
    APIKeyManager.prototype.delete = function (key) {
        return this.config.setGlobalData(this.getDBKey(key), {}).then(function () {
            return;
        });
    };
    /**
     * Return the status of the given api key
     *
     * @param {string} key
     * @returns {Promise<KeyStatus>}
     * @memberof APIKeyManager
     */
    APIKeyManager.prototype.status = function (key) {
        return this.getKeyInfo(key).then(function (info) {
            if (info && info.issuee) {
                if (!info.isActive)
                    return KeyStatus.Inactive;
                if (info.expiryDate && info.expiryDate < new Date())
                    return KeyStatus.Expired;
                return KeyStatus.Valid;
            }
            return KeyStatus.DoesNotExist;
        });
    };
    /**
     * Retrieves the meta data for a given api key
     *
     * @private
     * @param {string} key
     * @returns {Promise<APIKeyInfo>}
     * @memberof APIKeyManager
     */
    APIKeyManager.prototype.getKeyInfo = function (key) {
        return this.config.getGlobalData(this.getDBKey(key));
    };
    APIKeyManager.prototype.getDBKey = function (key) {
        return APIKEYS_PREFIX + "/" + key;
    };
    return APIKeyManager;
}());
exports.APIKeyManager = APIKeyManager;
