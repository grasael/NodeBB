import plugins = require('../plugins');
import db = require('../database');

interface FollowType {
    (uid: number, followuid: number): Promise<void>;
}

interface UnfollowType {
    (uid: number, unfollowuid: number): Promise<void>;
}

interface GetFollowingType {
    (uid: number, start: number, stop: number): Promise<string[]>;
}

interface GetFollowersType {
    (uid: number, start: number, stop: number): Promise<string[]>;
}

interface IsFollowingType {
    (uid: number, theirid: number): Promise<boolean>;
}

interface ExistsType {
    (theiruid: number): Promise<boolean>;
}

interface SetUserFieldType {
    (uid: number, field: string, value: number): Promise<void>;
}

interface GetUsersType {
    (uids: number[], requesterUid: number): Promise<string[]>
}

// Create the UserType by combining the above types
interface UserType {
    follow?: FollowType;
    unfollow?: UnfollowType;
    getFollowing?: GetFollowingType;
    getFollowers?: GetFollowersType;
    isFollowing?: IsFollowingType;
    exists?: ExistsType;
    setUserField?: SetUserFieldType;
    getUsers?: GetUsersType;
}

module.exports = function (User: UserType) {
    async function toggleFollow(type : string, uid : number, theiruid : number) {
        if (parseInt(String(uid), 10) <= 0 || parseInt(String(theiruid), 10) <= 0) {
            throw new Error('[[error:invalid-uid]]');
        }

        if (parseInt(String(uid), 10) === parseInt(String(theiruid), 10)) {
            throw new Error('[[error:you-cant-follow-yourself]]');
        }
        const exists = await User.exists(theiruid);
        if (!exists) {
            throw new Error('[[error:no-user]]');
        }
        const isFollowing = await User.isFollowing(uid, theiruid);
        if (type === 'follow') {
            if (isFollowing) {
                throw new Error('[[error:already-following]]');
            }
            const now = Date.now();
            await Promise.all([
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
        } else {
            if (!isFollowing) {
                throw new Error('[[error:not-following]]');
            }
            await Promise.all([
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
        const [followingCount, followerCount] : [number, number] = await Promise.all([
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

        await Promise.all([
            User.setUserField(uid, 'followingCount', followingCount),
            User.setUserField(theiruid, 'followerCount', followerCount),
        ]);
    }

    User.follow = async function (uid : number, followuid : number) {
        await toggleFollow('follow', uid, followuid);
    };

    User.unfollow = async function (uid : number, unfollowuid : number) {
        await toggleFollow('unfollow', uid, unfollowuid);
    };

    async function getFollow(uid : number, type : string, start : number, stop : number) {
        if (parseInt(String(uid), 10) <= 0) {
            return [];
        }
        // The next line calls a function in a module that has not been updated to TS yet
        /* eslint-disable-next-line
        @typescript-eslint/no-unsafe-member-access,
        @typescript-eslint/no-unsafe-call,
        @typescript-eslint/no-unsafe-assignment */
        const uids = await db.getSortedSetRevRange(`${type}:${uid}`, start, stop);
        const data = await plugins.hooks.fire(`filter:user.${type}`, {
            // The next line calls a function in a module that has not been updated to TS yet
            /* eslint-disable-next-line
            @typescript-eslint/no-unsafe-member-access,
            @typescript-eslint/no-unsafe-call,
            @typescript-eslint/no-unsafe-assignment */
            uids: uids,
            uid: uid,
            start: start,
            stop: stop,
        }) as { uids: number[], uid: string, start: number, stop: number };
        return await User.getUsers(data.uids, uid);
    }

    User.getFollowing = async function (uid : number, start : number, stop : number) {
        return await getFollow(uid, 'following', start, stop);
    };

    User.getFollowers = async function (uid : number, start : number, stop : number) {
        return await getFollow(uid, 'followers', start, stop);
    };
    User.isFollowing = async function (uid : number, theirid : number) {
        if (parseInt(String(uid), 10) <= 0 || parseInt(String(theirid), 10) <= 0) {
            return false;
        }
        // The next line calls a function in a module that has not been updated to TS yet
        /* eslint-disable-next-line
        @typescript-eslint/no-unsafe-member-access,
        @typescript-eslint/no-unsafe-call,
        @typescript-eslint/no-unsafe-return,
        @typescript-eslint/no-unsafe-assignment */
        return await db.isSortedSetMember(`following:${uid}`, theirid);
    };
};
