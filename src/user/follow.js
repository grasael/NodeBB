<<<<<<< HEAD
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
=======
'use strict';
>>>>>>> refs/remotes/origin/main
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
<<<<<<< HEAD
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
=======
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var plugins = require('../plugins');
var db = require('../database');
module.exports = function (User) {
    User.follow = function (uid, followuid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, toggleFollow('follow', uid, followuid)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    User.unfollow = function (uid, unfollowuid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, toggleFollow('unfollow', uid, unfollowuid)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    function toggleFollow(type, uid, theiruid) {
        return __awaiter(this, void 0, void 0, function () {
            var exists, isFollowing, now, _a, followingCount, followerCount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (parseInt(uid, 10) <= 0 || parseInt(theiruid, 10) <= 0) {
                            throw new Error('[[error:invalid-uid]]');
                        }
                        if (parseInt(uid, 10) === parseInt(theiruid, 10)) {
                            throw new Error('[[error:you-cant-follow-yourself]]');
                        }
                        return [4 /*yield*/, User.exists(theiruid)];
                    case 1:
                        exists = _b.sent();
                        if (!exists) {
                            throw new Error('[[error:no-user]]');
                        }
                        return [4 /*yield*/, User.isFollowing(uid, theiruid)];
                    case 2:
                        isFollowing = _b.sent();
                        if (!(type === 'follow')) return [3 /*break*/, 4];
                        if (isFollowing) {
                            throw new Error('[[error:already-following]]');
                        }
                        now = Date.now();
                        return [4 /*yield*/, Promise.all([
                                db.sortedSetAddBulk([
                                    ["following:".concat(uid), now, theiruid],
                                    ["followers:".concat(theiruid), now, uid],
                                ]),
                            ])];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!isFollowing) {
                            throw new Error('[[error:not-following]]');
                        }
                        return [4 /*yield*/, Promise.all([
                                db.sortedSetRemoveBulk([
                                    ["following:".concat(uid), theiruid],
                                    ["followers:".concat(theiruid), uid],
                                ]),
                            ])];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, Promise.all([
                            db.sortedSetCard("following:".concat(uid)),
                            db.sortedSetCard("followers:".concat(theiruid)),
                        ])];
                    case 7:
                        _a = _b.sent(), followingCount = _a[0], followerCount = _a[1];
                        return [4 /*yield*/, Promise.all([
                                User.setUserField(uid, 'followingCount', followingCount),
                                User.setUserField(theiruid, 'followerCount', followerCount),
                            ])];
                    case 8:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    User.getFollowing = function (uid, start, stop) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getFollow(uid, 'following', start, stop)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    User.getFollowers = function (uid, start, stop) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getFollow(uid, 'followers', start, stop)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    function getFollow(uid, type, start, stop) {
        return __awaiter(this, void 0, void 0, function () {
            var uids, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (parseInt(uid, 10) <= 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, db.getSortedSetRevRange("".concat(type, ":").concat(uid), start, stop)];
                    case 1:
                        uids = _a.sent();
                        return [4 /*yield*/, plugins.hooks.fire("filter:user.".concat(type), {
                                uids: uids,
                                uid: uid,
                                start: start,
                                stop: stop,
                            })];
                    case 2:
                        data = _a.sent();
                        return [4 /*yield*/, User.getUsers(data.uids, uid)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    User.isFollowing = function (uid, theirid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (parseInt(uid, 10) <= 0 || parseInt(theirid, 10) <= 0) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, db.isSortedSetMember("following:".concat(uid), theirid)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
>>>>>>> refs/remotes/origin/main
        });
    };
};
