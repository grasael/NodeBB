"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call;
const plugins = __importStar(require("../plugins"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call;
const db = __importStar(require("../database"));
module.exports = function (User) {
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
    function toggleFollow(type, uid, theiruid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(uid, 10) <= 0 || parseInt(theiruid, 10) <= 0) {
                throw new Error('[[error:invalid-uid]]');
            }
            if (parseInt(uid, 10) === parseInt(theiruid, 10)) {
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
                    db.sortedSetRemoveBulk([
                        [`following:${uid}`, theiruid],
                        [`followers:${theiruid}`, uid],
                    ]),
                ]);
            }
            const [followingCount, followerCount] = yield Promise.all([
                db.sortedSetCard(`following:${uid}`),
                db.sortedSetCard(`followers:${theiruid}`),
            ]);
            yield Promise.all([
                User.setUserField(uid, 'followingCount', followingCount),
                User.setUserField(theiruid, 'followerCount', followerCount),
            ]);
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
    function getFollow(uid, type, start, stop) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(uid, 10) <= 0) {
                return [];
            }
            const uids = yield db.getSortedSetRevRange(`${type}:${uid}`, start, stop);
            const data = yield plugins.hooks.fire(`filter:user.${type}`, {
                uids: uids,
                uid: uid,
                start: start,
                stop: stop,
            });
            return yield User.getUsers(data.uids, uid);
        });
    }
    User.isFollowing = function (uid, theirid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(uid, 10) <= 0 || parseInt(theirid, 10) <= 0) {
                return false;
            }
            return yield db.isSortedSetMember(`following:${uid}`, theirid);
        });
    };
};
