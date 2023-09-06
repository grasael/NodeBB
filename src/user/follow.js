"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugins = require("../plugins");
const db = require("../database");
module.exports = function (User) {
    function toggleFollow(type, uid, theiruid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(String(uid), 10) <= 0 || parseInt(String(theiruid), 10) <= 0) {
                throw new Error('[[error:invalid-uid]]');
            }
            if (parseInt(String(uid), 10) === parseInt(String(theiruid), 10)) {
                throw new Error('[[error:you-cant-follow-yourself]]');
            }
            const exists = yield User.exists(theiruid);
            if (!exists) {
                throw new Error('[[error:no-user]]');
            }
            const isFollowing = yield User.isFollowing(uid, theiruid);
            if (type === 'follow') {
                if (isFollowing) {
                    throw new Error('[[error:already-following]]');
                }
                const now = Date.now();
                yield Promise.all([
                    // The next line calls a function in a module that has not been updated to TS yet
                    /* eslint-disable-next-line
                    @typescript-eslint/no-unsafe-member-access,
                    @typescript-eslint/no-unsafe-call,
                    @typescript-eslint/no-unsafe-assignment */
                    db.sortedSetAddBulk([
                        [`following:${uid}`, now, theiruid],
                        [`followers:${theiruid}`, now, uid],
                    ]),
                ]);
            }
            else {
                if (!isFollowing) {
                    throw new Error('[[error:not-following]]');
                }
                yield Promise.all([
                    // The next line calls a function in a module that has not been updated to TS yet
                    /* eslint-disable-next-line
                    @typescript-eslint/no-unsafe-member-access,
                    @typescript-eslint/no-unsafe-call,
                    @typescript-eslint/no-unsafe-assignment */
                    db.sortedSetRemoveBulk([
                        [`following:${uid}`, theiruid],
                        [`followers:${theiruid}`, uid],
                    ]),
                ]);
            }
            // The next line calls a function in a module that has not been updated to TS yet
            /* eslint-disable-next-line
            @typescript-eslint/no-unsafe-member-access,
            @typescript-eslint/no-unsafe-call,
            @typescript-eslint/no-unsafe-assignment */
            const [followingCount, followerCount] = yield Promise.all([
                // The next line calls a function in a module that has not been updated to TS yet
                /* eslint-disable-next-line
                @typescript-eslint/no-unsafe-member-access,
                @typescript-eslint/no-unsafe-call,
                @typescript-eslint/no-unsafe-assignment */
                db.sortedSetCard(`following:${uid}`),
                // The next line calls a function in a module that has not been updated to TS yet
                /* eslint-disable-next-line
                @typescript-eslint/no-unsafe-member-access,
                @typescript-eslint/no-unsafe-call,
                @typescript-eslint/no-unsafe-assignment */
                db.sortedSetCard(`followers:${theiruid}`),
            ]);
            yield Promise.all([
                User.setUserField(uid, 'followingCount', followingCount),
                User.setUserField(theiruid, 'followerCount', followerCount),
            ]);
        });
    }
    User.follow = function (uid, followuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield toggleFollow('follow', uid, followuid);
        });
    };
    User.unfollow = function (uid, unfollowuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield toggleFollow('unfollow', uid, unfollowuid);
        });
    };
    function getFollow(uid, type, start, stop) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(String(uid), 10) <= 0) {
                return [];
            }
            // The next line calls a function in a module that has not been updated to TS yet
            /* eslint-disable-next-line
            @typescript-eslint/no-unsafe-member-access,
            @typescript-eslint/no-unsafe-call,
            @typescript-eslint/no-unsafe-assignment */
            const uids = yield db.getSortedSetRevRange(`${type}:${uid}`, start, stop);
            const data = yield plugins.hooks.fire(`filter:user.${type}`, {
                // The next line calls a function in a module that has not been updated to TS yet
                /* eslint-disable-next-line
                @typescript-eslint/no-unsafe-member-access,
                @typescript-eslint/no-unsafe-call,
                @typescript-eslint/no-unsafe-assignment */
                uids: uids,
                uid: uid,
                start: start,
                stop: stop,
            });
            return yield User.getUsers(data.uids, uid);
        });
    }
    User.getFollowing = function (uid, start, stop) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFollow(uid, 'following', start, stop);
        });
    };
    User.getFollowers = function (uid, start, stop) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFollow(uid, 'followers', start, stop);
        });
    };
    User.isFollowing = function (uid, theirid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(String(uid), 10) <= 0 || parseInt(String(theirid), 10) <= 0) {
                return false;
            }
            // The next line calls a function in a module that has not been updated to TS yet
            /* eslint-disable-next-line
            @typescript-eslint/no-unsafe-member-access,
            @typescript-eslint/no-unsafe-call,
            @typescript-eslint/no-unsafe-return,
            @typescript-eslint/no-unsafe-assignment */
            return yield db.isSortedSetMember(`following:${uid}`, theirid);
        });
    };
};
